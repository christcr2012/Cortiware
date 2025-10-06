import { prisma } from "@/lib/prisma";

export async function getUsageSummary(orgId: string) {
  const total = await prisma.usageMeter.aggregate({ _sum: { quantity: true }, where: { orgId } });
  return { totalQuantity: Number(total._sum.quantity ?? 0) };
}

export async function exportUsageCsv(orgId: string): Promise<string> {
  // Placeholder CSV for Sonnet wiring; replace with real aggregation as needed
  const rows = await prisma.usageMeter.findMany({
    where: { orgId },
    orderBy: { windowStart: "asc" as any },
    take: 1000,
    select: { windowStart: true, meter: true, quantity: true },
  });
  const header = "timestamp,meter,quantity";
  const lines = rows.map(r => `${r.windowStart.toISOString()},${r.meter},${r.quantity}`);
  return [header, ...lines].join("\n");
}

