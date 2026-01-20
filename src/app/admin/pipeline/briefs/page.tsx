"use client";

import * as React from "react";
import Link from "next/link";
import { AdminLoader } from "@/components/admin/AdminLoader";

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

interface Stats {
  total: number;
  draft: number;
  approved: number;
  in_progress: number;
  completed: number;
  rejected: number;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getStatusConfig(status: string) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    draft: { bg: "bg-[hsl(var(--color-background-subtle))]", text: "text-[hsl(var(--color-foreground-muted))]", label: "Draft" },
    approved: { bg: "bg-green-500/15", text: "text-green-600", label: "Approved" },
    rejected: { bg: "bg-red-500/15", text: "text-red-600", label: "Rejected" },
    in_progress: { bg: "bg-blue-500/15", text: "text-blue-600", label: "In Progress" },
    completed: { bg: "bg-purple-500/15", text: "text-purple-600", label: "Completed" },
  };
  return config[status] || config.draft;
}

function getContentTypeIcon(type: string | null) {
  const icons: Record<string, { icon: string; label: string }> = {
    article: { icon: "📝", label: "Article" },
    deep_dive: { icon: "🔬", label: "Deep Dive" },
    case_study: { icon: "📊", label: "Case Study" },
    tutorial: { icon: "🎓", label: "Tutorial" },
    opinion: { icon: "💭", label: "Opinion" },
  };
  return type ? icons[type] || { icon: "📄", label: type } : { icon: "📄", label: "Unknown" };
}

