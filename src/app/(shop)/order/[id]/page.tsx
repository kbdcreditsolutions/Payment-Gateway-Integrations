import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/enums";

type Tone = "success" | "warning" | "destructive";

const STATUS_META: Record<OrderStatus, { label: string; tone: Tone }> = {
  PAID: { label: "Payment successful — thank you for your order!", tone: "success" },
  CREATED: { label: "Payment pending.", tone: "warning" },
  FAILED: { label: "Payment failed. Please try again.", tone: "destructive" },
};

const TONE_STYLES: Record<Tone, string> = {
  success: "bg-success-muted text-success-strong border-success/20",
  warning: "bg-warning-muted text-warning-strong border-warning/20",
  destructive: "bg-destructive-muted text-destructive-strong border-destructive/20",
};

export default async function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });

  if (!order) {
    notFound();
  }

  const status = STATUS_META[order.status];

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="text-center">
        {status.tone === "success" && (
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-success-muted">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="size-7 text-success-strong">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
            </svg>
          </div>
        )}
        <h1 className="font-heading text-2xl font-semibold">Order {order.receipt}</h1>
      </div>

      <p className={`rounded-lg border px-3 py-2 text-center text-sm font-medium ${TONE_STYLES[status.tone]}`}>
        {status.label}
      </p>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-col divide-y divide-border p-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>
                ₹{((item.priceInPaise * item.quantity) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between bg-muted px-4 py-3 font-heading font-semibold">
          <span>Total</span>
          <span>₹{(order.amountInPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <Link
        href="/"
        className="mx-auto rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
      >
        Back to shop
      </Link>
    </div>
  );
}
