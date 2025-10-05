import { NextRequest, NextResponse } from 'next/server';

const builtinThemes = [
  { id: 'rs-futuristic-green', name: 'Futuristic Green (Provider)', accent: '#10b981' },
  { id: 'rs-tenant-blue', name: 'Tenant Blue', accent: '#3b82f6' },
  { id: 'rs-dev-purple', name: 'Developer Purple', accent: '#a855f7' },
  { id: 'rs-accountant-amber', name: 'Accountant Amber', accent: '#f59e0b' },
];

export async function GET(_req: NextRequest) {
  return NextResponse.json({ ok: true, themes: builtinThemes });
}

