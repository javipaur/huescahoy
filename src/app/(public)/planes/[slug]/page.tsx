import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Compass } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { getPlanBySlug } from "@/lib/db";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const plan = await getPlanBySlug(slug);
  if (!plan) return { title: "Plan no encontrado" };
  const url = `${site.url}/planes/${plan.slug}`;
  return {
    title: plan.title,
    description: plan.summary ?? undefined,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      locale: site.locale,
      title: plan.title,
      description: plan.summary ?? undefined,
      url,
      images: plan.image ? [{ url: plan.image }] : [{ url: "/opengraph-image" }],
    },
    twitter: {
      card: "summary_large_image",
      title: plan.title,
      description: plan.summary ?? undefined,
      images: plan.image ? [plan.image] : ["/opengraph-image"],
    },
  };
}

export default async function PlanPage({ params }: PageProps) {
  const { slug } = await params;
  const plan = await getPlanBySlug(slug);
  if (!plan) notFound();

  const readingTime = Math.max(1, Math.round(plan.body.trim().split(/\s+/).length / 200));
  const publishedLabel = plan.createdAt
    ? new Date(plan.createdAt).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : undefined;

  const planJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: plan.title,
    description: plan.summary ?? undefined,
    image: plan.image ?? undefined,
    datePublished: plan.createdAt,
    dateModified: plan.updatedAt,
    author: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    mainEntityOfPage: `${site.url}/planes/${plan.slug}`,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <JsonLd data={planJsonLd} />
      <Link
        href="/planes"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-choco-muted transition hover:text-choco"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a planes y guías
      </Link>

      <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-sm">
        {plan.image ? (
          <img
            src={plan.image}
            alt={plan.title}
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="grid aspect-[16/9] w-full place-items-center bg-gradient-to-br from-brand/15 to-gold/20">
            <span className="grid h-20 w-20 place-items-center rounded-3xl bg-white/85 shadow-sm">
              <Compass className="h-10 w-10 text-brand" />
            </span>
          </div>
        )}

        <div className="p-6 sm:p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <Compass className="h-3.5 w-3.5" />
            Plan de {site.city}
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {plan.title}
          </h1>
          {plan.summary && (
            <p className="mt-3 text-lg leading-relaxed text-choco-muted">
              {plan.summary}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-sand pt-5 text-sm text-choco-muted">
            {publishedLabel && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 shrink-0 text-brand" />
                {publishedLabel}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0 text-brand" />
              {readingTime} {readingTime === 1 ? "minuto" : "minutos"} de lectura
            </span>
          </div>
          <div className="mt-6 whitespace-pre-line text-[17px] leading-relaxed text-choco/90">
            {plan.body}
          </div>
        </div>
      </div>
    </article>
  );
}
