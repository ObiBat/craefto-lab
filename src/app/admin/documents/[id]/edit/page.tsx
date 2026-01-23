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

// Human-readable labels for content keys
const KEY_LABELS: Record<string, string> = {
  projectName: "Project Name",
  clientCompany: "Client Company",
  clientName: "Client Name",
  clientEmail: "Client Email",
  clientAddress: "Client Address",
  clientABN: "Client ABN",
  date: "Date",
  validUntil: "Valid Until",
  effectiveDate: "Effective Date",
  estimatedCompletion: "Estimated Completion",
  executiveSummary: "Executive Summary",
  understanding: "Our Understanding",
  problemStatement: "Problem Statement",
  successDefinition: "Success Definition",
  approach: "Our Approach",
  projectOverview: "Project Overview",
  projectDuration: "Project Duration",
  sowNumber: "SOW Number",
  selectedTier: "Selected Tier",
  totalInvestment: "Total Investment",
  revisionRounds: "Revision Rounds",
  feedbackDays: "Feedback Days",
  extraRevisionRate: "Extra Revision Rate",
  primaryContact: "Primary Contact",
  contentDeliveryDays: "Content Delivery Days",
  invoiceNumber: "Invoice Number",
  issueDate: "Issue Date",
  dueDate: "Due Date",
  paymentTerms: "Payment Terms",
  providerCompany: "Provider Company",
  providerAddress: "Provider Address",
  providerABN: "Provider ABN",
  subtotal: "Subtotal",
  taxRate: "Tax Rate (%)",
  taxAmount: "Tax Amount",
  total: "Total",
  currency: "Currency",
  milestoneDescription: "Milestone Description",
  notes: "Notes",
  paymentInstructions: "Payment Instructions",
  changeOrderNumber: "Change Order Number",
  description: "Description",
  requestedBy: "Requested By",
  requestDate: "Request Date",
  requestMethod: "Request Method",
  scopeImpact: "Scope Impact",
  timelineImpact: "Timeline Impact",
  budgetImpact: "Budget Impact",
  newTimeline: "New Timeline",
  newCompletionDate: "New Completion Date",
};

// Fields that should use textarea
const TEXTAREA_KEYS = new Set([
  "executiveSummary", "understanding", "approach", "problemStatement",
  "successDefinition", "projectOverview", "description", "scopeImpact",
  "notes", "paymentInstructions", "paymentTerms",
]);

// Fields that are currency
const CURRENCY_KEYS = new Set([
  "totalInvestment", "budgetImpact", "subtotal", "taxAmount", "total",
  "extraRevisionRate",
]);

// Fields that are dates
const DATE_KEYS = new Set([
  "date", "validUntil", "effectiveDate", "estimatedCompletion",
  "issueDate", "dueDate", "requestDate", "newCompletionDate",
]);

// Fields that are numbers
const NUMBER_KEYS = new Set([
  "revisionRounds", "feedbackDays", "contentDeliveryDays", "taxRate",
]);

// Section ordering for known fields
const SECTION_MAP: Record<string, string> = {
  projectName: "Basic Info",
  clientCompany: "Basic Info",
  clientName: "Basic Info",
  clientEmail: "Basic Info",
  clientAddress: "Basic Info",
  clientABN: "Basic Info",
  date: "Basic Info",
  validUntil: "Basic Info",
  effectiveDate: "Basic Info",
  estimatedCompletion: "Basic Info",
  projectDuration: "Basic Info",
  sowNumber: "Basic Info",
  invoiceNumber: "Basic Info",
  issueDate: "Basic Info",
  dueDate: "Basic Info",
  changeOrderNumber: "Basic Info",
  executiveSummary: "Content",
  understanding: "Content",
  problemStatement: "Content",
  successDefinition: "Content",
  approach: "Content",
  projectOverview: "Content",
  description: "Content",
  selectedTier: "Pricing",
  totalInvestment: "Pricing",
  subtotal: "Pricing",
  taxRate: "Pricing",
  taxAmount: "Pricing",
  total: "Pricing",
  currency: "Pricing",
  budgetImpact: "Pricing",
  paymentTerms: "Payment",
  notes: "Notes",
  paymentInstructions: "Payment",
  providerCompany: "Provider Info",
  providerAddress: "Provider Info",
  providerABN: "Provider Info",
  revisionRounds: "Terms",
  feedbackDays: "Terms",
  extraRevisionRate: "Terms",
  primaryContact: "Terms",
  contentDeliveryDays: "Terms",
  requestedBy: "Change Details",
  requestDate: "Change Details",
  requestMethod: "Change Details",
  scopeImpact: "Impact",
  timelineImpact: "Impact",
  newTimeline: "Impact",
  newCompletionDate: "Impact",
  milestoneDescription: "Reference",
};

