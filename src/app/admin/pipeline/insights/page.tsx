"use client";

import * as React from "react";
import Link from "next/link";
import { AdminLoader } from "@/components/admin/AdminLoader";

interface Insight {
  id: string;
  title: string;
  summary: string;
  key_points: string[];
  source_type: string;
  relevance_score: number;
  urgency: string;
  target_keywords: string[];
  status: string;
  journal_pillars: { name: string; slug: string } | null;
  created_at: string;
}

interface Stats {
  total: number;
  new: number;
  approved: number;
  rejected: number;
  used: number;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getUrgencyIcon(urgency: string) {
  const icons: Record<string, { color: string; label: string }> = {
    low: { color: "text-[hsl(var(--color-foreground-subtle))]", label: "Low" },
    medium: { color: "text-yellow-600", label: "Medium" },
    high: { color: "text-orange-600", label: "High" },
    trending: { color: "text-red-600", label: "Trending" },
  };
  return icons[urgency] || icons.low;
}

function getStatusConfig(status: string) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    new: { bg: "bg-blue-500/15", text: "text-blue-600", label: "New" },
    approved: { bg: "bg-green-500/15", text: "text-green-600", label: "Approved" },
    rejected: { bg: "bg-red-500/15", text: "text-red-600", label: "Rejected" },
    used: { bg: "bg-purple-500/15", text: "text-purple-600", label: "Used" },
  };
  return config[status] || config.new;
}

