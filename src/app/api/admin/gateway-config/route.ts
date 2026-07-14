import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGatewayConfigForDisplay, upsertGatewayConfig } from "@/lib/gateway-config";

export async function GET() {
  try {
    const config = await getGatewayConfigForDisplay();
    return NextResponse.json({ config });
  } catch (err) {
    return NextResponse.json(
      { error: `Could not load gateway config: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}

const bodySchema = z.object({
  keyId: z.string().min(1),
  keySecret: z.string().min(1).optional(),
  webhookSecret: z.string().min(1).optional(),
  enabled: z.boolean(),
});

export async function PUT(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await upsertGatewayConfig(parsed.data);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  const config = await getGatewayConfigForDisplay();
  return NextResponse.json({ config });
}
