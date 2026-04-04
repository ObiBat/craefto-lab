"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AdminLoader } from "@/components/admin/AdminLoader";

interface Document {
  id: string;
  document_number: string;
  document_type: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  content_json: Record<string, unknown>;
  lead: {
    id: string;
    name: string;
    email: string | null;
    company: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  sent: { label: "Sent", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  pending_signature: { label: "Sent", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  viewed: { label: "Viewed", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  signed: { label: "Accepted", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  accepted: { label: "Accepted", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  declined: { label: "Rejected", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  expired: { label: "Expired", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

const TYPE_LABELS: Record<string, string> = {
  proposal: "Proposal",
  sow: "Statement of Work",
  change_order: "Change Order",
  invoice: "Invoice",
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] as const } },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-AU", { month: "short", day: "numeric" });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProposalsPage() {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"all" | "proposal" | "sow" | "change_order">("all");

  React.useEffect(() => {
    async function fetchDocuments() {
      try {
        const params = new URLSearchParams({ limit: "50" });
        // Exclude invoices - this page is for proposals/sows
        if (filter !== "all") {
          params.set("type", filter);
        }
        const res = await fetch(`/api/admin/documents?${params}`);
        if (res.ok) {
          const data = await res.json();
          let docs = data.documents || [];
          // If showing all, filter out invoices
          if (filter === "all") {
            docs = docs.filter((d: Document) => d.document_type !== "invoice");
          }
          setDocuments(docs);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, [filter]);

  if (loading) return <AdminLoader message="Loading proposals..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Proposals</h1>
          <p className="text-[hsl(var(--color-foreground-muted))]">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-lg border border-[hsl(var(--color-border))] overflow-hidden">
            {(["all", "proposal", "sow", "change_order"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-foreground))]"
                    : "text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))]"
                }`}
              >
                {f === "all" ? "All" : f === "sow" ? "SOW" : f === "change_order" ? "Change Orders" : "Proposals"}
              </button>
            ))}
          </div>
          <Link
            href="/admin/documents/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--color-accent))]/10 text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-accent))]/20 transition-colors border border-[hsl(var(--color-accent))]/20 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Proposal
          </Link>
        </div>
      </div>

      {/* Cards */}
      {documents.length === 0 ? (
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-12 text-center">
          <svg className="w-10 h-10 mx-auto mb-3 text-[hsl(var(--color-foreground-subtle))] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-[hsl(var(--color-foreground-muted))]">No proposals yet</p>
          <Link href="/admin/documents/new" className="mt-3 text-sm text-[hsl(var(--color-accent))] hover:underline inline-block">
            Create your first proposal
          </Link>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {documents.map((doc) => {
            const statusConf = STATUS_CONFIG[doc.status] || STATUS_CONFIG.draft;
            const typeName = TYPE_LABELS[doc.document_type] || doc.document_type;
            const amount = (doc.content_json as { total?: number; amount?: number })?.total ||
              (doc.content_json as { total?: number; amount?: number })?.amount || 0;

            return (
              <motion.div key={doc.id} variants={fadeUp}>
                <Link
                  href={`/admin/documents/${doc.id}`}
                  className="block bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl hover:border-[hsl(var(--color-border-strong))] transition-colors"
                >
                  <div className="p-5">
                    {/* Type badge + status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--color-foreground-subtle))]">
                        {typeName}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${statusConf.color}`}>
                        {statusConf.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-medium text-[hsl(var(--color-foreground))] mb-1 line-clamp-2">
                      {doc.title}
                    </h3>

                    {/* Client */}
                    <p className="text-sm text-[hsl(var(--color-foreground-muted))] mb-3">
                      {doc.lead?.company || doc.lead?.name || "No client"}
                    </p>

                    {/* Footer: amount + date */}
                    <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--color-border))]">
                      {amount > 0 ? (
                        <span className="text-sm font-mono font-medium text-[hsl(var(--color-foreground))]">
                          {formatCurrency(amount)}
                        </span>
                      ) : (
                        <span className="text-xs text-[hsl(var(--color-foreground-subtle))]">
                          {doc.document_number}
                        </span>
                      )}
                      <span className="text-xs text-[hsl(var(--color-foreground-subtle))]">
                        {formatRelativeDate(doc.updated_at || doc.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
