import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { FeaturedPick } from "@/lib/types";

export function FeaturedPickCard({
  pick,
  image,
}: {
  pick: FeaturedPick;
  image?: string | null;
}) {
  const href =
    pick.linkType === "plan"
      ? `/planes/${pick.targetSlug}`
      : `/eventos/${pick.targetSlug}`;
  const img = pick.imageUrl ?? image ?? null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-16">
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-3xl shadow-lg shadow-choco/10"
      >
        {img ? (
          <Image
            src={img}
            alt={pick.title}
            fill
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-brand via-brand-dark to-choco"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-choco/90 via-choco/45 to-choco/10"
        />

        <div className="relative flex min-h-[17rem] flex-col justify-end p-7 sm:min-h-[20rem] sm:p-10">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-choco shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {pick.label}
          </span>

          {pick.tagline && (
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-gold sm:text-sm">
              {pick.tagline}
            </p>
          )}

          <h2 className="mt-2 max-w-xl font-display text-2xl font-extrabold leading-tight text-cream sm:text-4xl">
            {pick.title}
          </h2>

          {pick.reason && (
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/80 sm:text-base">
              {pick.reason}
            </p>
          )}

          <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-choco shadow-md transition group-hover:gap-3">
            Ver el plan
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </section>
  );
}
