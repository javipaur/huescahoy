import Link from "next/link";
import { Instagram } from "lucide-react";
import { Logo } from "./logo";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-sand bg-sand/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-4 sm:px-6">
        <div className="sm:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-choco-muted">
            {site.tagline}. Agenda cultural y de ocio de {site.city}, en tu
            bolsillo.
          </p>
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-2 text-sm font-semibold text-choco transition hover:bg-sand"
          >
            <Instagram className="h-4 w-4 text-brand" />
            Seguir en Instagram
          </a>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-choco-muted">
            Explora
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/" className="text-choco hover:text-brand">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/agenda" className="text-choco hover:text-brand">
                Agenda completa
              </Link>
            </li>
            <li>
              <Link href="/agenda?desde=hoy" className="text-choco hover:text-brand">
                Qué hay hoy
              </Link>
            </li>
            <li>
              <Link href="/planes" className="text-choco hover:text-brand">
                Planes y guías
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-choco-muted">
            Colabora
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/colabora#formulario" className="text-choco hover:text-brand">
                Reportar un problema
              </Link>
            </li>
            <li>
              <Link href="/colabora#formulario" className="text-choco hover:text-brand">
                Sugerir una mejora
              </Link>
            </li>
            <li>
              <Link href="/colabora#formulario" className="text-choco hover:text-brand">
                Proponer un evento
              </Link>
            </li>
            <li>
              <Link href="/colabora" className="text-choco-muted hover:text-brand">
                Huesca Hoy entre todos
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-xs text-choco-muted/70">
            Todas las aportaciones llegan por el formulario web y quedan
            registradas. Sin correos expuestos.
          </p>
          <p className="mt-2 text-xs text-choco-muted/70">
            © {new Date().getFullYear()} {site.name}. Hecho en Huesca.
          </p>
        </div>
      </div>
    </footer>
  );
}
