"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function ShopHeader() {
  const { totalItems } = useCart();

  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold">
          Acme Store
        </Link>
        <Link href="/cart" className="text-sm underline underline-offset-4">
          Cart {totalItems > 0 && `(${totalItems})`}
        </Link>
      </div>
    </header>
  );
}
