"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLoader } from "@/components/admin/AdminLoader";

interface Document {
  id: string;
  document_number: string;
  document_type: "proposal" | "sow" | "invoice" | "change_order";
  title: string;
  status: string;
  content_json: Record<string, unknown>;
  lead: { id: string; name: string; email: string; company: string | null } | null;
}

// Field definitions for each document type
const FIELD_DEFINITIONS: Record<string, Array<{ key: string; label: string; type: "text" | "textarea" | "number" | "date" | "currency"; section?: string }>> = {
  proposal: [
    { key: "projectName", label: "Project Name", type: "text", section: "Basic Info" },
    { key: "clientName", label: "Client Name", type: "text", section: "Basic Info" },
    { key: "clientCompany", label: "Client Company", type: "text", section: "Basic Info" },
    { key: "clientEmail", label: "Client Email", type: "text", section: "Basic Info" },
    { key: "date", label: "Date", type: "date", section: "Basic Info" },
    { key: "validUntil", label: "Valid Until", type: "date", section: "Basic Info" },
    { key: "executiveSummary", label: "Executive Summary", type: "textarea", section: "Content" },
    { key: "understanding", label: "Our Understanding", type: "textarea", section: "Content" },
    { key: "approach", label: "Our Approach", type: "textarea", section: "Content" },
    { key: "selectedTier", label: "Selected Tier", type: "text", section: "Pricing" },
    { key: "totalInvestment", label: "Total Investment", type: "currency", section: "Pricing" },
  ],
  sow: [
    { key: "projectName", label: "Project Name", type: "text", section: "Basic Info" },
    { key: "sowNumber", label: "SOW Number", type: "text", section: "Basic Info" },
    { key: "clientName", label: "Client Name", type: "text", section: "Basic Info" },
    { key: "clientCompany", label: "Client Company", type: "text", section: "Basic Info" },
    { key: "effectiveDate", label: "Effective Date", type: "date", section: "Basic Info" },
    { key: "projectDescription", label: "Project Description", type: "textarea", section: "Scope" },
    { key: "totalProjectFee", label: "Total Project Fee", type: "currency", section: "Pricing" },
    { key: "paymentTerms", label: "Payment Terms", type: "text", section: "Pricing" },
  ],
  invoice: [
    { key: "clientName", label: "Client Name", type: "text", section: "Basic Info" },
    { key: "clientCompany", label: "Client Company", type: "text", section: "Basic Info" },
    { key: "clientEmail", label: "Client Email", type: "text", section: "Basic Info" },
    { key: "invoiceDate", label: "Invoice Date", type: "date", section: "Basic Info" },
    { key: "dueDate", label: "Due Date", type: "date", section: "Basic Info" },
    { key: "projectName", label: "Project Name", type: "text", section: "Details" },
    { key: "subtotal", label: "Subtotal", type: "currency", section: "Totals" },
    { key: "taxRate", label: "Tax Rate (%)", type: "number", section: "Totals" },
    { key: "taxAmount", label: "Tax Amount", type: "currency", section: "Totals" },
    { key: "total", label: "Total", type: "currency", section: "Totals" },
    { key: "paymentTerms", label: "Payment Terms", type: "textarea", section: "Payment" },
  ],
  change_order: [
    { key: "projectName", label: "Project Name", type: "text", section: "Basic Info" },
    { key: "changeOrderNumber", label: "Change Order Number", type: "text", section: "Basic Info" },
    { key: "description", label: "Description of Changes", type: "textarea", section: "Details" },
    { key: "additionalCost", label: "Additional Cost", type: "currency", section: "Pricing" },
    { key: "additionalTime", label: "Additional Time (days)", type: "number", section: "Timeline" },
  ],
};

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((current, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split(".");
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...(current[key] as Record<string, unknown> || {}) };
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

function formatCurrencyInput(value: unknown): string {
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "string") {
    return value.replace(/[^0-9.]/g, "");
  }
  return "";
}

