"use client";

import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitSuggestionAction } from "@/lib/actions";

const KINDS = [
  { value: "mejora", label: "Sugerir una mejora", hint: "Algo que se podría hacer mejor" },
  { value: "problema", label: "Reportar un problema", hint: "Un error, un enlace roto, un dato incorrecto" },
  { value: "idea", label: "Proponer una idea", hint: "Un evento, una sección o una colaboración" },
] as const;

export function SuggestForm() {
  const [state, action, pending] = useActionState(submitSuggestionAction, {
    ok: false,
  });

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand/5 p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-4 font-display text-xl font-bold text-choco">
          ¡Gracias por tu aportación!
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-choco-muted">
          Hemos recibido tu sugerencia. La revisamos y la tendremos en cuenta
          para mejorar Huesca Hoy entre todos.
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

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-choco">
          ¿Qué quieres contarnos?
        </legend>
        <div className="flex flex-col gap-2">
          {KINDS.map((kind) => (
            <label
              key={kind.value}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-sand bg-white px-4 py-3 transition has-[:checked]:border-brand has-[:checked]:bg-brand/5"
            >
              <input
                type="radio"
                name="kind"
                value={kind.value}
                defaultChecked={kind.value === "mejora"}
                className="mt-1 h-4 w-4 accent-brand"
              />
              <span>
                <span className="block text-sm font-semibold text-choco">
                  {kind.label}
                </span>
                <span className="block text-xs text-choco-muted">{kind.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-choco">
          Título *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={140}
          placeholder="Ej.: falta el evento de la fiesta del barrio"
          className="w-full rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-choco placeholder:text-choco-muted/50 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label htmlFor="detail" className="mb-1.5 block text-sm font-medium text-choco">
          Cuéntanos más
        </label>
        <textarea
          id="detail"
          name="detail"
          rows={4}
          maxLength={2000}
          placeholder="Detalles, dónde lo has visto, qué esperabas encontrar…"
          className="w-full resize-y rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-choco placeholder:text-choco-muted/50 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label htmlFor="contact" className="mb-1.5 block text-sm font-medium text-choco">
          Tu email o Instagram <span className="font-normal text-choco-muted">(opcional)</span>
        </label>
        <input
          id="contact"
          name="contact"
          type="text"
          maxLength={120}
          placeholder="Para poder responderte si lo necesitamos"
          className="w-full rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-choco placeholder:text-choco-muted/50 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <p className="mt-1.5 text-xs text-choco-muted">
          Solo lo usamos para ponernos en contacto contigo. Nunca lo publicamos.
        </p>
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
        <Send className="h-4 w-4" />
        {pending ? "Enviando…" : "Enviar sugerencia"}
      </button>
    </form>
  );
}
