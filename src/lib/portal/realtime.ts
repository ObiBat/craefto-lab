'use client';

import { useEffect, useRef } from 'react';
import { createBrowserClient } from './supabase-auth';
import type { RealtimeChannel } from '@supabase/supabase-js';

type TableName = 'portal_projects' | 'portal_tasks' | 'portal_updates' | 'portal_timeline_events';

interface UseRealtimeOptions {
  table: TableName;
  filter?: string; // e.g. 'project_id=eq.abc123'
  onInsert?: (payload: Record<string, unknown>) => void;
  onUpdate?: (payload: Record<string, unknown>) => void;
  onDelete?: (payload: Record<string, unknown>) => void;
  enabled?: boolean;
}

export function useRealtime({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createBrowserClient();
    const channelName = filter ? `${table}:${filter}` : table;

    const channel = supabase.channel(channelName);

    // Build the subscription filter
    const filterConfig: {
      event: string;
      schema: string;
      table: string;
      filter?: string;
    } = {
      event: '*',
      schema: 'public',
      table,
    };

    if (filter) {
      filterConfig.filter = filter;
    }

    channel
      .on(
        'postgres_changes' as 'system',
        filterConfig as unknown as { event: 'system' },
        (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload.new);
              break;
            case 'UPDATE':
              onUpdate?.(payload.new);
              break;
            case 'DELETE':
              onDelete?.(payload.old);
              break;
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, enabled, onInsert, onUpdate, onDelete]);

  return channelRef;
}

// Convenience hook for project-scoped realtime
export function useProjectRealtime(
  projectId: string | undefined,
  callbacks: {
    onTaskChange?: () => void;
    onUpdateChange?: () => void;
    onTimelineChange?: () => void;
  }
) {
  useRealtime({
    table: 'portal_tasks',
    filter: projectId ? `project_id=eq.${projectId}` : undefined,
    onInsert: callbacks.onTaskChange,
    onUpdate: callbacks.onTaskChange,
    onDelete: callbacks.onTaskChange,
    enabled: !!projectId,
  });

  useRealtime({
    table: 'portal_updates',
    filter: projectId ? `project_id=eq.${projectId}` : undefined,
    onInsert: callbacks.onUpdateChange,
    onUpdate: callbacks.onUpdateChange,
    enabled: !!projectId,
  });

  useRealtime({
    table: 'portal_timeline_events',
    filter: projectId ? `project_id=eq.${projectId}` : undefined,
    onInsert: callbacks.onTimelineChange,
    enabled: !!projectId,
  });
}
