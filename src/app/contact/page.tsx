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
          <Section spacing="sm">
            <Container>
              <div className="max-w-3xl">
                {/* Breadcrumb */}
                <nav className="mb-8" aria-label="Breadcrumb">
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
                  <h1 className="font-semibold tracking-tight mb-6">
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
          <Section spacing="md">
            <Container>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                {/* Form */}
                <AnimatedSection className="lg:col-span-2" delay={0.2}>
                  <Suspense fallback={<ContactFormSkeleton />}>
                    <ContactForm />
                  </Suspense>
                </AnimatedSection>

                {/* Sidebar */}
                <div className="flex flex-col gap-8">
                  {/* Email with Copy */}
                  <AnimatedSection delay={0.3} variant="fadeLeft">
                    <div className="p-6 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] relative">
                      {/* Copy button - top right */}
                      <button
                        onClick={copyEmail}
                        className="absolute top-4 right-4 p-2 rounded-md hover:bg-[hsl(var(--color-background-muted))] transition-colors group"
                        aria-label="Copy email address"
                      >
                        {copied ? (
                          <svg
                            className="w-4 h-4 text-[hsl(var(--color-success))]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-[hsl(var(--color-foreground-subtle))] group-hover:text-[hsl(var(--color-foreground))]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                        <span
                          className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded bg-[hsl(var(--color-foreground))] text-[hsl(var(--color-background))] whitespace-nowrap transition-opacity ${copied ? "opacity-100" : "opacity-0"
                            }`}
                        >
                          Copied!
                        </span>
                      </button>

                      <div className="flex items-center gap-2 mb-4">
                        <svg
                          className="w-5 h-5 text-[hsl(var(--color-accent))]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <h3 className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] uppercase tracking-wide">
                          Or email directly
                        </h3>
                      </div>
                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="text-lg font-medium hover:underline underline-offset-4"
                      >
                        {siteConfig.email}
                      </a>
                    </div>
                  </AnimatedSection>

                  {/* Location */}
                  <AnimatedSection delay={0.4} variant="fadeLeft">
                    <div className="p-6 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))]">
                      <div className="flex items-center gap-2 mb-4">
                        <svg
                          className="w-5 h-5 text-[hsl(var(--color-accent))]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <h3 className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] uppercase tracking-wide">
                          Location
                        </h3>
                      </div>
                      <p className="text-[hsl(var(--color-foreground-muted))]">
                        Remote-first
                        <br />
                        Working globally
                      </p>
                    </div>
                  </AnimatedSection>

                  {/* Response Time */}
                  <AnimatedSection delay={0.5} variant="fadeLeft">
                    <div className="p-6 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))]">
                      <div className="flex items-center gap-2 mb-4">
                        <svg
                          className="w-5 h-5 text-[hsl(var(--color-accent))]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <h3 className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] uppercase tracking-wide">
                          Response time
                        </h3>
                      </div>
                      <p className="text-[hsl(var(--color-foreground-muted))]">
                        We typically respond within 1-2 business days.
                      </p>
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
