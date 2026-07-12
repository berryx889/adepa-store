"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/admin/actions";

export function DeleteProductButton({ productId, name }: { productId: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result.error) setMessage(result.error);
    });
  }

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 cursor-pointer transition-colors disabled:opacity-50"
        aria-label={`Delete ${name}`}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
        ) : (
          <Trash2 className="size-4" strokeWidth={1.75} />
        )}
      </button>
      {message && (
        <p role="status" className="text-xs text-accent mt-1 max-w-40 text-right">
          {message}
        </p>
      )}
    </>
  );
}
