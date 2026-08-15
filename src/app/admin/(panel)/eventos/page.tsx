import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { EventsTable } from "@/components/admin/events-table";
import { getCategoriesAdmin, getEvents } from "@/lib/db";

export const metadata: Metadata = {
  title: "Eventos",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = getEvents({ includeHidden: true, limit: 200 });
  const categories = getCategoriesAdmin();

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-choco">Eventos</h1>
          <p className="mt-1 text-sm text-choco-muted">
            Todos los eventos de la agenda, incluidos los ocultos.
          </p>
        </div>
        <Link
          href="/admin/eventos/nuevo"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-brand-dark"
        >
          <CalendarPlus className="h-4 w-4" />
          Nuevo evento
        </Link>
      </div>
      <div className="mt-6">
        <EventsTable events={events} categories={categories} />
      </div>
    </div>
  );
}
