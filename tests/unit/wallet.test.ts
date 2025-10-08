import { InMemoryWalletStore, debitOrInvoice } from '../../packages/wallet/src/index';

export async function run() {
  const name = 'wallet';
  let passed = 0, failed = 0, total = 0;

  // Test: debit succeeds when balance sufficient
  total++;
  try {
    const store = new InMemoryWalletStore();
    store.setBalance('org-1', 1000);
    
    const result = await debitOrInvoice(
      store,
      'org-1',
      300,
      'Test charge',
      [{ sku: 'TEST', qty: 1, total_cents: 300 }]
    );
    
    if (result.ok && result.newBalance === 700) {
      passed++;
    } else {
      throw new Error('Expected successful debit with new balance 700');
    }
  } catch (e) {
    failed++;
    console.error('wallet debit success failed', e);
  }

  // Test: returns 402 when balance insufficient
  total++;
  try {
    const store = new InMemoryWalletStore();
    store.setBalance('org-2', 100);
    
    const result = await debitOrInvoice(
      store,
      'org-2',
      300,
      'Test charge',
      [{ sku: 'TEST', qty: 1, total_cents: 300 }]
    );
    
    if (!result.ok && result.status === 402 && result.invoice.amount_cents === 300) {
      passed++;
    } else {
      throw new Error('Expected 402 with invoice');
    }
  } catch (e) {
    failed++;
    console.error('wallet 402 failed', e);
  }

  // Test: transaction recorded on debit
  total++;
  try {
    const store = new InMemoryWalletStore();
    store.setBalance('org-3', 500);
    
    await debitOrInvoice(
      store,
      'org-3',
      200,
      'Test debit',
      [{ sku: 'TEST', qty: 1, total_cents: 200 }]
    );
    
    const txns = store.getTransactions('org-3');
    if (txns.length === 1 && txns[0].amountCents === -200 && txns[0].memo === 'Test debit') {
      passed++;
    } else {
      throw new Error('Expected transaction recorded with -200 cents');
    }
  } catch (e) {
    failed++;
    console.error('wallet transaction record failed', e);
  }

  // Test: zero balance returns 402
  total++;
  try {
    const store = new InMemoryWalletStore();
    store.setBalance('org-4', 0);
    
    const result = await debitOrInvoice(
      store,
      'org-4',
      100,
      'Test',
      [{ sku: 'TEST', qty: 1, total_cents: 100 }]
    );
    
    if (!result.ok && result.status === 402) {
      passed++;
    } else {
      throw new Error('Expected 402 for zero balance');
    }
  } catch (e) {
    failed++;
    console.error('wallet zero balance failed', e);
  }

  // Test: exact balance debit succeeds
  total++;
  try {
    const store = new InMemoryWalletStore();
    store.setBalance('org-5', 250);
    
    const result = await debitOrInvoice(
      store,
      'org-5',
      250,
      'Exact balance',
      [{ sku: 'TEST', qty: 1, total_cents: 250 }]
    );
    
    if (result.ok && result.newBalance === 0) {
      passed++;
    } else {
      throw new Error('Expected successful debit to zero balance');
    }
  } catch (e) {
    failed++;
    console.error('wallet exact balance failed', e);
  }

  return { name, passed, failed, total };
}

