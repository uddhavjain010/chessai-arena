import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessBoard } from '../../components/ChessBoard/ChessBoard';
import { EvaluationBar } from '../../components/EvaluationBar/EvaluationBar';
import { MoveAnalysis, AppSettings, GameRecord, CoachReport } from '../../types/chess';
import { chessEngine } from '../../chess/stockfish';
import { generateCoachReport } from '../../chess/ai';
import { storageService } from '../../services/storage';
import { formatEvaluation } from '../../chess/evaluation';
import { Sparkles, Bot, AlertTriangle, CheckCircle, ChevronRight, ChevronLeft, Shield, Swords, Brain } from 'lucide-react';

interface AnalysisPageProps {
  settings: AppSettings;
  gameToAnalyze?: GameRecord | null;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({
  settings,
  gameToAnalyze
}) => {
  const [selectedGameId, setSelectedGameId] = useState<string>(gameToAnalyze?.id || '');
  const [analyses, setAnalyses] = useState<MoveAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [activeTab, setActiveTab] = useState<'moves' | 'coach'>('moves');

  const games = storageService.getGames();
  const currentGame = games.find(g => g.id === selectedGameId) || gameToAnalyze || games[0] || null;

  // Board state corresponding to current selected move in history
  const [boardChess, setBoardChess] = useState<Chess>(() => new Chess());
  const [lastMoveSquares, setLastMoveSquares] = useState<{ from: Square; to: Square } | null>(null);

  // Perform move-by-move engine analysis
  useEffect(() => {
    if (!currentGame || !currentGame.pgn) return;

    setIsAnalyzing(true);
    chessEngine.analyzeGame(currentGame.pgn).then((results) => {
      setAnalyses(results);
      setIsAnalyzing(false);
      setCurrentStep(results.length > 0 ? 0 : -1);
    });
  }, [currentGame?.id, currentGame?.pgn]);

  // Update board when step changes
  useEffect(() => {
    if (!currentGame) return;
    const temp = new Chess();

    if (currentStep === -1) {
      setBoardChess(temp);
      setLastMoveSquares(null);
      return;
    }

    try {
      temp.loadPgn(currentGame.pgn);
      const history = temp.history({ verbose: true });
      const stepGame = new Chess();
      for (let i = 0; i <= currentStep && i < history.length; i++) {
        stepGame.move(history[i]);
      }
      setBoardChess(stepGame);
      if (currentStep < history.length) {
        setLastMoveSquares({ from: history[currentStep].from, to: history[currentStep].to });
      }
    } catch {
      // ignore
    }
  }, [currentStep, currentGame]);

  const coachReport: CoachReport = analyses.length > 0
    ? generateCoachReport(analyses, currentGame?.playerColor || 'w')
    : {
        openingScore: 80,
        tacticsScore: 80,
        endgameScore: 80,
        openingInsight: 'Analysis pending.',
        middlegameInsight: 'Analysis pending.',
        endgameInsight: 'Analysis pending.',
        kingSafety: 'Normal',
        pieceActivity: 'Normal',
        tacticalMistakes: [],
        recommendations: []
      };

  const currentAnalysis = currentStep >= 0 && currentStep < analyses.length ? analyses[currentStep] : null;

  const getBadge = (c: MoveAnalysis['classification']) => {
    switch (c) {
      case 'best':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Best</span>;
      case 'good':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">Good</span>;
      case 'book':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">Book</span>;
      case 'inaccuracy':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Inaccuracy</span>;
      case 'mistake':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Mistake</span>;
      case 'blunder':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Blunder</span>;
    }
  };

  if (!currentGame) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Sparkles className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Games to Analyze</h2>
        <p className="text-sm text-slate-400">
          Play a match vs AI or Local 2-Player first, then return here to examine your moves and receive AI Coach feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Game Selector Bar */}
      <div className="glass-panel p-3 border border-slate-700/60 rounded-xl bg-slate-900/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-400">Select Game:</span>
          <select
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 font-medium"
          >
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {new Date(g.date).toLocaleDateString()} - vs {g.opponent} ({g.result})
              </option>
            ))}
          </select>
          {isAnalyzing && (
            <span className="text-cyan-400 font-semibold animate-pulse text-[11px]">
              Engine analyzing...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400">Opening:</span>
          <span className="font-bold text-cyan-300">
            {currentGame.opening.eco !== '---' ? `[${currentGame.opening.eco}] ` : ''}
            {currentGame.opening.name}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Board & Evaluation */}
        <div className="lg:col-span-7 flex justify-center gap-3">
          <EvaluationBar
            evaluation={currentAnalysis ? currentAnalysis.evalAfter : 0}
            orientation={currentGame.playerColor}
            visible={settings.showEvalBar}
          />
          <ChessBoard
            chess={boardChess}
            orientation={currentGame.playerColor}
            theme={settings.boardTheme}
            pieceStyle={settings.pieceStyle}
            showCoordinates={settings.showCoordinates}
            highlightLegalMoves={false}
            lastMove={lastMoveSquares}
            hintMove={null}
            isInteractive={false}
            onMakeMove={() => false}
          />
        </div>

        {/* Right: Analysis & Coach Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel border border-slate-700/80 rounded-2xl bg-slate-900/85 overflow-hidden">
            {/* Tab header */}
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setActiveTab('moves')}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === 'moves'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Move Analysis</span>
              </button>
              <button
                onClick={() => setActiveTab('coach')}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === 'coach'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Coach Report</span>
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'moves' ? (
                <div className="space-y-4">
                  {/* Current Move Detail Banner */}
                  {currentAnalysis ? (
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono font-bold text-sm text-white">
                          <span>Move {Math.floor(currentStep / 2) + 1}: {currentAnalysis.san}</span>
                          {getBadge(currentAnalysis.classification)}
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-300">
                          Eval: {formatEvaluation(currentAnalysis.evalAfter)}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 leading-relaxed">
                        {currentAnalysis.explanation}
                      </div>

                      {/* Best move suggestion comparison */}
                      {currentAnalysis.bestMoveSan && currentAnalysis.bestMoveSan !== currentAnalysis.san && (
                        <div className="flex items-center gap-2 text-xs pt-1.5 border-t border-slate-800/80 text-cyan-300">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Engine preferred: <strong>{currentAnalysis.bestMoveSan}</strong></span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 text-center">
                      Initial Position
                    </div>
                  )}

                  {/* Moves Table */}
                  <div className="max-h-64 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
                    {analyses.map((a, idx) => {
                      const isSelected = currentStep === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentStep(idx)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                            isSelected
                              ? 'bg-cyan-950/50 border border-cyan-500/40 text-cyan-200'
                              : 'hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 w-8">{Math.floor(idx / 2) + 1}.</span>
                            <span className="font-bold text-white">{a.san}</span>
                            {getBadge(a.classification)}
                          </div>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {formatEvaluation(a.evalAfter)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Move Stepper */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <button
                      onClick={() => setCurrentStep(Math.max(-1, currentStep - 1))}
                      disabled={currentStep <= -1}
                      className="btn-secondary py-1 px-3"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    <span className="text-slate-400 font-mono">
                      {currentStep + 1} / {analyses.length}
                    </span>
                    <button
                      onClick={() => setCurrentStep(Math.min(analyses.length - 1, currentStep + 1))}
                      disabled={currentStep >= analyses.length - 1}
                      className="btn-secondary py-1 px-3"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* AI Coach Report Panel */
                <div className="space-y-4 text-xs">
                  {/* Performance Scores */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Opening</div>
                      <div className="text-xl font-extrabold text-cyan-400">{coachReport.openingScore}%</div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Tactics</div>
                      <div className="text-xl font-extrabold text-emerald-400">{coachReport.tacticsScore}%</div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Endgame</div>
                      <div className="text-xl font-extrabold text-amber-400">{coachReport.endgameScore}%</div>
                    </div>
                  </div>

                  {/* Section breakdown */}
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-cyan-400" />
                        Opening & Setup
                      </div>
                      <p className="text-slate-400 leading-relaxed">{coachReport.openingInsight}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5 text-emerald-400" />
                        Middlegame & Tactics
                      </div>
                      <p className="text-slate-400 leading-relaxed">{coachReport.middlegameInsight}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        King Safety & Piece Harmony
                      </div>
                      <p className="text-slate-400 leading-relaxed">{coachReport.kingSafety}</p>
                    </div>
                  </div>

                  {/* Tactical Mistakes to improve */}
                  {coachReport.tacticalMistakes.length > 0 && (
                    <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50">
                      <div className="font-bold text-rose-300 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        Key Tactical Errors
                      </div>
                      <ul className="list-disc list-inside text-rose-200/80 space-y-1">
                        {coachReport.tacticalMistakes.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-900/50">
                    <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Coach Recommendations
                    </div>
                    <ul className="list-disc list-inside text-cyan-200/80 space-y-1">
                      {coachReport.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
