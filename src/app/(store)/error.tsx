"use client";

import { RefreshCcw, TriangleAlert } from "lucide-react";

export default function StoreError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4 pt-24 pb-16">
      <span className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <TriangleAlert className="size-7 text-destructive" strokeWidth={1.5} />
      </span>
      <h1 className="text-4xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-sm">
        Please try again. If it keeps happening, reach us on WhatsApp and we&apos;ll help.
      </p>
      <button
        onClick={reset}
        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-accent text-on-primary px-6 py-3 font-semibold cursor-pointer transition-all duration-200 hover:opacity-90 shadow-md min-h-11"
      >
        <RefreshCcw className="size-4" strokeWidth={1.75} />
        Try again
      </button>
    </div>
  );
}
