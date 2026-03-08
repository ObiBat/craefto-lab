import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerClient();
  const baseUrl = "https://www.craefto.com";

  const { data: articles } = await supabase
    .from("journal_published_articles")
    .select("title, slug, excerpt, published_at, updated_at, author_name, author_slug")
    .order("published_at", { ascending: false })
    .limit(50);

  const latestUpdate = articles?.[0]?.updated_at || articles?.[0]?.published_at || new Date().toISOString();

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Craefto Journal</title>
  <subtitle>Insights on systems thinking, applied AI, product craft, and creative technology</subtitle>
  <link href="${baseUrl}/journal/atom" rel="self" type="application/atom+xml"/>
  <link href="${baseUrl}/journal" rel="alternate" type="text/html"/>
  <id>${baseUrl}/journal</id>
  <updated>${new Date(latestUpdate).toISOString()}</updated>
  <author>
    <name>Craefto</name>
    <email>hello@craefto.com</email>
    <uri>${baseUrl}</uri>
  </author>
  <icon>${baseUrl}/favicon.ico</icon>
  <logo>${baseUrl}/logo.png</logo>
  <rights>Copyright ${new Date().getFullYear()} Craefto</rights>
  ${(articles || [])
    .map(
      (article) => `
  <entry>
    <title><![CDATA[${article.title}]]></title>
    <link href="${baseUrl}/journal/${article.slug}" rel="alternate" type="text/html"/>
    <id>${baseUrl}/journal/${article.slug}</id>
    <published>${new Date(article.published_at).toISOString()}</published>
    <updated>${new Date(article.updated_at || article.published_at).toISOString()}</updated>
    <author>
      <name>${article.author_name}</name>
      <uri>${baseUrl}/journal/author/${article.author_slug}</uri>
    </author>
    <summary type="html"><![CDATA[${article.excerpt || ""}]]></summary>
  </entry>`
    )
    .join("")}
</feed>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
