"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Mail, Search, UtensilsCrossed } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Inicio", Icon: Home, exact: true },
  { href: "/agenda", label: "Agenda", Icon: CalendarDays, exact: false },
  { href: "/buscar", label: "Buscar", Icon: Search, exact: false },
  { href: "/restaurantes", label: "Comer", Icon: UtensilsCrossed, exact: false },
  { href: "/colabora", label: "Colabora", Icon: Mail, exact: false },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-sand bg-white/90 pb-safe backdrop-blur-xl sm:hidden dark:border-zinc-800 dark:bg-zinc-900/90"
    >
      <div className="flex h-16 items-stretch justify-around">
        {ITEMS.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-[64px] flex-col items-center justify-center gap-0.5 px-2 text-[11px] font-semibold transition-colors ${
                active ? "text-brand-dark" : "text-choco-muted hover:text-choco dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "fill-brand/15" : ""}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
