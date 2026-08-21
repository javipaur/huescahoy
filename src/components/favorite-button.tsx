"use client";

import { Heart } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  getFavoritesSnapshot,
  getServerFavoritesSnapshot,
  subscribeFavorites,
  toggleFavorite,
} from "@/lib/favorites";
import type { EventItem } from "@/lib/types";

export function FavoriteButton({
  event,
  tone = "light",
}: {
  event: EventItem;
  tone?: "light" | "dark" | "inline";
}) {
  const favorites = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot
  );
  const active = Boolean(favorites[event.slug]);

  function onClick() {
    toggleFavorite({
      slug: event.slug,
      title: event.title,
      startDate: event.startDate,
      image: event.image,
    });
  }

  if (tone === "dark") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={active ? "Quitar de guardados" : "Guardar evento"}
        className={`grid h-8 w-8 place-items-center rounded-full backdrop-blur transition ${
          active
            ? "bg-brand text-white"
            : "bg-white/90 text-choco hover:bg-white"
        }`}
      >
        <Heart className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
      </button>
    );
  }

  if (tone === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={active ? "Quitar de guardados" : "Guardar evento"}
        title={active ? "Quitar de guardados" : "Guardar evento"}
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition ${
          active
            ? "border-brand bg-brand/10 text-brand"
            : "border-sand bg-white text-choco-muted hover:border-brand/40 hover:text-brand"
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${active ? "fill-brand" : ""}`} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
        active
          ? "border-brand bg-brand/10 text-brand hover:bg-brand/20"
          : "border-choco/20 bg-white text-choco hover:border-choco/40"
      }`}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-brand text-brand" : ""}`} />
      {active ? "Guardado" : "Guardar"}
    </button>
  );
}
