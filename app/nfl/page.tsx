"use client";

import { useState, useEffect } from 'react';
import PropChart from '@/components/nfl/PropChart';

type Player = { player_id: number; full_name: string };
type Opponent = { id: number; name: string };

const SEASONS = ['2024-25', '2023-24', '2022-23', '2021-22'];
const WINDOWS = [5, 10, 20, 50];
const API_PREFIX = '/api/nfl';

export default function Page() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState<number>();
  const [season, setSeason] = useState(SEASONS[0]);
  const [seasonType, setSeasonType] = useState<'Regular' | 'Playoff'>('Regular');
  const [stats, setStats] = useState<('pts' | 'reb' | 'ast')[]>(['pts']);
  const [windowSize, setWindowSize] = useState<number>(10);
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [oppFilter, setOppFilter] = useState<number>(0);
  const [showSeasonAvg, setShowSeasonAvg] = useState(false);
  const [showCareerAvg, setShowCareerAvg] = useState(false);

  useEffect(() => {
    fetch(`${API_PREFIX}/players`)
      .then((r) => r.json())
      .then((data: any[]) => {
        setPlayers(data);
        if (data.length) setPlayerId(data[0].player_id);
      })
      .catch(() => setPlayers([]));
  }, []);

  useEffect(() => {
    if (!playerId) return;
    fetch(`${API_PREFIX}/player/${playerId}/opponents`)
      .then((r) => r.json())
      .then((data: Opponent[]) => setOpponents(data))
      .catch(() => setOpponents([]));
  }, [playerId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-panel p-6 rounded-2xl shadow border border-border">
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 items-start md:items-center justify-between">
          {/* Player + Season */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="pill-btn"
              value={playerId}
              onChange={(e) => setPlayerId(+e.target.value)}
            >
              {players.map((p) => (
                <option key={p.player_id} value={p.player_id}>
                  {p.full_name}
                </option>
              ))}
            </select>

            <select
              className="pill-btn"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              {SEASONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div className="flex space-x-1">
              {(['Regular', 'Playoff'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSeasonType(t)}
                  className={`pill-btn ${seasonType === t ? 'bg-highlight text-white' : ''}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Stats checkboxes */}
          <div className="flex items-center gap-4">
            {(['pts', 'reb', 'ast'] as const).map((s) => (
              <label key={s} className="flex items-center space-x-1 text-sm">
                <input
                  type="checkbox"
                  checked={stats.includes(s)}
                  onChange={() =>
                    setStats((cur) =>
                      cur.includes(s)
                        ? cur.filter((x) => x !== s)
                        : [...cur, s],
                    )
                  }
                  className="h-4 w-4 text-accent bg-panel border-border rounded"
                />
                <span className="capitalize">{s}</span>
              </label>
            ))}
          </div>

          {/* Window + Opponent */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="pill-btn"
              value={windowSize}
              onChange={(e) => setWindowSize(+e.target.value)}
            >
              {WINDOWS.map((w) => (
                <option key={w} value={w}>
                  Last {w}
                </option>
              ))}
            </select>

            <select
              className="pill-btn"
              value={oppFilter}
              onChange={(e) => setOppFilter(+e.target.value)}
            >
              <option value={0}>All Teams</option>
              {opponents.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Season/Career Avg toggles */}
          <div className="flex items-center gap-4">
            <label className="flex items-center space-x-1 text-sm">
              <input
                type="checkbox"
                checked={showSeasonAvg}
                onChange={() => setShowSeasonAvg((f) => !f)}
                className="h-4 w-4 text-highlight bg-panel border-border rounded"
              />
              <span>Season Avg</span>
            </label>
            <label className="flex items-center space-x-1 text-sm">
              <input
                type="checkbox"
                checked={showCareerAvg}
                onChange={() => setShowCareerAvg((f) => !f)}
                className="h-4 w-4 text-highlight bg-panel border-border rounded"
              />
              <span>Career Avg</span>
            </label>
          </div>
        </div>
      </div>
      {/* Chart or prompt */}
      <div className="bg-panel p-6 rounded-2xl shadow border border-border">
        {playerId && stats.length > 0 ? (
          <PropChart
            playerId={playerId!}
            season={season}
            seasonType={seasonType}
            stats={stats}
            windowSize={windowSize}
            opponent={oppFilter}
            showSeasonAvg={showSeasonAvg}
            showCareerAvg={showCareerAvg}
          />
        ) : (
          <p className="text-gray-400">Select at least one stat.</p>
        )}
      </div>
    </div>
  );
}