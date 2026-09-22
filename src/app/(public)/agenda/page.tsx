import type { Metadata } from "next";
import { CalendarDays, Download } from "lucide-react";
import { Suspense } from "react";
import { AgendaView } from "@/components/agenda-view";
import { CategoryAlerts } from "@/components/category-alerts";
import { getCategoriesAdmin, getEvents, todayStr } from "@/lib/db";
import { formatDayLong } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Agenda de eventos en Huesca",
  description:
    "Consulta la agenda de eventos en Huesca: conciertos, teatro, exposiciones, deporte, cine y planes en familia. Filtra por categoría, fecha o busca lo que te apetezca.",
  alternates: {
    canonical: "/agenda",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    title: "Agenda de eventos en Huesca",
    description:
      "Conciertos, teatro, exposiciones, deporte y planes en familia. La agenda cultural de Huesca, al día.",
    images: [{ url: "/opengraph-image" }],
  },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AgendaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoria = typeof params.categoria === "string" ? params.categoria : "";
  const desde = typeof params.desde === "string" ? params.desde : "";
  const q = typeof params.q === "string" ? params.q : "";
  const zona = typeof params.zona === "string" ? params.zona : "";
  const guardados = params.guardados === "1";

  const categories = await getCategoriesAdmin();
  const events = await getEvents({ from: todayStr(), limit: 200 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand-dark">
            <CalendarDays className="h-3.5 w-3.5" />
            Calendario cultural
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Agenda de eventos en {site.city}
          </h1>
          <p className="mt-2 text-choco-muted">
            <span className="font-semibold text-choco dark:text-ink">{formatDayLong(todayStr())}</span>
            <span className="mx-1.5 text-choco-muted">·</span>
            todo lo que pasa en {site.city}, ordenado por fecha.
          </p>
        </div>
        <a
          href="/api/agenda.ics"
          className="inline-flex items-center gap-2 rounded-full border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2 text-sm font-semibold text-choco dark:text-ink transition hover:border-brand/40 hover:text-brand"
        >
          <Download className="h-4 w-4" />
          Descargar la semana (.ics)
        </a>
      </div>

      <CategoryAlerts categories={categories} />

      <Suspense fallback={null}>
        <AgendaView
          events={events}
          categories={categories}
          initialCategory={categoria}
          initialDesde={desde}
          initialQ={q}
          initialZona={zona}
          initialGuardados={guardados}
        />
      </Suspense>
    </div>
  );
}
