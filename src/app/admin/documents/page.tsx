"use client";

import * as React from "react";
import Link from "next/link";
import { AdminLoader } from "@/components/admin/AdminLoader";

interface DocumentSignature {
  id: string;
  signer_role: string;
  signer_name: string;
  signer_email: string;
  status: string;
  signed_at: string | null;
}

interface Document {
  id: string;
  document_number: string;
  document_type: "proposal" | "sow" | "invoice" | "change_order";
  title: string;
  status: string;
  lead: { id: string; name: string; email: string; company: string | null } | null;
  signatures: DocumentSignature[];
  created_at: string;
  sent_at: string | null;
  signed_at: string | null;
}

interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-600 border-gray-500/30",
  pending_review: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  pending_signature: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  signed: "bg-green-500/20 text-green-600 border-green-500/30",
  expired: "bg-red-500/20 text-red-600 border-red-500/30",
  archived: "bg-gray-500/20 text-gray-500 border-gray-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  pending_signature: "Awaiting Signature",
  signed: "Signed",
  expired: "Expired",
  archived: "Archived",
};

const TYPE_LABELS: Record<string, string> = {
  proposal: "Proposal",
  sow: "Contract",
  invoice: "Invoice",
  change_order: "Change Order",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  proposal: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  sow: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  invoice: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  change_order: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
};

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getSignatureProgress(signatures: DocumentSignature[]) {
  if (!signatures || signatures.length === 0) return null;
  const signed = signatures.filter((s) => s.status === "signed").length;
  return { signed, total: signatures.length };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  const fetchDocuments = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await fetch(`/api/admin/documents?${params.toString()}`);
      if (res.ok) {
        const data: DocumentListResponse = await res.json();
        setDocuments(data.documents);
        setTotalPages(data.total_pages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, search, page]);

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Stats
  const stats = React.useMemo(() => {
    return {
      total: total,
      pending: documents.filter((d) => d.status === "pending_signature").length,
      signed: documents.filter((d) => d.status === "signed").length,
      drafts: documents.filter((d) => d.status === "draft").length,
    };
  }, [documents, total]);

  if (loading && documents.length === 0) {
    return <AdminLoader message="Loading documents..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Documents</h1>
          <p className="text-[hsl(var(--color-foreground-muted))]">{total} total documents</p>
        </div>
        <Link
          href="/admin/documents/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[hsl(var(--color-accent))] text-white rounded-xl font-medium hover:bg-[hsl(var(--color-accent))]/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Document
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4">
          <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Total</p>
          <p className="text-2xl font-semibold mt-1">{stats.total}</p>
        </div>
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4">
          <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Drafts</p>
          <p className="text-2xl font-semibold mt-1">{stats.drafts}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-sm text-blue-600">Pending Signature</p>
          <p className="text-2xl font-semibold mt-1 text-blue-600">{stats.pending}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-sm text-green-600">Signed</p>
          <p className="text-2xl font-semibold mt-1 text-green-600">{stats.signed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-foreground-subtle))]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] placeholder-[hsl(var(--color-foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2.5 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
        >
          <option value="all">All Types</option>
          <option value="proposal">Proposals</option>
          <option value="sow">Contracts</option>
          <option value="invoice">Invoices</option>
          <option value="change_order">Change Orders</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2.5 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending_review">Pending Review</option>
          <option value="pending_signature">Awaiting Signature</option>
          <option value="signed">Signed</option>
          <option value="expired">Expired</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Documents Table */}
      <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--color-border))]">
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Document</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Client</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Type</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Signatures</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Created</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-[hsl(var(--color-foreground-muted))]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--color-border))]">
            {documents.length > 0 ? (
              documents.map((doc) => {
                const sigProgress = getSignatureProgress(doc.signatures);
                return (
                  <tr key={doc.id} className="hover:bg-[hsl(var(--color-background-subtle))] transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/documents/${doc.id}`} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[hsl(var(--color-accent))]/10 flex items-center justify-center text-[hsl(var(--color-accent))]">
                          {TYPE_ICONS[doc.document_type]}
                        </div>
                        <div>
                          <p className="font-medium text-[hsl(var(--color-foreground))] hover:text-[hsl(var(--color-accent))] transition-colors">
                            {doc.document_number}
                          </p>
                          <p className="text-sm text-[hsl(var(--color-foreground-subtle))] truncate max-w-[200px]">{doc.title}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {doc.lead ? (
                        <Link href={`/admin/leads/${doc.lead.id}`} className="text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-accent))] transition-colors">
                          {doc.lead.company || doc.lead.name}
                        </Link>
                      ) : (
                        <span className="text-[hsl(var(--color-foreground-subtle))]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[hsl(var(--color-foreground-muted))]">{TYPE_LABELS[doc.document_type]}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${STATUS_COLORS[doc.status] || STATUS_COLORS.draft}`}>
                        {STATUS_LABELS[doc.status] || doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {sigProgress ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-[hsl(var(--color-background-subtle))] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all"
                              style={{ width: `${(sigProgress.signed / sigProgress.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-[hsl(var(--color-foreground-muted))]">
                            {sigProgress.signed}/{sigProgress.total}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[hsl(var(--color-foreground-subtle))]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[hsl(var(--color-foreground-subtle))] text-sm">{formatDate(doc.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/documents/${doc.id}`}
                          className="p-2 rounded-lg text-[hsl(var(--color-foreground-muted))] hover:bg-[hsl(var(--color-background-subtle))] hover:text-[hsl(var(--color-foreground))] transition-colors"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <a
                          href={`/api/admin/documents/${doc.id}/pdf?download=true`}
                          className="p-2 rounded-lg text-[hsl(var(--color-foreground-muted))] hover:bg-[hsl(var(--color-background-subtle))] hover:text-[hsl(var(--color-foreground))] transition-colors"
                          title="Download PDF"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[hsl(var(--color-foreground-subtle))]">
                  {search || typeFilter !== "all" || statusFilter !== "all" ? "No documents match your filters" : "No documents yet. Create your first document!"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[hsl(var(--color-foreground-muted))]">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-[hsl(var(--color-border))] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(var(--color-background-muted))] transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-[hsl(var(--color-border))] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(var(--color-background-muted))] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
