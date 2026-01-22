"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLoader } from "@/components/admin/AdminLoader";

interface DocumentSignature {
  id: string;
  signer_role: string;
  signer_name: string;
  signer_email: string;
  status: string;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
}

interface DocumentActivity {
  id: string;
  activity_type: string;
  actor: string;
  description: string;
  created_at: string;
}

interface Document {
  id: string;
  document_number: string;
  document_type: "proposal" | "sow" | "invoice" | "change_order";
  title: string;
  status: string;
  content_json: Record<string, unknown>;
  html_content: string | null;
  lead: { id: string; name: string; email: string; company: string | null } | null;
  signatures: DocumentSignature[];
  activities: DocumentActivity[];
  created_at: string;
  sent_at: string | null;
  expires_at: string | null;
  signed_at: string | null;
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
  proposal: "Project Proposal",
  sow: "Statement of Work",
  invoice: "Invoice",
  change_order: "Change Order",
};

const SIGNATURE_STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-500/20 text-gray-600",
  sent: "bg-blue-500/20 text-blue-600",
  viewed: "bg-yellow-500/20 text-yellow-600",
  signed: "bg-green-500/20 text-green-600",
};

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatActivityDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [document, setDocument] = React.useState<Document | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [showSendModal, setShowSendModal] = React.useState(false);
  const [signerEmail, setSignerEmail] = React.useState("");
  const [signerName, setSignerName] = React.useState("");
  const [sendError, setSendError] = React.useState<string | null>(null);

  // Fetch document
  React.useEffect(() => {
    async function fetchDocument() {
      try {
        const res = await fetch(`/api/admin/documents/${documentId}`);
        if (res.ok) {
          const data = await res.json();
          setDocument(data.document);
          // Pre-fill signer info from lead
          if (data.document.lead) {
            setSignerEmail(data.document.lead.email);
            setSignerName(data.document.lead.name);
          }
        } else if (res.status === 404) {
          router.push("/admin/documents");
        }
      } catch (error) {
        console.error("Failed to fetch document:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDocument();
  }, [documentId, router]);

  // Send for signature
  const handleSendForSignature = async () => {
    if (!signerEmail || !signerName) {
      setSendError("Please provide signer name and email");
      return;
    }

    setSending(true);
    setSendError(null);

    try {
      const res = await fetch(`/api/admin/documents/${documentId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signers: [
            { email: signerEmail, name: signerName, role: "client" },
          ],
          message: `Please review and sign: ${document?.title}`,
          expires_in_days: 14,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send document");
      }

      // Refresh document
      const refreshRes = await fetch(`/api/admin/documents/${documentId}`);
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setDocument(data.document);
      }

      setShowSendModal(false);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  // Archive document
  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this document?")) return;

    try {
      const res = await fetch(`/api/admin/documents/${documentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/admin/documents");
      }
    } catch (error) {
      console.error("Failed to archive document:", error);
    }
  };

  if (loading) {
    return <AdminLoader message="Loading document..." />;
  }

  if (!document) {
    return null;
  }

  const canSend = ["draft", "pending_review"].includes(document.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin/documents"
              className="p-1 rounded-lg text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-muted))] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${STATUS_COLORS[document.status] || STATUS_COLORS.draft}`}>
              {STATUS_LABELS[document.status] || document.status}
            </span>
          </div>
          <h1 className="text-2xl font-semibold mb-1">{document.document_number}</h1>
          <p className="text-[hsl(var(--color-foreground-muted))]">{document.title}</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/admin/documents/${documentId}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[hsl(var(--color-border))] rounded-xl font-medium hover:bg-[hsl(var(--color-background-muted))] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </a>
          <a
            href={`/api/admin/documents/${documentId}/pdf?download=true`}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[hsl(var(--color-border))] rounded-xl font-medium hover:bg-[hsl(var(--color-background-muted))] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
          {canSend && (
            <button
              onClick={() => setShowSendModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[hsl(var(--color-accent))] text-white rounded-xl font-medium hover:bg-[hsl(var(--color-accent))]/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send for Signature
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Preview */}
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--color-border))]">
              <h2 className="text-lg font-medium">Document Preview</h2>
              <a
                href={`/api/admin/documents/${document.id}/preview`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[hsl(var(--color-accent))] hover:underline"
              >
                Open in new tab
              </a>
            </div>
            <iframe
              src={`/api/admin/documents/${document.id}/preview`}
              className="w-full h-[600px] bg-white"
              title="Document Preview"
            />
          </div>

          {/* Document Details */}
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Document Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Type</p>
                <p className="font-medium">{TYPE_LABELS[document.document_type]}</p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Created</p>
                <p className="font-medium">{formatDate(document.created_at)}</p>
              </div>
              {document.sent_at && (
                <div>
                  <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Sent</p>
                  <p className="font-medium">{formatDate(document.sent_at)}</p>
                </div>
              )}
              {document.expires_at && (
                <div>
                  <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Expires</p>
                  <p className="font-medium">{formatDate(document.expires_at)}</p>
                </div>
              )}
              {document.signed_at && (
                <div>
                  <p className="text-sm text-[hsl(var(--color-foreground-muted))]">Signed</p>
                  <p className="font-medium text-green-600">{formatDate(document.signed_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Signatures */}
          {document.signatures && document.signatures.length > 0 && (
            <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Signatures</h2>
              <div className="space-y-3">
                {document.signatures.map((sig) => (
                  <div
                    key={sig.id}
                    className="flex items-center justify-between p-4 bg-[hsl(var(--color-background))] rounded-xl border border-[hsl(var(--color-border))]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-accent))]/20 flex items-center justify-center text-[hsl(var(--color-accent))] font-medium">
                        {sig.signer_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{sig.signer_name}</p>
                        <p className="text-sm text-[hsl(var(--color-foreground-muted))]">{sig.signer_email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${SIGNATURE_STATUS_COLORS[sig.status]}`}>
                        {sig.status === "signed" ? "Signed" : sig.status === "viewed" ? "Viewed" : sig.status === "sent" ? "Sent" : "Pending"}
                      </span>
                      {sig.signed_at && (
                        <p className="text-xs text-[hsl(var(--color-foreground-muted))] mt-1">{formatDate(sig.signed_at)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Log */}
          {document.activities && document.activities.length > 0 && (
            <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Activity</h2>
              <div className="space-y-4">
                {document.activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--color-background-subtle))] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[hsl(var(--color-foreground-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[hsl(var(--color-foreground))]">{activity.description}</p>
                      <p className="text-xs text-[hsl(var(--color-foreground-muted))] mt-1">
                        {activity.actor} &middot; {formatActivityDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          {document.lead && (
            <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Client</h2>
              <Link
                href={`/admin/leads/${document.lead.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-accent))]/20 flex items-center justify-center text-[hsl(var(--color-accent))] font-medium text-lg">
                  {document.lead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium group-hover:text-[hsl(var(--color-accent))] transition-colors">{document.lead.name}</p>
                  <p className="text-sm text-[hsl(var(--color-foreground-muted))]">{document.lead.company || document.lead.email}</p>
                </div>
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Actions</h2>
            <div className="space-y-2">
              {canSend && (
                <button
                  onClick={() => setShowSendModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-[hsl(var(--color-background-subtle))] transition-colors"
                >
                  <svg className="w-5 h-5 text-[hsl(var(--color-accent))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send for Signature</span>
                </button>
              )}
              <a
                href={`/api/admin/documents/${documentId}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-[hsl(var(--color-background-subtle))] transition-colors"
              >
                <svg className="w-5 h-5 text-[hsl(var(--color-foreground-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Preview PDF</span>
              </a>
              <button
                onClick={handleArchive}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-500/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>Archive Document</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(var(--color-background))] rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Send for Signature</h2>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-2 rounded-lg hover:bg-[hsl(var(--color-background-muted))] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {sendError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm">
                {sendError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Signer Name</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                  placeholder="Client name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Signer Email</label>
                <input
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                  placeholder="client@example.com"
                />
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-600">
                  An email will be sent to the signer with a secure link to view and sign the document.
                  The signature request will expire in 14 days.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 px-4 py-2.5 border border-[hsl(var(--color-border))] rounded-xl font-medium hover:bg-[hsl(var(--color-background-muted))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendForSignature}
                  disabled={sending || !signerEmail || !signerName}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[hsl(var(--color-accent))] text-white rounded-xl font-medium hover:bg-[hsl(var(--color-accent))]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
