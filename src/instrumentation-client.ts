const token =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

function initPosthog() {
  if (!token) return;
  import("posthog-js").then(({ default: posthog }) => {
    posthog.init(token, {
      api_host: host,
      capture_pageview: true,
      capture_exceptions: true,
      autocapture: true,
      mask_all_text: true,
      mask_all_element_attributes: true,
    });
  });
}

if (typeof window !== "undefined") {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(initPosthog, { timeout: 4000 });
  } else {
    setTimeout(initPosthog, 2000);
  }
}
