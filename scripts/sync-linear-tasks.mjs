#!/usr/bin/env node
/**
 * Sync Linear issues to portal_tasks in Supabase.
 * Run: node scripts/sync-linear-tasks.mjs
 *
 * Requires env vars:
 *   LINEAR_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

const LINEAR_API = 'https://api.linear.app/graphql';
const LINEAR_KEY = process.env.LINEAR_API_KEY;
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!LINEAR_KEY || !SB_URL || !SB_KEY) {
  console.error('Missing env vars: LINEAR_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SB_URL, SB_KEY);

const STATUS_MAP = {
  backlog: 'backlog',
  unstarted: 'todo',
  started: 'in_progress',
  completed: 'done',
  canceled: 'cancelled',
  cancelled: 'cancelled',
  triage: 'backlog',
};

const PRIORITY_MAP = { 0: 'none', 1: 'urgent', 2: 'high', 3: 'medium', 4: 'low' };

async function linearQuery(query) {
  const res = await fetch(LINEAR_API, {
    method: 'POST',
    headers: { 'Authorization': LINEAR_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

async function fetchAllIssues(teamKeys) {
  let allIssues = [];
  let hasMore = true;
  let cursor = null;

  while (hasMore) {
    const afterClause = cursor ? `, after: "${cursor}"` : '';
    const { data } = await linearQuery(`{
      issues(first: 50${afterClause}, filter: { team: { key: { in: ${JSON.stringify(teamKeys)} } } }) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id identifier title description
          state { name type }
          priority
          assignee { id name email }
          dueDate createdAt updatedAt
          project { id name }
          team { key }
        }
      }
    }`);

    allIssues = allIssues.concat(data.issues.nodes);
    hasMore = data.issues.pageInfo.hasNextPage;
    cursor = data.issues.pageInfo.endCursor;
  }

  return allIssues;
}

async function main() {
  console.log('Fetching portal projects...');
  const { data: projects } = await supabase.from('portal_projects').select('id, linear_team_id, linear_project_id');
  if (!projects?.length) { console.error('No projects found'); process.exit(1); }

  const teamToProject = {};
  const linearProjectToPortal = {};
  for (const p of projects) {
    if (p.linear_team_id) teamToProject[p.linear_team_id] = p.id;
    if (p.linear_project_id) linearProjectToPortal[p.linear_project_id] = p.id;
  }

  console.log('Fetching Linear issues...');
  const issues = await fetchAllIssues(['GFM', 'CRA']);
  console.log(`Found ${issues.length} issues`);

  // Resolve or create assignee users
  const assigneeMap = {};
  for (const issue of issues) {
    if (issue.assignee && !assigneeMap[issue.assignee.id]) {
      const { data: existing } = await supabase
        .from('portal_users')
        .select('id')
        .eq('email', issue.assignee.email)
        .maybeSingle();

      if (existing) {
        assigneeMap[issue.assignee.id] = existing.id;
      } else {
        const { data: newUser } = await supabase
          .from('portal_users')
          .insert({
            email: issue.assignee.email,
            full_name: issue.assignee.name || issue.assignee.email.split('@')[0],
            role: 'team_member',
          })
          .select('id')
          .single();
        if (newUser) assigneeMap[issue.assignee.id] = newUser.id;
      }
    }
  }

  // Upsert tasks
  let created = 0, updated = 0, skipped = 0;

  for (const issue of issues) {
    // Resolve project
    let portalProjectId = null;
    if (issue.project?.id && linearProjectToPortal[issue.project.id]) {
      portalProjectId = linearProjectToPortal[issue.project.id];
    } else {
      // Fall back to team mapping
      for (const [teamId, projectId] of Object.entries(teamToProject)) {
        // We need to match by team key, but we stored team ID
        // The team key is in issue.team.key, match via project
        if (issue.team?.key === 'GFM' && projects.find(p => p.id === projectId)?.linear_team_id === teamToProject[Object.keys(teamToProject).find(k => projects.find(pp => pp.id === teamToProject[k] && pp.linear_team_id === k))]) {
          portalProjectId = projectId;
        }
      }
      // Simpler: match by team key
      for (const p of projects) {
        if (issue.team?.key === 'GFM' && p.linear_team_id === '3244cec5-e42b-44d5-849d-8223b40b6825') portalProjectId = p.id;
        if (issue.team?.key === 'CRA' && p.linear_team_id === '226b1bfb-3262-42f7-87c5-359b5621f4b1') portalProjectId = p.id;
      }
    }

    if (!portalProjectId) { skipped++; continue; }

    const stateType = issue.state?.type?.toLowerCase() || 'backlog';
    const task = {
      project_id: portalProjectId,
      title: issue.title,
      description: issue.description || null,
      status: STATUS_MAP[stateType] || 'backlog',
      priority: PRIORITY_MAP[issue.priority] || 'medium',
      assignee_id: issue.assignee ? assigneeMap[issue.assignee.id] || null : null,
      linear_issue_id: issue.id,
      linear_identifier: issue.identifier,
      due_date: issue.dueDate || null,
      created_at: issue.createdAt,
      updated_at: issue.updatedAt,
    };

    const { data: existing } = await supabase
      .from('portal_tasks')
      .select('id')
      .eq('linear_issue_id', issue.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('portal_tasks').update(task).eq('id', existing.id);
      updated++;
    } else {
      await supabase.from('portal_tasks').insert(task);
      created++;
    }
  }

  console.log(`\nSync complete: ${created} created, ${updated} updated, ${skipped} skipped`);

  // Update project progress
  for (const p of projects) {
    const { data: tasks } = await supabase.from('portal_tasks').select('status').eq('project_id', p.id);
    if (tasks?.length) {
      const done = tasks.filter(t => t.status === 'done').length;
      const progress = Math.round((done / tasks.length) * 100);
      await supabase.from('portal_projects').update({ progress }).eq('id', p.id);
      console.log(`Updated ${p.id} progress: ${progress}% (${done}/${tasks.length})`);
    }
  }
}

main().catch(console.error);
