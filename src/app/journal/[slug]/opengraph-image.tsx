import { ImageResponse } from "next/og";
import { createServerClient } from "@/lib/supabase";

export const runtime = "edge";
export const alt = "Craefto Journal Article";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createServerClient();

  const { data: article } = await supabase
    .from("journal_published_articles")
    .select("title, pillar_name, pillar_color, author_name, reading_time")
    .eq("slug", slug)
    .single();

  if (!article) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FAF7F2",
            fontFamily: "system-ui",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 600, color: "#1A1714" }}>
            Article Not Found
          </div>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FAF7F2",
          fontFamily: "system-ui",
          padding: 60,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          {/* Pillar tag */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: article.pillar_color || "#5D6B59",
              }}
            />
            <span
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: article.pillar_color || "#5D6B59",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {article.pillar_name}
            </span>
          </div>

          {/* Logo */}
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "#1A1714",
            }}
          >
            Craefto
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: article.title.length > 60 ? 52 : 64,
              fontWeight: 600,
              color: "#1A1714",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: "90%",
            }}
          >
            {article.title}
          </h1>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 40,
            borderTop: "1px solid #E5E2DC",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: "#5D6B59",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FAF7F2",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {article.author_name.charAt(0)}
            </div>
            <span style={{ fontSize: 20, color: "#57534E" }}>
              {article.author_name}
            </span>
          </div>

          {article.reading_time && (
            <span style={{ fontSize: 18, color: "#78716C" }}>
              {article.reading_time} min read
            </span>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
