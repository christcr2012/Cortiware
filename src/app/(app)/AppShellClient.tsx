'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useMe } from '@/lib/useMe';
import type { BrandConfig } from '@/lib/types/me';

/**
 * Client-side shell for authenticated app pages
 * Provides sidebar navigation and top bar
 */
export default function AppShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { org } = useMe();
  const active = (p: string) => Boolean(pathname === p || pathname?.startsWith(p + '/'));

  // Extract brand config
  const brandConfig: BrandConfig = org?.brandConfig || {};
  const brandName = brandConfig.name || 'Robinson Solutions';
  const brandLogoUrl = brandConfig.logoUrl;
  const rawBrandColor = brandConfig.color;

  // Validate color
  const validateColor = (color: string | undefined): string | null => {
    if (!color) return null;
    const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
    const namedColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'gray', 'black', 'white'];
    if (hexPattern.test(color)) return color;
    if (namedColors.includes(color.toLowerCase())) return color;
    return null;
  };

  const brandColor = validateColor(rawBrandColor);

  // Dynamic styles
  const dynamicStyles: React.CSSProperties & Record<string, string> = {};
  if (brandColor) {
    dynamicStyles['--brand'] = brandColor;
    dynamicStyles['--brand-2'] = brandColor;
    if (brandColor.startsWith('#')) {
      let hex = brandColor.slice(1);
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        dynamicStyles['--ring'] = `rgba(${r}, ${g}, ${b}, 0.27)`;
      }
    }
  }

  return (
    <div
      className="min-h-screen grid"
      style={{
        gridTemplateColumns: '260px 1fr',
        gridTemplateRows: '80px 1fr',
        ...dynamicStyles,
      }}
    >
      {/* Sidebar */}
      <aside style={{ gridRow: '1 / span 2' }} className="border-r border-white/10 bg-gray-900">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-white/10 px-4">
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
        className="border-b border-white/10"
        style={{
          background: 'linear-gradient(180deg, rgba(17,24,39,0.8), rgba(31,41,55,0.8))',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div className="h-20 px-6 flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-100">{brandName}</div>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-sm text-gray-300 hover:text-white transition-colors">
              Profile
            </Link>
            <form action="/api/auth/logout" method="post">
              <button className="text-sm px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 bg-gray-950">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`block px-4 py-2 transition-colors ${
        active ? 'text-white bg-blue-600/20 border-l-4 border-blue-500' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
      }`}
    >
      {children}
    </Link>
  );
}

