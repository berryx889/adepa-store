"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  PackageCheck,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { formatGHS } from "@/lib/money";
import { isValidGhanaPhone } from "@/lib/phone";
import { cn } from "@/lib/cn";

type TrackedOrder = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  zone: string;
  createdAt: string;
  items: Array<{ name: string; price: number; quantity: number }>;
};

const STATUS_STEPS = [
  { key: "PENDING", label: "Pending", icon: CircleDashed },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: PackageCheck },
];

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    if (!orderNumber.trim()) {
      setError("Enter your order number, e.g. ORD-2026-0001");
      return;
    }
    if (!isValidGhanaPhone(phone)) {
      setError("Enter the Ghana phone number you used at checkout");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone)}`
      );
      const json = await res.json();
      if (json.ok) setOrder(json.order);
      else setError(json.error ?? "Order not found");
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const cancelled = order?.status === "CANCELLED";
  const stepIndex = order ? STATUS_STEPS.findIndex((s) => s.key === order.status) : -1;

  return (
    <div className="mt-8">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-xl bg-white shadow-md p-6 space-y-4"
      >
        <div>
          <label htmlFor="track-number" className="block text-sm font-semibold mb-1.5">
            Order number
          </label>
          <input
            id="track-number"
            placeholder="ORD-2026-0001"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base uppercase transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
          />
        </div>
        <div>
          <label htmlFor="track-phone" className="block text-sm font-semibold mb-1.5">
            Phone number
          </label>
          <input
            id="track-phone"
            type="tel"
            inputMode="tel"
            placeholder="024 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
          />
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-on-primary px-6 py-3.5 font-semibold cursor-pointer transition-all duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed min-h-12"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" strokeWidth={2} />
          ) : (
            <Search className="size-5" strokeWidth={1.75} />
          )}
          {loading ? "Looking up…" : "Track order"}
        </button>
      </form>

      <AnimatePresence>
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 rounded-xl bg-white shadow-md p-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-semibold tabular-nums">{order.orderNumber}</h2>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  order.paymentStatus === "PAID"
                    ? "bg-success/10 text-success"
                    : "bg-accent/10 text-accent"
                )}
              >
                {order.paymentStatus === "PAID" ? "Paid" : "Payment pending"}
              </span>
            </div>

            {cancelled ? (
              <div className="mt-5 flex items-center gap-3 rounded-lg bg-destructive/10 text-destructive px-4 py-3">
                <XCircle className="size-5 shrink-0" strokeWidth={1.75} />
                <p className="text-sm font-medium">This order was cancelled.</p>
              </div>
            ) : (
              <ol className="mt-6 space-y-0" aria-label="Order progress">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= stepIndex;
                  const isLast = i === STATUS_STEPS.length - 1;
                  return (
                    <li key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
                      {!isLast && (
                        <span
                          className={cn(
                            "absolute left-[15px] top-8 bottom-0 w-0.5",
                            i < stepIndex ? "bg-success" : "bg-border"
                          )}
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={cn(
                          "size-8 rounded-full flex items-center justify-center shrink-0 z-10",
                          done ? "bg-success text-on-primary" : "bg-muted text-muted-foreground"
                        )}
                      >
                        <step.icon className="size-4" strokeWidth={2} />
                      </span>
                      <div className="pt-1">
                        <p className={cn("text-sm font-semibold", !done && "text-muted-foreground")}>
                          {step.label}
                        </p>
                        {i === stepIndex && (
                          <p className="text-xs text-muted-foreground mt-0.5">Current status</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <dl className="mt-6 pt-4 border-t border-border space-y-1.5 text-sm">
              {order.items.map((item, i) => (
                <div className="flex justify-between" key={i}>
                  <dt className="text-muted-foreground">
                    {item.name} ×{item.quantity}
                  </dt>
                  <dd className="tabular-nums">{formatGHS(item.price * item.quantity)}</dd>
                </div>
              ))}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery ({order.zone})</dt>
                <dd className="tabular-nums">{formatGHS(order.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-border text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatGHS(order.total)}</dd>
              </div>
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