export default function BriefsPage() {
  const [briefs, setBriefs] = React.useState<Brief[]>([]);
  const [stats, setStats] = React.useState<Stats>({ total: 0, draft: 0, approved: 0, in_progress: 0, completed: 0, rejected: 0 });
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedBrief, setSelectedBrief] = React.useState<Brief | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [revisionFeedback, setRevisionFeedback] = React.useState("");
  const [showRevisionModal, setShowRevisionModal] = React.useState(false);

  const fetchBriefs = React.useCallback(async () => {
    try {
      const url = statusFilter === "all"
        ? "/api/admin/pipeline/briefs"
        : `/api/admin/pipeline/briefs?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBriefs(data);

        // Calculate stats
        const allRes = await fetch("/api/admin/pipeline/briefs");
        if (allRes.ok) {
          const allData = await allRes.json();
          const newStats: Stats = { total: 0, draft: 0, approved: 0, in_progress: 0, completed: 0, rejected: 0 };
          allData.forEach((brief: Brief) => {
            newStats.total++;
            const status = brief.status as keyof Omit<Stats, 'total'>;
            if (status in newStats) {
              newStats[status]++;
            }
          });
          setStats(newStats);
        }
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
        setShowRevisionModal(false);
        setRevisionFeedback("");
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestRevision = () => {
    if (selectedBrief && revisionFeedback.trim()) {
      handleAction("reject", selectedBrief.id, { feedback: revisionFeedback });
    }
  };

  if (loading) {
    return <AdminLoader message="Loading briefs..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--color-foreground-subtle))] mb-1">
          <Link href="/admin/pipeline" className="hover:text-[hsl(var(--color-foreground))] transition-colors">Pipeline</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[hsl(var(--color-foreground))]">Briefs</span>
        </div>
        <h1 className="text-2xl font-semibold">Content Briefs</h1>
        <p className="text-[hsl(var(--color-foreground-subtle))] text-sm mt-1">Structured outlines ready for writing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-[hsl(var(--color-foreground))]" },
          { label: "Draft", value: stats.draft, color: "text-[hsl(var(--color-foreground-muted))]" },
          { label: "Approved", value: stats.approved, color: "text-green-600" },
          { label: "In Progress", value: stats.in_progress, color: "text-blue-600" },
          { label: "Completed", value: stats.completed, color: "text-purple-600" },
          { label: "Rejected", value: stats.rejected, color: "text-red-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4">
            <p className="text-[hsl(var(--color-foreground-subtle))] text-xs mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-[hsl(var(--color-border))] pb-4 overflow-x-auto">
        {["all", "draft", "approved", "in_progress", "completed", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === status
                ? "bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground))]"
                : "text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground))]"
            }`}
          >
            {status === "all" ? "All" : status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Briefs List */}
      <div className="space-y-3">
        {briefs.length === 0 ? (
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[hsl(var(--color-background-subtle))] flex items-center justify-center">
              <svg className="w-6 h-6 text-[hsl(var(--color-foreground-subtle))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-[hsl(var(--color-foreground))] font-medium mb-2">No briefs yet</p>
            <p className="text-[hsl(var(--color-foreground-subtle))] text-sm">Briefs are created from approved insights</p>
          </div>
        ) : (
          briefs.map((brief) => {
            const statusConfig = getStatusConfig(brief.status);
            const contentType = getContentTypeIcon(brief.content_type);

            return (
              <div
                key={brief.id}
                className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-5 hover:border-[hsl(var(--color-border))] transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Tags Row */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground-muted))]">
                        <span>{contentType.icon}</span>
                        {contentType.label}
                      </span>
                      {brief.target_word_count && (
                        <span className="text-xs text-[hsl(var(--color-foreground-subtle))]">~{brief.target_word_count} words</span>
                      )}
                    </div>

                    {/* Title & Angle */}
                    <h3 className="text-base font-medium text-[hsl(var(--color-foreground))] mb-2">{brief.working_title}</h3>
                    <p className="text-[hsl(var(--color-foreground-muted))] text-sm mb-3 line-clamp-2">{brief.angle}</p>

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {brief.primary_keyword && (
                        <span className="px-2.5 py-1 bg-[hsl(var(--color-accent))]/15 text-[hsl(var(--color-accent))] rounded-md text-xs font-medium">
                          {brief.primary_keyword}
                        </span>
                      )}
                      {brief.secondary_keywords.slice(0, 3).map((keyword, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[hsl(var(--color-background-subtle))] rounded text-xs text-[hsl(var(--color-foreground-subtle))]">
                          {keyword}
                        </span>
                      ))}
                      {brief.secondary_keywords.length > 3 && (
                        <span className="text-xs text-[hsl(var(--color-foreground-subtle))]">+{brief.secondary_keywords.length - 3} more</span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-[hsl(var(--color-foreground-subtle))]">
                      {brief.target_audience && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {brief.target_audience}
                        </span>
                      )}
                      <span>{formatDate(brief.created_at)}</span>
                      <span>{brief.outline.length} sections</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSelectedBrief(brief)}
                      className="px-4 py-2 bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground))] text-sm font-medium rounded-xl hover:bg-[hsl(var(--color-border))] transition-colors"
                    >
                      View
                    </button>
                    {brief.status === "draft" && (
                      <>
                        <button
                          onClick={() => handleAction("seo_optimize", brief.id)}
                          disabled={actionLoading === brief.id}
                          className="px-4 py-2 bg-purple-500/15 text-purple-600 text-sm font-medium rounded-xl hover:bg-purple-500/25 transition-colors disabled:opacity-50"
                        >
                          SEO Optimize
                        </button>
                        <button
                          onClick={() => handleAction("approve", brief.id)}
                          disabled={actionLoading === brief.id}
                          className="px-4 py-2 bg-[hsl(var(--color-accent))] text-black text-sm font-medium rounded-xl hover:bg-[hsl(var(--color-accent-hover))] transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                      </>
                    )}
                    {brief.status === "approved" && (
                      <button
                        onClick={() => handleAction("write", brief.id)}
                        disabled={actionLoading === brief.id}
                        className="px-4 py-2 bg-blue-500 text-[hsl(var(--color-foreground))] text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        Generate Draft
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedBrief && !showRevisionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[hsl(var(--color-border))]">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const cfg = getStatusConfig(selectedBrief.status);
                      const ct = getContentTypeIcon(selectedBrief.content_type);
                      return (
                        <>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground-muted))]">
                            <span>{ct.icon}</span>
                            {ct.label}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  <h2 className="text-xl font-semibold text-[hsl(var(--color-foreground))]">{selectedBrief.working_title}</h2>
                </div>
                <button
                  onClick={() => setSelectedBrief(null)}
                  className="p-2 text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-subtle))] rounded-xl transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[hsl(var(--color-background-subtle))] rounded-xl">
                <div>
                  <p className="text-xs text-[hsl(var(--color-foreground-subtle))] mb-1">Audience</p>
                  <p className="text-sm text-[hsl(var(--color-foreground))]">{selectedBrief.target_audience || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--color-foreground-subtle))] mb-1">Word Count</p>
                  <p className="text-sm text-[hsl(var(--color-foreground))]">{selectedBrief.target_word_count ? `~${selectedBrief.target_word_count}` : "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--color-foreground-subtle))] mb-1">Primary Keyword</p>
                  <p className="text-sm text-[hsl(var(--color-accent))] font-medium">{selectedBrief.primary_keyword || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--color-foreground-subtle))] mb-1">Sections</p>
                  <p className="text-sm text-[hsl(var(--color-foreground))]">{selectedBrief.outline.length}</p>
                </div>
              </div>

              {/* Angle */}
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] mb-2">Angle</h3>
                <p className="text-[hsl(var(--color-foreground))]">{selectedBrief.angle}</p>
              </div>

              {/* Thesis */}
              {selectedBrief.thesis_statement && (
                <div className="p-4 bg-[hsl(var(--color-accent))]/5 border border-[#22c55e]/20 rounded-xl">
                  <h3 className="text-xs font-medium text-[hsl(var(--color-accent))] mb-2">Thesis Statement</h3>
                  <p className="text-[hsl(var(--color-foreground))] italic">&ldquo;{selectedBrief.thesis_statement}&rdquo;</p>
                </div>
              )}

              {/* Outline */}
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] mb-3">Outline</h3>
                <div className="space-y-3">
                  {selectedBrief.outline.map((section, i) => (
                    <div key={i} className="p-4 bg-[hsl(var(--color-background-subtle))] rounded-xl border border-[hsl(var(--color-border))]">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[hsl(var(--color-background-subtle))] flex items-center justify-center text-xs text-[hsl(var(--color-foreground-subtle))] flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-medium text-[hsl(var(--color-foreground))] mb-2">{section.heading}</h4>
                          <ul className="space-y-1.5">
                            {section.points.map((point, j) => (
                              <li key={j} className="flex gap-2 text-sm text-[hsl(var(--color-foreground-muted))]">
                                <span className="text-[hsl(var(--color-foreground-subtle))]">•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                          {section.notes && (
                            <p className="mt-2 text-xs text-[hsl(var(--color-foreground-subtle))] italic">Note: {section.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Takeaways */}
              {selectedBrief.key_takeaways.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] mb-2">Key Takeaways</h3>
                  <ul className="space-y-2">
                    {selectedBrief.key_takeaways.map((takeaway, i) => (
                      <li key={i} className="flex gap-3 text-[hsl(var(--color-foreground-muted))]">
                        <span className="text-[hsl(var(--color-accent))] flex-shrink-0">✓</span>
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Secondary Keywords */}
              {selectedBrief.secondary_keywords.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] mb-2">Secondary Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBrief.secondary_keywords.map((keyword, i) => (
                      <span key={i} className="px-3 py-1.5 bg-[hsl(var(--color-background-subtle))] rounded-xl text-sm text-[hsl(var(--color-foreground-muted))]">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[hsl(var(--color-border))] flex justify-end gap-3 bg-[hsl(var(--color-background-muted))]">
              <button
                onClick={() => setSelectedBrief(null)}
                className="px-4 py-2.5 bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground))] font-medium rounded-xl hover:bg-[hsl(var(--color-border))] transition-colors"
              >
                Close
              </button>
              {selectedBrief.status === "draft" && (
                <>
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    className="px-4 py-2.5 bg-orange-500/15 text-orange-600 font-medium rounded-xl hover:bg-orange-500/25 transition-colors"
                  >
                    Request Revisions
                  </button>
                  <button
                    onClick={() => handleAction("approve", selectedBrief.id)}
                    disabled={actionLoading === selectedBrief.id}
                    className="px-4 py-2.5 bg-[hsl(var(--color-accent))] text-black font-medium rounded-xl hover:bg-[hsl(var(--color-accent-hover))] transition-colors disabled:opacity-50"
                  >
                    Approve Brief
                  </button>
                </>
              )}
              {selectedBrief.status === "approved" && (
                <button
                  onClick={() => handleAction("write", selectedBrief.id)}
                  disabled={actionLoading === selectedBrief.id}
                  className="px-4 py-2.5 bg-blue-500 text-[hsl(var(--color-foreground))] font-medium rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  Generate Draft
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && selectedBrief && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-[hsl(var(--color-border))]">
              <h2 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Request Revisions</h2>
              <p className="text-sm text-[hsl(var(--color-foreground-subtle))] mt-1">What changes would improve this brief?</p>
            </div>
            <div className="p-6">
              <textarea
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
                placeholder="Describe the revisions needed..."
                className="w-full h-32 px-4 py-3 bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] placeholder-[hsl(var(--color-foreground-subtle))] focus:outline-none focus:border-[hsl(var(--color-border))] resize-none"
              />
            </div>
            <div className="p-6 border-t border-[hsl(var(--color-border))] flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setRevisionFeedback("");
                }}
                className="px-4 py-2 bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground))] font-medium rounded-xl hover:bg-[hsl(var(--color-border))] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={!revisionFeedback.trim() || actionLoading === selectedBrief.id}
                className="px-4 py-2 bg-orange-500 text-[hsl(var(--color-foreground))] font-medium rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
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
