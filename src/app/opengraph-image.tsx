import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} · Agenda cultural de ${site.city}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "88px",
          background:
            "linear-gradient(135deg, #14532d 0%, #16a34a 60%, #22c55e 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "92px",
              height: "92px",
              borderRadius: "28px",
              background: "rgba(255,255,255,0.18)",
              fontSize: "52px",
            }}
          >
            📅
          </div>
          <div style={{ fontSize: "34px", fontWeight: 600, letterSpacing: 6 }}>
            {site.name.toUpperCase()}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: "88px",
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.05,
          }}
        >
          Agenda cultural
          <br />
          de {site.city}
        </div>
        <div
          style={{
            marginTop: "28px",
            fontSize: "34px",
            color: "rgba(255,255,255,0.9)",
          }}
        >
          Conciertos · teatro · cine · exposiciones · planes en familia
        </div>
      </div>
    ),
    { ...size }
  );
}
