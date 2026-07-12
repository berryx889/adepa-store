import { prisma } from "@/lib/prisma";
import { getShopSettings } from "@/lib/settings";
import { formatGHS } from "@/lib/money";

/**
 * Arkesel SMS. Every send is wrapped — an SMS failure must NEVER fail an order.
 * Failures are logged to NotificationLog.
 */
async function sendSms(to: string, message: string): Promise<void> {
  const apiKey = process.env.ARKESEL_API_KEY;
  const settings = await getShopSettings();
  const sender = settings.arkeselSenderId || process.env.ARKESEL_SENDER_ID;

  if (!apiKey || !sender) {
    await log(to, message, "failed", "Arkesel not configured");
    return;
  }

  try {
    const res = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ sender, message, recipients: [to] }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || (json.status && json.status !== "success")) {
      await log(to, message, "failed", JSON.stringify(json).slice(0, 500));
    } else {
      await log(to, message, "sent", null);
    }
  } catch (err) {
    await log(to, message, "failed", err instanceof Error ? err.message : String(err));
  }
}

async function log(phone: string, message: string, status: string, error: string | null) {
  try {
    await prisma.notificationLog.create({ data: { phone, message, status, error } });
  } catch {
    console.error(`SMS log failed [${status}] to ${phone}`);
  }
}

type OrderForSms = {
  orderNumber: string;
  customerName: string;
  phone: string;
  total: number;
  deliveryZone?: { name: string } | null;
};

export async function notifyOrderPaid(order: OrderForSms): Promise<void> {
  const settings = await getShopSettings();
  await sendSms(
    order.phone,
    `Order ${order.orderNumber} confirmed, ${formatGHS(order.total)}. We'll deliver soon. — ${settings.shopName}`
  );
  if (settings.contactPhone) {
    await sendSms(
      settings.contactPhone,
      `New paid order ${order.orderNumber} from ${order.customerName}${
        order.deliveryZone ? `, ${order.deliveryZone.name}` : ""
      }. Total ${formatGHS(order.total)}.`
    );
  }
}

export async function notifyStatusChange(
  order: OrderForSms,
  status: "OUT_FOR_DELIVERY" | "DELIVERED"
): Promise<void> {
  const settings = await getShopSettings();
  const text =
    status === "OUT_FOR_DELIVERY"
      ? `Order ${order.orderNumber} is out for delivery. — ${settings.shopName}`
      : `Order ${order.orderNumber} has been delivered. Thank you for shopping with ${settings.shopName}!`;
  await sendSms(order.phone, text);
}
