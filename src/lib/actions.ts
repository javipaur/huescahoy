"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth, setSessionCookie, clearSessionCookie } from "./auth";
import {
  createCategory,
  createEvent,
  createPlan,
  createSession,
  createSource,
  createSuggestion,
  deleteCategory,
  deleteEvent,
  deletePlan,
  deleteSession,
  deleteSource,
  deleteSuggestion,
  getEventBySlug,
  getPlanBySlug,
  isSuggestionKind,
  recentPendingEventCount,
  recentSuggestionCount,
  saveFeaturedPick,
  setSuggestionStatus,
  toggleEventFeatured,
  toggleEventStatus,
  togglePlanPublished,
  toggleSource,
  updateCategory,
  updateEvent,
  updatePlan,
  updateSource,
} from "./db";
import { runAllSources, runSourceById } from "./scraper/run";
import { sendDailyDigest } from "./digest";
import { sendNotificationEmail } from "./mail";
import { sendPush } from "./push";
import { clientKey, rateLimit } from "./rate-limit";
import { site } from "./site";
import type {
  CategoryInput,
  EventInput,
  PlanInput,
  SourceInput,
  SourceKind,
  SuggestionStatus,
} from "./types";

export type ActionResult = { error?: string };
export type SuggestResult = { ok?: boolean; error?: string };

const PUBLIC_PATHS = ["/", "/agenda", "/planes", "/api/eventos"];

function revalidateAll(): void {
  for (const path of PUBLIC_PATHS) revalidatePath(path);
  revalidatePath("/eventos/[slug]", "page");
  revalidatePath("/planes/[slug]", "page");
}

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD no está configurada en el entorno");
  return password;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function toString(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function toInt(value: FormDataEntryValue | null, fallback = 0): number {
  const parsed = parseInt(String(value ?? ""), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function checkboxOn(value: FormDataEntryValue | null): number {
  return value === "on" ? 1 : 0;
}

function nullable(value: string): string | null {
  return value.length > 0 ? value : null;
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base || "evento";
  let n = 2;
  while (await getEventBySlug(candidate)) {
    candidate = `${base}-${n}`;
    n++;
  }
  return candidate;
}

async function uniquePlanSlug(base: string): Promise<string> {
  let candidate = base || "plan";
  let n = 2;
  while (await getPlanBySlug(candidate)) {
    candidate = `${base}-${n}`;
    n++;
  }
  return candidate;
}

function parseEventInput(
  formData: FormData
): { error?: string; value?: EventInput } {
  const title = toString(formData.get("title"));
  if (!title) return { error: "El título del evento es obligatorio" };
  const startDate = toString(formData.get("start_date"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return { error: "La fecha de inicio es obligatoria (AAAA-MM-DD)" };
  }
  const categoryId = toInt(formData.get("category_id"), 0) || null;
  return {
    value: {
      title,
      slug: slugify(toString(formData.get("slug")) || title),
      category_id: categoryId,
      start_date: startDate,
      end_date: nullable(toString(formData.get("end_date"))),
      start_time: nullable(toString(formData.get("start_time"))),
      end_time: nullable(toString(formData.get("end_time"))),
      location: nullable(toString(formData.get("location"))),
      address: nullable(toString(formData.get("address"))),
      price: nullable(toString(formData.get("price"))),
      description: nullable(toString(formData.get("description"))),
      image: nullable(toString(formData.get("image"))),
      external_url: nullable(toString(formData.get("external_url"))),
      featured: checkboxOn(formData.get("featured")),
      status: toString(formData.get("status")) === "hidden" ? "hidden" : "published",
    },
  };
}

function parseCategoryInput(
  formData: FormData
): { error?: string; value?: CategoryInput } {
  const name = toString(formData.get("name"));
  if (!name) return { error: "El nombre de la categoría es obligatorio" };
  return {
    value: {
      name,
      slug: slugify(toString(formData.get("slug")) || name),
      icon: toString(formData.get("icon")) || "calendar",
      color: toString(formData.get("color")) || "#e8452c",
      sort_order: toInt(formData.get("sort_order"), 0),
    },
  };
}

function parseSourceInput(
  formData: FormData
): { error?: string; value?: SourceInput } {
  const name = toString(formData.get("name"));
  const url = toString(formData.get("url"));
  if (!name) return { error: "El nombre de la fuente es obligatorio" };
  if (!/^https?:\/\//i.test(url)) {
    return { error: "La URL de la fuente debe empezar por http:// o https://" };
  }
  const kind = toString(formData.get("kind")) as SourceKind;
  const validKinds: SourceKind[] = [
    "rss",
    "jsonld",
    "radar",
    "palacio",
    "cpf",
    "tec",
    "somontano",
    "aragon",
    "monegros",
    "ainsa",
    "fraga",
  ];
  if (!validKinds.includes(kind)) {
    return { error: "Tipo de fuente no válido" };
  }
  const categoryId = toInt(formData.get("category_id"), 0) || null;
  return {
    value: {
      name,
      url,
      kind,
      category_id: categoryId,
      enabled: checkboxOn(formData.get("enabled")),
    },
  };
}

function parsePlanInput(
  formData: FormData
): { error?: string; value?: PlanInput } {
  const title = toString(formData.get("title"));
  if (!title) return { error: "El título del plan es obligatorio" };
  const body = toString(formData.get("body"));
  if (!body) return { error: "El contenido del plan es obligatorio" };
  const summary = toString(formData.get("summary"));
  if (summary.length > 300) {
    return { error: "El resumen es demasiado largo (máximo 300 caracteres)" };
  }
  return {
    value: {
      title,
      slug: slugify(toString(formData.get("slug")) || title),
      summary: nullable(summary),
      body,
      image: nullable(toString(formData.get("image"))),
      published: checkboxOn(formData.get("published")),
      sort_order: toInt(formData.get("sort_order"), 0),
    },
  };
}

// ---------- Session ----------

export async function loginAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const password = toString(formData.get("password"));
  if (!safeEqual(password, getAdminPassword())) {
    redirect("/admin/login?error=1");
  }
  const token = crypto.randomBytes(32).toString("hex");
  await createSession(token);
  await setSessionCookie(token);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const token = await clearSessionCookie();
  if (token) await deleteSession(token);
  redirect("/admin/login");
}

// ---------- Events ----------

export async function createEventAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const parsed = parseEventInput(formData);
  if (parsed.error) return parsed;
  const value = { ...parsed.value!, slug: await uniqueSlug(parsed.value!.slug) };
  await createEvent(value);
  revalidateAll();
  return {};
}

export async function updateEventAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const id = toInt(formData.get("id"));
  const parsed = parseEventInput(formData);
  if (parsed.error) return parsed;
  await updateEvent(id, parsed.value!);
  revalidateAll();
  return {};
}

export async function toggleEventStatusById(id: number): Promise<ActionResult> {
  await requireAuth();
  await toggleEventStatus(id);
  revalidateAll();
  return {};
}

export async function toggleEventFeaturedById(id: number): Promise<ActionResult> {
  await requireAuth();
  await toggleEventFeatured(id);
  revalidateAll();
  return {};
}

export async function deleteEventById(id: number): Promise<ActionResult> {
  await requireAuth();
  await deleteEvent(id);
  revalidateAll();
  return {};
}

// ---------- Categories ----------

export async function createCategoryAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const parsed = parseCategoryInput(formData);
  if (parsed.error) return parsed;
  await createCategory(parsed.value!);
  revalidateAll();
  return {};
}

