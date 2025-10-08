/**
 * Data Masking - Privacy-preserving data summarization for AI analysis
 * 
 * Masks PII (emails, phones, addresses) while preserving data patterns
 * for AI field mapping suggestions.
 */

export interface MaskedSample {
  [key: string]: string | number | null;
}

/**
 * Mask email addresses (preserve domain pattern)
 */
function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return email;
  
  const match = email.match(/^([^@]+)@(.+)$/);
  if (!match) return email;
  
  const [, local, domain] = match;
  const maskedLocal = local.length > 2
    ? `${local[0]}***${local[local.length - 1]}`
    : '***';
  
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone numbers (preserve last 4 digits and format pattern)
 */
function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return phone;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 4) return '***';
  
  const last4 = digits.slice(-4);
  const masked = '*'.repeat(digits.length - 4) + last4;
  
  // Preserve original formatting pattern
  if (phone.includes('(') && phone.includes(')')) {
    return `(***) ***-${last4}`;
  } else if (phone.includes('-')) {
    return `***-***-${last4}`;
  } else if (phone.includes(' ')) {
    return `*** *** ${last4}`;
  }
  
  return masked;
}

/**
 * Mask addresses (preserve city/state/zip pattern)
 */
function maskAddress(address: string): string {
  if (!address || typeof address !== 'string') return address;
  
  // Try to preserve city, state, zip pattern
  const cityStateZip = address.match(/,\s*([A-Z]{2})\s+(\d{5}(-\d{4})?)/);
  if (cityStateZip) {
    return `*** Street, City, ${cityStateZip[1]} ${cityStateZip[2]}`;
  }
  
  // Just mask the street number/name
  return address.replace(/^\d+\s+[A-Za-z\s]+/, '*** Street');
}

/**
 * Mask names (preserve first letter and length pattern)
 */
function maskName(name: string): string {
  if (!name || typeof name !== 'string') return name;
  
  const words = name.split(/\s+/);
  return words
    .map(word => {
      if (word.length <= 1) return word;
      return `${word[0]}${'*'.repeat(word.length - 1)}`;
    })
    .join(' ');
}

/**
 * Detect field type based on content and name
 */
function detectFieldType(fieldName: string, value: any): 'email' | 'phone' | 'address' | 'name' | 'other' {
  const name = fieldName.toLowerCase();
  const val = String(value || '').toLowerCase();
  
  // Email detection
  if (name.includes('email') || name.includes('e-mail') || /@/.test(val)) {
    return 'email';
  }
  
  // Phone detection
  if (name.includes('phone') || name.includes('tel') || name.includes('mobile') || name.includes('cell')) {
    return 'phone';
  }
  
  // Address detection
  if (name.includes('address') || name.includes('street') || name.includes('location')) {
    return 'address';
  }
  
  // Name detection
  if (name.includes('name') || name.includes('contact') || name.includes('customer')) {
    return 'name';
  }
  
  return 'other';
}

/**
 * Mask a single value based on detected type
 */
function maskValue(fieldName: string, value: any): any {
  if (value === null || value === undefined || value === '') {
    return value;
  }
  
  const type = detectFieldType(fieldName, value);
  const strValue = String(value);
  
  switch (type) {
    case 'email':
      return maskEmail(strValue);
    case 'phone':
      return maskPhone(strValue);
    case 'address':
      return maskAddress(strValue);
    case 'name':
      return maskName(strValue);
    default:
      // For other types, preserve the value if it's short or numeric
      if (typeof value === 'number') return value;
      if (strValue.length <= 10) return value;
      // Truncate long text
      return strValue.slice(0, 20) + '...';
  }
}

/**
 * Mask sample data for AI analysis
 */
export function maskSampleData(rows: any[]): MaskedSample[] {
  return rows.map(row => {
    const masked: MaskedSample = {};
    
    for (const [key, value] of Object.entries(row)) {
      masked[key] = maskValue(key, value);
    }
    
    return masked;
  });
}

/**
 * Create statistical summary without exposing raw data
 */
export function createStatisticalSummary(rows: any[], columnName: string): {
  totalCount: number;
  uniqueCount: number;
  emptyCount: number;
  minLength: number;
  maxLength: number;
  avgLength: number;
  pattern: string;
} {
  const values = rows.map(row => row[columnName]).filter(v => v !== null && v !== undefined && v !== '');
  const totalCount = rows.length;
  const emptyCount = totalCount - values.length;
  const uniqueCount = new Set(values).size;
  
  const lengths = values.map(v => String(v).length);
  const minLength = lengths.length > 0 ? Math.min(...lengths) : 0;
  const maxLength = lengths.length > 0 ? Math.max(...lengths) : 0;
  const avgLength = lengths.length > 0 ? Math.round(lengths.reduce((sum, len) => sum + len, 0) / lengths.length) : 0;
  
  // Detect common patterns
  let pattern = 'mixed';
  if (values.length > 0) {
    const firstValue = String(values[0]);
    if (/^\d+$/.test(firstValue)) pattern = 'numeric';
    else if (/^[A-Za-z\s]+$/.test(firstValue)) pattern = 'alpha';
    else if (/@/.test(firstValue)) pattern = 'email';
    else if (/^\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/.test(firstValue)) pattern = 'phone';
    else if (/^\d{4}-\d{2}-\d{2}/.test(firstValue)) pattern = 'date';
  }
  
  return {
    totalCount,
    uniqueCount,
    emptyCount,
    minLength,
    maxLength,
    avgLength,
    pattern,
  };
}

