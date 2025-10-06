'use client';

import { useEffect } from 'react';
import { initTheme } from '@/lib/theme';

/**
 * Client-side theme initializer
 * 
 * This component runs on every page load to ensure the theme
 * is properly applied from localStorage/cookies.
 */
export function ThemeInit({ serverTheme }: { serverTheme: string }) {
  useEffect(() => {
    // Apply server theme immediately
    document.documentElement.setAttribute('data-theme', serverTheme);
    
    // Also check localStorage for any client-side overrides
    // This handles the case where theme was just changed
    const adminTheme = localStorage.getItem('rs_admin_theme');
    const clientTheme = localStorage.getItem('rs_client_theme');
    const localTheme = adminTheme || clientTheme;
    
    if (localTheme && localTheme !== serverTheme) {
      // Local theme differs from server, apply local theme
      document.documentElement.setAttribute('data-theme', localTheme);
    }
  }, [serverTheme]);

  return null;
}

