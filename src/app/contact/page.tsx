"use client";

import * as React from "react";
import { Suspense } from "react";
import { Header, Footer, Container, Section } from "@/components/layout";
import { PageTransition, AnimatedSection, HeroText } from "@/components/ui";
import { ContactForm } from "@/components/forms/contact-form";
import { siteConfig } from "@/lib/constants";

function ContactFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="h-12 bg-[hsl(var(--color-background-muted))] rounded-lg" />
        <div className="h-12 bg-[hsl(var(--color-background-muted))] rounded-lg" />
      </div>
      <div className="h-12 bg-[hsl(var(--color-background-muted))] rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="h-12 bg-[hsl(var(--color-background-muted))] rounded-lg" />
        <div className="h-12 bg-[hsl(var(--color-background-muted))] rounded-lg" />
        <div className="h-12 bg-[hsl(var(--color-background-muted))] rounded-lg" />
      </div>
      <div className="h-32 bg-[hsl(var(--color-background-muted))] rounded-lg" />
      <div className="h-12 w-40 bg-[hsl(var(--color-background-muted))] rounded-lg" />
    </div>
  );
}

export default function ContactPage() {
  const [copied, setCopied] = React.useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  return (
    <>
      <Header />
      <PageTransition>
        <main id="main-content" className="pt-20">
          {/* Hero */}
          <Section spacing="sm" className="pb-8 md:pb-6">
            <Container>
              <div className="max-w-3xl">
                {/* Breadcrumb */}
                <nav className="mb-6 md:mb-4" aria-label="Breadcrumb">
                  <ol className="flex items-center gap-2 text-sm text-[hsl(var(--color-foreground-muted))]">
                    <li>
                      <a href="/" className="hover:text-[hsl(var(--color-foreground))] transition-colors">
                        Home
                      </a>
                    </li>
                    <li>
                      <span className="mx-2">/</span>
                    </li>
                    <li className="text-[hsl(var(--color-foreground))] font-medium">Contact</li>
                  </ol>
                </nav>

                <HeroText>
                  <h1 className="font-semibold tracking-tight mb-4">
                    Start a project
                  </h1>
                </HeroText>
                <HeroText delay={0.1}>
                  <p className="text-xl text-[hsl(var(--color-foreground-muted))] leading-relaxed">
                    We work with founders, startups, and teams who value clarity and
                    long-term thinking. If that sounds like you, let&apos;s talk.
                  </p>
                </HeroText>
              </div>
            </Container>
          </Section>

          {/* Form Section */}
          <Section spacing="md" className="pt-0 pb-16 md:pb-20">
            <Container>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-12">
                {/* Form */}
                <AnimatedSection className="lg:col-span-2" delay={0.2}>
                  <Suspense fallback={<ContactFormSkeleton />}>
                    <ContactForm />
                  </Suspense>
                </AnimatedSection>

                {/* Sidebar */}
                <div className="flex flex-col gap-4">
                  {/* Quick Contact Card */}
                  <AnimatedSection delay={0.3} variant="fadeLeft">
                    <div className="p-5 rounded-2xl bg-[hsl(var(--color-foreground))] text-[hsl(var(--color-background))]">
                      <p className="text-xs uppercase tracking-widest opacity-60 mb-3">
                        Prefer email?
                      </p>
                      <button
                        onClick={copyEmail}
                        className="group flex items-center justify-between w-full"
                        aria-label="Copy email address"
                      >
                        <span className="text-base font-medium group-hover:opacity-80 transition-opacity">
                          {siteConfig.email}
                        </span>
                        <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-all ${copied ? "bg-green-500/20 text-green-400" : "bg-white/10 group-hover:bg-white/20"}`}>
                          {copied ? (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Copied
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </AnimatedSection>

                  {/* Info Pills */}
                  <AnimatedSection delay={0.4} variant="fadeLeft">
                    <div className="flex flex-wrap gap-2">
                      {/* Location Pill */}
                      <div className="group flex items-center gap-2 px-4 py-2.5 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] hover:border-[hsl(var(--color-foreground)/20)] transition-colors cursor-default">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm text-[hsl(var(--color-foreground-muted))]">Sydney, AU</span>
                      </div>

                      {/* Global Pill */}
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] hover:border-[hsl(var(--color-foreground)/20)] transition-colors cursor-default">
                        <svg className="w-3.5 h-3.5 text-[hsl(var(--color-foreground-subtle))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-[hsl(var(--color-foreground-muted))]">Working globally</span>
                      </div>

                      {/* Response Time Pill */}
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] hover:border-[hsl(var(--color-foreground)/20)] transition-colors cursor-default">
                        <svg className="w-3.5 h-3.5 text-[hsl(var(--color-foreground-subtle))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-[hsl(var(--color-foreground-muted))]">Replies in 1 to 2 days</span>
                      </div>
                    </div>
                  </AnimatedSection>
                </div>
              </div>
            </Container>
          </Section>
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