export default function EditDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [document, setDocument] = React.useState<Document | null>(null);
  const [content, setContent] = React.useState<Record<string, unknown>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Fetch document
  React.useEffect(() => {
    async function fetchDocument() {
      try {
        const res = await fetch(`/api/admin/documents/${documentId}`);
        if (res.ok) {
          const data = await res.json();
          setDocument(data.document);
          setContent(data.document.content_json || {});
        } else if (res.status === 404) {
          router.push("/admin/documents");
        }
      } catch (err) {
        console.error("Failed to fetch document:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    }
    fetchDocument();
  }, [documentId, router]);

  // Handle field change
  const handleFieldChange = (key: string, value: unknown) => {
    setContent((prev) => setNestedValue(prev, key, value));
    setHasChanges(true);
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_json: content,
          html_content: null, // Clear cached HTML so it regenerates
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setHasChanges(false);

      // Refresh the preview iframe
      const iframe = window.document.querySelector("iframe") as HTMLIFrameElement;
      if (iframe) {
        iframe.src = iframe.src;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Save and continue to document
  const handleSaveAndView = async () => {
    await handleSave();
    if (!error) {
      router.push(`/admin/documents/${documentId}`);
    }
  };

  if (loading) {
    return <AdminLoader message="Loading document..." />;
  }

  if (!document) {
    return null;
  }

  const fields = FIELD_DEFINITIONS[document.document_type] || [];
  const sections = [...new Set(fields.map((f) => f.section || "General"))];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/documents/${documentId}`}
            className="p-2 rounded-lg text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-muted))] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Edit {document.document_number}</h1>
            <p className="text-sm text-[hsl(var(--color-foreground-muted))]">{document.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-yellow-600 bg-yellow-500/10 px-3 py-1 rounded-lg">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-4 py-2 border border-[hsl(var(--color-border))] rounded-xl font-medium hover:bg-[hsl(var(--color-background-muted))] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleSaveAndView}
            disabled={saving}
            className="px-4 py-2 bg-[hsl(var(--color-accent))] text-white rounded-xl font-medium hover:bg-[hsl(var(--color-accent))]/90 transition-colors disabled:opacity-50"
          >
            Save & View
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {/* Editor and Preview */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Editor Panel */}
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[hsl(var(--color-border))]">
            <h2 className="font-medium">Edit Content</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {sections.map((section) => (
              <div key={section}>
                <h3 className="text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-3">
                  {section}
                </h3>
                <div className="space-y-4">
                  {fields
                    .filter((f) => (f.section || "General") === section)
                    .map((field) => {
                      const value = getNestedValue(content, field.key);

                      return (
                        <div key={field.key}>
                          <label className="block text-sm font-medium mb-1.5">
                            {field.label}
                          </label>
                          {field.type === "textarea" ? (
                            <textarea
                              value={(value as string) || ""}
                              onChange={(e) => handleFieldChange(field.key, e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))] resize-none"
                            />
                          ) : field.type === "currency" ? (
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-foreground-muted))]">
                                $
                              </span>
                              <input
                                type="number"
                                value={formatCurrencyInput(value)}
                                onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0)}
                                className="w-full pl-7 pr-3 py-2 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                              />
                            </div>
                          ) : field.type === "number" ? (
                            <input
                              type="number"
                              value={(value as number) || ""}
                              onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                            />
                          ) : field.type === "date" ? (
                            <input
                              type="date"
                              value={(value as string)?.split("T")[0] || ""}
                              onChange={(e) => handleFieldChange(field.key, e.target.value)}
                              className="w-full px-3 py-2 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                            />
                          ) : (
                            <input
                              type="text"
                              value={(value as string) || ""}
                              onChange={(e) => handleFieldChange(field.key, e.target.value)}
                              className="w-full px-3 py-2 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                            />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}

            {/* Raw JSON Editor for advanced users */}
            <div className="pt-4 border-t border-[hsl(var(--color-border))]">
              <details>
                <summary className="text-sm font-medium text-[hsl(var(--color-foreground-muted))] cursor-pointer hover:text-[hsl(var(--color-foreground))]">
                  Advanced: Edit Raw JSON
                </summary>
                <textarea
                  value={JSON.stringify(content, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setContent(parsed);
                      setHasChanges(true);
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  rows={10}
                  className="mt-3 w-full px-3 py-2 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                />
              </details>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--color-border))]">
            <h2 className="font-medium">Preview</h2>
            <button
              onClick={() => {
                const iframe = window.document.querySelector("iframe") as HTMLIFrameElement;
                if (iframe) {
                  iframe.src = iframe.src;
                }
              }}
              className="text-sm text-[hsl(var(--color-accent))] hover:underline"
            >
              Refresh
            </button>
          </div>
          <iframe
            src={`/api/admin/documents/${documentId}/preview`}
            className="flex-1 bg-white"
            title="Document Preview"
          />
        </div>
      </div>
    </div>
  );
}
