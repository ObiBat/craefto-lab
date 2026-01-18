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

interface Stats {
  total: number;
  draft: number;
  reviewing: number;
  needs_revision: number;
  approved: number;
  published: number;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getStatusConfig(status: string) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    draft: { bg: "bg-[#27272a]", text: "text-[#a1a1aa]", label: "Draft" },
    reviewing: { bg: "bg-yellow-500/15", text: "text-yellow-400", label: "Reviewing" },
    needs_revision: { bg: "bg-orange-500/15", text: "text-orange-400", label: "Needs Revision" },
    approved: { bg: "bg-green-500/15", text: "text-green-400", label: "Approved" },
    published: { bg: "bg-purple-500/15", text: "text-purple-400", label: "Published" },
  };
  return config[status] || config.draft;
}

function getScoreRing(score: number | null) {
  if (score === null) return { color: "stroke-[#27272a]", textColor: "text-[#52525b]" };
  if (score >= 80) return { color: "stroke-green-400", textColor: "text-green-400" };
  if (score >= 60) return { color: "stroke-yellow-400", textColor: "text-yellow-400" };
  return { color: "stroke-red-400", textColor: "text-red-400" };
}

function ScoreCircle({ score, label, size = "md" }: { score: number | null; label: string; size?: "sm" | "md" }) {
  const ring = getScoreRing(score);
  const radius = size === "sm" ? 16 : 20;
  const circumference = 2 * Math.PI * radius;
  const progress = score !== null ? ((score) / 100) * circumference : 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg className={size === "sm" ? "w-10 h-10" : "w-12 h-12"} viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            className="stroke-[#27272a]"
            strokeWidth="3"
          />
          {score !== null && (
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              className={ring.color}
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              transform="rotate(-90 24 24)"
            />
          )}
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-semibold ${ring.textColor}`}>
          {score !== null ? score : "—"}
        </span>
      </div>
      <span className="text-[10px] text-[#52525b]">{label}</span>
    </div>
  );
}

export default function DraftsPage() {
  const [drafts, setDrafts] = React.useState<Draft[]>([]);
  const [stats, setStats] = React.useState<Stats>({ total: 0, draft: 0, reviewing: 0, needs_revision: 0, approved: 0, published: 0 });
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedDraft, setSelectedDraft] = React.useState<Draft | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [revisionFeedback, setRevisionFeedback] = React.useState("");
  const [showRevisionModal, setShowRevisionModal] = React.useState(false);

  const fetchDrafts = React.useCallback(async () => {
    try {
      const url = statusFilter === "all"
        ? "/api/admin/pipeline/drafts"
        : `/api/admin/pipeline/drafts?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDrafts(data);

        // Calculate stats
        const allRes = await fetch("/api/admin/pipeline/drafts");
        if (allRes.ok) {
          const allData = await allRes.json();
          const newStats: Stats = { total: 0, draft: 0, reviewing: 0, needs_revision: 0, approved: 0, published: 0 };
          allData.forEach((draft: Draft) => {
            newStats.total++;
            const status = draft.status as keyof Omit<Stats, 'total'>;
            if (status in newStats) {
              newStats[status]++;
            }
          });
          setStats(newStats);
        }
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
        setShowRevisionModal(false);
        setRevisionFeedback("");
        if (action === "publish" && data.article) {
          // Could show a toast notification here
        }
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestRevision = () => {
    if (selectedDraft && revisionFeedback.trim()) {
      handleAction("revise", selectedDraft.id, { feedback: revisionFeedback });
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[#222] rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-[#18181b] rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-[#18181b] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-[#71717a] mb-1">
          <Link href="/admin/pipeline" className="hover:text-white transition-colors">Pipeline</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white">Drafts</span>
        </div>
        <h1 className="text-2xl font-semibold">Content Drafts</h1>
        <p className="text-[#71717a] text-sm mt-1">AI-generated content ready for review and publishing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Draft", value: stats.draft, color: "text-[#a1a1aa]" },
          { label: "Reviewing", value: stats.reviewing, color: "text-yellow-400" },
          { label: "Needs Revision", value: stats.needs_revision, color: "text-orange-400" },
          { label: "Approved", value: stats.approved, color: "text-green-400" },
          { label: "Published", value: stats.published, color: "text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#18181b] border border-[#27272a] rounded-xl p-4">
            <p className="text-[#71717a] text-xs mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-[#27272a] pb-4 overflow-x-auto">
        {["all", "draft", "reviewing", "needs_revision", "approved", "published"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === status
                ? "bg-[#27272a] text-white"
                : "text-[#71717a] hover:text-white"
            }`}
          >
            {status === "all" ? "All" : status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Drafts List */}
      <div className="space-y-3">
        {drafts.length === 0 ? (
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#27272a] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#71717a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-white font-medium mb-2">No drafts yet</p>
            <p className="text-[#71717a] text-sm">Drafts are generated from approved briefs</p>
          </div>
        ) : (
          drafts.map((draft) => {
            const statusConfig = getStatusConfig(draft.status);

            return (
              <div
                key={draft.id}
                className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-[#3f3f46] transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Tags Row */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                      <span className="text-xs text-[#52525b]">v{draft.version}</span>
                      {draft.word_count && (
                        <span className="text-xs text-[#52525b]">{draft.word_count.toLocaleString()} words</span>
                      )}
                      {draft.reading_time && (
                        <span className="text-xs text-[#52525b]">{draft.reading_time} min read</span>
                      )}
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-base font-medium text-white mb-1">{draft.title}</h3>
                    {draft.subtitle && (
                      <p className="text-[#a1a1aa] text-sm mb-2">{draft.subtitle}</p>
                    )}
                    {draft.excerpt && (
                      <p className="text-[#71717a] text-sm mb-3 line-clamp-2">{draft.excerpt}</p>
                    )}

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {draft.keywords.slice(0, 4).map((keyword, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[#0f0f11] rounded text-xs text-[#71717a]">
                          {keyword}
                        </span>
                      ))}
                      {draft.keywords.length > 4 && (
                        <span className="text-xs text-[#52525b]">+{draft.keywords.length - 4} more</span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="text-xs text-[#52525b]">
                      {formatDate(draft.created_at)}
                    </div>
                  </div>

                  {/* Scores & Actions */}
                  <div className="flex items-start gap-4 flex-shrink-0">
                    {/* Score Circles */}
                    {draft.overall_score !== null && (
                      <div className="hidden md:flex items-center gap-3 pr-4 border-r border-[#27272a]">
                        <ScoreCircle score={draft.overall_score} label="Overall" />
                        <ScoreCircle score={draft.readability_score} label="Read" size="sm" />
                        <ScoreCircle score={draft.seo_score} label="SEO" size="sm" />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedDraft(draft)}
                        className="px-4 py-2 bg-[#27272a] text-white text-sm font-medium rounded-lg hover:bg-[#3f3f46] transition-colors"
                      >
                        Preview
                      </button>
                      {draft.status === "draft" && (
                        <button
                          onClick={() => handleAction("review", draft.id)}
                          disabled={actionLoading === draft.id}
                          className="px-4 py-2 bg-yellow-500/15 text-yellow-400 text-sm font-medium rounded-lg hover:bg-yellow-500/25 transition-colors disabled:opacity-50"
                        >
                          AI Review
                        </button>
                      )}
                      {(draft.status === "draft" || draft.status === "needs_revision" || draft.status === "reviewing") && (
                        <button
                          onClick={() => handleAction("approve", draft.id)}
                          disabled={actionLoading === draft.id}
                          className="px-4 py-2 bg-[#22c55e] text-black text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {draft.status === "approved" && (
                        <button
                          onClick={() => handleAction("publish", draft.id)}
                          disabled={actionLoading === draft.id}
                          className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                        >
                          Publish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preview Modal */}
      {selectedDraft && !showRevisionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[#27272a]">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const cfg = getStatusConfig(selectedDraft.status);
                      return (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      );
                    })()}
                    <span className="text-xs text-[#52525b]">v{selectedDraft.version}</span>
                    {selectedDraft.word_count && (
                      <span className="text-xs text-[#52525b]">{selectedDraft.word_count.toLocaleString()} words</span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-white">{selectedDraft.title}</h2>
                  {selectedDraft.subtitle && (
                    <p className="text-[#a1a1aa] mt-1">{selectedDraft.subtitle}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDraft(null)}
                  className="p-2 text-[#71717a] hover:text-white hover:bg-[#27272a] rounded-lg transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Score Bar */}
            {selectedDraft.overall_score !== null && (
              <div className="p-4 bg-[#0f0f11] border-b border-[#27272a] flex items-center justify-center gap-8">
                <ScoreCircle score={selectedDraft.overall_score} label="Overall" />
                <ScoreCircle score={selectedDraft.readability_score} label="Readability" size="sm" />
                <ScoreCircle score={selectedDraft.seo_score} label="SEO" size="sm" />
                <ScoreCircle score={selectedDraft.originality_score} label="Originality" size="sm" />
              </div>
            )}

            {/* Meta Info */}
            <div className="p-4 bg-[#0f0f11] border-b border-[#27272a]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-[#52525b] mb-1">Meta Title</p>
                  <p className="text-white">{selectedDraft.meta_title || selectedDraft.title}</p>
                </div>
                <div>
                  <p className="text-xs text-[#52525b] mb-1">Meta Description</p>
                  <p className="text-white line-clamp-2">{selectedDraft.meta_description || "Not set"}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-invert max-w-none">
                <div className="text-[#e4e4e7] whitespace-pre-wrap leading-relaxed">
                  {selectedDraft.content.slice(0, 8000)}
                  {selectedDraft.content.length > 8000 && (
                    <p className="text-[#52525b] italic mt-6 pt-4 border-t border-[#27272a]">
                      Content truncated for preview ({(selectedDraft.content.length - 8000).toLocaleString()} more characters)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#27272a] flex justify-between items-center bg-[#18181b]">
              <div className="flex items-center gap-4">
                {selectedDraft.reading_time && (
                  <span className="text-sm text-[#71717a]">{selectedDraft.reading_time} min read</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDraft(null)}
                  className="px-4 py-2.5 bg-[#27272a] text-white font-medium rounded-lg hover:bg-[#3f3f46] transition-colors"
                >
                  Close
                </button>
                {selectedDraft.status !== "published" && (
                  <>
                    <button
                      onClick={() => setShowRevisionModal(true)}
                      className="px-4 py-2.5 bg-orange-500/15 text-orange-400 font-medium rounded-lg hover:bg-orange-500/25 transition-colors"
                    >
                      Request Revision
                    </button>
                    {selectedDraft.status === "approved" ? (
                      <button
                        onClick={() => handleAction("publish", selectedDraft.id)}
                        disabled={actionLoading === selectedDraft.id}
                        className="px-4 py-2.5 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                      >
                        Publish Now
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction("approve", selectedDraft.id)}
                        disabled={actionLoading === selectedDraft.id}
                        className="px-4 py-2.5 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50"
                      >
                        Approve Draft
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && selectedDraft && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-[#27272a]">
              <h2 className="text-lg font-semibold text-white">Request Revision</h2>
              <p className="text-sm text-[#71717a] mt-1">What changes should be made to this draft?</p>
            </div>
            <div className="p-6">
              <textarea
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
                placeholder="Describe the revisions needed..."
                className="w-full h-32 px-4 py-3 bg-[#0f0f11] border border-[#27272a] rounded-lg text-white placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] resize-none"
              />
            </div>
            <div className="p-6 border-t border-[#27272a] flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setRevisionFeedback("");
                }}
                className="px-4 py-2 bg-[#27272a] text-white font-medium rounded-lg hover:bg-[#3f3f46] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={!revisionFeedback.trim() || actionLoading === selectedDraft.id}
                className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
