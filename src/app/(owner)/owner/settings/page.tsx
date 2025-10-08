import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// Simple catalog until vertical packs expose first-class features
const PACK_OPTIONS = [
  { key: 'roll-off', label: 'Roll-Off' },
  { key: 'port-a-john', label: 'Port-a-John' },
  { key: 'fencing', label: 'Fencing' },
  { key: 'cleaning', label: 'Cleaning' },
  { key: 'appliance-rental', label: 'Appliance Rental' },
  { key: 'concrete-leveling', label: 'Concrete Leveling' },
] as const;

const FEATURE_OPTIONS = [
  { key: 'fencing.drawing', label: 'Drawing Tool (from Fencing)', description: 'Use drawing tool to model material/labor for custom roll-off containers.' },
] as const;

async function getOrgForCurrentUser() {
  const jar = await cookies();
  const email = jar.get('rs_user')?.value || jar.get('mv_user')?.value || null;
  if (!email) return null;
  const user = await prisma.user.findFirst({ where: { email }, select: { id: true, orgId: true } });
  if (!user?.orgId) return null;
  const org = await prisma.org.findUnique({ where: { id: user.orgId }, select: { id: true, featureFlags: true, name: true } });
  return org;
}

export default async function OwnerSettingsPage() {
  const jar = await cookies();
  if (!jar.get('rs_user') && !jar.get('mv_user')) redirect('/login');

  const org = await getOrgForCurrentUser();
  if (!org) redirect('/login');

  const flags = (org.featureFlags as any) || {};
  const activePacks: string[] = Array.isArray(flags.activePacks) ? flags.activePacks : (Array.isArray(flags.active_packs) ? flags.active_packs : []);
  const activeFeatures: string[] = Array.isArray(flags.activeFeatures) ? flags.activeFeatures : [];

  async function updateServices(formData: FormData) {
    'use server';
    const jar = await cookies();
    const email = jar.get('rs_user')?.value || jar.get('mv_user')?.value || null;
    if (!email) return;
    const user = await prisma.user.findFirst({ where: { email }, select: { orgId: true } });
    if (!user?.orgId) return;

    // Read current flags to merge
    const current = await prisma.org.findUnique({ where: { id: user.orgId }, select: { featureFlags: true } });
    const currFlags = (current?.featureFlags as any) || {};

    // Derive selections
    const nextPacks = PACK_OPTIONS
      .filter(p => formData.get(`pack:${p.key}`) === 'on')
      .map(p => p.key);
    const nextFeatures = FEATURE_OPTIONS
      .filter(f => formData.get(`feature:${f.key}`) === 'on')
      .map(f => f.key);

    const merged = { ...currFlags, activePacks: nextPacks, activeFeatures: nextFeatures };
    await prisma.org.update({ where: { id: user.orgId }, data: { featureFlags: merged as any } });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color:'var(--brand-primary)' }}>Settings</h1>
      <p style={{ color:'var(--text-secondary)' }}>Org profile, billing contacts, legal entity, tax IDs, invoice memo fields.</p>

      <form action={updateServices} className="space-y-6">
        {/* Services & Tools */}
        <div className="space-y-3 rounded p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-lg font-semibold" style={{ color:'var(--text-primary)' }}>Services & Tools</div>
          <div className="text-xs" style={{ color:'var(--text-secondary)' }}>Enable whole services (verticals) or cherry-pick individual tools.</div>

          {/* Packs */}
          <div className="mt-2">
            <div className="text-sm font-medium" style={{ color:'var(--text-primary)' }}>Services (verticals)</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PACK_OPTIONS.map(p => (
                <label key={p.key} className="inline-flex items-center gap-2">
                  <input type="checkbox" name={`pack:${p.key}`} defaultChecked={activePacks.includes(p.key)} />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cross-sell copy (simple hint) */}
          {(activePacks.includes('roll-off') && !activePacks.includes('port-a-john')) ? (
            <div className="text-xs mt-1" style={{ color:'var(--text-secondary)' }}>Do you also provide "Port-a-John" services?</div>
          ) : null}
          {(activePacks.includes('port-a-john') && !activePacks.includes('roll-off')) ? (
            <div className="text-xs mt-1" style={{ color:'var(--text-secondary)' }}>Do you also provide "Roll-Off" services?</div>
          ) : null}

          {/* Features */}
          <div className="mt-4">
            <div className="text-sm font-medium" style={{ color:'var(--text-primary)' }}>Individual tools</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURE_OPTIONS.map(f => (
                <label key={f.key} className="inline-flex items-center gap-2">
                  <input type="checkbox" name={`feature:${f.key}`} defaultChecked={activeFeatures.includes(f.key)} />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
            <div className="text-xs" style={{ color:'var(--text-secondary)' }}>Example: enable Drawing Tool from Fencing to estimate custom roll-off container fabrication costs.</div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 rounded" style={{ background:'var(--brand-primary)', color:'var(--bg-main)' }}>Save</button>
        </div>
      </form>
    </div>
  );
}

