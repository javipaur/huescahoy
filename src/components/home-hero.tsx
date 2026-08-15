import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Layers,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { InstallButton } from "@/components/pwa/install-button";
import { PhotoCredit } from "@/components/photo-credit";
import { photos } from "@/lib/photos";
import type { CategoryWithCount } from "@/lib/types";

export function HomeHero({
  stats,
  categories,
}: {
  stats: { upcoming: number; categories: number };
  categories: CategoryWithCount[];
}) {
  const chips = categories.slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-choco">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-brand/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-56 -left-40 h-[26rem] w-[26rem] rounded-full bg-gold/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-semibold text-gold">
            <CalendarDays className="h-4 w-4" />
            Cada día en Huesca
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance text-cream sm:text-6xl">
            Huesca entera,
            <br />
            en una <span className="text-gold">agenda</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/70">
            Reunimos cada día los conciertos, el teatro, el deporte, el cine y
            los planes en familia que hay en la ciudad. Gratis, sin anuncios y
            siempre al día.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/agenda"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-choco shadow-sm shadow-gold/20 transition hover:brightness-105"
            >
              Ver la agenda
              <ArrowRight className="h-5 w-5" />
            </Link>
            <InstallButton tone="dark-outline" />
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-7">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/15 text-gold">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold text-cream">
                  {stats.upcoming}
                  <span className="text-gold">+</span>
                </p>
                <p className="text-sm text-cream/60">eventos próximos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/15 text-gold">
                <Layers className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold text-cream">
                  {stats.categories}
                </p>
                <p className="text-sm text-cream/60">categorías</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/15 text-gold">
                <RefreshCw className="h-5 w-5" />
              </span>
              <div>
                <p className="inline-flex items-center gap-1.5 font-display text-base font-bold text-cream">
                  <Smartphone className="h-4 w-4 text-gold" />
                  Siempre al día
                </p>
                <p className="text-sm text-cream/60">con la ciudad, no con un bot</p>
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {chips.map((category) => (
                <Link
                  key={category.id}
                  href={`/agenda?categoria=${category.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-cream/80 transition hover:border-gold/40 hover:text-gold"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="relative mb-10 lg:mb-0">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50">
            <Image
              src={photos.fuegosSanLorenzo.url}
              alt={photos.fuegosSanLorenzo.alt}
              width={1200}
              height={900}
              priority
              className="aspect-[4/3] w-full object-cover"
              sizes="(min-width: 1024px) 520px, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-choco/60 via-transparent to-transparent" />
            <div className="absolute left-4 top-4 rounded-full bg-choco/70 px-3.5 py-1.5 text-xs font-semibold text-gold backdrop-blur">
              Fiestas de San Lorenzo
            </div>
          </div>

          <div className="absolute -left-3 -bottom-8 rounded-2xl bg-cream px-5 py-4 text-choco shadow-xl shadow-black/40 sm:-left-6">
            <p className="font-display text-3xl font-extrabold">
              {stats.upcoming}
              <span className="text-brand">+</span>
            </p>
            <p className="text-xs font-medium text-choco-muted">
              eventos en la agenda
            </p>
          </div>

          <div className="absolute -right-3 -top-5 hidden w-32 overflow-hidden rounded-2xl border-4 border-choco shadow-xl sm:block lg:-right-5">
            <Image
              src={photos.bombos.url}
              alt={photos.bombos.alt}
              width={400}
              height={533}
              className="aspect-[3/4] w-full object-cover"
              sizes="128px"
            />
          </div>

          <PhotoCredit
            photo={photos.fuegosSanLorenzo}
            className="mt-6 text-cream/45"
          />
        </div>
      </div>
    </section>
  );
}
