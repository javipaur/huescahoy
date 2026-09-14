"use client";

import { useCallback, useEffect, useState } from "react";
import { BellRing, Check } from "lucide-react";
import type { Category } from "@/lib/types";

const STORAGE_KEY = "hh-alert-cats";
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

type Status = "checking" | "idle" | "subscribed" | "unsupported";

export function CategoryAlerts({ categories }: { categories: Category[] }) {
  const [selected, setSelected] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((s): s is string => typeof s === "string")
        : [];
    } catch {
      return [];
    }
  });
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !VAPID_PUBLIC_KEY
      ) {
        setStatus("unsupported");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setStatus(subscription ? "subscribed" : "idle");
      } catch {
        setStatus("unsupported");
      }
    })();
  }, []);

  const persist = useCallback(
    async (next: string[]) => {
      setSelected(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      if (status !== "subscribed") return;
      setBusy(true);
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await fetch("/api/push/preferences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: subscription.endpoint, categories: next }),
          });
        }
      } catch {} finally {
        setBusy(false);
      }
    },
    [status]
  );

  const toggle = useCallback(
    (slug: string) => {
      void persist(
        selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]
      );
    },
    [persist, selected]
  );

  const activate = useCallback(async () => {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY as string),
        });
      }
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...subscription.toJSON(), categories: selected }),
      });
      if (!res.ok) throw new Error("No se pudo guardar la suscripción");
      setStatus("subscribed");
    } catch {} finally {
      setBusy(false);
    }
  }, [selected]);

  if (status === "unsupported" || status === "checking") return null;

  const subscribed = status === "subscribed";

  return (
    <div className="mb-8 rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-semibold text-choco">
            <BellRing className="h-4 w-4 text-brand" />
            Avisos de tus planes favoritos
          </p>
          <p className="mt-0.5 text-sm text-choco-muted">
            Elige categorías y te avisamos cuando entra algo nuevo en la agenda.
          </p>
        </div>
        {subscribed ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-sm font-semibold text-brand-dark">
            <BellRing className="h-4 w-4" />
            {selected.length === 0
              ? "Avisos generales activos"
              : `${selected.length} ${selected.length === 1 ? "categoría" : "categorías"}`}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => void activate()}
            disabled={busy || selected.length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-50"
          >
            {busy ? "Activando..." : `Activar avisos${selected.length > 0 ? ` (${selected.length})` : ""}`}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => {
          const on = selected.includes(category.slug);
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(category.slug)}
              style={
                on
                  ? { backgroundColor: `${category.color}14`, borderColor: category.color }
                  : undefined
              }
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                on
                  ? "border-2 text-choco"
                  : "border-sand bg-sand/50 text-choco-muted hover:border-choco-muted hover:text-choco"
              }`}
            >
              {on && <Check className="h-3.5 w-3.5" style={{ color: category.color }} />}
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
