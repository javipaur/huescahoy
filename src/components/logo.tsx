import Link from "next/link";
import { MapPin } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Huesca Hoy">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm shadow-brand/30">
        <MapPin className="h-5 w-5" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="hidden font-display text-xl font-bold tracking-tight text-choco sm:inline">
          Huesca<span className="text-brand">Hoy</span>
        </span>
      )}
    </Link>
  );
}
