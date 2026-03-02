// ============================================================================
// MOCK DATA — Demo fallback when Supabase env vars are not configured
// ============================================================================

import type {
  Attachment,
  PortalUser,
  Project,
  Task,
  Update,
  TeamMember,
  TimelineEvent,
  DashboardData,
  ProjectWithMeta,
  ProjectDetailData,
  ClientRequest,
  RequestReply,
  PortalDocument,
  Invoice,
} from './types';

export const DEMO_CREDENTIALS = { email: 'demo@craefto.com', password: 'demo123456' };

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return true;
  return process.env.NEXT_PUBLIC_PORTAL_LIVE !== 'true';
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

const sampleAttachments: Record<string, Attachment[]> = {
  'upd-001': [
    { id: 'att-001', name: 'design-tokens.png', url: 'https://picsum.photos/seed/tokens/800/600', type: 'image/png', size: 245000 },
    { id: 'att-002', name: 'color-palette.pdf', url: 'https://picsum.photos/seed/palette/800/600', type: 'application/pdf', size: 1200000 },
  ],
  'upd-003': [
    { id: 'att-003', name: 'journal-screenshot.png', url: 'https://picsum.photos/seed/journal/800/600', type: 'image/png', size: 380000 },
  ],
  'upd-004': [
    { id: 'att-004', name: 'chess-prototype.png', url: 'https://picsum.photos/seed/chess/800/600', type: 'image/png', size: 520000 },
    { id: 'att-005', name: 'performance-report.pdf', url: 'https://picsum.photos/seed/perf/800/600', type: 'application/pdf', size: 890000 },
  ],
};

const mockUpdates: Update[] = [
  { id: 'upd-001', project_id: 'proj-001', author_id: 'user-001', type: 'alignment', title: 'Design system finalised: Paper & Ink', content: '<p>Locked in the <strong>Paper &amp; Ink</strong> design system. Warm cream backgrounds (#FAF7F2), deep ink foreground (#1A1714), muted sage green accents. Space Grotesk for headings, DM Sans for body. All tokens documented in globals.css.</p><p>This gives us a distinctive, editorial feel that stands out from typical tech agency sites.</p>', tags: ['alignment', 'design'], mentions: ['user-002'], pinned: true, attachments: sampleAttachments['upd-001'], created_at: '2026-02-15T09:00:00Z', updated_at: '2026-02-15T09:00:00Z', author: mockUsers[0] },
  { id: 'upd-002', project_id: 'proj-002', author_id: 'user-002', type: 'blocker', title: 'External API rate limiting issues', content: '<p>Currency conversion API (Open Exchange Rates) is hitting rate limits during peak testing. Need to implement <strong>Upstash Redis caching layer</strong> with stale cache fallback as per ADR-003.</p><p>Blocking the multi-currency dashboard feature.</p>', tags: ['blocker', 'engineering'], mentions: ['user-001', 'user-003'], pinned: false, attachments: [], created_at: '2026-02-28T14:00:00Z', updated_at: '2026-02-28T14:00:00Z', author: mockUsers[1] },
  { id: 'upd-003', project_id: 'proj-001', author_id: 'user-001', type: 'milestone', title: 'Journal system live with MDX', content: '<p>Journal/blog system is now live on craefto.com. Supports:</p><ul><li>MDX content</li><li>Syntax highlighting via Shiki</li><li>Auto-generated OG images</li><li>Pillar-based categorisation (Engineering, Design, Product)</li></ul><p>First two articles published successfully.</p>', tags: ['milestone', 'content'], mentions: [], pinned: false, attachments: sampleAttachments['upd-003'], approval_status: 'approved', created_at: '2026-02-25T11:00:00Z', updated_at: '2026-02-25T11:00:00Z', author: mockUsers[0] },
  { id: 'upd-004', project_id: 'proj-003', author_id: 'user-003', type: 'task_update', title: '3D board rendering prototype complete', content: '<p>Finished the React Three Fiber prototype for the interactive chess board. Supports rotation, zoom, and piece highlighting. Performance is solid at <strong>60fps</strong> on mid-range devices.</p><p>Next: implement the tutorial overlay system.</p>', tags: ['engineering', 'prototype'], mentions: ['user-001'], pinned: false, attachments: sampleAttachments['upd-004'], created_at: '2026-02-27T10:00:00Z', updated_at: '2026-02-27T10:00:00Z', author: mockUsers[2] },
  { id: 'upd-005', project_id: 'proj-005', author_id: 'user-001', type: 'decision', title: 'Awaiting client response on discovery', content: '<p>Sent discovery document to Infinity Steel Fixers on Jan 29. Follow-up sent Feb 3. No response yet. If no reply by <em>March 7</em>, we close this lead and reallocate resources.</p>', tags: ['decision', 'client'], mentions: [], pinned: false, attachments: [], approval_status: 'pending_review', created_at: '2026-02-20T09:00:00Z', updated_at: '2026-02-20T09:00:00Z', author: mockUsers[0] },
  { id: 'upd-006', project_id: 'proj-002', author_id: 'user-001', type: 'alignment', title: 'Architecture decision: Supabase + Edge Functions', content: '<p>Decided to go with <strong>Supabase</strong> for auth, database, and real-time subscriptions. Edge Functions for server-side logic. This keeps the stack simple and avoids managing separate infrastructure.</p><p>Postgres RLS policies will handle multi-tenant data isolation.</p>', tags: ['alignment', 'architecture'], mentions: ['user-002', 'user-003'], pinned: false, attachments: [], created_at: '2026-02-10T08:30:00Z', updated_at: '2026-02-10T08:30:00Z', author: mockUsers[0] },
];

