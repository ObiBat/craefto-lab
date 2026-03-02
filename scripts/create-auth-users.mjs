#!/usr/bin/env node
/**
 * Create Supabase Auth users for portal access.
 * Run: node scripts/create-auth-users.mjs
 *
 * Creates auth users and links them to portal_users table.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SB_URL || !SB_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(SB_URL, SB_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const USERS = [
  {
    email: 'obi@craefto.com',
    password: process.env.PORTAL_ADMIN_PASSWORD || 'ChangeMe2026!',
    portalUserId: '00000000-0000-0000-0000-000000000001',
  },
];

async function main() {
  for (const u of USERS) {
    console.log(`Creating auth user: ${u.email}`);

    // Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log(`  Already exists, updating portal_users link...`);
        // Get existing auth user
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existing = users.find(usr => usr.email === u.email);
        if (existing) {
          await supabase.from('portal_users').update({ id: existing.id }).eq('id', u.portalUserId);
          console.log(`  Linked portal_users ${u.portalUserId} → auth ${existing.id}`);
        }
      } else {
        console.error(`  Error: ${error.message}`);
      }
      continue;
    }

    // Update portal_users to match auth user ID
    const authId = data.user.id;
    await supabase.from('portal_users').update({ id: authId }).eq('id', u.portalUserId);
    console.log(`  Created: ${authId}`);

    // Also update team_members and updates to use new ID
    await supabase.from('portal_team_members').update({ user_id: authId }).eq('user_id', u.portalUserId);
    await supabase.from('portal_updates').update({ author_id: authId }).eq('author_id', u.portalUserId);
    await supabase.from('portal_timeline_events').update({ actor_id: authId }).eq('actor_id', u.portalUserId);
    console.log(`  Updated all references`);
  }

  console.log('\nDone! Login at project-portal.craefto.com with:');
  for (const u of USERS) {
    console.log(`  ${u.email} / ${u.password}`);
  }
}

main().catch(console.error);
