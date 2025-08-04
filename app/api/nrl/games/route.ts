import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Returns a list of all NRL games
export async function GET() {
  const { data, error } = await supabase.from('nrl_games').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}