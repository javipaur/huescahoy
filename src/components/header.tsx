import Link from "next/link";
import { CalendarDays, Instagram } from "lucide-react";
import { Logo } from "./logo";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-sand bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-choco-muted transition hover:bg-sand hover:text-choco md:inline-block"
          >
            Inicio
          </Link>
          <Link
            href="/agenda"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-choco-muted transition hover:bg-sand hover:text-choco"
          >
            Agenda
          </Link>
          <Link
            href="/planes"
            className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-choco-muted transition hover:bg-sand hover:text-choco sm:inline-block"
          >
            Planes
          </Link>
          <Link
            href="/colabora"
            className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-choco-muted transition hover:bg-sand hover:text-choco sm:inline-block"
          >
            Colabora
          </Link>
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Síguenos en Instagram"
            className="grid h-9 w-9 place-items-center rounded-full text-choco-muted transition hover:bg-sand hover:text-choco"
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
      </div>
    </header>
  );
}
