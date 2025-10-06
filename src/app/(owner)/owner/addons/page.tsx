import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function OwnerAddonsPage() {
  const jar = await cookies();
  if (!jar.get('rs_user') && !jar.get('mv_user')) redirect('/login');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color:'var(--brand-primary)' }}>Add-ons</h1>
      <p style={{ color:'var(--text-secondary)' }}>Catalog of add-ons (SKUs); purchase/cancel/trial.</p>
      {/* TODO: Wire to addons.service (catalog + purchase flows) */}
    </div>
  );
}

