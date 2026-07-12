"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, MessageSquare, PackageSearch } from "lucide-react";
import { formatGHS } from "@/lib/money";
import { Button } from "@/components/ui/Button";

type TrackedOrder = {
  orderNumber: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  zone: string;
  items: Array<{ name: string; price: number; quantity: number }>;
};

const POLL_INTERVAL = 4000;
const POLL_MAX = 15; // ~1 minute, then show "still waiting" state

export function OrderConfirmation() {
  const params = useSearchParams();
  const orderNumber = params.get("n") ?? "";
  const phone = params.get("p") ?? "";
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const polls = useRef(0);

  const fetchOrder = useCallback(async () => {
    const res = await fetch(
      `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`
    );
    const json = await res.json();
    if (json.ok) {
      setOrder(json.order);
      return json.order as TrackedOrder;
    }
    setError(json.error ?? "Order not found");
    return null;
  }, [orderNumber, phone]);

  useEffect(() => {
    if (!orderNumber || !phone) {
      setError("Missing order details");
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    async function poll() {
      const o = await fetchOrder();
      if (cancelled) return;
      // The webhook is the source of truth — keep polling until it lands.
      if (o && o.paymentStatus !== "PAID" && polls.current < POLL_MAX) {
        polls.current += 1;
        timer = setTimeout(poll, POLL_INTERVAL);
      }
    }
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderNumber, phone, fetchOrder]);

  if (error) {
    return (
      <div className="text-center py-12">
        <span className="mx-auto size-16 rounded-full bg-muted flex items-center justify-center">
          <PackageSearch className="size-7 text-muted-foreground" strokeWidth={1.5} />
        </span>
        <h1 className="mt-4 text-3xl font-semibold">We can&apos;t find that order</h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button href="/track" variant="secondary" size="sm" className="mt-6">
          Track an order
        </Button>
      </div>
    );
  }

  if (!order) {
    return <div className="skeleton h-64 rounded-xl" aria-label="Loading order" />;
  }

  const paid = order.paymentStatus === "PAID";

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <span
          className={`mx-auto size-16 rounded-full flex items-center justify-center ${
            paid ? "bg-success/10" : "bg-accent/10"
          }`}
        >
          {paid ? (
            <CheckCircle2 className="size-8 text-success" strokeWidth={1.75} />
          ) : (
            <Clock className="size-8 text-accent" strokeWidth={1.75} />
          )}
        </span>
        <h1 className="mt-4 text-4xl font-semibold">
          {paid ? "Order confirmed" : "Order received"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Order number{" "}
          <span className="font-semibold text-foreground tabular-nums">{order.orderNumber}</span>
        </p>
        {!paid && (
          <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
            Waiting for payment confirmation… this can take a moment.
          </p>
        )}
      </motion.div>

      <div className="mt-8 rounded-xl bg-white shadow-md p-6">
        <h2 className="text-xl font-semibold">Summary</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span>
                {item.name} <span className="text-muted-foreground">×{item.quantity}</span>
              </span>
              <span className="tabular-nums">{formatGHS(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 pt-4 border-t border-border space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatGHS(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery ({order.zone})</dt>
            <dd className="tabular-nums">{formatGHS(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between pt-2 border-t border-border text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatGHS(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl bg-accent/10 p-4 text-sm">
        <MessageSquare className="size-5 text-accent shrink-0 mt-0.5" strokeWidth={1.75} />
        <p>
          You will receive an SMS confirmation shortly. You can also{" "}
          <Link href="/track" className="font-semibold text-accent hover:underline cursor-pointer">
            track your order
          </Link>{" "}
          any time with your order number and phone.
        </p>
      </div>

      <div className="mt-8 text-center">
        <Button href="/shop" variant="secondary">
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
