import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();

    // Fetch all subscribers
    const { data: subscribers, error } = await supabase
      .from('journal_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch subscribers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

    // Calculate stats
    const stats = {
      total: subscribers?.length || 0,
      confirmed: subscribers?.filter(s => s.status === 'confirmed').length || 0,
      pending: subscribers?.filter(s => s.status === 'pending').length || 0,
      unsubscribed: subscribers?.filter(s => s.status === 'unsubscribed').length || 0,
    };

    return NextResponse.json({
      subscribers: subscribers || [],
      stats,
    });
  } catch (error) {
    console.error('Subscribers API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
