import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getActiveRazorpayClient } from "@/lib/gateway-config";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(6).optional(),
  }),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { items, customer } = parsed.data;

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, active: true } });
  const productById = new Map(products.map((p) => [p.id, p]));

  if (products.length !== new Set(productIds).size) {
    return NextResponse.json({ error: "One or more products are unavailable" }, { status: 400 });
  }

  const orderItems = items.map((item) => {
    const product = productById.get(item.productId)!;
    return {
      productId: product.id,
      name: product.name,
      priceInPaise: product.priceInPaise,
      quantity: item.quantity,
    };
  });
  const amountInPaise = orderItems.reduce((sum, i) => sum + i.priceInPaise * i.quantity, 0);

  if (amountInPaise <= 0) {
    return NextResponse.json({ error: "Cart total must be greater than zero" }, { status: 400 });
  }

  let gateway;
  try {
    gateway = await getActiveRazorpayClient();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 503 });
  }

  const receipt = `rcpt_${crypto.randomBytes(8).toString("hex")}`;

  let razorpayOrder;
  try {
    razorpayOrder = await gateway.client.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: { customerEmail: customer.email },
    });
  } catch (err) {
    const message =
      (err as { error?: { description?: string } })?.error?.description ??
      (err as Error).message ??
      "Could not create Razorpay order";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      receipt,
      amountInPaise,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      items: { create: orderItems },
    },
  });

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: amountInPaise,
    currency: "INR",
    keyId: gateway.keyId,
  });
}
