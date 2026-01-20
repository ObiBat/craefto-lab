"use client";

import * as React from "react";

const STATS = [
  { value: "8", label: "Template Systems", icon: "document" },
  { value: "45+", label: "Email Templates", icon: "mail" },
  { value: "60%", label: "Time Saved", icon: "clock" },
  { value: "100", label: "Point Scoring", icon: "check" },
];

const JOURNEY_STEPS = [
  "Lead Response",
  "Discovery",
  "Qualification",
  "Proposal",
  "Contract",
  "Onboarding",
];

const TEMPLATES = [
  {
    title: "Lead Response Templates",
    subtitle: "12 templates",
    description: "Ready-to-use email templates for responding to hot leads, warm inquiries, and follow-ups.",
    tags: ["Hot Leads", "Warm Leads", "Follow-ups"],
    href: "/client-hub/01-response-templates.html",
    color: "sage",
  },
  {
    title: "Discovery Call Framework",
    subtitle: "60-minute structure",
    description: "Structured discovery call guide with 45+ questions, scripts, and a pre-call checklist.",
    tags: ["Questions", "Scripts", "Checklist"],
    href: "/client-hub/02-discovery-framework.html",
    color: "sage",
  },
  {
    title: "Intake Questionnaire",
    subtitle: "17 questions",
    description: "Comprehensive client intake form covering business context, project scope, and success criteria.",
    tags: ["Business Info", "Project Scope", "Goals"],
    href: "/client-hub/03-intake-questionnaire.html",
    color: "sage",
  },
  {
    title: "Proposal Template",
    subtitle: "7 sections",
    description: "Professional proposal with tiered pricing, timeline visualization, and payment schedules.",
    tags: ["Pricing Tiers", "Timeline", "Scope"],
    href: "/client-hub/04-proposal-template.html",
    color: "green",
  },
  {
    title: "SOW & Contract Templates",
    subtitle: "3 documents",
    description: "Statement of Work, Terms & Conditions, and Change Order templates with legal clauses.",
    tags: ["SOW", "Terms", "Change Orders"],
    href: "/client-hub/05-sow-contract.html",
    color: "green",
  },
  {
    title: "Onboarding Sequence",
    subtitle: "5 emails + checklist",
    description: "Welcome emails, kickoff meeting agenda, and client onboarding checklist.",
    tags: ["Welcome", "Kickoff", "Setup"],
    href: "/client-hub/06-onboarding-sequence.html",
    color: "green",
  },
  {
    title: "Qualification Scorecard",
    subtitle: "100-point system",
    description: "Interactive scoring tool to assess lead quality across budget, timeline, and fit criteria.",
    tags: ["Budget", "Timeline", "Fit"],
    href: "/client-hub/07-qualification-scorecard.html",
    color: "yellow",
  },
  {
    title: "Red Flags & Scripts",
    subtitle: "Warning guide",
    description: "Identify warning signs early and handle difficult situations with proven scripts.",
    tags: ["Red Flags", "Scripts", "Decline"],
    href: "/client-hub/08-red-flags-scripts.html",
    color: "red",
  },
];

function StatIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "document":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "mail":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "clock":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "check":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

function getColorClasses(color: string) {
  switch (color) {
    case "sage":
      return {
        bg: "bg-[hsl(var(--color-accent))]/10",
        text: "text-[hsl(var(--color-accent))]",
      };
    case "green":
      return {
        bg: "bg-green-500/10",
        text: "text-green-600",
      };
    case "yellow":
      return {
        bg: "bg-yellow-500/10",
        text: "text-yellow-600",
      };
    case "red":
      return {
        bg: "bg-red-500/10",
        text: "text-red-600",
      };
    default:
      return {
        bg: "bg-[hsl(var(--color-accent))]/10",
        text: "text-[hsl(var(--color-accent))]",
      };
  }
}

export default function ClientHubPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-1">Client Operations Hub</h1>
        <p className="text-[hsl(var(--color-foreground-muted))]">
          Templates and tools for client acquisition, qualification, and onboarding
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, index) => (
          <div
            key={index}
            className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-4 text-center"
          >
            <div className="w-10 h-10 mx-auto mb-3 bg-[hsl(var(--color-accent))]/10 rounded-xl flex items-center justify-center text-[hsl(var(--color-accent))]">
              <StatIcon icon={stat.icon} />
            </div>
            <p className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">{stat.value}</p>
            <p className="text-sm text-[hsl(var(--color-foreground-muted))]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Client Journey */}
      <div className="bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Client Journey</h2>
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {JOURNEY_STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center min-w-[100px]">
                <div className="w-10 h-10 rounded-full border-2 border-[hsl(var(--color-accent))] bg-[hsl(var(--color-background))] flex items-center justify-center text-[hsl(var(--color-accent))] font-semibold text-sm">
                  {index + 1}
                </div>
                <span className="mt-2 text-sm font-medium text-[hsl(var(--color-foreground))]">{step}</span>
              </div>
              {index < JOURNEY_STEPS.length - 1 && (
                <div className="w-8 h-0.5 bg-[hsl(var(--color-border))] mx-2 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Templates & Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((template) => {
            const colors = getColorClasses(template.color);
            return (
              <a
                key={template.title}
                href={template.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden hover:border-[hsl(var(--color-accent))]/50 transition-all hover:shadow-md"
              >
                <div className="p-4 border-b border-[hsl(var(--color-border))]">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}>
                      <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-[hsl(var(--color-foreground))] group-hover:text-[hsl(var(--color-accent))] transition-colors">
                        {template.title}
                      </h3>
                      <span className="text-xs text-[hsl(var(--color-foreground-subtle))]">{template.subtitle}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-[hsl(var(--color-foreground-muted))] mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground-subtle))] rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-3 bg-[hsl(var(--color-background-subtle))] flex items-center justify-between">
                  <span className="text-sm font-medium text-[hsl(var(--color-accent))] flex items-center gap-1">
                    View template
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <svg className="w-4 h-4 text-[hsl(var(--color-foreground-subtle))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Full Hub Link */}
      <div className="text-center pt-4">
        <a
          href="/client-hub/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] transition-colors"
        >
          <span>Open full Client Hub</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
