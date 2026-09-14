import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} - ${site.tagline}`,
    short_name: site.shortName,
    description: `Agenda de eventos en ${site.city}: conciertos, teatro, exposiciones, deporte, cine, planes para niños y mercados. No te pierdas nada.`,
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    categories: ["lifestyle", "events"],
    screenshots: [
      {
        src: "/screenshots/desktop-1280x800.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
        label: "Agenda de eventos en Huesca",
      },
      {
        src: "/screenshots/mobile-800x1280.png",
        sizes: "800x1280",
        type: "image/png",
        form_factor: "narrow",
        label: "Agenda de eventos en Huesca",
      },
    ],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Agenda",
        url: "/agenda",
      },
      {
        name: "Hoy",
        url: "/agenda?desde=hoy",
      },
    ],
  };
}
