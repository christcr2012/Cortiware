/**
 * File Parser - Unified file parsing service
 * 
 * Supports CSV, Excel, JSON, XML with auto-detection and encoding handling.
 */

import { parse as parseCSV } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

export interface ParsedFile {
  format: 'csv' | 'excel' | 'json' | 'xml';
  columns: string[];
  rows: any[];
  totalRows: number;
  encoding?: string;
}

export interface ParseOptions {
  maxRows?: number; // Limit number of rows to parse (for samples)
  encoding?: string; // Force specific encoding
  delimiter?: string; // CSV delimiter (auto-detected if not provided)
}

/**
 * Detect file format from extension or content
 */
export function detectFormat(fileName: string, content: string): 'csv' | 'excel' | 'json' | 'xml' {
  const ext = fileName.toLowerCase().split('.').pop();
  
  // Check extension first
  if (ext === 'xlsx' || ext === 'xls') return 'excel';
  if (ext === 'json') return 'json';
  if (ext === 'xml') return 'xml';
  if (ext === 'csv' || ext === 'txt') return 'csv';
  
  // Fallback to content detection
  const trimmed = content.trim();
  
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) return 'xml';
  
  // Default to CSV
  return 'csv';
}

/**
 * Detect CSV delimiter
 */
function detectDelimiter(content: string): string {
  const firstLine = content.split('\n')[0] || '';
  
  // Count occurrences of common delimiters
  const delimiters = [',', '\t', ';', '|'];
  const counts = delimiters.map(d => ({
    delimiter: d,
    count: (firstLine.match(new RegExp(`\\${d}`, 'g')) || []).length,
  }));
  
  // Return delimiter with highest count
  counts.sort((a, b) => b.count - a.count);
  return counts[0].count > 0 ? counts[0].delimiter : ',';
}

/**
 * Parse CSV file
 */
function parseCSVFile(content: string, options: ParseOptions = {}): ParsedFile {
  const delimiter = options.delimiter || detectDelimiter(content);
  
  try {
    const records = parseCSV(content, {
      columns: true,
      skip_empty_lines: true,
      delimiter,
      trim: true,
      relax_column_count: true, // Allow inconsistent column counts
    });

    if (records.length === 0) {
      throw new Error('No data found in CSV file');
    }

    const columns = Object.keys(records[0]);
    const rows = options.maxRows ? records.slice(0, options.maxRows) : records;

    return {
      format: 'csv',
      columns,
      rows,
      totalRows: records.length,
    };
  } catch (error: any) {
    throw new Error(`CSV parsing failed: ${error.message}`);
  }
}

/**
 * Parse Excel file
 */
function parseExcelFile(content: string | Buffer, options: ParseOptions = {}): ParsedFile {
  try {
    // Convert base64 string to buffer if needed
    const buffer = typeof content === 'string'
      ? Buffer.from(content, 'base64')
      : content;

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Use first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('No sheets found in Excel file');
    }

    const worksheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(worksheet, {
      defval: '', // Default value for empty cells
      raw: false, // Convert to strings
    });

    if (records.length === 0) {
      throw new Error('No data found in Excel file');
    }

    const columns = Object.keys(records[0]);
    const rows = options.maxRows ? records.slice(0, options.maxRows) : records;

    return {
      format: 'excel',
      columns,
      rows,
      totalRows: records.length,
    };
  } catch (error: any) {
    throw new Error(`Excel parsing failed: ${error.message}`);
  }
}

/**
 * Parse JSON file
 */
function parseJSONFile(content: string, options: ParseOptions = {}): ParsedFile {
  try {
    const data = JSON.parse(content);
    
    // Handle both array and single object
    const records = Array.isArray(data) ? data : [data];
    
    if (records.length === 0) {
      throw new Error('No data found in JSON file');
    }

    const columns = Object.keys(records[0]);
    const rows = options.maxRows ? records.slice(0, options.maxRows) : records;

    return {
      format: 'json',
      columns,
      rows,
      totalRows: records.length,
    };
  } catch (error: any) {
    throw new Error(`JSON parsing failed: ${error.message}`);
  }
}