function getLabel(key: string): string {
  if (KEY_LABELS[key]) return KEY_LABELS[key];
  // Convert camelCase to Title Case
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
}

function getFieldType(key: string): "textarea" | "currency" | "date" | "number" | "text" {
  if (TEXTAREA_KEYS.has(key)) return "textarea";
  if (CURRENCY_KEYS.has(key)) return "currency";
  if (DATE_KEYS.has(key)) return "date";
  if (NUMBER_KEYS.has(key)) return "number";
  return "text";
}

// ============================================
// ARRAY EDITORS
// ============================================

function StringArrayEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const updated = [...items];
              updated[index] = e.target.value;
              onChange(updated);
            }}
            className="flex-1 px-3 py-2 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
          />
          <button
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            className="px-2 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Remove"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="text-sm text-[hsl(var(--color-accent))] hover:underline"
      >
        + Add item
      </button>
    </div>
  );
}

function TimelineEditor({
  phases,
  onChange,
}: {
  phases: Array<{ name: string; duration: string; color: string; description?: string }>;
  onChange: (phases: Array<{ name: string; duration: string; color: string; description?: string }>) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Timeline Phases</label>
      {phases.map((phase, index) => (
        <div key={index} className="p-3 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[hsl(var(--color-foreground-muted))]">Phase {index + 1}</span>
            <button
              onClick={() => onChange(phases.filter((_, i) => i !== index))}
              className="text-red-500 hover:bg-red-500/10 rounded p-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={phase.name}
              onChange={(e) => {
                const updated = [...phases];
                updated[index] = { ...phase, name: e.target.value };
                onChange(updated);
              }}
              placeholder="Phase name"
              className="px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
            />
            <input
              type="text"
              value={phase.duration}
              onChange={(e) => {
                const updated = [...phases];
                updated[index] = { ...phase, duration: e.target.value };
                onChange(updated);
              }}
              placeholder="Duration (e.g., 2 weeks)"
              className="px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
            />
          </div>
          <textarea
            value={phase.description || ""}
            onChange={(e) => {
              const updated = [...phases];
              updated[index] = { ...phase, description: e.target.value };
              onChange(updated);
            }}
            placeholder="Description"
            rows={2}
            className="w-full px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))] resize-none"
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-[hsl(var(--color-foreground-muted))]">Color:</label>
            <input
              type="color"
              value={phase.color}
              onChange={(e) => {
                const updated = [...phases];
                updated[index] = { ...phase, color: e.target.value };
                onChange(updated);
              }}
              className="w-8 h-6 rounded border border-[hsl(var(--color-border))] cursor-pointer"
            />
          </div>
        </div>
      ))}
      <button
        onClick={() => onChange([...phases, { name: "", duration: "", color: "#3B82F6", description: "" }])}
        className="text-sm text-[hsl(var(--color-accent))] hover:underline"
      >
        + Add phase
      </button>
    </div>
  );
}

