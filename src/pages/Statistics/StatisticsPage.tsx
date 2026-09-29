import React, { useState } from 'react';
import { UserStats, GameRecord } from '../../types/chess';
import { storageService } from '../../services/storage';
import { Trophy, Flame, Clock, BarChart2, Trash2, ExternalLink, Download, AlertTriangle } from 'lucide-react';

interface StatisticsPageProps {
  stats: UserStats;
  onAnalyzeGame: (game: GameRecord) => void;
  onRefreshStats: () => void;
}

export const StatisticsPage: React.FC<StatisticsPageProps> = ({
  stats,
  onAnalyzeGame,
  onRefreshStats
}) => {
  const [games, setGames] = useState<GameRecord[]>(() => storageService.getGames());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  const avgGameLength = stats.gamesPlayed > 0 ? Math.round(stats.totalTimePlayed / stats.gamesPlayed) : 0;
  const puzzleAccuracy = stats.puzzlesAttempted > 0 ? Math.round((stats.puzzlesSolved / stats.puzzlesAttempted) * 100) : 0;

  const handleDeleteGame = (id: string) => {
    storageService.deleteGame(id);
    setGames(storageService.getGames());
    onRefreshStats();
  };

  const handleClearHistory = () => {
    storageService.clearAllGames();
    setGames([]);
    setShowClearConfirm(false);
    onRefreshStats();
  };

  const handleDownloadPgn = (game: GameRecord) => {
    storageService.downloadPgn(game.pgn, `chessai-${game.id}.pgn`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <BarChart2 className="w-8 h-8 text-cyan-400" />
          Player Statistics & Game History
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Detailed metrics, performance ratios, and stored PGN match records.
        </p>
      </div>

      {/* Main KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Win Rate</span>
            <Trophy className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {stats.gamesPlayed > 0 ? `${winRate}%` : '---'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.wins}W - {stats.losses}L - {stats.draws}D
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">
            {stats.winStreak}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Best streak: {stats.maxWinStreak} wins
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Avg Game Time</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {avgGameLength > 0 ? `${Math.floor(avgGameLength / 60)}m ${avgGameLength % 60}s` : '---'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total: {Math.round(stats.totalTimePlayed / 60)} minutes
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Tactics Solved</span>
            <BarChart2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-300">
            {stats.puzzlesSolved}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.puzzlesAttempted > 0 ? `${puzzleAccuracy}% accuracy` : '0 attempts'}
          </p>
        </div>
      </div>

      {/* Visual Distribution Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Win / Loss / Draw Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-slate-900/60">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
            Game Outcome Distribution
          </h3>

          {stats.gamesPlayed === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs italic">
              No games yet. Play games to generate outcome charts.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Ratio bar */}
              <div className="h-4 rounded-full overflow-hidden flex bg-slate-800">
                <div
                  style={{ width: `${(stats.wins / stats.gamesPlayed) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title={`Wins: ${stats.wins}`}
                />
                <div
                  style={{ width: `${(stats.draws / stats.gamesPlayed) * 100}%` }}
                  className="bg-slate-400 h-full"
                  title={`Draws: ${stats.draws}`}
                />
                <div
                  style={{ width: `${(stats.losses / stats.gamesPlayed) * 100}%` }}
                  className="bg-rose-500 h-full"
                  title={`Losses: ${stats.losses}`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                  <div className="text-emerald-400 font-bold">{stats.wins}</div>
                  <div className="text-slate-400 text-[10px]">Wins ({Math.round((stats.wins / stats.gamesPlayed) * 100)}%)</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  <div className="text-slate-300 font-bold">{stats.draws}</div>
                  <div className="text-slate-400 text-[10px]">Draws ({Math.round((stats.draws / stats.gamesPlayed) * 100)}%)</div>
                </div>
                <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/20">
                  <div className="text-rose-400 font-bold">{stats.losses}</div>
                  <div className="text-slate-400 text-[10px]">Losses ({Math.round((stats.losses / stats.gamesPlayed) * 100)}%)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Difficulty Performance */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-slate-900/60">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
            AI Difficulty Win Ratios
          </h3>

          <div className="space-y-2.5 text-xs">
            {(['beginner', 'easy', 'medium', 'hard', 'expert'] as const).map((diff) => {
              const item = stats.difficultyDistribution[diff] || { played: 0, won: 0 };
              const rate = item.played > 0 ? Math.round((item.won / item.played) * 100) : 0;
              return (
                <div key={diff} className="space-y-1">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="capitalize font-semibold text-white">{diff}</span>
                    <span className="font-mono text-slate-400">
                      {item.played > 0 ? `${item.won}/${item.played} (${rate}%)` : '0 played'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Game History Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Stored Match History ({games.length})
          </h3>
          {games.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn-danger py-1.5 px-3 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs italic">
            No games yet in history. Complete your games to store and review them here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Opponent</th>
                  <th className="py-2.5 px-3">Color</th>
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">Moves</th>
                  <th className="py-2.5 px-3">Opening</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {games.map((game) => (
                  <tr key={game.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {new Date(game.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {game.opponent}
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize">{game.playerColor === 'w' ? 'White' : 'Black'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                        game.result === '1-0'
                          ? (game.playerColor === 'w' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300')
                          : game.result === '0-1'
                          ? (game.playerColor === 'b' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300')
                          : 'bg-slate-700/30 text-slate-300'
                      }`}>
                        {game.result}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">{game.moveCount}</td>
                    <td className="py-3 px-3 truncate max-w-[150px]" title={game.opening.name}>
                      {game.opening.name}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onAnalyzeGame(game)}
                          className="p-1.5 rounded hover:bg-cyan-950/60 text-cyan-400 transition-colors"
                          title="Analyze Game"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadPgn(game)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Download PGN"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGame(game.id)}
                          className="p-1.5 rounded hover:bg-rose-950/60 text-rose-400 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal-overlay">
          <div className="glass-panel max-w-sm w-full p-6 text-center border border-rose-500/40 shadow-2xl bg-slate-900">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Clear All Games?</h3>
            <p className="text-xs text-slate-400 mb-6">
              This will permanently delete all stored match records from local storage. Career stats will be preserved.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-secondary flex-1 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="btn-danger flex-1 py-2 text-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
