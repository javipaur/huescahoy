import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { RestaurantForm } from "@/components/admin/restaurant-form";
import { getRestaurantById } from "@/lib/db";

export const metadata: Metadata = {
  title: "Editar restaurante",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRestaurantPage({ params }: PageProps) {
  const { id } = await params;
  const restaurant = await getRestaurantById(Number(id));
  if (!restaurant) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/restaurantes"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-choco-muted transition hover:text-choco dark:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a restaurantes
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-choco dark:text-ink">
            Editar restaurante
          </h1>
          <p className="mt-1 text-sm text-choco-muted">{restaurant.name}</p>
        </div>
        <Link
          href={`/restaurantes/${restaurant.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-choco/15 bg-white px-4 py-2 text-sm font-medium text-choco dark:text-ink transition hover:bg-sand"
        >
          <ExternalLink className="h-4 w-4" />
          Ver en la web
        </Link>
      </div>
      <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm sm:p-8">
        <RestaurantForm restaurant={restaurant} />
      </div>
    </div>
  );
}