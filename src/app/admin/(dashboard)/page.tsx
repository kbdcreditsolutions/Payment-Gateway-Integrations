import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getGatewayConfigForDisplay } from "@/lib/gateway-config";

const ICONS = {
  orders: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" className="size-5 text-primary">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M6 3h9l3 3v15H6z" />
      <path stroke="currentColor" strokeLinecap="round" d="M9 10h6M9 14h6M9 18h3" />
    </svg>
  ),
  paid: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" className="size-5 text-success-strong">
      <circle cx="12" cy="12" r="9" stroke="currentColor" />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  ),
  links: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" className="size-5 text-warning-strong">
      <path stroke="currentColor" strokeLinecap="round" d="M9 12a4 4 0 0 0 5.66 0l2.83-2.83a4 4 0 1 0-5.66-5.66l-1.5 1.5" />
      <path stroke="currentColor" strokeLinecap="round" d="M15 12a4 4 0 0 0-5.66 0L6.5 14.83a4 4 0 1 0 5.66 5.66l1.5-1.5" />
    </svg>
  ),
};

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
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your Razorpay integration.</p>
      </div>

      <div
        className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${
          config?.enabled
            ? "border-success/20 bg-success-muted text-success-strong"
            : "border-warning/20 bg-warning-muted text-warning-strong"
        }`}
      >
        <span className={`flex size-2 shrink-0 rounded-full ${config?.enabled ? "bg-success" : "bg-warning"}`} />
        {config?.enabled ? (
          <span>
            Razorpay is <strong className="font-semibold">enabled</strong> with key{" "}
            <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10">{config.keyId}</code>
          </span>
        ) : config ? (
          <span>
            Razorpay is configured but currently <strong className="font-semibold">disabled</strong>.{" "}
            <Link href="/admin/settings" className="font-medium underline underline-offset-2">
              Enable it in Gateway Settings
            </Link>
          </span>
        ) : (
          <span>
            Razorpay is not configured yet.{" "}
            <Link href="/admin/settings" className="font-medium underline underline-offset-2">
              Set it up now
            </Link>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={ICONS.orders} label="Total orders" value={orderCount} href="/admin/orders" />
        <StatCard icon={ICONS.paid} label="Paid orders" value={paidOrderCount} href="/admin/orders" />
        <StatCard icon={ICONS.links} label="Payment links created" value={linkCount} href="/admin/payment-links" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <QuickLink
          href="/admin/settings"
          title="Gateway Settings"
          description="Set or replace your Razorpay keys, enable/disable payments."
        />
        <QuickLink
          href="/admin/payment-links"
          title="Payment Links"
          description="Generate a shareable Razorpay payment link."
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="glass group flex flex-col gap-3 rounded-2xl p-5 transition-all duration-150 hover:-translate-y-0.5"
    >
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">{icon}</div>
      <div>
        <div className="font-heading text-3xl font-semibold tracking-tight">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </Link>
  );
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="glass flex flex-col gap-1 rounded-2xl p-5 transition-all duration-150 hover:-translate-y-0.5"
    >
      <span className="font-heading font-medium">{title}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </Link>
  );
}
