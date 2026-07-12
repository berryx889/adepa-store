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
    <footer className="bg-primary text-on-primary mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-semibold">{shopName}</p>
          <p className="mt-2 text-sm text-on-primary/70 leading-relaxed">{tagline}</p>
        </div>
        <nav aria-label="Footer">
          <p className="text-sm font-semibold uppercase tracking-wider text-on-primary/50 mb-3">
            Shop
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/shop" className="hover:text-accent-light transition-colors cursor-pointer">
                All products
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:text-accent-light transition-colors cursor-pointer">
                Track your order
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-on-primary/50 mb-3">
            Contact
          </p>
          <ul className="space-y-2 text-sm">
            {contactPhone && (
              <li>
                <a
                  href={`tel:${contactPhone}`}
                  className="inline-flex items-center gap-2 hover:text-accent-light transition-colors cursor-pointer"
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
                  className="inline-flex items-center gap-2 hover:text-accent-light transition-colors cursor-pointer"
                >
                  <MessageCircle className="size-4" strokeWidth={1.75} />
                  WhatsApp us
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-on-primary/10">
        <p className="mx-auto max-w-6xl px-4 sm:px-6 py-4 text-xs text-on-primary/50">
          © {new Date().getFullYear()} {shopName}. Payments secured by Paystack — MoMo and cards accepted.
        </p>
      </div>
    </footer>
  );
}
