"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" className="size-5">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" />
      <rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" />
      <rect x="13" y="10" width="8" height="11" rx="2" stroke="currentColor" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" className="size-5">
      <circle cx="12" cy="12" r="3" stroke="currentColor" />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
      />
    </svg>
  ),
  links: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" className="size-5">
      <path stroke="currentColor" strokeLinecap="round" d="M9 12a4 4 0 0 0 5.66 0l2.83-2.83a4 4 0 1 0-5.66-5.66l-1.5 1.5" />
      <path stroke="currentColor" strokeLinecap="round" d="M15 12a4 4 0 0 0-5.66 0L6.5 14.83a4 4 0 1 0 5.66 5.66l1.5-1.5" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" className="size-5">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M6 3h9l3 3v15H6z" />
      <path stroke="currentColor" strokeLinecap="round" d="M9 10h6M9 14h6M9 18h3" />
    </svg>
  ),
  store: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" className="size-5">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M4 9V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3M4 9l1 11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1l1-11M4 9h16" />
      <path stroke="currentColor" strokeLinecap="round" d="M9 13a3 3 0 0 0 6 0" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" className="size-5">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M15 17V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2" />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M9 12h12m0 0-3.5-3.5M21 12l-3.5 3.5" />
    </svg>
  ),
};

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/settings", label: "Gateway Settings", icon: "settings" },
  { href: "/admin/payment-links", label: "Payment Links", icon: "links" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="glass sticky top-0 flex h-screen w-64 shrink-0 flex-col rounded-none border-y-0 border-l-0">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-heading text-sm font-bold text-primary-foreground">
          K
        </span>
        <span className="font-heading text-sm font-semibold tracking-tight">KBD Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {ICONS[link.icon]}
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        >
          {ICONS.store}
          View storefront
        </Link>
        <button
          onClick={logout}
          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-destructive-muted hover:text-destructive-strong"
        >
          {ICONS.logout}
          Log out
        </button>
      </div>
    </aside>
  );
}
