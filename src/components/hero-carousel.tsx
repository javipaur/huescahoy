"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PhotoCredit } from "@/components/photo-credit";
import type { Photo } from "@/lib/photos";

export type HeroFeature = { photo: Photo; label: string };

export function HeroCarousel({ features }: { features: HeroFeature[] }) {
  const [index, setIndex] = useState(() =>
    features.length > 1 ? Math.floor(Math.random() * features.length) : 0
  );

  useEffect(() => {
    if (features.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % features.length), 6000);
    return () => clearInterval(timer);
  }, [features.length]);

  const current = features[index];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50">
        {features.map((feature, i) => (
          <Image
            key={feature.photo.url}
            src={feature.photo.url}
            alt={feature.photo.alt}
            width={1200}
            height={900}
            priority={i === 0}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            sizes="(min-width: 1024px) 520px, 100vw"
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-choco/60 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-choco/70 px-3.5 py-1.5 text-xs font-semibold text-gold backdrop-blur">
          {current.label}
        </div>
        {features.length > 1 && (
          <div className="absolute bottom-3 left-4 flex gap-1.5">
            {features.map((feature, i) => (
              <button
                key={feature.photo.url}
                type="button"
                aria-label={`Mostrar ${feature.label}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-gold" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <PhotoCredit photo={current.photo} className="mt-6 text-cream/45" />
    </div>
  );
}
