import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const STATUS_COPY: Record<string, string> = {
  PAID: "Payment successful — thank you for your order!",
  CREATED: "Payment pending.",
  FAILED: "Payment failed. Please try again.",
};

export default async function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });

  if (!order) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Order {order.receipt}</h1>
      <p className="text-sm">{STATUS_COPY[order.status]}</p>

      <div className="rounded-md border border-black/10 p-4 text-sm dark:border-white/15">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between py-1">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>₹{((item.priceInPaise * item.quantity) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-black/10 pt-2 font-medium dark:border-white/15">
          <span>Total</span>
          <span>₹{(order.amountInPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <Link href="/" className="w-fit underline">
        Back to shop
      </Link>
    </div>
  );
}
