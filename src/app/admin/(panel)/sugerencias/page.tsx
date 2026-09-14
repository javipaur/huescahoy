import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { SuggestionsAdmin } from "@/components/admin/suggestions-admin";
import { getSuggestionCounts, getSuggestions } from "@/lib/db";

export const metadata: Metadata = {
  title: "Sugerencias",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSuggestionsPage() {
  const suggestions = await getSuggestions();
  const counts = await getSuggestionCounts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-choco dark:text-ink">
            Sugerencias
          </h1>
          <p className="mt-1 text-sm text-choco-muted">
            Aportaciones que llegan desde la página Colabora.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-2 text-sm font-medium text-choco dark:text-ink">
            <Inbox className="h-4 w-4 text-brand" />
            {counts.pending} {counts.pending === 1 ? "nueva" : "nuevas"} por revisar
          </span>
          <span className="inline-flex items-center rounded-full border border-sand bg-white px-4 py-2 text-sm font-medium text-choco-muted">
            {counts.total} en total
          </span>
        </div>
      </div>

      <SuggestionsAdmin suggestions={suggestions} />
    </div>
  );
}
