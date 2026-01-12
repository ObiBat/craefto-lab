import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: stages, error } = await supabase
      .from('pipeline_stages')
      .select('id, name, color, position')
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching stages:', error);
      return NextResponse.json({ error: 'Failed to fetch stages' }, { status: 500 });
    }

    return NextResponse.json({ stages: stages || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stages' }, { status: 500 });
  }
}
