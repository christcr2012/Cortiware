/**
 * Vercel KV Monitoring Service
 *
 * Monitors Vercel KV (Redis) usage metrics:
 * - Storage usage (MB)
 * - Commands per day
 * - Connection count
 * - Latency
 */

import { InfrastructureService, MetricType } from '@prisma/client-provider';
import type { MetricData } from './types';

export interface VercelKVMetrics {
  storageUsedMB: number;
  commandsToday: number;
  connections: number;
  avgLatencyMs: number;
  maxStorageMB: number;
  maxCommandsPerDay: number;
}

export class VercelKVMonitor {
  private kvUrl: string;
  private kvToken: string;

  constructor(kvUrl?: string, kvToken?: string) {
    this.kvUrl = kvUrl || process.env.KV_REST_API_URL || process.env.KV_URL || '';
    this.kvToken = kvToken || process.env.KV_REST_API_TOKEN || process.env.KV_TOKEN || '';
    
    if (!this.kvUrl || !this.kvToken) {
      throw new Error('Vercel KV credentials not configured');
    }
  }

  /**
   * Collect current KV metrics
   */
  async collectMetrics(): Promise<MetricData[]> {
    const metrics: MetricData[] = [];
    const timestamp = new Date();

    try {
      // Get INFO command output from Redis
      const info = await this.getRedisInfo();
      
      // Parse storage usage
      const storageUsedMB = this.parseStorageUsage(info);
      metrics.push({
        service: InfrastructureService.VERCEL_KV,
        metric: MetricType.STORAGE_MB,
        value: storageUsedMB,
        timestamp,
        metadata: { plan: this.detectPlan(storageUsedMB) },
      });

      // Get command count (approximate from stats)
      const commandsToday = await this.getCommandCount();
      metrics.push({
        service: InfrastructureService.VERCEL_KV,
        metric: MetricType.COMMANDS_PER_DAY,
        value: commandsToday,
        timestamp,
      });

      // Get connection count
      const connections = this.parseConnections(info);
      metrics.push({
        service: InfrastructureService.VERCEL_KV,
        metric: MetricType.CONNECTIONS,
        value: connections,
        timestamp,
      });

      // Measure latency
      const latencyMs = await this.measureLatency();
      metrics.push({
        service: InfrastructureService.VERCEL_KV,
        metric: MetricType.LATENCY_MS,
        value: latencyMs,
        timestamp,
      });

      return metrics;
    } catch (error) {
      console.error('Failed to collect Vercel KV metrics:', error);
      throw error;
    }
  }

  /**
   * Get Redis INFO command output
   */
  private async getRedisInfo(): Promise<string> {
    const response = await fetch(`${this.kvUrl}/info`, {
      headers: {
        Authorization: `Bearer ${this.kvToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get Redis INFO: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result || '';
  }

  /**
   * Parse storage usage from INFO output
   */
  private parseStorageUsage(info: string): number {
    // Look for used_memory_human or used_memory
    const match = info.match(/used_memory:(\d+)/);
    if (match) {
      const bytes = parseInt(match[1], 10);
      return bytes / (1024 * 1024); // Convert to MB
    }
    return 0;
  }

  /**
   * Parse connection count from INFO output
   */
  private parseConnections(info: string): number {
    const match = info.match(/connected_clients:(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0;
  }

  /**
   * Get approximate command count for today
   * Uses DBSIZE and estimates based on key count
   */
  private async getCommandCount(): Promise<number> {
    try {
      const response = await fetch(`${this.kvUrl}/dbsize`, {
        headers: {
          Authorization: `Bearer ${this.kvToken}`,
        },
      });

      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      const keyCount = data.result || 0;
      
      // Rough estimate: assume each key has ~5 operations per day
      // (set, get, ttl check, expire, delete)
      return keyCount * 5;
    } catch {
      return 0;
    }
  }

  /**
   * Measure latency with a simple PING command
   */
  private async measureLatency(): Promise<number> {
    const start = Date.now();
    
    try {
      await fetch(`${this.kvUrl}/ping`, {
        headers: {
          Authorization: `Bearer ${this.kvToken}`,
        },
      });
      
      return Date.now() - start;
    } catch {
      return 0;
    }
  }

  /**
   * Detect current plan based on storage usage
   */
  private detectPlan(storageUsedMB: number): string {
    if (storageUsedMB <= 30) return 'free';
    if (storageUsedMB <= 512) return 'pro';
    return 'enterprise';
  }

  /**
   * Get current plan limits
   */
  static getPlanLimits(plan: string): { storageMB: number; commandsPerDay: number } {
    switch (plan) {
      case 'free':
        return { storageMB: 30, commandsPerDay: 10000 };
      case 'pro':
        return { storageMB: 512, commandsPerDay: 100000 };
      case 'enterprise':
        return { storageMB: 10240, commandsPerDay: 1000000 };
      default:
        return { storageMB: 30, commandsPerDay: 10000 };
    }
  }
}

