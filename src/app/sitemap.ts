import { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase";

type ChangeFrequency = "weekly" | "monthly" | "always" | "hourly" | "daily" | "yearly" | "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.craefto.com";
  const supabase = createServerClient();

  // Static pages
  const staticPages: { path: string; changeFrequency: ChangeFrequency; priority: number }[] = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/work", changeFrequency: "weekly", priority: 0.9 },
    { path: "/services", changeFrequency: "monthly", priority: 0.9 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
    { path: "/lab", changeFrequency: "monthly", priority: 0.7 },
    { path: "/journal", changeFrequency: "daily", priority: 0.9 },
  ];

  // Project pages (in production, fetch these from CMS or data source)
  const projectSlugs = [
    "project-alpha",
    "project-beta",
    "project-gamma",
    "project-delta",
  ];

  const routes: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${baseUrl}/work/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Fetch dynamic routes from Supabase (skip if not configured)
  if (!supabase) {
    return [...routes, ...projectRoutes];
  }

  // Fetch journal articles
  const { data: articles } = await supabase
    .from("journal_published_articles")
    .select("slug, updated_at, published_at")
    .order("published_at", { ascending: false });

  const articleRoutes: MetadataRoute.Sitemap = (articles || []).map((article) => ({
    url: `${baseUrl}/journal/${article.slug}`,
    lastModified: new Date(article.updated_at || article.published_at),
    changeFrequency: "weekly" as ChangeFrequency,
    priority: 0.8,
  }));

  // Fetch pillars
  const { data: pillars } = await supabase
    .from("journal_pillars")
    .select("slug");

  const pillarRoutes: MetadataRoute.Sitemap = (pillars || []).map((pillar) => ({
    url: `${baseUrl}/journal/pillar/${pillar.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as ChangeFrequency,
    priority: 0.7,
  }));

  // Fetch authors
  const { data: authors } = await supabase
    .from("journal_authors")
    .select("slug");

  const authorRoutes: MetadataRoute.Sitemap = (authors || []).map((author) => ({
    url: `${baseUrl}/journal/author/${author.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as ChangeFrequency,
    priority: 0.6,
  }));

  return [...routes, ...projectRoutes, ...articleRoutes, ...pillarRoutes, ...authorRoutes];
}
