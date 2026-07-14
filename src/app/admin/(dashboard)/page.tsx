import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getGatewayConfigForDisplay } from "@/lib/gateway-config";

export default async function AdminDashboardPage() {
  const [config, orderCount, paidOrderCount, linkCount] = await Promise.all([
    getGatewayConfigForDisplay(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.paymentLink.count(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          Overview of your Razorpay integration.
        </p>
      </div>

      <div
        className={`rounded-lg border p-4 text-sm ${
          config?.enabled
            ? "border-green-600/30 bg-green-600/10 text-green-800 dark:text-green-300"
            : "border-amber-600/30 bg-amber-600/10 text-amber-800 dark:text-amber-300"
        }`}
      >
        {config?.enabled ? (
          <span>Razorpay is <strong>enabled</strong> with key <code>{config.keyId}</code>.</span>
        ) : config ? (
          <span>Razorpay is configured but currently <strong>disabled</strong>. Enable it in Gateway Settings.</span>
        ) : (
          <span>
            Razorpay is not configured yet.{" "}
            <Link href="/admin/settings" className="underline">
              Set it up now
            </Link>
            .
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total orders" value={orderCount} />
        <StatCard label="Paid orders" value={paidOrderCount} />
        <StatCard label="Payment links created" value={linkCount} />
      </div>

      <div className="flex gap-4 text-sm">
        <Link href="/admin/settings" className="underline">Gateway Settings</Link>
        <Link href="/admin/payment-links" className="underline">Payment Links</Link>
        <Link href="/admin/orders" className="underline">Orders</Link>
        <Link href="/" className="underline">View storefront</Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-black/10 p-4 dark:border-white/15">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-black/60 dark:text-white/60">{label}</div>
    </div>
  );
}
