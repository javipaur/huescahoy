import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RouteForm } from "@/components/admin/route-form";

export const metadata: Metadata = {
  title: "Nueva ruta",
  robots: { index: false, follow: false },
};

export default function NewRoutePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/rutas"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-choco-muted transition hover:text-choco"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a rutas
      </Link>
      <h1 className="mb-6 font-display text-2xl font-bold text-choco">
        Nueva ruta
      </h1>
      <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm sm:p-8">
        <RouteForm />
      </div>
    </div>
  );
}