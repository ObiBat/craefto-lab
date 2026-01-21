"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AdminLoader } from "@/components/admin/AdminLoader";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service_interest: string | null;
  budget_range: string | null;
  timeline: string | null;
  message: string | null;
  score: number;
}

type DocumentType = "proposal" | "sow" | "invoice";

const DOCUMENT_TYPES: { value: DocumentType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "proposal",
    label: "Project Proposal",
    description: "Present project scope, approach, timeline, and pricing to potential clients",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    value: "sow",
    label: "Statement of Work",
    description: "Formal contract with detailed deliverables, milestones, and terms",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    value: "invoice",
    label: "Invoice",
    description: "Generate an invoice for milestone payments or completed work",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const STEPS = ["Select Lead", "Choose Type", "Preview & Edit", "Create"];

export default function NewDocumentPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Form state
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [documentType, setDocumentType] = React.useState<DocumentType | null>(null);
  const [generatedContent, setGeneratedContent] = React.useState<Record<string, unknown> | null>(null);
  const [generatedHtml, setGeneratedHtml] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  // Fetch leads on mount
  React.useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch("/api/admin/leads");
        if (res.ok) {
          const data = await res.json();
          setLeads(data.leads || []);
        }
      } catch (err) {
        console.error("Failed to fetch leads:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  // Filter leads by search term
  const filteredLeads = React.useMemo(() => {
    if (!searchTerm) return leads;
    const term = searchTerm.toLowerCase();
    return leads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        (lead.company && lead.company.toLowerCase().includes(term))
    );
  }, [leads, searchTerm]);

  // Generate document when moving to step 3
  const handleGenerateDocument = React.useCallback(async () => {
    if (!selectedLead || !documentType) return;

    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: selectedLead.id,
          document_type: documentType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate document");
      }

      const data = await res.json();
      setGeneratedContent(data.content);
      setGeneratedHtml(data.html || "");

      // Navigate to the document detail page
      router.push(`/admin/documents/${data.document.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setGenerating(false);
    }
  }, [selectedLead, documentType, router]);

  // Step navigation
  const canProceed = React.useMemo(() => {
    switch (step) {
      case 0:
        return selectedLead !== null;
      case 1:
        return documentType !== null;
      case 2:
        return true;
      default:
        return false;
    }
  }, [step, selectedLead, documentType]);

  const handleNext = () => {
    if (step === 2) {
      handleGenerateDocument();
    } else if (canProceed) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  if (loading) {
    return <AdminLoader message="Loading..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Create New Document</h1>
        <p className="text-[hsl(var(--color-foreground-muted))]">
          Generate a professional document from your lead data
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          {STEPS.map((stepName, index) => (
            <React.Fragment key={stepName}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    index < step
                      ? "bg-green-500 text-white"
                      : index === step
                      ? "bg-[hsl(var(--color-accent))] text-white"
                      : "bg-[hsl(var(--color-background-muted))] text-[hsl(var(--color-foreground-muted))] border border-[hsl(var(--color-border))]"
                  }`}
                >
                  {index < step ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    index <= step ? "text-[hsl(var(--color-foreground))]" : "text-[hsl(var(--color-foreground-muted))]"
                  }`}
                >
                  {stepName}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px ${
                    index < step ? "bg-green-500" : "bg-[hsl(var(--color-border))]"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
        {/* Step 1: Select Lead */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-1">Select a Lead</h2>
              <p className="text-sm text-[hsl(var(--color-foreground-muted))]">
                Choose the client this document is for
              </p>
            </div>

            {/* Search */}
            <div className="relative">
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
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] placeholder-[hsl(var(--color-foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
              />
            </div>

            {/* Lead List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      selectedLead?.id === lead.id
                        ? "border-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent))]/5"
                        : "border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-foreground-muted))] bg-[hsl(var(--color-background))]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-accent))]/20 flex items-center justify-center text-[hsl(var(--color-accent))] font-medium">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[hsl(var(--color-foreground))]">{lead.name}</p>
                      <p className="text-sm text-[hsl(var(--color-foreground-muted))] truncate">
                        {lead.company || lead.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[hsl(var(--color-foreground-muted))]">{lead.budget_range || "—"}</p>
                      <p className="text-xs text-[hsl(var(--color-foreground-subtle))]">
                        Score: {lead.score}
                      </p>
                    </div>
                    {selectedLead?.id === lead.id && (
                      <svg className="w-5 h-5 text-[hsl(var(--color-accent))]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-[hsl(var(--color-foreground-muted))]">
                  {searchTerm ? "No leads match your search" : "No leads found"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Choose Document Type */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-1">Choose Document Type</h2>
              <p className="text-sm text-[hsl(var(--color-foreground-muted))]">
                Select the type of document to generate for {selectedLead?.name}
              </p>
            </div>

            <div className="grid gap-4">
              {DOCUMENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setDocumentType(type.value)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                    documentType === type.value
                      ? "border-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent))]/5"
                      : "border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-foreground-muted))] bg-[hsl(var(--color-background))]"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      documentType === type.value
                        ? "bg-[hsl(var(--color-accent))] text-white"
                        : "bg-[hsl(var(--color-background-muted))] text-[hsl(var(--color-foreground-muted))]"
                    }`}
                  >
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[hsl(var(--color-foreground))]">{type.label}</p>
                    <p className="text-sm text-[hsl(var(--color-foreground-muted))] mt-1">
                      {type.description}
                    </p>
                  </div>
                  {documentType === type.value && (
                    <svg className="w-5 h-5 text-[hsl(var(--color-accent))] mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Preview & Confirm */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-1">Review & Generate</h2>
              <p className="text-sm text-[hsl(var(--color-foreground-muted))]">
                Confirm the details and generate your document
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600">
                {error}
              </div>
            )}

            {/* Summary */}
            <div className="space-y-4 p-4 bg-[hsl(var(--color-background))] rounded-xl border border-[hsl(var(--color-border))]">
              <div className="flex items-center gap-4 pb-4 border-b border-[hsl(var(--color-border))]">
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-accent))]/20 flex items-center justify-center text-[hsl(var(--color-accent))] font-medium text-lg">
                  {selectedLead?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-[hsl(var(--color-foreground))]">{selectedLead?.name}</p>
                  <p className="text-sm text-[hsl(var(--color-foreground-muted))]">
                    {selectedLead?.company || selectedLead?.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[hsl(var(--color-foreground-muted))]">Document Type</p>
                  <p className="font-medium text-[hsl(var(--color-foreground))]">
                    {DOCUMENT_TYPES.find((t) => t.value === documentType)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-[hsl(var(--color-foreground-muted))]">Service Interest</p>
                  <p className="font-medium text-[hsl(var(--color-foreground))]">
                    {selectedLead?.service_interest || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-[hsl(var(--color-foreground-muted))]">Budget Range</p>
                  <p className="font-medium text-[hsl(var(--color-foreground))]">
                    {selectedLead?.budget_range || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-[hsl(var(--color-foreground-muted))]">Timeline</p>
                  <p className="font-medium text-[hsl(var(--color-foreground))]">
                    {selectedLead?.timeline || "Not specified"}
                  </p>
                </div>
              </div>

              {selectedLead?.message && (
                <div className="pt-4 border-t border-[hsl(var(--color-border))]">
                  <p className="text-[hsl(var(--color-foreground-muted))] text-sm mb-2">Project Description</p>
                  <p className="text-sm text-[hsl(var(--color-foreground))]">{selectedLead.message}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-blue-600">What happens next?</p>
                  <p className="text-sm text-blue-600/80 mt-1">
                    Your document will be generated using the Client Hub template with auto-filled data.
                    You can review and edit the content before sending it for signatures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="px-4 py-2.5 rounded-xl text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-muted))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed || generating}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[hsl(var(--color-accent))] text-white rounded-xl font-medium hover:bg-[hsl(var(--color-accent))]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </>
          ) : step === 2 ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Document
            </>
          ) : (
            <>
              Continue
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
