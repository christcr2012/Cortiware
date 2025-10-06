export type SeriesPoint = { t: string; v: number };
export type Series = { metric: string; points: SeriesPoint[] };

export const SERIES: Series[] = [
  { metric: 'incidents.open', points: [ { t: '2025-10-01', v: 3 }, { t: '2025-10-02', v: 4 } ] },
  { metric: 'billing.volume', points: [ { t: '2025-10-01', v: 1200 } ] },
];

