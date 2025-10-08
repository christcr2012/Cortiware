/**
 * AI Mapping Assistant - Intelligent field mapping for Import Wizard
 * 
 * Analyzes sample data and suggests field mappings, transformations, and validations
 * using OpenAI GPT-4o-mini for cost-effective semantic understanding.
 */

import OpenAI from 'openai';
import { maskSampleData, type MaskedSample } from './data-masking';
import { summarizeColumns, type ColumnSummary } from './data-summarizer';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FieldMapping {
  source: string;
  target: string;
  confidence: number;
  why: string;
  transform?: string[];
}

export interface MappingSuggestion {
  mappings: FieldMapping[];
  transforms: Array<{ target: string; rules: string[] }>;
  validations: Array<{ target: string; rules: string[] }>;
  dedupe: { fields: string[] };
  model: string;
  tokensIn: number;
  tokensOut: number;
  confidenceOverall: number;
}

export interface TierClassification {
  tier: 'light' | 'standard' | 'complex';
  estimatedTokensIn: number;
  estimatedTokensOut: number;
}

/**
 * Classify import complexity tier based on schema size
 */
export function classifyTier(columnCount: number, rowCount: number): TierClassification {
  const estimatedTokensIn = 1000 + (columnCount * 100) + (rowCount * 10);
  const estimatedTokensOut = 200 + (columnCount * 20);

  if (columnCount <= 10 && rowCount <= 100) {
    return { tier: 'light', estimatedTokensIn: Math.min(estimatedTokensIn, 3000), estimatedTokensOut: Math.min(estimatedTokensOut, 500) };
  } else if (columnCount <= 30 && rowCount <= 500) {
    return { tier: 'standard', estimatedTokensIn: Math.min(estimatedTokensIn, 6000), estimatedTokensOut: Math.min(estimatedTokensOut, 1000) };
  } else {
    return { tier: 'complex', estimatedTokensIn: Math.min(estimatedTokensIn, 12000), estimatedTokensOut: Math.min(estimatedTokensOut, 2000) };
  }
}

/**
 * Calculate AI costs based on token usage
 */
export function calculateAICosts(tokensIn: number, tokensOut: number, model: string = 'gpt-4o-mini'): {
  aiCents: number;
  infraCents: number;
  totalCents: number;
} {
  // GPT-4o-mini pricing (as of 2024): $0.15/1M input, $0.60/1M output
  const inputCostPer1M = 0.15;
  const outputCostPer1M = 0.60;
  
  const aiCents = Math.ceil(
    ((tokensIn / 1_000_000) * inputCostPer1M * 100) +
    ((tokensOut / 1_000_000) * outputCostPer1M * 100)
  );
  
  // Infrastructure overhead (storage, processing, etc.)
  const infraCents = Math.ceil(aiCents * 0.2); // 20% overhead
  
  return {
    aiCents,
    infraCents,
    totalCents: aiCents + infraCents,
  };
}

/**
 * Get target schema for entity type
 */
function getTargetSchema(entityType: string): Record<string, { type: string; required: boolean; description: string }> {
  const schemas: Record<string, any> = {
    CUSTOMERS: {
      primaryName: { type: 'string', required: true, description: 'Customer primary contact name' },
      company: { type: 'string', required: false, description: 'Company/business name' },
      email: { type: 'email', required: false, description: 'Email address' },
      phoneE164: { type: 'phone', required: false, description: 'Phone number in E.164 format' },
      addressLine1: { type: 'string', required: false, description: 'Street address' },
      addressLine2: { type: 'string', required: false, description: 'Apt/Suite/Unit' },
      city: { type: 'string', required: false, description: 'City' },
      state: { type: 'string', required: false, description: 'State/Province' },
      postalCode: { type: 'string', required: false, description: 'ZIP/Postal code' },
      country: { type: 'string', required: false, description: 'Country' },
    },
    JOBS: {
      customerId: { type: 'string', required: true, description: 'Reference to customer' },
      status: { type: 'string', required: true, description: 'Job status (planned, in_progress, completed, cancelled)' },
      scheduledStart: { type: 'date', required: false, description: 'Scheduled start date/time' },
      scheduledEnd: { type: 'date', required: false, description: 'Scheduled end date/time' },
      assignedTo: { type: 'string', required: false, description: 'Assigned user ID' },
      description: { type: 'string', required: false, description: 'Job description' },
      notes: { type: 'string', required: false, description: 'Internal notes' },
    },
    INVOICES: {
      customerId: { type: 'string', required: true, description: 'Reference to customer' },
      amount: { type: 'decimal', required: true, description: 'Invoice amount' },
      status: { type: 'string', required: true, description: 'Invoice status (draft, sent, paid, overdue, cancelled)' },
      dueDate: { type: 'date', required: false, description: 'Payment due date' },
      issuedDate: { type: 'date', required: false, description: 'Invoice issue date' },
      description: { type: 'string', required: false, description: 'Invoice description' },
    },
  };

  return schemas[entityType] || schemas.CUSTOMERS;
}

