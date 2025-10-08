"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Owner Portal Shell - CLIENT/OWNER PORTAL
 *
 * Navigation and layout for business owners (roofing companies, HVAC contractors, etc.)
 * Separate from Provider Portal (federation system for software providers)
 *
 * Access: Owner-only (not available to staff/field users)
 */
export default function OwnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const NavItem = ({ href, label }: { href: string; label: string }) => (
    <Link href={href} className={`px-3 py-2 rounded ${pathname?.startsWith(href) ? 'bg-white/10' : ''}`}>{label}</Link>
  );
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      <header className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-accent)' }}>
        <div className="font-bold" style={{ color: 'var(--brand-primary)' }}>Owner Portal</div>
        <nav className="flex gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
          <NavItem href="/owner" label="Dashboard" />
          <NavItem href="/owner/import-wizard" label="Import Data" />
          <NavItem href="/owner/subscription" label="Subscription" />
          <NavItem href="/owner/billing" label="Billing" />
          <NavItem href="/owner/usage" label="Usage" />
          <NavItem href="/owner/addons" label="Add-ons" />
          <NavItem href="/owner/team" label="Team" />
          <NavItem href="/owner/security" label="Security" />
          <NavItem href="/owner/api" label="API" />
          <NavItem href="/owner/incidents" label="Incidents" />
          <NavItem href="/owner/support" label="Support" />
          <NavItem href="/owner/settings" label="Settings" />
          <NavItem href="/owner/theme" label="Theme" />
        </nav>
      </header>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}

