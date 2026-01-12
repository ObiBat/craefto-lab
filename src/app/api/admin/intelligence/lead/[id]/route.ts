import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data: analysis, error } = await supabase
      .from('lead_analysis')
      .select('*')
      .eq('lead_id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching analysis:', error);
      return NextResponse.json({ error: 'Failed to fetch analysis' }, { status: 500 });
    }

    return NextResponse.json({ analysis: analysis || null });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analysis' }, { status: 500 });
  }
}
