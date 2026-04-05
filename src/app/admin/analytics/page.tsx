"use client";

import * as React from "react";
import Link from "next/link";
import { AdminLoader } from "@/components/admin/AdminLoader";

interface AnalyticsData {
  summary: {
    totalViews: number;
    uniqueVisitors: number;
    totalLeads: number;
    avgLeadScore: number;
    conversionRate: string;
  };
  dailyData: Array<{
    date: string;
    views: number;
    leads: number;
  }>;
  topPages: Array<{
    path: string;
    views: number;
  }>;
  trafficSources: Array<{
    source: string;
    visits: number;
  }>;
}

interface FunnelData {
  funnel: Array<{
    stage: string;
    count: number;
    conversionRate: number;
  }>;
  overallConversion: string;
}

interface Goal {
  id: string;
  name: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  period: string;
  status: string;
  progress: number;
  daysRemaining: number | null;
  isOnTrack: boolean;
}

interface SourceData {
  totalLeads: number;
  sources: Array<{
    source: string;
    count: number;
    avgScore: number;
    percentage: number;
  }>;
  trafficSources: Array<{
    source: string;
    visits: number;
    leads: number;
    conversionRate: string;
  }>;
}

function StatCard({
  label,
  value,
  subValue,
  icon,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[hsl(var(--color-foreground-muted))] text-sm mb-1">{label}</p>
          <p className="text-3xl font-semibold text-[hsl(var(--color-foreground))]">{value}</p>
          {subValue && <p className="text-[hsl(var(--color-accent))] text-sm mt-1">{subValue}</p>}
        </div>
        <div className="p-3 bg-[hsl(var(--color-background-subtle))] rounded-xl text-[hsl(var(--color-foreground-muted))]">{icon}</div>
      </div>
    </div>
  );
}

