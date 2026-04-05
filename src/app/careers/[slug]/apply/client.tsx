"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Container, Section } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PageTransition,
  AnimatedSection,
  HeroText,
} from "@/components/ui";
import type { Role, ApplicationQuestion } from "@/lib/careers";
import { supabase } from "@/lib/supabase";

const STEPS = ["Personal", "Questions", "Files", "Review", "Submit"] as const;
const STORAGE_KEY_PREFIX = "craefto_apply_";
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  portfolio_url: string;
  linkedin_url: string;
  github_url: string;
}

interface FileInfo {
  file: File | null;
  url: string;
  filename: string;
}

interface FormErrors {
  [key: string]: string;
}

function getStorageKey(slug: string) {
  return `${STORAGE_KEY_PREFIX}${slug}`;
}

export function ApplicationFormClient({ role }: { role: Role }) {
  const [step, setStep] = React.useState(0);
  const [personal, setPersonal] = React.useState<PersonalInfo>({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    portfolio_url: "",
    linkedin_url: "",
    github_url: "",
  });
  const [answers, setAnswers] = React.useState<Record<string, string | string[]>>({});
  const [resume, setResume] = React.useState<FileInfo>({ file: null, url: "", filename: "" });
  const [coverLetter, setCoverLetter] = React.useState<FileInfo>({ file: null, url: "", filename: "" });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<string | null>(null);

  // Load draft from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(role.slug));
      if (saved) {
        const data = JSON.parse(saved);
        if (data.personal) setPersonal(data.personal);
        if (data.answers) setAnswers(data.answers);
        if (data.step !== undefined) setStep(data.step);
      }
    } catch {
      // ignore
    }
  }, [role.slug]);

  // Save draft to localStorage
  React.useEffect(() => {
    if (submitted) return;
    try {
      localStorage.setItem(
        getStorageKey(role.slug),
        JSON.stringify({ personal, answers, step })
      );
    } catch {
      // ignore
    }
  }, [personal, answers, step, role.slug, submitted]);

  const validateStep = (s: number): boolean => {
    const newErrors: FormErrors = {};

    if (s === 0) {
      if (!personal.full_name.trim()) newErrors.full_name = "Name is required";
      if (!personal.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email))
        newErrors.email = "Invalid email address";
    }

    if (s === 1) {
      for (const q of role.questions) {
        if (!q.required) continue;
        const val = answers[q.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          newErrors[q.id] = "This field is required";
        } else if (typeof val === "string") {
          if (q.minLength && val.length < q.minLength) {
            newErrors[q.id] = `Minimum ${q.minLength} characters`;
          }
          if (q.maxLength && val.length > q.maxLength) {
            newErrors[q.id] = `Maximum ${q.maxLength} characters`;
          }
        }
      }
    }

    if (s === 2) {
      if (!resume.file && !resume.url) newErrors.resume = "Resume is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const goToStep = (s: number) => {
    if (s < step) setStep(s);
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<FileInfo>>,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, [fieldName]: "Only PDF, DOC, and DOCX files are accepted" }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, [fieldName]: "File must be under 10 MB" }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
    setter({ file, url: "", filename: file.name });
  };

  const uploadFile = async (fileInfo: FileInfo): Promise<{ url: string; filename: string } | null> => {
    if (!fileInfo.file) return fileInfo.url ? { url: fileInfo.url, filename: fileInfo.filename } : null;

    const timestamp = Date.now();
    const safeName = fileInfo.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${role.slug}/${timestamp}-${safeName}`;

    const { error } = await supabase.storage
      .from("job-applications")
      .upload(path, fileInfo.file, { cacheControl: "3600", upsert: false });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data: urlData } = supabase.storage
      .from("job-applications")
      .getPublicUrl(path);

    return { url: urlData.publicUrl, filename: fileInfo.file.name };
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      setStep(2);
      return;
    }

    setStep(4); // move to submit step

    try {
      // Upload files
      setUploadProgress("Uploading resume...");
      const resumeResult = await uploadFile(resume);

      let coverLetterResult: { url: string; filename: string } | null = null;
      if (coverLetter.file) {
        setUploadProgress("Uploading cover letter...");
        coverLetterResult = await uploadFile(coverLetter);
      }

      setUploadProgress("Submitting application...");

      const formattedAnswers = role.questions.map((q) => ({
        question_id: q.id,
        question_text: q.label,
        question_type: q.type,
        answer: answers[q.id] || "",
      }));

      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role_slug: role.slug,
          full_name: personal.full_name.trim(),
          email: personal.email.trim(),
          phone: personal.phone.trim() || undefined,
          location: personal.location.trim() || undefined,
          portfolio_url: personal.portfolio_url.trim() || undefined,
          linkedin_url: personal.linkedin_url.trim() || undefined,
          github_url: personal.github_url.trim() || undefined,
          resume_url: resumeResult?.url,
          resume_filename: resumeResult?.filename,
          cover_letter_url: coverLetterResult?.url,
          cover_letter_filename: coverLetterResult?.filename,
          answers: formattedAnswers,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      // Clear draft
      try {
        localStorage.removeItem(getStorageKey(role.slug));
      } catch {
        // ignore
      }

      setSubmitted(true);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Something went wrong. Please try again." });
      setStep(3); // back to review
    } finally {
      setUploadProgress(null);
    }
  };

  return (
    <PageTransition>
      <main id="main-content" className="pt-20">
        <Section spacing="lg">
          <Container>
            {/* Breadcrumb */}
            <nav className="mb-10" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-[hsl(var(--color-foreground-muted))]">
                <li>
                  <Link href="/" className="hover:text-[hsl(var(--color-foreground))] transition-colors">Home</Link>
                </li>
                <li><span className="mx-2">/</span></li>
                <li>
                  <Link href="/careers" className="hover:text-[hsl(var(--color-foreground))] transition-colors">Careers</Link>
                </li>
                <li><span className="mx-2">/</span></li>
                <li>
                  <Link href={`/careers/${role.slug}`} className="hover:text-[hsl(var(--color-foreground))] transition-colors">{role.title}</Link>
                </li>
                <li><span className="mx-2">/</span></li>
                <li className="text-[hsl(var(--color-foreground))] font-medium">Apply</li>
              </ol>
            </nav>

            <HeroText>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="accent">{role.department}</Badge>
                <Badge variant="secondary">{role.location}</Badge>
              </div>
            </HeroText>
            <HeroText delay={0.1}>
              <h1 className="font-semibold tracking-tight text-3xl md:text-4xl mb-2">
                Apply for {role.title}
              </h1>
            </HeroText>
            <HeroText delay={0.2}>
              <p className="text-[hsl(var(--color-foreground-muted))] text-lg max-w-2xl">
                Complete the form below. Your progress is saved automatically.
              </p>
            </HeroText>
          </Container>
        </Section>

        <Section spacing="md">
          <Container size="md">
            {/* Progress bar */}
            {!submitted && (
              <AnimatedSection>
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-3">
                    {STEPS.map((label, i) => (
                      <button
                        key={label}
                        onClick={() => goToStep(i)}
                        className={`text-xs font-medium transition-colors ${
                          i === step
                            ? "text-[hsl(var(--color-accent))]"
                            : i < step
                            ? "text-[hsl(var(--color-foreground))] cursor-pointer hover:text-[hsl(var(--color-accent))]"
                            : "text-[hsl(var(--color-foreground-subtle))] cursor-default"
                        }`}
                        disabled={i > step}
                        aria-label={`Step ${i + 1}: ${label}`}
                      >
                        <span className="hidden sm:inline">{label}</span>
                        <span className="sm:hidden">{i + 1}</span>
                      </button>
                    ))}
                  </div>
                  <div className="h-1 bg-[hsl(var(--color-border))] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[hsl(var(--color-accent))] rounded-full"
                      initial={false}
                      animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  </div>
                  <p className="text-xs text-[hsl(var(--color-foreground-subtle))] mt-2">
                    Step {step + 1} of {STEPS.length}
                  </p>
                </div>
              </AnimatedSection>
            )}

            {/* Form steps */}
            <AnimatePresence mode="wait">
              {step === 0 && !submitted && (
                <StepWrapper key="personal">
                  <StepPersonal
                    personal={personal}
                    setPersonal={setPersonal}
                    errors={errors}
                    setErrors={setErrors}
                  />
                  <StepNav onNext={goNext} />
                </StepWrapper>
              )}

              {step === 1 && !submitted && (
                <StepWrapper key="questions">
                  <StepQuestions
                    questions={role.questions}
                    answers={answers}
                    setAnswers={setAnswers}
                    errors={errors}
                    setErrors={setErrors}
                  />
                  <StepNav onPrev={goPrev} onNext={goNext} />
                </StepWrapper>
              )}

              {step === 2 && !submitted && (
                <StepWrapper key="files">
                  <StepFiles
                    resume={resume}
                    coverLetter={coverLetter}
                    onResumeChange={(e) => handleFileSelect(e, setResume, "resume")}
                    onCoverLetterChange={(e) => handleFileSelect(e, setCoverLetter, "cover_letter")}
                    onRemoveResume={() => setResume({ file: null, url: "", filename: "" })}
                    onRemoveCoverLetter={() => setCoverLetter({ file: null, url: "", filename: "" })}
                    errors={errors}
                  />
                  <StepNav onPrev={goPrev} onNext={goNext} />
                </StepWrapper>
              )}

              {step === 3 && !submitted && (
                <StepWrapper key="review">
                  <StepReview
                    personal={personal}
                    answers={answers}
                    questions={role.questions}
                    resume={resume}
                    coverLetter={coverLetter}
                    onEditStep={setStep}
                  />
                  {errors.submit && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      {errors.submit}
                    </div>
                  )}
                  <StepNav onPrev={goPrev} onSubmit={handleSubmit} />
                </StepWrapper>
              )}

              {step === 4 && !submitted && (
                <StepWrapper key="submitting">
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-[hsl(var(--color-border))]" />
                      <div className="animate-spin absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-[hsl(var(--color-accent))]" />
                    </div>
                    <p className="text-[hsl(var(--color-foreground-muted))] animate-pulse">
                      {uploadProgress || "Submitting..."}
                    </p>
                  </div>
                </StepWrapper>
              )}

              {submitted && (
                <StepWrapper key="success">
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-6">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-semibold mb-3">Application submitted</h2>
                    <p className="text-[hsl(var(--color-foreground-muted))] max-w-md mx-auto mb-2">
                      Thank you for applying to be a <strong>{role.title}</strong> at Craefto.
                    </p>
                    <p className="text-[hsl(var(--color-foreground-subtle))] text-sm max-w-md mx-auto mb-8">
                      We review every application carefully. Expect to hear from us within a week. In the meantime, check out our other open positions.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button asChild>
                        <Link href="/careers">View other roles</Link>
                      </Button>
                      <Button variant="ghost" asChild>
                        <Link href="/">Back to home</Link>
                      </Button>
                    </div>
                  </div>
                </StepWrapper>
              )}
            </AnimatePresence>
          </Container>
        </Section>
      </main>
    </PageTransition>
  );
}

// ── Step wrapper with animation ──

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

// ── Step navigation ──

function StepNav({
  onPrev,
  onNext,
  onSubmit,
}: {
  onPrev?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-[hsl(var(--color-border))]">
      {onPrev ? (
        <Button variant="ghost" onClick={onPrev}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
      ) : (
        <div />
      )}
      {onNext && (
        <Button onClick={onNext}>
          Continue
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      )}
      {onSubmit && (
        <Button variant="accent" onClick={onSubmit}>
          Submit application
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </Button>
      )}
    </div>
  );
}

// ── Step 1: Personal info ──

function StepPersonal({
  personal,
  setPersonal,
  errors,
  setErrors,
}: {
  personal: PersonalInfo;
  setPersonal: React.Dispatch<React.SetStateAction<PersonalInfo>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}) {
  const update = (field: keyof PersonalInfo, value: string) => {
    setPersonal((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold mb-6">Personal information</h2>
      <FormField label="Full name" required error={errors.full_name}>
        <input
          type="text"
          value={personal.full_name}
          onChange={(e) => update("full_name", e.target.value)}
          placeholder="Your full name"
          className={inputClass(errors.full_name)}
          autoFocus
        />
      </FormField>
      <FormField label="Email address" required error={errors.email}>
        <input
          type="email"
          value={personal.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="you@example.com"
          className={inputClass(errors.email)}
        />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Phone">
          <input
            type="tel"
            value={personal.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+61 ..."
            className={inputClass()}
          />
        </FormField>
        <FormField label="City / Country">
          <input
            type="text"
            value={personal.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Sydney, Australia"
            className={inputClass()}
          />
        </FormField>
      </div>
      <FormField label="Portfolio URL">
        <input
          type="url"
          value={personal.portfolio_url}
          onChange={(e) => update("portfolio_url", e.target.value)}
          placeholder="https://yourportfolio.com"
          className={inputClass()}
        />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="LinkedIn">
          <input
            type="url"
            value={personal.linkedin_url}
            onChange={(e) => update("linkedin_url", e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className={inputClass()}
          />
        </FormField>
        <FormField label="GitHub">
          <input
            type="url"
            value={personal.github_url}
            onChange={(e) => update("github_url", e.target.value)}
            placeholder="https://github.com/..."
            className={inputClass()}
          />
        </FormField>
      </div>
    </div>
  );
}

// ── Step 2: Questions ──

function StepQuestions({
  questions,
  answers,
  setAnswers,
  errors,
  setErrors,
}: {
  questions: ApplicationQuestion[];
  answers: Record<string, string | string[]>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string | string[]>>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}) {
  const update = (id: string, value: string | string[]) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    if (errors[id]) setErrors((e) => { const n = { ...e }; delete n[id]; return n; });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">A few questions</h2>
      {questions.map((q) => (
        <FormField key={q.id} label={q.label} required={q.required} helperText={q.helperText} error={errors[q.id]}>
          {q.type === "single-select" && q.options && (
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => update(q.id, opt)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    answers[q.id] === opt
                      ? "bg-[hsl(var(--color-accent))]/20 text-[hsl(var(--color-accent))] border-[hsl(var(--color-accent))]/50"
                      : "bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground-muted))] border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-foreground-subtle))]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.type === "multi-select" && q.options && (
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const selected = Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      const current = (Array.isArray(answers[q.id]) ? answers[q.id] : []) as string[];
                      update(
                        q.id,
                        selected ? current.filter((v) => v !== opt) : [...current, opt]
                      );
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      selected
                        ? "bg-[hsl(var(--color-accent))]/20 text-[hsl(var(--color-accent))] border-[hsl(var(--color-accent))]/50"
                        : "bg-[hsl(var(--color-background-subtle))] text-[hsl(var(--color-foreground-muted))] border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-foreground-subtle))]"
                    }`}
                  >
                    {selected && (
                      <svg className="w-3.5 h-3.5 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "short-text" && (
            <input
              type="text"
              value={(answers[q.id] as string) || ""}
              onChange={(e) => update(q.id, e.target.value)}
              placeholder={q.placeholder}
              className={inputClass(errors[q.id])}
            />
          )}

          {q.type === "long-text" && (
            <div>
              <textarea
                value={(answers[q.id] as string) || ""}
                onChange={(e) => update(q.id, e.target.value)}
                placeholder={q.placeholder}
                rows={5}
                className={`${inputClass(errors[q.id])} resize-y min-h-[140px]`}
              />
              {(q.minLength || q.maxLength) && (
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-[hsl(var(--color-foreground-subtle))]">
                    {q.minLength ? `Min ${q.minLength} chars` : ""}
                  </span>
                  <span
                    className={`text-xs ${
                      q.maxLength && ((answers[q.id] as string) || "").length > q.maxLength
                        ? "text-red-400"
                        : "text-[hsl(var(--color-foreground-subtle))]"
                    }`}
                  >
                    {((answers[q.id] as string) || "").length}
                    {q.maxLength ? ` / ${q.maxLength}` : ""}
                  </span>
                </div>
              )}
            </div>
          )}
        </FormField>
      ))}
    </div>
  );
}

