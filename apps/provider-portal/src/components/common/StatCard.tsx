/**
 * StatCard Component
 * 
 * Reusable KPI/metric card component used across dashboards
 * Supports custom colors, trends, and formatting
 */

import React from 'react';

export interface StatCardProps {
  /** Card title/label */
  title: string;
  
  /** Main value to display */
  value: string | number;
  
  /** Optional subtitle/description */
  subtitle?: string;
  
  /** Optional trend indicator */
  trend?: {
    value: number;
    label?: string;
  };
  
  /** Custom color for the value */
  valueColor?: string;
  
  /** Icon component to display */
  icon?: React.ReactNode;
  
  /** Custom className for the card */
  className?: string;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Loading state */
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  valueColor,
  icon,
  className = '',
  onClick,
  loading = false,
}: StatCardProps) {
  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return '#10b981'; // green
    if (trendValue < 0) return '#ef4444'; // red
    return 'var(--text-tertiary)'; // gray
  };

  const formatTrend = (trendValue: number) => {
    const sign = trendValue > 0 ? '+' : '';
    return `${sign}${trendValue.toFixed(1)}%`;
  };

  return (
    <div
      className={`kpi-card ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      ) : (
        <>
          {/* Header with title and optional icon */}
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {title}
            </div>
            {icon && (
              <div style={{ color: 'var(--text-tertiary)' }}>
                {icon}
              </div>
            )}
          </div>

          {/* Main value */}
          <div
            className="text-3xl font-bold mt-2"
            style={{ color: valueColor || 'var(--text-primary)' }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>

          {/* Trend indicator */}
          {trend && (
            <div
              className="text-sm mt-2 font-medium"
              style={{ color: getTrendColor(trend.value) }}
            >
              {formatTrend(trend.value)}
              {trend.label && ` ${trend.label}`}
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {subtitle}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * StatCardGrid Component
 * 
 * Grid container for StatCard components with responsive layout
 */
export interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatCardGrid({
  children,
  columns = 4,
  className = '',
}: StatCardGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}

export default StatCard;

