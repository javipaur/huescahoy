export type FavoriteItem = {
  slug: string;
  title: string;
  startDate: string;
  image: string | null;
};

export type FavoritesSnapshot = Record<string, FavoriteItem>;

const KEY = "huescahoy:favorites";

const listeners = new Set<() => void>();
let snapshotCache: FavoritesSnapshot | null = null;

function notify(): void {
  snapshotCache = null;
  for (const listener of listeners) listener();
}

function loadFavorites(): FavoritesSnapshot {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as FavoritesSnapshot;
  } catch {
    return {};
  }
}

function saveFavorites(favorites: FavoritesSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(favorites));
  } catch {
    // almacenamiento no disponible; el guardado simplemente no persiste
  }
}

export function subscribeFavorites(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getFavoritesSnapshot(): FavoritesSnapshot {
  if (snapshotCache === null) snapshotCache = loadFavorites();
  return snapshotCache;
}

export function getServerFavoritesSnapshot(): FavoritesSnapshot {
  return {};
}

export function isFavorite(slug: string): boolean {
  return Boolean(loadFavorites()[slug]);
}

export function toggleFavorite(item: FavoriteItem): boolean {
  const favorites = loadFavorites();
  if (favorites[item.slug]) {
    delete favorites[item.slug];
    saveFavorites(favorites);
    notify();
    return false;
  }
  favorites[item.slug] = item;
  saveFavorites(favorites);
  notify();
  return true;
}

export function favoriteSlugs(): string[] {
  return Object.keys(loadFavorites());
}
