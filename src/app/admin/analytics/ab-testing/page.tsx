"use client";

import * as React from "react";
import Link from "next/link";

interface ABTest {
  id: string;
  article_id: string;
  test_name: string;
  variant_a: string;
  variant_b: string;
  variant_a_views: number;
  variant_b_views: number;
  variant_a_clicks: number;
  variant_b_clicks: number;
  winner: string | null;
  confidence: number | null;
  status: string;
  created_at: string;
  ended_at: string | null;
  journal_articles?: {
    title: string;
    slug: string;
  };
}

interface Article {
  id: string;
  title: string;
  slug: string;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function calculateCTR(clicks: number, views: number): number {
  return views > 0 ? (clicks / views) * 100 : 0;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-500/10 text-green-600 border-green-500/20",
    completed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    cancelled: "bg-[#71717a]/10 text-[hsl(var(--color-foreground-subtle))] border-[#71717a]/20",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[status] || styles.cancelled}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function WinnerBadge({ variant, confidence }: { variant: string; confidence: number | null }) {
  return (
    <div className="flex items-center gap-2">
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-accent))] border border-[hsl(var(--color-accent))]/20">
        Winner: Variant {variant.toUpperCase()}
      </span>
      {confidence !== null && (
        <span className="text-xs text-[hsl(var(--color-foreground-subtle))]">
          {(confidence * 100).toFixed(0)}% confidence
        </span>
      )}
    </div>
  );
}

