# Payment Gateway Integration

Next.js storefront + admin portal with a Razorpay payment gateway integration:
checkout (Orders API + Checkout.js), payment links, and an admin-configurable
key_id/key_secret with enable/disable control.

Want to put this on a different website? See [docs/EMBEDDING.md](docs/EMBEDDING.md).

## Stack

- Next.js 14 (App Router, TypeScript, Tailwind)
- PostgreSQL + Prisma 7 (driver adapter: `@prisma/adapter-pg`)
- Razorpay Node SDK

## Features

- **Admin portal** (`/admin`)
  - Login (env-seeded credentials, JWT session cookie)
  - Gateway Settings — set/replace Razorpay `key_id` / `key_secret`, enable or
    disable the gateway, test the credentials against the Razorpay API before
    saving. The secret is encrypted at rest (AES-256-GCM) and never rendered
    back to the browser in full.
  - Payment Links — generate a Razorpay payment link (amount, description,
    optional customer info) and copy the shareable URL. Status updates via
    webhook.
  - Orders — list of orders placed through the storefront checkout.
- **Storefront** (`/`)
  - Product catalog → cart (persisted in `localStorage`) → checkout.
  - Checkout creates a Razorpay Order server-side, opens Razorpay Checkout.js,
    and verifies the payment signature server-side before marking the order
    paid.
- **Webhook** (`/api/webhooks/razorpay`) — verifies `X-Razorpay-Signature`
  (HMAC-SHA256 over the raw body) and reconciles order / payment-link status
  for `payment.captured`, `payment.failed`, `order.paid`, `payment_link.paid`,
  `payment_link.cancelled`, `payment_link.expired`.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — your Postgres connection string.
   - `ENCRYPTION_KEY` / `SESSION_SECRET` — generate each with `openssl rand -hex 32`.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — bootstrap admin login.
3. Apply the schema:
   ```bash
   npx prisma migrate deploy   # production / real Postgres
   # or, for a quick local sync:
   npx prisma db push
   ```
4. (Optional) Seed sample products, and the gateway config if you set
   `SEED_RAZORPAY_KEY_ID` / `SEED_RAZORPAY_KEY_SECRET` in `.env`:
   ```bash
   npx prisma db seed
   ```
   Otherwise, configure the gateway from `/admin/settings` after logging in —
   this is the intended way to set keys in a real deployment.
5. Run the app:
   ```bash
   npm run dev
   ```

## Configuring Razorpay keys from the admin portal

Go to `/admin/settings` (log in first at `/admin/login` with your
`ADMIN_EMAIL` / `ADMIN_PASSWORD`). Enter the `key_id` and `key_secret` from
your [Razorpay dashboard](https://dashboard.razorpay.com/app/keys) (test or
live), optionally use **Test connection** to validate them, then **Save**.
Toggle **Enable Razorpay payments** to turn checkout/payment-links on or off
without removing the stored credentials. Replacing keys later just re-submits
the form — leave `key_secret` blank to keep the currently stored one.

## Webhooks (local testing)

Razorpay webhooks need a public URL. For local dev, tunnel port 3000 (e.g.
`ngrok http 3000`) and in the Razorpay dashboard add a webhook pointing to
`https://<your-tunnel>/api/webhooks/razorpay` for the events listed above.
Paste the webhook secret Razorpay gives you into the **webhook secret** field
in `/admin/settings`.

## Test credentials

Use Razorpay's domestic test card `4100 2800 0000 1007` (Visa), any future
expiry date, any CVV, to complete a test checkout. `4111 1111 1111 1111` is
*not* one of Razorpay's own test cards — it gets flagged as an international
card and declines unless the account has international card acceptance
enabled (a separate Razorpay approval). Other domestic test cards: Mastercard
`5500 6700 0000 1002`, RuPay `6527 6589 0000 1005`. Test-mode payment links
behave the same way.

## Security notes

- `key_secret` and the webhook secret are encrypted at rest with
  AES-256-GCM (`ENCRYPTION_KEY`); only a masked form is ever sent to the
  browser.
- Checkout payments are confirmed via server-side HMAC signature
  verification (`razorpay_signature`), not the client-side success callback
  alone.
- `/admin/*` pages and `/api/admin/*` routes require a signed session cookie
  (enforced in `src/middleware.ts`).
- `.env*` is gitignored; nothing under `SEED_RAZORPAY_KEY_ID` /
  `SEED_RAZORPAY_KEY_SECRET` or any real credential should be committed to
  source — only referenced via environment variables.
- The order confirmation page (`/order/[id]`) is only guarded by the
  unguessable `cuid` in the URL, not a customer session — fine for a direct
  post-checkout redirect, but avoid sending that link somewhere it could be
  forwarded/cached if you extend this beyond a single-session flow.
