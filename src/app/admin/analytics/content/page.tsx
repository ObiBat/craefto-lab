"use client";

import * as React from "react";
import Link from "next/link";

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
    <span className={`text-xs font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
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
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[#222] rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#18181b] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-[#a1a1aa] mb-2">
          <Link href="/admin/analytics" className="hover:text-white">
            Analytics
          </Link>
          <span>/</span>
          <span className="text-white">Content Performance</span>
        </div>
        <h1 className="text-2xl font-semibold">Content Performance</h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
          <p className="text-3xl font-semibold text-white">{formatNumber(totalViews)}</p>
          <p className="text-sm text-[#a1a1aa]">Total Views</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
          <p className="text-3xl font-semibold text-white">{formatNumber(totalVisitors)}</p>
          <p className="text-sm text-[#a1a1aa]">Unique Visitors</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
          <p className="text-3xl font-semibold text-white">{topArticles.length}</p>
          <p className="text-sm text-[#a1a1aa]">Articles Tracked</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
          <p className="text-3xl font-semibold text-white">
            {avgTimeOnPage ? `${Math.floor(avgTimeOnPage / 60)}:${(avgTimeOnPage % 60).toString().padStart(2, "0")}` : "—"}
          </p>
          <p className="text-sm text-[#a1a1aa]">Avg. Time on Page</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#27272a]">
            <h2 className="text-lg font-semibold">Top Articles</h2>
          </div>
          <div className="divide-y divide-[#27272a]">
            {topArticles.length === 0 ? (
              <div className="px-6 py-8 text-center text-[#71717a]">
                No analytics data yet
              </div>
            ) : (
              topArticles.slice(0, 10).map((article, index) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article.article_id)}
                  className="w-full px-6 py-3 flex items-center gap-4 hover:bg-[#1f1f23] transition-colors text-left"
                >
                  <span className="text-lg font-semibold text-[#71717a] w-6">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {article.journal_articles?.title || "Unknown"}
                    </p>
                    <p className="text-sm text-[#71717a]">
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
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#27272a]">
            <h2 className="text-lg font-semibold">Trending Now</h2>
            <p className="text-sm text-[#71717a]">Based on recent engagement</p>
          </div>
          <div className="divide-y divide-[#27272a]">
            {trending.length === 0 ? (
              <div className="px-6 py-8 text-center text-[#71717a]">
                No trending data yet
              </div>
            ) : (
              trending.slice(0, 10).map((article, index) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article.article_id)}
                  className="w-full px-6 py-3 flex items-center gap-4 hover:bg-[#1f1f23] transition-colors text-left"
                >
                  <span className="text-lg font-semibold text-[#22c55e] w-6">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {article.journal_articles?.title || "Unknown"}
                    </p>
                    <p className="text-sm text-[#71717a]">
                      {formatNumber(article.views_last_7_days)} views this week
                    </p>
                  </div>
                  <span className="text-xs text-[#22c55e] bg-[#22c55e]/10 px-2 py-1 rounded">
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
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between sticky top-0 bg-[#18181b]">
              <div>
                <h2 className="text-xl font-semibold">
                  {articleDetails.performance?.journal_articles?.title || "Article Details"}
                </h2>
                {articleDetails.performance?.journal_articles?.slug && (
                  <a
                    href={`/journal/${articleDetails.performance.journal_articles.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#22c55e] hover:underline"
                  >
                    View Article →
                  </a>
                )}
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 text-[#a1a1aa] hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
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
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      timeRange === range
                        ? "bg-[#22c55e] text-black"
                        : "bg-[#27272a] text-[#a1a1aa] hover:text-white"
                    }`}
                  >
                    {range} Days
                  </button>
                ))}
              </div>

              {/* Stats Grid */}
              {articleDetails.performance && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#0f0f11] rounded-lg p-4">
                    <p className="text-2xl font-semibold text-white">
                      {formatNumber(articleDetails.performance.total_views)}
                    </p>
                    <p className="text-sm text-[#a1a1aa]">Total Views</p>
                  </div>
                  <div className="bg-[#0f0f11] rounded-lg p-4">
                    <p className="text-2xl font-semibold text-white">
                      {formatNumber(articleDetails.performance.unique_visitors)}
                    </p>
                    <p className="text-sm text-[#a1a1aa]">Unique Visitors</p>
                  </div>
                  <div className="bg-[#0f0f11] rounded-lg p-4">
                    <p className="text-2xl font-semibold text-white">
                      {articleDetails.performance.avg_scroll_depth
                        ? `${articleDetails.performance.avg_scroll_depth.toFixed(0)}%`
                        : "—"}
                    </p>
                    <p className="text-sm text-[#a1a1aa]">Avg. Scroll Depth</p>
                  </div>
                  <div className="bg-[#0f0f11] rounded-lg p-4">
                    <p className="text-2xl font-semibold text-white">
                      {articleDetails.performance.share_count}
                    </p>
                    <p className="text-sm text-[#a1a1aa]">Shares</p>
                  </div>
                </div>
              )}

              {/* Daily Views Chart (Simple Bar Chart) */}
              {articleDetails.dailyViews.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[#a1a1aa] mb-4">Daily Views</h3>
                  <div className="flex items-end gap-1 h-32">
                    {articleDetails.dailyViews.slice(0, 30).reverse().map((day, index) => {
                      const maxViews = Math.max(...articleDetails.dailyViews.map((d) => d.view_count));
                      const height = maxViews > 0 ? (day.view_count / maxViews) * 100 : 0;
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-[#22c55e]/60 hover:bg-[#22c55e] transition-colors rounded-t cursor-pointer group relative"
                          style={{ height: `${Math.max(height, 4)}%` }}
                          title={`${formatDate(day.view_date)}: ${day.view_count} views`}
                        >
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#27272a] px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
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