const mockTasks: Task[] = [
  { id: 'task-001', project_id: 'proj-001', title: 'Implement contact form with Resend', description: 'Hook up contact page form to Resend API for email delivery', status: 'done', priority: 'high', assignee_id: 'user-001', linear_issue_id: null, linear_identifier: 'CRA-12', due_date: '2026-02-20T00:00:00Z', sort_order: 1, created_at: '2026-01-15T00:00:00Z', updated_at: '2026-02-18T00:00:00Z', assignee: mockUsers[0] },
  { id: 'task-002', project_id: 'proj-001', title: 'Case study pages with dynamic OG images', description: 'Build case study template with auto-generated OpenGraph images', status: 'done', priority: 'high', assignee_id: 'user-001', linear_issue_id: null, linear_identifier: 'CRA-15', due_date: '2026-02-25T00:00:00Z', sort_order: 2, created_at: '2026-01-20T00:00:00Z', updated_at: '2026-02-24T00:00:00Z', assignee: mockUsers[0] },
  { id: 'task-003', project_id: 'proj-001', title: 'Performance audit and Core Web Vitals', description: 'Run Lighthouse, optimize LCP, CLS, INP to green scores', status: 'in_progress', priority: 'medium', assignee_id: 'user-003', linear_issue_id: null, linear_identifier: 'CRA-22', due_date: '2026-03-10T00:00:00Z', sort_order: 3, created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-28T00:00:00Z', assignee: mockUsers[2] },
  { id: 'task-004', project_id: 'proj-001', title: 'SEO meta tags and structured data', description: 'JSON-LD for organization, services, articles', status: 'done', priority: 'medium', assignee_id: 'user-001', linear_issue_id: null, linear_identifier: 'CRA-18', due_date: '2026-02-28T00:00:00Z', sort_order: 4, created_at: '2026-02-05T00:00:00Z', updated_at: '2026-02-26T00:00:00Z', assignee: mockUsers[0] },
  { id: 'task-005', project_id: 'proj-001', title: 'Stakeholder portal integration', description: 'Build client-facing portal for project updates', status: 'in_progress', priority: 'high', assignee_id: 'user-001', linear_issue_id: null, linear_identifier: 'CRA-30', due_date: '2026-03-15T00:00:00Z', sort_order: 5, created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z', assignee: mockUsers[0] },
  { id: 'task-006', project_id: 'proj-001', title: 'Dark mode support', description: null, status: 'backlog', priority: 'low', assignee_id: null, linear_issue_id: null, linear_identifier: 'CRA-35', due_date: null, sort_order: 6, created_at: '2026-02-28T00:00:00Z', updated_at: '2026-02-28T00:00:00Z' },
  { id: 'task-007', project_id: 'proj-002', title: 'Multi-currency dashboard', description: 'Display balances across multiple currencies with live conversion rates', status: 'backlog', priority: 'urgent', assignee_id: 'user-003', linear_issue_id: null, linear_identifier: 'GLB-08', due_date: '2026-03-05T00:00:00Z', sort_order: 1, created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-28T00:00:00Z', assignee: mockUsers[2] },
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

export function getMockUser(role?: PortalUser['role']): PortalUser {
  if (!role) return mockUsers[0];
  return mockUsers.find((u) => u.role === role) ?? mockUsers[0];
}
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

// ============================================================================
// CLIENT REQUESTS — Mock data
// ============================================================================

const mockRequestReplies: RequestReply[] = [
  { id: 'reply-001', request_id: 'req-001', author_id: 'user-002', content: 'Thanks for flagging this, Jordan. We will look into the animation performance and aim to have a fix in the next sprint.', created_at: '2026-02-22T10:00:00Z', author: mockUsers[1] },
  { id: 'reply-002', request_id: 'req-001', author_id: 'user-004', content: 'Appreciate the quick response! Let me know if you need any more details.', created_at: '2026-02-22T14:30:00Z', author: mockUsers[3] },
  { id: 'reply-003', request_id: 'req-002', author_id: 'user-001', content: 'Great idea. We will scope this for Sprint 7 and share a wireframe for your review.', created_at: '2026-02-26T09:00:00Z', author: mockUsers[0] },
  { id: 'reply-004', request_id: 'req-004', author_id: 'user-002', content: 'We have received the updated brand guide. The team will start incorporating the changes this week.', created_at: '2026-02-28T11:00:00Z', author: mockUsers[1] },
];

const mockRequests: ClientRequest[] = [
  { id: 'req-001', project_id: 'proj-001', author_id: 'user-004', title: 'Homepage hero animation feels sluggish on mobile', description: '<p>On my iPhone 14, the hero section animation stutters when scrolling. The parallax effect seems to drop frames. Could we simplify it or add a reduced-motion fallback?</p>', type: 'bug_report', priority: 'high', status: 'in_review', attachments: [], created_at: '2026-02-21T15:00:00Z', updated_at: '2026-02-22T14:30:00Z', author: mockUsers[3], project: mockProjects[0], replies: [mockRequestReplies[0], mockRequestReplies[1]] },
  { id: 'req-002', project_id: 'proj-001', author_id: 'user-004', title: 'Add a testimonials section to the services page', description: '<p>It would be great to showcase client testimonials on the services page. Maybe a carousel or a grid of cards with quotes, names, and company logos?</p>', type: 'feature_request', priority: 'medium', status: 'approved', attachments: [], created_at: '2026-02-25T09:00:00Z', updated_at: '2026-02-26T09:00:00Z', author: mockUsers[3], project: mockProjects[0], replies: [mockRequestReplies[2]] },
  { id: 'req-003', project_id: 'proj-002', author_id: 'user-004', title: 'Clarification on multi-currency support scope', description: '<p>Does the multi-currency feature include real-time exchange rate updates, or is it based on a daily snapshot? Also, which currencies will be supported at launch?</p>', type: 'question', priority: 'low', status: 'pending', attachments: [], created_at: '2026-02-27T12:00:00Z', updated_at: '2026-02-27T12:00:00Z', author: mockUsers[3], project: mockProjects[1], replies: [] },
  { id: 'req-004', project_id: 'proj-001', author_id: 'user-004', title: 'Update brand colours to latest guidelines', description: '<p>Our brand team has updated the colour palette. The primary green should shift from <code>#4A7C59</code> to <code>#3D6B4F</code>. I have attached the updated brand guide PDF.</p>', type: 'change_request', priority: 'medium', status: 'completed', attachments: [{ id: 'att-req-001', name: 'brand-guide-v2.pdf', url: '#', type: 'application/pdf', size: 2400000 }], created_at: '2026-02-20T08:00:00Z', updated_at: '2026-02-28T11:00:00Z', author: mockUsers[3], project: mockProjects[0], replies: [mockRequestReplies[3]] },
  { id: 'req-005', project_id: 'proj-003', author_id: 'user-004', title: 'The tutorial progress bar does not save between sessions', description: '<p>When I complete steps 1-3 of the beginner tutorial and close the browser, my progress resets. Expected: progress persists via local storage or account.</p>', type: 'bug_report', priority: 'urgent', status: 'pending', attachments: [], created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z', author: mockUsers[3], project: mockProjects[2], replies: [] },
  { id: 'req-006', project_id: 'proj-001', author_id: 'user-004', title: 'General feedback on the portal experience', description: '<p>Overall I am really impressed with the portal! The design is clean and the updates are easy to follow. A few suggestions:</p><ul><li>Maybe add a search/filter on the updates feed</li><li>Would love to be able to export a PDF summary</li></ul>', type: 'feedback', priority: 'low', status: 'in_review', attachments: [], created_at: '2026-03-01T16:00:00Z', updated_at: '2026-03-01T16:00:00Z', author: mockUsers[3], project: mockProjects[0], replies: [] },
];

export function getMockRequests(): ClientRequest[] { return mockRequests; }
export function getMockRequest(requestId: string): ClientRequest | null { return mockRequests.find(r => r.id === requestId) ?? null; }

// ============================================================================
// DOCUMENT VAULT — Mock data
// ============================================================================

const mockDocuments: PortalDocument[] = [
  { id: 'doc-001', project_id: 'proj-001', name: 'Master Services Agreement', file_type: 'pdf', size: 1500000, category: 'contracts', uploaded_by: 'user-001', uploaded_at: '2026-01-15T09:00:00Z', download_url: '#', uploader: mockUsers[0] },
  { id: 'doc-002', project_id: 'proj-001', name: 'Brand Guidelines v2', file_type: 'pdf', size: 4200000, category: 'brand_assets', uploaded_by: 'user-004', uploaded_at: '2026-02-20T08:00:00Z', download_url: '#', uploader: mockUsers[3] },
  { id: 'doc-003', project_id: 'proj-001', name: 'Logo Pack (SVG + PNG)', file_type: 'zip', size: 8500000, category: 'brand_assets', uploaded_by: 'user-001', uploaded_at: '2026-02-01T10:00:00Z', download_url: '#', uploader: mockUsers[0] },
  { id: 'doc-004', project_id: 'proj-001', name: 'Homepage Final Mockup', file_type: 'png', size: 3200000, category: 'deliverables', uploaded_by: 'user-001', uploaded_at: '2026-02-18T14:00:00Z', download_url: '#', uploader: mockUsers[0] },
  { id: 'doc-005', project_id: 'proj-001', name: 'Sprint 4 Progress Report', file_type: 'pdf', size: 890000, category: 'reports', uploaded_by: 'user-002', uploaded_at: '2026-02-28T16:00:00Z', download_url: '#', uploader: mockUsers[1] },
  { id: 'doc-006', project_id: 'proj-001', name: 'Invoice INV-2026-003', file_type: 'pdf', size: 245000, category: 'invoices', uploaded_by: 'user-001', uploaded_at: '2026-02-01T09:00:00Z', download_url: '#', uploader: mockUsers[0] },
  { id: 'doc-007', project_id: 'proj-002', name: 'GlobFam SOW', file_type: 'docx', size: 520000, category: 'contracts', uploaded_by: 'user-001', uploaded_at: '2026-01-20T10:00:00Z', download_url: '#', uploader: mockUsers[0] },
  { id: 'doc-008', project_id: 'proj-002', name: 'API Architecture Diagram', file_type: 'png', size: 1800000, category: 'deliverables', uploaded_by: 'user-003', uploaded_at: '2026-02-15T11:00:00Z', download_url: '#', uploader: mockUsers[2] },
  { id: 'doc-009', project_id: 'proj-001', name: 'Content Strategy Spreadsheet', file_type: 'xlsx', size: 340000, category: 'reports', uploaded_by: 'user-002', uploaded_at: '2026-02-10T10:00:00Z', download_url: '#', uploader: mockUsers[1] },
  { id: 'doc-010', project_id: 'proj-003', name: 'TACTIX Design System', file_type: 'pdf', size: 6700000, category: 'brand_assets', uploaded_by: 'user-001', uploaded_at: '2026-02-05T14:00:00Z', download_url: '#', uploader: mockUsers[0] },
];

export function getMockDocuments(): PortalDocument[] { return mockDocuments; }

// ============================================================================
// INVOICES — Mock data
// ============================================================================

const mockInvoices: Invoice[] = [
  { id: 'inv-001', project_id: 'proj-001', number: 'INV-2026-001', description: 'Website Redesign — Discovery & Design Phase', amount: 850000, status: 'paid', due_date: '2026-01-31T00:00:00Z', paid_at: '2026-01-28T14:00:00Z', stripe_checkout_url: null, created_at: '2026-01-15T00:00:00Z', project: mockProjects[0] },
  { id: 'inv-002', project_id: 'proj-001', number: 'INV-2026-002', description: 'Website Redesign — Development Sprint 1-3', amount: 1200000, status: 'paid', due_date: '2026-02-28T00:00:00Z', paid_at: '2026-02-25T10:00:00Z', stripe_checkout_url: null, created_at: '2026-02-01T00:00:00Z', project: mockProjects[0] },
  { id: 'inv-003', project_id: 'proj-001', number: 'INV-2026-003', description: 'Website Redesign — Development Sprint 4-5', amount: 950000, status: 'sent', due_date: '2026-03-15T00:00:00Z', paid_at: null, stripe_checkout_url: 'https://checkout.stripe.com/placeholder', created_at: '2026-03-01T00:00:00Z', project: mockProjects[0] },
  { id: 'inv-004', project_id: 'proj-002', number: 'INV-2026-004', description: 'GlobFam Platform — Discovery Phase', amount: 650000, status: 'paid', due_date: '2026-02-15T00:00:00Z', paid_at: '2026-02-14T09:00:00Z', stripe_checkout_url: null, created_at: '2026-01-20T00:00:00Z', project: mockProjects[1] },
  { id: 'inv-005', project_id: 'proj-002', number: 'INV-2026-005', description: 'GlobFam Platform — Development Sprint 1-2', amount: 1100000, status: 'overdue', due_date: '2026-02-28T00:00:00Z', paid_at: null, stripe_checkout_url: 'https://checkout.stripe.com/placeholder', created_at: '2026-02-15T00:00:00Z', project: mockProjects[1] },
  { id: 'inv-006', project_id: 'proj-003', number: 'INV-2026-006', description: 'TACTIX Learning Platform — Discovery & Prototype', amount: 750000, status: 'draft', due_date: '2026-03-31T00:00:00Z', paid_at: null, stripe_checkout_url: null, created_at: '2026-03-01T00:00:00Z', project: mockProjects[2] },
];

export function getMockInvoices(): Invoice[] { return mockInvoices; }

// ============================================================================
// SPARKLINE DATA — 30-day activity frequency per project (mock)
// ============================================================================

export const mockSparklineData: Record<string, number[]> = {
  'proj-001': [0, 1, 0, 2, 1, 3, 2, 1, 0, 1, 2, 3, 1, 2, 0, 1, 3, 2, 4, 2, 1, 3, 2, 1, 2, 3, 4, 2, 3, 5],
  'proj-002': [1, 0, 0, 1, 0, 1, 2, 0, 0, 1, 0, 0, 1, 2, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 2, 1, 0, 1],
  'proj-003': [0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 2, 1, 0, 1, 1, 2],
  'proj-004': [3, 2, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'proj-005': [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};
