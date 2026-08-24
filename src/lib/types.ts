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
  | "ayto";

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
