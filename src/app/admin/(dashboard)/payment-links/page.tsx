"use client";

import { useEffect, useState } from "react";

type Link = {
  id: string;
  razorpayPaymentLinkId: string;
  shortUrl: string;
  amountInPaise: number;
  currency: string;
  description: string | null;
  status: "CREATED" | "PAID" | "CANCELLED" | "EXPIRED";
  customerName: string | null;
  createdAt: string;
};

const STATUS_STYLES: Record<Link["status"], string> = {
  CREATED: "bg-warning-muted text-warning-strong",
  PAID: "bg-success-muted text-success-strong",
  CANCELLED: "bg-muted text-muted-foreground",
  EXPIRED: "bg-destructive-muted text-destructive-strong",
};

const inputClass =
  "rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring";

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerContact, setCustomerContact] = useState("");

  async function loadLinks() {
    const res = await fetch("/api/admin/payment-links");
    const data = await res.json();
    setLinks(data.links ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadLinks();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    const res = await fetch("/api/admin/payment-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        description,
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
        customerContact: customerContact || undefined,
      }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error ? JSON.stringify(data.error) : "Failed to create payment link");
      return;
    }
    setAmount("");
    setDescription("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerContact("");
    loadLinks();
  }

  function copy(link: Link) {
    navigator.clipboard.writeText(link.shortUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Payment Links</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate a Razorpay payment link to share with a customer directly.
        </p>
      </div>

      <form onSubmit={onCreate} className="glass flex max-w-lg flex-col gap-4 rounded-2xl p-6">
        {error && <p className="rounded-lg bg-destructive-muted px-3 py-2 text-sm text-destructive-strong">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Amount (INR)
            <input
              type="number"
              min="1"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Description
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Invoice #123"
              className={inputClass}
            />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Customer name
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Phone
            <input
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="w-fit cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? "Generating..." : "Generate link"}
        </button>
      </form>

      <div>
        <h2 className="mb-3 font-heading text-lg font-medium">Recent links</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : links.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No payment links yet. Generate one above.
          </div>
        ) : (
          <div className="glass overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Link</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {links.map((link) => (
                    <tr key={link.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">{link.description}</td>
                      <td className="px-4 py-3 font-medium">
                        ₹{(link.amountInPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[link.status]}`}>
                          {link.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => copy(link)}
                          className="cursor-pointer font-medium text-primary hover:text-primary-hover"
                        >
                          {copiedId === link.id ? "Copied!" : "Copy link"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(link.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
