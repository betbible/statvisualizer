"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Line,
  ReferenceLine,
} from 'recharts';
import { useEffect, useState, useMemo } from 'react';

interface GameLog {
  game_date: string;
  minutes_played: number;
  totalStat: number;
}
interface Averages {
  pts: number;
  reb: number;
  ast: number;
}

interface Props {
  playerId: number;
  season: string;
  seasonType: 'Regular' | 'Playoff';
  stats: ('pts' | 'reb' | 'ast')[];
  windowSize: number;
  opponent: number;
  showSeasonAvg: boolean;
  showCareerAvg: boolean;
}

// Prefix all API calls for the AFL visualizer
const API_PREFIX = '/api/afl';

export default function PropChart(props: Props) {
  const {
    playerId,
    season,
    seasonType,
    stats,
    windowSize,
    opponent,
    showSeasonAvg,
    showCareerAvg,
  } = props;
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [seasonAvgs, setSeasonAvgs] = useState<Averages>({ pts: 0, reb: 0, ast: 0 });
  const [careerAvgs, setCareerAvgs] = useState<Averages>({ pts: 0, reb: 0, ast: 0 });

  useEffect(() => {
    if (!playerId) return;
    const query = `${API_PREFIX}/player/${playerId}?season=${season}&period=${seasonType}&window=${windowSize}&team=${opponent || 'all'}`;
    fetch(query)
      .then((r) => r.json())
      .then((payload) => {
        setLogs(
          (payload.gameLogs ?? []).map((g: any) => ({
            game_date: g.game_date,
            minutes_played: g.minutes_played,
            totalStat: stats.reduce((sum, k) => sum + (g[k] || 0), 0),
          }))
        );
        setSeasonAvgs(payload.seasonAvgs ?? { pts: 0, reb: 0, ast: 0 });
        setCareerAvgs(payload.careerAvgs ?? { pts: 0, reb: 0, ast: 0 });
      })
      .catch(() => {
        setLogs([]);
        setSeasonAvgs({ pts: 0, reb: 0, ast: 0 });
        setCareerAvgs({ pts: 0, reb: 0, ast: 0 });
      });
  }, [playerId, season, seasonType, windowSize, opponent, stats]);

  const data = useMemo(() => logs.slice(-windowSize), [logs, windowSize]);
  const seasonAvgValue = useMemo(
    () => stats.reduce((sum, k) => sum + (seasonAvgs[k] || 0), 0),
    [seasonAvgs, stats],
  );
  const careerAvgValue = useMemo(
    () => stats.reduce((sum, k) => sum + (careerAvgs[k] || 0), 0),
    [careerAvgs, stats],
  );

  if (!data.length) {
    return (
      <p className="text-center text-gray-500">
        No {seasonType.toLowerCase()} games found for {season}.
      </p>
    );
  }

  return (
    <div className="bg-panel p-4 rounded-lg">
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 40, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222a44" />
          <XAxis dataKey="game_date" tick={{ fill: '#888' }} />
          <YAxis yAxisId="left" tick={{ fill: '#888' }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#888' }} />
          <Tooltip contentStyle={{ backgroundColor: '#1f2331', border: 'none' }} labelStyle={{ color: 'white' }} />
          <Legend wrapperStyle={{ color: 'white' }} />
          <Bar yAxisId="left" dataKey="totalStat" fill="#6e63ff" />
          <Line
            type="monotone"
            yAxisId="right"
            dataKey="minutes_played"
            stroke="#ff7800"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          {showSeasonAvg && (
            <ReferenceLine
              y={seasonAvgValue}
              yAxisId="left"
              stroke="skyblue"
              strokeDasharray="3 3"
              label={{
                position: 'insideTopLeft',
                value: `Season Avg: ${seasonAvgValue.toFixed(1)}`,
                fill: 'skyblue',
              }}
            />
          )}
          {showCareerAvg && (
            <ReferenceLine
              y={careerAvgValue}
              yAxisId="left"
              stroke="limegreen"
              strokeDasharray="3 3"
              label={{
                position: 'insideBottomLeft',
                value: `Career Avg: ${careerAvgValue.toFixed(1)}`,
                fill: 'limegreen',
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}