import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { fee: "asc" } });
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 w-full pt-24 pb-16 sm:pb-20">
      <h1 className="text-4xl sm:text-5xl font-semibold">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        Pay securely with MTN MoMo, Telecel Cash, AT Money or card.
      </p>
      <CheckoutForm zones={zones.map((z) => ({ id: z.id, name: z.name, fee: z.fee }))} />
    </div>
  );
}
