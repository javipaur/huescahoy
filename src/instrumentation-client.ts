import posthog from "posthog-js";

const token =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

if (token) {
  posthog.init(token, {
    api_host: host,
    capture_pageview: true,
    capture_exceptions: true,
    autocapture: true,
    mask_all_text: true,
    mask_all_element_attributes: true,
  });
}
