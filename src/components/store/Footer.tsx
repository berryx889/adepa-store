import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { displayGhanaPhone } from "@/lib/phone";

export function Footer({
  shopName,
  tagline,
  contactPhone,
  whatsappNumber,
}: {
  shopName: string;
  tagline: string;
  contactPhone: string;
  whatsappNumber: string;
}) {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 grid gap-10 sm:grid-cols-3">
        <div className="sm:max-w-xs">
          <p className="font-display text-2xl">{shopName}</p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{tagline}</p>
        </div>
        <nav aria-label="Footer">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground mb-4">
            Shop
          </p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/shop" className="text-foreground/80 hover:text-accent transition-colors cursor-pointer">
                All products
              </Link>
            </li>
            <li>
              <Link href="/track" className="text-foreground/80 hover:text-accent transition-colors cursor-pointer">
                Track your order
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground mb-4">
            Contact
          </p>
          <ul className="space-y-2.5 text-sm">
            {contactPhone && (
              <li>
                <a
                  href={`tel:${contactPhone}`}
                  className="inline-flex items-center gap-2 text-foreground/80 hover:text-accent transition-colors cursor-pointer"
                >
                  <Phone className="size-4" strokeWidth={1.75} />
                  {displayGhanaPhone(contactPhone)}
                </a>
              </li>
            )}
            {whatsappNumber && (
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-foreground/80 hover:text-accent transition-colors cursor-pointer"
                >
                  <MessageCircle className="size-4" strokeWidth={1.75} />
                  WhatsApp us
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 sm:px-6 py-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {shopName}. Secured by Paystack — MoMo and cards accepted.
        </p>
      </div>
    </footer>
  );
}
