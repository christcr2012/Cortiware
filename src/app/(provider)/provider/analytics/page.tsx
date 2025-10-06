"use client";

import React from 'react';
import { SERIES } from "@/mocks/provider/analytics";
import { Sparkline } from "@/components/dev-aids/Sparkline";
import { ThemeSwitcher } from "@/components/dev-aids/ThemeSwitcher";

export default function ProviderAnalyticsPage() {
  return (
    <div style={{ padding: 24, display: 'grid', gap: 24 }}>
      <h1>Provider Analytics</h1>
      <ThemeSwitcher scope="admin" />
      <section>
        <h2>Overview</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {SERIES.map(s => (
            <div key={s.metric}>
              <div style={{ marginBottom: 6, fontSize: 12, color: '#aaa' }}>{s.metric}</div>
              <Sparkline data={s.points} />
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2>Raw Data</h2>
        <pre>{JSON.stringify(SERIES, null, 2)}</pre>
      </section>
    </div>
  );
}

