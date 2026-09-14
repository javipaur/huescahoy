import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="font-display text-6xl font-bold text-brand">404</p>
      <h1 className="font-display text-2xl font-semibold">
        Esto no está en la agenda
      </h1>
      <p className="max-w-md text-choco-muted">
        La página que buscas no existe o ya no está disponible.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-full bg-choco dark:bg-ink px-6 py-3 font-semibold text-white transition hover:bg-choco/90 dark:bg-ink/90"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
