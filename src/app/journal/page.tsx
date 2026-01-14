import { Suspense } from "react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { ArticleCard } from "@/components/journal/article-card";
import { JournalSearch } from "@/components/journal/search";
import type { ArticleCard as ArticleCardType, Pillar } from "@/lib/journal-types";

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

export const metadata = {
  title: "Journal | Craefto Lab",
  description:
    "Insights on systems thinking, applied AI, product craft, and creative technology from the Craefto Lab team.",
  alternates: {
    canonical: "https://craefto.com/journal",
    types: {
      "application/rss+xml": "https://craefto.com/journal/feed",
      "application/atom+xml": "https://craefto.com/journal/atom",
    },
  },
  openGraph: {
    title: "Journal | Craefto Lab",
    description:
      "Insights on systems thinking, applied AI, product craft, and creative technology.",
    url: "https://craefto.com/journal",
    type: "website",
  },
};

async function getArticles(pillarSlug?: string): Promise<ArticleCardType[]> {
  const supabase = createServerClient();

  let query = supabase
    .from("journal_published_articles")
    .select("*")
    .order("published_at", { ascending: false });

  if (pillarSlug) {
    query = query.eq("pillar_slug", pillarSlug);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching articles:", error);
    return [];
  }

  return (data || []).map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    featured_image_url: article.featured_image_url,
    content_type: article.content_type,
    pillar_name: article.pillar_name,
    pillar_slug: article.pillar_slug,
    pillar_color: article.pillar_color,
    author_name: article.author_name,
    author_slug: article.author_slug,
    author_avatar: article.author_avatar,
    published_at: article.published_at,
    reading_time: article.reading_time,
  }));
}

async function getPillars(): Promise<Pillar[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("journal_pillars")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error("Error fetching pillars:", error);
    return [];
  }

  return data || [];
}

interface JournalPageProps {
  searchParams: Promise<{ pillar?: string }>;
}

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const params = await searchParams;
  const activePillar = params.pillar;

  const [articles, pillars] = await Promise.all([
    getArticles(activePillar),
    getPillars(),
  ]);

  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="pt-28 md:pt-32 pb-12 md:pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-foreground-muted">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-foreground font-medium">Journal</li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6">
                Journal
              </h1>
              <p className="text-xl text-foreground-muted leading-relaxed">
                Insights on systems thinking, applied AI, product craft, and creative
                technology from the Craefto Lab team.
              </p>
            </div>
            <div className="lg:pb-2">
              <JournalSearch />
            </div>
          </div>
        </div>
      </section>

      {/* Pillar Filters */}
      <section className="px-6 lg:px-8 pb-12 md:pb-16 sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto">
          <nav className="flex flex-wrap items-center gap-2 py-4" aria-label="Content pillars">
            <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mr-2 hidden sm:inline">
              Filter:
            </span>
            <PillarTab href="/journal" active={!activePillar}>
              All
            </PillarTab>
            {pillars.map((pillar) => (
              <PillarTab
                key={pillar.id}
                href={`/journal?pillar=${pillar.slug}`}
                active={activePillar === pillar.slug}
                color={pillar.color}
              >
                {pillar.name}
              </PillarTab>
            ))}
          </nav>
        </div>
      </section>

      {/* Articles */}
      <section className="px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          {articles.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-background-subtle flex items-center justify-center">
                <svg className="w-8 h-8 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-foreground-muted text-lg mb-2">
                No articles published yet.
              </p>
              <p className="text-foreground-subtle text-sm">
                Check back soon for new content.
              </p>
            </div>
          ) : (
            <div className="space-y-20">
              {/* Featured Article */}
              {featuredArticle && (
                <Suspense fallback={<ArticleCardSkeleton featured />}>
                  <ArticleCard article={featuredArticle} featured />
                </Suspense>
              )}

              {/* Divider */}
              {remainingArticles.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    Latest Articles
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}

              {/* Article Grid */}
              {remainingArticles.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {remainingArticles.map((article) => (
                    <Suspense key={article.id} fallback={<ArticleCardSkeleton />}>
                      <ArticleCard article={article} />
                    </Suspense>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="px-6 lg:px-8 py-20 md:py-28 bg-background-subtle">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Stay in the loop
          </h2>
          <p className="text-foreground-muted mb-10 max-w-md mx-auto">
            Get our latest insights on AI, product strategy, and creative
            technology delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-5 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent shadow-sm"
              required
            />
            <button
              type="submit"
              className="px-7 py-3.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition-colors shadow-sm hover:shadow-md"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-foreground-subtle mt-4">
            No spam, unsubscribe anytime.
          </p>
        </div>
      </section>
    </main>
  );
}

function PillarTab({
  href,
  active,
  color,
  children,
}: {
  href: string;
  active: boolean;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-foreground text-background shadow-sm"
          : "bg-background text-foreground-muted hover:text-foreground hover:bg-background-subtle border border-border-subtle"
      }`}
    >
      {color && (
        <span
          className={`w-2 h-2 rounded-full transition-transform ${active ? "scale-0" : "scale-100"}`}
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </Link>
  );
}

function ArticleCardSkeleton({ featured = false }: { featured?: boolean }) {
  if (featured) {
    return (
      <div className="grid md:grid-cols-2 gap-8 items-center animate-pulse">
        <div className="aspect-[16/10] rounded-xl bg-background-subtle" />
        <div className="space-y-4">
          <div className="h-4 w-24 bg-background-subtle rounded" />
          <div className="h-10 w-full bg-background-subtle rounded" />
          <div className="h-20 w-full bg-background-subtle rounded" />
          <div className="h-4 w-48 bg-background-subtle rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      <div className="aspect-[16/10] rounded-xl bg-background-subtle" />
      <div className="h-4 w-24 bg-background-subtle rounded" />
      <div className="h-6 w-full bg-background-subtle rounded" />
      <div className="h-12 w-full bg-background-subtle rounded" />
      <div className="h-4 w-32 bg-background-subtle rounded" />
    </div>
  );
}
