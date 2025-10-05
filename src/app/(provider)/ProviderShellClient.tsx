'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Provider Portal Shell - SEPARATE from client AppShell
 * 
 * CRITICAL: This is for PROVIDER users only
 * - No client navigation (no Leads, Contacts, etc.)
 * - No useMe() hook (providers are not in database)
 * - No RBAC checks (providers have full access)
 * - Futuristic green accent theme for provider portal
 */
export default function ProviderShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = (p: string) => Boolean(pathname === p || pathname?.startsWith(p + '/'));

  return (
    <div
      className="min-h-screen grid"
      style={{
        gridTemplateColumns: '280px 1fr',
        gridTemplateRows: '80px 1fr',
        background: 'linear-gradient(135deg, #0a0f0d 0%, #111816 100%)',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{ gridRow: '1 / span 2' }}
        className="border-r border-green-500/20 bg-gradient-to-b from-gray-950/80 to-black/80 backdrop-blur-md"
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-green-500/20 px-4">
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Robinson Solutions
            </div>
            <div className="text-xs text-green-400/70 font-mono tracking-wider">PROVIDER PORTAL</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="py-4 text-sm">
          <div className="px-4 mb-2 text-xs font-semibold text-green-400/50 uppercase tracking-wider">
            Management
          </div>
          <ProviderNavLink href="/provider" active={active('/provider') && pathname === '/provider'}>
            Dashboard
          </ProviderNavLink>
          <ProviderNavLink href="/provider/clients" active={active('/provider/clients')}>
            Client Accounts
          </ProviderNavLink>
          <ProviderNavLink href="/provider/billing" active={active('/provider/billing')}>
            Billing & Revenue
          </ProviderNavLink>
          <ProviderNavLink href="/provider/analytics" active={active('/provider/analytics')}>
            Analytics
          </ProviderNavLink>

          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-green-400/50 uppercase tracking-wider">
            System
          </div>
          <ProviderNavLink href="/provider/federation" active={active('/provider/federation')}>
            Federation
          </ProviderNavLink>
          <ProviderNavLink href="/provider/settings" active={active('/provider/settings')}>
            Settings
          </ProviderNavLink>
        </nav>
      </aside>

      {/* Top bar */}
      <header
        className="border-b border-green-500/20"
        style={{
          background: 'linear-gradient(180deg, rgba(16,185,129,0.05), rgba(5,150,105,0.02))',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div className="h-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <div className="text-sm text-green-400/70 font-mono">PROVIDER ACCESS</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Cross-Client Management
            </div>
            <form action="/api/provider/logout" method="post">
              <button className="text-sm px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 rounded-lg transition-all font-mono">
                LOGOUT
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function ProviderNavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`block px-4 py-2.5 transition-all font-medium ${
        active
          ? 'text-green-400 bg-green-500/10 border-l-4 border-green-500 shadow-lg shadow-green-500/20'
          : 'text-gray-400 hover:text-green-300 hover:bg-green-500/5 border-l-4 border-transparent'
      }`}
    >
      {children}
    </Link>
  );
}

