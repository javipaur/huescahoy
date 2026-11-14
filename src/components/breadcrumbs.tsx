import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { site } from "@/lib/site";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: item.href.startsWith("http") ? item.href : `${site.url}${item.href}` }
        : {}),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav
        aria-label="Migas de pan"
        className={
          className ??
          "mb-6 overflow-x-auto whitespace-nowrap text-sm text-choco-muted [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        }
      >
        <ol className="flex min-w-0 items-center gap-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
                {index > 0 ? (
                  <span aria-hidden className="text-choco-muted/60">
                    /
                  </span>
                ) : null}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="transition hover:text-brand hover:underline underline-offset-2"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={`min-w-0 ${isLast ? "truncate font-medium text-choco dark:text-ink" : ""}`}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
