"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatGHS } from "@/lib/money";
import { Button } from "@/components/ui/Button";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCart();
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  // Close the drawer whenever the route changes (e.g. after tapping Checkout).
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      closeCart();
    }
  }, [pathname, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] cursor-pointer"
            aria-label="Close cart"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-background shadow-xl flex flex-col"
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-border">
              <h2 className="text-xl font-semibold">Your cart</h2>
              <button
                onClick={closeCart}
                className="p-2 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                aria-label="Close cart"
              >
                <X className="size-5" strokeWidth={1.75} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="size-16 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingBag className="size-7 text-muted-foreground" strokeWidth={1.5} />
                </span>
                <p className="text-muted-foreground">Your cart is empty.</p>
                <Button href="/shop" variant="secondary" size="sm" className="mt-1">
                  Browse the shop
                </Button>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {items.map((item) => (
                    <li
                      key={`${item.productId}:${item.variantId ?? ""}`}
                      className="flex gap-3"
                    >
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="relative size-20 rounded-lg overflow-hidden shrink-0 cursor-pointer"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        {item.variantName && (
                          <p className="text-sm text-muted-foreground">{item.variantName}</p>
                        )}
                        <p className="text-sm font-semibold mt-0.5">
                          {formatGHS(item.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-border rounded-lg">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.variantId, item.quantity - 1)
                              }
                              className="p-1.5 cursor-pointer hover:bg-primary/5 rounded-l-lg transition-colors"
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              <Minus className="size-3.5" strokeWidth={2} />
                            </button>
                            <span className="w-8 text-center text-sm font-medium tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.variantId, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.maxStock}
                              className="p-1.5 cursor-pointer hover:bg-primary/5 rounded-r-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <Plus className="size-3.5" strokeWidth={2} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="p-1.5 text-muted-foreground hover:text-destructive cursor-pointer transition-colors rounded-lg"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="size-4" strokeWidth={1.75} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-border px-5 py-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold tabular-nums">{formatGHS(subtotal)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Delivery fee is added at checkout based on your area.
                  </p>
                  <Button href="/checkout" className="w-full" size="lg">
                    Checkout
                  </Button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
