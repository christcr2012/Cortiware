'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useMe } from '@/lib/useMe';
import type { BrandConfig } from '@/lib/types/me';

/**
 * Client-side shell for authenticated app pages
 * Uses client scope theme (controlled by Owner)
 * Respects the Owner's theme selection
 */
export default function AppShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { org } = useMe();
  const active = (p: string) => Boolean(pathname === p || pathname?.startsWith(p + '/'));

  // Extract brand config
  const brandConfig: BrandConfig = org?.brandConfig || {};
  const brandName = brandConfig.name || 'Robinson AI Systems';
  const brandLogoUrl = brandConfig.logoUrl;

  return (
    <div
      className="min-h-screen grid"
      style={{
        gridTemplateColumns: '260px 1fr',
        gridTemplateRows: '80px 1fr',
        background: 'var(--bg-main)',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          gridRow: '1 / span 2',
          borderRight: '1px solid var(--border-primary)',
          background: 'var(--glass-bg)',
        }}
      >
        {/* Logo */}
        <div
          className="h-20 flex items-center justify-center px-4"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <Link href="/dashboard" aria-label="Home" className="block text-center">
            {brandLogoUrl ? (
              <img
                src={brandLogoUrl}
                alt={`${brandName} Logo`}
                style={{ height: 'clamp(96px, 16vw, 180px)', width: 'auto', maxWidth: '180px' }}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = '/logo.png';
                }}
              />
            ) : (
              <Image
                src="/logo.png"
                alt="Logo"
                priority
                width={180}
                height={180}
                style={{ height: 'clamp(96px, 16vw, 180px)', width: 'auto' }}
              />
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="py-3 text-sm">
          <NavLink href="/dashboard" active={active('/dashboard')}>
            Dashboard
          </NavLink>
          <NavLink href="/leads" active={active('/leads')}>
            Leads
          </NavLink>
          <NavLink href="/contacts" active={active('/contacts')}>
            Contacts
          </NavLink>
          <NavLink href="/opportunities" active={active('/opportunities')}>
            Opportunities
          </NavLink>
          <NavLink href="/organizations" active={active('/organizations')}>
            Organizations
          </NavLink>
          <NavLink href="/fleet" active={active('/fleet')}>
            Fleet
          </NavLink>
          <NavLink href="/admin" active={active('/admin')}>
            Admin
          </NavLink>
          <NavLink href="/reports" active={active('/reports')}>
            Reports
          </NavLink>
          <NavLink href="/settings" active={active('/settings')}>
            Settings
          </NavLink>
        </nav>
      </aside>

      {/* Top bar */}
      <header
        style={{
          background: 'var(--glass-bg-light)',
          borderBottom: '1px solid var(--border-primary)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div className="h-20 px-6 flex items-center justify-between">
          <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{brandName}</div>
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="text-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Profile
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                className="text-sm px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: 'var(--surface-hover)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-accent)',
                }}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 transition-colors border-l-4"
      style={
        active
          ? {
              color: 'var(--text-primary)',
              background: 'var(--surface-hover)',
              borderLeftColor: 'var(--brand-primary)',
            }
          : {
              color: 'var(--text-secondary)',
              borderLeftColor: 'transparent',
            }
      }
    >
      {children}
    </Link>
  );
}

