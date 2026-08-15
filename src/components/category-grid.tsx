import Link from "next/link";
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
            className="group flex flex-col gap-3 rounded-2xl border border-sand bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
          >
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl text-white transition group-hover:scale-110"
              style={{ backgroundColor: category.color }}
            >
              <Icon className="h-6 w-6" />
            </span>
            <span>
              <span className="block font-display font-semibold text-choco">
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
