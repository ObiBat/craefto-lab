"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  company: z.string().optional(),
  projectType: z.string().min(1, "Please select a project type"),
  budget: z.string().min(1, "Please select a budget range"),
  timeline: z.string().min(1, "Please select a timeline"),
  message: z.string().min(20, "Please tell us more about your project (at least 20 characters)"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    // Simulate form submission
    // In production, you'd send this to your backend or email service
    console.log("Form submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    reset();
  };

  if (isSubmitted) {
    return (
      <div className="p-8 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background-muted))] text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-success-subtle))] flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[hsl(var(--color-success))]"
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
          </div>
          <h3 className="text-xl font-semibold">Message sent</h3>
          <p className="text-[hsl(var(--color-foreground-muted))]">
            Thanks for reaching out. We&apos;ll be in touch soon.
          </p>
          <Button
            variant="secondary"
            onClick={() => setIsSubmitted(false)}
            className="mt-2"
          >
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-[hsl(var(--color-foreground))]"
          >
            Name <span className="text-[hsl(var(--color-error))]">*</span>
          </label>
          <Input
            id="name"
            placeholder="Your name"
            error={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-[hsl(var(--color-error))]">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-[hsl(var(--color-foreground))]"
          >
            Email <span className="text-[hsl(var(--color-error))]">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            error={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-[hsl(var(--color-error))]">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* Company */}
      <div className="space-y-2">
        <label
          htmlFor="company"
          className="text-sm font-medium text-[hsl(var(--color-foreground))]"
        >
          Company
        </label>
        <Input
          id="company"
          placeholder="Your company (optional)"
          {...register("company")}
        />
      </div>

      {/* Project Type, Budget, Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label
            htmlFor="projectType"
            className="text-sm font-medium text-[hsl(var(--color-foreground))]"
          >
            Project type <span className="text-[hsl(var(--color-error))]">*</span>
          </label>
          <Select
            id="projectType"
            error={!!errors.projectType}
            {...register("projectType")}
          >
            <option value="">Select one</option>
            <option value="brand">Brand Identity</option>
            <option value="web">Web Design & Dev</option>
            <option value="saas">SaaS / Product</option>
            <option value="ai">AI / Automation</option>
            <option value="other">Not sure yet</option>
          </Select>
          {errors.projectType && (
            <p className="text-sm text-[hsl(var(--color-error))]">
              {errors.projectType.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="budget"
            className="text-sm font-medium text-[hsl(var(--color-foreground))]"
          >
            Budget range <span className="text-[hsl(var(--color-error))]">*</span>
          </label>
          <Select id="budget" error={!!errors.budget} {...register("budget")}>
            <option value="">Select one</option>
            <option value="10-25k">$10k to $25k</option>
            <option value="25-50k">$25k to $50k</option>
            <option value="50-100k">$50k to $100k</option>
            <option value="100k+">$100k+</option>
            <option value="discuss">Let&apos;s discuss</option>
          </Select>
          {errors.budget && (
            <p className="text-sm text-[hsl(var(--color-error))]">
              {errors.budget.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="timeline"
            className="text-sm font-medium text-[hsl(var(--color-foreground))]"
          >
            Timeline <span className="text-[hsl(var(--color-error))]">*</span>
          </label>
          <Select
            id="timeline"
            error={!!errors.timeline}
            {...register("timeline")}
          >
            <option value="">Select one</option>
            <option value="asap">ASAP</option>
            <option value="1-3months">1-3 months</option>
            <option value="3-6months">3-6 months</option>
            <option value="flexible">Flexible</option>
          </Select>
          {errors.timeline && (
            <p className="text-sm text-[hsl(var(--color-error))]">
              {errors.timeline.message}
            </p>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label
          htmlFor="message"
          className="text-sm font-medium text-[hsl(var(--color-foreground))]"
        >
          What are you trying to build?{" "}
          <span className="text-[hsl(var(--color-error))]">*</span>
        </label>
        <Textarea
          id="message"
          placeholder="Tell us about your project, goals, and any relevant context..."
          rows={5}
          error={!!errors.message}
          {...register("message")}
        />
        {errors.message && (
          <p className="text-sm text-[hsl(var(--color-error))]">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        loading={isSubmitting}
        className="w-full sm:w-auto"
        hoverText={
          <>
            Let&apos;s go
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </>
        }
      >
        Send inquiry
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </Button>
    </form>
  );
}
