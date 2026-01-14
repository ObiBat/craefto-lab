import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerClient();
  const baseUrl = "https://craefto.com";

  const { data: articles } = await supabase
    .from("journal_published_articles")
    .select("title, slug, excerpt, published_at, author_name, pillar_name")
    .order("published_at", { ascending: false })
    .limit(50);

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Craefto Lab Journal</title>
    <link>${baseUrl}/journal</link>
    <description>Insights on systems thinking, applied AI, product craft, and creative technology from the Craefto Lab team.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/journal/feed" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>Craefto Lab Journal</title>
      <link>${baseUrl}/journal</link>
    </image>
    ${(articles || [])
      .map(
        (article) => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/journal/${article.slug}</link>
      <guid isPermaLink="true">${baseUrl}/journal/${article.slug}</guid>
      <pubDate>${new Date(article.published_at).toUTCString()}</pubDate>
      <author>hello@craefto.com (${article.author_name})</author>
      <category>${article.pillar_name}</category>
      <description><![CDATA[${article.excerpt || ""}]]></description>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
