'use client';

import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Milestone Timeline — horizontal milestone visualization
// ---------------------------------------------------------------------------

export interface Milestone {
  name: string;
  date: string | null;
  status: 'completed' | 'active' | 'planned';
}

export interface MilestoneTimelineProps {
  milestones: Milestone[];
}

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  if (milestones.length === 0) return null;

  return (
    <div className="overflow-x-auto pb-2 -mx-2 px-2">
      <div className="flex items-center gap-0 min-w-max">
        {milestones.map((milestone, i) => {
          const isCompleted = milestone.status === 'completed';
          const isActive = milestone.status === 'active';
          const isLast = i === milestones.length - 1;

          return (
            <div key={i} className="flex items-center">
              {/* Dot */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  {isActive && (
                    <motion.span
                      className="absolute inset-[-4px] rounded-full"
                      style={{ backgroundColor: 'rgba(45, 106, 79, 0.2)' }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <span
                    className="relative flex items-center justify-center rounded-full"
                    style={{
                      width: isActive ? 20 : 14,
                      height: isActive ? 20 : 14,
                      backgroundColor: isCompleted || isActive ? '#2D6A4F' : 'transparent',
                      border: isCompleted || isActive ? 'none' : '2px solid #8B9E93',
                    }}
                  >
                    {isCompleted && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </span>
                </div>
                {/* Label */}
                <div className="text-center max-w-[100px]">
                  <p
                    className="text-xs font-medium leading-tight"
                    style={{
                      color: isActive ? '#2D6A4F' : isCompleted ? '#1A1A1A' : '#6B6560',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {milestone.name}
                  </p>
                  {isActive && (
                    <p className="text-[10px] font-semibold mt-0.5 uppercase tracking-wide" style={{ color: '#2D6A4F' }}>
                      Now
                    </p>
                  )}
                  {milestone.date && !isActive && (
                    <p className="text-[10px] mt-0.5" style={{ color: '#6B6560', fontFamily: 'var(--font-sans)' }}>
                      {new Date(milestone.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  )}
                </div>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className="h-0.5 w-16 sm:w-24 mx-2"
                  style={{
                    backgroundColor: isCompleted ? '#2D6A4F' : '#E5DFD6',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
