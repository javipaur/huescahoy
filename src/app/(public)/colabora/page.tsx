import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarPlus,
  CheckCircle2,
  Handshake,
  Inbox,
  Instagram,
  SearchCheck,
  Users,
} from "lucide-react";
import { SuggestForm } from "@/components/suggest-form";
import { SubmitEventForm } from "@/components/submit-event-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Colabora — Huesca Hoy entre todos",
  description:
    "Publica tu evento en la agenda, reporta problemas y sugiere mejoras. Huesca Hoy se construye entre todos.",
};

const STEPS = [
  {
    Icon: Inbox,
    title: "Lo recibimos",
    text: "Tu aportación queda registrada en el formulario y nos llega al momento.",
  },
  {
    Icon: SearchCheck,
    title: "Lo revisamos",
    text: "Confirmamos los datos y decidimos cómo actuar. Sin correos que se pierdan.",
  },
  {
    Icon: CheckCircle2,
    title: "Lo resolvemos",
    text: "Corregimos el error o publicamos el evento. Te avisamos si lo pediste.",
  },
];

export default function ColaboraPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 h-[24rem] w-[24rem] rounded-full bg-gold/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-4 py-1.5 text-sm font-semibold text-brand">
            <Handshake className="h-4 w-4" />
            Huesca Hoy entre todos
          </span>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl">
            La agenda se construye <span className="text-brand">entre todos</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-choco-muted">
            Huesca Hoy crece gracias a las personas que viven la ciudad. Publica
            tu evento en la agenda, reporta un error o cuéntanos cómo mejorarlo:
            cada aportación cuenta.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
          <div
            id="publica"
            className="scroll-mt-24 rounded-2xl border border-sand bg-white p-6 shadow-sm sm:p-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
              <CalendarPlus className="h-3.5 w-3.5" />
              Nuevo
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">
              Publica tu evento
            </h2>
            <p className="mt-1 text-sm text-choco-muted">
              ¿Organizas algo en {site.city}? Rellena el formulario y lo
              añadimos a la agenda tras una revisión rápida. Gratis y sin
              registros.
            </p>
            <div className="mt-6">
              <SubmitEventForm />
            </div>
          </div>

          <div
            id="formulario"
            className="scroll-mt-24 rounded-2xl border border-sand bg-white p-6 shadow-sm sm:p-8"
          >
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Cuéntanos tu idea o problema
            </h2>
            <p className="mt-1 text-sm text-choco-muted">
              Es la única vía de contacto: sin correos expuestos, sin mensajes
              que se pierdan. Tardas menos de un minuto.
            </p>
            <div className="mt-6">
              <SuggestForm />
            </div>
          </div>
        </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-sand bg-white p-6 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white shadow-sm">
                <Instagram className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-choco">
                Síguenos en Instagram
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-choco-muted">
                Cada día los planes de {site.city}, historias de la agenda y
                avisos de nuevos eventos. Síguenos en{" "}
                <span className="font-semibold text-choco">{site.instagramHandle}</span>.
              </p>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-choco px-5 py-2.5 font-semibold text-cream transition hover:bg-choco/90"
              >
                <Instagram className="h-4 w-4" />
                Seguir en Instagram
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <p className="mt-3 text-xs text-choco-muted/70">
                ¿Tienes una petición? Usa el formulario: llegará directa y
                quedará registrada.
              </p>
            </div>

            <div className="rounded-2xl border border-sand bg-white p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-choco">
                Así lo gestionamos
              </h3>
              <ul className="mt-4 space-y-4">
                {STEPS.map((step, index) => {
                  const Icon = step.Icon;
                  return (
                    <li key={step.title} className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-choco">
                          {index + 1}. {step.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-choco-muted">
                          {step.text}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-sand bg-sand/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display font-semibold text-choco">
                  ¿Eres una entidad?
                </p>
                <p className="mt-1 text-sm text-choco-muted">
                  Comparte tus actividades y llega a toda la ciudad de forma
                  gratuita.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <CalendarPlus className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display font-semibold text-choco">
                  ¿Organizas algo?
                </p>
                <p className="mt-1 text-sm text-choco-muted">
                  <Link href="#publica" className="font-semibold text-brand underline underline-offset-2">
                    Publica tu evento
                  </Link>{" "}
                  y aparecerá en la agenda tras una revisión rápida.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <Handshake className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display font-semibold text-choco">
                  ¿Algo no cuadra?
                </p>
                <p className="mt-1 text-sm text-choco-muted">
                  Reporta el error en el formulario y lo corregimos en cuanto
                  podamos.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/agenda"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
            >
              Volver a la agenda
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
