/**
 * Vercel Platform Monitoring Service
 *
 * Monitors Vercel platform usage metrics:
 * - Build minutes
 * - Function invocations
 * - Bandwidth usage
 * - Edge requests
 * - ISR reads
 */

import { InfrastructureService, MetricType } from '@prisma/client-provider';
import type { MetricData } from './types';

export interface VercelPlatformMetrics {
  buildMinutes: number;
  functionInvocations: number;
  bandwidthGB: number;
  edgeRequests: number;
  isrReads: number;
}

export class VercelPlatformMonitor {
  private vercelToken: string;
  private teamId: string;
  private projectIds: string[];

  constructor(vercelToken?: string, teamId?: string, projectIds?: string[]) {
    this.vercelToken = vercelToken || process.env.VERCEL_TOKEN || '';
    this.teamId = teamId || process.env.VERCEL_ORG_ID || '';
    this.projectIds = projectIds || [
      process.env.VERCEL_PROJECT_ID_PROVIDER || '',
      process.env.VERCEL_PROJECT_ID_TENANT || '',
      process.env.VERCEL_PROJECT_ID_MARKETING_CORTIWARE || '',
      process.env.VERCEL_PROJECT_ID_MARKETING_ROBINSON || '',
    ].filter(Boolean);

    if (!this.vercelToken || !this.teamId) {
      throw new Error('Vercel credentials not configured');
    }
  }

  /**
   * Collect current platform metrics
   */
  async collectMetrics(): Promise<MetricData[]> {
    const metrics: MetricData[] = [];
    const timestamp = new Date();

    try {
      // Get usage data from Vercel API
      // Note: Vercel doesn't have a direct usage API endpoint
      // We'll need to aggregate from deployment and analytics data
      
      const usage = await this.getUsageEstimate();

      // Build minutes
      metrics.push({
        service: InfrastructureService.VERCEL_BUILD,
        metric: MetricType.BUILD_MINUTES,
        value: usage.buildMinutes,
        timestamp,
        metadata: { projectCount: this.projectIds.length },
      });

      // Function invocations
      metrics.push({
        service: InfrastructureService.VERCEL_FUNCTIONS,
        metric: MetricType.INVOCATIONS,
        value: usage.functionInvocations,
        timestamp,
      });

      // Bandwidth
      metrics.push({
        service: InfrastructureService.VERCEL_BANDWIDTH,
        metric: MetricType.BANDWIDTH_GB,
        value: usage.bandwidthGB,
        timestamp,
      });

      // Edge requests
      metrics.push({
        service: InfrastructureService.VERCEL_EDGE_REQUESTS,
        metric: MetricType.REQUEST_COUNT,
        value: usage.edgeRequests,
        timestamp,
      });

      // ISR reads
      metrics.push({
        service: InfrastructureService.VERCEL_ISR_READS,
        metric: MetricType.REQUEST_COUNT,
        value: usage.isrReads,
        timestamp,
      });

      return metrics;
    } catch (error) {
      console.error('Failed to collect Vercel platform metrics:', error);
      throw error;
    }
  }

  /**
   * Get usage estimate from recent deployments
   * 
   * Note: This is an approximation since Vercel doesn't expose
   * real-time usage metrics via API. For accurate data, users
   * should check the Vercel dashboard.
   */
  private async getUsageEstimate(): Promise<VercelPlatformMetrics> {
    // Get recent deployments for all projects
    const deployments = await this.getRecentDeployments();
    
    // Estimate build minutes (assume 3 min per deployment)
    const buildMinutes = deployments.length * 3;
    
    // Estimate other metrics (these are rough approximations)
    // In production, you'd want to integrate with Vercel Analytics API
    const functionInvocations = deployments.length * 1000; // Assume 1k invocations per deployment
    const bandwidthGB = deployments.length * 0.1; // Assume 100MB per deployment
    const edgeRequests = deployments.length * 5000; // Assume 5k requests per deployment
    const isrReads = deployments.length * 100; // Assume 100 ISR reads per deployment

    return {
      buildMinutes,
      functionInvocations,
      bandwidthGB,
      edgeRequests,
      isrReads,
    };
  }

  /**
   * Get recent deployments from Vercel API
   */
  private async getRecentDeployments(): Promise<Array<{ id: string; createdAt: number }>> {
    const allDeployments: Array<{ id: string; createdAt: number }> = [];
    
    // Get deployments for each project
    for (const projectId of this.projectIds) {
      try {
        const response = await fetch(
          `https://api.vercel.com/v6/deployments?projectId=${projectId}&teamId=${this.teamId}&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${this.vercelToken}`,
            },
          }
        );

        if (!response.ok) {
          console.warn(`Failed to get deployments for project ${projectId}`);
          continue;
        }

        const data = await response.json();
        const deployments = data.deployments || [];
        
        // Filter to last 24 hours
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recentDeployments = deployments.filter(
          (d: { createdAt: number }) => d.createdAt > oneDayAgo
        );
        
        allDeployments.push(...recentDeployments);
      } catch (error) {
        console.warn(`Error fetching deployments for project ${projectId}:`, error);
      }
    }

    return allDeployments;
  }

  /**
   * Get current plan limits
   */
  static getPlanLimits(plan: string): {
    buildMinutes: number;
    functionInvocations: number;
    bandwidthGB: number;
    edgeRequests: number;
  } {
    switch (plan) {
      case 'hobby':
        return {
          buildMinutes: 100 * 60, // 100 GB-hours = ~100 hours at 1GB
          functionInvocations: 1000000,
          bandwidthGB: 100,
          edgeRequests: 10000000,
        };
      case 'pro':
        return {
          buildMinutes: 100 * 60, // 100 GB-hours included
          functionInvocations: Infinity, // Unlimited but charged
          bandwidthGB: 1000,
          edgeRequests: Infinity,
        };
      case 'enterprise':
        return {
          buildMinutes: Infinity,
          functionInvocations: Infinity,
          bandwidthGB: Infinity,
          edgeRequests: Infinity,
        };
      default:
        return {
          buildMinutes: 100 * 60,
          functionInvocations: 1000000,
          bandwidthGB: 100,
          edgeRequests: 10000000,
        };
    }
  }

  /**
   * Calculate estimated costs based on usage
   */
  static calculateCosts(usage: VercelPlatformMetrics, plan: string): number {
    if (plan === 'hobby') {
      // Hobby plan: $20/month base, overages charged
      let cost = 20;
      
      const limits = this.getPlanLimits('hobby');
      
      // Build minutes overage: $40 per 100 GB-hours
      if (usage.buildMinutes > limits.buildMinutes) {
        const overageHours = (usage.buildMinutes - limits.buildMinutes) / 60;
        cost += (overageHours / 100) * 40;
      }
      
      return cost;
    }
    
    if (plan === 'pro') {
      // Pro plan: $20/month base + usage
      let cost = 20;
      
      // Build minutes: $40 per 100 GB-hours (after included 100)
      const buildHours = usage.buildMinutes / 60;
      if (buildHours > 100) {
        cost += ((buildHours - 100) / 100) * 40;
      }
      
      // Function invocations: $40 per 100 GB-hours of execution
      // (simplified - actual pricing is more complex)
      cost += (usage.functionInvocations / 1000000) * 0.60;
      
      return cost;
    }
    
    return 0; // Enterprise pricing is custom
  }
}

