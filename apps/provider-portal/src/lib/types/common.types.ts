/**
 * Shared Type Definitions
 * 
 * Common types used across multiple services and components
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Standard error response
 */
export interface ErrorResponse {
  ok: false;
  error: string;
  code?: string;
  details?: any;
}

/**
 * Standard success response
 */
export interface SuccessResponse<T = any> {
  ok: true;
  data: T;
  message?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  cursor?: string;
  limit: number;
  hasMore: boolean;
  total?: number;
}

/**
 * Date range filter
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Status types
 */
export type Status = 'active' | 'inactive' | 'pending' | 'suspended' | 'deleted';

/**
 * Health status
 */
export type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

/**
 * Severity levels
 */
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Risk levels
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Trend direction
 */
export type TrendDirection = 'up' | 'down' | 'stable';

/**
 * Time period
 */
export type TimePeriod = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Filter operator
 */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';

/**
 * Metric with trend
 */
export interface MetricWithTrend {
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend?: TrendDirection;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

/**
 * Key-value pair
 */
export interface KeyValuePair<T = any> {
  key: string;
  value: T;
  label?: string;
}

/**
 * Organization summary
 */
export interface OrgSummary {
  id: string;
  name: string;
  status?: Status;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * User summary
 */
export interface UserSummary {
  id: string;
  email: string;
  name?: string;
  role?: string;
  orgId: string;
  orgName?: string;
}

/**
 * Audit event
 */
export interface AuditEvent {
  id: string;
  actorId?: string;
  actorType: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  enabled: boolean;
}

/**
 * Rate limit status
 */
export interface RateLimitStatus {
  limit: number;
  current: number;
  remaining: number;
  resetAt: Date;
}

/**
 * Revenue metrics
 */
export interface RevenueMetrics {
  mrrCents: number;
  arrCents: number;
  totalRevenueCents: number;
  growthPercent?: number;
}

/**
 * Usage metrics
 */
export interface UsageMetrics {
  totalRequests: number;
  requestsLast24h: number;
  requestsLast7d: number;
  requestsLast30d: number;
  errorRate: number;
  avgResponseTime: number;
}

/**
 * Health score
 */
export interface HealthScore {
  score: number; // 0-100
  status: HealthStatus;
  factors: Array<{
    name: string;
    score: number;
    weight: number;
  }>;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

/**
 * Table column definition
 */
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

/**
 * Filter definition
 */
export interface FilterDefinition {
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

/**
 * Sort definition
 */
export interface SortDefinition {
  field: string;
  direction: SortDirection;
}

/**
 * Export format
 */
export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf';

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: DateRange;
}

