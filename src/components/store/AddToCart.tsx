"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/cn";

type Variant = { id: string; name: string; stockOverride: number | null };

export function AddToCart({
  productId,
  slug,
  name,
  price,
  image,
  stock,
  variants,
}: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  variants: Variant[];
}) {
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState<string | null>(
    variants.length > 0 ? variants[0].id : null
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.id === variantId) ?? null;
  const effectiveStock = selected?.stockOverride ?? stock;
  const soldOut = effectiveStock <= 0;

  function handleAdd() {
    if (soldOut) return;
    addItem(
      {
        productId,
        slug,
        name,
        image,
        price,
        variantId,
        variantName: selected?.name ?? null,
        maxStock: effectiveStock,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="mt-8 space-y-6">
      {variants.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold mb-2.5">Choose option</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const vStock = v.stockOverride ?? stock;
              const vSoldOut = vStock <= 0;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setVariantId(v.id);
                    setQuantity(1);
                  }}
                  disabled={vSoldOut}
                  className={cn(
                    "rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer min-h-11",
                    variantId === v.id
                      ? "bg-primary text-on-primary border-primary"
                      : "border-border bg-white hover:border-primary",
                    vSoldOut && "opacity-40 cursor-not-allowed line-through"
                  )}
                  aria-pressed={variantId === v.id}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex items-center gap-4">
        <div
          className="flex items-center border border-border rounded-lg bg-white"
          role="group"
          aria-label="Quantity"
        >
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || soldOut}
            className="p-3 cursor-pointer hover:bg-primary/5 rounded-l-lg transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" strokeWidth={2} />
          </button>
          <span className="w-12 text-center font-semibold tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
            disabled={quantity >= effectiveStock || soldOut}
            className="p-3 cursor-pointer hover:bg-primary/5 rounded-r-lg transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <Plus className="size-4" strokeWidth={2} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          {soldOut
            ? "Out of stock"
            : effectiveStock <= 5
              ? `Only ${effectiveStock} left`
              : "In stock"}
        </p>
      </div>

      <motion.button
        onClick={handleAdd}
        disabled={soldOut}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "w-full sm:w-auto sm:min-w-64 inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 text-lg font-semibold cursor-pointer transition-colors duration-200 shadow-md min-h-12",
          added ? "bg-success text-on-primary" : "bg-accent text-on-primary hover:opacity-90",
          soldOut && "opacity-50 cursor-not-allowed"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {added ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="inline-flex items-center gap-2"
            >
              <Check className="size-5" strokeWidth={2.25} />
              Added to cart
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="inline-flex items-center gap-2"
            >
              <ShoppingBag className="size-5" strokeWidth={1.75} />
              {soldOut ? "Sold out" : "Add to cart"}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