function SimpleChart({ data, dataKey, color }: { data: Array<{ date: string; views: number; leads: number }>; dataKey: 'views' | 'leads'; color: string }) {
  if (!data || data.length === 0) return null;

  const values = data.map(d => d[dataKey]);
  const max = Math.max(...values, 1);

  return (
    <div className="h-40 flex items-end gap-1">
      {data.map((item, index) => {
        const height = (item[dataKey] / max) * 100;
        return (
          <div
            key={index}
            className="flex-1 group relative"
          >
            <div
              className={`w-full rounded-t transition-all ${color}`}
              style={{ height: `${Math.max(height, 2)}%` }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
              {item[dataKey]} {dataKey}
              <br />
              <span className="text-[hsl(var(--color-foreground-muted))]">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [funnelData, setFunnelData] = React.useState<FunnelData | null>(null);
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [sourceData, setSourceData] = React.useState<SourceData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [days, setDays] = React.useState(30);
  const [activeSection, setActiveSection] = React.useState<"overview" | "funnel" | "sources" | "goals">("overview");

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [analyticsRes, funnelRes, goalsRes, sourcesRes] = await Promise.all([
          fetch(`/api/admin/analytics?days=${days}`),
          fetch(`/api/admin/analytics/funnel?days=${days}`),
          fetch("/api/admin/analytics/goals"),
          fetch(`/api/admin/analytics/sources?days=${days}`),
        ]);

        if (analyticsRes.ok) {
          setData(await analyticsRes.json());
        }
        if (funnelRes.ok) {
          setFunnelData(await funnelRes.json());
        }
        if (goalsRes.ok) {
          setGoals(await goalsRes.json());
        }
        if (sourcesRes.ok) {
          setSourceData(await sourcesRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [days]);

  if (loading) {
    return <AdminLoader message="Loading analytics..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl tracking-tight font-semibold mb-1">Analytics</h1>
          <p className="text-[hsl(var(--color-foreground-muted))]">Website traffic and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                days === d
                  ? "bg-[hsl(var(--color-accent))]/20 text-[hsl(var(--color-accent))]"
                  : "text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-muted))]"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Quick Links to Dashboards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/analytics/content"
          className="group bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4 hover:border-[hsl(var(--color-accent))]/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[hsl(var(--color-accent))]/10 rounded-xl">
              <svg className="w-5 h-5 text-[hsl(var(--color-accent))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-[hsl(var(--color-foreground))] group-hover:text-[hsl(var(--color-accent))] transition-colors">
                Content Performance
              </h3>
              <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">Article views, engagement, trending</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/analytics/ab-testing"
          className="group bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4 hover:border-blue-500/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-[hsl(var(--color-foreground))] group-hover:text-blue-600 transition-colors">
                A/B Testing
              </h3>
              <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">Test titles, CTAs, optimize CTR</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/analytics/feedback"
          className="group bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4 hover:border-purple-500/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-[hsl(var(--color-foreground))] group-hover:text-purple-600 transition-colors">
                Agent Feedback
              </h3>
              <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">AI agent performance tracking</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          label="Page Views"
          value={data?.summary.totalViews || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
        <StatCard
          label="Unique Visitors"
          value={data?.summary.uniqueVisitors || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          label="Leads Generated"
          value={data?.summary.totalLeads || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
        />
        <StatCard
          label="Avg Lead Score"
          value={data?.summary.avgLeadScore || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />
        <StatCard
          label="Conversion Rate"
          value={data?.summary.conversionRate || "0%"}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-[hsl(var(--color-border))] pb-4">
        {[
          { id: "overview", label: "Overview" },
          { id: "funnel", label: "Conversion Funnel" },
          { id: "sources", label: "Lead Sources" },
          { id: "goals", label: "Goals" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeSection === tab.id
                ? "bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground))]"
                : "text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground))]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[hsl(var(--color-border))]">
              <h2 className="text-lg font-semibold">Top Pages</h2>
            </div>
            <div className="divide-y divide-[hsl(var(--color-border))]">
              {data?.topPages && data.topPages.length > 0 ? (
                data.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[hsl(var(--color-foreground-subtle))] text-sm w-6">{index + 1}.</span>
                      <span className="font-mono text-sm">{page.path}</span>
                    </div>
                    <span className="text-[hsl(var(--color-foreground-muted))]">{page.views} views</span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-[hsl(var(--color-foreground-subtle))]">No data yet</div>
              )}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[hsl(var(--color-border))]">
              <h2 className="text-lg font-semibold">Traffic Sources</h2>
            </div>
            <div className="divide-y divide-[hsl(var(--color-border))]">
              {data?.trafficSources && data.trafficSources.length > 0 ? (
                data.trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[hsl(var(--color-foreground-subtle))] text-sm w-6">{index + 1}.</span>
                      <span>{source.source}</span>
                    </div>
                    <span className="text-[hsl(var(--color-foreground-muted))]">{source.visits} visits</span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-[hsl(var(--color-foreground-subtle))]">No data yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conversion Funnel Section */}
      {activeSection === "funnel" && (
        <div className="space-y-6">
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Conversion Funnel</h2>
                <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">
                  Overall conversion: {funnelData?.overallConversion || "0"}%
                </p>
              </div>
            </div>

            {funnelData?.funnel && funnelData.funnel.length > 0 ? (
              <div className="space-y-4">
                {funnelData.funnel.map((stage, index) => {
                  const maxCount = funnelData.funnel[0].count || 1;
                  const width = Math.max(10, (stage.count / maxCount) * 100);

                  return (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-[hsl(var(--color-foreground))]">
                          {index + 1}. {stage.stage}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-[hsl(var(--color-foreground-muted))]">
                            {stage.count.toLocaleString()}
                          </span>
                          <span className="text-xs text-[hsl(var(--color-foreground-subtle))] w-12 text-right">
                            {stage.conversionRate}%
                          </span>
                        </div>
                      </div>
                      <div className="h-8 bg-[hsl(var(--color-background-subtle))] rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[hsl(var(--color-accent))] to-[hsl(var(--color-accent-hover))] rounded-lg transition-all duration-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      {index < funnelData.funnel.length - 1 && (
                        <div className="flex justify-center">
                          <svg className="w-4 h-4 text-[hsl(var(--color-foreground-subtle))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-[hsl(var(--color-foreground-subtle))]">
                No funnel data yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lead Sources Section */}
      {activeSection === "sources" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Sources */}
            <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[hsl(var(--color-border))]">
                <h2 className="text-lg font-semibold">Lead Sources</h2>
                <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">
                  {sourceData?.totalLeads || 0} total leads
                </p>
              </div>
              <div className="divide-y divide-[hsl(var(--color-border))]">
                {sourceData?.sources && sourceData.sources.length > 0 ? (
                  sourceData.sources.map((source, index) => (
                    <div key={source.source} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[hsl(var(--color-foreground))] capitalize">{source.source}</span>
                        <span className="text-[hsl(var(--color-foreground-muted))]">{source.count} leads</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-[hsl(var(--color-background-subtle))] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[hsl(var(--color-accent))] rounded-full"
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-[hsl(var(--color-foreground-subtle))] w-10 text-right">
                          {source.percentage}%
                        </span>
                        <span className="text-xs text-[hsl(var(--color-foreground-subtle))] w-16 text-right">
                          Avg: {source.avgScore}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-[hsl(var(--color-foreground-subtle))]">No data yet</div>
                )}
              </div>
            </div>

            {/* Traffic to Lead Conversion */}
            <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[hsl(var(--color-border))]">
                <h2 className="text-lg font-semibold">Traffic → Lead Conversion</h2>
                <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">
                  Conversion rate by traffic source
                </p>
              </div>
              <div className="divide-y divide-[hsl(var(--color-border))]">
                {sourceData?.trafficSources && sourceData.trafficSources.length > 0 ? (
                  sourceData.trafficSources.map((source) => (
                    <div key={source.source} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-[hsl(var(--color-foreground))] capitalize">{source.source}</span>
                        <p className="text-xs text-[hsl(var(--color-foreground-subtle))]">
                          {source.visits.toLocaleString()} visits → {source.leads} leads
                        </p>
                      </div>
                      <span className={`text-lg font-semibold ${
                        parseFloat(source.conversionRate) >= 2 ? "text-green-600" :
                        parseFloat(source.conversionRate) >= 1 ? "text-yellow-600" :
                        "text-[hsl(var(--color-foreground-muted))]"
                      }`}>
                        {source.conversionRate}%
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-[hsl(var(--color-foreground-subtle))]">No data yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals Section */}
      {activeSection === "goals" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Goals</h2>
            <button className="px-4 py-2 bg-[hsl(var(--color-accent))] text-black text-sm font-medium rounded-xl hover:bg-[hsl(var(--color-accent-hover))] transition-colors">
              + New Goal
            </button>
          </div>

          {goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-[hsl(var(--color-foreground))]">{goal.name}</h3>
                      <p className="text-xs text-[hsl(var(--color-foreground-subtle))] capitalize">
                        {goal.goal_type.replace("_", " ")} • {goal.period}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      goal.isOnTrack
                        ? "bg-green-500/15 text-green-600"
                        : "bg-yellow-500/15 text-yellow-600"
                    }`}>
                      {goal.isOnTrack ? "On Track" : "Behind"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
                        {goal.current_value.toLocaleString()}
                      </span>
                      <span className="text-sm text-[hsl(var(--color-foreground-subtle))]">
                        / {goal.target_value.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-3 bg-[hsl(var(--color-background-subtle))] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          goal.progress >= 100 ? "bg-green-600" :
                          goal.progress >= 75 ? "bg-[hsl(var(--color-accent))]" :
                          goal.progress >= 50 ? "bg-yellow-600" :
                          "bg-red-600"
                        }`}
                        style={{ width: `${Math.min(100, goal.progress)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-[hsl(var(--color-foreground-subtle))]">
                    <span>{goal.progress}% complete</span>
                    {goal.daysRemaining !== null && (
                      <span>{goal.daysRemaining} days remaining</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-12 text-center">
              <p className="text-[hsl(var(--color-foreground-muted))] mb-4">No goals set yet</p>
              <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">
                Set goals to track your progress on leads, page views, and conversions
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
