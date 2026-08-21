import type { MetadataRoute } from "next";
import { getCategoriesAdmin, getEvents, getPlans, todayStr } from "@/lib/db";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, plans, categories] = await Promise.all([
    getEvents({ from: todayStr(), limit: 200 }),
    getPlans(),
    getCategoriesAdmin(),
  ]);
  const now = new Date();

  const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${site.url}/eventos/${event.slug}`,
    lastModified: event.updatedAt ? new Date(event.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const planEntries: MetadataRoute.Sitemap = plans.map((plan) => ({
    url: `${site.url}/planes/${plan.slug}`,
    lastModified: plan.updatedAt ? new Date(plan.updatedAt) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${site.url}/agenda/${category.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${site.url}/agenda`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...categoryEntries,
    {
      url: `${site.url}/planes`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${site.url}/colabora`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...eventEntries,
    ...planEntries,
  ];
}
