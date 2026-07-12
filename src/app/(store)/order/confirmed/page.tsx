import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/store/OrderConfirmation";

export const metadata: Metadata = { title: "Order confirmed" };

export default function OrderConfirmedPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 w-full pt-24 pb-16 sm:pb-20">
      <Suspense
        fallback={<div className="skeleton h-64 rounded-xl" aria-label="Loading order" />}
      >
        <OrderConfirmation />
      </Suspense>
    </div>
  );
}
