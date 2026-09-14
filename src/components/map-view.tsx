"use client";

import { useEffect, useRef } from "react";

export type MapPoint = {
  id: number;
  title: string;
  slug: string;
  lat: number;
  lng: number;
};

const CSS_URL = "/leaflet/leaflet.css";
const JS_URL = "/leaflet/leaflet.js";

type Leaflet = {
  map: (
    el: HTMLElement,
    opts?: { scrollWheelZoom: boolean }
  ) => unknown;
  tileLayer: (
    url: string,
    opts?: { attribution: string; maxZoom: number }
  ) => { addTo: (map: unknown) => unknown };
  marker: (latlng: [number, number]) => {
    addTo: (map: unknown) => unknown;
    bindPopup: (html: string) => unknown;
  };
  latLngBounds: (
    latlngs: Array<[number, number]>
  ) => { pad: (size: number) => unknown };
};

declare global {
  interface Window {
    L?: Leaflet;
  }
}

function loadStyle(): void {
  if (document.querySelector("link[data-huescahoy-leaflet]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = CSS_URL;
  link.setAttribute("data-huescahoy-leaflet", "true");
  document.head.appendChild(link);
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve();
      return;
    }
    if (document.querySelector(`script[data-huescahoy-leaflet]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = JS_URL;
    script.setAttribute("data-huescahoy-leaflet", "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar el mapa"));
    document.head.appendChild(script);
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function MapView({ points }: { points: MapPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    loadStyle();
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.L) return;
        const L = window.L;
        const map = L.map(containerRef.current, { scrollWheelZoom: false });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        for (const point of points) {
          const marker = L.marker([point.lat, point.lng]);
          marker.bindPopup(
            `<a href="/eventos/${point.slug}" class="font-semibold">${escapeHtml(point.title)}</a>`
          );
          marker.addTo(map);
        }

        if (points.length > 0) {
          const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
          (map as { fitBounds: (b: unknown, o: unknown) => void }).fitBounds(
            bounds.pad(0.1),
            { padding: [30, 30], maxZoom: 13 }
          );
        } else {
          (map as { setView: (c: [number, number], z: number) => void }).setView(
            [42.14, -0.41],
            9
          );
        }

        mapRef.current = map;
      })
      .catch(() => {
        // mapa no disponible: se mantiene la vista de lista
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, [points]);

  return (
    <div
      ref={containerRef}
      className="h-[28rem] w-full overflow-hidden rounded-2xl border border-sand shadow-sm"
    />
  );
}
