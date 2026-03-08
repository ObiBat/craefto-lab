// ============================================================================
// LINEAR API CLIENT — Sync projects & tasks from Linear
// ============================================================================

import type { LinearProject, LinearIssue } from './types';

const LINEAR_API_URL = 'https://api.linear.app/graphql';

async function linearQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    throw new Error('LINEAR_API_KEY environment variable is not set');
  }

  const res = await fetch(LINEAR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Linear API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`Linear GraphQL error: ${json.errors[0].message}`);
  }

  return json.data;
}

// ============================================================================
// FETCH PROJECTS
// ============================================================================

export async function fetchLinearProjects(): Promise<LinearProject[]> {
  const data = await linearQuery<{
    projects: { nodes: LinearProject[] };
  }>(`
    query {
      projects(first: 50) {
        nodes {
          id
          name
          description
          state
          progress
          startDate
          targetDate
        }
      }
    }
  `);

  return data.projects.nodes;
}

// ============================================================================
// FETCH PROJECT ISSUES
// ============================================================================

export async function fetchLinearProjectIssues(projectId: string): Promise<LinearIssue[]> {
  const data = await linearQuery<{
    project: { issues: { nodes: LinearIssue[] } };
  }>(
    `
    query($projectId: String!) {
      project(id: $projectId) {
        issues(first: 100) {
          nodes {
            id
            identifier
            title
            description
            state {
              name
              type
            }
            priority
            assignee {
              id
              name
              avatarUrl
            }
            dueDate
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
    { projectId }
  );

  return data.project.issues.nodes;
}

// ============================================================================
// FETCH TEAM ISSUES (by team ID)
// ============================================================================

export async function fetchLinearTeamIssues(teamId: string): Promise<LinearIssue[]> {
  const data = await linearQuery<{
    team: { issues: { nodes: LinearIssue[] } };
  }>(
    `
    query($teamId: String!) {
      team(id: $teamId) {
        issues(first: 100, orderBy: updatedAt) {
          nodes {
            id
            identifier
            title
            description
            state {
              name
              type
            }
            priority
            assignee {
              id
              name
              avatarUrl
            }
            dueDate
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
    { teamId }
  );

  return data.team.issues.nodes;
}

// ============================================================================
// MAP LINEAR STATE TO PORTAL STATUS
// ============================================================================

export function mapLinearStateToTaskStatus(stateType: string): string {
  const mapping: Record<string, string> = {
    backlog: 'backlog',
    unstarted: 'todo',
    started: 'in_progress',
    completed: 'done',
    cancelled: 'cancelled',
  };
  return mapping[stateType] ?? 'backlog';
}

export function mapLinearPriorityToPortal(priority: number): string {
  const mapping: Record<number, string> = {
    0: 'none',
    1: 'urgent',
    2: 'high',
    3: 'medium',
    4: 'low',
  };
  return mapping[priority] ?? 'none';
}
