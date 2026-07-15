# Client Onboarding Runbook

Use this each time a new client needs Razorpay payments. Pick Path A or
Path B based on whether they already have a website with its own backend.

## Before either path

- [ ] Client has (or is creating) their own Razorpay account —
  **never KBD's account**. See `docs/EMBEDDING.md` for why.
- [ ] Client has their key_id/key_secret from
  `dashboard.razorpay.com/app/keys` (test keys are fine to start; live
  keys need their KYC/activation to complete first, which is unrelated to
  and doesn't block test-mode integration work).
- [ ] Decide test vs live scope for this engagement up front.

## Path A — Client already has a website with a backend

They keep their own stack; you wire in the same pattern this repo uses.

1. Confirm their backend language/framework (Node, Python, PHP, etc.) —
   the pattern is language-agnostic, only the SDK call syntax changes.
2. Implement the three pieces from `docs/EMBEDDING.md` section 2:
   - Create-order endpoint (recompute amount server-side from their own
     product/cart data — never trust a client-submitted amount).
   - Frontend: load `checkout.razorpay.com/v1/checkout.js`, open it with
     the order returned above.
   - Verify-signature endpoint (HMAC-SHA256 over `order_id|payment_id`,
     using **their** key_secret).
3. Add the webhook handler (recommended, not optional) so payment status
   stays correct even if the customer closes the browser before the
   success callback fires. Same signature-verification idea, over the raw
   webhook body.
4. Register the webhook URL in their Razorpay dashboard
   (Settings → Webhooks) for at minimum `payment.captured`,
   `payment.failed`, and `order.paid`.
5. Test with Razorpay's actual domestic test card —
   **`4100 2800 0000 1007`** (Visa), any future expiry, any CVV. Do not
   use `4111 1111 1111 1111` — it isn't Razorpay's own test card and gets
   declined as "international" unless their account has that separately
   approved. Other domestic options: Mastercard `5500 6700 0000 1002`,
   RuPay `6527 6589 0000 1005`.
6. Confirm order/payment records land correctly in their own database,
   and that a declined payment doesn't get marked as paid.
7. Only after test mode is fully verified: swap in live keys, re-verify
   with a small real transaction, then hand off.

## Path B — Client has no website / needs a fresh portal

Deploy them their own copy of this app.

1. Fork or clone this repo into a new GitHub repo scoped to the client.
2. Rebrand: update `KBD Store`/`KBD Admin` strings
   (`src/components/shop-header.tsx`, `src/components/admin-nav.tsx`),
   the color tokens in `src/app/globals.css` if they want different
   branding, and `metadata` in `src/app/layout.tsx`.
3. Provision infrastructure (mirrors what was done for this deployment):
   - `vercel link` a new Vercel project for the client.
   - `vercel integration add neon` (or their preferred Postgres) to get a
     fresh `DATABASE_URL`.
   - Generate fresh `ENCRYPTION_KEY` and `SESSION_SECRET`
     (`openssl rand -hex 32` each — never reuse this deployment's values).
   - Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` to values **the client** chooses
     for their own admin login, not KBD's.
4. Run `npx prisma migrate deploy` against the new database.
5. Have the client log into `/admin/settings` themselves and enter their
   own Razorpay key_id/key_secret — don't enter it on their behalf if
   avoidable, so KBD never handles their live secret.
6. Seed their product catalog (edit `prisma/seed.ts` product list for
   this client, or build them a simple admin product-management UI if
   they need to self-serve — not built yet in this codebase).
7. Deploy: `vercel deploy --prod`.
8. Full smoke test: catalog loads, add-to-cart, checkout with their test
   keys and the correct domestic test card, order shows PAID in their
   admin, payment link generation works.
9. Hand off admin credentials to the client through a secure channel (not
   plaintext chat/email) and have them rotate the password after first
   login.

## Common pitfalls (already hit once each this project)

- Wrong test card → looks like a broken integration, is actually just the
  wrong card number. Always `4100 2800 0000 1007`.
- Forgetting webhook secret in `/admin/settings` → payment status won't
  auto-update if the customer closes the tab mid-payment.
- Reusing KBD's Razorpay account or encryption keys for a new client —
  don't. Each deployment gets its own everything.
- `.env.local` from `vercel link`/`vercel integration add` silently
  overriding local `.env` and pointing local dev at the client's
  production database — rename it immediately after linking.
