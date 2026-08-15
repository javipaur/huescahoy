import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CategoryWithCount } from "@/lib/types";
import { getIcon } from "@/lib/icons";

export function CategoryGrid({ categories }: { categories: CategoryWithCount[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => {
        const Icon = getIcon(category.icon);
        return (
          <Link
            key={category.id}
            href={`/agenda?categoria=${category.slug}`}
            className="group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-sand bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5"
          >
            <span
              aria-hidden
              className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-[0.08] transition duration-300 group-hover:scale-125 group-hover:opacity-15"
              style={{ backgroundColor: category.color }}
            />
            <span className="relative flex items-start justify-between">
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-sm transition duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{ backgroundColor: category.color }}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full text-choco-muted/40 transition group-hover:bg-brand group-hover:text-white">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </span>
            <span className="relative">
              <span className="block font-display font-semibold text-choco group-hover:text-brand-dark">
                {category.name}
              </span>
              <span className="text-sm text-choco-muted">
                {category.event_count} {category.event_count === 1 ? "evento" : "eventos"}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
