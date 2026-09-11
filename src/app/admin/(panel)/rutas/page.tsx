import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { RoutesTable } from "@/components/admin/routes-table";
import { getRoutesAdmin } from "@/lib/db";

export const metadata: Metadata = {
  title: "Rutas",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminRoutesPage() {
  const routes = await getRoutesAdmin();

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-choco">Rutas</h1>
          <p className="mt-1 text-sm text-choco-muted">
            Rutas de senderismo, bicicleta, cultural y turismo.
          </p>
        </div>
        <Link
          href="/admin/rutas/nuevo"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          Nueva ruta
        </Link>
      </div>
      <div className="mt-6">
        <RoutesTable routes={routes} />
      </div>
    </div>
  );
}