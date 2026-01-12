"use client";

import * as React from "react";
import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service_interest: string | null;
  budget_range: string | null;
  timeline: string | null;
  score: number;
  created_at: string;
  stage: { id: string; name: string; color: string } | null;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  position: number;
}

function getStageColor(color: string | null) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30",
    red: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[color || "blue"] || colors.blue;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatBudget(budget: string | null) {
  const budgets: Record<string, string> = {
    "3-5k": "A$3k – A$5k",
    "5-10k": "A$5k – A$10k",
    "10-25k": "A$10k – A$25k",
    "25-50k": "A$25k – A$50k",
    "50k+": "A$50k+",
    "discuss": "To discuss",
  };
  return budgets[budget || ""] || budget || "—";
}

function formatService(service: string | null) {
  const services: Record<string, string> = {
    brand: "Brand Identity",
    web: "Web Design & Dev",
    saas: "SaaS / Product",
    ai: "AI / Automation",
    other: "Not sure yet",
  };
  return services[service || ""] || service || "—";
}

export default function LeadsPage() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [stages, setStages] = React.useState<PipelineStage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [leadsRes, stagesRes] = await Promise.all([
          fetch("/api/admin/leads"),
          fetch("/api/admin/stages"),
        ]);

        if (leadsRes.ok) {
          const data = await leadsRes.json();
          setLeads(data.leads || []);
        }
        if (stagesRes.ok) {
          const data = await stagesRes.json();
          setStages(data.stages || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredLeads = React.useMemo(() => {
    return leads.filter((lead) => {
      const matchesFilter = filter === "all" || lead.stage?.id === filter;
      const matchesSearch =
        search === "" ||
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(search.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [leads, filter, search]);

  const handleStageChange = async (leadId: string, newStageId: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId: newStageId }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === leadId
              ? { ...lead, stage: stages.find((s) => s.id === newStageId) || lead.stage }
              : lead
          )
        );
      }
    } catch (error) {
      console.error("Failed to update stage:", error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-32 bg-[#222] rounded" />
        <div className="h-12 bg-[#18181b] rounded-lg" />
        <div className="h-96 bg-[#18181b] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Leads</h1>
          <p>{leads.length} total leads</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#3f3f46]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-[#22c55e]/20 text-[#22c55e]"
                : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
            }`}
          >
            All
          </button>
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setFilter(stage.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === stage.id
                  ? getStageColor(stage.color)
                  : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
              }`}
            >
              {stage.name}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272a]">
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Lead</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Service</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Budget</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Score</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Stage</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#27272a] transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/leads/${lead.id}`} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e] font-medium text-sm">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white hover:text-[#22c55e] transition-colors">{lead.name}</p>
                        <p className="text-sm text-[#71717a]">{lead.company || lead.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-[#a1a1aa]">{formatService(lead.service_interest)}</td>
                  <td className="px-6 py-4 text-[#a1a1aa]">{formatBudget(lead.budget_range)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center text-sm font-medium">
                        {lead.score}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={lead.stage?.id || ""}
                      onChange={(e) => handleStageChange(lead.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer focus:outline-none ${getStageColor(lead.stage?.color || null)}`}
                    >
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.id} className="bg-[#18181b] text-white">
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-[#71717a] text-sm">{formatDate(lead.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#71717a]">
                  {search || filter !== "all" ? "No leads match your filters" : "No leads yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
