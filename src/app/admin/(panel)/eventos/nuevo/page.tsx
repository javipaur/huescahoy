import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/admin/event-form";
import { getCategoriesAdmin } from "@/lib/db";

export const metadata: Metadata = {
  title: "Nuevo evento",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const categories = await getCategoriesAdmin();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/eventos"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-choco-muted transition hover:text-choco"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a eventos
      </Link>
      <h1 className="font-display text-2xl font-bold text-choco">Nuevo evento</h1>
      <p className="mt-1 text-sm text-choco-muted">
        Se publicará al instante en la agenda.
      </p>
      <div className="mt-8">
        <EventForm categories={categories} />
      </div>
    </div>
  );
}
