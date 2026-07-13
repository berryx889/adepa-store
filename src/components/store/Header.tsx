"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, PackageSearch, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { CartDrawer } from "./CartDrawer";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/track", label: "Track order" },
];

export function Header({ shopName }: { shopName: string }) {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 text-foreground transition-all duration-300",
          scrolled || mobileOpen
            ? "bg-background/80 backdrop-blur-md border-b border-border/70"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-display text-2xl tracking-tight cursor-pointer"
            aria-label={`${shopName} home`}
          >
            {shopName}
          </Link>

          <nav className="hidden md:flex items-center gap-9" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors duration-200 cursor-pointer",
                  pathname === item.href
                    ? "text-accent"
                    : "text-foreground/80 hover:text-foreground"
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-current/10"
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="size-5" strokeWidth={1.75} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-accent text-on-primary text-xs font-semibold flex items-center justify-center"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2.5 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-current/10"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="size-5" strokeWidth={1.75} />
              ) : (
                <Menu className="size-5" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-background border-t border-border px-4 py-3 flex flex-col"
              aria-label="Mobile"
            >
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 py-3 px-2 rounded-lg text-base font-medium cursor-pointer transition-colors",
                    pathname === item.href ? "text-accent" : "hover:bg-primary/5"
                  )}
                >
                  {item.href === "/track" && (
                    <PackageSearch className="size-4" strokeWidth={1.75} />
                  )}
                  {item.label}
                </Link>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer />
    </>
  );
}
