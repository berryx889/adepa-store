import Link from "next/link";
import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { formatGHS } from "@/lib/money";
import { displayGhanaPhone } from "@/lib/phone";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_FILTERS = [
  { value: "", label: "Any payment" },
  { value: "PAID", label: "Paid" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "REFUNDED", label: "Refunded" },
];

function filterUrl(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/admin/orders?${s}` : "/admin/orders";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; payment?: string; date?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const where: Prisma.OrderWhereInput = {};
  if (sp.status && STATUS_FILTERS.some((f) => f.value === sp.status)) {
    where.status = sp.status as Prisma.OrderWhereInput["status"];
  }
  if (sp.payment && PAYMENT_FILTERS.some((f) => f.value === sp.payment)) {
    where.paymentStatus = sp.payment as Prisma.OrderWhereInput["paymentStatus"];
  }
  if (sp.date) {
    const day = new Date(sp.date);
    if (!Number.isNaN(day.getTime())) {
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      where.createdAt = { gte: day, lt: next };
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: { deliveryZone: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-semibold">Orders</h1>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={filterUrl({ status: f.value || undefined, payment: sp.payment, date: sp.date })}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors duration-200 cursor-pointer",
              (sp.status ?? "") === f.value
                ? "bg-primary text-on-primary border-primary"
                : "border-border bg-white hover:border-primary"
            )}
          >
            {f.label}
          </Link>
        ))}
        <span className="mx-1 h-5 w-px bg-border hidden sm:block" aria-hidden="true" />
        {PAYMENT_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={filterUrl({ payment: f.value || undefined, status: sp.status, date: sp.date })}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors duration-200 cursor-pointer",
              (sp.payment ?? "") === f.value
                ? "bg-primary text-on-primary border-primary"
                : "border-border bg-white hover:border-primary"
            )}
          >
            {f.label}
          </Link>
        ))}
        <form action="/admin/orders" className="flex items-center gap-2 ml-auto">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          {sp.payment && <input type="hidden" name="payment" value={sp.payment} />}
          <label htmlFor="order-date" className="text-sm text-muted-foreground">
            Date
          </label>
          <input
            id="order-date"
            type="date"
            name="date"
            defaultValue={sp.date ?? ""}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm cursor-pointer transition-colors focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary text-on-primary px-3.5 py-1.5 text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
          >
            Filter
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-center py-12">
          <span className="size-16 rounded-full bg-muted flex items-center justify-center">
            <ShoppingCart className="size-7 text-muted-foreground" strokeWidth={1.5} />
          </span>
          <p className="text-muted-foreground">No orders match these filters.</p>
        </div>
      ) : (
        <div className="mt-6 rounded-xl bg-white shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3 pl-4 pr-4 font-semibold">Order</th>
                  <th className="py-3 pr-4 font-semibold">Date</th>
                  <th className="py-3 pr-4 font-semibold">Customer</th>
                  <th className="py-3 pr-4 font-semibold">Items</th>
                  <th className="py-3 pr-4 font-semibold">Total</th>
                  <th className="py-3 pr-4 font-semibold">Payment</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 pl-4 pr-4">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-semibold tabular-nums hover:text-accent transition-colors cursor-pointer"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
                      {o.createdAt.toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="py-2.5 pr-4">
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {displayGhanaPhone(o.phone)}
                      </p>
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground tabular-nums">
                      {o.items.reduce((n, i) => n + i.quantity, 0)}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums">{formatGHS(o.total)}</td>
                    <td className="py-2.5 pr-4">
                      <OrderStatusBadge kind="payment" value={o.paymentStatus} />
                    </td>
                    <td className="py-2.5 pr-4">
                      <OrderStatusBadge kind="status" value={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
