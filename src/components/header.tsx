"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Instagram, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { site } from "@/lib/site";

const NAV = [
  { href: "/", label: "Inicio", exact: true },
  { href: "/agenda", label: "Agenda" },
  { href: "/rutas", label: "Rutas" },
  { href: "/restaurantes", label: "Restaurantes" },
  { href: "/buscar", label: "Buscar" },
  { href: "/planes", label: "Planes" },
  { href: "/colabora", label: "Colabora" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean): boolean {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const navLinkClass = (href: string, exact?: boolean) =>
    `rounded-full px-3.5 py-2 text-sm font-medium transition ${
      isActive(href, exact)
        ? "bg-sand text-choco dark:bg-zinc-800 dark:text-zinc-100"
        : "text-choco-muted hover:bg-sand hover:text-choco dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-sand bg-white/85 backdrop-blur dark:bg-zinc-900/85 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 sm:flex sm:gap-2">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClass(item.href, item.exact)}>
              {item.label}
            </Link>
          ))}
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Síguenos en Instagram"
            className="grid h-9 w-9 place-items-center rounded-full text-choco-muted transition hover:bg-sand hover:text-choco dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <Instagram className="h-[18px] w-[18px]" />
          </a>
          <Link
            href="/agenda?desde=hoy"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
          >
            <CalendarDays className="h-4 w-4" />
            Hoy
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/agenda?desde=hoy"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
          >
            <CalendarDays className="h-4 w-4" />
            Hoy
          </Link>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-full text-choco transition hover:bg-sand dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-sand bg-white px-4 pb-5 pt-3 sm:hidden dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-base font-medium transition ${
                  isActive(item.href, item.exact)
                    ? "bg-sand text-choco dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-choco-muted hover:bg-sand hover:text-choco dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 border-t border-sand pt-4">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-sand px-4 py-2.5 text-sm font-semibold text-choco transition hover:bg-sand dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <Instagram className="h-4 w-4 text-brand" />
              Instagram
            </a>
            <Link
              href="/colabora#publica"
              onClick={() => setOpen(false)}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Publica tu evento
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