export async function updateCategoryAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const id = toInt(formData.get("id"));
  const parsed = parseCategoryInput(formData);
  if (parsed.error) return parsed;
  await updateCategory(id, parsed.value!);
  revalidateAll();
  return {};
}

export async function deleteCategoryById(id: number): Promise<ActionResult> {
  await requireAuth();
  await deleteCategory(id);
  revalidateAll();
  return {};
}

// ---------- Sources / Scraper ----------

export async function createSourceAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const parsed = parseSourceInput(formData);
  if (parsed.error) return parsed;
  await createSource(parsed.value!);
  revalidateAll();
  return {};
}

export async function updateSourceAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const id = toInt(formData.get("id"));
  const parsed = parseSourceInput(formData);
  if (parsed.error) return parsed;
  await updateSource(id, parsed.value!);
  revalidateAll();
  return {};
}

export async function deleteSourceById(id: number): Promise<ActionResult> {
  await requireAuth();
  await deleteSource(id);
  revalidateAll();
  return {};
}

export async function toggleSourceEnabled(id: number): Promise<ActionResult> {
  await requireAuth();
  await toggleSource(id);
  revalidateAll();
  return {};
}

export async function runScraperAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult & { summary?: string }> {
  await requireAuth();
  const sourceId = toInt(formData.get("source_id"), 0);
  const result =
    sourceId > 0 ? await runSourceById(sourceId) : await runAllSources();
  revalidateAll();
  if (result.status === "error") {
    return { summary: `Error al procesar: ${result.error ?? "desconocido"}` };
  }
  if (sourceId > 0) {
    return {
      summary: `Fuente procesada: ${result.found} eventos encontrados, ${result.created} nuevos, ${result.updated} actualizados.`,
    };
  }
  return {
    summary: `Scraping completado: ${result.found} eventos, ${result.created} nuevos, ${result.updated} actualizados.`,
  };
}

