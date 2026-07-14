"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function ShopHeader() {
  const { totalItems } = useCart();

  return (
    <header className="glass sticky top-0 z-10 rounded-none border-x-0 border-t-0">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-heading text-sm font-bold text-primary-foreground">
            K
          </span>
          <span className="font-heading text-base font-semibold tracking-tight">KBD Store</span>
        </Link>
        <Link
          href="/cart"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" className="size-5">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6"
            />
            <circle cx="9" cy="20" r="1.4" stroke="currentColor" />
            <circle cx="17" cy="20" r="1.4" stroke="currentColor" />
          </svg>
          Cart
          {totalItems > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
