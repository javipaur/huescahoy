import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { RestaurantsTable } from "@/components/admin/restaurants-table";
import { getRestaurantsAdmin } from "@/lib/db";

export const metadata: Metadata = {
  title: "Restaurantes",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminRestaurantsPage() {
  const restaurants = await getRestaurantsAdmin();

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-choco">Restaurantes</h1>
          <p className="mt-1 text-sm text-choco-muted">
            Todos los restaurantes, bares y cafeterías del directorio.
          </p>
        </div>
        <Link
          href="/admin/restaurantes/nuevo"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          Nuevo restaurante
        </Link>
      </div>
      <div className="mt-6">
        <RestaurantsTable restaurants={restaurants} />
      </div>
    </div>
  );
}