'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useMe } from '@/lib/useMe';
import type { BrandConfig } from '@/lib/types/me';

/**
 * Client-side shell for authenticated app pages
 * Uses client scope theme (controlled by Owner)
 * Respects the Owner's theme selection
 * Fully responsive with mobile hamburger menu
 */
export default function AppShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { org } = useMe();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const active = (p: string) => Boolean(pathname === p || pathname?.startsWith(p + '/'));

  // Extract brand config
  const brandConfig: BrandConfig = org?.brandConfig || {};
  const brandName = brandConfig.name || 'Robinson AI Systems';
  const brandLogoUrl = brandConfig.logoUrl;

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--bg-main)',
      }}
    >
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:transform-none ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          borderRight: '1px solid var(--border-primary)',
          background: 'var(--glass-bg)',
        }}
      >
        {/* Logo & Close Button */}
        <div
          className="h-16 sm:h-20 flex items-center justify-between px-4"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <Link href="/dashboard" aria-label="Home" className="block text-center flex-1">
            {brandLogoUrl ? (
              <img
                src={brandLogoUrl}
                alt={`${brandName} Logo`}
                className="h-12 sm:h-16 w-auto max-w-[140px] sm:max-w-[180px] mx-auto"
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
                className="h-12 sm:h-16 w-auto mx-auto"
              />
            )}
          </Link>
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden touch-target p-2"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="py-3 text-sm overflow-y-auto" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
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

      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30"
          style={{
            background: 'var(--glass-bg-light)',
            borderBottom: '1px solid var(--border-primary)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div className="h-16 sm:h-20 px-4 sm:px-6 flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden touch-target-comfortable p-2"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Brand Name */}
            <div className="text-base sm:text-lg font-semibold flex-1 lg:flex-none" style={{ color: 'var(--text-primary)' }}>
              {brandName}
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-3 sm:gap-4">
              <Link
                href="/profile"
                className="text-sm transition-colors touch-target px-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                Profile
              </Link>
              <form action="/api/auth/logout" method="post">
                <button
                  className="btn-secondary touch-target text-sm"
                >
                  Sign out
                </button>
              </form>
            </div>

            {/* Mobile Profile Icon */}
            <Link
              href="/profile"
              className="sm:hidden touch-target p-2"
              aria-label="Profile"
            >
              <svg className="w-6 h-6" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main style={{ background: 'var(--bg-secondary)', minHeight: 'calc(100vh - 5rem)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-3 transition-colors border-l-4 touch-target text-sm sm:text-base"
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

