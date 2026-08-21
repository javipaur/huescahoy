import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Instagram, Rss, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { site } from "@/lib/site";
import { NewsletterForm } from "@/components/newsletter-form";
import { PushSubscribeButton } from "@/components/push-button";

const TRUST = [
  { Icon: Wallet, text: "100 % gratis, sin sorpresas" },
  { Icon: ShieldCheck, text: "Sin cookies ni rastreo" },
  { Icon: Sparkles, text: "Hecho a mano en Huesca" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-choco text-cream">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1.1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Huesca Hoy">
              <Image
                src="/logo.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl object-cover shadow-sm"
              />
              <span className="font-display text-xl font-bold tracking-tight text-cream">
                Huesca<span className="text-gold">Hoy</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">
              {site.tagline}. Reunimos la agenda cultural y de ocio de{" "}
              {site.city} en un solo sitio, gratis y entre todos.
            </p>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-cream transition hover:border-gold/40 hover:text-gold"
            >
              <Instagram className="h-4 w-4 text-gold" />
              Seguir en Instagram
            </a>
            <div className="mt-3">
              <PushSubscribeButton tone="dark" />
            </div>
            <NewsletterForm />
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-cream/50">
              La agenda
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/agenda?desde=hoy" className="text-cream/80 transition hover:text-gold">
                  Qué hay hoy
                </Link>
              </li>
              <li>
                <Link href="/agenda?desde=finde" className="text-cream/80 transition hover:text-gold">
                  Este fin de semana
                </Link>
              </li>
              <li>
                <Link href="/agenda?desde=mes" className="text-cream/80 transition hover:text-gold">
                  Este mes
                </Link>
              </li>
              <li>
                <Link href="/agenda" className="text-cream/80 transition hover:text-gold">
                  Agenda completa
                </Link>
              </li>
              <li>
                <Link href="/planes" className="text-cream/80 transition hover:text-gold">
                  La magia de Huesca
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-cream/50">
              Colabora
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/colabora#publica" className="text-cream/80 transition hover:text-gold">
                  Publica tu evento
                </Link>
              </li>
              <li>
                <Link href="/colabora#formulario" className="text-cream/80 transition hover:text-gold">
                  Reportar un problema
                </Link>
              </li>
              <li>
                <Link href="/colabora#formulario" className="text-cream/80 transition hover:text-gold">
                  Sugerir una mejora
                </Link>
              </li>
              <li>
                <Link href="/colabora" className="text-cream/80 transition hover:text-gold">
                  Huesca Hoy entre todos
                </Link>
              </li>
              <li>
                <Link
                  href="/api/agenda.ics"
                  className="inline-flex items-center gap-1.5 text-cream/80 transition hover:text-gold"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  Agenda de la semana (.ics)
                </Link>
              </li>
              <li>
                <Link
                  href="/feed.xml"
                  className="inline-flex items-center gap-1.5 text-cream/80 transition hover:text-gold"
                >
                  <Rss className="h-3.5 w-3.5" />
                  RSS de eventos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-cream/50">
              Así trabajamos
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {TRUST.map((item) => {
                const Icon = item.Icon;
                return (
                  <li key={item.text} className="flex items-center gap-2.5 text-cream/80">
                    <Icon className="h-4 w-4 shrink-0 text-gold" />
                    {item.text}
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-cream/55">
              Todas las aportaciones entran por el formulario web y quedan
              registradas. Sin correos expuestos.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-cream/55 sm:px-6">
          <p>
            © {year} {site.name}. Hecho a mano en Huesca, con cariño.
          </p>
          <p>Fotografías: Wikimedia Commons</p>
        </div>
      </div>
    </footer>
  );
}
