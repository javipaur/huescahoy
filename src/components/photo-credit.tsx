import type { Photo } from "@/lib/photos";

export function PhotoCredit({ photo, className = "" }: { photo: Photo; className?: string }) {
  return (
    <p className={`text-xs ${className}`}>
      Foto:{" "}
      <a
        href={photo.page}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:opacity-80"
      >
        {photo.author}
      </a>{" "}
      · {photo.license} · Wikimedia Commons
    </p>
  );
}
