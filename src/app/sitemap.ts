import { MetadataRoute } from "next";

type ChangeFrequency = "weekly" | "monthly" | "always" | "hourly" | "daily" | "yearly" | "never";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://craefto.com";

  // Static pages
  const staticPages: { path: string; changeFrequency: ChangeFrequency; priority: number }[] = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/work", changeFrequency: "weekly", priority: 0.9 },
    { path: "/services", changeFrequency: "monthly", priority: 0.9 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
    { path: "/lab", changeFrequency: "monthly", priority: 0.7 },
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

  return [...routes, ...projectRoutes];
}
