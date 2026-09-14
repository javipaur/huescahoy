import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { EventForm } from "@/components/admin/event-form";
import { getCategoriesAdmin, getEventById } from "@/lib/db";

export const metadata: Metadata = {
  title: "Editar evento",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(Number(id));
  if (!event) notFound();

  const categories = await getCategoriesAdmin();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/eventos"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-choco-muted transition hover:text-choco dark:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a eventos
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-choco dark:text-ink">
            Editar evento
          </h1>
          <p className="mt-1 text-sm text-choco-muted">{event.title}</p>
        </div>
        <Link
          href={`/eventos/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-choco/15 bg-white px-4 py-2 text-sm font-medium text-choco dark:text-ink transition hover:bg-sand"
        >
          <ExternalLink className="h-4 w-4" />
          Ver en la web
        </Link>
      </div>
      <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm sm:p-8">
        <EventForm categories={categories} event={event} />
      </div>
    </div>
  );
}
