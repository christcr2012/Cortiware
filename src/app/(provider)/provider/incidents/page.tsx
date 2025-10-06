import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getIncidentSummary, getSlaMetrics } from '@/services/provider/incidents.service';

export default async function ProviderIncidentsPage() {
  const jar = await cookies();
  if (!jar.get('rs_provider') && !jar.get('provider-session') && !jar.get('ws_provider')) {
    redirect('/provider/login');
  }

  const [summary, slaMetrics] = await Promise.all([
    getIncidentSummary(),
    getSlaMetrics(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
          Incidents & SLA
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Open/resolved queues, SLA compliance, and escalations
        </p>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Open</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            {summary.totalOpen}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Resolved</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
            {summary.totalResolved}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Escalated</div>
          <div className="text-3xl font-bold mt-2" style={{ color: '#ff6b6b' }}>
            {summary.totalEscalated}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Avg Resolution</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            {summary.avgResolutionTimeHours.toFixed(1)}h
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>SLA Breaches</div>
          <div className="text-3xl font-bold mt-2" style={{ color: '#ff6b6b' }}>
            {summary.slaBreaches}
          </div>
        </div>
      </div>

      {/* SLA Compliance */}
      <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>SLA Compliance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Incidents</div>
            <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              {slaMetrics.totalIncidents}
            </div>
          </div>
          <div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Within SLA</div>
            <div className="text-2xl font-bold mt-1" style={{ color: 'var(--brand-primary)' }}>
              {slaMetrics.withinSla}
            </div>
          </div>
          <div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Compliance Rate</div>
            <div className="text-2xl font-bold mt-1" style={{ color: 'var(--brand-primary)' }}>
              {slaMetrics.complianceRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Notice */}
      <div
        className="rounded-xl p-8 text-center"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-accent)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="text-6xl mb-4">🎫</div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--brand-primary)' }}>Incident Tracking System</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Full incident management features will be available here.
          <br />
          Currently showing summary metrics from Activity records.
        </p>
      </div>
    </div>
  );
}

