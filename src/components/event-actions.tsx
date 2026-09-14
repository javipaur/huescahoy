"use client";

import { useState } from "react";
import {
  CalendarPlus,
  Check,
  Copy,
  Download,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { buildEventIcs, gcalEventUrl } from "@/lib/ics";
import type { EventItem } from "@/lib/types";

export function EventActions({ event }: { event: EventItem }) {
  const [copied, setCopied] = useState(false);

  function downloadIcs() {
    const blob = new Blob([buildEventIcs(event)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.slug}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function shareUrl(): string {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/eventos/${event.slug}`;
  }

  async function copyLink() {
    const url = shareUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${event.title} · ${shareUrl()}`)}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={gcalEventUrl(event)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        <CalendarPlus className="h-4 w-4" />
        Google Calendar
      </a>
      <button
        onClick={downloadIcs}
        className="inline-flex items-center gap-2 rounded-full border border-choco/20 bg-white px-5 py-2.5 text-sm font-semibold text-choco dark:text-ink transition hover:border-choco/40"
      >
        <Download className="h-4 w-4" />
        Descargar .ics
      </button>
      <a
        href={waUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-green-600/30 bg-white px-5 py-2.5 text-sm font-semibold text-green-700 transition hover:border-green-600/60 hover:bg-green-50"
      >
        <MessageCircle className="h-4 w-4" />
        Compartir por WhatsApp
      </a>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-full border border-sand bg-sand/60 px-5 py-2.5 text-sm font-semibold text-choco transition hover:bg-sand"
      >
        {copied ? <Check className="h-4 w-4 text-brand" /> : <Copy className="h-4 w-4" />}
        {copied ? "Enlace copiado" : "Copiar enlace"}
      </button>
      {event.externalUrl && (
        <a
          href={event.externalUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-sand bg-sand/60 px-5 py-2.5 text-sm font-semibold text-choco transition hover:bg-sand"
        >
          <ExternalLink className="h-4 w-4" />
          Más información
        </a>
      )}
    </div>
  );
}