function ScopeEditor({
  items,
  onChange,
}: {
  items: Array<{ deliverable: string; description: string; included: boolean }>;
  onChange: (items: Array<{ deliverable: string; description: string; included: boolean }>) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Scope & Deliverables</label>
      {items.map((item, index) => (
        <div key={index} className="p-3 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg space-y-2">
          <div className="flex justify-between items-start">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.included}
                onChange={(e) => {
                  const updated = [...items];
                  updated[index] = { ...item, included: e.target.checked };
                  onChange(updated);
                }}
                className="rounded"
              />
              <span className="text-xs font-medium text-[hsl(var(--color-foreground-muted))]">Included</span>
            </label>
            <button
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="text-red-500 hover:bg-red-500/10 rounded p-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            value={item.deliverable}
            onChange={(e) => {
              const updated = [...items];
              updated[index] = { ...item, deliverable: e.target.value };
              onChange(updated);
            }}
            placeholder="Deliverable name"
            className="w-full px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
          />
          <input
            type="text"
            value={item.description}
            onChange={(e) => {
              const updated = [...items];
              updated[index] = { ...item, description: e.target.value };
              onChange(updated);
            }}
            placeholder="Description"
            className="w-full px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
          />
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { deliverable: "", description: "", included: true }])}
        className="text-sm text-[hsl(var(--color-accent))] hover:underline"
      >
        + Add deliverable
      </button>
    </div>
  );
}

