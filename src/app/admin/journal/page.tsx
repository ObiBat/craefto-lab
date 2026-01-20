"use client";

import * as React from "react";
import Link from "next/link";
import { AdminLoader } from "@/components/admin/AdminLoader";

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
    draft: "bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground-muted))]",
    review: "bg-yellow-500/20 text-yellow-600",
    approved: "bg-blue-500/20 text-blue-600",
    published: "bg-green-500/20 text-green-600",
    archived: "bg-red-500/20 text-red-600",
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
    return <AdminLoader message="Loading journal..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Journal</h1>
          <p className="text-[hsl(var(--color-foreground-muted))]">Manage your articles and content</p>
        </div>
        <Link
          href="/admin/journal/new"
          className="px-4 py-2.5 bg-[hsl(var(--color-accent))] text-black font-medium rounded-xl hover:bg-[hsl(var(--color-accent-hover))] transition-colors inline-flex items-center gap-2"
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
          <label className="text-sm text-[hsl(var(--color-foreground-muted))]">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[hsl(var(--color-foreground-muted))]">Pillar:</label>
          <select
            value={pillarFilter}
            onChange={(e) => setPillarFilter(e.target.value)}
            className="px-3 py-2 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
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
      <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[hsl(var(--color-background-subtle))] border-b border-[hsl(var(--color-border))]">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Title</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Pillar</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Type</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Date</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[hsl(var(--color-foreground-subtle))]">
                  <p className="text-lg mb-2">No articles found</p>
                  <p className="text-sm">Create your first article to get started</p>
                </td>
              </tr>
            ) : (
              filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-[hsl(var(--color-background-subtle))] transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/journal/${article.id}`}
                      className="font-medium text-[hsl(var(--color-foreground))] hover:text-[hsl(var(--color-accent))] transition-colors"
                    >
                      {article.title}
                    </Link>
                    <p className="text-sm text-[hsl(var(--color-foreground-subtle))] mt-0.5">{article.author_name}</p>
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
                  <td className="px-6 py-4 text-sm text-[hsl(var(--color-foreground-muted))] capitalize">
                    {article.content_type.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(article.status)}`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[hsl(var(--color-foreground-muted))]">
                    {article.published_at
                      ? formatDate(article.published_at)
                      : formatDate(article.updated_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/journal/${article.id}`}
                        className="p-2 text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-subtle))] rounded-xl transition-colors"
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
                          className="p-2 text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-subtle))] rounded-xl transition-colors"
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
              className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4 text-center"
            >
              <p className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">{count}</p>
              <p className="text-sm text-[hsl(var(--color-foreground-muted))] capitalize">{status}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
