const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vugaieeadequzuplvcqp.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1Z2FpZWVhZGVxdXp1cGx2Y3FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAzNDM4OCwiZXhwIjoyMDgzNjEwMzg4fQ.L_gz5RYd2U16FB9wCGxRJMhpmFTyz_AfXp7xy772-Xw';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// SQL statements to execute
const statements = [
  // Enable UUID extension
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

  // Pipeline stages table
  `CREATE TABLE IF NOT EXISTS pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    "order" INTEGER NOT NULL,
    color TEXT DEFAULT '#4A4A4A',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Leads table
  `CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    website TEXT,
    service_interest TEXT,
    budget_range TEXT,
    timeline TEXT,
    message TEXT,
    source TEXT DEFAULT 'website',
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    referrer TEXT,
    landing_page TEXT,
    stage_id UUID,
    score INTEGER DEFAULT 10,
    status TEXT DEFAULT 'active',
    is_qualified BOOLEAN DEFAULT FALSE,
    ip_address TEXT,
    user_agent TEXT,
    country TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    contacted_at TIMESTAMPTZ,
    qualified_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
  )`,

  // Lead activities table
  `CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    actor_type TEXT DEFAULT 'system',
    actor_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Email logs table
  `CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID,
    to_email TEXT NOT NULL,
    from_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template TEXT,
    status TEXT DEFAULT 'sent',
    resend_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ
  )`,

  // Page views table
  `CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path TEXT NOT NULL,
    title TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    visitor_id TEXT,
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    country TEXT,
    city TEXT,
    device_type TEXT,
    browser TEXT,
    lead_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Tasks table
  `CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'follow_up',
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`
];

async function setupDatabase() {
  console.log('Setting up database via Supabase RPC...\n');

  // First, let's check if we can use RPC to execute SQL
  // If not, we'll create tables through the REST API by inserting data

  // Try to insert default pipeline stages
  console.log('Creating pipeline stages...');
  const stages = [
    { name: 'New', slug: 'new', order: 1, color: '#6B7280' },
    { name: 'Contacted', slug: 'contacted', order: 2, color: '#3B82F6' },
    { name: 'Qualified', slug: 'qualified', order: 3, color: '#8B5CF6' },
    { name: 'Proposal Sent', slug: 'proposal', order: 4, color: '#F59E0B' },
    { name: 'Negotiation', slug: 'negotiation', order: 5, color: '#EC4899' },
    { name: 'Won', slug: 'won', order: 6, color: '#10B981' },
    { name: 'Lost', slug: 'lost', order: 7, color: '#EF4444' }
  ];

  const { error: stagesError } = await supabase
    .from('pipeline_stages')
    .upsert(stages, { onConflict: 'slug' });

  if (stagesError) {
    if (stagesError.code === 'PGRST205') {
      console.log('Tables do not exist yet. Please run the SQL migration manually:');
      console.log('\n1. Go to: https://supabase.com/dashboard/project/vugaieeadequzuplvcqp/sql');
      console.log('2. Copy and paste the contents of: supabase/migrations/001_initial_schema.sql');
      console.log('3. Click "Run"\n');
      return;
    }
    console.error('Error:', stagesError.message);
  } else {
    console.log('Pipeline stages created successfully!');
  }

  // Test by checking if leads table exists
  const { data, error } = await supabase.from('leads').select('count').limit(1);

  if (error && error.code === 'PGRST205') {
    console.log('\n⚠️  Tables not found. Please run the SQL migration in Supabase dashboard.');
  } else {
    console.log('\n✅ Database setup complete!');
  }
}

setupDatabase();
