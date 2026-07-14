import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";

const bodySchema = z.object({
  keyId: z.string().min(1),
  keySecret: z.string().min(1),
});

// Verifies a key_id/key_secret pair against the Razorpay API without persisting anything.
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "key_id and key_secret are required" }, { status: 400 });
  }

  const client = new Razorpay({ key_id: parsed.data.keyId, key_secret: parsed.data.keySecret });

  try {
    await client.orders.all({ count: 1 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      (err as { error?: { description?: string } })?.error?.description ??
      (err as Error).message ??
      "Could not authenticate with Razorpay";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
