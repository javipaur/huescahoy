"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bug, Lightbulb, Mail, Sparkles } from "lucide-react";
import {
  deleteSuggestionById,
  setSuggestionStatusAction,
  type ActionResult,
} from "@/lib/actions";
import type { Suggestion, SuggestionKind, SuggestionStatus } from "@/lib/types";

const KIND_META: Record<
  SuggestionKind,
  { label: string; Icon: typeof Bug }
> = {
  problema: { label: "Problema", Icon: Bug },
  mejora: { label: "Mejora", Icon: Sparkles },
  idea: { label: "Idea", Icon: Lightbulb },
};

const STATUS_META: Record<
  SuggestionStatus,
  { label: string; className: string; next: string }
> = {
  nuevo: { label: "Nueva", className: "bg-green-100 text-green-700", next: "visto" },
  visto: { label: "En revisión", className: "bg-amber-100 text-amber-700", next: "hecho" },
  hecho: { label: "Resuelta", className: "bg-choco/10 text-choco-muted", next: "nuevo" },
};

const btnGhost =
  "rounded-lg px-2 py-1 text-xs font-medium text-choco-muted transition hover:bg-choco/5 hover:text-choco";
const btnDanger =
  "rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700";

function formatCreatedAt(value: string): string {
  const date = new Date(value + "Z");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function SuggestionsAdmin({ suggestions }: { suggestions: Suggestion[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);

  function runMutation(action: () => Promise<ActionResult>) {
    startTransition(async () => {
      const result = await action();
      if (result?.error) setGlobalError(result.error);
      else {
        setGlobalError(null);
        router.refresh();
      }
    });
  }

  return (
    <div>
      {globalError && (
        <div className="mb-4">
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {globalError}
          </p>
        </div>
      )}

      <ul className="divide-y divide-choco/5 rounded-3xl border border-sand bg-white shadow-sm">
        {suggestions.length === 0 && (
          <li className="p-10 text-center text-sm text-choco-muted">
            Todavía no hay sugerencias. Cuando alguien escriba desde /colabora,
            aparecerá aquí.
          </li>
        )}
        {suggestions.map((suggestion) => {
          const kind = KIND_META[suggestion.kind] ?? KIND_META.mejora;
          const KindIcon = kind.Icon;
          const status = STATUS_META[suggestion.status];
          return (
            <li key={suggestion.id} className="flex flex-wrap items-start gap-3 px-5 py-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <KindIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-choco">{suggestion.title}</p>
                  <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-semibold text-choco-muted">
                    {kind.label}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
                {suggestion.detail && (
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-choco-muted">
                    {suggestion.detail}
                  </p>
                )}
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-choco-muted">
                  <span>{formatCreatedAt(suggestion.createdAt)}</span>
                  {suggestion.contact && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {suggestion.contact}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    runMutation(() =>
                      setSuggestionStatusAction(suggestion.id, status.next as SuggestionStatus)
                    )
                  }
                  className={btnGhost}
                >
                  {status.next === "visto"
                    ? "Empezar a revisar"
                    : status.next === "hecho"
                      ? "Marcar resuelta"
                      : "Reabrir"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (window.confirm(`¿Eliminar la sugerencia "${suggestion.title}"?`)) {
                      runMutation(() => deleteSuggestionById(suggestion.id));
                    }
                  }}
                  className={btnDanger}
                >
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
