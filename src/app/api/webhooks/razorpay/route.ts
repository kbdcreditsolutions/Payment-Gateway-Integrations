import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveRazorpayClient } from "@/lib/gateway-config";
import { verifyWebhookSignature } from "@/lib/razorpay-verify";

// Razorpay webhook payload shapes (subset of fields we use).
type RazorpayWebhookPayload = {
  event: string;
  payload: {
    payment?: { entity?: { id?: string; order_id?: string } };
    order?: { entity?: { id?: string } };
    payment_link?: { entity?: { id?: string; status?: string } };
  };
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let gateway;
  try {
    gateway = await getActiveRazorpayClient();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 503 });
  }

  if (!gateway.webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 });
  }

  const valid = verifyWebhookSignature({ rawBody, signature, webhookSecret: gateway.webhookSecret });
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: RazorpayWebhookPayload;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  switch (event.event) {
    case "payment.captured":
    case "order.paid": {
      const razorpayOrderId = event.payload.order?.entity?.id ?? event.payload.payment?.entity?.order_id;
      const razorpayPaymentId = event.payload.payment?.entity?.id;
      if (razorpayOrderId) {
        await prisma.order.updateMany({
          where: { razorpayOrderId, status: { not: "PAID" } },
          data: { status: "PAID", razorpayPaymentId },
        });
      }
      break;
    }
    case "payment.failed": {
      const razorpayOrderId = event.payload.payment?.entity?.order_id;
      if (razorpayOrderId) {
        await prisma.order.updateMany({
          where: { razorpayOrderId, status: "CREATED" },
          data: { status: "FAILED" },
        });
      }
      break;
    }
    case "payment_link.paid": {
      const linkId = event.payload.payment_link?.entity?.id;
      if (linkId) {
        await prisma.paymentLink.updateMany({
          where: { razorpayPaymentLinkId: linkId },
          data: { status: "PAID" },
        });
      }
      break;
    }
    case "payment_link.cancelled": {
      const linkId = event.payload.payment_link?.entity?.id;
      if (linkId) {
        await prisma.paymentLink.updateMany({
          where: { razorpayPaymentLinkId: linkId },
          data: { status: "CANCELLED" },
        });
      }
      break;
    }
    case "payment_link.expired": {
      const linkId = event.payload.payment_link?.entity?.id;
      if (linkId) {
        await prisma.paymentLink.updateMany({
          where: { razorpayPaymentLinkId: linkId },
          data: { status: "EXPIRED" },
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
