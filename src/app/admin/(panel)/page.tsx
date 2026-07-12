import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, ArrowRight, Banknote, Clock, ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { formatGHS } from "@/lib/money";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

export const metadata: Metadata = { title: "Admin dashboard" };
export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminDashboard() {
  await requireAdmin();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7)); // Monday
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayOrders, pendingCount, weekRevenue, monthRevenue, lowStock, recentOrders] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID", createdAt: { gte: startOfWeek } },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID", createdAt: { gte: startOfMonth } },
      }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
        orderBy: { stock: "asc" },
        take: 6,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { deliveryZone: true },
      }),
    ]);

  const stats = [
    { label: "Orders today", value: String(todayOrders), icon: ShoppingCart },
    { label: "Pending orders", value: String(pendingCount), icon: Clock },
    {
      label: "Revenue this week",
      value: formatGHS(weekRevenue._sum.total ?? 0),
      icon: Banknote,
    },
    {
      label: "Revenue this month",
      value: formatGHS(monthRevenue._sum.total ?? 0),
      icon: Banknote,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white shadow-md p-5">
            <div className="flex items-center gap-3">
              <span className="size-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <stat.icon className="size-5 text-accent" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-semibold tabular-nums truncate">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="mt-6 rounded-xl bg-white shadow-md p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-accent" strokeWidth={1.75} />
            <h2 className="text-lg font-semibold">Low stock</h2>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5 gap-3">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="text-sm font-medium hover:text-accent transition-colors cursor-pointer truncate"
                >
                  {p.name}
                </Link>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    p.stock === 0 ? "text-destructive" : "text-accent"
                  }`}
                >
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-xl bg-white shadow-md p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:gap-2 transition-all cursor-pointer"
          >
            All orders <ArrowRight className="size-4" strokeWidth={2} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground py-6 text-center">
            No orders yet — they&apos;ll show up here as customers check out.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4 font-semibold">Order</th>
                  <th className="py-2 pr-4 font-semibold">Customer</th>
                  <th className="py-2 pr-4 font-semibold">Zone</th>
                  <th className="py-2 pr-4 font-semibold">Total</th>
                  <th className="py-2 pr-4 font-semibold">Payment</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-semibold tabular-nums hover:text-accent transition-colors cursor-pointer"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4">{o.customerName}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{o.deliveryZone.name}</td>
                    <td className="py-2.5 pr-4 tabular-nums">{formatGHS(o.total)}</td>
                    <td className="py-2.5 pr-4">
                      <OrderStatusBadge kind="payment" value={o.paymentStatus} />
                    </td>
                    <td className="py-2.5">
                      <OrderStatusBadge kind="status" value={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
