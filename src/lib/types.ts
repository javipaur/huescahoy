export type Category = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
};

export type CategoryWithCount = Category & { event_count: number };

export type CategoryInput = {
  name: string;
  slug: string;
  icon: string;
  color: string;
  sort_order: number;
};

export type EventStatus = "published" | "hidden" | "pending";

export type EventItem = {
  id: number;
  slug: string;
  title: string;
  categoryId: number | null;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  address: string | null;
  price: string | null;
  description: string | null;
  image: string | null;
  externalUrl: string | null;
  source: string;
  sourceUrl: string | null;
  featured: number;
  status: EventStatus;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  updatedAt: string;
};

export type EventInput = {
  title: string;
  slug: string;
  category_id: number | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  address: string | null;
  price: string | null;
  description: string | null;
  image: string | null;
  external_url: string | null;
  featured: number;
  status: EventStatus;
};

export type ScrapeEvent = {
  title: string;
  start_date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  address?: string | null;
  price?: string | null;
  description?: string | null;
  image?: string | null;
  external_url?: string | null;
  source_url?: string | null;
  category?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type SourceKind =
  | "rss"
  | "jsonld"
  | "radar"
  | "palacio"
  | "cpf"
  | "tec"
  | "somontano"
  | "aragon"
  | "monegros"
  | "ainsa"
  | "fraga"
  | "magia"
  | "ayto"
  | "huescalamagia-restaurants"
  | "huescalamagia-routes"
  | "huescalamagia-events"
  | "senderosgr"
  | "caminosnaturales"
  | "opendata-restaurants"
  | "huescaturismo"
  | "diputacion";

export type Source = {
  id: number;
  name: string;
  url: string;
  kind: SourceKind;
  categoryId: number | null;
  enabled: number;
  lastRun: string | null;
  lastStatus: "ok" | "error" | null;
  lastError: string | null;
  lastFound: number;
  lastNew: number;
  lastUpdated: number;
  createdAt: string;
};

export type SourceInput = {
  name: string;
  url: string;
  kind: SourceKind;
  category_id: number | null;
  enabled: number;
};

export type ScraperRun = {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  sourceId: number | null;
  sourceName: string | null;
  eventsFound: number;
  eventsNew: number;
  eventsUpdated: number;
  status: "ok" | "error";
  error: string | null;
};

export type SuggestionKind = "problema" | "mejora" | "idea";
export type SuggestionStatus = "nuevo" | "visto" | "hecho";

export type Suggestion = {
  id: number;
  kind: SuggestionKind;
  title: string;
  detail: string | null;
  contact: string | null;
  status: SuggestionStatus;
  createdAt: string;
};

export type SuggestionInput = {
  kind: SuggestionKind;
  title: string;
  detail: string | null;
  contact: string | null;
};

export type Plan = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  image: string | null;
  published: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PlanInput = {
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  image: string | null;
  published: number;
  sort_order: number;
};

export type FeaturedPickLinkType = "evento" | "plan";

export type FeaturedPick = {
  id: number;
  label: string;
  title: string;
  tagline: string | null;
  reason: string | null;
  linkType: FeaturedPickLinkType;
  targetSlug: string;
  imageUrl: string | null;
  active: number;
  createdAt: string;
  updatedAt: string;
};

export type FeaturedPickInput = {
  label: string;
  title: string;
  tagline: string | null;
  reason: string | null;
  link_type: FeaturedPickLinkType;
  target_slug: string;
  image_url: string | null;
  active: number;
};

export type RestaurantItem = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  cuisineType: string | null;
  priceRange: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  image: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  source: string;
  sourceUrl: string | null;
  status: "published" | "hidden";
  createdAt: string;
  updatedAt: string;
};

export type RestaurantInput = {
  name: string;
  slug: string;
  description: string | null;
  cuisine_type: string | null;
  price_range: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  image: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  source: string;
  source_url: string | null;
  status: "published" | "hidden";
};

export type RouteItem = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  summary: string | null;
  image: string | null;
  distanceKm: number | null;
  elevationM: number | null;
  difficulty: string | null;
  routeType: string | null;
  lat: number | null;
  lng: number | null;
  externalUrl: string | null;
  gpxUrl: string | null;
  stagesCount: number;
  source: string;
  sourceUrl: string | null;
  status: "published" | "hidden";
  createdAt: string;
  updatedAt: string;
};

export type RouteInput = {
  title: string;
  slug: string;
  description: string | null;
  summary: string | null;
  image: string | null;
  distance_km: number | null;
  elevation_m: number | null;
  difficulty: string | null;
  route_type: string | null;
  lat: number | null;
  lng: number | null;
  external_url: string | null;
  gpx_url: string | null;
  stages_count: number;
  source: string;
  source_url: string | null;
  status: "published" | "hidden";
};

export type RouteStage = {
  id: number;
  routeId: number;
  stageNumber: number;
  title: string;
  description: string | null;
  distanceKm: number | null;
  elevationGain: number | null;
  elevationLoss: number | null;
  lat: number | null;
  lng: number | null;
  sortOrder: number;
};

export type RestaurantFilter = {
  q?: string;
  cuisineType?: string;
  priceRange?: string;
  zone?: string;
  limit?: number;
};

export type RouteFilter = {
  q?: string;
  routeType?: string;
  difficulty?: string;
  limit?: number;
};
