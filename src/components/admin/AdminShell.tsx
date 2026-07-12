"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  Truck,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/zones", label: "Delivery zones", icon: Truck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  shopName,
  email,
  children,
}: {
  shopName: string;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Admin">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer",
            isActive(item.href)
              ? "bg-accent text-on-primary"
              : "text-on-primary/70 hover:text-on-primary hover:bg-on-primary/10"
          )}
          aria-current={isActive(item.href) ? "page" : undefined}
        >
          <item.icon className="size-4.5" strokeWidth={1.75} />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="px-3 py-4 border-t border-on-primary/10 space-y-1">
      <Link
        href="/"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-primary/70 hover:text-on-primary hover:bg-on-primary/10 transition-colors duration-200 cursor-pointer"
      >
        <Store className="size-4.5" strokeWidth={1.75} />
        View storefront
      </Link>
      <a
        href="/api/auth/signout"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-primary/70 hover:text-destructive hover:bg-on-primary/10 transition-colors duration-200 cursor-pointer"
      >
        <LogOut className="size-4.5" strokeWidth={1.75} />
        Sign out
      </a>
      <p className="px-3 pt-2 text-xs text-on-primary/40 truncate">{email}</p>
    </div>
  );

  return (
    <div className="min-h-svh flex w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-primary text-on-primary sticky top-0 h-svh">
        <div className="px-6 h-16 flex items-center border-b border-on-primary/10">
          <p className="font-display text-xl font-semibold">{shopName}</p>
        </div>
        {nav}
        {footer}
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-primary text-on-primary flex items-center justify-between px-4 h-14 shadow-md">
        <p className="font-display text-lg font-semibold">{shopName}</p>
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-lg cursor-pointer hover:bg-on-primary/10 transition-colors"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? (
            <X className="size-5" strokeWidth={1.75} />
          ) : (
            <Menu className="size-5" strokeWidth={1.75} />
          )}
        </button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 pt-14 bg-primary text-on-primary flex flex-col">
          {nav}
          {footer}
        </div>
      )}

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
