import { cn } from "@/lib/cn";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  UNPAID: "Unpaid",
  PAID: "Paid",
  REFUNDED: "Refunded",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-accent/10 text-accent",
  CONFIRMED: "bg-primary/10 text-primary",
  OUT_FOR_DELIVERY: "bg-accent/10 text-accent",
  DELIVERED: "bg-success/10 text-success",
  CANCELLED: "bg-destructive/10 text-destructive",
  UNPAID: "bg-muted text-muted-foreground",
  PAID: "bg-success/10 text-success",
  REFUNDED: "bg-destructive/10 text-destructive",
};

export function OrderStatusBadge({
  value,
}: {
  kind: "status" | "payment";
  value: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        STATUS_STYLES[value] ?? "bg-muted text-muted-foreground"
      )}
    >
      {STATUS_LABELS[value] ?? value}
    </span>
  );
}
