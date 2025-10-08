export type Point = { lat: number; lon: number };
export type Landfill = { id: string; name: string; point: Point; accepts: string[] };
export type Stop = { id: string; kind: "drop"|"pickup"|"exchange"|"service"|"dump"; point: Point; assetType?: "rolloff"|"port-a-john"; size?: string; material?: string; preferredLandfillId?: string };
export type RoutePlan = { date: string; driverId: string; yard: Point; capacity: number; stops: Stop[] };
function dist(a: Point, b: Point) { const dx=a.lat-b.lat, dy=a.lon-b.lon; return Math.sqrt(dx*dx+dy*dy); }
export function chooseLandfill(stop: Stop, landfills: Landfill[], route: RoutePlan): Landfill | null {
  const c = landfills.filter(lf => !stop.material || lf.accepts.includes(stop.material!));
  if (!c.length) return null;
  return c.sort((a,b)=>dist(stop.point,a.point)-dist(stop.point,b.point))[0];
}
export function planSimple(route: RoutePlan, landfills: Landfill[]): RoutePlan {
  const out: RoutePlan = { ...route, stops: [] };
  let cap = route.capacity;
  const remaining = [...route.stops];
  let current = route.yard;
  while (remaining.length) {
    remaining.sort((a,b)=>dist(current,a.point)-dist(current,b.point));
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
