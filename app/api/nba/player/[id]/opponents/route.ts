import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface Opponent {
  id: number;
  name: string;
}

// Returns a list of opponent teams a NBA player has faced, derived from game logs
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const playerId = Number(params.id);

  // Step 1: Fetch opponent team IDs from gamelogs
  const { data: rawRows, error: rowsError } = await supabase
    .from('nba_player_gamelogs')
    .select('opponent_team_id')
    .eq('player_id', playerId);

  if (rowsError) {
    return NextResponse.json({ error: rowsError.message }, { status: 500 });
  }

  const uniqueIds = Array.from(new Set((rawRows ?? []).map((r: any) => r.opponent_team_id))).filter(Boolean);
  if (uniqueIds.length === 0) {
    return NextResponse.json([]);
  }

  // Step 2: Map opponent_team_id to names
  const { data: teams, error: teamsError } = await supabase
    .from('nba_teams')
    .select('team_id, team_name')
    .in('team_id', uniqueIds);

  if (teamsError) {
    return NextResponse.json({ error: teamsError.message }, { status: 500 });
  }

  const opponents: Opponent[] = uniqueIds
    .map((id) => {
      const team = teams?.find((t: any) => t.team_id === id);
      return { id, name: team?.team_name ?? 'Unknown' };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(opponents);
}