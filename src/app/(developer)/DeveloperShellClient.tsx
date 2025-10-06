'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Provider Developer Portal Shell
 * Uses theme CSS variables for dynamic theming
 * For provider developers working on the platform
 */
export default function DeveloperShellClient({ children }: { children: React.ReactNode }) {
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
      {/* Sidebar */}
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
              DEVELOPER PORTAL
            </div>
          </div>
        </div>

        <nav className="py-4 text-sm">
          <div
            className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--brand-primary)', opacity: 0.5 }}
          >
            Development
          </div>
          <DevNavLink href="/developer" active={active('/developer') && pathname === '/developer'}>
            Dashboard
          </DevNavLink>
          <DevNavLink href="/developer/logs" active={active('/developer/logs')}>
            System Logs
          </DevNavLink>
          <DevNavLink href="/developer/database" active={active('/developer/database')}>
            Database
          </DevNavLink>
          <DevNavLink href="/developer/api" active={active('/developer/api')}>
            API Explorer
          </DevNavLink>

          <div
            className="px-4 mt-6 mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--brand-primary)', opacity: 0.5 }}
          >
            Diagnostics
          </div>
          <DevNavLink href="/developer/diagnostics" active={active('/developer/diagnostics')}>
            Federation Diagnostics
          </DevNavLink>

          <div
            className="px-4 mt-6 mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--brand-primary)', opacity: 0.5 }}
          >
            Configuration
          </div>
          <DevNavLink href="/developer/settings" active={active('/developer/settings')}>
            Settings
          </DevNavLink>
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
            DEVELOPER ACCESS
          </div>
          <form action="/api/developer/logout" method="post">
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

function DevNavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
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

