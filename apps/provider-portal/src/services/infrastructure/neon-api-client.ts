/**
 * Neon API Client
 * 
 * Fetches compute-hours usage from Neon API to calculate accurate Postgres costs.
 * Env-gated: only runs if NEON_API_KEY and NEON_PROJECT_ID are present.
 * 
 * Pricing (Launch plan):
 * - Compute: $0.14 / CU-hour
 * - Storage: $0.35 / GB-month (already tracked via Prisma)
 */

interface NeonConsumptionMetrics {
  compute_time_seconds: number;
  active_time_seconds: number;
  compute_time_hours: number;
}

export class NeonApiClient {
  private apiKey: string;
  private projectId: string;
  private apiBase: string;

  constructor() {
    this.apiKey = process.env.NEON_API_KEY || '';
    this.projectId = process.env.NEON_PROJECT_ID || '';
    this.apiBase = process.env.NEON_API_BASE || 'https://console.neon.tech/api/v2';
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.projectId);
  }

  /**
   * Fetch compute consumption metrics for the current billing period.
   * Returns compute-hours (CU-hours) for cost calculation.
   */
  async getComputeUsage(): Promise<{ computeHours: number; estimatedCostUsd: number } | null> {
    if (!this.isConfigured()) {
      return null; // Graceful fallback when credentials absent
    }

    try {
      // Neon API: GET /projects/{project_id}/consumption_metrics
      // Query params: from (ISO timestamp), to (ISO timestamp), granularity (hourly/daily/monthly)
      // For current month, use start of month to now
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const from = startOfMonth.toISOString();
      const to = now.toISOString();

      const url = `${this.apiBase}/projects/${this.projectId}/consumption?from=${from}&to=${to}&granularity=monthly`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Neon API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      
      // Response structure (example):
      // {
      //   "periods": [
      //     {
      //       "period_id": "...",
      //       "consumption": {
      //         "compute_time_seconds": 12345,
      //         "active_time_seconds": 12345,
      //         ...
      //       }
      //     }
      //   ]
      // }

      const periods = data.periods || [];
      if (periods.length === 0) {
        return { computeHours: 0, estimatedCostUsd: 0 };
      }

      // Sum compute_time_seconds across all periods (usually just one for monthly granularity)
      const totalComputeSeconds = periods.reduce((acc: number, period: any) => {
        const consumption = period.consumption || {};
        return acc + (consumption.compute_time_seconds || 0);
      }, 0);

      const computeHours = totalComputeSeconds / 3600;
      const estimatedCostUsd = computeHours * 0.14; // $0.14 per CU-hour

      return {
        computeHours: Number(computeHours.toFixed(4)),
        estimatedCostUsd: Number(estimatedCostUsd.toFixed(4)),
      };

    } catch (error) {
      console.error('Failed to fetch Neon compute usage:', error);
      return null;
    }
  }
}

