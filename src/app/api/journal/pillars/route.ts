import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: pillars, error } = await supabase
      .from('journal_pillars')
      .select('*')
      .order('display_order');

    if (error) {
      console.error('Error fetching pillars:', error);
      return NextResponse.json({ error: 'Failed to fetch pillars' }, { status: 500 });
    }

    return NextResponse.json({ pillars: pillars || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch pillars' }, { status: 500 });
  }
}
