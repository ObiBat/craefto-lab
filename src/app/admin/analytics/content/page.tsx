"use client";

import * as React from "react";
import Link from "next/link";
import { AdminLoader } from "@/components/admin/AdminLoader";

interface ArticlePerformance {
  id: string;
  article_id: string;
  total_views: number;
  unique_visitors: number;
  avg_time_on_page: number | null;
  avg_scroll_depth: number | null;
  share_count: number;
  views_last_7_days: number;
  views_last_30_days: number;
  trend_score: number;
  first_view_at: string | null;
  last_view_at: string | null;
  journal_articles: {
    title: string;
    slug: string;
  };
}

interface DailyView {
  view_date: string;
  view_count: number;
  unique_visitors: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  const isPositive = change >= 0;

  return (
    <span className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
      {isPositive ? "↑" : "↓"} {Math.abs(change).toFixed(0)}%
    </span>
  );
}

export default function ContentAnalyticsPage() {
  const [topArticles, setTopArticles] = React.useState<ArticlePerformance[]>([]);
  const [trending, setTrending] = React.useState<ArticlePerformance[]>([]);
  const [selectedArticle, setSelectedArticle] = React.useState<string | null>(null);
  const [articleDetails, setArticleDetails] = React.useState<{
    performance: ArticlePerformance | null;
    dailyViews: DailyView[];
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState<"7" | "30" | "90">("30");

  // Fetch overview data
  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/analytics/article");
        if (res.ok) {
          const data = await res.json();
          setTopArticles(data.topArticles || []);
          setTrending(data.trending || []);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Fetch article details when selected
  React.useEffect(() => {
    if (!selectedArticle) {
      setArticleDetails(null);
      return;
    }

    async function fetchDetails() {
      try {
        const res = await fetch(
          `/api/analytics/article?articleId=${selectedArticle}&days=${timeRange}`
        );
        if (res.ok) {
          const data = await res.json();
          setArticleDetails(data);
        }
      } catch (error) {
        console.error("Failed to fetch article details:", error);
      }
    }
    fetchDetails();
  }, [selectedArticle, timeRange]);

  // Calculate totals
  const totalViews = topArticles.reduce((sum, a) => sum + a.total_views, 0);
  const totalVisitors = topArticles.reduce((sum, a) => sum + a.unique_visitors, 0);
  const avgTimeOnPage = topArticles.length
    ? Math.round(
        topArticles.reduce((sum, a) => sum + (a.avg_time_on_page || 0), 0) /
          topArticles.filter((a) => a.avg_time_on_page).length
      )
    : 0;

  if (loading) {
    return <AdminLoader message="Loading content analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--color-foreground-muted))] mb-2">
          <Link href="/admin/analytics" className="hover:text-[hsl(var(--color-foreground))]">
            Analytics
          </Link>
          <span>/</span>
          <span className="text-[hsl(var(--color-foreground))]">Content Performance</span>
        </div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl tracking-tight font-semibold">Content Performance</h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4">
          <p className="text-3xl font-semibold text-[hsl(var(--color-foreground))]">{formatNumber(totalViews)}</p>
          <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Total Views</p>
        </div>
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4">
          <p className="text-3xl font-semibold text-[hsl(var(--color-foreground))]">{formatNumber(totalVisitors)}</p>
          <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Unique Visitors</p>
        </div>
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4">
          <p className="text-3xl font-semibold text-[hsl(var(--color-foreground))]">{topArticles.length}</p>
          <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Articles Tracked</p>
        </div>
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4">
          <p className="text-3xl font-semibold text-[hsl(var(--color-foreground))]">
            {avgTimeOnPage ? `${Math.floor(avgTimeOnPage / 60)}:${(avgTimeOnPage % 60).toString().padStart(2, "0")}` : "—"}
          </p>
          <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Avg. Time on Page</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[hsl(var(--color-border))]">
            <h2 className="text-lg font-semibold">Top Articles</h2>
          </div>
          <div className="divide-y divide-[#27272a]">
            {topArticles.length === 0 ? (
              <div className="px-6 py-8 text-center text-[hsl(var(--color-foreground-subtle))]">
                No analytics data yet
              </div>
            ) : (
              topArticles.slice(0, 10).map((article, index) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article.article_id)}
                  className="w-full px-6 py-3 flex items-center gap-4 hover:bg-[hsl(var(--color-background-subtle))] transition-colors text-left"
                >
                  <span className="text-lg font-semibold text-[hsl(var(--color-foreground-subtle))] w-6">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[hsl(var(--color-foreground))] truncate">
                      {article.journal_articles?.title || "Unknown"}
                    </p>
                    <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">
                      {formatNumber(article.total_views)} views
                    </p>
                  </div>
                  <TrendIndicator
                    current={article.views_last_7_days}
                    previous={article.views_last_30_days / 4}
                  />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Trending Now */}
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[hsl(var(--color-border))]">
            <h2 className="text-lg font-semibold">Trending Now</h2>
            <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">Based on recent engagement</p>
          </div>
          <div className="divide-y divide-[#27272a]">
            {trending.length === 0 ? (
              <div className="px-6 py-8 text-center text-[hsl(var(--color-foreground-subtle))]">
                No trending data yet
              </div>
            ) : (
              trending.slice(0, 10).map((article, index) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article.article_id)}
                  className="w-full px-6 py-3 flex items-center gap-4 hover:bg-[hsl(var(--color-background-subtle))] transition-colors text-left"
                >
                  <span className="text-lg font-semibold text-[hsl(var(--color-accent))] w-6">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[hsl(var(--color-foreground))] truncate">
                      {article.journal_articles?.title || "Unknown"}
                    </p>
                    <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">
                      {formatNumber(article.views_last_7_days)} views this week
                    </p>
                  </div>
                  <span className="text-xs text-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent))]/10 px-2 py-1 rounded">
                    Score: {article.trend_score.toFixed(0)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && articleDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-[hsl(var(--color-border))] flex items-center justify-between sticky top-0 bg-[hsl(var(--color-background-muted))]">
              <div>
                <h2 className="text-xl font-semibold">
                  {articleDetails.performance?.journal_articles?.title || "Article Details"}
                </h2>
                {articleDetails.performance?.journal_articles?.slug && (
                  <a
                    href={`/journal/${articleDetails.performance.journal_articles.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[hsl(var(--color-accent))] hover:underline"
                  >
                    View Article →
                  </a>
                )}
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-subtle))] rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Time Range Selector */}
              <div className="flex gap-2">
                {(["7", "30", "90"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                      timeRange === range
                        ? "bg-[hsl(var(--color-accent))] text-black"
                        : "bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))]"
                    }`}
                  >
                    {range} Days
                  </button>
                ))}
              </div>

              {/* Stats Grid */}
              {articleDetails.performance && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[hsl(var(--color-background-subtle))] rounded-xl p-4">
                    <p className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
                      {formatNumber(articleDetails.performance.total_views)}
                    </p>
                    <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Total Views</p>
                  </div>
                  <div className="bg-[hsl(var(--color-background-subtle))] rounded-xl p-4">
                    <p className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
                      {formatNumber(articleDetails.performance.unique_visitors)}
                    </p>
                    <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Unique Visitors</p>
                  </div>
                  <div className="bg-[hsl(var(--color-background-subtle))] rounded-xl p-4">
                    <p className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
                      {articleDetails.performance.avg_scroll_depth
                        ? `${articleDetails.performance.avg_scroll_depth.toFixed(0)}%`
                        : "—"}
                    </p>
                    <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Avg. Scroll Depth</p>
                  </div>
                  <div className="bg-[hsl(var(--color-background-subtle))] rounded-xl p-4">
                    <p className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
                      {articleDetails.performance.share_count}
                    </p>
                    <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Shares</p>
                  </div>
                </div>
              )}

              {/* Daily Views Chart (Simple Bar Chart) */}
              {articleDetails.dailyViews.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-4">Daily Views</h3>
                  <div className="flex items-end gap-1 h-32">
                    {articleDetails.dailyViews.slice(0, 30).reverse().map((day, index) => {
                      const maxViews = Math.max(...articleDetails.dailyViews.map((d) => d.view_count));
                      const height = maxViews > 0 ? (day.view_count / maxViews) * 100 : 0;
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-[hsl(var(--color-accent))]/60 hover:bg-[hsl(var(--color-accent))] transition-colors rounded-t cursor-pointer group relative"
                          style={{ height: `${Math.max(height, 4)}%` }}
                          title={`${formatDate(day.view_date)}: ${day.view_count} views`}
                        >
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[hsl(var(--color-background-subtle))] px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {formatDate(day.view_date)}: {day.view_count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
