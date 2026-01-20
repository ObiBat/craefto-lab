"use client";

import * as React from "react";
import Link from "next/link";

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  wonDeals: number;
  conversionRate: number;
  totalPageViews: number;
  recentLeads: Array<{
    id: string;
    name: string;
    email: string;
    company: string | null;
    service: string | null;
    created_at: string;
    stage: { name: string; color: string } | null;
  }>;
}

function StatCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[hsl(var(--color-foreground-muted))] text-sm mb-1">{label}</p>
          <p className="text-3xl font-semibold text-[hsl(var(--color-foreground))]">{value}</p>
          {change && (
            <p className="text-[hsl(var(--color-accent))] text-sm mt-1">{change}</p>
          )}
        </div>
        <div className="p-3 bg-[hsl(var(--color-background-subtle))] rounded-xl text-[hsl(var(--color-foreground-muted))]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getStageColor(color: string | null) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-400",
    cyan: "bg-cyan-500/20 text-cyan-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    purple: "bg-purple-500/20 text-purple-400",
    orange: "bg-orange-500/20 text-orange-400",
    green: "bg-green-500/20 text-green-400",
    red: "bg-red-500/20 text-red-400",
  };
  return colors[color || "blue"] || colors.blue;
}

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-48 bg-[hsl(var(--color-border))] rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-[hsl(var(--color-background-muted))] rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-[hsl(var(--color-background-muted))] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p>Overview of your leads and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Leads"
          value={stats?.totalLeads || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          label="New This Week"
          value={stats?.newLeads || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
        />
        <StatCard
          label="Qualified"
          value={stats?.qualifiedLeads || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Won Deals"
          value={stats?.wonDeals || 0}
          change={stats?.conversionRate ? `${stats.conversionRate.toFixed(1)}% conversion` : undefined}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Recent Leads */}
      <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl">
        <div className="p-6 border-b border-[hsl(var(--color-border))] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recent Leads</h2>
            <p className="text-[hsl(var(--color-foreground-muted))] text-sm">Latest inquiries from your website</p>
          </div>
          <Link
            href="/admin/leads"
            className="text-sm text-[hsl(var(--color-accent))] hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-[hsl(var(--color-border))]">
          {stats?.recentLeads && stats.recentLeads.length > 0 ? (
            stats.recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex items-center justify-between p-4 hover:bg-[hsl(var(--color-background-subtle))] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-accent))]/20 flex items-center justify-center text-[hsl(var(--color-accent))] font-medium">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-[hsl(var(--color-foreground))]">{lead.name}</p>
                    <p className="text-sm text-[hsl(var(--color-foreground-muted))]">
                      {lead.company || lead.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {lead.stage && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStageColor(lead.stage.color)}`}>
                      {lead.stage.name}
                    </span>
                  )}
                  <span className="text-sm text-[hsl(var(--color-foreground-subtle))]">
                    {formatDate(lead.created_at)}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-[hsl(var(--color-foreground-subtle))]">
              <p>No leads yet</p>
              <p className="text-sm mt-1">Leads will appear here when someone submits the contact form</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
