import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeGhanaPhone } from "@/lib/phone";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { CheckoutError, createOrder } from "@/lib/orders";
import { initializeTransaction, paystackConfigured } from "@/lib/paystack";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizeGhanaPhone(v) !== null, {
      message: "Enter a valid Ghana phone number (0XXXXXXXXX or +233XXXXXXXXX)",
    }),
  address: z.string().trim().min(5, "Enter your delivery address").max(500),
  deliveryZoneId: z.string().min(1, "Choose your town or area"),
  note: z.string().trim().max(500).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().nullable(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Your cart is empty"),
});

export async function POST(req: Request) {
  if (!rateLimit(`checkout:${clientIp(req)}`, 5, 60_000)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const phone = normalizeGhanaPhone(parsed.data.phone)!;

  try {
    const order = await createOrder({ ...parsed.data, phone });

    if (!paystackConfigured()) {
      // Dev fallback: no Paystack keys yet — order stays PENDING/UNPAID.
      return NextResponse.json({
        ok: true,
        orderNumber: order.orderNumber,
        phone: order.phone,
        total: order.total,
        payment: { mode: "dev" as const },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const init = await initializeTransaction({
      // Paystack requires an email; guests check out with phone only.
      email: `${phone.replace("+", "")}@customer.adepastore.com`,
      amount: order.total,
      reference: order.orderNumber,
      callbackUrl: `${appUrl}/order/confirmed?n=${order.orderNumber}&p=${encodeURIComponent(order.phone)}`,
      metadata: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        phone: order.phone,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paystackReference: init.reference },
    });

    return NextResponse.json({
      ok: true,
      orderNumber: order.orderNumber,
      phone: order.phone,
      total: order.total,
      payment: {
        mode: "paystack" as const,
        accessCode: init.accessCode,
        authorizationUrl: init.authorizationUrl,
        reference: init.reference,
      },
    });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 409 });
    }
    console.error("Checkout failed:", err);
    return NextResponse.json(
      { ok: false, error: "Checkout failed. Please try again." },
      { status: 500 }
    );
  }
}
