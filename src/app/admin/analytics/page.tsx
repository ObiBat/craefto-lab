"use client";

import * as React from "react";

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
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#a1a1aa] text-sm mb-1">{label}</p>
          <p className="text-3xl font-semibold text-white">{value}</p>
          {subValue && <p className="text-[#22c55e] text-sm mt-1">{subValue}</p>}
        </div>
        <div className="p-3 bg-[#27272a] rounded-lg text-[#a1a1aa]">{icon}</div>
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
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#27272a] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {item[dataKey]} {dataKey}
              <br />
              <span className="text-[#a1a1aa]">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [days, setDays] = React.useState(30);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
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
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-48 bg-[#27272a] rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-[#18181b] rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-[#18181b] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Analytics</h1>
          <p>Website traffic and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                days === d
                  ? "bg-[#22c55e]/20 text-[#22c55e]"
                  : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6">Page Views</h2>
          <SimpleChart data={data?.dailyData || []} dataKey="views" color="bg-[#22c55e]" />
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6">Leads</h2>
          <SimpleChart data={data?.dailyData || []} dataKey="leads" color="bg-blue-500" />
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#27272a]">
            <h2 className="text-lg font-semibold">Top Pages</h2>
          </div>
          <div className="divide-y divide-[#222]">
            {data?.topPages && data.topPages.length > 0 ? (
              data.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#71717a] text-sm w-6">{index + 1}.</span>
                    <span className="font-mono text-sm">{page.path}</span>
                  </div>
                  <span className="text-[#a1a1aa]">{page.views} views</span>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-[#71717a]">No data yet</div>
            )}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#27272a]">
            <h2 className="text-lg font-semibold">Traffic Sources</h2>
          </div>
          <div className="divide-y divide-[#222]">
            {data?.trafficSources && data.trafficSources.length > 0 ? (
              data.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#71717a] text-sm w-6">{index + 1}.</span>
                    <span>{source.source}</span>
                  </div>
                  <span className="text-[#a1a1aa]">{source.visits} visits</span>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-[#71717a]">No data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
