import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActiveRazorpayClient } from "@/lib/gateway-config";

export async function GET() {
  const links = await prisma.paymentLink.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ links });
}

const bodySchema = z.object({
  amount: z.number().positive(), // rupees
  description: z.string().min(1).max(255),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerContact: z.string().optional(),
  referenceId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { amount, description, customerName, customerEmail, customerContact, referenceId } = parsed.data;

  let gateway;
  try {
    gateway = await getActiveRazorpayClient();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 503 });
  }

  const amountInPaise = Math.round(amount * 100);

  const customer =
    customerName || customerEmail || customerContact
      ? {
          name: customerName || undefined,
          email: customerEmail || undefined,
          contact: customerContact || undefined,
        }
      : undefined;

  let razorpayLink;
  try {
    razorpayLink = await gateway.client.paymentLink.create({
      amount: amountInPaise,
      currency: "INR",
      description,
      reference_id: referenceId || undefined,
      ...(customer ? { customer } : {}),
      notify: { sms: !!customerContact, email: !!customerEmail },
      reminder_enable: true,
    } as Parameters<typeof gateway.client.paymentLink.create>[0]);
  } catch (err) {
    const message =
      (err as { error?: { description?: string } })?.error?.description ??
      (err as Error).message ??
      "Could not create payment link";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const link = await prisma.paymentLink.create({
    data: {
      razorpayPaymentLinkId: razorpayLink.id,
      shortUrl: razorpayLink.short_url,
      amountInPaise,
      currency: "INR",
      description,
      referenceId: referenceId || undefined,
      customerName: customerName || undefined,
      customerEmail: customerEmail || undefined,
      customerContact: customerContact || undefined,
    },
  });

  return NextResponse.json({ link });
}
