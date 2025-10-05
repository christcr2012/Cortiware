'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Provider Developer Portal Shell
 * Part of provider-side system with masculine green theme
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
        background: 'linear-gradient(135deg, #0a0f0d 0%, #111816 100%)',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{ gridRow: '1 / span 2' }}
        className="border-r border-green-500/20 bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm"
      >
        <div className="h-20 flex items-center justify-center border-b border-green-500/20 px-4">
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Robinson Solutions
            </div>
            <div className="text-xs text-green-400/70 font-mono tracking-wider">DEVELOPER PORTAL</div>
          </div>
        </div>

        <nav className="py-4 text-sm">
          <div className="px-4 mb-2 text-xs font-semibold text-green-400/50 uppercase tracking-wider">
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

          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-green-400/50 uppercase tracking-wider">
            Diagnostics
          </div>
          <DevNavLink href="/developer/diagnostics" active={active('/developer/diagnostics')}>
            Federation Diagnostics
          </DevNavLink>
        </nav>
      </aside>

      <header
        className="border-b border-green-500/20"
        style={{
          background: 'linear-gradient(180deg, rgba(16,185,129,0.05), rgba(5,150,105,0.02))',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div className="h-20 px-6 flex items-center justify-between">
          <div className="text-sm text-green-400/70 font-mono">DEVELOPER ACCESS</div>
          <form action="/api/developer/logout" method="post">
            <button className="text-sm px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 rounded-lg transition-all font-mono hover:shadow-lg hover:shadow-green-500/20">
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
      className={`block px-4 py-2.5 transition-all ${
        active
          ? 'text-green-400 bg-green-500/10 border-l-4 border-green-500 shadow-lg shadow-green-500/10'
          : 'text-gray-400 hover:text-green-300 hover:bg-green-500/5 border-l-4 border-transparent'
      }`}
    >
      {children}
    </Link>
  );
}

