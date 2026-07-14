"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, setQuantity, removeItem, totalInPaise } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" className="size-7 text-muted-foreground">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6"
            />
            <circle cx="9" cy="20" r="1.4" stroke="currentColor" />
            <circle cx="17" cy="20" r="1.4" stroke="currentColor" />
          </svg>
        </div>
        <div>
          <h1 className="font-heading text-xl font-semibold">Your cart is empty</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add something from the shop to get started.</p>
        </div>
        <Link
          href="/"
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Your cart</h1>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  ₹{(item.priceInPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })} each
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                  className="w-16 rounded-lg border border-input bg-background px-2 py-1.5 text-center text-sm transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="w-24 text-right text-sm font-medium">
                  ₹{((item.priceInPaise * item.quantity) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors duration-150 hover:bg-destructive-muted hover:text-destructive-strong"
                  aria-label={`Remove ${item.name}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" className="size-4">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.7 12.1a2 2 0 0 1-2 1.9H9.7a2 2 0 0 1-2-1.9L7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between bg-muted px-4 py-4">
          <span className="font-heading text-lg font-semibold">Total</span>
          <span className="font-heading text-lg font-semibold">
            ₹{(totalInPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="w-fit rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
      >
        Proceed to checkout
      </Link>
    </div>
  );
}
