import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeGhanaPhone } from "@/lib/phone";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/** Public order lookup: order number + phone, no login. */
export async function GET(req: Request) {
  if (!rateLimit(`track:${clientIp(req)}`, 20, 60_000)) {
    return NextResponse.json(
      { ok: false, error: "Too many lookups. Please wait a minute." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber")?.trim().toUpperCase();
  const phoneRaw = searchParams.get("phone") ?? "";
  const phone = normalizeGhanaPhone(phoneRaw);

  if (!orderNumber || !phone) {
    return NextResponse.json(
      { ok: false, error: "Provide your order number and phone number" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber, phone },
    include: { items: true, deliveryZone: true },
  });

  if (!order) {
    return NextResponse.json(
      { ok: false, error: "No order found for that number and phone" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    order: {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      zone: order.deliveryZone.name,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        name: i.nameSnapshot,
        price: i.priceSnapshot,
        quantity: i.quantity,
      })),
    },
  });
}
