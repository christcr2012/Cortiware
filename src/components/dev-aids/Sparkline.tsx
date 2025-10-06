"use client";

import React from 'react';

export function Sparkline({ data, width=200, height=60 }: { data: Array<{ t: string; v: number }>; width?: number; height?: number }) {
  if (!data || data.length === 0) return <svg width={width} height={height}/>;
  const values = data.map(d=>d.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / Math.max(1, data.length - 1);
  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - ((d.v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: 6 }}>
      <polyline fill="none" stroke="var(--accent, #00ff88)" strokeWidth="2" points={points} />
    </svg>
  );
}

