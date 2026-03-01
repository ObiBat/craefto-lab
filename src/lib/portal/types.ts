// ============================================================================
// PORTAL TYPES — Stakeholder Updates Portal
// ============================================================================

export type UserRole = 'admin' | 'project_manager' | 'stakeholder' | 'team_member';

export type ProjectStatus = 'on_track' | 'at_risk' | 'blocked' | 'completed' | 'paused';

export type UpdateType = 'alignment' | 'decision' | 'blocker' | 'milestone' | 'task_update';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

// ============================================================================
// DATABASE MODELS
// ============================================================================

export interface PortalUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  progress: number; // 0-100
  start_date: string | null;
  target_date: string | null;
  linear_team_id: string | null;
  linear_project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  linear_issue_id: string | null;
  linear_identifier: string | null;
  due_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined
  assignee?: PortalUser | null;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number; // bytes
}

export interface Update {
  id: string;
  project_id: string;
  author_id: string;
  type: UpdateType;
  title: string;
  content: string; // Rich text HTML
  tags: string[];
  mentions: string[]; // user IDs
  pinned: boolean;
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
  // Joined
  author?: PortalUser;
  project?: Project;
}

export interface TeamMember {
  id: string;
  project_id: string;
  user_id: string;
  role_in_project: string; // e.g. "Lead Designer", "Backend Engineer"
  joined_at: string;
  // Joined
  user?: PortalUser;
}

// ============================================================================
// VIEW MODELS / COMPOSITES
// ============================================================================

export interface ProjectWithMeta extends Project {
  latest_update?: Update | null;
  task_count: number;
  completed_task_count: number;
  team_members: TeamMember[];
  update_count: number;
}

export interface DashboardData {
  projects: ProjectWithMeta[];
  recent_updates: Update[];
  stats: {
    total_projects: number;
    on_track: number;
    at_risk: number;
    blocked: number;
  };
}

export interface ProjectDetailData {
  project: Project;
  updates: Update[];
  tasks: Task[];
  team_members: (TeamMember & { user: PortalUser })[];
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  type: 'update' | 'task_completed' | 'status_change' | 'member_joined' | 'milestone';
  title: string;
  description: string | null;
  timestamp: string;
  actor?: PortalUser;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateUpdateInput {
  project_id: string;
  type: UpdateType;
  title: string;
  content: string;
  tags: string[];
  mentions: string[];
  attachments: Attachment[];
}

export interface LoginInput {
  email: string;
  password: string;
}

// ============================================================================
// LINEAR INTEGRATION
// ============================================================================

export interface LinearProject {
  id: string;
  name: string;
  description: string | null;
  state: string;
  progress: number;
  startDate: string | null;
  targetDate: string | null;
}

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  state: { name: string; type: string };
  priority: number;
  assignee: { id: string; name: string; avatarUrl: string | null } | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// REAL-TIME
// ============================================================================

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload<T> {
  eventType: RealtimeEvent;
  new: T;
  old: Partial<T>;
}

// ============================================================================
// FILTER / SORT
// ============================================================================

export type ProjectFilter = 'all' | ProjectStatus;
export type UpdateFilter = 'all' | UpdateType;
export type TaskView = 'kanban' | 'list';
export type ProjectTab = 'updates' | 'tasks' | 'team' | 'timeline';
