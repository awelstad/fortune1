import { ImageResponse } from "next/og";

export const alt = "Fortune Electrical Construction — Commercial Electrical Contractor, Florida";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#07090d",
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, letterSpacing: 4, color: "#9aa3b2" }}>
          <div style={{ width: 48, height: 2, background: "#6aa5ff" }} />
          COMMERCIAL ELECTRICAL CONTRACTOR · FLORIDA
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 112, fontWeight: 800, lineHeight: 0.92, letterSpacing: -3 }}>
          <span>FORTUNE</span>
          <span>ELECTRICAL</span>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#9aa3b2" }}>
          Aviation · Education · Government · Senior Living · Multifamily
        </div>
      </div>
    ),
    size,
  );
}
