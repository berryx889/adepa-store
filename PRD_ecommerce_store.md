# Product requirement document — single-seller e-commerce store (Ghana)

This document is the master prompt for building the site. Paste it into a new Claude conversation at the start of the project, then build feature by feature in the order given in the build phases section. Do not skip phases.

---

## 1. Project overview

A single-seller online store for a Ghanaian business. The admin lists products, customers browse and order, the admin fulfills and delivers. Two user types only: **customer** and **admin**.

**Products sold:** liquid soap, perfumes, and traditional smocks. The catalog must support adding new categories later without code changes.

**Currency:** Ghana cedi (GHS) everywhere. No multi-currency.

**Goal for v1:** a working store deployed on Vercel's free tier that the client can test with real Paystack test-mode payments before buying a domain.

## 2. Tech stack (fixed — do not substitute)

- **Framework:** Next.js 14+ with App Router, single repo, TypeScript
- **Database:** Neon PostgreSQL (free tier) with Prisma ORM
- **Payments:** Paystack (supports MTN MoMo, Telecel Cash, AT Money, and cards in Ghana)
- **Image storage:** Cloudinary free tier for product photos
- **SMS notifications:** Arkesel API (order confirmations to customer, new-order alerts to admin)
- **Styling:** Tailwind CSS
- **Auth:** Auth.js (NextAuth) with credentials provider for admin; customers check out as guests with phone number, no account required in v1
- **Hosting:** Vercel free tier

Rationale: Next.js on Vercel removes the separate-backend problem entirely — API routes, server actions, and webhooks live in one deployable project. No port conflicts, no second hosting bill.

## 3. Pages and UI

### Customer-facing

1. **Home** — hero section with shop name and tagline, featured products grid, category links. Mobile-first: most Ghanaian customers will visit on phones.
2. **Shop / catalog** — product grid with category filter, search by name, sort by price. Pagination or infinite scroll (pick pagination — simpler).
3. **Product detail** — image gallery (multiple photos per product), name, price in GHS, description, size/variant selector where relevant (smock sizes, soap and perfume bottle volumes), quantity picker, add to cart.
4. **Cart** — line items, quantity edit, remove, subtotal, delivery fee shown before checkout.
5. **Checkout** — one page. Fields: full name, phone number (required, Ghana format validation), delivery address, town/area dropdown (delivery zones set by admin), optional order note. Payment method: Paystack popup (MoMo or card). No account creation step.
6. **Order confirmation** — order number, summary, "you will receive an SMS" note.
7. **Order tracking** — customer enters order number + phone to see status. No login needed.

### Admin

8. **Admin login** — email + password. Single admin account seeded via environment variable or setup script.
9. **Dashboard** — today's orders, pending orders count, revenue this week/month, low-stock alerts.
10. **Products** — CRUD. Fields: name, category, price, description, images (Cloudinary upload), stock quantity, variants (sizes), active/inactive toggle.
11. **Categories** — CRUD, simple name + slug.
12. **Orders** — list with filters (status, date, payment status), order detail view, status updates: pending → confirmed → out for delivery → delivered / cancelled. Status change triggers customer SMS.
13. **Delivery zones** — CRUD: zone name (e.g. "Accra central", "Tema", "Outside Accra") and fee in GHS.
14. **Settings** — shop name, logo, contact phone, WhatsApp number, Arkesel sender ID.

### Design direction — premium feel is a hard requirement

