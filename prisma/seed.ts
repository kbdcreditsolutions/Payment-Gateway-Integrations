import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { encryptSecret } from "../src/lib/crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const keyId = process.env.SEED_RAZORPAY_KEY_ID;
  const keySecret = process.env.SEED_RAZORPAY_KEY_SECRET;

  if (keyId && keySecret) {
    await prisma.gatewayConfig.upsert({
      where: { provider: "razorpay" },
      create: {
        provider: "razorpay",
        keyId,
        keySecretEncrypted: encryptSecret(keySecret),
        enabled: true,
      },
      update: {},
    });
    console.log("Gateway config seeded from SEED_RAZORPAY_KEY_ID/SEED_RAZORPAY_KEY_SECRET.");
  } else {
    console.log(
      "Skipped gateway config (SEED_RAZORPAY_KEY_ID/SEED_RAZORPAY_KEY_SECRET not set) — configure it in /admin/settings instead."
    );
  }

  const products = [
    { name: "Wireless Mouse", description: "Ergonomic 2.4GHz wireless mouse.", priceInPaise: 79900 },
    { name: "Mechanical Keyboard", description: "Hot-swappable mechanical keyboard.", priceInPaise: 349900 },
    { name: "USB-C Hub", description: "7-in-1 USB-C hub with HDMI and SD card reader.", priceInPaise: 199900 },
    { name: "Laptop Stand", description: "Adjustable aluminium laptop stand.", priceInPaise: 129900 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name.toLowerCase().replace(/\s+/g, "-") },
      create: { id: product.name.toLowerCase().replace(/\s+/g, "-"), ...product },
      update: {},
    });
  }

  console.log("Seed complete: gateway config + sample products.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
