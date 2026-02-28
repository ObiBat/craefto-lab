// ============================================================================
// MOCK DATA — Demo fallback when Supabase env vars are not configured
// ============================================================================

import type {
  PortalUser,
  Project,
  Task,
  Update,
  TeamMember,
  TimelineEvent,
  DashboardData,
  ProjectWithMeta,
  ProjectDetailData,
} from './types';

export const DEMO_CREDENTIALS = { email: 'demo@craefto.com', password: 'demo123456' };

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key;
}

const mockUsers: PortalUser[] = [
  { id: 'user-001', email: 'demo@craefto.com', full_name: 'Obi Batbileg', avatar_url: null, role: 'admin', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: 'user-002', email: 'sara@craefto.com', full_name: 'Sara Chen', avatar_url: null, role: 'project_manager', created_at: '2026-01-20T00:00:00Z', updated_at: '2026-02-28T00:00:00Z' },
  { id: 'user-003', email: 'alex@craefto.com', full_name: 'Alex Rivera', avatar_url: null, role: 'team_member', created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-27T00:00:00Z' },
  { id: 'user-004', email: 'stakeholder@client.com', full_name: 'Jordan Mitchell', avatar_url: null, role: 'stakeholder', created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-25T00:00:00Z' },
];

const mockProjects: Project[] = [
  { id: 'proj-001', name: 'Craefto Website Redesign', slug: 'craefto-redesign', description: 'Complete overhaul of craefto.com with new Paper & Ink design system, journal, case studies, and service pages.', status: 'on_track', progress: 78, start_date: '2026-01-10T00:00:00Z', target_date: '2026-03-31T00:00:00Z', linear_team_id: null, linear_project_id: null, created_at: '2026-01-10T00:00:00Z', updated_at: '2026-03-01T08:00:00Z' },
  { id: 'proj-002', name: 'GlobFam Platform', slug: 'globfam', description: 'Financial planning platform for migrant families. Multi-currency support, document storage, visa timeline tracking.', status: 'at_risk', progress: 45, start_date: '2026-01-20T00:00:00Z', target_date: '2026-04-15T00:00:00Z', linear_team_id: null, linear_project_id: null, created_at: '2026-01-20T00:00:00Z', updated_at: '2026-02-28T14:00:00Z' },
  { id: 'proj-003', name: 'TACTIX Learning Platform', slug: 'tactix', description: '3D chess learning platform with interactive tutorials, pattern recognition, and progress tracking.', status: 'on_track', progress: 32, start_date: '2026-02-01T00:00:00Z', target_date: '2026-05-30T00:00:00Z', linear_team_id: null, linear_project_id: null, created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-27T10:00:00Z' },
  { id: 'proj-004', name: 'FontKin Typography Tool', slug: 'fontkin', description: 'Font pairing and typography exploration tool for designers. AI powered recommendations.', status: 'completed', progress: 100, start_date: '2025-11-01T00:00:00Z', target_date: '2026-01-15T00:00:00Z', linear_team_id: null, linear_project_id: null, created_at: '2025-11-01T00:00:00Z', updated_at: '2026-01-15T16:00:00Z' },
  { id: 'proj-005', name: 'Infinity Steel Fixers', slug: 'infinity-steel', description: 'Client project: brand identity and website for steel fixing company. Discovery phase.', status: 'blocked', progress: 15, start_date: '2026-01-29T00:00:00Z', target_date: '2026-03-15T00:00:00Z', linear_team_id: null, linear_project_id: null, created_at: '2026-01-29T00:00:00Z', updated_at: '2026-02-20T09:00:00Z' },
];

const mockUpdates: Update[] = [
  { id: 'upd-001', project_id: 'proj-001', author_id: 'user-001', type: 'alignment', title: 'Design system finalised: Paper & Ink', content: 'Locked in the Paper & Ink design system. Warm cream backgrounds (#FAF7F2), deep ink foreground (#1A1714), muted sage green accents. Space Grotesk for headings, DM Sans for body. All tokens documented in globals.css.\n\nThis gives us a distinctive, editorial feel that stands out from typical tech agency sites.', tags: ['alignment', 'design'], mentions: ['user-002'], pinned: true, created_at: '2026-02-15T09:00:00Z', updated_at: '2026-02-15T09:00:00Z', author: mockUsers[0] },
  { id: 'upd-002', project_id: 'proj-002', author_id: 'user-002', type: 'blocker', title: 'External API rate limiting issues', content: 'Currency conversion API (Open Exchange Rates) is hitting rate limits during peak testing. Need to implement Upstash Redis caching layer with stale cache fallback as per ADR-003.\n\nBlocking the multi-currency dashboard feature.', tags: ['blocker', 'engineering'], mentions: ['user-001', 'user-003'], pinned: false, created_at: '2026-02-28T14:00:00Z', updated_at: '2026-02-28T14:00:00Z', author: mockUsers[1] },
  { id: 'upd-003', project_id: 'proj-001', author_id: 'user-001', type: 'milestone', title: 'Journal system live with MDX', content: 'Journal/blog system is now live on craefto.com. Supports MDX content, syntax highlighting via Shiki, auto-generated OG images, and pillar-based categorisation (Engineering, Design, Product).\n\nFirst two articles published successfully.', tags: ['milestone', 'content'], mentions: [], pinned: false, created_at: '2026-02-25T11:00:00Z', updated_at: '2026-02-25T11:00:00Z', author: mockUsers[0] },
  { id: 'upd-004', project_id: 'proj-003', author_id: 'user-003', type: 'task_update', title: '3D board rendering prototype complete', content: 'Finished the React Three Fiber prototype for the interactive chess board. Supports rotation, zoom, and piece highlighting. Performance is solid at 60fps on mid-range devices.\n\nNext: implement the tutorial overlay system.', tags: ['engineering', 'prototype'], mentions: ['user-001'], pinned: false, created_at: '2026-02-27T10:00:00Z', updated_at: '2026-02-27T10:00:00Z', author: mockUsers[2] },
  { id: 'upd-005', project_id: 'proj-005', author_id: 'user-001', type: 'decision', title: 'Awaiting client response on discovery', content: 'Sent discovery document to Infinity Steel Fixers on Jan 29. Follow-up sent Feb 3. No response yet. If no reply by March 7, we close this lead and reallocate resources.', tags: ['decision', 'client'], mentions: [], pinned: false, created_at: '2026-02-20T09:00:00Z', updated_at: '2026-02-20T09:00:00Z', author: mockUsers[0] },
  { id: 'upd-006', project_id: 'proj-002', author_id: 'user-001', type: 'alignment', title: 'Architecture decision: Supabase + Edge Functions', content: 'Decided to go with Supabase for auth, database, and real-time subscriptions. Edge Functions for server-side logic. This keeps the stack simple and avoids managing separate infrastructure.\n\nPostgres RLS policies will handle multi-tenant data isolation.', tags: ['alignment', 'architecture'], mentions: ['user-002', 'user-003'], pinned: false, created_at: '2026-02-10T08:30:00Z', updated_at: '2026-02-10T08:30:00Z', author: mockUsers[0] },
];

const mockTasks: Task[] = [
  { id: 'task-001', project_id: 'proj-001', title: 'Implement contact form with Resend', description: 'Hook up contact page form to Resend API for email delivery', status: 'done', priority: 'high', assignee_id: 'user-001', linear_issue_id: null, linear_identifier: 'CRA-12', due_date: '2026-02-20T00:00:00Z', sort_order: 1, created_at: '2026-01-15T00:00:00Z', updated_at: '2026-02-18T00:00:00Z', assignee: mockUsers[0] },
  { id: 'task-002', project_id: 'proj-001', title: 'Case study pages with dynamic OG images', description: 'Build case study template with auto-generated OpenGraph images', status: 'done', priority: 'high', assignee_id: 'user-001', linear_issue_id: null, linear_identifier: 'CRA-15', due_date: '2026-02-25T00:00:00Z', sort_order: 2, created_at: '2026-01-20T00:00:00Z', updated_at: '2026-02-24T00:00:00Z', assignee: mockUsers[0] },
  { id: 'task-003', project_id: 'proj-001', title: 'Performance audit and Core Web Vitals', description: 'Run Lighthouse, optimize LCP, CLS, INP to green scores', status: 'in_progress', priority: 'medium', assignee_id: 'user-003', linear_issue_id: null, linear_identifier: 'CRA-22', due_date: '2026-03-10T00:00:00Z', sort_order: 3, created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-28T00:00:00Z', assignee: mockUsers[2] },
  { id: 'task-004', project_id: 'proj-001', title: 'SEO meta tags and structured data', description: 'JSON-LD for organization, services, articles', status: 'done', priority: 'medium', assignee_id: 'user-001', linear_issue_id: null, linear_identifier: 'CRA-18', due_date: '2026-02-28T00:00:00Z', sort_order: 4, created_at: '2026-02-05T00:00:00Z', updated_at: '2026-02-26T00:00:00Z', assignee: mockUsers[0] },
  { id: 'task-005', project_id: 'proj-001', title: 'Stakeholder portal integration', description: 'Build client-facing portal for project updates', status: 'in_progress', priority: 'high', assignee_id: 'user-001', linear_issue_id: null, linear_identifier: 'CRA-30', due_date: '2026-03-15T00:00:00Z', sort_order: 5, created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z', assignee: mockUsers[0] },
  { id: 'task-006', project_id: 'proj-001', title: 'Dark mode support', description: null, status: 'backlog', priority: 'low', assignee_id: null, linear_issue_id: null, linear_identifier: 'CRA-35', due_date: null, sort_order: 6, created_at: '2026-02-28T00:00:00Z', updated_at: '2026-02-28T00:00:00Z' },
  { id: 'task-007', project_id: 'proj-002', title: 'Multi-currency dashboard', description: 'Display balances across multiple currencies with live conversion rates', status: 'blocked', priority: 'urgent', assignee_id: 'user-003', linear_issue_id: null, linear_identifier: 'GLB-08', due_date: '2026-03-05T00:00:00Z', sort_order: 1, created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-28T00:00:00Z', assignee: mockUsers[2] },
  { id: 'task-008', project_id: 'proj-002', title: 'Document upload and storage', description: 'Visa documents, financial records with Supabase Storage', status: 'in_progress', priority: 'high', assignee_id: 'user-002', linear_issue_id: null, linear_identifier: 'GLB-12', due_date: '2026-03-10T00:00:00Z', sort_order: 2, created_at: '2026-02-10T00:00:00Z', updated_at: '2026-02-27T00:00:00Z', assignee: mockUsers[1] },
  { id: 'task-009', project_id: 'proj-002', title: 'Visa timeline tracker', description: 'Visual timeline of visa application stages', status: 'todo', priority: 'medium', assignee_id: 'user-001', linear_issue_id: null, linear_identifier: 'GLB-15', due_date: '2026-03-20T00:00:00Z', sort_order: 3, created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-15T00:00:00Z', assignee: mockUsers[0] },
  { id: 'task-010', project_id: 'proj-003', title: 'Tutorial overlay system', description: 'Step-by-step tutorial overlays on the 3D chess board', status: 'todo', priority: 'high', assignee_id: 'user-003', linear_issue_id: null, linear_identifier: 'TAC-05', due_date: '2026-03-15T00:00:00Z', sort_order: 1, created_at: '2026-02-27T00:00:00Z', updated_at: '2026-02-27T00:00:00Z', assignee: mockUsers[2] },
];

const mockTeamMembers: (TeamMember & { user: PortalUser })[] = [
  { id: 'tm-001', project_id: 'proj-001', user_id: 'user-001', role_in_project: 'Lead Engineer & Designer', joined_at: '2026-01-10T00:00:00Z', user: mockUsers[0] },
  { id: 'tm-002', project_id: 'proj-001', user_id: 'user-002', role_in_project: 'Project Manager', joined_at: '2026-01-12T00:00:00Z', user: mockUsers[1] },
  { id: 'tm-003', project_id: 'proj-001', user_id: 'user-003', role_in_project: 'Frontend Developer', joined_at: '2026-02-01T00:00:00Z', user: mockUsers[2] },
  { id: 'tm-004', project_id: 'proj-002', user_id: 'user-001', role_in_project: 'Technical Lead', joined_at: '2026-01-20T00:00:00Z', user: mockUsers[0] },
  { id: 'tm-005', project_id: 'proj-002', user_id: 'user-002', role_in_project: 'Product Manager', joined_at: '2026-01-22T00:00:00Z', user: mockUsers[1] },
  { id: 'tm-006', project_id: 'proj-002', user_id: 'user-003', role_in_project: 'Backend Developer', joined_at: '2026-02-01T00:00:00Z', user: mockUsers[2] },
  { id: 'tm-007', project_id: 'proj-003', user_id: 'user-001', role_in_project: 'Founder & Designer', joined_at: '2026-02-01T00:00:00Z', user: mockUsers[0] },
  { id: 'tm-008', project_id: 'proj-003', user_id: 'user-003', role_in_project: '3D Developer', joined_at: '2026-02-15T00:00:00Z', user: mockUsers[2] },
];

const mockTimeline: TimelineEvent[] = [
  { id: 'tl-001', type: 'milestone', title: 'Journal system launched', description: 'MDX blog with syntax highlighting, OG images, and pillar categories', timestamp: '2026-02-25T11:00:00Z', actor: mockUsers[0] },
  { id: 'tl-002', type: 'task_completed', title: 'Case study pages complete', description: 'All 4 case studies live with dynamic OG images', timestamp: '2026-02-24T00:00:00Z', actor: mockUsers[0] },
  { id: 'tl-003', type: 'status_change', title: 'Project status: On Track', description: 'Moved from at-risk to on-track after clearing design backlog', timestamp: '2026-02-20T00:00:00Z', actor: mockUsers[1] },
  { id: 'tl-004', type: 'member_joined', title: 'Alex Rivera joined', description: 'Joined as Frontend Developer', timestamp: '2026-02-01T00:00:00Z', actor: mockUsers[2] },
  { id: 'tl-005', type: 'update', title: 'Design system finalised', description: 'Paper & Ink theme locked in', timestamp: '2026-02-15T09:00:00Z', actor: mockUsers[0] },
];

export function getMockUser(): PortalUser { return mockUsers[0]; }
export function getMockUsers(): PortalUser[] { return mockUsers; }

export function getMockDashboardData(): DashboardData {
  const projectsWithMeta: ProjectWithMeta[] = mockProjects.map((project) => {
    const projectTasks = mockTasks.filter((t) => t.project_id === project.id);
    const projectTeam = mockTeamMembers.filter((tm) => tm.project_id === project.id);
    const projectUpdates = mockUpdates.filter((u) => u.project_id === project.id);
    const latestUpdate = projectUpdates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;
    return { ...project, task_count: projectTasks.length, completed_task_count: projectTasks.filter((t) => t.status === 'done').length, team_members: projectTeam, update_count: projectUpdates.length, latest_update: latestUpdate };
  });
  return {
    projects: projectsWithMeta,
    recent_updates: mockUpdates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    stats: { total_projects: mockProjects.length, on_track: mockProjects.filter((p) => p.status === 'on_track').length, at_risk: mockProjects.filter((p) => p.status === 'at_risk').length, blocked: mockProjects.filter((p) => p.status === 'blocked').length },
  };
}

export function getMockProjectDetail(projectId: string): ProjectDetailData | null {
  const project = mockProjects.find((p) => p.id === projectId);
  if (!project) return null;
  return {
    project,
    updates: mockUpdates.filter((u) => u.project_id === projectId),
    tasks: mockTasks.filter((t) => t.project_id === projectId),
    team_members: mockTeamMembers.filter((tm) => tm.project_id === projectId),
    timeline: mockTimeline,
  };
}

export function getMockProjects(): Project[] { return mockProjects; }
export function getMockTasks(projectId: string): Task[] { return mockTasks.filter(t => t.project_id === projectId); }
export function getMockTeamMembers(projectId: string): (TeamMember & { user: PortalUser })[] { return mockTeamMembers.filter(tm => tm.project_id === projectId); }
