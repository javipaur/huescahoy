"use client";

import Image from "next/image";
import { useState } from "react";

export function EventImage({
  src,
  alt,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={className}
        role="img"
        aria-label={alt}
        style={{
          background:
            "linear-gradient(150deg, rgba(22,163,74,0.14), rgba(22,163,74,0.04))",
        }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "100vw"}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
