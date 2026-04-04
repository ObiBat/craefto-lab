"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLoader } from "@/components/admin/AdminLoader";

interface Project {
  id: string;
  name: string;
  description: string | null;
  project_type: string;
  status: string;
  health: string;
  progress: number;
  priority: string;
  start_date: string | null;
  target_end_date: string | null;
  budget: number;
  spent: number;
  revenue: number;
  cost: number;
  margin_percent: number;
  currency: string;
  created_at: string;
  updated_at: string;
  client: { id: string; name: string; company: string | null } | null;
  assignments: Array<{
    id: string;
    role: string;
    status: string;
    contractor: { id: string; name: string; avatar_url: string | null } | null;
  }>;
}

interface Client {
  id: string;
  name: string;
  company: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  planning: { label: "Planning", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  in_progress: { label: "In Progress", color: "bg-[hsl(var(--color-accent))]/20 text-[hsl(var(--color-accent))] border-[hsl(var(--color-accent))]/30" },
  review: { label: "Review", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  completed: { label: "Completed", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  on_hold: { label: "On Hold", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  medium: { label: "Medium", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  high: { label: "High", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  urgent: { label: "Urgent", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const HEALTH_COLORS: Record<string, string> = {
  on_track: "bg-green-500",
  at_risk: "bg-yellow-500",
  delayed: "bg-red-500",
  blocked: "bg-red-400",
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] as const } },
};

function formatCurrency(value: number, currency = "AUD") {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function Initials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="w-7 h-7 rounded-full bg-[hsl(var(--color-accent))]/20 text-[hsl(var(--color-accent))] flex items-center justify-center font-medium text-[10px] shrink-0">
      {initials}
    </div>
  );
}

const EMPTY_FORM = {
  name: "",
  description: "",
  client_id: "",
  status: "planning",
  priority: "medium",
  start_date: "",
  target_end_date: "",
  revenue: 0,
  cost: 0,
  budget: 0,
  currency: "AUD",
};

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("all");
  const [sort, setSort] = React.useState("updated_at");
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [saving, setSaving] = React.useState(false);

  async function fetchProjects() {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      params.set("sort", sort);
      const res = await fetch(`/api/admin/projects?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchProjects();
  }, [filter, sort]);

  async function openForm() {
    setForm(EMPTY_FORM);
    setShowForm(true);
    try {
      const res = await fetch("/api/admin/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(Array.isArray(data) ? data : data.clients || []);
      }
    } catch {
      // ignore
    }
  }

  async function handleSave() {
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          client_id: form.client_id || null,
          revenue: Number(form.revenue) || 0,
          cost: Number(form.cost) || 0,
          budget: Number(form.budget) || 0,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        fetchProjects();
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoader message="Loading projects..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Projects</h1>
          <p className="text-[hsl(var(--color-foreground-muted))]">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status filter */}
          <div className="flex rounded-lg border border-[hsl(var(--color-border))] overflow-hidden">
            {(["all", "planning", "in_progress", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-foreground))]"
                    : "text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))]"
                }`}
              >
                {f === "all" ? "All" : f === "in_progress" ? "Active" : f === "planning" ? "Planning" : "Done"}
              </button>
            ))}
          </div>
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] focus:outline-none"
          >
            <option value="updated_at">Recent</option>
            <option value="name">Name</option>
          </select>
          <button
            onClick={openForm}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-accent))]/20 transition-colors border border-[hsl(var(--color-accent))]/20 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-12 text-center">
          <svg className="w-10 h-10 mx-auto mb-3 text-[hsl(var(--color-foreground-subtle))] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p className="text-[hsl(var(--color-foreground-muted))]">No projects yet</p>
          <button onClick={openForm} className="mt-3 text-sm text-[hsl(var(--color-accent))] hover:underline">
            Create your first project
          </button>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {projects.map((project) => {
            const statusConf = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning;
            const priorityConf = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG.medium;
            const healthColor = HEALTH_COLORS[project.health] || HEALTH_COLORS.on_track;
            const margin = project.revenue > 0
              ? Math.round(((project.revenue - project.cost) / project.revenue) * 100)
              : 0;

            return (
              <motion.div key={project.id} variants={fadeUp}>
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="block bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl hover:border-[hsl(var(--color-border-strong))] transition-colors"
                >
                  <div className="p-5">
                    {/* Top: name + health dot */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${healthColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[hsl(var(--color-foreground))] truncate">
                          {project.name}
                        </p>
                        <p className="text-sm text-[hsl(var(--color-foreground-muted))] truncate">
                          {project.client?.name || "No client"}
                        </p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${statusConf.color}`}>
                        {statusConf.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${priorityConf.color}`}>
                        {priorityConf.label}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[hsl(var(--color-foreground-subtle))]">Progress</span>
                        <span className="text-xs font-mono text-[hsl(var(--color-foreground-muted))]">
                          {project.progress || 0}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[hsl(var(--color-background))] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[hsl(var(--color-accent))] rounded-full transition-all"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Budget / Margin */}
                    <div className="space-y-1.5 text-sm mb-4">
                      {(project.revenue > 0 || project.cost > 0) && (
                        <div className="flex items-center justify-between">
                          <span className="text-[hsl(var(--color-foreground-subtle))]">Revenue / Cost</span>
                          <span className="font-mono text-[hsl(var(--color-foreground))]">
                            {formatCurrency(project.revenue, project.currency)} / {formatCurrency(project.cost, project.currency)}
                          </span>
                        </div>
                      )}
                      {project.revenue > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[hsl(var(--color-foreground-subtle))]">Margin</span>
                          <span
                            className={`font-mono font-medium ${
                              margin >= 30
                                ? "text-green-400"
                                : margin >= 15
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {margin}%
                          </span>
                        </div>
                      )}
                      {project.budget > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[hsl(var(--color-foreground-subtle))]">Budget</span>
                          <span className="font-mono text-[hsl(var(--color-foreground))]">
                            {formatCurrency(project.budget, project.currency)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Team avatars */}
                    {project.assignments && project.assignments.length > 0 && (
                      <div className="flex items-center gap-2 pt-3 border-t border-[hsl(var(--color-border))]">
                        <div className="flex -space-x-1.5">
                          {project.assignments.slice(0, 4).map((a, i) =>
                            a.contractor ? (
                              <Initials key={i} name={a.contractor.name} />
                            ) : null
                          )}
                          {project.assignments.length > 4 && (
                            <div className="w-7 h-7 rounded-full bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] text-[10px] flex items-center justify-center text-[hsl(var(--color-foreground-muted))]">
                              +{project.assignments.length - 4}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-[hsl(var(--color-foreground-subtle))]">
                          {project.assignments.length} assigned
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* New Project Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-4 top-[5%] bottom-[5%] z-50 mx-auto max-w-lg bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] rounded-2xl overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">New Project</h2>
                <div className="space-y-4">
                  <FormField label="Project Name *">
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                      placeholder="Project name"
                    />
                  </FormField>
                  <FormField label="Description">
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))] resize-none"
                      placeholder="Brief description"
                    />
                  </FormField>
                  <FormField label="Client">
                    <select
                      value={form.client_id}
                      onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                    >
                      <option value="">No client</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}{c.company ? ` (${c.company})` : ""}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Status">
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                      >
                        <option value="planning">Planning</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                    </FormField>
                    <FormField label="Priority">
                      <select
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Start Date">
                      <input
                        type="date"
                        value={form.start_date}
                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                      />
                    </FormField>
                    <FormField label="Target End Date">
                      <input
                        type="date"
                        value={form.target_end_date}
                        onChange={(e) => setForm({ ...form, target_end_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                      />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <FormField label="Revenue">
                      <input
                        type="number"
                        value={form.revenue || ""}
                        onChange={(e) => setForm({ ...form, revenue: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                        placeholder="0"
                      />
                    </FormField>
                    <FormField label="Budget">
                      <input
                        type="number"
                        value={form.budget || ""}
                        onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                        placeholder="0"
                      />
                    </FormField>
                    <FormField label="Currency">
                      <select
                        value={form.currency}
                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                      >
                        <option value="AUD">AUD</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </FormField>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[hsl(var(--color-border))]">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.name}
                    className="px-5 py-2 rounded-lg bg-[hsl(var(--color-accent))] text-white text-sm font-medium hover:bg-[hsl(var(--color-accent-hover))] transition-colors disabled:opacity-50"
                  >
                    {saving ? "Creating..." : "Create Project"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-[hsl(var(--color-foreground-muted))] mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}
