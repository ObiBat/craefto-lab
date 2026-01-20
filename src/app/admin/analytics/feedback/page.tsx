"use client";

import * as React from "react";
import Link from "next/link";
import { AdminLoader } from "@/components/admin/AdminLoader";

interface FeedbackEntry {
  id: string;
  article_id: string;
  agent_type: string;
  feedback_type: string;
  feedback_score: number;
  feedback_text: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  journal_articles?: {
    title: string;
    slug: string;
  };
}

interface AgentStats {
  totalFeedback: number;
  avgScore: number;
  byType: Record<string, { count: number; avgScore: number }>;
  recentTrend: "improving" | "declining" | "stable";
}

const AGENT_LABELS: Record<string, { name: string; icon: string }> = {
  topic_scout: { name: "Topic Scout", icon: "🔍" },
  research_analyst: { name: "Research Analyst", icon: "📊" },
  editorial_strategist: { name: "Editorial Strategist", icon: "🎯" },
  editorial_writer: { name: "Editorial Writer", icon: "✍️" },
  editor_guardian: { name: "Editor Guardian", icon: "🛡️" },
};

const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  quality: "Quality",
  accuracy: "Accuracy",
  relevance: "Relevance",
  engagement: "Engagement",
  style: "Style",
  technical_accuracy: "Technical Accuracy",
  overall: "Overall",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ScoreDisplay({ score }: { score: number }) {
  const color =
    score >= 4
      ? "text-green-600"
      : score >= 3
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-sm ${i <= score ? color : "text-[hsl(var(--color-border))]"}`}
        >
          ★
        </span>
      ))}
      <span className={`ml-2 text-sm font-medium ${color}`}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function TrendBadge({ trend }: { trend: "improving" | "declining" | "stable" }) {
  const styles: Record<string, { bg: string; text: string; icon: string }> = {
    improving: { bg: "bg-green-500/10", text: "text-green-600", icon: "↑" },
    declining: { bg: "bg-red-500/10", text: "text-red-600", icon: "↓" },
    stable: { bg: "bg-[#71717a]/10", text: "text-[hsl(var(--color-foreground-subtle))]", icon: "→" },
  };

  const style = styles[trend];

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon} {trend.charAt(0).toUpperCase() + trend.slice(1)}
    </span>
  );
}

export default function FeedbackDashboardPage() {
  const [feedback, setFeedback] = React.useState<FeedbackEntry[]>([]);
  const [stats, setStats] = React.useState<Record<string, AgentStats>>({});
  const [loading, setLoading] = React.useState(true);
  const [selectedAgent, setSelectedAgent] = React.useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);

  // Form state for submitting feedback
  const [formArticle, setFormArticle] = React.useState("");
  const [formAgent, setFormAgent] = React.useState("editorial_writer");
  const [formType, setFormType] = React.useState("overall");
  const [formScore, setFormScore] = React.useState(4);
  const [formText, setFormText] = React.useState("");
  const [articles, setArticles] = React.useState<{ id: string; title: string }[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  // Fetch feedback and stats
  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/analytics/feedback");
        if (res.ok) {
          const data = await res.json();
          setFeedback(data.feedback || []);
          setStats(data.stats || {});
        }

        // Fetch articles for dropdown
        const articlesRes = await fetch("/api/admin/journal/articles");
        if (articlesRes.ok) {
          const data = await articlesRes.json();
          setArticles(data.articles || []);
        }
      } catch (error) {
        console.error("Failed to fetch feedback:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!formArticle) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/analytics/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: formArticle,
          agentType: formAgent,
          feedbackType: formType,
          feedbackScore: formScore,
          feedbackText: formText || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedback((prev) => [data.feedback, ...prev]);
        setShowSubmitModal(false);
        setFormArticle("");
        setFormText("");
        setFormScore(4);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredFeedback = selectedAgent
    ? feedback.filter((f) => f.agent_type === selectedAgent)
    : feedback;

  // Calculate overall stats
  const overallAvg = feedback.length
    ? feedback.reduce((sum, f) => sum + f.feedback_score, 0) / feedback.length
    : 0;

  if (loading) {
    return <AdminLoader message="Loading feedback..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--color-foreground-muted))] mb-2">
          <Link href="/admin/analytics" className="hover:text-[hsl(var(--color-foreground))]">
            Analytics
          </Link>
          <span>/</span>
          <span className="text-[hsl(var(--color-foreground))]">Agent Feedback</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Agent Feedback Loop</h1>
            <p className="text-sm text-[hsl(var(--color-foreground-subtle))] mt-1">
              Track AI agent performance and improve content generation
            </p>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-[hsl(var(--color-accent))] text-black rounded-xl font-medium hover:bg-[hsl(var(--color-accent-hover))] transition-colors"
          >
            Submit Feedback
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Overall Performance</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[hsl(var(--color-foreground-subtle))]">{feedback.length} feedback entries</span>
            <ScoreDisplay score={overallAvg} />
          </div>
        </div>

        {/* Agent Cards */}
        <div className="grid md:grid-cols-5 gap-4">
          {Object.entries(AGENT_LABELS).map(([key, { name, icon }]) => {
            const agentStats = stats[key];
            const isSelected = selectedAgent === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedAgent(isSelected ? null : key)}
                className={`p-4 rounded-xl border transition-colors text-left ${
                  isSelected
                    ? "bg-[hsl(var(--color-accent))]/10 border-[hsl(var(--color-accent))]/30"
                    : "bg-[hsl(var(--color-background-subtle))] border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-border))]"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{icon}</span>
                  <span className="font-medium text-[hsl(var(--color-foreground))] text-sm">{name}</span>
                </div>

                {agentStats ? (
                  <>
                    <div className="mb-2">
                      <ScoreDisplay score={agentStats.avgScore} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[hsl(var(--color-foreground-subtle))]">
                        {agentStats.totalFeedback} entries
                      </span>
                      <TrendBadge trend={agentStats.recentTrend} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">No feedback yet</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback by Type (for selected agent) */}
      {selectedAgent && stats[selectedAgent] && (
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            {AGENT_LABELS[selectedAgent].icon} {AGENT_LABELS[selectedAgent].name} - Feedback by Type
          </h2>
          <div className="grid md:grid-cols-7 gap-3">
            {Object.entries(stats[selectedAgent].byType).map(([type, data]) => (
              <div key={type} className="bg-[hsl(var(--color-background-subtle))] rounded-xl p-3">
                <p className="text-xs text-[hsl(var(--color-foreground-subtle))] mb-1">{FEEDBACK_TYPE_LABELS[type]}</p>
                <p className={`text-lg font-semibold ${
                  data.avgScore >= 4 ? "text-green-600" : data.avgScore >= 3 ? "text-yellow-600" : "text-red-600"
                }`}>
                  {data.avgScore.toFixed(1)}
                </p>
                <p className="text-xs text-[hsl(var(--color-foreground-subtle))]">{data.count} entries</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Feedback */}
      <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[hsl(var(--color-border))] flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {selectedAgent ? `${AGENT_LABELS[selectedAgent].name} Feedback` : "Recent Feedback"}
          </h2>
          {selectedAgent && (
            <button
              onClick={() => setSelectedAgent(null)}
              className="text-sm text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground))] transition-colors"
            >
              Show all
            </button>
          )}
        </div>

        {filteredFeedback.length === 0 ? (
          <div className="px-6 py-12 text-center text-[hsl(var(--color-foreground-subtle))]">
            <p className="text-lg mb-2">No feedback yet</p>
            <p className="text-sm">Submit feedback to help improve AI agent performance.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#27272a]">
            {filteredFeedback.slice(0, 20).map((entry) => (
              <div key={entry.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">
                        {AGENT_LABELS[entry.agent_type]?.icon || "🤖"}
                      </span>
                      <span className="font-medium text-[hsl(var(--color-foreground))]">
                        {AGENT_LABELS[entry.agent_type]?.name || entry.agent_type}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[hsl(var(--color-background-subtle))] text-xs text-[hsl(var(--color-foreground-muted))]">
                        {FEEDBACK_TYPE_LABELS[entry.feedback_type] || entry.feedback_type}
                      </span>
                    </div>
                    <p className="text-sm text-[hsl(var(--color-foreground-subtle))] truncate">
                      {entry.journal_articles?.title || "Unknown article"}
                    </p>
                    {entry.feedback_text && (
                      <p className="text-sm text-[hsl(var(--color-foreground-muted))] mt-2">{entry.feedback_text}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <ScoreDisplay score={entry.feedback_score} />
                    <p className="text-xs text-[hsl(var(--color-foreground-subtle))] mt-1">
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Feedback Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-[hsl(var(--color-border))] flex items-center justify-between">
              <h2 className="text-xl font-semibold">Submit Feedback</h2>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-2 text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-subtle))] rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
                  Article
                </label>
                <select
                  value={formArticle}
                  onChange={(e) => setFormArticle(e.target.value)}
                  className="w-full px-3 py-2 bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:border-[hsl(var(--color-accent))] focus:outline-none"
                  required
                >
                  <option value="">Select an article...</option>
                  {articles.map((article) => (
                    <option key={article.id} value={article.id}>
                      {article.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
                    Agent
                  </label>
                  <select
                    value={formAgent}
                    onChange={(e) => setFormAgent(e.target.value)}
                    className="w-full px-3 py-2 bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:border-[hsl(var(--color-accent))] focus:outline-none"
                  >
                    {Object.entries(AGENT_LABELS).map(([key, { name, icon }]) => (
                      <option key={key} value={key}>
                        {icon} {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
                    Feedback Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:border-[hsl(var(--color-accent))] focus:outline-none"
                  >
                    {Object.entries(FEEDBACK_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
                  Score
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setFormScore(score)}
                      className={`p-3 rounded-xl border transition-colors ${
                        formScore >= score
                          ? "bg-[hsl(var(--color-accent))]/10 border-[hsl(var(--color-accent))] text-[hsl(var(--color-accent))]"
                          : "bg-[hsl(var(--color-background-subtle))] border-[hsl(var(--color-border))] text-[hsl(var(--color-border))] hover:border-[hsl(var(--color-border))]"
                      }`}
                    >
                      <span className="text-xl">★</span>
                    </button>
                  ))}
                  <span className="ml-4 text-sm text-[hsl(var(--color-foreground-subtle))]">
                    {formScore === 1 && "Poor"}
                    {formScore === 2 && "Below Average"}
                    {formScore === 3 && "Average"}
                    {formScore === 4 && "Good"}
                    {formScore === 5 && "Excellent"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  className="w-full px-3 py-2 bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:border-[hsl(var(--color-accent))] focus:outline-none resize-none"
                  rows={3}
                  placeholder="What could be improved? What worked well?"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[hsl(var(--color-accent))] text-black rounded-xl font-medium hover:bg-[hsl(var(--color-accent-hover))] transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
