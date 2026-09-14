"use client";

import { WifiOff } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <WifiOff className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Sin conexión</h1>
        <p className="mb-8 text-gray-600">
          Parece que no estás conectado. Vuelve a cargar cuando tengas red:
          tu agenda y tus datos seguirán aquí.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Reintentar
        </button>
        <p className="mt-6 text-sm text-gray-500">
          <Link href="/" className="underline hover:text-green-700">
            Volver a la portada
          </Link>
        </p>
      </div>
    </main>
  );
}