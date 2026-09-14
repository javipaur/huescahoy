import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bug,
  CalendarPlus,
  CheckCircle2,
  Handshake,
  Inbox,
  Instagram,
  Lightbulb,
  MessageCircleHeart,
  SearchCheck,
  Users,
} from "lucide-react";
import { SuggestForm } from "@/components/suggest-form";
import { SubmitEventForm } from "@/components/submit-event-form";
import { PhotoCredit } from "@/components/photo-credit";
import { photos } from "@/lib/photos";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Colabora con Huesca Hoy, entre todos",
  description:
    "Publica tu evento en la agenda, reporta problemas y sugiere mejoras. Huesca Hoy se construye entre todos.",
  alternates: {
    canonical: "/colabora",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    title: "Colabora con Huesca Hoy",
    description:
      "Publica tu evento en la agenda, reporta problemas y sugiere mejoras. La agenda cultural de Huesca se construye entre todos.",
    images: [{ url: "/opengraph-image" }],
  },
};

const STEPS = [
  {
    Icon: Inbox,
    title: "Nos llega tu mensaje",
    text: "Rellenas el formulario y entra directo en la cola. Sin correos que se pierdan.",
  },
  {
    Icon: SearchCheck,
    title: "Lo lee una persona",
    text: "Revisamos cada aportación a mano: se nota cuando lo hace un humano, no un bot.",
  },
  {
    Icon: CheckCircle2,
    title: "Lo resolvemos",
    text: "Publicamos el evento o corregimos el fallo, y te avisamos si nos dejaste contacto.",
  },
];

const TARGETS = [
  {
    Icon: CalendarPlus,
    title: "Publica tu evento",
    text: "Llega a toda la ciudad de forma gratuita y sin registros.",
    href: "#publica",
    cta: "Rellenar el formulario",
  },
  {
    Icon: Bug,
    title: "Reporta un fallo",
    text: "Un horario mal, un enlace roto, un dato que no cuadra: nos ayuda un montón.",
    href: "#formulario",
    cta: "Contarlo",
  },
  {
    Icon: Lightbulb,
    title: "Propón una idea",
    text: "Se te ocurre cómo mejorar la web o la ciudad: aquí se escucha.",
    href: "#formulario",
    cta: "Compartirla",
  },
];

