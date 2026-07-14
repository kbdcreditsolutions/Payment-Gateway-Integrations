import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret, maskSecret } from "@/lib/crypto";

const PROVIDER = "razorpay";

export type GatewayConfigView = {
  keyId: string;
  keySecretMasked: string;
  enabled: boolean;
  hasWebhookSecret: boolean;
  updatedAt: Date;
} | null;

export async function getGatewayConfigForDisplay(): Promise<GatewayConfigView> {
  const config = await prisma.gatewayConfig.findUnique({ where: { provider: PROVIDER } });
  if (!config) return null;
  return {
    keyId: config.keyId,
    keySecretMasked: maskSecret(decryptSecret(config.keySecretEncrypted)),
    enabled: config.enabled,
    hasWebhookSecret: !!config.webhookSecretEncrypted,
    updatedAt: config.updatedAt,
  };
}

export async function upsertGatewayConfig(input: {
  keyId: string;
  keySecret?: string;
  webhookSecret?: string;
  enabled: boolean;
}) {
  const existing = await prisma.gatewayConfig.findUnique({ where: { provider: PROVIDER } });

  const keySecretEncrypted = input.keySecret
    ? encryptSecret(input.keySecret)
    : existing?.keySecretEncrypted;

  if (!keySecretEncrypted) {
    throw new Error("key_secret is required when no gateway config exists yet");
  }

  const webhookSecretEncrypted = input.webhookSecret
    ? encryptSecret(input.webhookSecret)
    : existing?.webhookSecretEncrypted;

  return prisma.gatewayConfig.upsert({
    where: { provider: PROVIDER },
    create: {
      provider: PROVIDER,
      keyId: input.keyId,
      keySecretEncrypted,
      webhookSecretEncrypted,
      enabled: input.enabled,
    },
    update: {
      keyId: input.keyId,
      keySecretEncrypted,
      webhookSecretEncrypted,
      enabled: input.enabled,
    },
  });
}

// Throws if the gateway isn't configured or has been disabled by the admin.
export async function getActiveRazorpayClient(): Promise<{
  client: Razorpay;
  keyId: string;
  keySecret: string;
  webhookSecret: string | null;
}> {
  const config = await prisma.gatewayConfig.findUnique({ where: { provider: PROVIDER } });
  if (!config) {
    throw new Error("Razorpay is not configured yet. Set it up in the admin portal.");
  }
  if (!config.enabled) {
    throw new Error("Razorpay payments are currently disabled in the admin portal.");
  }
  const keySecret = decryptSecret(config.keySecretEncrypted);
  const webhookSecret = config.webhookSecretEncrypted ? decryptSecret(config.webhookSecretEncrypted) : null;
  return {
    client: new Razorpay({ key_id: config.keyId, key_secret: keySecret }),
    keyId: config.keyId,
    keySecret,
    webhookSecret,
  };
}

export async function isGatewayEnabled(): Promise<boolean> {
  const config = await prisma.gatewayConfig.findUnique({ where: { provider: PROVIDER } });
  return !!config?.enabled;
}
