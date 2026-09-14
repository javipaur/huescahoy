"use client";

import { useActionState } from "react";
import { CalendarPlus, CheckCircle2 } from "lucide-react";
import { submitEventAction } from "@/lib/actions";

const inputClass =
  "w-full rounded-xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2.5 text-sm text-choco dark:text-ink placeholder:text-choco-muted/50 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

export function SubmitEventForm() {
  const [state, action, pending] = useActionState(submitEventAction, {
    ok: false,
  });

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand/5 p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-4 font-display text-xl font-bold text-choco">
          ¡Evento recibido!
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-choco-muted">
          Lo hemos metido en la cola de revisión y lo publicaremos en la agenda
          en cuanto lo validemos. Si es muy urgente, escríbenos por redes.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="ev-title" className="mb-1.5 block text-sm font-medium text-choco">
          Título del evento *
        </label>
        <input
          id="ev-title"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={140}
          placeholder="Ej.: Concierto de Semana Santa en la Catedral"
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="start_date" className="mb-1.5 block text-sm font-medium text-choco">
            Fecha de inicio *
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="start_time" className="mb-1.5 block text-sm font-medium text-choco">
            Hora <span className="font-normal text-choco-muted">(opcional)</span>
          </label>
          <input id="start_time" name="start_time" type="time" className={inputClass} />
        </div>
        <div>
          <label htmlFor="end_date" className="mb-1.5 block text-sm font-medium text-choco">
            Fecha de fin <span className="font-normal text-choco-muted">(opcional)</span>
          </label>
          <input id="end_date" name="end_date" type="date" className={inputClass} />
        </div>
        <div>
          <label htmlFor="end_time" className="mb-1.5 block text-sm font-medium text-choco">
            Hora de fin <span className="font-normal text-choco-muted">(opcional)</span>
          </label>
          <input id="end_time" name="end_time" type="time" className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-choco">
            Lugar <span className="font-normal text-choco-muted">(opcional)</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            maxLength={160}
            placeholder="Ej.: Teatro Olimpia"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-choco">
            Dirección <span className="font-normal text-choco-muted">(opcional)</span>
          </label>
          <input
            id="address"
            name="address"
            type="text"
            maxLength={200}
            placeholder="Ej.: Plaza Cervantes, 5, Huesca"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-choco">
            Precio <span className="font-normal text-choco-muted">(opcional)</span>
          </label>
          <input
            id="price"
            name="price"
            type="text"
            maxLength={80}
            placeholder="Ej.: 12 € / gratis"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="image" className="mb-1.5 block text-sm font-medium text-choco">
            Imagen (URL) <span className="font-normal text-choco-muted">(opcional)</span>
          </label>
          <input
            id="image"
            name="image"
            type="url"
            maxLength={500}
            placeholder="https://…"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-choco">
          Descripción <span className="font-normal text-choco-muted">(opcional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={3000}
          placeholder="Cuenta a qué viene la gente: entrada, programa, público…"
          className={`${inputClass} resize-y`}
        />
      </div>

      <div>
        <label htmlFor="external_url" className="mb-1.5 block text-sm font-medium text-choco">
          Más información (URL) <span className="font-normal text-choco-muted">(opcional)</span>
        </label>
        <input
          id="external_url"
          name="external_url"
          type="url"
          maxLength={500}
          placeholder="https://tupagina.com/evento"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact" className="mb-1.5 block text-sm font-medium text-choco">
          Tu email o teléfono <span className="font-normal text-choco-muted">(opcional)</span>
        </label>
        <input
          id="contact"
          name="contact"
          type="text"
          maxLength={200}
          placeholder="Por si necesitamos confirmar algún dato"
          className={inputClass}
        />
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60 sm:w-auto"
      >
        <CalendarPlus className="h-4 w-4" />
        {pending ? "Enviando…" : "Publicar mi evento"}
      </button>
      <p className="text-xs leading-relaxed text-choco-muted">
        Publicamos los eventos de forma gratuita tras una revisión rápida para
        evitar spam y errores. El evento aparecerá en la agenda como &quot;pendiente&quot;
        hasta que lo validemos.
      </p>
    </form>
  );
}
