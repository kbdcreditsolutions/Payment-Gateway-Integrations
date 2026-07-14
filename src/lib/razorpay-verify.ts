import crypto from "crypto";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Verifies the signature Razorpay Checkout returns to the browser on payment success.
// generated = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
export function verifyCheckoutSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", params.keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return safeEqual(expected, params.signature);
}

// Verifies the X-Razorpay-Signature header on incoming webhooks.
// generated = HMAC_SHA256(raw_request_body, webhook_secret)
export function verifyWebhookSignature(params: {
  rawBody: string;
  signature: string;
  webhookSecret: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", params.webhookSecret)
    .update(params.rawBody)
    .digest("hex");
  return safeEqual(expected, params.signature);
}
