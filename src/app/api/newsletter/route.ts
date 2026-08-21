import { NextRequest } from "next/server";
import { addNewsletterSubscriber } from "@/lib/db";
import { captureServerError } from "@/lib/posthog";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request.headers, "newsletter"), 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return Response.json(
      { error: "Demasiados intentos. Inténtalo más tarde." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  try {
    const body = (await request.json().catch(() => null)) as
      | { email?: string }
      | null;
    const email = body?.email?.trim().toLowerCase() ?? "";
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return Response.json({ error: "Introduce un correo válido" }, { status: 400 });
    }
    const result = await addNewsletterSubscriber(email);
    return Response.json({ ok: true, result });
  } catch (err) {
    await captureServerError("api_error", {
      route: "/api/newsletter",
      error: err instanceof Error ? err.message : String(err),
    });
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
