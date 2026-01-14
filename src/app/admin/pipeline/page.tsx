"use client";

import * as React from "react";
import Link from "next/link";

interface PipelineStatus {
  queued: number;
  processing: number;
  awaitingApproval: number;
  completed: number;
  failed: number;
  byStage: Record<string, number>;
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

const stages = [
  { key: "trend_scan", label: "Trend Scan", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { key: "synthesize", label: "Synthesize", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { key: "seo_optimize", label: "SEO", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { key: "write", label: "Write", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  { key: "review", label: "Review", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "human_approval", label: "Approve", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { key: "publish", label: "Publish", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PipelineDashboard() {
  const [status, setStatus] = React.useState<PipelineStatus | null>(null);
  const [awaitingApproval, setAwaitingApproval] = React.useState<QueueItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [scanning, setScanning] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  const fetchStatus = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pipeline");
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setAwaitingApproval(data.awaitingApproval || []);
      }
    } catch (error) {
      console.error("Failed to fetch pipeline status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/admin/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scan" }),
      });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (error) {
      console.error("Failed to run scan:", error);
    } finally {
      setScanning(false);
    }
  };

  const processNext = async () => {
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "process_next" }),
      });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (error) {
      console.error("Failed to process:", error);
    } finally {
      setProcessing(false);
    }
  };

  const approveItem = async (itemId: string) => {
    try {
      const res = await fetch("/api/admin/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", itemId }),
      });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (error) {
      console.error("Failed to approve:", error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-[#222] rounded" />
          <div className="h-10 w-32 bg-[#222] rounded" />
        </div>
        <div className="grid grid-cols-5 gap-4">
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
          <h1 className="text-2xl font-semibold mb-1">Content Pipeline</h1>
          <p className="text-[#a1a1aa]">AI-powered content creation with human oversight</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={processNext}
            disabled={processing || (status?.queued === 0)}
            className="px-4 py-2.5 bg-[#27272a] text-white font-medium rounded-lg hover:bg-[#3f3f46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {processing ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            Process Next
          </button>
          <button
            onClick={runScan}
            disabled={scanning}
            className="px-4 py-2.5 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {scanning ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            Scan Trends
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
          <p className="text-3xl font-semibold text-white">{status?.queued || 0}</p>
          <p className="text-sm text-[#a1a1aa]">Queued</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
          <p className="text-3xl font-semibold text-yellow-400">{status?.processing || 0}</p>
          <p className="text-sm text-[#a1a1aa]">Processing</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
          <p className="text-3xl font-semibold text-blue-400">{status?.awaitingApproval || 0}</p>
          <p className="text-sm text-[#a1a1aa]">Awaiting Approval</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
          <p className="text-3xl font-semibold text-green-400">{status?.completed || 0}</p>
          <p className="text-sm text-[#a1a1aa]">Completed</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
          <p className="text-3xl font-semibold text-red-400">{status?.failed || 0}</p>
          <p className="text-sm text-[#a1a1aa]">Failed</p>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Pipeline Stages</h2>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.key}>
              <div className="flex flex-col items-center min-w-[80px]">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  (status?.byStage[stage.key] || 0) > 0
                    ? "bg-[#22c55e]/20 text-[#22c55e]"
                    : "bg-[#27272a] text-[#71717a]"
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stage.icon} />
                  </svg>
                </div>
                <span className="text-xs text-[#a1a1aa] mt-2">{stage.label}</span>
                <span className="text-sm font-medium text-white">{status?.byStage[stage.key] || 0}</span>
              </div>
              {index < stages.length - 1 && (
                <div className="flex-1 h-px bg-[#27272a] min-w-[20px]" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/pipeline/insights"
          className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:border-[#22c55e]/50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-[#22c55e] transition-colors">Insights</h3>
              <p className="text-sm text-[#a1a1aa]">Review discovered content opportunities</p>
            </div>
          </div>
        </Link>
        <Link
          href="/admin/pipeline/briefs"
          className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:border-[#22c55e]/50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-[#22c55e] transition-colors">Briefs</h3>
              <p className="text-sm text-[#a1a1aa]">Manage content briefs and outlines</p>
            </div>
          </div>
        </Link>
        <Link
          href="/admin/pipeline/drafts"
          className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 hover:border-[#22c55e]/50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-[#22c55e] transition-colors">Drafts</h3>
              <p className="text-sm text-[#a1a1aa]">Review and publish content drafts</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Awaiting Approval */}
      {awaitingApproval.length > 0 && (
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#27272a]">
            <h2 className="text-lg font-semibold">Awaiting Your Approval</h2>
          </div>
          <div className="divide-y divide-[#27272a]">
            {awaitingApproval.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium capitalize">{item.item_type}</p>
                  <p className="text-sm text-[#a1a1aa]">Stage: {item.current_stage.replace("_", " ")}</p>
                  <p className="text-xs text-[#71717a]">{formatDate(item.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveItem(item.id)}
                    className="px-4 py-2 bg-[#22c55e] text-black text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    className="px-4 py-2 bg-[#27272a] text-white text-sm font-medium rounded-lg hover:bg-[#3f3f46] transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
