import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emergency Access | Cortiware',
};

export default function EmergencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-600 text-white">
        <div className="mx-auto max-w-3xl px-4 py-3 text-sm">
          <strong className="font-semibold">Emergency Access Mode</strong>
          <span className="ml-2 opacity-90">
            Use only when federation is unavailable.
          </span>
        </div>
      </div>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}

