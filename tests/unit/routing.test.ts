import { planSimple, chooseLandfill, type Landfill, type RoutePlan, type Stop } from '../../packages/routing/src/engine';

export async function run() {
  const name = 'routing';
  let passed = 0, failed = 0, total = 0;
  function assert(cond: any, msg: string) { total++; if (cond) passed++; else { failed++; console.error(`[FAIL] ${name}: ${msg}`); } }

  const yard = { lat: 39.5, lon: -104.9 };
  const landfills: Landfill[] = [
    { id: 'LF1', name: 'North', point: { lat: 39.8, lon: -105.0 }, accepts: ['msw', 'c&d'] },
    { id: 'LF2', name: 'East',  point: { lat: 39.6, lon: -104.6 }, accepts: ['msw'] },
  ];

  // 1) Capacity-triggered dump insertion
  {
    const route: RoutePlan = {
      date: '2025-10-07', driverId: 'D1', yard, capacity: 1,
      stops: [
        { id: 'S1', kind: 'pickup', point: { lat: 39.55, lon: -104.95 }, material: 'msw' },
        { id: 'S2', kind: 'pickup', point: { lat: 39.58, lon: -104.92 }, material: 'msw' },
      ] as Stop[],
    };
    const out = planSimple(route, landfills);
    const kinds = out.stops.map(s => s.kind);
    assert(kinds.includes('dump'), 'should insert a dump stop when capacity hits zero');
    // Ensure dump inserted before the second pickup (resetting capacity)
    const i1 = kinds.indexOf('pickup');
    const idump = kinds.indexOf('dump');
    const i2 = kinds.lastIndexOf('pickup');
    assert(i1 !== -1 && idump !== -1 && i2 !== -1 && i1 < idump && idump < i2, 'dump should be between pickups');
  }

  // 2) Landfill choice respects material and preferred ID
  {
    const stop: Stop = { id: 'S3', kind: 'pickup', point: { lat: 39.56, lon: -104.91 }, material: 'msw', preferredLandfillId: 'LF2' };
    const chosen = chooseLandfill(stop, landfills, { date: '', driverId: '', yard, capacity: 1, stops: [] });
    assert(!!chosen, 'should choose a landfill');
    assert(chosen!.id === 'LF2', 'should honor preferredLandfillId when valid among candidates');
  }

  return { name, passed, failed, total };
}

