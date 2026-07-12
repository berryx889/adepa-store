"use client";

import { useState, useTransition } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";
import { updateOrderStatus, verifyOrderPayment } from "@/app/admin/actions";
import { cn } from "@/lib/cn";

const FLOW: Array<{ value: "PENDING" | "CONFIRMED" | "OUT_FOR_DELIVERY" | "DELIVERED"; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { value: "DELIVERED", label: "Delivered" },
];

export function OrderActions({
  orderId,
  status,
  paymentStatus,
  hasPaystackRef,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
  hasPaystackRef: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  function setStatus(value: (typeof FLOW)[number]["value"] | "CANCELLED") {
    setMessage(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, value);
      if (!result.ok) setMessage({ kind: "error", text: result.error ?? "Update failed" });
      else if (value === "OUT_FOR_DELIVERY" || value === "DELIVERED")
        setMessage({ kind: "ok", text: "Status updated — customer notified by SMS." });
    });
  }

  function verify() {
    setMessage(null);
    startTransition(async () => {
      const result = await verifyOrderPayment(orderId);
      setMessage(
        result.ok
          ? { kind: "ok", text: "Payment verified with Paystack." }
          : { kind: "error", text: result.error ?? "Verification failed" }
      );
    });
  }

  const currentIndex = FLOW.findIndex((s) => s.value === status);
  const cancelled = status === "CANCELLED";

  return (
    <aside className="h-fit rounded-xl bg-white shadow-md p-5 lg:sticky lg:top-8">
      <h2 className="text-lg font-semibold">Update status</h2>
      {cancelled ? (
        <p className="mt-3 rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">
          This order was cancelled.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {FLOW.map((step, i) => {
            const isCurrent = step.value === status;
            const isNext = i === currentIndex + 1;
            return (
              <button
                key={step.value}
                onClick={() => setStatus(step.value)}
                disabled={pending || isCurrent}
                className={cn(
                  "w-full text-left rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-200",
                  isCurrent
                    ? "bg-primary text-on-primary border-primary cursor-default"
                    : isNext
                      ? "border-accent text-accent hover:bg-accent hover:text-on-primary cursor-pointer"
                      : "border-border text-muted-foreground hover:border-primary hover:text-foreground cursor-pointer",
                  pending && "opacity-60"
                )}
                aria-pressed={isCurrent}
              >
                {step.label}
                {isCurrent && " (current)"}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border space-y-2">
        {paymentStatus !== "PAID" && hasPaystackRef && (
          <button
            onClick={verify}
            disabled={pending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-on-primary px-4 py-2.5 text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            ) : (
              <BadgeCheck className="size-4" strokeWidth={1.75} />
            )}
            Verify payment with Paystack
          </button>
        )}
        {!cancelled && status !== "DELIVERED" && (
          <button
            onClick={() => {
              if (window.confirm("Cancel this order?")) setStatus("CANCELLED");
            }}
            disabled={pending}
            className="w-full rounded-lg border border-destructive/40 text-destructive px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-destructive/5 transition-colors disabled:opacity-60"
          >
            Cancel order
          </button>
        )}
      </div>

      {message && (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className={cn(
            "mt-3 rounded-lg text-sm px-4 py-3",
            message.kind === "ok"
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {message.text}
        </p>
      )}
    </aside>
  );
}
