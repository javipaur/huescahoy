import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Compass } from "lucide-react";
import { getPlanBySlug } from "@/lib/db";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const plan = getPlanBySlug(slug);
  if (!plan) return { title: "Plan no encontrado" };
  return {
    title: plan.title,
    description: plan.summary ?? undefined,
    openGraph: {
      title: plan.title,
      description: plan.summary ?? undefined,
      url: `${site.url}/planes/${plan.slug}`,
      images: plan.image ? [{ url: plan.image }] : undefined,
    },
  };
}

export default async function PlanPage({ params }: PageProps) {
  const { slug } = await params;
  const plan = getPlanBySlug(slug);
  if (!plan) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
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
          <div className="mt-6 whitespace-pre-line leading-relaxed text-choco/90">
            {plan.body}
          </div>
        </div>
      </div>
    </article>
  );
}