**Before writing any UI code (start of phase 2), run the ui-ux-pro-max skill to generate a persisted design system:**

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "premium african fashion and fragrance e-commerce store" --design-system --persist -p "StoreName" --motion 7
```

Read `design-system/MASTER.md` before building every page. Generate page-specific overrides for home, product detail, checkout, and admin dashboard. Every UI task must reference the design system — no ad-hoc colors or fonts.

**What premium means here, concretely:**

- **Typography:** one display font for headings, one clean sans for body, from the skill's font pairings. No default Tailwind font stack.
- **Color:** deep, confident palette suited to fragrance and traditional wear — rich dark base with a gold or warm accent works well for this product mix. Confirm against the client's brand; the design system generator decides the final palette.
- **Icons:** Lucide React throughout. Consistent stroke width. No emoji as icons, no mixed icon sets.
- **Motion:** Framer Motion. Page transitions, staggered product-grid entrance, hover lift on cards, animated add-to-cart feedback, skeleton loaders instead of spinners, smooth cart drawer slide-in. The login and checkout pages get subtle motion only — nothing that delays interaction.
- **Homepage:** full-bleed hero with slow ken-burns or parallax product imagery, animated headline reveal, featured categories with hover states, social-proof strip.
- **Admin login:** split-screen layout, brand imagery on one side, form on the other, animated entrance. Same design system as the storefront — the admin panel is not exempt from looking good.
- **Detail work:** consistent border radii, layered shadows from the design system, focus states on every interactive element, empty states with illustration or icon rather than bare text.

**Performance guardrails — these override any animation ambition:**

- Most customers are on mid-range Android phones on mobile data. Animations use only `transform` and `opacity`. No layout-thrashing animations, no autoplay video.
- Respect `prefers-reduced-motion`.
- Lazy-load below-the-fold sections. Next/Image for every product photo with proper `sizes`.
- Lighthouse mobile performance must stay at 80+. If an animation drops it below that, the animation goes.
- Every page must work at 360px width.

GHS formatted as "GH₵ 120.00". Sentence-case headings.

## 4. Data models (Prisma schema)

- **Product**: id, name, slug, description, price (integer, pesewas), categoryId, images (string[]), stock, isActive, createdAt
- **ProductVariant**: id, productId, name (e.g. "Size L" or "500ml"), stockOverride (nullable)
- **Category**: id, name, slug
- **Order**: id, orderNumber (human-readable, e.g. ORD-2026-0042), customerName, phone, address, deliveryZoneId, deliveryFee, subtotal, total, note, status (enum), paymentStatus (enum: unpaid, paid, refunded), paystackReference, createdAt
- **OrderItem**: id, orderId, productId, variantId (nullable), nameSnapshot, priceSnapshot, quantity
- **DeliveryZone**: id, name, fee
- **AdminUser**: id, email, passwordHash
- **Setting**: key, value (shop config as key-value rows)

Store all money as integers in pesewas. Snapshot product name and price onto order items so price edits never corrupt order history.

## 5. API and server logic

Use Next.js route handlers and server actions. Endpoints that must exist:

- `POST /api/checkout` — validates cart against live stock and prices server-side (never trust client totals), creates order with status pending/unpaid, initializes Paystack transaction, returns authorization URL or access code for the Paystack popup.
- `POST /api/webhooks/paystack` — verifies the `x-paystack-signature` HMAC-SHA512 header against the raw request body, marks the order paid on `charge.success`, decrements stock, queues SMS to customer and admin. Must be idempotent — a replayed webhook must not decrement stock twice.
- `GET /api/orders/track?orderNumber=&phone=` — public tracking lookup.
- Admin CRUD via server actions behind auth middleware.
- `POST /api/upload` — signed Cloudinary upload for admin product images.

### Payment flow (Paystack)

1. Customer submits checkout → server creates order (unpaid) → server calls Paystack initialize with amount in pesewas, order number as reference metadata.
2. Paystack popup opens on the client; customer pays with MoMo or card.
3. Webhook confirms payment server-side. **The webhook is the source of truth, not the client-side callback.** The client callback only redirects to the confirmation page, which polls the order's payment status.
4. If the webhook never arrives (test-mode quirks), admin can manually verify via a "verify payment" button that calls Paystack's verify endpoint.

### SMS (Arkesel)

- On payment success: SMS to customer ("Order ORD-2026-0042 confirmed, GH₵ 145.00. We'll deliver soon.") and SMS to admin ("New paid order ORD-2026-0042 from Kofi, Tema").
- On status change to out-for-delivery and delivered: SMS to customer.
- Wrap SMS in try/catch — an SMS failure must never fail an order. Log failures to a NotificationLog table or console.

## 6. Environment variables

```
DATABASE_URL=            # Neon connection string, pooled
PAYSTACK_SECRET_KEY=     # test key first
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ARKESEL_API_KEY=
ARKESEL_SENDER_ID=
AUTH_SECRET=
ADMIN_EMAIL=             # seed
ADMIN_PASSWORD=          # seed, hashed on first run
NEXT_PUBLIC_APP_URL=     # the Vercel URL, needed for Paystack callback
```

Never commit `.env`. Add it to `.gitignore` before the first commit.

## 7. Security and validation rules

- All prices and totals computed server-side at checkout.
- Zod validation on every API input.
- Ghana phone validation: accepts 0XXXXXXXXX or +233XXXXXXXXX, normalize to +233 format for storage and SMS.
- Rate-limit the checkout and tracking endpoints.
- Admin routes protected by middleware; redirect unauthenticated hits to login.
- Paystack webhook signature verification is mandatory, not optional.

## 8. Build phases — follow this order

**Phase 1 — foundation.** Scaffold Next.js + TypeScript + Tailwind + Prisma. Install Framer Motion and lucide-react. Install the ui-ux-pro-max skill (`uipro init --ai claude`). Define full schema, run first migration against Neon, seed admin user, one category, three sample products. Verify locally.

**Phase 2 — catalog.** Generate the design system with ui-ux-pro-max first (see design direction section). Then home, shop, product detail pages reading from the database. Category filter and search.

**Phase 3 — cart and checkout.** Cart (client state, persisted to localStorage is fine here since this is a real deployed app, not an artifact), checkout form with zone-based delivery fee, order creation.

**Phase 4 — payments.** Paystack initialize + popup + webhook + verify fallback. Test with Paystack test cards and test MoMo numbers.

**Phase 5 — admin panel.** Auth, dashboard, product CRUD with Cloudinary, order management with status flow, delivery zones, settings.

**Phase 6 — notifications and tracking.** Arkesel integration, public order tracking page.

**Phase 7 — polish and deploy.** Loading states, empty states, error pages, mobile pass at 360px, then deploy to Vercel: connect the GitHub repo, set env vars in Vercel dashboard, point the Paystack test webhook to `https://<project>.vercel.app/api/webhooks/paystack`.

At the end of each phase, list what was built and what the manual test checklist is before moving on.

## 9. Deployment checklist (Vercel)

1. Push to GitHub with `.env` ignored.
2. Import repo in Vercel, framework auto-detected as Next.js.
3. Add all env vars in Vercel project settings.
4. Set `DATABASE_URL` to Neon's **pooled** connection string (serverless functions exhaust direct connections).
5. Add `prisma generate` to the build command if not automatic.
6. Register the webhook URL in the Paystack dashboard (test mode).
7. Client tests on the `*.vercel.app` URL. Domain purchase and Paystack live keys come only after client sign-off.

## 10. Out of scope for v1 (do not build unless asked)

Customer accounts and login, wishlists, product reviews, discount codes, multi-vendor anything, email notifications, inventory reports, refund automation. These go in a v2 list.

## 11. Open items to confirm with the client before phase 1

- Shop name, logo, and brand color
- Real product list with prices and photos
- Delivery zones and fees
- Paystack account created and test keys obtained (business registration may be needed for live mode)
- Arkesel sender ID registered (max 11 characters, needs approval)
- Admin's phone number for order alerts
