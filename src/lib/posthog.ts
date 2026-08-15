import { PostHog } from "posthog-node";

let client: PostHog | null = null;

export function posthogServer(): PostHog | null {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token) return null;
  if (!client) {
    client = new PostHog(token, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}

export async function captureServerError(
  event: string,
  properties: Record<string, unknown>
): Promise<void> {
  const ph = posthogServer();
  if (!ph) return;
  try {
    ph.capture({
      distinctId: "huescahoy-server",
      event,
      properties,
    });
    await ph.shutdown();
  } catch {
    // el monitoreo nunca debe romper la app
  }
}
