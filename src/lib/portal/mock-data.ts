// ============================================================================
// MOCK DATA — DEPRECATED (Portal v2: all data comes from Supabase + Linear)
// ============================================================================
// This file is intentionally empty. All mock data and demo mode logic has been
// removed as part of the Portal v2 Sprint 1 foundation work.
// Exports are kept as stubs so existing page components don't break until
// they are rebuilt in Sprint 2+3.

import type {
  PortalUser,
  DashboardData,
  ProjectDetailData,
  Project,
  Task,
  TeamMember,
  ClientRequest,
  PortalDocument,
  Invoice,
} from './types';

/** @deprecated Demo mode removed in Portal v2. Always returns false. */
export function isDemoMode(): boolean {
  return false;
}

/** @deprecated Stub — returns a placeholder user. */
export function getMockUser(): PortalUser {
  return { id: '', email: '', full_name: '', avatar_url: null, role: 'stakeholder', created_at: '', updated_at: '' };
}

/** @deprecated Stub */
export function getMockUsers(): PortalUser[] { return []; }

/** @deprecated Stub */
export function getMockDashboardData(): DashboardData {
  return { projects: [], recent_updates: [], stats: { total_projects: 0, on_track: 0, at_risk: 0, blocked: 0 } };
}

/** @deprecated Stub */
export function getMockProjectDetail(_projectId: string): ProjectDetailData | null { return null; }

/** @deprecated Stub */
export function getMockProjects(): Project[] { return []; }

/** @deprecated Stub */
export function getMockTasks(_projectId: string): Task[] { return []; }

/** @deprecated Stub */
export function getMockTeamMembers(_projectId: string): (TeamMember & { user: PortalUser })[] { return []; }

/** @deprecated Stub */
export function getMockRequests(): ClientRequest[] { return []; }

/** @deprecated Stub */
export function getMockRequest(_requestId: string): ClientRequest | null { return null; }

/** @deprecated Stub */
export function getMockDocuments(): PortalDocument[] { return []; }

/** @deprecated Stub */
export function getMockInvoices(): Invoice[] { return []; }

/** @deprecated Stub */
export const mockSparklineData: Record<string, number[]> = {};

/** @deprecated Demo credentials removed in Portal v2. */
export const DEMO_CREDENTIALS = { email: '', password: '' };
