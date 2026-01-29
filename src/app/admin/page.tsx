"use client";

import * as React from "react";
import Link from "next/link";
import { AdminLoader } from "@/components/admin/AdminLoader";

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  wonDeals: number;
  conversionRate: number;
  totalPageViews: number;
  pipelineValue: number;
  avgDealSize: number;
  recentLeads: Array<{
    id: string;
    name: string;
    email: string;
    company: string | null;
    service: string | null;
    budget_range: string | null;
    created_at: string;
    stage: { name: string; color: string } | null;
  }>;
  weeklyLeads: number[];
}

function Sparkline({ data, color = "hsl(var(--color-accent))" }: { data: number[]; color?: string }) {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  const padding = 2;
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((value - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCard({
  label,
  value,
  change,
  icon,
  sparklineData,
  trend,
}: {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  sparklineData?: number[];
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6 hover:border-[hsl(var(--color-accent))]/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[hsl(var(--color-foreground-muted))] text-sm mb-1">{label}</p>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-semibold text-[hsl(var(--color-foreground))]">{value}</p>
            {sparklineData && sparklineData.length > 0 && (
              <Sparkline data={sparklineData} />
            )}
          </div>
          {change && (
            <p className={`text-sm mt-1 flex items-center gap-1 ${
              trend === "up" ? "text-green-600" : 
              trend === "down" ? "text-red-600" : 
              "text-[hsl(var(--color-accent))]"
            }`}>
              {trend === "up" && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {trend === "down" && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-[hsl(var(--color-background-subtle))] rounded-xl text-[hsl(var(--color-foreground-muted))]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function QuickAction({
  label,
  icon,
  href,
  variant = "default",
}: {
  label: string;
  icon: React.ReactNode;
  href: string;
  variant?: "default" | "primary";
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        variant === "primary"
          ? "bg-[hsl(var(--color-accent))] text-black hover:bg-[hsl(var(--color-accent-hover))]"
          : "bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-muted))]"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
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
    return <AdminLoader message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
          <p className="text-[hsl(var(--color-foreground-muted))]">Overview of your leads and performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <QuickAction
            label="New Lead"
            href="/admin/leads"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          />
          <QuickAction
            label="Run Scan"
            href="/admin/pipeline"
            variant="primary"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Stats Grid - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Leads"
          value={stats?.totalLeads || 0}
          sparklineData={stats?.weeklyLeads}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          label="New This Week"
          value={stats?.newLeads || 0}
          change={stats?.newLeads && stats.newLeads > 0 ? `+${stats.newLeads} this week` : undefined}
          trend={stats?.newLeads && stats.newLeads > 2 ? "up" : stats?.newLeads === 0 ? "down" : "neutral"}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
        />
        <StatCard
          label="Pipeline Value"
          value={stats?.pipelineValue ? formatCurrency(stats.pipelineValue) : "$0"}
          change={stats?.avgDealSize ? `Avg: ${formatCurrency(stats.avgDealSize)}` : undefined}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Conversion Rate"
          value={stats?.conversionRate ? `${stats.conversionRate.toFixed(1)}%` : "0%"}
          change={stats?.wonDeals ? `${stats.wonDeals} won deals` : undefined}
          trend={stats?.conversionRate && stats.conversionRate > 20 ? "up" : undefined}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
