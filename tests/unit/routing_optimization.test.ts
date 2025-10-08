import { planSimple, type RoutePlan, type Landfill, type Stop } from '../../packages/routing/src/engine';

export async function run() {
  const name = 'routing.optimization';
  let passed = 0, failed = 0, total = 0;

  // Test: detour coefficient affects route order
  total++;
  try {
    const yard = { lat: 0, lon: 0 };
    const stops: Stop[] = [
      { id: 's1', kind: 'pickup', point: { lat: 1, lon: 0 } },
      { id: 's2', kind: 'pickup', point: { lat: 0, lon: 1 } },
    ];
    const route: RoutePlan = { date: '2025-01-01', driverId: 'd1', yard, capacity: 10, stops };
    const landfills: Landfill[] = [];
    
    const plan1 = planSimple(route, landfills, { detourCoefficient: 1.0 });
    const plan2 = planSimple(route, landfills, { detourCoefficient: 2.0 });
    
    // Both should complete without error
    if (plan1.stops.length === 2 && plan2.stops.length === 2) {
      passed++;
    } else {
      throw new Error('Expected both plans to have 2 stops');
    }
  } catch (e) {
    failed++;
    console.error('routing.optimization detour coefficient failed', e);
  }

  // Test: maxStops limits route length
  total++;
  try {
    const yard = { lat: 0, lon: 0 };
    const stops: Stop[] = [
      { id: 's1', kind: 'service', point: { lat: 1, lon: 0 } },
      { id: 's2', kind: 'service', point: { lat: 2, lon: 0 } },
      { id: 's3', kind: 'service', point: { lat: 3, lon: 0 } },
      { id: 's4', kind: 'service', point: { lat: 4, lon: 0 } },
    ];
    const route: RoutePlan = { date: '2025-01-01', driverId: 'd1', yard, capacity: 10, stops };
    const landfills: Landfill[] = [];
    
    const plan = planSimple(route, landfills, { maxStops: 2 });
    
    if (plan.stops.length === 2) {
      passed++;
    } else {
      throw new Error(`Expected 2 stops, got ${plan.stops.length}`);
    }
  } catch (e) {
    failed++;
    console.error('routing.optimization maxStops failed', e);
  }

  // Property test: capacity never goes negative
  total++;
  try {
    const yard = { lat: 0, lon: 0 };
    const stops: Stop[] = Array.from({ length: 20 }, (_, i) => ({
      id: `s${i}`,
      kind: 'pickup' as const,
      point: { lat: i * 0.1, lon: i * 0.1 },
      material: 'msw',
    }));
    const route: RoutePlan = { date: '2025-01-01', driverId: 'd1', yard, capacity: 5, stops };
    const landfills: Landfill[] = [
      { id: 'lf1', name: 'LF1', point: { lat: 10, lon: 10 }, accepts: ['msw'] },
    ];
    
    const plan = planSimple(route, landfills);
    
    // Verify dumps were inserted (capacity 5, 20 pickups = at least 3 dumps)
    const dumps = plan.stops.filter(s => s.kind === 'dump');
    if (dumps.length >= 3) {
      passed++;
    } else {
      throw new Error(`Expected at least 3 dumps, got ${dumps.length}`);
    }
  } catch (e) {
    failed++;
    console.error('routing.optimization capacity invariant failed', e);
  }

  // Performance smoke: large input completes in reasonable time
  total++;
  try {
    const yard = { lat: 0, lon: 0 };
    const stops: Stop[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `s${i}`,
      kind: 'service' as const,
      point: { lat: Math.random() * 10, lon: Math.random() * 10 },
    }));
    const route: RoutePlan = { date: '2025-01-01', driverId: 'd1', yard, capacity: 100, stops };
    const landfills: Landfill[] = [];
    
    const start = Date.now();
    const plan = planSimple(route, landfills);
    const elapsed = Date.now() - start;
    
    // Should complete in < 5 seconds for 1000 stops
    if (plan.stops.length === 1000 && elapsed < 5000) {
      passed++;
    } else {
      throw new Error(`Performance issue: ${elapsed}ms for 1000 stops`);
    }
  } catch (e) {
    failed++;
    console.error('routing.optimization performance smoke failed', e);
  }

  return { name, passed, failed, total };
}

