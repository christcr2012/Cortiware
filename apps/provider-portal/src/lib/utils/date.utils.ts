/**
 * Shared Date Utilities
 * 
 * Common date calculations and formatting functions used across services
 */

/**
 * Get date for N days ago from now
 */
export function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Get date for N hours ago from now
 */
export function getHoursAgo(hours: number): Date {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

/**
 * Get start of day for a given date
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get end of day for a given date
 */
export function getEndOfDay(date: Date = new Date()): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Get start of month for a given date
 */
export function getStartOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get end of month for a given date
 */
export function getEndOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Get date range for last N days
 */
export function getLastNDaysRange(days: number): { start: Date; end: Date } {
  return {
    start: getDaysAgo(days),
    end: new Date(),
  };
}

/**
 * Get date range for last N hours
 */
export function getLastNHoursRange(hours: number): { start: Date; end: Date } {
  return {
    start: getHoursAgo(hours),
    end: new Date(),
  };
}

/**
 * Format date to ISO string
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Format date to local date string
 */
export function toLocalDateString(date: Date): string {
  return date.toLocaleDateString();
}

/**
 * Check if date is within range
 */
export function isWithinRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

/**
 * Get month key in YYYY-MM format
 */
export function getMonthKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get date key in YYYY-MM-DD format
 */
export function getDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

