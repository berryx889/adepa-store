import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/paystack";
import { markOrderPaid } from "@/lib/orders";
import { notifyOrderPaid } from "@/lib/sms";

/**
 * Paystack webhook — the source of truth for payment success.
 * - Signature verification is mandatory (HMAC-SHA512 of raw body).
 * - Idempotent: markOrderPaid decrements stock at most once per order.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; amount?: number } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    const order = await prisma.order.findUnique({
      where: { paystackReference: event.data.reference },
      include: { deliveryZone: true },
    });

    if (order && order.paymentStatus !== "PAID") {
      if (event.data.amount != null && event.data.amount < order.total) {
        console.error(
          `Webhook amount mismatch for ${order.orderNumber}: got ${event.data.amount}, expected ${order.total}`
        );
        return NextResponse.json({ received: true });
      }
      const transitioned = await markOrderPaid(order.id);
      if (transitioned) {
        // SMS must never fail the webhook — notifyOrderPaid is fully wrapped.
        await notifyOrderPaid(order);
      }
    }
  }

  // Always 200 so Paystack doesn't retry endlessly for events we ignore.
  return NextResponse.json({ received: true });
}
