"use client";

import * as React from "react";
import Link from "next/link";

interface Draft {
  id: string;
  title: string;
  subtitle: string | null;
  content: string;
  excerpt: string | null;
  version: number;
  word_count: number | null;
  reading_time: number | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[];
  readability_score: number | null;
  seo_score: number | null;
  originality_score: number | null;
  overall_score: number | null;
  status: string;
  content_briefs: { working_title: string; content_type: string } | null;
  created_at: string;
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
    reviewing: "bg-yellow-500/20 text-yellow-400",
    needs_revision: "bg-orange-500/20 text-orange-400",
    approved: "bg-green-500/20 text-green-400",
    published: "bg-purple-500/20 text-purple-400",
  };
  return styles[status] || styles.draft;
}

function getScoreColor(score: number | null) {
  if (score === null) return "text-[#71717a]";
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

export default function DraftsPage() {
  const [drafts, setDrafts] = React.useState<Draft[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedDraft, setSelectedDraft] = React.useState<Draft | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const fetchDrafts = React.useCallback(async () => {
    try {
      const url = statusFilter === "all"
        ? "/api/admin/pipeline/drafts"
        : `/api/admin/pipeline/drafts?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDrafts(data);
      }
    } catch (error) {
      console.error("Failed to fetch drafts:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    setLoading(true);
    fetchDrafts();
  }, [fetchDrafts]);

  const handleAction = async (action: string, draftId: string, extraData?: Record<string, string>) => {
    setActionLoading(draftId);
    try {
      const res = await fetch("/api/admin/pipeline/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          draftId,
          ...extraData,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetchDrafts();
        setSelectedDraft(null);
        if (action === "publish" && data.article) {
          alert(`Published! Article slug: ${data.article.slug}`);
        }
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const statuses = ["all", "draft", "reviewing", "needs_revision", "approved", "published"];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-[#222] rounded" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-[#18181b] rounded-lg" />
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
          <Link href="/admin/pipeline" className="hover:text-white">Pipeline</Link>
          <span>/</span>
          <span className="text-white">Drafts</span>
        </div>
        <h1 className="text-2xl font-semibold">Content Drafts</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-[#22c55e] text-black"
                : "bg-[#27272a] text-[#a1a1aa] hover:text-white"
            }`}
          >
            {status === "all" ? "All" : status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Drafts Grid */}
      <div className="grid gap-4">
        {drafts.length === 0 ? (
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-12 text-center">
            <p className="text-lg text-[#a1a1aa] mb-2">No drafts found</p>
            <p className="text-sm text-[#71717a]">Drafts are generated from approved briefs</p>
          </div>
        ) : (
          drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:border-[#3f3f46] transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusStyles(draft.status)}`}>
                      {draft.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-[#71717a]">v{draft.version}</span>
                    {draft.word_count && (
                      <span className="text-xs text-[#71717a]">{draft.word_count} words</span>
                    )}
                    {draft.reading_time && (
                      <span className="text-xs text-[#71717a]">{draft.reading_time} min read</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{draft.title}</h3>
                  {draft.subtitle && (
                    <p className="text-[#a1a1aa] text-sm mb-2">{draft.subtitle}</p>
                  )}
                  {draft.excerpt && (
                    <p className="text-[#71717a] text-sm mb-3 line-clamp-2">{draft.excerpt}</p>
                  )}

                  {/* Scores */}
                  {draft.overall_score !== null && (
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[#71717a]">Overall:</span>
                        <span className={`text-sm font-medium ${getScoreColor(draft.overall_score)}`}>
                          {draft.overall_score}
                        </span>
                      </div>
                      {draft.readability_score !== null && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-[#71717a]">Readability:</span>
                          <span className={`text-sm font-medium ${getScoreColor(draft.readability_score)}`}>
                            {draft.readability_score}
                          </span>
                        </div>
                      )}
                      {draft.seo_score !== null && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-[#71717a]">SEO:</span>
                          <span className={`text-sm font-medium ${getScoreColor(draft.seo_score)}`}>
                            {draft.seo_score}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mb-3">
                    {draft.keywords.slice(0, 5).map((keyword, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#27272a] rounded text-xs text-[#a1a1aa]">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-[#71717a]">
                    {formatDate(draft.created_at)}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedDraft(draft)}
                    className="px-3 py-1.5 bg-[#27272a] text-white text-sm font-medium rounded-lg hover:bg-[#3f3f46] transition-colors"
                  >
                    Preview
                  </button>
                  {draft.status === "draft" && (
                    <button
                      onClick={() => handleAction("review", draft.id)}
                      disabled={actionLoading === draft.id}
                      className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 text-sm font-medium rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
                    >
                      AI Review
                    </button>
                  )}
                  {(draft.status === "draft" || draft.status === "needs_revision") && (
                    <button
                      onClick={() => handleAction("approve", draft.id)}
                      disabled={actionLoading === draft.id}
                      className="px-3 py-1.5 bg-[#22c55e] text-black text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {draft.status === "approved" && (
                    <button
                      onClick={() => handleAction("publish", draft.id)}
                      disabled={actionLoading === draft.id}
                      className="px-3 py-1.5 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {selectedDraft && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#27272a] sticky top-0 bg-[#18181b]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedDraft.title}</h2>
                  {selectedDraft.subtitle && (
                    <p className="text-[#a1a1aa]">{selectedDraft.subtitle}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDraft(null)}
                  className="p-2 text-[#a1a1aa] hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Meta Info */}
            <div className="p-6 border-b border-[#27272a] bg-[#0f0f11]">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#71717a]">Meta Title</p>
                  <p className="text-white">{selectedDraft.meta_title || selectedDraft.title}</p>
                </div>
                <div>
                  <p className="text-[#71717a]">Meta Description</p>
                  <p className="text-white">{selectedDraft.meta_description || "Not set"}</p>
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <div className="p-6">
              <div className="prose prose-invert max-w-none">
                <div
                  className="text-[#a1a1aa] whitespace-pre-wrap"
                  style={{ fontFamily: "ui-monospace, monospace", fontSize: "14px" }}
                >
                  {selectedDraft.content.slice(0, 5000)}
                  {selectedDraft.content.length > 5000 && (
                    <p className="text-[#71717a] italic mt-4">
                      ... (content truncated for preview, {selectedDraft.content.length - 5000} more characters)
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#27272a] flex justify-between items-center sticky bottom-0 bg-[#18181b]">
              <div className="flex items-center gap-4">
                {selectedDraft.overall_score !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#71717a]">Score:</span>
                    <span className={`text-lg font-semibold ${getScoreColor(selectedDraft.overall_score)}`}>
                      {selectedDraft.overall_score}/100
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDraft(null)}
                  className="px-4 py-2 bg-[#27272a] text-white font-medium rounded-lg hover:bg-[#3f3f46] transition-colors"
                >
                  Close
                </button>
                {selectedDraft.status !== "published" && (
                  <>
                    <button
                      onClick={() => {
                        const feedback = prompt("Revision feedback:");
                        if (feedback) {
                          handleAction("revise", selectedDraft.id, { feedback });
                        }
                      }}
                      className="px-4 py-2 bg-orange-500/20 text-orange-400 font-medium rounded-lg hover:bg-orange-500/30 transition-colors"
                    >
                      Request Revision
                    </button>
                    {selectedDraft.status === "approved" ? (
                      <button
                        onClick={() => handleAction("publish", selectedDraft.id)}
                        disabled={actionLoading === selectedDraft.id}
                        className="px-4 py-2 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction("approve", selectedDraft.id)}
                        disabled={actionLoading === selectedDraft.id}
                        className="px-4 py-2 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
