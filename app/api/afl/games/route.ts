import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Returns a list of all AFL games
export async function GET() {
  const { data, error } = await supabase.from('afl_games').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}