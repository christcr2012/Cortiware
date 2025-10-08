#!/usr/bin/env tsx
// Evaluate agreement rules against an event, then settle via wallet or 402

import fs from 'fs';
import path from 'path';
import { evaluateAgreement, type AgreementRule, type AgreementEvent } from '../../packages/agreements/src/index';
import { InMemoryWalletStore, debitOrInvoice } from '../../packages/wallet/src/index';

async function main() {
  const agreementFile = process.argv[2];
  const eventFile = process.argv[3];

  if (!agreementFile || !eventFile) {
    console.error('Usage: tsx scripts/agreements/eval_and_settle.ts <agreement.json> <event.json>');
    process.exit(1);
  }

  // Load agreement
  const agreementPath = path.resolve(agreementFile);
  const agreement = JSON.parse(fs.readFileSync(agreementPath, 'utf8'));
  const rules: AgreementRule[] = agreement.rules || [];
  const orgId = agreement.org_id || 'demo-org';

  // Load event
  const eventPath = path.resolve(eventFile);
  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const event: AgreementEvent = {
    event: eventData.event,
    value: eventData.value,
    metadata: eventData.metadata,
  };

  // Evaluate rules
  const charges = evaluateAgreement(orgId, rules, event);
  console.log('Charges evaluated:', JSON.stringify(charges, null, 2));

  // Initialize wallet store (in-memory for demo)
  const walletStore = new InMemoryWalletStore();
  
  // Set initial balance from event metadata or default to 0
  const initialBalance = eventData.wallet?.balance_cents || 0;
  walletStore.setBalance(orgId, initialBalance);

  // Attempt settlement
  const result = await debitOrInvoice(
    walletStore,
    orgId,
    charges.total_cents,
    'Agreement-based charges',
    charges.lines
  );

  // Write result
  fs.mkdirSync('out', { recursive: true });
  const outPath = 'out/eval_and_settle.result.json';
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  
  console.log(`\nSettlement result written to ${outPath}`);
  
  if (result.ok) {
    console.log(`✅ Wallet debited. New balance: ${result.newBalance} cents`);
  } else {
    console.log(`❌ HTTP 402 - Payment Required`);
    console.log('Invoice:', JSON.stringify(result.invoice, null, 2));
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

