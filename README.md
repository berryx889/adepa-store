# Adepa Store — single-seller e-commerce (Ghana)

Next.js App Router storefront + admin panel for a Ghanaian single-seller shop: liquid soap, perfumes and traditional smocks. Prices in GHS (stored as integer pesewas), Paystack payments (MoMo + cards), Arkesel SMS notifications, guest checkout with phone number.

Built per `PRD_ecommerce_store.md`. Design tokens live in `design-system/adepa-store/MASTER.md` — every UI change must follow them.

## Stack

- Next.js (App Router, TypeScript) · Tailwind CSS v4 · Framer Motion · lucide-react
- Prisma + PostgreSQL (Neon in production, local Postgres in dev)
- Auth.js (NextAuth) credentials — single admin account
- Paystack (payments) · Cloudinary (product images) · Arkesel (SMS)

## Local development

```bash
npm install
cp .env.example .env        # fill in values (see below)
npx prisma migrate dev      # creates/updates the schema
npx prisma db seed          # admin user, categories, sample products, zones
npm run dev                 # http://localhost:3000
```

Dev works without Paystack/Cloudinary/Arkesel keys:

- **No Paystack keys** → checkout creates the order (PENDING/UNPAID) and skips the popup.
- **No Cloudinary keys** → admin image upload falls back to pasting an image URL.
- **No Arkesel keys** → SMS attempts are logged to the `NotificationLog` table as failed, orders are never blocked.

Admin panel: `/admin` — credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` at seed time.

## Environment variables

See `.env.example`. Notes:

- `DATABASE_URL` — use Neon's **pooled** connection string in production.
- `AUTH_SECRET` — generate with `openssl rand -base64 32`.
- `NEXT_PUBLIC_APP_URL` — the deployed URL; used for the Paystack callback.

## Deploying to Vercel

1. Push to GitHub (`.env` is gitignored — never commit it).
2. Import the repo in Vercel; Next.js is auto-detected.
3. Add every variable from `.env.example` in Project Settings → Environment Variables.
4. Set `DATABASE_URL` to the Neon **pooled** string (serverless exhausts direct connections).
5. Run migrations against Neon: `DATABASE_URL=<neon-direct-url> npx prisma migrate deploy`, then seed once.
6. In the Paystack dashboard (test mode), register the webhook: `https://<project>.vercel.app/api/webhooks/paystack`.
7. Test with Paystack test cards / test MoMo numbers on the `*.vercel.app` URL.
8. Domain + live Paystack keys only after client sign-off.

## Payment flow

1. `POST /api/checkout` validates cart against live stock/prices server-side, creates the order (PENDING/UNPAID), initializes Paystack, returns an access code for the popup.
2. Customer pays in the Paystack popup (MoMo or card).
3. `POST /api/webhooks/paystack` (HMAC-SHA512 verified, idempotent) is the **source of truth**: marks the order paid, decrements stock once, sends SMS to customer + admin.
4. The confirmation page polls `GET /api/orders/track` until the webhook lands.
5. If a webhook is missed, the admin order page has **Verify payment with Paystack**.

## Placeholder images

`public/products/*.jpg` and `public/hero.jpg` are generated placeholders
(`node scripts/gen-placeholders.mjs`). Replace with real product photos via the
admin panel (Cloudinary upload) when the client provides them.
