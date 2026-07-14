"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export function AddToCartButton({
  product,
}: {
  product: { productId: string; name: string; priceInPaise: number };
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function onClick() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
        added ? "bg-success-muted text-success-strong" : "bg-primary text-primary-foreground hover:bg-primary-hover"
      }`}
    >
      {added && (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" className="size-4">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
        </svg>
      )}
      {added ? "Added" : "Add to cart"}
    </button>
  );
}