// ---------- Suggestions (público) ----------

export async function submitSuggestionAction(
  _prevState: SuggestResult | undefined,
  formData: FormData
): Promise<SuggestResult> {
  if (toString(formData.get("website"))) {
    return { ok: true };
  }

  const ipLimit = rateLimit(clientKey(await headers(), "sugerencia"), 5, 10 * 60 * 1000);
  if (!ipLimit.ok) {
    return { error: "Demasiados envíos desde tu conexión. Inténtalo más tarde." };
  }

  const kind = toString(formData.get("kind"));
  if (!isSuggestionKind(kind)) {
    return { error: "Elige el tipo de sugerencia" };
  }

  const title = toString(formData.get("title"));
  if (title.length < 3) {
    return { error: "Cuéntanos un poco más en el título (mínimo 3 caracteres)" };
  }
  if (title.length > 140) {
    return { error: "El título es demasiado largo (máximo 140 caracteres)" };
  }

  const detail = toString(formData.get("detail"));
  if (detail.length > 2000) {
    return { error: "El mensaje es demasiado largo (máximo 2000 caracteres)" };
  }

  if ((await recentSuggestionCount()) >= 15) {
    return { error: "Demasiadas sugerencias en pocos minutos. Inténtalo más tarde." };
  }

  await createSuggestion({
    kind,
    title,
    detail: nullable(detail),
    contact: nullable(toString(formData.get("contact"))),
  });

  const kindLabels: Record<string, string> = {
    mejora: "Sugerencia de mejora",
    problema: "Problema reportado",
    idea: "Idea propuesta",
  };
  const contact = toString(formData.get("contact"));
  await sendNotificationEmail({
    subject: `[Huesca Hoy] ${kindLabels[kind] ?? "Sugerencia"}: ${title}`,
    text: [
      `Tipo: ${kindLabels[kind] ?? kind}`,
      `Título: ${title}`,
      detail ? `\nDetalle:\n${detail}` : "",
      contact ? `\nContacto: ${contact}` : "\n(sin contacto)",
      `\nGestiona desde el panel: ${site.url}/admin/sugerencias`,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return { ok: true };
}

// ---------- Autopublicación de eventos ----------

export async function submitEventAction(
  _prevState: SuggestResult | undefined,
  formData: FormData
): Promise<SuggestResult> {
  if (toString(formData.get("website"))) {
    return { ok: true };
  }

  const ipLimit = rateLimit(clientKey(await headers(), "evento-publicado"), 3, 60 * 60 * 1000);
  if (!ipLimit.ok) {
    return { error: "Demasiados envíos desde tu conexión. Inténtalo más tarde." };
  }

  const title = toString(formData.get("title"));
  if (title.length < 3) {
    return { error: "El título es obligatorio (mínimo 3 caracteres)" };
  }
  if (title.length > 140) {
    return { error: "El título es demasiado largo (máximo 140 caracteres)" };
  }

  const startDate = toString(formData.get("start_date"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return { error: "La fecha de inicio es obligatoria (formato AAAA-MM-DD)" };
  }
  const endDate = nullable(toString(formData.get("end_date")));
  if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return { error: "La fecha de fin no tiene un formato válido" };
  }

  const description = toString(formData.get("description"));
  if (description.length > 3000) {
    return { error: "La descripción es demasiado larga (máximo 3000 caracteres)" };
  }

  const image = toString(formData.get("image"));
  if (image && !/^https?:\/\//i.test(image)) {
    return { error: "La URL de la imagen debe empezar por http:// o https://" };
  }
  const externalUrl = toString(formData.get("external_url"));
  if (externalUrl && !/^https?:\/\//i.test(externalUrl)) {
    return { error: "La URL con más información debe empezar por http:// o https://" };
  }

  if ((await recentPendingEventCount()) >= 10) {
    return { error: "Demasiados eventos en pocos minutos. Inténtalo más tarde." };
  }

  await createEvent({
    title,
    slug: await uniqueSlug(slugify(title) || "evento"),
    category_id: null,
    start_date: startDate,
    end_date: endDate,
    start_time: nullable(toString(formData.get("start_time"))),
    end_time: nullable(toString(formData.get("end_time"))),
    location: nullable(toString(formData.get("location"))),
    address: nullable(toString(formData.get("address"))),
    price: nullable(toString(formData.get("price"))),
    description: nullable(description),
    image: nullable(image),
    external_url: nullable(externalUrl),
    featured: 0,
    status: "pending",
  });

  const contact = toString(formData.get("contact"));
  await sendNotificationEmail({
    subject: `[Huesca Hoy] Nuevo evento para revisar: ${title}`,
    text: [
      `Evento: ${title}`,
      `Fecha: ${endDate ? `${startDate} al ${endDate}` : startDate}`,
      toString(formData.get("start_time"))
        ? `Hora: ${toString(formData.get("start_time"))}`
        : "",
      toString(formData.get("location"))
        ? `Lugar: ${toString(formData.get("location"))}`
        : "",
      toString(formData.get("price")) ? `Precio: ${toString(formData.get("price"))}` : "",
      description ? `\nDescripción:\n${description}` : "",
      externalUrl ? `\nMás info: ${externalUrl}` : "",
      contact ? `\nContacto del organizador: ${contact}` : "\n(sin contacto)",
      `\nRevísalo y publícalo desde el panel: ${site.url}/admin/eventos`,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return { ok: true };
}

// ---------- Suggestions (admin) ----------

export async function setSuggestionStatusAction(
  id: number,
  status: SuggestionStatus
): Promise<ActionResult> {
  await requireAuth();
  await setSuggestionStatus(id, status);
  return {};
}

export async function deleteSuggestionById(id: number): Promise<ActionResult> {
  await requireAuth();
  await deleteSuggestion(id);
  return {};
}

// ---------- Notificaciones push ----------

export async function sendPushAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult & { summary?: string }> {
  await requireAuth();
  const title = toString(formData.get("title"));
  if (!title) return { error: "El título es obligatorio" };
  const text = toString(formData.get("text"));
  const url = toString(formData.get("url")) || undefined;
  if (url && !/^https?:\/\//i.test(url)) {
    return { error: "El enlace debe empezar por http:// o https://" };
  }
  const result = await sendPush({ title, body: text, url, tag: "admin" });
  return { summary: `Notificación enviada a ${result.sent} dispositivos.` };
}

export async function runDigestAction(): Promise<ActionResult & { summary?: string }> {
  await requireAuth();
  const result = await sendDailyDigest();
  const messages: Record<typeof result.status, string> = {
    sent: `Resumen enviado a ${result.sent} dispositivos (${result.events} eventos).`,
    already_sent: "El resumen de hoy ya se ha enviado antes.",
    nothing_to_send: "No hay eventos próximos para notificar hoy.",
    not_configured: "Las claves VAPID no están configuradas.",
  };
  return { summary: messages[result.status] };
}

// ---------- Planes ----------

export async function createPlanAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const parsed = parsePlanInput(formData);
  if (parsed.error) return parsed;
  const value = { ...parsed.value!, slug: await uniquePlanSlug(parsed.value!.slug) };
  await createPlan(value);
  revalidateAll();
  return {};
}

export async function updatePlanAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const id = toInt(formData.get("id"));
  const parsed = parsePlanInput(formData);
  if (parsed.error) return parsed;
  await updatePlan(id, parsed.value!);
  revalidateAll();
  return {};
}

export async function deletePlanById(id: number): Promise<ActionResult> {
  await requireAuth();
  await deletePlan(id);
  revalidateAll();
  return {};
}

export async function togglePlanPublishedById(id: number): Promise<ActionResult> {
  await requireAuth();
  await togglePlanPublished(id);
  revalidateAll();
  return {};
}

export type FeaturedPickResult = { error?: string; summary?: string };

export async function saveFeaturedPickAction(
  _prevState: FeaturedPickResult | undefined,
  formData: FormData
): Promise<FeaturedPickResult> {
  await requireAuth();
  const label = String(formData.get("label") ?? "").trim() || "El plan del finde";
  const title = String(formData.get("title") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const linkType =
    String(formData.get("link_type") ?? "evento") === "plan" ? "plan" : "evento";
  const targetSlug = String(formData.get("target_slug") ?? "").trim();
  const active = formData.get("active") === "on" ? 1 : 0;

  if (!title || !targetSlug) {
    return { error: "El título y el slug del enlace son obligatorios." };
  }

  const target =
    linkType === "plan"
      ? await getPlanBySlug(targetSlug)
      : await getEventBySlug(targetSlug);
  if (!target) {
    return { error: `No existe ${linkType === "plan" ? "un plan" : "un evento"} con ese slug.` };
  }

  await saveFeaturedPick({
    label,
    title,
    tagline: tagline || null,
    reason: reason || null,
    link_type: linkType,
    target_slug: targetSlug,
    image_url: imageUrl || null,
    active,
  });
  revalidateAll();
  return { summary: "Plan del finde guardado. Revisa la portada." };
}