function PricingTiersEditor({
  tiers,
  onChange,
}: {
  tiers: Array<{ name: string; price: number; duration: string; features: string[]; recommended: boolean }>;
  onChange: (tiers: Array<{ name: string; price: number; duration: string; features: string[]; recommended: boolean }>) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Pricing Tiers</label>
      {tiers.map((tier, index) => (
        <div key={index} className={`p-3 border rounded-lg space-y-2 ${tier.recommended ? "bg-[hsl(var(--color-accent))]/5 border-[hsl(var(--color-accent))]/30" : "bg-[hsl(var(--color-background))] border-[hsl(var(--color-border))]"}`}>
          <div className="flex justify-between items-start">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tier.recommended}
                onChange={(e) => {
                  const updated = [...tiers];
                  updated[index] = { ...tier, recommended: e.target.checked };
                  onChange(updated);
                }}
                className="rounded"
              />
              <span className="text-xs font-medium text-[hsl(var(--color-foreground-muted))]">Recommended</span>
            </label>
            <button
              onClick={() => onChange(tiers.filter((_, i) => i !== index))}
              className="text-red-500 hover:bg-red-500/10 rounded p-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={tier.name}
              onChange={(e) => {
                const updated = [...tiers];
                updated[index] = { ...tier, name: e.target.value };
                onChange(updated);
              }}
              placeholder="Tier name"
              className="px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
            />
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[hsl(var(--color-foreground-muted))] text-sm">$</span>
              <input
                type="number"
                value={tier.price}
                onChange={(e) => {
                  const updated = [...tiers];
                  updated[index] = { ...tier, price: parseFloat(e.target.value) || 0 };
                  onChange(updated);
                }}
                className="w-full pl-6 pr-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
              />
            </div>
            <input
              type="text"
              value={tier.duration}
              onChange={(e) => {
                const updated = [...tiers];
                updated[index] = { ...tier, duration: e.target.value };
                onChange(updated);
              }}
              placeholder="Duration"
              className="px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-[hsl(var(--color-foreground-muted))]">Features:</span>
            {tier.features.map((feature, fi) => (
              <div key={fi} className="flex gap-1">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => {
                    const updated = [...tiers];
                    const features = [...tier.features];
                    features[fi] = e.target.value;
                    updated[index] = { ...tier, features };
                    onChange(updated);
                  }}
                  className="flex-1 px-2 py-1 border border-[hsl(var(--color-border))] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
                />
                <button
                  onClick={() => {
                    const updated = [...tiers];
                    updated[index] = { ...tier, features: tier.features.filter((_, i) => i !== fi) };
                    onChange(updated);
                  }}
                  className="text-red-400 hover:text-red-600 px-1"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const updated = [...tiers];
                updated[index] = { ...tier, features: [...tier.features, ""] };
                onChange(updated);
              }}
              className="text-xs text-[hsl(var(--color-accent))] hover:underline"
            >
              + Add feature
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={() => onChange([...tiers, { name: "", price: 0, duration: "", features: [""], recommended: false }])}
        className="text-sm text-[hsl(var(--color-accent))] hover:underline"
      >
        + Add tier
      </button>
    </div>
  );
}

function PaymentScheduleEditor({
  schedule,
  onChange,
}: {
  schedule: Array<{ description: string; percentage: number; amount: number; dueOn?: string }>;
  onChange: (schedule: Array<{ description: string; percentage: number; amount: number; dueOn?: string }>) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Payment Schedule</label>
      {schedule.map((item, index) => (
        <div key={index} className="p-3 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[hsl(var(--color-foreground-muted))]">Milestone {index + 1}</span>
            <button
              onClick={() => onChange(schedule.filter((_, i) => i !== index))}
              className="text-red-500 hover:bg-red-500/10 rounded p-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            value={item.description}
            onChange={(e) => {
              const updated = [...schedule];
              updated[index] = { ...item, description: e.target.value };
              onChange(updated);
            }}
            placeholder="Description (e.g., Project Kickoff)"
            className="w-full px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-[hsl(var(--color-foreground-muted))]">Percentage</label>
              <div className="relative">
                <input
                  type="number"
                  value={item.percentage}
                  onChange={(e) => {
                    const updated = [...schedule];
                    updated[index] = { ...item, percentage: parseFloat(e.target.value) || 0 };
                    onChange(updated);
                  }}
                  className="w-full px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--color-foreground-muted))]">%</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-[hsl(var(--color-foreground-muted))]">Amount</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--color-foreground-muted))]">$</span>
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => {
                    const updated = [...schedule];
                    updated[index] = { ...item, amount: parseFloat(e.target.value) || 0 };
                    onChange(updated);
                  }}
                  className="w-full pl-5 pr-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[hsl(var(--color-foreground-muted))]">Due On</label>
              <input
                type="text"
                value={item.dueOn || ""}
                onChange={(e) => {
                  const updated = [...schedule];
                  updated[index] = { ...item, dueOn: e.target.value };
                  onChange(updated);
                }}
                placeholder="e.g., signing"
                className="w-full px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={() => onChange([...schedule, { description: "", percentage: 0, amount: 0, dueOn: "" }])}
        className="text-sm text-[hsl(var(--color-accent))] hover:underline"
      >
        + Add milestone
      </button>
    </div>
  );
}

function SOWPhasesEditor({
  phases,
  onChange,
}: {
  phases: Array<{ name: string; number: number; deliverables: string[]; duration?: string }>;
  onChange: (phases: Array<{ name: string; number: number; deliverables: string[]; duration?: string }>) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Project Phases</label>
      {phases.map((phase, index) => (
        <div key={index} className="p-3 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[hsl(var(--color-foreground-muted))]">Phase {phase.number}</span>
            <button
              onClick={() => onChange(phases.filter((_, i) => i !== index))}
              className="text-red-500 hover:bg-red-500/10 rounded p-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={phase.name}
              onChange={(e) => {
                const updated = [...phases];
                updated[index] = { ...phase, name: e.target.value };
                onChange(updated);
              }}
              placeholder="Phase name"
              className="px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
            />
            <input
              type="text"
              value={phase.duration || ""}
              onChange={(e) => {
                const updated = [...phases];
                updated[index] = { ...phase, duration: e.target.value };
                onChange(updated);
              }}
              placeholder="Duration"
              className="px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-[hsl(var(--color-foreground-muted))]">Deliverables:</span>
            {phase.deliverables.map((d, di) => (
              <div key={di} className="flex gap-1">
                <input
                  type="text"
                  value={d}
                  onChange={(e) => {
                    const updated = [...phases];
                    const deliverables = [...phase.deliverables];
                    deliverables[di] = e.target.value;
                    updated[index] = { ...phase, deliverables };
                    onChange(updated);
                  }}
                  className="flex-1 px-2 py-1 border border-[hsl(var(--color-border))] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
                />
                <button
                  onClick={() => {
                    const updated = [...phases];
                    updated[index] = { ...phase, deliverables: phase.deliverables.filter((_, i) => i !== di) };
                    onChange(updated);
                  }}
                  className="text-red-400 hover:text-red-600 px-1"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const updated = [...phases];
                updated[index] = { ...phase, deliverables: [...phase.deliverables, ""] };
                onChange(updated);
              }}
              className="text-xs text-[hsl(var(--color-accent))] hover:underline"
            >
              + Add deliverable
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={() => onChange([...phases, { name: "", number: phases.length + 1, deliverables: [""], duration: "" }])}
        className="text-sm text-[hsl(var(--color-accent))] hover:underline"
      >
        + Add phase
      </button>
    </div>
  );
}

function LineItemsEditor({
  items,
  onChange,
}: {
  items: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;
  onChange: (items: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Line Items</label>
      {items.map((item, index) => (
        <div key={index} className="p-3 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[hsl(var(--color-foreground-muted))]">Item {index + 1}</span>
            <button
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="text-red-500 hover:bg-red-500/10 rounded p-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            value={item.description}
            onChange={(e) => {
              const updated = [...items];
              updated[index] = { ...item, description: e.target.value };
              onChange(updated);
            }}
            placeholder="Description"
            className="w-full px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-[hsl(var(--color-foreground-muted))]">Qty</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  const qty = parseFloat(e.target.value) || 0;
                  const updated = [...items];
                  updated[index] = { ...item, quantity: qty, amount: qty * item.unitPrice };
                  onChange(updated);
                }}
                className="w-full px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
              />
            </div>
            <div>
              <label className="text-xs text-[hsl(var(--color-foreground-muted))]">Unit Price</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--color-foreground-muted))]">$</span>
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    const updated = [...items];
                    updated[index] = { ...item, unitPrice: price, amount: item.quantity * price };
                    onChange(updated);
                  }}
                  className="w-full pl-5 pr-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[hsl(var(--color-foreground-muted))]">Amount</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--color-foreground-muted))]">$</span>
                <input
                  type="number"
                  value={item.amount}
                  readOnly
                  className="w-full pl-5 pr-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm bg-[hsl(var(--color-background-muted))] text-[hsl(var(--color-foreground-muted))]"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { description: "", quantity: 1, unitPrice: 0, amount: 0 }])}
        className="text-sm text-[hsl(var(--color-accent))] hover:underline"
      >
        + Add line item
      </button>
    </div>
  );
}

