import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/store/TrackOrderForm";

export const metadata: Metadata = { title: "Track your order" };

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 w-full pt-24 pb-16 sm:pb-20">
      <h1 className="text-4xl sm:text-5xl font-semibold">Track your order</h1>
      <p className="mt-2 text-muted-foreground">
        Enter your order number and the phone number you used at checkout.
      </p>
      <TrackOrderForm />
    </div>
  );
}
