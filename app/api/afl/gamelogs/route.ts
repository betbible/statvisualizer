import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Returns raw gamelogs for a given AFL player. Accepts query params: playerId, season, period
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const playerIdParam = url.searchParams.get('playerId');
  const season = url.searchParams.get('season');
  const period = url.searchParams.get('period');

  if (!playerIdParam) {
    return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
  }

  const playerId = Number(playerIdParam);
  let q = supabase
    .from('afl_player_gamelogs')
    .select('game_date, season_type, pts, reb, ast, minutes_played, opponent_team_id')
    .eq('player_id', playerId);

  if (season) q = q.eq('season', season);
  if (period) q = q.eq('season_type', period);

  const { data, error } = await q.order('game_date', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}