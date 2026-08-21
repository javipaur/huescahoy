"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Compass, Home, Mail } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Inicio", Icon: Home, exact: true },
  { href: "/agenda", label: "Agenda", Icon: CalendarDays, exact: false },
  { href: "/planes", label: "Planes", Icon: Compass, exact: false },
  { href: "/colabora", label: "Colabora", Icon: Mail, exact: false },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-sand bg-white/90 pb-safe backdrop-blur-xl sm:hidden"
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
                active ? "text-brand-dark" : "text-choco-muted hover:text-choco"
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
