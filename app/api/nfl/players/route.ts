import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Returns a list of NFL players with id and full name
export async function GET() {
  const { data, error } = await supabase
    .from('nflplayers')
    .select('player_id, full_name')
    .order('full_name', { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}