'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Accountant Portal Shell
 * Uses client scope theme (controlled by Owner)
 * Accountant portal respects the Owner's theme selection
 */
export default function AccountantShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = (p: string) => Boolean(pathname === p || pathname?.startsWith(p + '/'));

  return (
    <div
      className="min-h-screen grid"
      style={{
        gridTemplateColumns: '280px 1fr',
        gridTemplateRows: '80px 1fr',
        background: 'var(--bg-main)',
      }}
    >
      <aside
        style={{
          gridRow: '1 / span 2',
          borderRight: '1px solid var(--border-primary)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          className="h-20 flex items-center justify-center px-4"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <div className="text-center">
            <div
              className="text-2xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--brand-gradient)' }}
            >
              Robinson AI Systems
            </div>
            <div
              className="text-xs font-mono tracking-wider"
              style={{ color: 'var(--brand-primary)', opacity: 0.7 }}
            >
              ACCOUNTANT PORTAL
            </div>
          </div>
        </div>

        <nav className="py-4 text-sm">
          <AccNavLink href="/accountant" active={active('/accountant') && pathname === '/accountant'}>
            Dashboard
          </AccNavLink>
          <AccNavLink href="/accountant/financials" active={active('/accountant/financials')}>
            Financials
          </AccNavLink>
          <AccNavLink href="/accountant/reports" active={active('/accountant/reports')}>
            Reports
          </AccNavLink>
        </nav>
      </aside>

      <header
        style={{
          background: 'var(--glass-bg-light)',
          borderBottom: '1px solid var(--border-primary)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div className="h-20 px-6 flex items-center justify-between">
          <div
            className="text-sm font-mono"
            style={{ color: 'var(--brand-primary)', opacity: 0.7 }}
          >
            ACCOUNTANT ACCESS
          </div>
          <form action="/api/accountant/logout" method="post">
            <button
              className="text-sm px-4 py-2 rounded-lg transition-all font-mono"
              style={{
                background: 'var(--surface-hover)',
                color: 'var(--brand-primary)',
                border: '1px solid var(--border-accent)',
              }}
            >
              LOGOUT
            </button>
          </form>
        </div>
      </header>

      <main className="p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function AccNavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2.5 transition-all border-l-4"
      style={
        active
          ? {
              color: 'var(--brand-primary)',
              background: 'var(--surface-hover)',
              borderLeftColor: 'var(--brand-primary)',
              boxShadow: 'var(--shadow-glow)',
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