/**
 * Build AI prompt for field mapping
 */
function buildMappingPrompt(
  entityType: string,
  columnSummaries: ColumnSummary[],
  maskedSamples: MaskedSample[],
  targetSchema: Record<string, any>
): string {
  const targetFields = Object.entries(targetSchema)
    .map(([name, spec]) => `  - ${name} (${spec.type}${spec.required ? ', required' : ''}): ${spec.description}`)
    .join('\n');

  const sourceColumns = columnSummaries
    .map(col => `  - "${col.name}": ${col.inferredType} (${col.uniquePercent}% unique, ${col.emptyPercent}% empty)\n    Examples: ${col.examples.join(', ')}`)
    .join('\n');

  return `You are a data migration expert. Analyze the source data and suggest field mappings to the target schema.

TARGET ENTITY: ${entityType}
TARGET SCHEMA:
${targetFields}

SOURCE COLUMNS:
${sourceColumns}

SAMPLE DATA (masked for privacy):
${JSON.stringify(maskedSamples.slice(0, 3), null, 2)}

TASK:
1. Map each source column to the most appropriate target field
2. Suggest data transformations (trim, lowercase, normalizePhone, parseDate, etc.)
3. Suggest validation rules
4. Identify fields suitable for deduplication
5. Provide confidence score (0-1) and reasoning for each mapping

RESPONSE FORMAT (JSON only, no markdown):
{
  "mappings": [
    { "source": "Cust Name", "target": "primaryName", "confidence": 0.95, "why": "semantic match", "transform": ["trim"] }
  ],
  "transforms": [
    { "target": "email", "rules": ["lowercase", "trim"] }
  ],
  "validations": [
    { "target": "phoneE164", "rules": ["normalizePhone", "required"] }
  ],
  "dedupe": { "fields": ["email", "phoneE164"] }
}`;
}

/**
 * Suggest field mappings using AI
 */
export async function suggestMappings(
  entityType: string,
  sampleRows: any[],
  columnNames: string[]
): Promise<MappingSuggestion> {
  // 1. Summarize columns
  const columnSummaries = summarizeColumns(sampleRows, columnNames);
  
  // 2. Mask sample data
  const maskedSamples = maskSampleData(sampleRows.slice(0, 5));
  
  // 3. Get target schema
  const targetSchema = getTargetSchema(entityType);
  
  // 4. Build prompt
  const prompt = buildMappingPrompt(entityType, columnSummaries, maskedSamples, targetSchema);
  
  // 5. Call OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a data migration expert. Respond only with valid JSON, no markdown formatting.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3, // Lower temperature for more consistent results
    max_tokens: 2000,
  });

  const response = completion.choices[0]?.message?.content || '{}';
  
  // Parse response (handle markdown code blocks if present)
  let parsed: any;
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse AI response:', response);
    throw new Error('AI returned invalid JSON response');
  }

  // Calculate confidence
  const confidences = parsed.mappings?.map((m: any) => m.confidence || 0) || [];
  const confidenceOverall = confidences.length > 0
    ? confidences.reduce((sum: number, c: number) => sum + c, 0) / confidences.length
    : 0;

  return {
    mappings: parsed.mappings || [],
    transforms: parsed.transforms || [],
    validations: parsed.validations || [],
    dedupe: parsed.dedupe || { fields: [] },
    model: 'gpt-4o-mini',
    tokensIn: completion.usage?.prompt_tokens || 0,
    tokensOut: completion.usage?.completion_tokens || 0,
    confidenceOverall,
  };
}

/**
 * Get retail pricing for tier
 */
export async function getRetailPricing(tier: 'light' | 'standard' | 'complex'): Promise<number> {
  // Default pricing (can be overridden by provider settings)
  const defaultPricing = {
    light: 99,      // $0.99
    standard: 299,  // $2.99
    complex: 499,   // $4.99
  };

  // TODO: Fetch from provider_import_pricing table when implemented
  return defaultPricing[tier];
}

