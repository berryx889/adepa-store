import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, MapPin, MessageSquare, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { formatGHS } from "@/lib/money";
import { displayGhanaPhone } from "@/lib/phone";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrderActions } from "@/components/admin/OrderActions";

export const metadata: Metadata = { title: "Order detail" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, deliveryZone: true },
  });
  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="size-4" strokeWidth={2} />
        All orders
      </Link>

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <h1 className="text-3xl sm:text-4xl font-semibold tabular-nums">{order.orderNumber}</h1>
        <OrderStatusBadge kind="payment" value={order.paymentStatus} />
        <OrderStatusBadge kind="status" value={order.status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Placed{" "}
        {order.createdAt.toLocaleString("en-GH", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-xl bg-white shadow-md p-5">
            <h2 className="text-lg font-semibold">Items</h2>
            <ul className="mt-3 divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 py-2.5 text-sm">
                  <span>
                    {item.nameSnapshot}{" "}
                    <span className="text-muted-foreground">×{item.quantity}</span>
                  </span>
                  <span className="tabular-nums">
                    {formatGHS(item.priceSnapshot * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 pt-3 border-t border-border space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatGHS(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery ({order.deliveryZone.name})</dt>
                <dd className="tabular-nums">{formatGHS(order.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-border text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatGHS(order.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl bg-white shadow-md p-5">
            <h2 className="text-lg font-semibold">Customer</h2>
            <div className="mt-3 space-y-2.5 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4 shrink-0" strokeWidth={1.75} />
                <a
                  href={`tel:${order.phone}`}
                  className="tabular-nums hover:text-accent transition-colors cursor-pointer"
                >
                  {displayGhanaPhone(order.phone)}
                </a>
              </p>
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="size-4 shrink-0 mt-0.5" strokeWidth={1.75} />
                {order.address} — {order.deliveryZone.name}
              </p>
              {order.note && (
                <p className="flex items-start gap-2 text-muted-foreground">
                  <MessageSquare className="size-4 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span className="italic">“{order.note}”</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <OrderActions
          orderId={order.id}
          status={order.status}
          paymentStatus={order.paymentStatus}
          hasPaystackRef={Boolean(order.paystackReference)}
        />
      </div>
    </div>
  );
}
