import { NextRequest } from "next/server";
import { captureServerError } from "@/lib/posthog";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get("secret") === secret;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const webhookUrl = process.env.N8N_PROMO_WEBHOOK_URL;
  if (!webhookUrl) {
    return Response.json(
      {
        error:
          "N8N_PROMO_WEBHOOK_URL no configurada. Configura la URL del webhook de n8n (o activa el Schedule Trigger del workflow) para lanzar la promo diaria.",
      },
      { status: 500 }
    );
  }

  try {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    const webhookSecret = process.env.N8N_PROMO_WEBHOOK_SECRET;
    if (webhookSecret) {
      headers.authorization = `Bearer ${webhookSecret}`;
      headers["x-webhook-secret"] = webhookSecret;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source: "huescahoy-cron",
        triggeredAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(30_000),
    });

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);

    if (!response.ok) {
      return Response.json(
        {
          ok: false,
          error: "El webhook de n8n respondió con error",
          status: response.status,
          body,
        },
        { status: 502 }
      );
    }

    return Response.json({
      ok: true,
      triggered: true,
      status: response.status,
      body,
    });
  } catch (err) {
    await captureServerError("api_error", {
      route: "/api/cron/promo",
      error: err instanceof Error ? err.message : String(err),
    });
    return Response.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
