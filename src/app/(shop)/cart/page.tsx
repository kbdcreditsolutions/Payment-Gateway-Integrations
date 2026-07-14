"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, setQuantity, removeItem, totalInPaise } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Your cart</h1>
        <p className="text-sm text-black/60 dark:text-white/60">Your cart is empty.</p>
        <Link href="/" className="w-fit underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Your cart</h1>

      <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between gap-4 py-4">
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-black/60 dark:text-white/60">
                ₹{(item.priceInPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })} each
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                className="w-16 rounded-md border border-black/15 bg-transparent px-2 py-1 text-sm dark:border-white/20"
              />
              <span className="w-24 text-right text-sm">
                ₹{((item.priceInPaise * item.quantity) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <button
                onClick={() => removeItem(item.productId)}
                className="text-sm text-red-600 underline dark:text-red-400"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/15">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-lg font-semibold">
          ₹{(totalInPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <Link
        href="/checkout"
        className="w-fit rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        Proceed to checkout
      </Link>
    </div>
  );
}
