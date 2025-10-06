'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AccountantShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = (p: string) => Boolean(pathname === p || pathname?.startsWith(p + '/'));

  return (
    <div
      className="min-h-screen grid"
      style={{
        gridTemplateColumns: '280px 1fr',
        gridTemplateRows: '80px 1fr',
        background: 'linear-gradient(135deg, #1a1a0a 0%, #2e2e1a 100%)',
      }}
    >
      <aside
        style={{ gridRow: '1 / span 2' }}
        className="border-r border-yellow-500/20 bg-gradient-to-b from-gray-900/50 to-black/50"
      >
        <div className="h-20 flex items-center justify-center border-b border-yellow-500/20 px-4">
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Robinson Solutions
            </div>
            <div className="text-xs text-yellow-400/70 font-mono tracking-wider">ACCOUNTANT PORTAL</div>
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
        className="border-b border-yellow-500/20"
        style={{
          background: 'linear-gradient(180deg, rgba(234,179,8,0.05), rgba(202,138,4,0.02))',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="h-20 px-6 flex items-center justify-between">
          <div className="text-sm text-yellow-400/70 font-mono">ACCOUNTANT ACCESS</div>
          <form action="/api/accountant/logout" method="post">
            <button className="text-sm px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-500/30 rounded-lg transition-all font-mono">
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
      className={`block px-4 py-2.5 transition-all ${
        active
          ? 'text-yellow-400 bg-yellow-500/10 border-l-4 border-yellow-500'
          : 'text-gray-400 hover:text-yellow-300 hover:bg-yellow-500/5 border-l-4 border-transparent'
      }`}
    >
      {children}
    </Link>
  );
}

