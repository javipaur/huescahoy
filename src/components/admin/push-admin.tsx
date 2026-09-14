"use client";

import { useActionState, useTransition, useState } from "react";
import { BellRing, CalendarClock, Send } from "lucide-react";
import { runDigestAction, sendPushAction } from "@/lib/actions";

const inputCls =
  "w-full rounded-lg border border-choco/20 bg-white px-3 py-2 text-sm text-choco dark:text-ink placeholder:text-choco-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-cream transition hover:bg-brand-dark disabled:opacity-60";
const btnSecondary =
  "inline-flex items-center gap-2 rounded-full border border-choco/15 bg-white/70 px-4 py-2 text-sm font-medium text-choco dark:text-ink transition hover:bg-white disabled:opacity-60";

function FormFeedback({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
      {message}
    </p>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

export function PushAdmin({ subscriberCount, configured }: { subscriberCount: number; configured: boolean }) {
  const [state, formAction, pending] = useActionState(sendPushAction, undefined);
  const [digestPending, startDigest] = useTransition();
  const [digestResult, setDigestResult] = useState<string | undefined>(undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
          <BellRing className="h-5 w-5" />
        </span>
        <div>
          <p className="font-medium text-choco">
            {subscriberCount}{" "}
            {subscriberCount === 1 ? "suscriptor" : "suscriptores"}
          </p>
          <p className="text-xs text-choco-muted">
            {configured
              ? "Web Push (VAPID) configurado. Las notificaciones llegan directas al navegador, sin servicios de terceros."
              : "Faltan las claves VAPID en el entorno (NEXT_PUBLIC_VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY)."}
          </p>
        </div>
      </div>

      <form action={formAction} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
              Título *
            </span>
            <input name="title" type="text" required maxLength={100} placeholder="Ej. Nuevo plan en Huesca" className={inputCls} />
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
              Mensaje
            </span>
            <textarea name="text" rows={2} maxLength={200} placeholder="Un texto corto..." className={inputCls} />
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
              Enlace (opcional)
            </span>
            <input name="url" type="url" placeholder="/agenda?desde=hoy" className={inputCls} />
          </label>
        </div>
        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <button type="submit" disabled={pending || !configured} className={btnPrimary}>
            <Send className="h-4 w-4" />
            {pending ? "Enviando..." : "Enviar a todos"}
          </button>
          <button
            type="button"
            disabled={digestPending || !configured}
            onClick={() =>
              startDigest(async () => {
                const result = await runDigestAction();
                setDigestResult(result.summary ?? result.error);
              })
            }
            className={btnSecondary}
          >
            <CalendarClock className="h-4 w-4" />
            {digestPending ? "Enviando..." : "Enviar resumen diario"}
          </button>
        </div>
      </form>

      <FormError message={state?.error} />
      <FormFeedback message={state?.summary ?? digestResult} />
    </div>
  );
}