export default function InsightsPage() {
  const [insights, setInsights] = React.useState<Insight[]>([]);
  const [stats, setStats] = React.useState<Stats>({ total: 0, new: 0, approved: 0, rejected: 0, used: 0 });
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedInsight, setSelectedInsight] = React.useState<Insight | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [notification, setNotification] = React.useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchInsights = React.useCallback(async () => {
    try {
      const url = statusFilter === "all"
        ? "/api/admin/pipeline/insights"
        : `/api/admin/pipeline/insights?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setInsights(data);

        // Calculate stats
        const allRes = await fetch("/api/admin/pipeline/insights");
        if (allRes.ok) {
          const allData = await allRes.json();
          const newStats = { total: 0, new: 0, approved: 0, rejected: 0, used: 0 };
          allData.forEach((insight: Insight) => {
            newStats.total++;
            if (insight.status in newStats) {
              newStats[insight.status as keyof Stats]++;
            }
          });
          setStats(newStats);
        }
      }
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    setLoading(true);
    fetchInsights();
  }, [fetchInsights]);

  const handleAction = async (action: string, insightId: string, extraData?: Record<string, string>) => {
    setActionLoading(insightId || "scan");

    if (action === "scan") {
      showNotification("info", "Scanning for trends... This may take 15-30 seconds.");
    }

    try {
      const res = await fetch("/api/admin/pipeline/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          insightId,
          reviewedBy: "admin",
          ...extraData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action}`);
      }

      await fetchInsights();
      setSelectedInsight(null);
      setShowRejectModal(false);
      setRejectReason("");

      // Show success messages
      if (action === "scan") {
        const count = data.insights?.length || 0;
        showNotification("success", `Found ${count} new content opportunities!`);
      } else if (action === "approve") {
        showNotification("success", "Insight approved successfully");
      } else if (action === "reject") {
        showNotification("success", "Insight rejected");
      } else if (action === "synthesize") {
        showNotification("success", "Brief created! Check the Briefs page.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${action}`;
      showNotification("error", message);
      console.error(`Failed to ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = () => {
    if (selectedInsight && rejectReason.trim()) {
      handleAction("reject", selectedInsight.id, { reason: rejectReason });
    }
  };

  if (loading) {
    return <AdminLoader message="Loading insights..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--color-foreground-subtle))] mb-1">
            <Link href="/admin/pipeline" className="hover:text-[hsl(var(--color-foreground))] transition-colors">Pipeline</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[hsl(var(--color-foreground))]">Insights</span>
          </div>
          <h1 className="text-2xl font-semibold">Content Insights</h1>
          <p className="text-[hsl(var(--color-foreground-subtle))] text-sm mt-1">AI-discovered content opportunities and trends</p>
        </div>
        <button
          onClick={() => handleAction("scan", "")}
          disabled={actionLoading !== null}
          className="px-4 py-2.5 bg-[hsl(var(--color-accent))] text-black font-medium rounded-xl hover:bg-[hsl(var(--color-accent-hover))] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {actionLoading === "scan" ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
          Scan for Trends
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-[hsl(var(--color-foreground))]" },
          { label: "New", value: stats.new, color: "text-blue-600" },
          { label: "Approved", value: stats.approved, color: "text-green-600" },
          { label: "Rejected", value: stats.rejected, color: "text-red-600" },
          { label: "Used", value: stats.used, color: "text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4">
            <p className="text-[hsl(var(--color-foreground-subtle))] text-xs mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-[hsl(var(--color-border))] pb-4">
        {["all", "new", "approved", "rejected", "used"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground))]"
                : "text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground))]"
            }`}
          >
            {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.length === 0 ? (
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[hsl(var(--color-background-subtle))] flex items-center justify-center">
              <svg className="w-6 h-6 text-[hsl(var(--color-foreground-subtle))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-[hsl(var(--color-foreground))] font-medium mb-2">No insights yet</p>
            <p className="text-[hsl(var(--color-foreground-subtle))] text-sm mb-4">Run a trend scan to discover content opportunities</p>
            <button
              onClick={() => handleAction("scan", "")}
              disabled={actionLoading !== null}
              className="px-4 py-2 bg-[hsl(var(--color-accent))] text-black text-sm font-medium rounded-xl hover:bg-[hsl(var(--color-accent-hover))] transition-colors"
            >
              Scan for Trends
            </button>
          </div>
        ) : (
          insights.map((insight) => {
            const statusConfig = getStatusConfig(insight.status);
            const urgencyConfig = getUrgencyIcon(insight.urgency);

            return (
              <div
                key={insight.id}
                className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-5 hover:border-[hsl(var(--color-border))] transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Tags Row */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${urgencyConfig.color}`}>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        {urgencyConfig.label}
                      </span>
                      {insight.journal_pillars && (
                        <span className="px-2.5 py-1 rounded-md text-xs bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground-muted))]">
                          {insight.journal_pillars.name}
                        </span>
                      )}
                      <span className="text-xs text-[hsl(var(--color-foreground-subtle))]">
                        {Math.round((insight.relevance_score || 0) * 100)}% relevance
                      </span>
                    </div>

                    {/* Title & Summary */}
                    <h3 className="text-base font-medium text-[hsl(var(--color-foreground))] mb-2 line-clamp-1">{insight.title}</h3>
                    <p className="text-[hsl(var(--color-foreground-muted))] text-sm mb-3 line-clamp-2">{insight.summary}</p>

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1.5">
                      {insight.target_keywords.slice(0, 4).map((keyword, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[hsl(var(--color-background-subtle))] rounded text-xs text-[hsl(var(--color-foreground-subtle))]">
                          {keyword}
                        </span>
                      ))}
                      {insight.target_keywords.length > 4 && (
                        <span className="text-xs text-[hsl(var(--color-foreground-subtle))]">+{insight.target_keywords.length - 4} more</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {insight.status === "new" && (
                      <>
                        <button
                          onClick={() => handleAction("approve", insight.id)}
                          disabled={actionLoading === insight.id}
                          className="px-4 py-2 bg-[hsl(var(--color-accent))] text-black text-sm font-medium rounded-xl hover:bg-[hsl(var(--color-accent-hover))] transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setSelectedInsight(insight)}
                          className="px-4 py-2 bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground))] text-sm font-medium rounded-xl hover:bg-[hsl(var(--color-border))] transition-colors"
                        >
                          Review
                        </button>
                      </>
                    )}
                    {insight.status === "approved" && (
                      <button
                        onClick={() => handleAction("synthesize", insight.id)}
                        disabled={actionLoading === insight.id}
                        className="px-4 py-2 bg-blue-500 text-[hsl(var(--color-foreground))] text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        Create Brief
                      </button>
                    )}
                    {insight.status === "rejected" && (
                      <span className="text-xs text-[hsl(var(--color-foreground-subtle))] text-center">Rejected</span>
                    )}
                    {insight.status === "used" && (
                      <span className="text-xs text-purple-600 text-center">Brief created</span>
                    )}
                  </div>
                </div>

                {/* Key Points (collapsed by default) */}
                {insight.key_points.length > 0 && insight.status === "new" && (
                  <details className="mt-4 pt-4 border-t border-[hsl(var(--color-border))]">
                    <summary className="text-xs text-[hsl(var(--color-foreground-subtle))] cursor-pointer hover:text-[hsl(var(--color-foreground))] transition-colors">
                      {insight.key_points.length} key points
                    </summary>
                    <ul className="mt-3 space-y-1.5">
                      {insight.key_points.map((point, i) => (
                        <li key={i} className="flex gap-2 text-sm text-[hsl(var(--color-foreground-muted))]">
                          <span className="text-[hsl(var(--color-foreground-subtle))]">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {selectedInsight && !showRejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[hsl(var(--color-border))]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const cfg = getStatusConfig(selectedInsight.status);
                      return (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      );
                    })()}
                    {selectedInsight.journal_pillars && (
                      <span className="px-2 py-0.5 rounded text-xs bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground-muted))]">
                        {selectedInsight.journal_pillars.name}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-[hsl(var(--color-foreground))]">{selectedInsight.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="p-2 text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-subtle))] rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] mb-2">Summary</h3>
                <p className="text-[hsl(var(--color-foreground))]">{selectedInsight.summary}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] mb-2">Key Points</h3>
                <ul className="space-y-2">
                  {selectedInsight.key_points.map((point, i) => (
                    <li key={i} className="flex gap-3 text-[hsl(var(--color-foreground-muted))]">
                      <span className="text-[hsl(var(--color-accent))] flex-shrink-0">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] mb-2">Target Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedInsight.target_keywords.map((keyword, i) => (
                    <span key={i} className="px-3 py-1.5 bg-[hsl(var(--color-background-subtle))] rounded-xl text-sm text-[hsl(var(--color-foreground-muted))]">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[hsl(var(--color-border))]">
                <div>
                  <p className="text-xs text-[hsl(var(--color-foreground-subtle))] mb-1">Relevance</p>
                  <p className="text-lg font-semibold text-[hsl(var(--color-foreground))]">{Math.round((selectedInsight.relevance_score || 0) * 100)}%</p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--color-foreground-subtle))] mb-1">Urgency</p>
                  <p className={`text-lg font-semibold ${getUrgencyIcon(selectedInsight.urgency).color}`}>
                    {selectedInsight.urgency.charAt(0).toUpperCase() + selectedInsight.urgency.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--color-foreground-subtle))] mb-1">Source</p>
                  <p className="text-lg font-semibold text-[hsl(var(--color-foreground))]">{selectedInsight.source_type}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[hsl(var(--color-border))] flex justify-end gap-3 bg-[hsl(var(--color-background-muted))]">
              <button
                onClick={() => setSelectedInsight(null)}
                className="px-4 py-2.5 bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground))] font-medium rounded-xl hover:bg-[hsl(var(--color-border))] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2.5 bg-red-500/15 text-red-600 font-medium rounded-xl hover:bg-red-500/25 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleAction("approve", selectedInsight.id)}
                disabled={actionLoading === selectedInsight.id}
                className="px-4 py-2.5 bg-[hsl(var(--color-accent))] text-black font-medium rounded-xl hover:bg-[hsl(var(--color-accent-hover))] transition-colors disabled:opacity-50"
              >
                Approve Insight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedInsight && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-[hsl(var(--color-border))]">
              <h2 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">Reject Insight</h2>
              <p className="text-sm text-[hsl(var(--color-foreground-subtle))] mt-1">Why is this insight not suitable?</p>
            </div>
            <div className="p-6">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full h-32 px-4 py-3 bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] placeholder-[hsl(var(--color-foreground-subtle))] focus:outline-none focus:border-[hsl(var(--color-border))] resize-none"
              />
            </div>
            <div className="p-6 border-t border-[hsl(var(--color-border))] flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="px-4 py-2 bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground))] font-medium rounded-xl hover:bg-[hsl(var(--color-border))] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === selectedInsight.id}
                className="px-4 py-2 bg-red-500 text-[hsl(var(--color-foreground))] font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Reject Insight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${
              notification.type === "success"
                ? "bg-green-500/15 border-green-500/30 text-green-600"
                : notification.type === "error"
                ? "bg-red-500/15 border-red-500/30 text-red-600"
                : "bg-blue-500/15 border-blue-500/30 text-blue-600"
            }`}
          >
            {notification.type === "success" && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {notification.type === "error" && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {notification.type === "info" && (
              <svg className="w-5 h-5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
