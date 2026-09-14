"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions";

export default function LoginForm({ hasError }: { hasError: boolean }) {
  const [, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="space-y-4">
      {hasError && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          Contraseña incorrecta. Inténtalo de nuevo.
        </p>
      )}
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-choco dark:text-ink"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          placeholder="••••••••"
          className="w-full rounded-lg border border-choco/20 bg-white px-3 py-2.5 text-sm text-choco dark:text-ink placeholder:text-choco-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-choco dark:bg-ink px-5 py-2.5 font-semibold text-cream transition hover:bg-choco/85 dark:bg-ink/85 disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
