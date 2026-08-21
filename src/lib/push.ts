import webPush from "web-push";
import {
  countPushSubscriptions,
  deletePushSubscriptionByEndpoint,
  getPushSubscriptions,
  getPushSubscriptionsByCategories,
} from "./db";
import { captureServerError } from "./posthog";
import { site } from "./site";

type PushPayload = {
  title: string;
  body?: string;
  url?: string;
  tag?: string;
};

function getVapidKeys(): {
  subject: string;
  publicKey: string;
  privateKey: string;
} | null {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? `mailto:hola@${new URL(site.url).hostname}`;
  if (!publicKey || !privateKey) return null;
  return { subject, publicKey, privateKey };
}

export function pushConfigured(): boolean {
  return getVapidKeys() !== null;
}

async function deliver(
  subscriptions: Array<{ endpoint: string; keysP256dh: string; keysAuth: string }>,
  payload: PushPayload
): Promise<{ sent: number; removed: number }> {
  const keys = getVapidKeys();
  if (!keys) return { sent: 0, removed: 0 };

  webPush.setVapidDetails(keys.subject, keys.publicKey, keys.privateKey);
  if (subscriptions.length === 0) return { sent: 0, removed: 0 };

  const url = payload.url ?? site.url;
  const tag = payload.tag ?? "huescahoy";
  const data = JSON.stringify({ title: payload.title, body: payload.body ?? "", url, tag });

  let sent = 0;
  let removed = 0;
  for (const sub of subscriptions) {
    const subscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keysP256dh, auth: sub.keysAuth },
    };
    try {
      await webPush.sendNotification(subscription, data);
      sent++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/410|404|gone|no longer/i.test(message)) {
        await deletePushSubscriptionByEndpoint(sub.endpoint);
        removed++;
      } else {
        await captureServerError("push_error", {
          endpoint: sub.endpoint.slice(0, 80),
          error: message,
        });
      }
    }
  }
  return { sent, removed };
}

export async function sendPush(
  payload: PushPayload,
  opts?: { url?: string; tag?: string }
): Promise<{ sent: number; removed: number }> {
  const subscriptions = await getPushSubscriptions();
  return deliver(subscriptions, {
    ...payload,
    url: opts?.url ?? payload.url,
    tag: opts?.tag ?? payload.tag,
  });
}

export async function sendCategoryPush(params: {
  categorySlug: string;
  categoryName: string;
  titles: string[];
}): Promise<{ sent: number; removed: number }> {
  const subscriptions = await getPushSubscriptionsByCategories([params.categorySlug]);
  return deliver(subscriptions, {
    title: `${params.categoryName}: novedades en la agenda`,
    body: params.titles.slice(0, 2).join(" · "),
    url: `/agenda?categoria=${params.categorySlug}`,
    tag: `cat-${params.categorySlug}`,
  });
}

export async function sendPushToAll(
  title: string,
  body: string,
  url?: string
): Promise<{ sent: number; removed: number }> {
  return sendPush({ title, body, url });
}

export async function pushSubscriberCount(): Promise<number> {
  if (!pushConfigured()) return 0;
  return countPushSubscriptions();
}