// ── Step 3: Files ──

function StepFiles({
  resume,
  coverLetter,
  onResumeChange,
  onCoverLetterChange,
  onRemoveResume,
  onRemoveCoverLetter,
  errors,
}: {
  resume: FileInfo;
  coverLetter: FileInfo;
  onResumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverLetterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveResume: () => void;
  onRemoveCoverLetter: () => void;
  errors: FormErrors;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Upload your documents</h2>

      <FormField label="Resume" required error={errors.resume}>
        <FileUploadZone
          file={resume}
          onChange={onResumeChange}
          onRemove={onRemoveResume}
          id="resume-upload"
        />
      </FormField>

      <FormField label="Cover letter" helperText="Optional but recommended">
        <FileUploadZone
          file={coverLetter}
          onChange={onCoverLetterChange}
          onRemove={onRemoveCoverLetter}
          id="cover-letter-upload"
        />
      </FormField>

      <p className="text-xs text-[hsl(var(--color-foreground-subtle))]">
        Accepted formats: PDF, DOC, DOCX. Max 10 MB per file.
      </p>
    </div>
  );
}

function FileUploadZone({
  file,
  onChange,
  onRemove,
  id,
}: {
  file: FileInfo;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  id: string;
}) {
  if (file.filename) {
    return (
      <div className="flex items-center gap-3 p-4 bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] rounded-xl">
        <svg className="w-5 h-5 text-[hsl(var(--color-accent))] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="flex-1 text-sm text-[hsl(var(--color-foreground))] truncate">{file.filename}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground))] transition-colors"
          aria-label="Remove file"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-[hsl(var(--color-border))] rounded-xl cursor-pointer hover:border-[hsl(var(--color-accent))]/50 transition-colors"
    >
      <svg className="w-8 h-8 text-[hsl(var(--color-foreground-subtle))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <span className="text-sm text-[hsl(var(--color-foreground-muted))]">
        Click to upload or drag and drop
      </span>
      <input
        id={id}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={onChange}
        className="hidden"
      />
    </label>
  );
}

// ── Step 4: Review ──

function StepReview({
  personal,
  answers,
  questions,
  resume,
  coverLetter,
  onEditStep,
}: {
  personal: PersonalInfo;
  answers: Record<string, string | string[]>;
  questions: ApplicationQuestion[];
  resume: FileInfo;
  coverLetter: FileInfo;
  onEditStep: (step: number) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Review your application</h2>

      {/* Personal */}
      <ReviewSection title="Personal information" onEdit={() => onEditStep(0)}>
        <ReviewRow label="Name" value={personal.full_name} />
        <ReviewRow label="Email" value={personal.email} />
        {personal.phone && <ReviewRow label="Phone" value={personal.phone} />}
        {personal.location && <ReviewRow label="Location" value={personal.location} />}
        {personal.portfolio_url && <ReviewRow label="Portfolio" value={personal.portfolio_url} />}
        {personal.linkedin_url && <ReviewRow label="LinkedIn" value={personal.linkedin_url} />}
        {personal.github_url && <ReviewRow label="GitHub" value={personal.github_url} />}
      </ReviewSection>

      {/* Questions */}
      <ReviewSection title="Qualifying answers" onEdit={() => onEditStep(1)}>
        {questions.map((q) => {
          const val = answers[q.id];
          const display = Array.isArray(val) ? val.join(", ") : val || "--";
          return <ReviewRow key={q.id} label={q.label} value={display} />;
        })}
      </ReviewSection>

      {/* Files */}
      <ReviewSection title="Documents" onEdit={() => onEditStep(2)}>
        <ReviewRow label="Resume" value={resume.filename || "Not uploaded"} />
        <ReviewRow label="Cover letter" value={coverLetter.filename || "Not uploaded"} />
      </ReviewSection>
    </div>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-foreground-subtle))] uppercase tracking-wider">
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-[hsl(var(--color-accent))] hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[hsl(var(--color-foreground-subtle))]">{label}</p>
      <p className="text-sm text-[hsl(var(--color-foreground))] whitespace-pre-wrap break-words">{value}</p>
    </div>
  );
}

// ── Shared utilities ──

function FormField({
  label,
  required,
  helperText,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1.5">
        {label}
        {required && <span className="text-[hsl(var(--color-accent))] ml-1">*</span>}
      </label>
      {helperText && (
        <p className="text-xs text-[hsl(var(--color-foreground-subtle))] mb-2">{helperText}</p>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-400 mt-1.5" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(error?: string) {
  return `w-full px-4 py-3 bg-[hsl(var(--color-background-subtle))] border ${
    error
      ? "border-red-500/50 focus:ring-red-500/50"
      : "border-[hsl(var(--color-border))] focus:ring-[hsl(var(--color-ring))]"
  } rounded-xl text-[hsl(var(--color-foreground))] placeholder-[hsl(var(--color-foreground-subtle))] focus:outline-none focus:ring-2 transition-all`;
}
