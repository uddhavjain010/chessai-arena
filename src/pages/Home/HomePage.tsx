import React from 'react';
import { Bot, Users, Puzzle, Sparkles, BarChart3, Trophy, Flame, ChevronRight } from 'lucide-react';
import { UserStats } from '../../types/chess';
import { NavTab } from '../../components/Navigation/Navbar';

interface HomePageProps {
  stats: UserStats;
  onNavigate: (tab: NavTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ stats, onNavigate }) => {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Header */}
      <div className="text-center relative py-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Next-Generation Chess Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
          CHESSAI{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            ARENA
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium">
          Play. Analyze. Improve.
        </p>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2">
          Challenge progressive AI engines, practice tactical puzzles, and receive grandmaster-grade game reviews with AI Coach breakdowns.
        </p>
      </div>

      {/* Main Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Play vs AI */}
        <div
          onClick={() => onNavigate('game-ai')}
          className="glass-panel p-6 rounded-2xl border border-slate-700/80 hover:border-cyan-400/60 hover:bg-slate-850/80 cursor-pointer transition-all duration-200 group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-cyan-400">
            <Bot className="w-24 h-24" />
          </div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
              Play vs AI
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Match your wits against adaptive engine levels ranging from Beginner to Expert with live evaluation.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
            Start AI Match <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Local 2 Player */}
        <div
          onClick={() => onNavigate('game-local')}
          className="glass-panel p-6 rounded-2xl border border-slate-700/80 hover:border-emerald-400/60 hover:bg-slate-850/80 cursor-pointer transition-all duration-200 group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-emerald-400">
            <Users className="w-24 h-24" />
          </div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
              Local 2 Player
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Pass-and-play chess on a single device with official clocks, move history, and sound effects.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
            Launch 2P Board <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Chess Puzzles */}
        <div
          onClick={() => onNavigate('puzzles')}
          className="glass-panel p-6 rounded-2xl border border-slate-700/80 hover:border-amber-400/60 hover:bg-slate-850/80 cursor-pointer transition-all duration-200 group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-amber-400">
            <Puzzle className="w-24 h-24" />
          </div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Puzzle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
              Tactical Puzzles
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Sharpen your tactical radar with curated puzzles covering pins, forks, skewers, and checkmate patterns.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            Solve Tactics <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Game Analysis */}
        <div
          onClick={() => onNavigate('analysis')}
          className="glass-panel p-6 rounded-2xl border border-slate-700/80 hover:border-indigo-400/60 hover:bg-slate-850/80 cursor-pointer transition-all duration-200 group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-indigo-400">
            <Sparkles className="w-24 h-24" />
          </div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
              Game Analysis
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Review completed matches with engine evaluations, mistake classifications, and personalized AI Coach reports.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
            Analyze Past Games <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Statistics */}
        <div
          onClick={() => onNavigate('stats')}
          className="glass-panel p-6 rounded-2xl border border-slate-700/80 hover:border-purple-400/60 hover:bg-slate-850/80 cursor-pointer transition-all duration-200 group relative overflow-hidden flex flex-col justify-between md:col-span-2"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-purple-400">
            <BarChart3 className="w-24 h-24" />
          </div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
              Player Statistics & History
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Inspect your win/loss trends, accuracy rates, streak records, and export or import your PGN game library.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
            View Career Stats <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>

      {/* Career Overview Stats Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/70">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          Your Chess Career Snapshot
        </h3>

        {stats.gamesPlayed === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm italic">
            No games yet. Start your first match above to build your rating and history!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-semibold mb-1">Played</div>
              <div className="text-2xl font-extrabold text-white">{stats.gamesPlayed}</div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-emerald-400 font-semibold mb-1">Wins</div>
              <div className="text-2xl font-extrabold text-emerald-400">{stats.wins}</div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-rose-400 font-semibold mb-1">Losses</div>
              <div className="text-2xl font-extrabold text-rose-400">{stats.losses}</div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-semibold mb-1">Draws</div>
              <div className="text-2xl font-extrabold text-slate-300">{stats.draws}</div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-cyan-400 font-semibold mb-1">Win Rate</div>
              <div className="text-2xl font-extrabold text-cyan-300">{winRate}%</div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-amber-400 font-semibold mb-1 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5" /> Streak
              </div>
              <div className="text-2xl font-extrabold text-amber-400">{stats.winStreak}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
