#!/usr/bin/env tsx
/**
 * Settlement glue: reads a charges sample JSON and either debits wallet or emits 402 invoice payload.
 * Usage: tsx scripts/agreements/settle_charges.ts scripts/agreements/samples/charges.json
 */
import fs from 'fs';
import path from 'path';

type ChargeLine = { sku: string; qty: number; unit_cents?: number; total_cents?: number; memo?: string };
interface InputCharges { orgId: string; wallet?: { balance_cents: number }; lines: ChargeLine[]; memo?: string }

function computeTotal(lines: ChargeLine[]): number {
  return lines.reduce((acc, l) => acc + (l.total_cents ?? (l.unit_cents ?? 0) * l.qty), 0);
}

function main() {
  const file = process.argv[2];
  if (!file) { console.error('Usage: tsx scripts/agreements/settle_charges.ts <charges.json>'); process.exit(1); }
  const raw = fs.readFileSync(file, 'utf8');
  const input: InputCharges = JSON.parse(raw);
  const total = computeTotal(input.lines);
  const balance = input.wallet?.balance_cents ?? 0;

  let result: any;
  if (balance >= total) {
    result = {
      ok: true,
      mode: 'wallet_debit',
      orgId: input.orgId,
      debited_cents: total,
      new_balance_cents: balance - total,
      lines: input.lines,
      memo: input.memo || null,
    };
  } else {
    result = {
      ok: false,
      error: 'payment_required',
      status: 402,
      invoice: {
        orgId: input.orgId,
        amount_cents: total,
        lines: input.lines,
        memo: input.memo || 'Daily rental after grace window',
      },
    };
  }
  fs.mkdirSync('out', { recursive: true });
  const outPath = path.join('out', 'charges.result.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`Wrote ${outPath}`);
}

main();

