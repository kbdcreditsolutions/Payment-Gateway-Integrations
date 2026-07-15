# Embedding Razorpay Payments on Another Website

Two ways to put this on a site you don't control the backend of.

**Policy: every client uses their own Razorpay account.** Nobody else's
payment link or checkout runs through KBD's Razorpay account — each client
needs their own Razorpay account, activated for live payments (or in test
mode while building), with their own key_id/key_secret entered into their
*own* deployment's `/admin/settings`. This app is single-tenant: one
`GatewayConfig` row per deployment, so "another client" always means either
their own copy of this app, or their own backend implementing the pattern in
section 2 below — never a second set of keys layered onto an existing
deployment that's already configured for someone else.

## 1. Payment Link — zero code, works on any site

Use this when you just need "pay me ₹X" on someone's existing site (WordPress,
Wix, Shopify, a plain HTML page, anywhere) and don't want to touch their code
beyond pasting a link.

1. Log into this app's admin portal at `/admin/settings`'s parent
   (`/admin/payment-links`).
2. Fill in the amount, a description, and optionally the customer's
   name/email/phone.
3. Click **Generate link** — this calls Razorpay's Payment Links API
   (`src/app/api/admin/payment-links/route.ts`) and returns a URL like
   `https://rzp.io/l/abcd1234`.
4. Copy that URL and paste it anywhere on the target site:
   ```html
   <a href="https://rzp.io/l/abcd1234" target="_blank" rel="noopener">
     Pay Now
   </a>
   ```
   Or as a styled button — the href is all that matters. Razorpay hosts
   the entire payment page; the third-party site does nothing but link to it.
5. Payment status updates automatically in this app's `/admin/payment-links`
   and `/admin/orders` pages via the webhook handler
   (`src/app/api/webhooks/razorpay/route.ts`), as long as the webhook is
   configured in the Razorpay dashboard (see README's Webhooks section).

**Limitation**: one link = one fixed amount. Fine for invoices, donations, a
single product. Not a cart/multi-item checkout.

## 2. Full checkout flow — for a site with its own backend

Use this when another developer wants a real cart → checkout flow on their
own site, with their own product catalog and their own Razorpay account. They
cannot reuse this app's API routes directly (different Razorpay account,
different trust boundary) — they replicate the same three-piece pattern this
repo uses.

**They will need their own Razorpay key_id/key_secret** — the whole security
model here is server-side order creation + server-side signature
verification, so their backend needs real credentials, not just a frontend
script tag.

### Piece 1 — create an order (their backend)

```js
// POST /api/checkout/create-order  (any backend language/framework)
const Razorpay = require("razorpay");
const razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

const amountInPaise = computeCartTotalServerSide(cartItems); // never trust a client-sent amount
const order = await razorpay.orders.create({
  amount: amountInPaise,
  currency: "INR",
  receipt: `rcpt_${Date.now()}`,
});
// return { orderId: order.id, amount: amountInPaise, keyId: KEY_ID } to the frontend
```

Reference implementation: `src/app/api/checkout/create-order/route.ts` — the
important part is recomputing the amount from their own product data, never
from whatever the client submits.

### Piece 2 — open Checkout.js (their frontend)

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
  fetch("/api/checkout/create-order", { method: "POST", /* cart payload */ })
    .then((r) => r.json())
    .then((data) => {
      const rzp = new Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        order_id: data.orderId,
        handler: function (response) {
          // POST response.razorpay_order_id / _payment_id / _signature to Piece 3
        },
      });
      rzp.open();
    });
</script>
```

Reference: `src/app/(shop)/checkout/page.tsx`.

### Piece 3 — verify the signature (their backend, mandatory)

```js
const crypto = require("crypto");
const expected = crypto
  .createHmac("sha256", KEY_SECRET)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest("hex");
if (expected !== razorpay_signature) {
  // reject — do not mark the order paid
}
```

Reference: `src/lib/razorpay-verify.ts` and
`src/app/api/checkout/verify/route.ts`. **This step is not optional** — the
`handler` callback in Piece 2 fires client-side and can be spoofed; only a
verified signature on the backend proves the payment actually happened.

### Optional but recommended — webhook

Same signature-verification idea, but over the raw webhook body instead of
`order_id|payment_id`, so payment status stays correct even if the customer
closes the browser before the `handler` callback fires. See
`src/app/api/webhooks/razorpay/route.ts`.
