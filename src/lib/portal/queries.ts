import { createBrowserClient } from './supabase-auth';
import { sanitizeUpdateInput } from './sanitize';
import { fetchLinearProjectTasks, fetchLinearMilestones } from './linear';
import type {
  Project,
  ProjectWithMeta,
  Task,
  Update,
  TeamMember,
  PortalUser,
  DashboardData,
  ProjectDetailData,
  CreateUpdateInput,
  LinearTask,
  LinearMilestone,
} from './types';

function getClient() {
  return createBrowserClient();
}

// ============================================================================
// DASHBOARD
// ============================================================================

export async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = getClient();
  const [projectsRes, updatesRes] = await Promise.all([
    supabase.from('portal_projects').select('*').order('updated_at', { ascending: false }),
    supabase.from('portal_updates').select('*, author:portal_users(*), project:portal_projects(id, name, slug)').order('created_at', { ascending: false }).limit(10),
  ]);

  const projects = (projectsRes.data ?? []) as Project[];
  const recentUpdates = (updatesRes.data ?? []) as Update[];

  const projectsWithMeta: ProjectWithMeta[] = await Promise.all(
    projects.map(async (project) => {
      try {
        const [tasksRes, teamRes, updatesCountRes, latestUpdateRes] = await Promise.all([
          supabase.from('portal_tasks').select('id, status').eq('project_id', project.id),
          supabase.from('portal_team_members').select('*, user:portal_users(*)').eq('project_id', project.id),
          supabase.from('portal_updates').select('id', { count: 'exact' }).eq('project_id', project.id),
          supabase.from('portal_updates').select('*, author:portal_users(*)').eq('project_id', project.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        ]);
        const tasks = tasksRes.data ?? [];
        const team = (teamRes.data ?? []) as TeamMember[];
        return {
          ...project,
          task_count: tasks.length,
          completed_task_count: tasks.filter((t: { status: string }) => t.status === 'done').length,
          team_members: team,
          update_count: updatesCountRes.count ?? 0,
          latest_update: (latestUpdateRes.data as Update) ?? null,
        };
      } catch {
        return {
          ...project,
          task_count: 0,
          completed_task_count: 0,
          team_members: [],
          update_count: 0,
          latest_update: null,
        };
      }
    })
  );

  return {
    projects: projectsWithMeta,
    recent_updates: recentUpdates,
    stats: {
      total_projects: projects.length,
      on_track: projects.filter((p) => p.status === 'on_track').length,
      at_risk: projects.filter((p) => p.status === 'at_risk').length,
      blocked: projects.filter((p) => p.status === 'blocked').length,
    },
  };
}

// ============================================================================
// PROJECT DETAIL
// ============================================================================

export async function fetchProjectDetail(projectId: string): Promise<ProjectDetailData | null> {
  const supabase = getClient();
  try {
    const [projectRes, updatesRes, tasksRes, teamRes, timelineRes] = await Promise.all([
      supabase.from('portal_projects').select('*').eq('id', projectId).single(),
      supabase.from('portal_updates').select('*, author:portal_users(*)').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('portal_tasks').select('*, assignee:portal_users(*)').eq('project_id', projectId).order('sort_order', { ascending: true }),
      supabase.from('portal_team_members').select('*, user:portal_users(*)').eq('project_id', projectId),
      supabase.from('portal_timeline_events').select('*, actor:portal_users(*)').eq('project_id', projectId).order('created_at', { ascending: false }).limit(50),
    ]);

    if (!projectRes.data) return null;
    return {
      project: projectRes.data as Project,
      updates: (updatesRes.data ?? []) as Update[],
      tasks: (tasksRes.data ?? []) as Task[],
      team_members: (teamRes.data ?? []) as (TeamMember & { user: PortalUser })[],
      timeline: (timelineRes.data ?? []) as unknown as import('./types').TimelineEvent[],
    };
  } catch {
    return null;
  }
}

// ============================================================================
// PROJECT WITH LINEAR DATA
// ============================================================================

export async function fetchProjectWithLinear(projectId: string): Promise<{
  project: Project;
  tasks: LinearTask[];
  milestones: LinearMilestone[];
} | null> {
  const supabase = getClient();
  try {
    const { data: project } = await supabase
      .from('portal_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) return null;

    const typedProject = project as Project;

    // If the project has a linked Linear project, fetch tasks and milestones
    let tasks: LinearTask[] = [];
    let milestones: LinearMilestone[] = [];

    if (typedProject.linear_project_id) {
      try {
        [tasks, milestones] = await Promise.all([
          fetchLinearProjectTasks(typedProject.linear_project_id),
          fetchLinearMilestones(typedProject.linear_project_id),
        ]);
      } catch {
        // Linear API errors should not break the page
      }
    }

    return { project: typedProject, tasks, milestones };
  } catch {
    return null;
  }
}

// ============================================================================
// PROJECTS
// ============================================================================

export async function fetchProjects(): Promise<Project[]> {
  const supabase = getClient();
  const { data } = await supabase.from('portal_projects').select('*').order('updated_at', { ascending: false });
  return (data ?? []) as Project[];
}

export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = getClient();
  const { data } = await supabase.from('portal_projects').select('*').eq('slug', slug).single();
  return (data as Project) ?? null;
}

// ============================================================================
// TASKS
// ============================================================================

export async function updateTaskStatus(taskId: string, status: string): Promise<Task> {
  const supabase = getClient();
  const { data, error } = await supabase.from('portal_tasks').update({ status }).eq('id', taskId).select().single();
  if (error) throw error;
  return data as Task;
}

// ============================================================================
// UPDATES
// ============================================================================

export async function createUpdate(input: CreateUpdateInput): Promise<Update> {
  const sanitized = sanitizeUpdateInput(input);
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('portal_updates').insert({ ...sanitized, author_id: user.id }).select('*, author:portal_users(*)').single();
  if (error) throw error;
  return data as Update;
}

// ============================================================================
// TEAM
// ============================================================================

export async function fetchTeamMembers(projectId: string): Promise<(TeamMember & { user: PortalUser })[]> {
  const supabase = getClient();
  const { data } = await supabase.from('portal_team_members').select('*, user:portal_users(*)').eq('project_id', projectId);
  return (data ?? []) as (TeamMember & { user: PortalUser })[];
}

// ============================================================================
// PORTAL USERS
// ============================================================================

export async function fetchAllPortalUsers(): Promise<PortalUser[]> {
  const supabase = getClient();
  const { data } = await supabase.from('portal_users').select('*').order('full_name');
  return (data ?? []) as PortalUser[];
}
