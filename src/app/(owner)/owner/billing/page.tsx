import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import BillingClient from './BillingClient';

export default async function OwnerBillingPage() {
  const jar = await cookies();
  if (!jar.get('rs_user') && !jar.get('mv_user')) redirect('/login');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color:'var(--brand-primary)' }}>Billing</h1>
      <div style={{ color:'var(--text-secondary)' }}>Invoices, payments, credits, payment methods. Actions: Download PDF, Pay Now, Update Card.</div>
      {/* Client wiring */}
      <BillingClient />
    </div>
  );
}