export default function ABTestingPage() {
  const [tests, setTests] = React.useState<ABTest[]>([]);
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [selectedTest, setSelectedTest] = React.useState<ABTest | null>(null);
  const [filter, setFilter] = React.useState<"all" | "active" | "completed">("all");

  // Form state
  const [formArticle, setFormArticle] = React.useState("");
  const [formTestName, setFormTestName] = React.useState("title");
  const [formVariantA, setFormVariantA] = React.useState("");
  const [formVariantB, setFormVariantB] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  // Fetch tests and articles
  React.useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all tests
        const testsRes = await fetch("/api/analytics/ab-test");
        if (testsRes.ok) {
          const data = await testsRes.json();
          setTests(data);
        }

        // Fetch articles for dropdown
        const articlesRes = await fetch("/api/admin/journal/articles");
        if (articlesRes.ok) {
          const data = await articlesRes.json();
          setArticles(data.articles || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleCreateTest(e: React.FormEvent) {
    e.preventDefault();
    if (!formArticle || !formVariantA || !formVariantB) return;

    setCreating(true);
    try {
      const res = await fetch("/api/analytics/ab-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          articleId: formArticle,
          testName: formTestName,
          variantA: formVariantA,
          variantB: formVariantB,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTests((prev) => [data.test, ...prev]);
        setShowCreateModal(false);
        setFormArticle("");
        setFormVariantA("");
        setFormVariantB("");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create test");
      }
    } catch (error) {
      console.error("Failed to create test:", error);
    } finally {
      setCreating(false);
    }
  }

  async function handleEndTest(testId: string) {
    if (!confirm("End this test and declare a winner?")) return;

    try {
      const res = await fetch("/api/analytics/ab-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end", testId }),
      });

      if (res.ok) {
        const data = await res.json();
        setTests((prev) =>
          prev.map((t) =>
            t.id === testId
              ? { ...t, status: "completed", winner: data.winner, confidence: data.confidence }
              : t
          )
        );
        setSelectedTest(null);
      }
    } catch (error) {
      console.error("Failed to end test:", error);
    }
  }

  async function handleCancelTest(testId: string) {
    if (!confirm("Cancel this test? This cannot be undone.")) return;

    try {
      const res = await fetch("/api/analytics/ab-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", testId }),
      });

      if (res.ok) {
        setTests((prev) =>
          prev.map((t) => (t.id === testId ? { ...t, status: "cancelled" } : t))
        );
        setSelectedTest(null);
      }
    } catch (error) {
      console.error("Failed to cancel test:", error);
    }
  }

  const filteredTests = tests.filter((test) => {
    if (filter === "all") return true;
    if (filter === "active") return test.status === "active";
    if (filter === "completed") return test.status === "completed";
    return true;
  });

  const activeTests = tests.filter((t) => t.status === "active").length;
  const completedTests = tests.filter((t) => t.status === "completed").length;

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[hsl(var(--color-border))] rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-[hsl(var(--color-background-muted))] rounded-xl" />
          ))}
        </div>
      </div>
    );
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
          <span className="text-[hsl(var(--color-foreground))]">A/B Testing</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">A/B Testing</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[hsl(var(--color-accent))] text-black rounded-xl font-medium hover:bg-[hsl(var(--color-accent-hover))] transition-colors"
          >
            New Test
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4">
          <p className="text-3xl font-semibold text-[hsl(var(--color-foreground))]">{tests.length}</p>
          <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Total Tests</p>
        </div>
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4">
          <p className="text-3xl font-semibold text-[hsl(var(--color-accent))]">{activeTests}</p>
          <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Active Tests</p>
        </div>
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4">
          <p className="text-3xl font-semibold text-blue-600">{completedTests}</p>
          <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Completed Tests</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[hsl(var(--color-border))] pb-4">
        {(["all", "active", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f
                ? "bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground))]"
                : "text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))]"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "active" && activeTests > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-[hsl(var(--color-accent))]/20 text-[hsl(var(--color-accent))] text-xs rounded">
                {activeTests}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tests List */}
      <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
        {filteredTests.length === 0 ? (
          <div className="px-6 py-12 text-center text-[hsl(var(--color-foreground-subtle))]">
            <p className="text-lg mb-2">No tests found</p>
            <p className="text-sm">
              {filter === "active"
                ? "Start a new A/B test to optimize your content."
                : "No tests match the current filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#27272a]">
            {filteredTests.map((test) => (
              <button
                key={test.id}
                onClick={() => setSelectedTest(test)}
                className="w-full px-6 py-4 flex items-center gap-6 hover:bg-[hsl(var(--color-background-subtle))] transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-[hsl(var(--color-foreground))] truncate">
                      {test.journal_articles?.title || "Unknown Article"}
                    </p>
                    <StatusBadge status={test.status} />
                  </div>
                  <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">
                    Testing: {test.test_name} | Started {formatDate(test.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-8 text-sm">
                  <div className="text-center">
                    <p className="text-[hsl(var(--color-foreground))] font-medium">
                      {calculateCTR(test.variant_a_clicks, test.variant_a_views).toFixed(1)}%
                    </p>
                    <p className="text-[hsl(var(--color-foreground-subtle))]">Variant A</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[hsl(var(--color-foreground))] font-medium">
                      {calculateCTR(test.variant_b_clicks, test.variant_b_views).toFixed(1)}%
                    </p>
                    <p className="text-[hsl(var(--color-foreground-subtle))]">Variant B</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[hsl(var(--color-foreground))] font-medium">
                      {test.variant_a_views + test.variant_b_views}
                    </p>
                    <p className="text-[hsl(var(--color-foreground-subtle))]">Impressions</p>
                  </div>
                </div>

                {test.winner && (
                  <WinnerBadge variant={test.winner} confidence={test.confidence} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Test Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-[hsl(var(--color-border))] flex items-center justify-between">
              <h2 className="text-xl font-semibold">Create A/B Test</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-subtle))] rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
                  Article
                </label>
                <select
                  value={formArticle}
                  onChange={(e) => {
                    setFormArticle(e.target.value);
                    const article = articles.find((a) => a.id === e.target.value);
                    if (article) {
                      setFormVariantA(article.title);
                    }
                  }}
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

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
                  Test Type
                </label>
                <select
                  value={formTestName}
                  onChange={(e) => setFormTestName(e.target.value)}
                  className="w-full px-3 py-2 bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:border-[hsl(var(--color-accent))] focus:outline-none"
                >
                  <option value="title">Title</option>
                  <option value="excerpt">Excerpt</option>
                  <option value="cta">Call to Action</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
                  Variant A (Control)
                </label>
                <textarea
                  value={formVariantA}
                  onChange={(e) => setFormVariantA(e.target.value)}
                  className="w-full px-3 py-2 bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:border-[hsl(var(--color-accent))] focus:outline-none resize-none"
                  rows={2}
                  placeholder="Original text..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
                  Variant B (Test)
                </label>
                <textarea
                  value={formVariantB}
                  onChange={(e) => setFormVariantB(e.target.value)}
                  className="w-full px-3 py-2 bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:border-[hsl(var(--color-accent))] focus:outline-none resize-none"
                  rows={2}
                  placeholder="Alternative text to test..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-[hsl(var(--color-accent))] text-black rounded-xl font-medium hover:bg-[hsl(var(--color-accent-hover))] transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Test"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Detail Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-[hsl(var(--color-border))] flex items-center justify-between sticky top-0 bg-[hsl(var(--color-background-muted))]">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-semibold">Test Details</h2>
                  <StatusBadge status={selectedTest.status} />
                </div>
                <p className="text-sm text-[hsl(var(--color-foreground-subtle))]">
                  {selectedTest.journal_articles?.title || "Unknown Article"}
                </p>
              </div>
              <button
                onClick={() => setSelectedTest(null)}
                className="p-2 text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-subtle))] rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Winner Banner */}
              {selectedTest.winner && (
                <div className="bg-[hsl(var(--color-accent))]/10 border border-[hsl(var(--color-accent))]/20 rounded-xl p-4">
                  <WinnerBadge variant={selectedTest.winner} confidence={selectedTest.confidence} />
                </div>
              )}

              {/* Variants Comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`bg-[hsl(var(--color-background-subtle))] rounded-xl p-4 border ${
                  selectedTest.winner === "a" ? "border-[hsl(var(--color-accent))]" : "border-[hsl(var(--color-border))]"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Variant A (Control)</span>
                    {selectedTest.winner === "a" && (
                      <span className="text-xs text-[hsl(var(--color-accent))]">WINNER</span>
                    )}
                  </div>
                  <p className="text-[hsl(var(--color-foreground))] mb-4">{selectedTest.variant_a}</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xl font-semibold text-[hsl(var(--color-foreground))]">{selectedTest.variant_a_views}</p>
                      <p className="text-xs text-[hsl(var(--color-foreground-subtle))]">Views</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-[hsl(var(--color-foreground))]">{selectedTest.variant_a_clicks}</p>
                      <p className="text-xs text-[hsl(var(--color-foreground-subtle))]">Clicks</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-[hsl(var(--color-accent))]">
                        {calculateCTR(selectedTest.variant_a_clicks, selectedTest.variant_a_views).toFixed(2)}%
                      </p>
                      <p className="text-xs text-[hsl(var(--color-foreground-subtle))]">CTR</p>
                    </div>
                  </div>
                </div>

                <div className={`bg-[hsl(var(--color-background-subtle))] rounded-xl p-4 border ${
                  selectedTest.winner === "b" ? "border-[hsl(var(--color-accent))]" : "border-[hsl(var(--color-border))]"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Variant B (Test)</span>
                    {selectedTest.winner === "b" && (
                      <span className="text-xs text-[hsl(var(--color-accent))]">WINNER</span>
                    )}
                  </div>
                  <p className="text-[hsl(var(--color-foreground))] mb-4">{selectedTest.variant_b}</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xl font-semibold text-[hsl(var(--color-foreground))]">{selectedTest.variant_b_views}</p>
                      <p className="text-xs text-[hsl(var(--color-foreground-subtle))]">Views</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-[hsl(var(--color-foreground))]">{selectedTest.variant_b_clicks}</p>
                      <p className="text-xs text-[hsl(var(--color-foreground-subtle))]">Clicks</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-[hsl(var(--color-accent))]">
                        {calculateCTR(selectedTest.variant_b_clicks, selectedTest.variant_b_views).toFixed(2)}%
                      </p>
                      <p className="text-xs text-[hsl(var(--color-foreground-subtle))]">CTR</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[hsl(var(--color-foreground-subtle))]">Test Type:</span>
                  <span className="text-[hsl(var(--color-foreground))] ml-2 capitalize">{selectedTest.test_name}</span>
                </div>
                <div>
                  <span className="text-[hsl(var(--color-foreground-subtle))]">Started:</span>
                  <span className="text-[hsl(var(--color-foreground))] ml-2">{formatDate(selectedTest.created_at)}</span>
                </div>
                {selectedTest.ended_at && (
                  <div>
                    <span className="text-[hsl(var(--color-foreground-subtle))]">Ended:</span>
                    <span className="text-[hsl(var(--color-foreground))] ml-2">{formatDate(selectedTest.ended_at)}</span>
                  </div>
                )}
                <div>
                  <span className="text-[hsl(var(--color-foreground-subtle))]">Total Impressions:</span>
                  <span className="text-[hsl(var(--color-foreground))] ml-2">
                    {selectedTest.variant_a_views + selectedTest.variant_b_views}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {selectedTest.status === "active" && (
                <div className="flex justify-end gap-3 pt-4 border-t border-[hsl(var(--color-border))]">
                  <button
                    onClick={() => handleCancelTest(selectedTest.id)}
                    className="px-4 py-2 text-red-600 hover:text-red-300 transition-colors"
                  >
                    Cancel Test
                  </button>
                  <button
                    onClick={() => handleEndTest(selectedTest.id)}
                    className="px-4 py-2 bg-[hsl(var(--color-accent))] text-black rounded-xl font-medium hover:bg-[hsl(var(--color-accent-hover))] transition-colors"
                  >
                    End Test & Declare Winner
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
