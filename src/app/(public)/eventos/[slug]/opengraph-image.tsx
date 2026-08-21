import { ImageResponse } from "next/og";
import { getCategoriesAdmin, getEventBySlug } from "@/lib/db";
import { formatDayLong, formatTimeRange } from "@/lib/format";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Evento en la agenda de Huesca";

export const runtime = "nodejs";

export default async function EventOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  const categories = await getCategoriesAdmin();
  const category = event?.categoryId
    ? categories.find((c) => c.id === event.categoryId) ?? null
    : null;
  const color = category?.color ?? "#16a34a";

  if (!event) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#14532d",
            color: "#fff",
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          {site.name}
        </div>
      ),
      { ...size }
    );
  }

  const dateLabel = formatDayLong(event.startDate);
  const timeLabel = formatTimeRange(event.startTime, event.endTime);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: `linear-gradient(135deg, #14532d 0%, ${color} 130%)`,
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "rgba(255,255,255,0.18)",
              fontSize: 36,
            }}
          >
            📅
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: 5 }}>
            {site.name.toUpperCase()}
          </div>
          {category && (
            <div
              style={{
                display: "flex",
                marginLeft: "auto",
                padding: "10px 26px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.92)",
                color: "#14532d",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {category.name}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: event.title.length > 60 ? 62 : 76,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -1,
          }}
        >
          {event.title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 34,
            color: "rgba(255,255,255,0.95)",
          }}
        >
          <span>{dateLabel}</span>
          {timeLabel && <span>· {timeLabel}</span>}
          {event.location && (
            <span
              style={{
                display: "flex",
                overflow: "hidden",
                maxWidth: 480,
                whiteSpace: "nowrap",
              }}
            >
              · {event.location}
            </span>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
