"use client";

import { MotionConfig } from "framer-motion";
import { CartProvider } from "@/lib/cart";

export function StoreProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>{children}</CartProvider>
    </MotionConfig>
  );
}
