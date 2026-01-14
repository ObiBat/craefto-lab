"use client";

import * as React from "react";
import Link from "next/link";

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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getUrgencyStyles(urgency: string) {
  const styles: Record<string, string> = {
    low: "bg-[#27272a] text-[#a1a1aa]",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-orange-500/20 text-orange-400",
    trending: "bg-red-500/20 text-red-400",
  };
  return styles[urgency] || styles.low;
}

function getStatusStyles(status: string) {
  const styles: Record<string, string> = {
    new: "bg-blue-500/20 text-blue-400",
    approved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
    used: "bg-purple-500/20 text-purple-400",
  };
  return styles[status] || styles.new;
}

export default function InsightsPage() {
  const [insights, setInsights] = React.useState<Insight[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedInsight, setSelectedInsight] = React.useState<Insight | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const fetchInsights = React.useCallback(async () => {
    try {
      const url = statusFilter === "all"
        ? "/api/admin/pipeline/insights"
        : `/api/admin/pipeline/insights?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
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
    setActionLoading(insightId);
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
      if (res.ok) {
        await fetchInsights();
        setSelectedInsight(null);
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const statuses = ["all", "new", "approved", "rejected", "used"];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-[#222] rounded" />
          <div className="h-10 w-32 bg-[#222] rounded" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-[#18181b] rounded-lg" />
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
          <div className="flex items-center gap-2 text-sm text-[#a1a1aa] mb-2">
            <Link href="/admin/pipeline" className="hover:text-white">Pipeline</Link>
            <span>/</span>
            <span className="text-white">Insights</span>
          </div>
          <h1 className="text-2xl font-semibold">Content Insights</h1>
        </div>
        <button
          onClick={() => handleAction("scan", "")}
          disabled={actionLoading !== null}
          className="px-4 py-2.5 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Scan for Trends
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
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
            {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid gap-4">
        {insights.length === 0 ? (
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-12 text-center">
            <p className="text-lg text-[#a1a1aa] mb-2">No insights found</p>
            <p className="text-sm text-[#71717a]">Run a trend scan to discover content opportunities</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:border-[#3f3f46] transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusStyles(insight.status)}`}>
                      {insight.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getUrgencyStyles(insight.urgency)}`}>
                      {insight.urgency}
                    </span>
                    {insight.journal_pillars && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#27272a] text-[#a1a1aa]">
                        {insight.journal_pillars.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{insight.title}</h3>
                  <p className="text-[#a1a1aa] text-sm mb-3">{insight.summary}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {insight.target_keywords.slice(0, 5).map((keyword, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#27272a] rounded text-xs text-[#a1a1aa]">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#71717a]">
                    <span>Relevance: {Math.round((insight.relevance_score || 0) * 100)}%</span>
                    <span>Source: {insight.source_type}</span>
                    <span>{formatDate(insight.created_at)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {insight.status === "new" && (
                    <>
                      <button
                        onClick={() => handleAction("approve", insight.id)}
                        disabled={actionLoading === insight.id}
                        className="px-3 py-1.5 bg-[#22c55e] text-black text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setSelectedInsight(insight)}
                        className="px-3 py-1.5 bg-[#27272a] text-white text-sm font-medium rounded-lg hover:bg-[#3f3f46] transition-colors"
                      >
                        Review
                      </button>
                    </>
                  )}
                  {insight.status === "approved" && (
                    <button
                      onClick={() => handleAction("synthesize", insight.id)}
                      disabled={actionLoading === insight.id}
                      className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      Create Brief
                    </button>
                  )}
                </div>
              </div>
              {/* Key Points */}
              {insight.key_points.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#27272a]">
                  <p className="text-xs text-[#71717a] mb-2">Key Points:</p>
                  <ul className="list-disc list-inside text-sm text-[#a1a1aa] space-y-1">
                    {insight.key_points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-[#27272a]">
              <h2 className="text-xl font-semibold">{selectedInsight.title}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-[#71717a] mb-1">Summary</p>
                <p className="text-[#a1a1aa]">{selectedInsight.summary}</p>
              </div>
              <div>
                <p className="text-sm text-[#71717a] mb-1">Key Points</p>
                <ul className="list-disc list-inside text-[#a1a1aa] space-y-1">
                  {selectedInsight.key_points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm text-[#71717a] mb-1">Keywords</p>
                <div className="flex flex-wrap gap-1">
                  {selectedInsight.target_keywords.map((keyword, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[#27272a] rounded text-xs text-[#a1a1aa]">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#27272a] flex justify-end gap-3">
              <button
                onClick={() => setSelectedInsight(null)}
                className="px-4 py-2 bg-[#27272a] text-white font-medium rounded-lg hover:bg-[#3f3f46] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const reason = prompt("Rejection reason:");
                  if (reason) {
                    handleAction("reject", selectedInsight.id, { reason });
                  }
                }}
                className="px-4 py-2 bg-red-500/20 text-red-400 font-medium rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleAction("approve", selectedInsight.id)}
                disabled={actionLoading === selectedInsight.id}
                className="px-4 py-2 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
