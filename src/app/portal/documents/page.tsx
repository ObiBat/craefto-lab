'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AnimatedSection,
  smoothTransition,
  instantTransition,
  staggerContainer,
  staggerItem,
  reducedMotionVariants,
} from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import { useAuth, getRoleLabel } from '@/lib/portal/auth-context';
import { getMockDocuments } from '@/lib/portal/mock-data';
import { portalLoginPath } from '@/lib/portal/routes';
import type { PortalDocument, DocumentCategory } from '@/lib/portal/types';

import { PortalHeader } from '@/components/portal/portal-header';
import { PortalSidebar } from '@/components/portal/portal-sidebar';
import { DocumentCard } from '@/components/portal/document-card';
import { EmptyState } from '@/components/portal/empty-state';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1={12} x2={12} y1={3} y2={15} />
    </svg>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx={11} cy={11} r={8} />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Category tabs
// ---------------------------------------------------------------------------

const CATEGORY_FILTERS: { value: 'all' | DocumentCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'contracts', label: 'Contracts' },
  { value: 'brand_assets', label: 'Brand Assets' },
  { value: 'deliverables', label: 'Deliverables' },
  { value: 'reports', label: 'Reports' },
  { value: 'invoices', label: 'Invoices' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocumentsPage() {
  const { portalUser, user, loading: authLoading, signOut, hasPermission, isDemo} = useAuth();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'all' | DocumentCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const canUpload = hasPermission('create_update');

  useEffect(() => {
    if (!authLoading && !user && !isDemo) {
      router.replace(portalLoginPath());
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    setDocuments(getMockDocuments());
    setLoading(false);
  }, []);

  const filteredDocuments = useMemo(() => {
    let docs = documents;
    if (categoryFilter !== 'all') {
      docs = docs.filter((d) => d.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter((d) => d.name.toLowerCase().includes(query) || d.file_type.toLowerCase().includes(query));
    }
    return docs;
  }, [documents, categoryFilter, searchQuery]);

  const transition = prefersReducedMotion ? instantTransition : smoothTransition;
  const containerVariant = prefersReducedMotion ? reducedMotionVariants : staggerContainer;
  const itemVariant = prefersReducedMotion ? reducedMotionVariants : staggerItem;

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen">
        <PortalSidebar userRole={portalUser?.role} />
        <div className="flex flex-1 flex-col min-w-0">
          <PortalHeader />
          <main className="flex-1 px-4 py-6 sm:p-6 md:p-8 lg:p-10" role="main">
            <div className="max-w-[1600px] mx-auto animate-pulse space-y-4">
              <div className="h-8 bg-[hsl(var(--color-background-muted))] rounded w-48" />
              <div className="h-12 bg-[hsl(var(--color-background-muted))] rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-[hsl(var(--color-background-muted))] rounded-xl" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <PortalSidebar userRole={portalUser?.role} />

      <div className="flex flex-1 flex-col min-w-0">
        <PortalHeader
          user={portalUser ? { name: portalUser.full_name, role: getRoleLabel(portalUser.role) } : undefined}
          breadcrumbs={[{ label: 'Documents' }]}
          onSignOut={signOut}
        />

        <main className="flex-1" role="main" aria-label="Document vault">
          <div className="px-4 py-6 sm:p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto">
            {/* Header */}
            <AnimatedSection variant="fadeUp" className="mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[hsl(var(--color-foreground))] font-[family-name:var(--font-heading)]">
                    Documents
                  </h1>
                  <p className="mt-1 text-sm text-[hsl(var(--color-foreground-muted))]">
                    Contracts, brand assets, deliverables, and reports.
                  </p>
                </div>
                {canUpload && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--color-accent))] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[hsl(var(--color-accent-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2"
                  >
                    <UploadIcon />
                    Upload
                  </button>
                )}
              </div>
            </AnimatedSection>

            {/* Search + category filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-foreground-subtle))]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] pl-10 pr-4 py-2 text-sm text-[hsl(var(--color-foreground))] placeholder:text-[hsl(var(--color-foreground-subtle))] transition-colors focus:border-[hsl(var(--color-accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                  aria-label="Search documents"
                />
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-[hsl(var(--color-background-subtle))] border border-[hsl(var(--color-border))] overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Filter by category">
                {CATEGORY_FILTERS.map((filter) => {
                  const isSelected = categoryFilter === filter.value;
                  const count = filter.value === 'all' ? documents.length : documents.filter((d) => d.category === filter.value).length;
                  return (
                    <button
                      key={filter.value}
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setCategoryFilter(filter.value)}
                      className={cn(
                        'relative shrink-0 whitespace-nowrap px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 min-h-[36px]',
                        isSelected
                          ? 'text-[hsl(var(--color-background))]'
                          : 'text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))]',
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="doc-category-filter"
                          className="absolute inset-0 rounded-full bg-[hsl(var(--color-foreground))]"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">
                        {filter.label}
                        {count > 0 && <span className="ml-1 opacity-60">({count})</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document grid */}
            {filteredDocuments.length > 0 ? (
              <motion.div
                key={`${categoryFilter}-${searchQuery}`}
                initial="hidden"
                animate="visible"
                variants={containerVariant}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {filteredDocuments.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    variants={itemVariant}
                    transition={{ ...transition, delay: prefersReducedMotion ? 0 : index * 0.04 }}
                  >
                    <DocumentCard document={doc} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState
                title="No documents found"
                description={
                  searchQuery || categoryFilter !== 'all'
                    ? 'No documents match your search or filter.'
                    : 'No documents have been uploaded yet.'
                }
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
