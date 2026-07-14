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
  CREATED: "bg-amber-600/10 text-amber-800 dark:text-amber-300",
  PAID: "bg-green-600/10 text-green-800 dark:text-green-300",
  CANCELLED: "bg-black/10 text-black/60 dark:bg-white/10 dark:text-white/60",
  EXPIRED: "bg-red-600/10 text-red-800 dark:text-red-300",
};

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
        <h1 className="text-2xl font-semibold">Payment Links</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          Generate a Razorpay payment link to share with a customer directly.
        </p>
      </div>

      <form onSubmit={onCreate} className="flex max-w-lg flex-col gap-4 rounded-lg border border-black/10 p-4 dark:border-white/15">
        {error && <p className="rounded-md bg-red-600/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Amount (INR)
            <input
              type="number"
              min="1"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-md border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Description
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Invoice #123"
              className="rounded-md border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
            />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Customer name
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="rounded-md border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="rounded-md border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Phone
            <input
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
              className="rounded-md border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="w-fit rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {creating ? "Generating..." : "Generate link"}
        </button>
      </form>

      <div>
        <h2 className="mb-3 text-lg font-medium">Recent links</h2>
        {loading ? (
          <p className="text-sm text-black/60 dark:text-white/60">Loading...</p>
        ) : links.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">No payment links yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-black/10 text-black/60 dark:border-white/15 dark:text-white/60">
                <tr>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Link</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b border-black/5 dark:border-white/10">
                    <td className="py-2 pr-4">{link.description}</td>
                    <td className="py-2 pr-4">
                      ₹{(link.amountInPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[link.status]}`}>
                        {link.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <button onClick={() => copy(link)} className="underline">
                        {copiedId === link.id ? "Copied!" : "Copy link"}
                      </button>
                    </td>
                    <td className="py-2 text-black/60 dark:text-white/60">
                      {new Date(link.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
