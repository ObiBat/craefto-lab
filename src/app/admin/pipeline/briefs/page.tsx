"use client";

import * as React from "react";
import Link from "next/link";

interface Brief {
  id: string;
  working_title: string;
  angle: string;
  thesis_statement: string | null;
  target_audience: string | null;
  content_type: string | null;
  outline: Array<{ heading: string; points: string[]; notes?: string }>;
  key_takeaways: string[];
  primary_keyword: string | null;
  secondary_keywords: string[];
  target_word_count: number | null;
  status: string;
  content_insights: { title: string } | null;
  journal_pillars: { name: string; slug: string } | null;
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
    approved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
    in_progress: "bg-blue-500/20 text-blue-400",
    completed: "bg-purple-500/20 text-purple-400",
  };
  return styles[status] || styles.draft;
}

function getContentTypeLabel(type: string | null) {
  const labels: Record<string, string> = {
    article: "Article",
    deep_dive: "Deep Dive",
    case_study: "Case Study",
    tutorial: "Tutorial",
    opinion: "Opinion",
  };
  return type ? labels[type] || type : "Unknown";
}

export default function BriefsPage() {
  const [briefs, setBriefs] = React.useState<Brief[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedBrief, setSelectedBrief] = React.useState<Brief | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const fetchBriefs = React.useCallback(async () => {
    try {
      const url = statusFilter === "all"
        ? "/api/admin/pipeline/briefs"
        : `/api/admin/pipeline/briefs?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBriefs(data);
      }
    } catch (error) {
      console.error("Failed to fetch briefs:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    setLoading(true);
    fetchBriefs();
  }, [fetchBriefs]);

  const handleAction = async (action: string, briefId: string, extraData?: Record<string, string>) => {
    setActionLoading(briefId);
    try {
      const res = await fetch("/api/admin/pipeline/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          briefId,
          reviewedBy: "admin",
          ...extraData,
        }),
      });
      if (res.ok) {
        await fetchBriefs();
        setSelectedBrief(null);
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const statuses = ["all", "draft", "approved", "in_progress", "completed", "rejected"];

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
          <span className="text-white">Briefs</span>
        </div>
        <h1 className="text-2xl font-semibold">Content Briefs</h1>
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

      {/* Briefs Grid */}
      <div className="grid gap-4">
        {briefs.length === 0 ? (
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-12 text-center">
            <p className="text-lg text-[#a1a1aa] mb-2">No briefs found</p>
            <p className="text-sm text-[#71717a]">Briefs are created from approved insights</p>
          </div>
        ) : (
          briefs.map((brief) => (
            <div
              key={brief.id}
              className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:border-[#3f3f46] transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusStyles(brief.status)}`}>
                      {brief.status.replace("_", " ")}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#27272a] text-[#a1a1aa]">
                      {getContentTypeLabel(brief.content_type)}
                    </span>
                    {brief.target_word_count && (
                      <span className="text-xs text-[#71717a]">
                        ~{brief.target_word_count} words
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{brief.working_title}</h3>
                  <p className="text-[#a1a1aa] text-sm mb-3">{brief.angle}</p>
                  {brief.thesis_statement && (
                    <p className="text-sm text-[#71717a] italic mb-3">&ldquo;{brief.thesis_statement}&rdquo;</p>
                  )}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {brief.primary_keyword && (
                      <span className="px-2 py-0.5 bg-[#22c55e]/20 text-[#22c55e] rounded text-xs">
                        {brief.primary_keyword}
                      </span>
                    )}
                    {brief.secondary_keywords.slice(0, 4).map((keyword, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#27272a] rounded text-xs text-[#a1a1aa]">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#71717a]">
                    {brief.target_audience && <span>Audience: {brief.target_audience}</span>}
                    <span>{formatDate(brief.created_at)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedBrief(brief)}
                    className="px-3 py-1.5 bg-[#27272a] text-white text-sm font-medium rounded-lg hover:bg-[#3f3f46] transition-colors"
                  >
                    View Details
                  </button>
                  {brief.status === "draft" && (
                    <>
                      <button
                        onClick={() => handleAction("seo_optimize", brief.id)}
                        disabled={actionLoading === brief.id}
                        className="px-3 py-1.5 bg-purple-500/20 text-purple-400 text-sm font-medium rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                      >
                        SEO Optimize
                      </button>
                      <button
                        onClick={() => handleAction("approve", brief.id)}
                        disabled={actionLoading === brief.id}
                        className="px-3 py-1.5 bg-[#22c55e] text-black text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </>
                  )}
                  {brief.status === "approved" && (
                    <button
                      onClick={() => handleAction("write", brief.id)}
                      disabled={actionLoading === brief.id}
                      className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      Generate Draft
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedBrief && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#27272a] sticky top-0 bg-[#18181b]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedBrief.working_title}</h2>
                <button
                  onClick={() => setSelectedBrief(null)}
                  className="p-2 text-[#a1a1aa] hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#71717a] mb-1">Content Type</p>
                  <p className="text-white">{getContentTypeLabel(selectedBrief.content_type)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#71717a] mb-1">Target Audience</p>
                  <p className="text-white">{selectedBrief.target_audience || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-[#71717a] mb-1">Word Count</p>
                  <p className="text-white">{selectedBrief.target_word_count || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-[#71717a] mb-1">Primary Keyword</p>
                  <p className="text-[#22c55e]">{selectedBrief.primary_keyword || "Not specified"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-[#71717a] mb-1">Angle</p>
                <p className="text-[#a1a1aa]">{selectedBrief.angle}</p>
              </div>

              {selectedBrief.thesis_statement && (
                <div>
                  <p className="text-sm text-[#71717a] mb-1">Thesis Statement</p>
                  <p className="text-[#a1a1aa] italic">&ldquo;{selectedBrief.thesis_statement}&rdquo;</p>
                </div>
              )}

              <div>
                <p className="text-sm text-[#71717a] mb-2">Outline</p>
                <div className="space-y-4">
                  {selectedBrief.outline.map((section, i) => (
                    <div key={i} className="bg-[#0f0f11] rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">{section.heading}</h4>
                      <ul className="list-disc list-inside text-sm text-[#a1a1aa] space-y-1">
                        {section.points.map((point, j) => (
                          <li key={j}>{point}</li>
                        ))}
                      </ul>
                      {section.notes && (
                        <p className="text-xs text-[#71717a] mt-2 italic">Note: {section.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-[#71717a] mb-2">Key Takeaways</p>
                <ul className="list-disc list-inside text-[#a1a1aa] space-y-1">
                  {selectedBrief.key_takeaways.map((takeaway, i) => (
                    <li key={i}>{takeaway}</li>
                  ))}
                </ul>
              </div>

              {selectedBrief.secondary_keywords.length > 0 && (
                <div>
                  <p className="text-sm text-[#71717a] mb-2">Secondary Keywords</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedBrief.secondary_keywords.map((keyword, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#27272a] rounded text-xs text-[#a1a1aa]">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-[#27272a] flex justify-end gap-3 sticky bottom-0 bg-[#18181b]">
              <button
                onClick={() => setSelectedBrief(null)}
                className="px-4 py-2 bg-[#27272a] text-white font-medium rounded-lg hover:bg-[#3f3f46] transition-colors"
              >
                Close
              </button>
              {selectedBrief.status === "draft" && (
                <>
                  <button
                    onClick={() => {
                      const feedback = prompt("Feedback for revisions:");
                      if (feedback) {
                        handleAction("reject", selectedBrief.id, { feedback });
                      }
                    }}
                    className="px-4 py-2 bg-red-500/20 text-red-400 font-medium rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Request Revisions
                  </button>
                  <button
                    onClick={() => handleAction("approve", selectedBrief.id)}
                    disabled={actionLoading === selectedBrief.id}
                    className="px-4 py-2 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50"
                  >
                    Approve Brief
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
