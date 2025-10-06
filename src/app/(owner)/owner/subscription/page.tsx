import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SubscriptionClient from './SubscriptionClient';

export default async function OwnerSubscriptionPage() {
  const jar = await cookies();
  if (!jar.get('rs_user') && !jar.get('mv_user')) redirect('/login');
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold" style={{ color:'var(--brand-primary)' }}>Subscription</h1>
      <p style={{ color:'var(--text-secondary)' }}>View current plan, price, billing cycle. Change plan via Stripe Customer Portal.</p>
      {/* Client wiring */}
      <SubscriptionClient />
    </div>
  );
}

