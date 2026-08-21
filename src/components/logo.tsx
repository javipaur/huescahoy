import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Huesca Hoy">
      <Image
        src="/logo.png"
        alt=""
        width={36}
        height={36}
        priority
        className="h-9 w-9 rounded-xl object-cover shadow-sm shadow-brand/30"
      />
      {!compact && (
        <span className="hidden font-display text-xl font-bold tracking-tight text-choco sm:inline">
          Huesca<span className="text-brand">Hoy</span>
        </span>
      )}
    </Link>
  );
}
