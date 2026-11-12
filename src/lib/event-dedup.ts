export function normalizedTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function sameEventAcrossSources(
  titleA: string,
  dateA: string,
  titleB: string,
  dateB: string
): boolean {
  return normalizedTitle(titleA) === normalizedTitle(titleB) && dateA === dateB;
}