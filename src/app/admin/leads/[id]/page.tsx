"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  service_interest: string | null;
  budget_range: string | null;
  timeline: string | null;
  message: string | null;
  score: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_page: string | null;
  created_at: string;
  updated_at: string;
  stage: { id: string; name: string; color: string } | null;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
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
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatBudget(budget: string | null) {
  const budgets: Record<string, string> = {
    "3-5k": "A$3,000 – A$5,000",
    "5-10k": "A$5,000 – A$10,000",
    "10-25k": "A$10,000 – A$25,000",
    "25-50k": "A$25,000 – A$50,000",
    "50k+": "A$50,000+",
    "discuss": "To discuss",
  };
  return budgets[budget || ""] || budget || "Not specified";
}

function formatService(service: string | null) {
  const services: Record<string, string> = {
    brand: "Brand Identity",
    web: "Web Design & Development",
    saas: "SaaS / Product",
    ai: "AI / Automation",
    other: "Not sure yet",
  };
  return services[service || ""] || service || "Not specified";
}

function formatTimeline(timeline: string | null) {
  const timelines: Record<string, string> = {
    asap: "ASAP",
    "1-3months": "1-3 months",
    "3-6months": "3-6 months",
    flexible: "Flexible",
  };
  return timelines[timeline || ""] || timeline || "Not specified";
}

function getActivityIcon(type: string) {
  switch (type) {
    case "form_submission":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "email_sent":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "stage_change":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      );
    case "note":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = React.useState<Lead | null>(null);
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [stages, setStages] = React.useState<PipelineStage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [note, setNote] = React.useState("");
  const [addingNote, setAddingNote] = React.useState(false);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [leadRes, stagesRes] = await Promise.all([
          fetch(`/api/admin/leads/${params.id}`),
          fetch("/api/admin/stages"),
        ]);

        if (leadRes.ok) {
          const data = await leadRes.json();
          setLead(data.lead);
          setActivities(data.activities || []);
        } else if (leadRes.status === 404) {
          router.push("/admin/leads");
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
  }, [params.id, router]);

  const handleStageChange = async (newStageId: string) => {
    if (!lead) return;

    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId: newStageId }),
      });

      if (res.ok) {
        const newStage = stages.find((s) => s.id === newStageId);
        setLead((prev) => (prev ? { ...prev, stage: newStage || prev.stage } : prev));
        setActivities((prev) => [
          {
            id: Date.now().toString(),
            type: "stage_change",
            description: `Moved to ${newStage?.name}`,
            metadata: null,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error("Failed to update stage:", error);
    }
  };

  const handleAddNote = async () => {
    if (!lead || !note.trim()) return;

    setAddingNote(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() }),
      });

      if (res.ok) {
        setActivities((prev) => [
          {
            id: Date.now().toString(),
            type: "note",
            description: note.trim(),
            metadata: null,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setNote("");
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-32 bg-[#222] rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-[#18181b] rounded-xl" />
          <div className="h-96 bg-[#18181b] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-[#71717a]">Lead not found</p>
        <Link href="/admin/leads" className="text-[#22c55e] hover:underline mt-2 inline-block">
          Back to leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/leads"
            className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e] font-semibold text-xl">
              {lead.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{lead.name}</h1>
              <p>{lead.company || lead.email}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#27272a] rounded-lg">
            <span className="text-[#a1a1aa] text-sm">Score:</span>
            <span className="font-semibold text-white">{lead.score}</span>
          </div>
          <select
            value={lead.stage?.id || ""}
            onChange={(e) => handleStageChange(e.target.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer focus:outline-none ${getStageColor(lead.stage?.color || null)}`}
          >
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id} className="bg-[#18181b] text-white">
                {stage.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Project Details</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-[#ccc] whitespace-pre-wrap">{lead.message || "No message provided"}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Lead Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[#71717a] text-sm mb-1">Email</p>
                <a href={`mailto:${lead.email}`} className="text-[#22c55e] hover:underline">
                  {lead.email}
                </a>
              </div>
              {lead.phone && (
                <div>
                  <p className="text-[#71717a] text-sm mb-1">Phone</p>
                  <a href={`tel:${lead.phone}`} className="hover:text-[#22c55e]">
                    {lead.phone}
                  </a>
                </div>
              )}
              <div>
                <p className="text-[#71717a] text-sm mb-1">Service Interest</p>
                <p className="text-white">{formatService(lead.service_interest)}</p>
              </div>
              <div>
                <p className="text-[#71717a] text-sm mb-1">Budget Range</p>
                <p className="text-white">{formatBudget(lead.budget_range)}</p>
              </div>
              <div>
                <p className="text-[#71717a] text-sm mb-1">Timeline</p>
                <p className="text-white">{formatTimeline(lead.timeline)}</p>
              </div>
              <div>
                <p className="text-[#71717a] text-sm mb-1">Submitted</p>
                <p className="text-white">{formatDate(lead.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Attribution */}
          {(lead.utm_source || lead.landing_page) && (
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Attribution</h2>
              <div className="grid grid-cols-2 gap-6">
                {lead.utm_source && (
                  <div>
                    <p className="text-[#71717a] text-sm mb-1">Source</p>
                    <p className="text-white">{lead.utm_source}</p>
                  </div>
                )}
                {lead.utm_medium && (
                  <div>
                    <p className="text-[#71717a] text-sm mb-1">Medium</p>
                    <p className="text-white">{lead.utm_medium}</p>
                  </div>
                )}
                {lead.utm_campaign && (
                  <div>
                    <p className="text-[#71717a] text-sm mb-1">Campaign</p>
                    <p className="text-white">{lead.utm_campaign}</p>
                  </div>
                )}
                {lead.landing_page && (
                  <div>
                    <p className="text-[#71717a] text-sm mb-1">Landing Page</p>
                    <p className="text-white">{lead.landing_page}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="space-y-6">
          {/* Add Note */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full bg-transparent border-none resize-none text-white placeholder-[#666] focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddNote}
                disabled={!note.trim() || addingNote}
                className="px-4 py-2 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingNote ? "Adding..." : "Add Note"}
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Activity</h2>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center text-[#a1a1aa]">
                        {getActivityIcon(activity.type)}
                      </div>
                      {index < activities.length - 1 && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-full bg-[#222]" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm text-[#e4e4e7]">{activity.description}</p>
                      <p className="text-xs text-[#71717a] mt-1">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#71717a] text-sm">No activity yet</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-3 px-4 py-3 bg-[#27272a] hover:bg-[#222] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-[#a1a1aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Send Email</span>
              </a>
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-3 px-4 py-3 bg-[#27272a] hover:bg-[#222] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-[#a1a1aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
