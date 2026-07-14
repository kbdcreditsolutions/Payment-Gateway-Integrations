"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/lib/cart-context";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const { items, totalInPaise, clear } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-2xl font-semibold">Checkout</h1>
        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!scriptReady || !window.Razorpay) {
      setError("Payment SDK is still loading, try again in a second.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customer: { name, email, phone: phone || undefined },
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error?.formErrors?.join(", ") ?? data.error ?? "Could not start checkout");
      return;
    }

    const razorpay = new window.Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "KBD Store",
      description: "Order payment",
      order_id: data.razorpayOrderId,
      prefill: { name, email, contact: phone },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const verifyRes = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderId, ...response }),
        });
        const verifyData = await verifyRes.json();
        setLoading(false);
        if (verifyRes.ok && verifyData.ok) {
          clear();
          router.push(`/order/${data.orderId}`);
        } else {
          setError(verifyData.error ?? "Payment verification failed");
        }
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
      theme: { color: "#7c3aed" },
    });

    razorpay.open();
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setScriptReady(true)} />
      <div className="flex max-w-md flex-col gap-6">
        <h1 className="font-heading text-2xl font-semibold">Checkout</h1>

        <div className="glass flex flex-col gap-2 rounded-2xl p-4">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.name} × {item.quantity}
              </span>
              <span>
                ₹{((item.priceInPaise * item.quantity) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          <div className="mt-1 flex justify-between border-t border-border pt-2 font-heading font-semibold">
            <span>Total</span>
            <span>₹{(totalInPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {error && <p className="rounded-lg bg-destructive-muted px-3 py-2 text-sm text-destructive-strong">{error}</p>}

        <form onSubmit={onSubmit} className="glass flex flex-col gap-4 rounded-2xl p-6">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Full name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Phone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9999999999"
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-1 cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Processing..." : "Pay now"}
          </button>
        </form>
      </div>
    </>
  );
}
