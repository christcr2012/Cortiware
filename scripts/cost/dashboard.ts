#!/usr/bin/env tsx
// Local cost tracking dashboard (no external services)

import fs from 'fs';
import path from 'path';

type CostEntry = {
  timestamp: string;
  category: string;
  amount_cents: number;
  memo?: string;
};

const COST_LOG_PATH = 'out/cost_log.json';
const BUDGET_CENTS = 10000; // $100/month

function loadCostLog(): CostEntry[] {
  if (!fs.existsSync(COST_LOG_PATH)) return [];
  return JSON.parse(fs.readFileSync(COST_LOG_PATH, 'utf8'));
}

function getCurrentMonthEntries(entries: CostEntry[]): CostEntry[] {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return entries.filter(e => e.timestamp.startsWith(currentMonth));
}

function aggregateByCategory(entries: CostEntry[]): Record<string, number> {
  const agg: Record<string, number> = {};
  for (const entry of entries) {
    agg[entry.category] = (agg[entry.category] || 0) + entry.amount_cents;
  }
  return agg;
}

async function main() {
  const entries = loadCostLog();
  const currentMonth = getCurrentMonthEntries(entries);
  const byCategory = aggregateByCategory(currentMonth);
  const totalCents = Object.values(byCategory).reduce((sum, v) => sum + v, 0);
  const totalDollars = (totalCents / 100).toFixed(2);
  const budgetDollars = (BUDGET_CENTS / 100).toFixed(2);
  const utilization = ((totalCents / BUDGET_CENTS) * 100).toFixed(1);

  console.log('\n=== Cortiware Cost Dashboard (Local) ===\n');
  console.log(`Budget: $${budgetDollars}/month`);
  console.log(`Current Month Spend: $${totalDollars}`);
  console.log(`Utilization: ${utilization}%\n`);

  console.log('Breakdown by Category:');
  for (const [category, cents] of Object.entries(byCategory)) {
    const dollars = (cents / 100).toFixed(2);
    console.log(`  ${category}: $${dollars}`);
  }

  if (currentMonth.length === 0) {
    console.log('  (no entries this month)');
  }

  console.log('');

  // Alerts
  if (totalCents >= BUDGET_CENTS) {
    console.log('🚨 CRITICAL: Budget exceeded! Costed actions will return 402.');
  } else if (totalCents >= BUDGET_CENTS * 0.95) {
    console.log('⚠️  WARNING: 95% of budget used. Approaching limit.');
  } else if (totalCents >= BUDGET_CENTS * 0.80) {
    console.log('⚠️  WARNING: 80% of budget used.');
  } else {
    console.log('✅ Budget healthy.');
  }

  console.log('');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

