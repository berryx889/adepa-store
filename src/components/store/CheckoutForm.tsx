"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2, Lock, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatGHS } from "@/lib/money";
import { isValidGhanaPhone } from "@/lib/phone";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Zone = { id: string; name: string; fee: number };

declare global {
  interface Window {
    PaystackPop?: new () => {
      resumeTransaction: (
        accessCode: string,
        callbacks?: { onSuccess?: () => void; onCancel?: () => void }
      ) => void;
    };
  }
}

type Errors = Partial<Record<"customerName" | "phone" | "address" | "deliveryZoneId", string>>;

export function CheckoutForm({ zones }: { zones: Zone[] }) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    deliveryZoneId: "",
    note: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const zone = useMemo(
    () => zones.find((z) => z.id === form.deliveryZoneId) ?? null,
    [zones, form.deliveryZoneId]
  );
  const total = subtotal + (zone?.fee ?? 0);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Errors = {};
    if (form.customerName.trim().length < 2) next.customerName = "Enter your full name";
    if (!isValidGhanaPhone(form.phone))
      next.phone = "Enter a valid Ghana number, e.g. 024 123 4567";
    if (form.address.trim().length < 5) next.address = "Enter your delivery address";
    if (!form.deliveryZoneId) next.deliveryZoneId = "Choose your town or area";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) document.getElementById(`field-${first}`)?.focus();
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate() || items.length === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          note: form.note || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setServerError(json.error ?? "Checkout failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const confirmUrl = `/order/confirmed?n=${json.orderNumber}&p=${encodeURIComponent(json.phone)}`;

      if (json.payment.mode === "paystack" && window.PaystackPop) {
        const popup = new window.PaystackPop();
        popup.resumeTransaction(json.payment.accessCode, {
          onSuccess: () => {
            clearCart();
            router.push(confirmUrl);
          },
          onCancel: () => setSubmitting(false),
        });
      } else if (json.payment.mode === "paystack") {
        // Popup script blocked/unavailable — fall back to hosted payment page.
        clearCart();
        window.location.href = json.payment.authorizationUrl;
      } else {
        // Dev mode without Paystack keys.
        clearCart();
        router.push(confirmUrl);
      }
    } catch {
      setServerError("Network problem. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-4 text-center py-12">
        <span className="size-16 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="size-7 text-muted-foreground" strokeWidth={1.5} />
        </span>
        <p className="text-muted-foreground">Your cart is empty — nothing to check out yet.</p>
        <Button href="/shop" variant="secondary" size="sm">
          Browse the shop
        </Button>
      </div>
    );
  }

  const inputCls = (hasError: boolean) =>
    cn(
      "w-full rounded-lg border bg-white px-4 py-3 text-base transition-colors duration-200 focus:outline-none focus:ring-[3px]",
      hasError
        ? "border-destructive focus:border-destructive focus:ring-destructive/10"
        : "border-border focus:border-primary focus:ring-primary/10"
    );

  return (
    <>
      <Script src="https://js.paystack.co/v2/inline.js" strategy="lazyOnload" />
      <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-5 max-w-xl">
          <div>
            <label htmlFor="field-customerName" className="block text-sm font-semibold mb-1.5">
              Full name <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <input
              id="field-customerName"
              autoComplete="name"
              value={form.customerName}
              onChange={(e) => set("customerName", e.target.value)}
              className={inputCls(!!errors.customerName)}
              aria-invalid={!!errors.customerName}
              aria-describedby={errors.customerName ? "err-customerName" : undefined}
            />
            {errors.customerName && (
              <p id="err-customerName" role="alert" className="mt-1.5 text-sm text-destructive">
                {errors.customerName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="field-phone" className="block text-sm font-semibold mb-1.5">
              Phone number <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <input
              id="field-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="024 123 4567"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              onBlur={() => {
                if (form.phone && !isValidGhanaPhone(form.phone))
                  setErrors((er) => ({
                    ...er,
                    phone: "Enter a valid Ghana number, e.g. 024 123 4567",
                  }));
              }}
              className={inputCls(!!errors.phone)}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "err-phone" : "help-phone"}
            />
            {errors.phone ? (
              <p id="err-phone" role="alert" className="mt-1.5 text-sm text-destructive">
                {errors.phone}
              </p>
            ) : (
              <p id="help-phone" className="mt-1.5 text-sm text-muted-foreground">
                We&apos;ll send your order confirmation to this number by SMS.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="field-address" className="block text-sm font-semibold mb-1.5">
              Delivery address <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <textarea
              id="field-address"
              rows={3}
              autoComplete="street-address"
              placeholder="House number, street, landmark…"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className={inputCls(!!errors.address)}
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? "err-address" : undefined}
            />
            {errors.address && (
              <p id="err-address" role="alert" className="mt-1.5 text-sm text-destructive">
                {errors.address}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="field-deliveryZoneId" className="block text-sm font-semibold mb-1.5">
              Town / area <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <select
              id="field-deliveryZoneId"
              value={form.deliveryZoneId}
              onChange={(e) => set("deliveryZoneId", e.target.value)}
              className={cn(inputCls(!!errors.deliveryZoneId), "cursor-pointer")}
              aria-invalid={!!errors.deliveryZoneId}
              aria-describedby={errors.deliveryZoneId ? "err-deliveryZoneId" : undefined}
            >
              <option value="">Choose your area…</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} — delivery {formatGHS(z.fee)}
                </option>
              ))}
            </select>
            {errors.deliveryZoneId && (
              <p id="err-deliveryZoneId" role="alert" className="mt-1.5 text-sm text-destructive">
                {errors.deliveryZoneId}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="field-note" className="block text-sm font-semibold mb-1.5">
              Order note <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id="field-note"
              rows={2}
              placeholder="Anything we should know?"
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              className={inputCls(false)}
            />
          </div>
        </div>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-24 h-fit rounded-xl bg-white shadow-md p-6">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={`${item.productId}:${item.variantId ?? ""}`} className="flex gap-3 text-sm">
                <span className="relative size-12 rounded-md overflow-hidden shrink-0">
                  <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate font-medium">{item.name}</span>
                  <span className="text-muted-foreground">
                    {item.variantName ? `${item.variantName} · ` : ""}×{item.quantity}
                  </span>
                </span>
                <span className="font-medium tabular-nums">
                  {formatGHS(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatGHS(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="tabular-nums">
                {zone ? formatGHS(zone.fee) : "Choose your area"}
              </dd>
            </div>
            <div className="flex justify-between pt-2 border-t border-border text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatGHS(total)}</dd>
            </div>
          </dl>

          {serverError && (
            <p role="alert" className="mt-4 rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-on-primary px-6 py-4 text-lg font-semibold cursor-pointer transition-all duration-200 hover:opacity-90 shadow-md disabled:opacity-60 disabled:cursor-not-allowed min-h-12"
          >
            {submitting ? (
              <>
                <Loader2 className="size-5 animate-spin" strokeWidth={2} />
                Processing…
              </>
            ) : (
              <>
                <Lock className="size-5" strokeWidth={1.75} />
                Pay {formatGHS(total)}
              </>
            )}
          </button>
          <p className="mt-3 text-xs text-muted-foreground text-center">
            Secured by Paystack. MoMo and cards accepted.
          </p>
          <p className="mt-2 text-center">
            <Link href="/shop" className="text-sm text-accent hover:underline cursor-pointer">
              Continue shopping
            </Link>
          </p>
        </aside>
      </form>
    </>
  );
}
