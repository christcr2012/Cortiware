export type Point = { lat: number; lon: number };
export type Landfill = { id: string; name: string; point: Point; accepts: string[] };
export type Stop = { id: string; kind: "drop"|"pickup"|"exchange"|"service"|"dump"; point: Point; assetType?: "rolloff"|"port-a-john"; size?: string; material?: string; preferredLandfillId?: string };
export type RoutePlan = { date: string; driverId: string; yard: Point; capacity: number; stops: Stop[] };
export type RoutingOptions = {
  detourCoefficient?: number; // multiplier for detour penalty (default 1.0)
  maxStops?: number; // max stops per route (default unlimited)
};
function dist(a: Point, b: Point) { const dx=a.lat-b.lat, dy=a.lon-b.lon; return Math.sqrt(dx*dx+dy*dy); }
export function chooseLandfill(stop: Stop, landfills: Landfill[], route: RoutePlan): Landfill | null {
  const candidates = landfills.filter(lf => !stop.material || lf.accepts.includes(stop.material!));
  if (!candidates.length) return null;
  // Respect preferred ID if provided and present among candidates
  if (stop.preferredLandfillId) {
    const preferred = candidates.find(lf => lf.id === stop.preferredLandfillId);
    if (preferred) return preferred;
  }
  // Phase-1 heuristic: closest to the stop (least detour proxy)
  return candidates.sort((a,b)=>dist(stop.point,a.point)-dist(stop.point,b.point))[0];
}
export function planSimple(route: RoutePlan, landfills: Landfill[], options?: RoutingOptions): RoutePlan {
  const opts = { detourCoefficient: 1.0, maxStops: Infinity, ...options };
  const out: RoutePlan = { ...route, stops: [] };
  let cap = route.capacity;
  const remaining = [...route.stops];
  let current = route.yard;
  while (remaining.length && out.stops.length < opts.maxStops) {
    // Sort by distance with detour coefficient applied
    remaining.sort((a,b)=>(dist(current,a.point)*opts.detourCoefficient!)-(dist(current,b.point)*opts.detourCoefficient!));
    const s = remaining.shift()!;
    out.stops.push(s);
    current = s.point;
    if (s.kind === "pickup" || s.kind === "exchange") {
      cap -= 1;
      if (cap <= 0) {
        const lf = chooseLandfill(s, landfills, out);
        if (lf) out.stops.push({ id: `dump-${Date.now()}`, kind: "dump", point: lf.point } as any);
        cap = route.capacity;
        current = lf ? lf.point : current;
      }
    }
  }
  return out;
}

