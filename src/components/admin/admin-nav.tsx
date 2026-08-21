"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions";

const navItems = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/fuentes", label: "Fuentes" },
  { href: "/admin/planes", label: "Planes" },
  { href: "/admin/sugerencias", label: "Sugerencias" },
  { href: "/admin/suscriptores", label: "Suscriptores" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-choco/10 bg-choco text-cream">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/admin" className="font-display text-lg font-bold">
          Huesca<span className="text-brand">Hoy</span> <span className="text-cream/50">· Admin</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 font-medium transition ${
                  active
                    ? "bg-cream text-choco"
                    : "text-cream/75 hover:bg-cream/10 hover:text-cream"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-3 py-1.5 font-medium text-cream/75 transition hover:bg-cream/10 hover:text-cream"
          >
            Ver web ↗
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full bg-cream px-4 py-1.5 font-semibold text-choco transition hover:bg-cream/85"
            >
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
