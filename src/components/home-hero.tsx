import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays } from "lucide-react";
import { InstallButton } from "@/components/pwa/install-button";
import { HeroCarousel } from "@/components/hero-carousel";
import { getIcon } from "@/lib/icons";
import { photos } from "@/lib/photos";
import type { CategoryWithCount } from "@/lib/types";

const HERO_FEATURES = [
  { photo: photos.fuegosSanLorenzo, label: "Fiestas de San Lorenzo" },
  { photo: photos.semanaSanta, label: "Semana Santa" },
  { photo: photos.plazaNavarra, label: "La Plaza de Navarra" },
];

export function HomeHero({
  categories,
}: {
  categories: CategoryWithCount[];
}) {
  const chips = categories.slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-choco dark:bg-ink">
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
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-semibold text-gold">
            <CalendarDays className="h-4 w-4" />
            Agenda cultural de Huesca · actualizada cada día
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance text-white sm:text-6xl">
            Toda la agenda cultural
            <br />
            de Huesca, en la{" "}
            <span className="text-gold">palma de tu mano</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Conciertos, teatro, exposiciones, cine y planes en familia: toda
            la agenda cultural de Huesca para hoy, el fin de semana y los
            próximos días. Gratis, sin anuncios y siempre al día.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href="/agenda"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-7 font-semibold text-choco dark:text-ink shadow-md shadow-gold/20 transition hover:brightness-105 active:scale-95"
            >
              Ver qué hacer hoy
              <ArrowRight className="h-5 w-5" />
            </Link>
            <InstallButton tone="dark-outline" />
          </div>
        </div>

        <div className="relative mb-10 lg:mb-0">
          <HeroCarousel features={HERO_FEATURES} />

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
        </div>
      </div>

      {chips.length > 0 && (
        <div className="relative border-t border-white/10">
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-4 sm:px-6 lg:hidden">
            {chips.map((category) => {
              const Icon = getIcon(category.icon);
              return (
                <Link
                  key={category.id}
                  href={`/agenda/${category.slug}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-gold/40 hover:text-gold"
                >
                  {Icon && <Icon className="h-4 w-4" style={{ color: category.color }} />}
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
