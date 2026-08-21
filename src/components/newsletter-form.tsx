"use client";

import { Mail } from "lucide-react";
import { useState } from "react";

type Status = "idle" | "sending" | "ok" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "No se pudo suscribir. Inténtalo más tarde.");
        return;
      }
      setStatus("ok");
      setMessage("¡Listo! Te avisaremos de lo mejor de la semana.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("No se pudo suscribir. Inténtalo más tarde.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5">
      <label
        htmlFor="newsletter-email"
        className="flex items-center gap-2 text-sm font-semibold text-cream/80"
      >
        <Mail className="h-4 w-4 text-gold" />
        Lo mejor de la semana en tu correo
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          placeholder="tu@correo.es"
          className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-cream placeholder:text-cream/40 outline-none transition focus:border-gold/50"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {status === "sending" ? "Enviando…" : "Suscribirme"}
        </button>
      </div>
      {status === "ok" && (
        <p className="mt-2 text-xs font-medium text-green-400">{message}</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs font-medium text-red-400">{message}</p>
      )}
    </form>
  );
}
