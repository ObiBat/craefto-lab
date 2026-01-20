"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Author {
  id: string;
  name: string;
  slug: string;
}

interface Pillar {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  content_type: string;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
  author_id: string;
  pillar_id: string;
  reading_time: number | null;
  published_at: string | null;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export default function ArticleEditorPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const isNew = articleId === "new";

  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);
  const [authors, setAuthors] = React.useState<Author[]>([]);
  const [pillars, setPillars] = React.useState<Pillar[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<Partial<Article>>({
    title: "",
    slug: "",
    subtitle: "",
    excerpt: "",
    content: "",
    featured_image_url: "",
    featured_image_alt: "",
    content_type: "article",
    status: "draft",
    meta_title: "",
    meta_description: "",
    author_id: "",
    pillar_id: "",
    reading_time: 0,
  });

  // Fetch authors and pillars
  React.useEffect(() => {
    async function fetchData() {
      try {
        const [authorsRes, pillarsRes] = await Promise.all([
          fetch("/api/admin/journal/authors"),
          fetch("/api/journal/pillars"),
        ]);

        if (authorsRes.ok) {
          const data = await authorsRes.json();
          setAuthors(data.authors || []);
          if (!isNew && !formData.author_id && data.authors?.length > 0) {
            setFormData((prev) => ({ ...prev, author_id: data.authors[0].id }));
          }
        }

        if (pillarsRes.ok) {
          const data = await pillarsRes.json();
          setPillars(data.pillars || []);
          if (!isNew && !formData.pillar_id && data.pillars?.length > 0) {
            setFormData((prev) => ({ ...prev, pillar_id: data.pillars[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }
    fetchData();
  }, [isNew]);

  // Fetch article if editing
  React.useEffect(() => {
    if (isNew) return;

    async function fetchArticle() {
      try {
        const res = await fetch(`/api/admin/journal/articles/${articleId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            title: data.article.title,
            slug: data.article.slug,
            subtitle: data.article.subtitle || "",
            excerpt: data.article.excerpt || "",
            content: data.article.content || "",
            featured_image_url: data.article.featured_image_url || "",
            featured_image_alt: data.article.featured_image_alt || "",
            content_type: data.article.content_type,
            status: data.article.status,
            meta_title: data.article.meta_title || "",
            meta_description: data.article.meta_description || "",
            author_id: data.article.author_id,
            pillar_id: data.article.pillar_id,
            reading_time: data.article.reading_time,
          });
        } else {
          setError("Failed to load article");
        }
      } catch (err) {
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [articleId, isNew]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-generate slug from title
      if (name === "title" && isNew) {
        updated.slug = generateSlug(value);
      }

      // Auto-calculate reading time from content
      if (name === "content") {
        updated.reading_time = calculateReadingTime(value);
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const url = isNew
        ? "/api/admin/journal/articles"
        : `/api/admin/journal/articles/${articleId}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save article");
        return;
      }

      setSuccess("Article saved successfully");

      if (isNew) {
        router.push(`/admin/journal/${data.article.id}`);
      }
    } catch (err) {
      setError("Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this article? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/journal/articles/${articleId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/admin/journal");
      } else {
        setError("Failed to delete article");
      }
    } catch (err) {
      setError("Failed to delete article");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[hsl(var(--color-border))] rounded" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-[hsl(var(--color-background-muted))] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/journal"
            className="p-2 text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-subtle))] rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-semibold">
            {isNew ? "New Article" : "Edit Article"}
          </h1>
        </div>
        {!isNew && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-600 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            Delete
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:outline-none focus:border-[hsl(var(--color-accent))]"
            placeholder="Article title"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
            Slug *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:outline-none focus:border-[hsl(var(--color-accent))]"
            placeholder="article-slug"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
            Subtitle
          </label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle || ""}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:outline-none focus:border-[hsl(var(--color-accent))]"
            placeholder="A brief subtitle for the article"
          />
        </div>

        {/* Author & Pillar */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
              Author *
            </label>
            <select
              name="author_id"
              value={formData.author_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:outline-none focus:border-[hsl(var(--color-accent))]"
            >
              <option value="">Select author</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
              Pillar *
            </label>
            <select
              name="pillar_id"
              value={formData.pillar_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:outline-none focus:border-[hsl(var(--color-accent))]"
            >
              <option value="">Select pillar</option>
              {pillars.map((pillar) => (
                <option key={pillar.id} value={pillar.id}>
                  {pillar.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Type & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
              Content Type
            </label>
            <select
              name="content_type"
              value={formData.content_type}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:outline-none focus:border-[hsl(var(--color-accent))]"
            >
              <option value="article">Article</option>
              <option value="deep_dive">Deep Dive</option>
              <option value="case_study">Case Study</option>
              <option value="tutorial">Tutorial</option>
              <option value="opinion">Opinion</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:outline-none focus:border-[hsl(var(--color-accent))]"
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Featured Image */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
              Featured Image URL
            </label>
            <input
              type="url"
              name="featured_image_url"
              value={formData.featured_image_url || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:outline-none focus:border-[hsl(var(--color-accent))]"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
              Image Alt Text
            </label>
            <input
              type="text"
              name="featured_image_alt"
              value={formData.featured_image_alt || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:outline-none focus:border-[hsl(var(--color-accent))]"
              placeholder="Describe the image"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
            Excerpt
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt || ""}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:outline-none focus:border-[hsl(var(--color-accent))] resize-none"
            placeholder="A brief summary of the article"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
            Content (MDX)
            <span className="text-[hsl(var(--color-foreground-subtle))] ml-2">
              {formData.reading_time} min read
            </span>
          </label>
          <textarea
            name="content"
            value={formData.content || ""}
            onChange={handleChange}
            rows={20}
            className="w-full px-4 py-3 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] font-mono text-sm focus:outline-none focus:border-[hsl(var(--color-accent))] resize-y"
            placeholder="Write your article content in MDX format..."
          />
        </div>

        {/* SEO */}
        <div className="border-t border-[hsl(var(--color-border))] pt-6">
          <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
                Meta Title
              </label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:outline-none focus:border-[hsl(var(--color-accent))]"
                placeholder="SEO title (defaults to article title)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--color-foreground-muted))] mb-2">
                Meta Description
              </label>
              <textarea
                name="meta_description"
                value={formData.meta_description || ""}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 bg-[hsl(var(--color-background-muted))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-foreground))] focus:outline-none focus:border-[hsl(var(--color-accent))] resize-none"
                placeholder="SEO description (defaults to excerpt)"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-[hsl(var(--color-border))]">
          <Link
            href="/admin/journal"
            className="px-6 py-3 text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[hsl(var(--color-accent))] text-black font-medium rounded-xl hover:bg-[hsl(var(--color-accent-hover))] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : isNew ? "Create Article" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