function CaseStudiesEditor({
  studies,
  onChange,
}: {
  studies: Array<{ name: string; industry?: string; result: string; url?: string }>;
  onChange: (studies: Array<{ name: string; industry?: string; result: string; url?: string }>) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Case Studies</label>
      {studies.map((study, index) => (
        <div key={index} className="p-3 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[hsl(var(--color-foreground-muted))]">Case Study {index + 1}</span>
            <button
              onClick={() => onChange(studies.filter((_, i) => i !== index))}
              className="text-red-500 hover:bg-red-500/10 rounded p-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={study.name}
              onChange={(e) => {
                const updated = [...studies];
                updated[index] = { ...study, name: e.target.value };
                onChange(updated);
              }}
              placeholder="Client/Project name"
              className="px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
            />
            <input
              type="text"
              value={study.industry || ""}
              onChange={(e) => {
                const updated = [...studies];
                updated[index] = { ...study, industry: e.target.value };
                onChange(updated);
              }}
              placeholder="Industry"
              className="px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
            />
          </div>
          <input
            type="text"
            value={study.result}
            onChange={(e) => {
              const updated = [...studies];
              updated[index] = { ...study, result: e.target.value };
              onChange(updated);
            }}
            placeholder="Key result"
            className="w-full px-2 py-1.5 border border-[hsl(var(--color-border))] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-ring))]"
          />
        </div>
      ))}
      <button
        onClick={() => onChange([...studies, { name: "", result: "", industry: "" }])}
        className="text-sm text-[hsl(var(--color-accent))] hover:underline"
      >
        + Add case study
      </button>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

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
  const [previewKey, setPreviewKey] = React.useState(0);

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
    setContent((prev) => ({ ...prev, [key]: value }));
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

      // Force preview refresh with cache-busting
      setPreviewKey((k) => k + 1);
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

  // Categorize fields from the actual content
  const scalarFields: Array<{ key: string; section: string }> = [];
  const arrayFields: Array<{ key: string; type: string }> = [];

  // Known complex array field types
  const COMPLEX_ARRAYS = new Set([
    "timeline", "scope", "pricingTiers", "paymentSchedule",
    "phases", "lineItems", "caseStudies", "milestones",
  ]);
  const STRING_ARRAYS = new Set([
    "keyOutcomes", "exclusions", "nextSteps", "differentiators",
    "clientResponsibilities", "additionalDeliverables",
  ]);

  for (const key of Object.keys(content)) {
    const value = content[key];

    if (COMPLEX_ARRAYS.has(key) || STRING_ARRAYS.has(key)) {
      arrayFields.push({ key, type: COMPLEX_ARRAYS.has(key) ? "complex" : "string" });
    } else if (Array.isArray(value)) {
      // Unknown arrays - treat as string arrays
      arrayFields.push({ key, type: "string" });
    } else if (typeof value === "object" && value !== null) {
      // Nested objects - skip providerBankDetails for now, show as fields
      if (key === "providerBankDetails") {
        const bankDetails = value as Record<string, string>;
        for (const subKey of Object.keys(bankDetails)) {
          scalarFields.push({ key: `providerBankDetails.${subKey}`, section: "Provider Info" });
        }
      }
      // Skip other complex objects
    } else {
      const section = SECTION_MAP[key] || "Other";
      scalarFields.push({ key, section });
    }
  }

  // Group scalar fields by section
  const sections: Record<string, string[]> = {};
  for (const { key, section } of scalarFields) {
    if (!sections[section]) sections[section] = [];
    sections[section].push(key);
  }

  // Define section order
  const sectionOrder = [
    "Basic Info", "Content", "Pricing", "Payment",
    "Provider Info", "Terms", "Change Details", "Impact",
    "Reference", "Notes", "Other",
  ];
  const orderedSections = sectionOrder.filter((s) => sections[s]);

  // Helper to get nested value
  const getValue = (key: string): unknown => {
    if (key.includes(".")) {
      const [parent, child] = key.split(".");
      const obj = content[parent] as Record<string, unknown> | undefined;
      return obj?.[child];
    }
    return content[key];
  };

  // Helper to set nested value
  const setValue = (key: string, value: unknown) => {
    if (key.includes(".")) {
      const [parent, child] = key.split(".");
      const existing = (content[parent] as Record<string, unknown>) || {};
      handleFieldChange(parent, { ...existing, [child]: value });
    } else {
      handleFieldChange(key, value);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Editor Panel */}
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-[hsl(var(--color-border))] flex items-center justify-between">
            <h2 className="font-medium text-sm">Edit Content</h2>
            <span className="text-xs text-[hsl(var(--color-foreground-muted))]">
              {Object.keys(content).length} fields
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Scalar fields by section */}
            {orderedSections.map((section) => (
              <div key={section}>
                <h3 className="text-xs font-semibold text-[hsl(var(--color-foreground-muted))] uppercase tracking-wider mb-3">
                  {section}
                </h3>
                <div className="space-y-3">
                  {sections[section].map((key) => {
                    const value = getValue(key);
                    const fieldType = getFieldType(key.includes(".") ? key.split(".")[1] : key);
                    const label = getLabel(key.includes(".") ? key.split(".")[1] : key);

                    return (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-1">
                          {label}
                        </label>
                        {fieldType === "textarea" ? (
                          <textarea
                            value={(value as string) || ""}
                            onChange={(e) => setValue(key, e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))] resize-y"
                          />
                        ) : fieldType === "currency" ? (
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-foreground-muted))]">$</span>
                            <input
                              type="number"
                              value={typeof value === "number" ? value : (typeof value === "string" ? value.replace(/[^0-9.]/g, "") : "")}
                              onChange={(e) => setValue(key, parseFloat(e.target.value) || 0)}
                              className="w-full pl-7 pr-3 py-2 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                            />
                          </div>
                        ) : fieldType === "number" ? (
                          <input
                            type="number"
                            value={typeof value === "number" ? value : ""}
                            onChange={(e) => setValue(key, parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                          />
                        ) : fieldType === "date" ? (
                          <input
                            type="date"
                            value={(value as string)?.split("T")[0] || ""}
                            onChange={(e) => setValue(key, e.target.value)}
                            className="w-full px-3 py-2 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                          />
                        ) : (
                          <input
                            type="text"
                            value={(value as string) || ""}
                            onChange={(e) => setValue(key, e.target.value)}
                            className="w-full px-3 py-2 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Array fields */}
            {arrayFields.length > 0 && (
              <div className="pt-4 border-t border-[hsl(var(--color-border))]">
                <h3 className="text-xs font-semibold text-[hsl(var(--color-foreground-muted))] uppercase tracking-wider mb-3">
                  Lists & Collections
                </h3>
                <div className="space-y-5">
                  {arrayFields.map(({ key, type }) => {
                    const value = content[key];
                    const items = Array.isArray(value) ? value : [];

                    if (type === "string" || (type === "complex" && items.length > 0 && typeof items[0] === "string")) {
                      return (
                        <StringArrayEditor
                          key={key}
                          label={getLabel(key)}
                          items={items as string[]}
                          onChange={(newItems) => handleFieldChange(key, newItems)}
                        />
                      );
                    }

                    if (key === "timeline") {
                      return (
                        <TimelineEditor
                          key={key}
                          phases={items as Array<{ name: string; duration: string; color: string; description?: string }>}
                          onChange={(newPhases) => handleFieldChange(key, newPhases)}
                        />
                      );
                    }

                    if (key === "scope") {
                      return (
                        <ScopeEditor
                          key={key}
                          items={items as Array<{ deliverable: string; description: string; included: boolean }>}
                          onChange={(newItems) => handleFieldChange(key, newItems)}
                        />
                      );
                    }

                    if (key === "pricingTiers") {
                      return (
                        <PricingTiersEditor
                          key={key}
                          tiers={items as Array<{ name: string; price: number; duration: string; features: string[]; recommended: boolean }>}
                          onChange={(newTiers) => handleFieldChange(key, newTiers)}
                        />
                      );
                    }

                    if (key === "paymentSchedule") {
                      return (
                        <PaymentScheduleEditor
                          key={key}
                          schedule={items as Array<{ description: string; percentage: number; amount: number; dueOn?: string }>}
                          onChange={(newSchedule) => handleFieldChange(key, newSchedule)}
                        />
                      );
                    }

                    if (key === "phases") {
                      return (
                        <SOWPhasesEditor
                          key={key}
                          phases={items as Array<{ name: string; number: number; deliverables: string[]; duration?: string }>}
                          onChange={(newPhases) => handleFieldChange(key, newPhases)}
                        />
                      );
                    }

                    if (key === "lineItems") {
                      return (
                        <LineItemsEditor
                          key={key}
                          items={items as Array<{ description: string; quantity: number; unitPrice: number; amount: number }>}
                          onChange={(newItems) => handleFieldChange(key, newItems)}
                        />
                      );
                    }

                    if (key === "caseStudies") {
                      return (
                        <CaseStudiesEditor
                          key={key}
                          studies={items as Array<{ name: string; industry?: string; result: string; url?: string }>}
                          onChange={(newStudies) => handleFieldChange(key, newStudies)}
                        />
                      );
                    }

                    // Fallback: render as string array
                    return (
                      <StringArrayEditor
                        key={key}
                        label={getLabel(key)}
                        items={items.map((i) => (typeof i === "string" ? i : JSON.stringify(i)))}
                        onChange={(newItems) => handleFieldChange(key, newItems)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

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
                  rows={15}
                  className="mt-3 w-full px-3 py-2 bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                />
              </details>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(var(--color-border))]">
            <h2 className="font-medium text-sm">Preview</h2>
            <button
              onClick={() => setPreviewKey((k) => k + 1)}
              className="text-sm text-[hsl(var(--color-accent))] hover:underline"
            >
              Refresh
            </button>
          </div>
          <iframe
            key={previewKey}
            src={`/api/admin/documents/${documentId}/preview?t=${Date.now()}`}
            className="flex-1 bg-white"
            title="Document Preview"
          />
        </div>
      </div>
    </div>
  );
}
