import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RestaurantForm } from "@/components/admin/restaurant-form";

export const metadata: Metadata = {
  title: "Nuevo restaurante",
  robots: { index: false, follow: false },
};

export default function NewRestaurantPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/restaurantes"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-choco-muted transition hover:text-choco"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a restaurantes
      </Link>
      <h1 className="mb-6 font-display text-2xl font-bold text-choco">
        Nuevo restaurante
      </h1>
      <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm sm:p-8">
        <RestaurantForm />
      </div>
    </div>
  );
}