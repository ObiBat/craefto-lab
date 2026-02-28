-- ============================================================================
-- STAKEHOLDER UPDATES PORTAL — Seed Data
-- Run this against the Supabase database to populate demo data.
-- Demo credentials: demo@craefto.com / demo123456
-- ============================================================================

-- Note: Auth users must be created first via Supabase Auth API or the SQL below.
-- The auth.users inserts below create users directly for seeding purposes.

-- Create demo user
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000', 'c960fb8d-ab32-4845-9529-4d869e53b97e', 'authenticated', 'authenticated', 'demo@craefto.com', crypt('demo123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Demo User"}', now(), now(), '', '', '', '')
ON CONFLICT DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'c960fb8d-ab32-4845-9529-4d869e53b97e', 'demo@craefto.com', jsonb_build_object('sub', 'c960fb8d-ab32-4845-9529-4d869e53b97e', 'email', 'demo@craefto.com', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
ON CONFLICT DO NOTHING;

-- Create additional team members
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'a1111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'sara@craefto.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sara Chen"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a2222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'alex@craefto.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Alex Rivera"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a3333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'maya@craefto.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Maya Patel"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a4444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'james@craefto.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"James Okonkwo"}', now(), now(), '', '', '', '')
ON CONFLICT DO NOTHING;

-- Portal users
INSERT INTO portal_users (id, email, full_name, avatar_url, role) VALUES
  ('c960fb8d-ab32-4845-9529-4d869e53b97e', 'demo@craefto.com', 'Demo User', null, 'admin'),
  ('a1111111-1111-1111-1111-111111111111', 'sara@craefto.com', 'Sara Chen', null, 'project_manager'),
  ('a2222222-2222-2222-2222-222222222222', 'alex@craefto.com', 'Alex Rivera', null, 'team_member'),
  ('a3333333-3333-3333-3333-333333333333', 'maya@craefto.com', 'Maya Patel', null, 'team_member'),
  ('a4444444-4444-4444-4444-444444444444', 'james@craefto.com', 'James Okonkwo', null, 'stakeholder')
ON CONFLICT DO NOTHING;

-- Projects
INSERT INTO portal_projects (id, name, slug, description, status, progress, start_date, target_date) VALUES
  ('11111111-aaaa-bbbb-cccc-111111111111', 'Meridian Brand Refresh', 'meridian-brand-refresh', 'Complete brand identity overhaul for Meridian Health including logo system, color palette, typography, brand guidelines, and digital asset library.', 'on_track', 72, '2026-01-15', '2026-04-30'),
  ('22222222-aaaa-bbbb-cccc-222222222222', 'Flux SaaS Platform', 'flux-saas-platform', 'Full-stack SaaS platform build for Flux Analytics including dashboard, data visualization, user management, billing integration, and API.', 'at_risk', 45, '2026-02-01', '2026-05-15'),
  ('33333333-aaaa-bbbb-cccc-333333333333', 'Solaris Marketing Site', 'solaris-marketing-site', 'High-conversion marketing website for Solaris Energy with interactive 3D elements, case studies, and lead generation flows.', 'on_track', 88, '2025-11-01', '2026-03-15'),
  ('44444444-aaaa-bbbb-cccc-444444444444', 'Hatch Mobile App', 'hatch-mobile-app', 'React Native mobile application for Hatch Education including student portal, course management, and real-time messaging.', 'blocked', 31, '2026-01-20', '2026-06-01'),
  ('55555555-aaaa-bbbb-cccc-555555555555', 'Craefto Lab Internal Tools', 'craefto-internal-tools', 'Internal tooling suite including project management dashboard, time tracking, and client communication portal.', 'on_track', 55, '2026-02-10', '2026-07-01')
ON CONFLICT DO NOTHING;

-- (Team members, tasks, updates, and timeline events follow the same pattern as applied via migration)
-- See the full seed data in the Supabase dashboard.
