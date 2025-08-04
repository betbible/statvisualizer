import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface MVAvgRaw {
  avg_pts_regular: string | null;
  avg_reb_regular: string | null;
  avg_ast_regular: string | null;
  avg_pts_playoff: string | null;
  avg_reb_playoff: string | null;
  avg_ast_playoff: string | null;
}

// Returns aggregate gamelogs and average stats for the given NRL player
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const playerId = Number(params.id);
  const url = new URL(req.url);
  const season = url.searchParams.get('season')!;
  const windowSize = Number(url.searchParams.get('window'));
  const teamParam = url.searchParams.get('team')!;
  const period = url.searchParams.get('period')!;
  const isAllTeams = teamParam === 'all' || teamParam === '0';
  // 1) Last N games
  let q: any = supabase
    .from('nrl_player_gamelogs')
    .select('game_date, season_type, pts, reb, ast, minutes_played, opponent_team_id')
    .eq('player_id', playerId)
    .eq('season', season)
    .eq('season_type', period)
    .order('game_date', { ascending: false })
    .limit(windowSize);
  if (!isAllTeams) {
    q = q.eq('opponent_team_id', Number(teamParam));
  }
  const { data: logsData, error: logsErr } = await q;
  if (logsErr) return NextResponse.json({ error: logsErr.message }, { status: 500 });
  const gameLogs = (logsData ?? []).reverse();
  // 2) Season averages from MV table
  const { data: mvRaw, error: mvErr } = await supabase
    .from('mv_nrl_player_avgs')
    .select(
      `avg_pts_regular, avg_reb_regular, avg_ast_regular, avg_pts_playoff, avg_reb_playoff, avg_ast_playoff`,
    )
    .eq('player_id', playerId)
    .eq('season', season)
    .maybeSingle();
  if (mvErr) return NextResponse.json({ error: mvErr.message }, { status: 500 });
  const mv: MVAvgRaw = (mvRaw as MVAvgRaw | null) || ({} as MVAvgRaw);
  const seasonAvgs = {
    pts: parseFloat(period === 'Playoff' ? mv.avg_pts_playoff ?? '0' : mv.avg_pts_regular ?? '0'),
    reb: parseFloat(period === 'Playoff' ? mv.avg_reb_playoff ?? '0' : mv.avg_reb_regular ?? '0'),
    ast: parseFloat(period === 'Playoff' ? mv.avg_ast_playoff ?? '0' : mv.avg_ast_regular ?? '0'),
  };
  // 3) Career average over all logs of this period
  const { data: fullLogs, error: fullErr } = await supabase
    .from('nrl_player_gamelogs')
    .select('pts, reb, ast')
    .eq('player_id', playerId)
    .eq('season_type', period);
  if (fullErr) return NextResponse.json({ error: fullErr.message }, { status: 500 });
  let sumPts = 0,
    sumReb = 0,
    sumAst = 0;
  (fullLogs ?? []).forEach((r: any) => {
    sumPts += r.pts ?? 0;
    sumReb += r.reb ?? 0;
    sumAst += r.ast ?? 0;
  });
  const count = (fullLogs ?? []).length || 1;
  const careerAvgs = {
    pts: +(sumPts / count).toFixed(2),
    reb: +(sumReb / count).toFixed(2),
    ast: +(sumAst / count).toFixed(2),
  };
  return NextResponse.json({ gameLogs, seasonAvgs, careerAvgs });
}