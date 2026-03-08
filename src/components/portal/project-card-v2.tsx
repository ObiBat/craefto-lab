'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ProjectStatus } from '@/lib/portal/types';
import { portalPath } from '@/lib/portal/routes';

const STATUS_COLORS: Record<ProjectStatus, string> = {
  on_track: '#2D6A4F',
  at_risk: '#D4A843',
  blocked: '#C1553B',
  completed: '#8B9E93',
  paused: '#8B9E93',
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  blocked: 'Blocked',
  completed: 'Completed',
  paused: 'Paused',
};

export interface ProjectCardV2Props {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  description: string | null;
  aiSummary?: string | null;
  nextMilestone?: string | null;
  nextMilestoneDate?: string | null;
  index?: number;
}

export function ProjectCardV2({
  id,
  name,
  status,
  progress,
  description,
  aiSummary,
  nextMilestone,
  nextMilestoneDate,
  index = 0,
}: ProjectCardV2Props) {
  const color = STATUS_COLORS[status];
  const shouldPulse = status === 'on_track' || status === 'at_risk';
  const displayText = aiSummary || description || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={portalPath(`/projects/${id}`)}
        className="block rounded-2xl border bg-white p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:ring-offset-2"
        style={{ borderColor: '#F0EDE8' }}
        aria-label={`View project: ${name}`}
      >
        {/* Status dot + label */}
        <div className="flex items-center gap-2.5 mb-4">
          <span className="relative flex h-3 w-3">
            {shouldPulse && (
              <motion.span
                className="absolute inset-0 rounded-full opacity-40"
                style={{ backgroundColor: color }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <span
              className="relative inline-flex h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
          </span>
          <span
            className="text-xs font-medium tracking-wide uppercase"
            style={{ color, fontFamily: 'var(--font-heading)' }}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>

        {/* Project name */}
        <h3
          className="text-[30px] font-semibold leading-tight tracking-tight mb-2"
          style={{ fontFamily: 'var(--font-serif)', color: '#1A1A1A' }}
        >
          {name}
        </h3>

        {/* Summary line */}
        {displayText && (
          <p
            className="text-base leading-relaxed mb-5 line-clamp-2"
            style={{ fontFamily: 'var(--font-serif)', color: '#6B6560' }}
          >
            {displayText}
          </p>
        )}

        {/* Progress bar */}
        <div className="mb-4">
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{ backgroundColor: '#F0EDE8' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${color}cc, ${color})`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 + 0.3 }}
            />
          </div>
        </div>

        {/* Next milestone */}
        {nextMilestone && (
          <div className="flex items-center gap-2 text-sm" style={{ color: '#6B6560' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" x2="4" y1="22" y2="15" />
            </svg>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14 }}>
              <span className="font-medium" style={{ color: '#1A1A1A' }}>Next:</span>{' '}
              {nextMilestone}
              {nextMilestoneDate && (
                <span className="ml-1">
                  &middot; {new Date(nextMilestoneDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}
