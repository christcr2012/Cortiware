import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Emergency Access | Cortiware',
};

export default async function EmergencyLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const isEmergency = store.get('rs_emergency')?.value === '1';
  const role = store.get('rs_emergency_role')?.value;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-600 text-white">
        <div className="mx-auto max-w-3xl px-4 py-3 text-sm">
          <strong className="font-semibold">Emergency Access Mode</strong>
          <span className="ml-2 opacity-90">
            {isEmergency ? `Active${role ? ` • ${role}` : ''}` : 'Use only when federation is unavailable.'}
          </span>
        </div>
      </div>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}

