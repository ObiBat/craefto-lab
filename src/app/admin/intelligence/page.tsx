"use client";

import * as React from "react";
import Link from "next/link";
import { AdminLoader } from "@/components/admin/AdminLoader";

interface LeadWithAnalysis {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service_interest: string | null;
  budget_range: string | null;
  timeline: string | null;
  message: string | null;
  created_at: string;
  analysis?: {
    fit_score: number;
    project_type: string;
    complexity: string;
    scope_creep_risk: number;
    recommended_stack: string[];
    requires_review: boolean;
    analyzed_at: string;
  } | null;
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

function getRiskColor(risk: number) {
  if (risk < 0.3) return "text-green-600";
  if (risk < 0.7) return "text-yellow-600";
  return "text-red-600";
}

function getFitColor(score: number) {
  if (score >= 0.7) return "text-green-600";
  if (score >= 0.4) return "text-yellow-600";
  return "text-red-600";
}

export default function IntelligencePage() {
  const [leads, setLeads] = React.useState<LeadWithAnalysis[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [analyzing, setAnalyzing] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState({
    total: 0,
    analyzed: 0,
    avgFit: 0,
    highRisk: 0,
  });

  React.useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      const res = await fetch("/api/admin/intelligence/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setStats(data.stats || { total: 0, analyzed: 0, avgFit: 0, highRisk: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  }

  async function analyzeLead(leadId: string) {
    setAnalyzing(leadId);
    try {
      const res = await fetch(`/api/admin/intelligence/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });

      if (res.ok) {
        const data = await res.json();
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === leadId ? { ...lead, analysis: data.analysis } : lead
          )
        );
        // Refresh stats
        fetchLeads();
      }
    } catch (error) {
      console.error("Failed to analyze lead:", error);
    } finally {
      setAnalyzing(null);
    }
  }

  if (loading) {
    return <AdminLoader message="Loading intelligence..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Client Intelligence</h1>
        <p className="text-[hsl(var(--color-foreground-muted))]">AI-powered analysis of incoming leads</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
          <p className="text-[hsl(var(--color-foreground-muted))] text-sm mb-1">Total Leads</p>
          <p className="text-3xl font-semibold text-[hsl(var(--color-foreground))]">{stats.total}</p>
        </div>
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
          <p className="text-[hsl(var(--color-foreground-muted))] text-sm mb-1">Analyzed</p>
          <p className="text-3xl font-semibold text-[hsl(var(--color-foreground))]">{stats.analyzed}</p>
        </div>
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
          <p className="text-[hsl(var(--color-foreground-muted))] text-sm mb-1">Avg Fit Score</p>
          <p className={`text-3xl font-semibold ${getFitColor(stats.avgFit)}`}>
            {stats.avgFit > 0 ? `${Math.round(stats.avgFit * 100)}%` : "—"}
          </p>
        </div>
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
          <p className="text-[hsl(var(--color-foreground-muted))] text-sm mb-1">High Risk</p>
          <p className="text-3xl font-semibold text-red-600">{stats.highRisk}</p>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[hsl(var(--color-border))]">
          <h2 className="text-lg font-semibold">Lead Analysis</h2>
          <p className="text-[hsl(var(--color-foreground-muted))] text-sm">Click analyze to run AI assessment</p>
        </div>

        {leads.length > 0 ? (
          <div className="divide-y divide-[hsl(var(--color-border))]">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 hover:bg-[hsl(var(--color-background-subtle))] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-accent))]/20 flex items-center justify-center text-[hsl(var(--color-accent))] font-medium shrink-0">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-medium text-[hsl(var(--color-foreground))] hover:text-[hsl(var(--color-accent))] transition-colors"
                      >
                        {lead.name}
                      </Link>
                      <p className="text-sm text-[hsl(var(--color-foreground-muted))] truncate">
                        {lead.company || lead.email}
                      </p>
                      <p className="text-xs text-[hsl(var(--color-foreground-subtle))] mt-1">
                        {formatDate(lead.created_at)}
                      </p>
                    </div>
                  </div>

                  {lead.analysis ? (
                    <div className="flex items-center gap-6 text-sm shrink-0">
                      <div className="text-center">
                        <p className="text-[hsl(var(--color-foreground-subtle))] text-xs mb-1">Fit</p>
                        <p className={`font-semibold ${getFitColor(lead.analysis.fit_score)}`}>
                          {Math.round(lead.analysis.fit_score * 100)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[hsl(var(--color-foreground-subtle))] text-xs mb-1">Risk</p>
                        <p className={`font-semibold ${getRiskColor(lead.analysis.scope_creep_risk)}`}>
                          {Math.round(lead.analysis.scope_creep_risk * 100)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[hsl(var(--color-foreground-subtle))] text-xs mb-1">Type</p>
                        <p className="font-medium text-[hsl(var(--color-foreground))]">{lead.analysis.project_type}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[hsl(var(--color-foreground-subtle))] text-xs mb-1">Complexity</p>
                        <p className="font-medium text-[hsl(var(--color-foreground))]">{lead.analysis.complexity}</p>
                      </div>
                      {lead.analysis.requires_review && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 text-xs rounded-full">
                          Needs Review
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => analyzeLead(lead.id)}
                      disabled={analyzing === lead.id}
                      className="px-4 py-2 bg-[hsl(var(--color-accent))] text-black text-sm font-medium rounded-xl hover:bg-[hsl(var(--color-accent-hover))] transition-colors disabled:opacity-50 disabled:cursor-wait shrink-0"
                    >
                      {analyzing === lead.id ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Analyzing...
                        </span>
                      ) : (
                        "Analyze"
                      )}
                    </button>
                  )}
                </div>

                {lead.analysis && lead.analysis.recommended_stack.length > 0 && (
                  <div className="mt-3 ml-14 flex items-center gap-2">
                    <span className="text-[hsl(var(--color-foreground-subtle))] text-xs">Stack:</span>
                    <div className="flex flex-wrap gap-1">
                      {lead.analysis.recommended_stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground-muted))] text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-[hsl(var(--color-foreground-subtle))]">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p>No leads yet</p>
            <p className="text-sm mt-1">Leads will appear here when someone submits the contact form</p>
          </div>
        )}
      </div>
    </div>
  );
}
