"use client";

import * as React from "react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  content_type: string;
  pillar_name: string;
  pillar_color: string;
  author_name: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Pillar {
  id: string;
  name: string;
  slug: string;
  color: string;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusStyles(status: string) {
  const styles: Record<string, string> = {
    draft: "bg-[#27272a] text-[#a1a1aa]",
    review: "bg-yellow-500/20 text-yellow-400",
    approved: "bg-blue-500/20 text-blue-400",
    published: "bg-green-500/20 text-green-400",
    archived: "bg-red-500/20 text-red-400",
  };
  return styles[status] || styles.draft;
}

export default function JournalAdminPage() {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [pillars, setPillars] = React.useState<Pillar[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [pillarFilter, setPillarFilter] = React.useState<string>("all");

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [articlesRes, pillarsRes] = await Promise.all([
          fetch("/api/admin/journal/articles"),
          fetch("/api/journal/pillars"),
        ]);

        if (articlesRes.ok) {
          const data = await articlesRes.json();
          setArticles(data.articles || []);
        }

        if (pillarsRes.ok) {
          const data = await pillarsRes.json();
          setPillars(data.pillars || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredArticles = articles.filter((article) => {
    if (statusFilter !== "all" && article.status !== statusFilter) return false;
    if (pillarFilter !== "all" && article.pillar_name !== pillarFilter) return false;
    return true;
  });

  const statuses = ["all", "draft", "review", "approved", "published", "archived"];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-[#222] rounded" />
          <div className="h-10 w-32 bg-[#222] rounded" />
        </div>
        <div className="h-12 bg-[#18181b] rounded-lg" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-[#18181b] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Journal</h1>
          <p className="text-[#a1a1aa]">Manage your articles and content</p>
        </div>
        <Link
          href="/admin/journal/new"
          className="px-4 py-2.5 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#a1a1aa]">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm focus:outline-none focus:border-[#22c55e]"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#a1a1aa]">Pillar:</label>
          <select
            value={pillarFilter}
            onChange={(e) => setPillarFilter(e.target.value)}
            className="px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm focus:outline-none focus:border-[#22c55e]"
          >
            <option value="all">All Pillars</option>
            {pillars.map((pillar) => (
              <option key={pillar.id} value={pillar.name}>
                {pillar.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0f0f11] border-b border-[#27272a]">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Title</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Pillar</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Type</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Date</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-[#a1a1aa]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#71717a]">
                  <p className="text-lg mb-2">No articles found</p>
                  <p className="text-sm">Create your first article to get started</p>
                </td>
              </tr>
            ) : (
              filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-[#1f1f23] transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/journal/${article.id}`}
                      className="font-medium text-white hover:text-[#22c55e] transition-colors"
                    >
                      {article.title}
                    </Link>
                    <p className="text-sm text-[#71717a] mt-0.5">{article.author_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center gap-1.5 text-sm"
                      style={{ color: article.pillar_color }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: article.pillar_color }}
                      />
                      {article.pillar_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#a1a1aa] capitalize">
                    {article.content_type.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(article.status)}`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#a1a1aa]">
                    {article.published_at
                      ? formatDate(article.published_at)
                      : formatDate(article.updated_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/journal/${article.id}`}
                        className="p-2 text-[#a1a1aa] hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      {article.status === "published" && (
                        <a
                          href={`/journal/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-[#a1a1aa] hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statuses.slice(1).map((status) => {
          const count = articles.filter((a) => a.status === status).length;
          return (
            <div
              key={status}
              className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 text-center"
            >
              <p className="text-2xl font-semibold text-white">{count}</p>
              <p className="text-sm text-[#a1a1aa] capitalize">{status}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
