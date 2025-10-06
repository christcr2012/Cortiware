import { cookies } from 'next/headers';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage(props: any) {
  const sp = typeof props?.searchParams?.then === 'function' ? await props.searchParams : props?.searchParams;
  const token = sp?.t as string | undefined;

  // Public page – no auth required. If already logged-in tenant, you might redirect.
  // const jar = await cookies();
  // if (jar.get('rs_user') || jar.get('mv_user')) redirect('/');

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>Onboarding</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Create your organization owner account.</p>
      </header>
      <OnboardingClient token={token} />
    </div>
  );
}

