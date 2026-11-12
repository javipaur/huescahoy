import type { MetadataRoute } from "next";
import { getCategoriesAdmin, getEvents, getRestaurants, getRoutes, todayStr } from "@/lib/db";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, categories, restaurants, routes] = await Promise.all([
    getEvents({ from: todayStr(), limit: 200 }),
    getCategoriesAdmin(),
    getRestaurants({ limit: 500 }),
    getRoutes({ limit: 500 }),
  ]);
  const now = new Date();

  const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${site.url}/eventos/${event.slug}`,
    lastModified: event.updatedAt ? new Date(event.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${site.url}/agenda/${category.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const restaurantEntries: MetadataRoute.Sitemap = restaurants.map((restaurant) => ({
    url: `${site.url}/restaurantes/${restaurant.slug}`,
    lastModified: restaurant.updatedAt ? new Date(restaurant.updatedAt) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const routeEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${site.url}/rutas/${route.slug}`,
    lastModified: route.updatedAt ? new Date(route.updatedAt) : now,
    changeFrequency: "monthly",
    priority: 0.6,
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
    {
      url: `${site.url}/cultura`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...categoryEntries,
    {
      url: `${site.url}/buscar`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${site.url}/restaurantes`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${site.url}/rutas`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${site.url}/colabora`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...eventEntries,
    ...restaurantEntries,
    ...routeEntries,
  ];
}
