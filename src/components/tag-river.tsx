import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type TagRiverChip = {
  href: string;
  label: string;
  icon?: LucideIcon;
  /** Dato breve a mostrar (contador, texto informativo, etc.) */
  info?: string | number | null;
  /** Si es true, se marca visualmente como sección aún sin página propia */
  muted?: boolean;
};

export function TagRiver({
  chips,
  label = "Explora por secciones",
}: {
  chips: TagRiverChip[];
  label?: string;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="tag-river-wrap" aria-label={label}>
      <div className="tag-river">
        <div className="tag-river-track">
          {chips.map((chip, i) => (
            <Chip key={`a-${chip.href}-${chip.label}-${i}`} chip={chip} />
          ))}
          {chips.map((chip, i) => (
            <Chip
              key={`b-${chip.href}-${chip.label}-${i}`}
              chip={chip}
              ariaHidden
              tabIndex={-1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Chip({
  chip,
  ariaHidden,
  tabIndex,
}: {
  chip: TagRiverChip;
  ariaHidden?: boolean;
  tabIndex?: number;
}) {
  const Icon = chip.icon;
  const hasInfo = chip.info !== null && chip.info !== undefined && chip.info !== "";

  return (
    <Link
      href={chip.href}
      className={`tag-chip${chip.muted ? " tag-chip-muted" : ""}`}
      aria-hidden={ariaHidden || undefined}
      tabIndex={tabIndex}
    >
      {Icon ? <Icon className="h-[13px] w-[13px] shrink-0" aria-hidden /> : null}
      <span>{chip.label}</span>
      {hasInfo ? <span className="tag-chip-info">{chip.info}</span> : null}
    </Link>
  );
}
