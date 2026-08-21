import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { getNewsletterSubscribers } from "@/lib/db";

export const metadata: Metadata = {
  title: "Suscriptores",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const subscribers = await getNewsletterSubscribers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-choco">
            Suscriptores
          </h1>
          <p className="mt-1 text-sm text-choco-muted">
            Correos capturados desde el formulario del pie de página.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-2 text-sm font-medium text-choco">
          <Mail className="h-4 w-4 text-brand" />
          {subscribers.length} {subscribers.length === 1 ? "suscriptor" : "suscriptores"}
        </span>
      </div>

      {subscribers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand bg-sand/40 p-12 text-center text-choco-muted">
          Todavía no hay suscriptores.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sand bg-sand/40 text-xs uppercase tracking-wide text-choco-muted">
                <th className="px-4 py-3 font-semibold">Correo</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-sand/60 last:border-0">
                  <td className="px-4 py-3 font-medium text-choco">{subscriber.email}</td>
                  <td className="px-4 py-3 text-choco-muted">{subscriber.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