export default function ColaboraPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-choco dark:bg-ink">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 h-[24rem] w-[24rem] rounded-full bg-brand/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-32 h-[26rem] w-[26rem] rounded-full bg-gold/10 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-semibold text-gold">
              <Handshake className="h-4 w-4" />
              Colabora con Huesca Hoy
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance text-white sm:text-5xl">
              Hagamos la agenda <span className="text-gold">juntos</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              {site.name} no tiene redacción. La alimentan las personas que
              viven {site.city}: tú sabes lo que pasa en tu barrio antes que
              nadie. Publica tu evento, avísanos de un fallo o cuéntanos cómo
              mejorar. Cada aportación la lee una persona.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#publica"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-choco dark:text-ink transition hover:brightness-105"
              >
                <CalendarPlus className="h-5 w-5" />
                Publicar mi evento
              </a>
              <a
                href="#formulario"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:border-gold/40 hover:text-gold"
              >
                O contarnos algo <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="relative mb-8 lg:mb-0">
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50">
              <Image
                src={photos.semanaSanta.url}
                alt={photos.semanaSanta.alt}
                width={1248}
                height={936}
                className="aspect-[4/3] w-full object-cover"
                sizes="(min-width: 1024px) 480px, 100vw"
              />
            </div>
            <div className="absolute -bottom-8 left-5 rounded-2xl bg-cream px-5 py-4 text-choco dark:text-ink shadow-xl">
              <p className="inline-flex items-center gap-2 font-display text-base font-bold">
                <MessageCircleHeart className="h-5 w-5 text-brand" />
                Respuesta humana, no un bot
              </p>
              <p className="mt-0.5 text-xs text-choco-muted">
                Tiempo real de respuesta: hoy mismo
              </p>
            </div>
            <PhotoCredit photo={photos.semanaSanta} className="mt-9 text-white/45" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand-dark">
            <Handshake className="h-3.5 w-3.5" />
            Cómo funciona
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Tres pasos, sin vueltas
          </h2>
          <p className="mt-2 text-choco-muted">
            Lo hicimos deliberadamente simple: sin crear cuentas, sin contraseñas,
            sin esperas.
          </p>
        </div>

        <ol className="grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.Icon;
            return (
              <li
                key={step.title}
                className="relative rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 shadow-sm"
              >
                <span className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-brand/10 font-display text-base font-extrabold text-brand-dark">
                  {index + 1}
                </span>
                <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand-dark">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="relative mt-4 font-display text-lg font-bold text-choco dark:text-ink">
                  {step.title}
                </h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-choco-muted">
                  {step.text}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <div
              id="publica"
              className="scroll-mt-24 overflow-hidden rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-sand bg-brand/5 px-6 py-4 sm:px-8">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white">
                  <CalendarPlus className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                    Publica tu evento
                  </h2>
                  <p className="text-xs text-choco-muted">
                    Gratis y sin registros. Revisión rápida antes de publicar.
                  </p>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <SubmitEventForm />
              </div>
            </div>

            <div
              id="formulario"
              className="scroll-mt-24 overflow-hidden rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-sand bg-sand/60 px-6 py-4 sm:px-8">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-choco dark:bg-ink text-white">
                  <Lightbulb className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                    Cuéntanos tu idea o problema
                  </h2>
                  <p className="text-xs text-choco-muted">
                    Es la única vía de contacto. Tardas menos de un minuto.
                  </p>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <SuggestForm />
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white shadow-sm">
                <Instagram className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-choco dark:text-ink">
                Síguenos en Instagram
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-choco-muted">
                Cada día los planes de {site.city}, historias de la agenda y
                avisos de nuevos eventos. Síguenos en{" "}
                <span className="font-semibold text-choco dark:text-ink">{site.instagramHandle}</span>.
              </p>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-choco dark:bg-ink px-5 py-2.5 font-semibold text-white transition hover:bg-choco/90 dark:bg-ink/90"
              >
                <Instagram className="h-4 w-4" />
                Seguir en Instagram
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-3 text-xs text-choco-muted/70">
                ¿Tienes una petición? El formulario llega directa y queda
                registrada. El chat de Instagram, no tanto.
              </p>
            </div>

            <div className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-choco dark:text-ink">
                ¿Para quién es esto?
              </h3>
              <ul className="mt-4 space-y-4">
                {TARGETS.map((target) => {
                  const Icon = target.Icon;
                  return (
                    <li key={target.title} className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-dark">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-choco dark:text-ink">
                          {target.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-choco-muted">
                          {target.text}{" "}
                          <a
                            href={target.href}
                            className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
                          >
                            {target.cta}
                          </a>
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl bg-choco dark:bg-ink p-6 text-white">
              <Users className="h-6 w-6 text-gold" />
              <h3 className="mt-3 font-display text-lg font-bold">
                Huesca es de los suyos
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-white/70">
                Cuantos más eventos y avisos recibamos, más viva estará la
                agenda para todo el mundo. Sin ti, no sería lo mismo.
              </p>
              <Link
                href="/agenda"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold transition hover:brightness-110"
              >
                Ver la agenda <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-sand bg-sand/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              ¿Prefieres contárnoslo cara a cara?
            </h2>
            <p className="mt-2 text-choco-muted">
              Escríbenos por Instagram: leemos todos los mensajes. Para
              eventos, el formulario sigue siendo la vía más rápida.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/agenda"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
              >
                Volver a la agenda <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 px-6 py-3 font-semibold text-choco dark:text-ink transition hover:bg-sand"
              >
                <Instagram className="h-4 w-4 text-brand" />
                {site.instagramHandle}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