/**
 * Parse XML file (basic implementation)
 */
function parseXMLFile(content: string, options: ParseOptions = {}): ParsedFile {
  try {
    // Simple XML parsing - extract records between tags
    // This is a basic implementation; for production, use fast-xml-parser
    
    // Find all record-like elements (common patterns: <record>, <item>, <row>, <entry>)
    const recordPatterns = [
      /<record[^>]*>(.*?)<\/record>/gs,
      /<item[^>]*>(.*?)<\/item>/gs,
      /<row[^>]*>(.*?)<\/row>/gs,
      /<entry[^>]*>(.*?)<\/entry>/gs,
    ];

    let matches: RegExpMatchArray | null = null;
    for (const pattern of recordPatterns) {
      matches = content.match(pattern);
      if (matches && matches.length > 0) break;
    }

    if (!matches || matches.length === 0) {
      throw new Error('No records found in XML file');
    }

    // Parse each record
    const records = matches.map(recordXml => {
      const record: any = {};
      
      // Extract field values
      const fieldPattern = /<([^>]+)>([^<]*)<\/\1>/g;
      let fieldMatch;
      
      while ((fieldMatch = fieldPattern.exec(recordXml)) !== null) {
        const [, fieldName, fieldValue] = fieldMatch;
        record[fieldName] = fieldValue;
      }
      
      return record;
    });

    if (records.length === 0) {
      throw new Error('No data found in XML file');
    }

    const columns = Object.keys(records[0]);
    const rows = options.maxRows ? records.slice(0, options.maxRows) : records;

    return {
      format: 'xml',
      columns,
      rows,
      totalRows: records.length,
    };
  } catch (error: any) {
    throw new Error(`XML parsing failed: ${error.message}`);
  }
}

/**
 * Main parse function - auto-detects format and parses accordingly
 */
export function parseFile(
  fileName: string,
  content: string | Buffer,
  options: ParseOptions = {}
): ParsedFile {
  // Detect format
  const contentStr = typeof content === 'string' ? content : content.toString('utf-8');
  const format = detectFormat(fileName, contentStr);

  // Parse based on format
  switch (format) {
    case 'csv':
      return parseCSVFile(contentStr, options);
    case 'excel':
      return parseExcelFile(content, options);
    case 'json':
      return parseJSONFile(contentStr, options);
    case 'xml':
      return parseXMLFile(contentStr, options);
    default:
      throw new Error(`Unsupported file format: ${format}`);
  }
}

/**
 * Parse sample from file (first N rows)
 */
export function parseSample(
  fileName: string,
  content: string | Buffer,
  maxRows: number = 10
): ParsedFile {
  return parseFile(fileName, content, { maxRows });
}

/**
 * Validate file before parsing
 */
export function validateFile(fileName: string, fileSize: number): { valid: boolean; error?: string } {
  // Check file extension
  const ext = fileName.toLowerCase().split('.').pop();
  const supportedExtensions = ['csv', 'xlsx', 'xls', 'json', 'xml', 'txt'];
  
  if (!ext || !supportedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file type. Supported: ${supportedExtensions.join(', ')}`,
    };
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (fileSize > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Detect encoding (basic implementation)
 */
export function detectEncoding(content: Buffer): string {
  // Check for BOM (Byte Order Mark)
  if (content.length >= 3) {
    if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
      return 'utf-8';
    }
  }

  if (content.length >= 2) {
    if (content[0] === 0xFE && content[1] === 0xFF) {
      return 'utf-16be';
    }
    if (content[0] === 0xFF && content[1] === 0xFE) {
      return 'utf-16le';
    }
  }

  // Default to UTF-8
  return 'utf-8';
}

