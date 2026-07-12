import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { ZoneManager } from "@/components/admin/ZoneManager";

export const metadata: Metadata = { title: "Delivery zones" };
export const dynamic = "force-dynamic";

export default async function AdminZonesPage() {
  await requireAdmin();
  const zones = await prisma.deliveryZone.findMany({ orderBy: { fee: "asc" } });
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-semibold">Delivery zones</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Customers pick a zone at checkout and the fee is added to their total.
      </p>
      <ZoneManager zones={zones.map((z) => ({ id: z.id, name: z.name, fee: z.fee }))} />
    </div>
  );
}
