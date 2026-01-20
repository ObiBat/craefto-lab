"use client";

import * as React from "react";
import Link from "next/link";

interface PipelineStats {
  insights: { new: number; approved: number; total: number };
  briefs: { draft: number; approved: number; total: number };
  drafts: { draft: number; approved: number; published: number; total: number };
}

interface QueueItem {
  id: string;
  item_type: string;
  item_id: string;
  current_stage: string;
  status: string;
  priority: number;
  created_at: string;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PipelineDashboard() {
  const [stats, setStats] = React.useState<PipelineStats | null>(null);
  const [awaitingApproval, setAwaitingApproval] = React.useState<QueueItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [scanning, setScanning] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      // Fetch pipeline status
      const pipelineRes = await fetch("/api/admin/pipeline");
      if (pipelineRes.ok) {
        const data = await pipelineRes.json();
        setAwaitingApproval(data.awaitingApproval || []);
      }

      // Fetch counts for each stage
      const [insightsRes, briefsRes, draftsRes] = await Promise.all([
        fetch("/api/admin/pipeline/insights"),
        fetch("/api/admin/pipeline/briefs"),
        fetch("/api/admin/pipeline/drafts"),
      ]);

      const insights = insightsRes.ok ? await insightsRes.json() : [];
      const briefs = briefsRes.ok ? await briefsRes.json() : [];
      const drafts = draftsRes.ok ? await draftsRes.json() : [];

      setStats({
        insights: {
          new: insights.filter((i: { status: string }) => i.status === "new").length,
          approved: insights.filter((i: { status: string }) => i.status === "approved").length,
          total: insights.length,
        },
        briefs: {
          draft: briefs.filter((b: { status: string }) => b.status === "draft").length,
          approved: briefs.filter((b: { status: string }) => b.status === "approved").length,
          total: briefs.length,
        },
        drafts: {
          draft: drafts.filter((d: { status: string }) => d.status === "draft" || d.status === "reviewing").length,
          approved: drafts.filter((d: { status: string }) => d.status === "approved").length,
          published: drafts.filter((d: { status: string }) => d.status === "published").length,
          total: drafts.length,
        },
      });
    } catch (error) {
      console.error("Failed to fetch pipeline data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const runScan = async () => {
    setScanning(true);
    try {
      await fetch("/api/admin/pipeline/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scan" }),
      });
      await fetchData();
    } catch (error) {
      console.error("Failed to run scan:", error);
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-48 bg-[hsl(var(--color-border))] rounded" />
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-[hsl(var(--color-background-muted))] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const needsAttention = (stats?.insights.new || 0) + (stats?.briefs.draft || 0) + (stats?.drafts.draft || 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Content Pipeline</h1>
          <p className="text-[hsl(var(--color-foreground-subtle))]">
            {needsAttention > 0 ? (
              <span className="text-yellow-600">{needsAttention} items need your attention</span>
            ) : (
              "All caught up"
            )}
          </p>
        </div>
        <button
          onClick={runScan}
          disabled={scanning}
          className="px-5 py-2.5 bg-[hsl(var(--color-accent))] text-black font-medium rounded-xl hover:bg-[hsl(var(--color-accent-hover))] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {scanning ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
          {scanning ? "Scanning..." : "New Scan"}
        </button>
      </div>

      {/* Pipeline Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Insights */}
        <Link
          href="/admin/pipeline/insights"
          className="group bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6 hover:border-purple-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-[hsl(var(--color-foreground-subtle))] group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[hsl(var(--color-foreground))] mb-1">Insights</h3>
          <p className="text-sm text-[hsl(var(--color-foreground-subtle))] mb-4">Content opportunities discovered</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--color-foreground-muted))]">New to review</span>
              <span className={`text-sm font-medium ${(stats?.insights.new || 0) > 0 ? "text-yellow-600" : "text-[hsl(var(--color-foreground-subtle))]"}`}>
                {stats?.insights.new || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--color-foreground-muted))]">Ready for brief</span>
              <span className={`text-sm font-medium ${(stats?.insights.approved || 0) > 0 ? "text-green-600" : "text-[hsl(var(--color-foreground-subtle))]"}`}>
                {stats?.insights.approved || 0}
              </span>
            </div>
          </div>
        </Link>

        {/* Briefs */}
        <Link
          href="/admin/pipeline/briefs"
          className="group bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6 hover:border-blue-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-[hsl(var(--color-foreground-subtle))] group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[hsl(var(--color-foreground))] mb-1">Briefs</h3>
          <p className="text-sm text-[hsl(var(--color-foreground-subtle))] mb-4">Content outlines and plans</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--color-foreground-muted))]">Draft to review</span>
              <span className={`text-sm font-medium ${(stats?.briefs.draft || 0) > 0 ? "text-yellow-600" : "text-[hsl(var(--color-foreground-subtle))]"}`}>
                {stats?.briefs.draft || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--color-foreground-muted))]">Ready to write</span>
              <span className={`text-sm font-medium ${(stats?.briefs.approved || 0) > 0 ? "text-green-600" : "text-[hsl(var(--color-foreground-subtle))]"}`}>
                {stats?.briefs.approved || 0}
              </span>
            </div>
          </div>
        </Link>

        {/* Drafts */}
        <Link
          href="/admin/pipeline/drafts"
          className="group bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6 hover:border-green-500/50 transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-green-500/20 text-green-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-[hsl(var(--color-foreground-subtle))] group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[hsl(var(--color-foreground))] mb-1">Drafts</h3>
          <p className="text-sm text-[hsl(var(--color-foreground-subtle))] mb-4">Written content ready for review</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--color-foreground-muted))]">In review</span>
              <span className={`text-sm font-medium ${(stats?.drafts.draft || 0) > 0 ? "text-yellow-600" : "text-[hsl(var(--color-foreground-subtle))]"}`}>
                {stats?.drafts.draft || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--color-foreground-muted))]">Ready to publish</span>
              <span className={`text-sm font-medium ${(stats?.drafts.approved || 0) > 0 ? "text-green-600" : "text-[hsl(var(--color-foreground-subtle))]"}`}>
                {stats?.drafts.approved || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--color-foreground-muted))]">Published</span>
              <span className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))]">{stats?.drafts.published || 0}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Workflow Guide */}
      <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
        <h2 className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] uppercase tracking-wider mb-4">Workflow</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-600 flex items-center justify-center text-sm font-medium">1</div>
            <span className="text-sm text-[hsl(var(--color-foreground-muted))]">Scan for insights</span>
          </div>
          <svg className="w-4 h-4 text-[hsl(var(--color-border))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-600 flex items-center justify-center text-sm font-medium">2</div>
            <span className="text-sm text-[hsl(var(--color-foreground-muted))]">Approve insight</span>
          </div>
          <svg className="w-4 h-4 text-[hsl(var(--color-border))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center text-sm font-medium">3</div>
            <span className="text-sm text-[hsl(var(--color-foreground-muted))]">Create brief</span>
          </div>
          <svg className="w-4 h-4 text-[hsl(var(--color-border))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center text-sm font-medium">4</div>
            <span className="text-sm text-[hsl(var(--color-foreground-muted))]">Write draft</span>
          </div>
          <svg className="w-4 h-4 text-[hsl(var(--color-border))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-sm font-medium">5</div>
            <span className="text-sm text-[hsl(var(--color-foreground-muted))]">Publish</span>
          </div>
        </div>
      </div>

      {/* Awaiting Approval Queue */}
      {awaitingApproval.length > 0 && (
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[hsl(var(--color-border))] flex items-center justify-between">
            <h2 className="font-semibold">Awaiting Approval</h2>
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-600 text-xs font-medium rounded">
              {awaitingApproval.length}
            </span>
          </div>
          <div className="divide-y divide-[#27272a]">
            {awaitingApproval.slice(0, 5).map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-[hsl(var(--color-background-subtle))] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.item_type === "insight" ? "bg-purple-500/20 text-purple-600" :
                    item.item_type === "brief" ? "bg-blue-500/20 text-blue-600" :
                    "bg-green-500/20 text-green-600"
                  }`}>
                    {item.item_type === "insight" ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    ) : item.item_type === "brief" ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-[hsl(var(--color-foreground))] font-medium capitalize">{item.item_type}</p>
                    <p className="text-xs text-[hsl(var(--color-foreground-subtle))]">{formatDate(item.created_at)}</p>
                  </div>
                </div>
                <Link
                  href={`/admin/pipeline/${item.item_type}s`}
                  className="px-4 py-2 bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground))] text-sm font-medium rounded-xl hover:bg-[hsl(var(--color-background-muted))] transition-colors"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !stats?.insights.total && !stats?.briefs.total && !stats?.drafts.total && (
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-[hsl(var(--color-background-subtle))] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[hsl(var(--color-foreground-subtle))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[hsl(var(--color-foreground))] mb-2">Start your content pipeline</h3>
          <p className="text-[hsl(var(--color-foreground-subtle))] mb-6 max-w-md mx-auto">
            Click "New Scan" to discover content opportunities based on trends and your audience interests.
          </p>
          <button
            onClick={runScan}
            disabled={scanning}
            className="px-6 py-3 bg-[hsl(var(--color-accent))] text-black font-medium rounded-xl hover:bg-[hsl(var(--color-accent-hover))] transition-colors disabled:opacity-50"
          >
            {scanning ? "Scanning..." : "Start First Scan"}
          </button>
        </div>
      )}
    </div>
  );
}
