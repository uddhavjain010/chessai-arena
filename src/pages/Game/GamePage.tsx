import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chess, Square, Color, PieceSymbol } from 'chess.js';
import { ChessBoard } from '../../components/ChessBoard/ChessBoard';
import { EvaluationBar } from '../../components/EvaluationBar/EvaluationBar';
import { ChessClock } from '../../components/ChessClock/ChessClock';
import { MoveHistory } from '../../components/MoveHistory/MoveHistory';
import { GameControls } from '../../components/GameControls/GameControls';
import { GameOverModal } from '../../components/GameOverModal/GameOverModal';
import { NewGameModal } from '../../components/GameControls/NewGameModal';
import { PgnModal } from '../../components/GameControls/PgnModal';
import { GameMode, AIDifficulty, PlayerColor, TimeControl, AppSettings, GameRecord } from '../../types/chess';
import { evaluateBoard } from '../../chess/evaluation';
import { detectOpening } from '../../chess/openings';
import { chessEngine } from '../../chess/stockfish';
import { soundManager } from '../../chess/audio';
import { storageService } from '../../services/storage';
import { Bot, Lightbulb } from 'lucide-react';

interface GamePageProps {
  initialMode: GameMode;
  settings: AppSettings;
  onOpenSettings: () => void;
  onAnalyzeGame: (game: GameRecord) => void;
  onReturnHome: () => void;
}

export const GamePage: React.FC<GamePageProps> = ({
  initialMode,
  settings,
  onOpenSettings,
  onAnalyzeGame,
  onReturnHome
}) => {
  // Game Setup State
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [timeControl, setTimeControl] = useState<TimeControl>({ name: '5 min', initialMinutes: 5, incrementSeconds: 0 });
  const [boardOrientation, setBoardOrientation] = useState<Color>('w');

  // Core Chess State
  const [chess] = useState<Chess>(() => new Chess());
  const [, setBoardVersion] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState<number>(-1);

  // Clocks
  const [whiteTime, setWhiteTime] = useState<number>(timeControl.initialMinutes * 60);
  const [blackTime, setBlackTime] = useState<number>(timeControl.initialMinutes * 60);
  const [isClockRunning, setIsClockRunning] = useState<boolean>(false);

  // Indicators
  const [evaluation, setEvaluation] = useState<number>(0);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [hintMove, setHintMove] = useState<{ from: Square; to: Square } | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Game End State
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'1-0' | '0-1' | '1/2-1/2' | '*'>('*');
  const [endReason, setEndReason] = useState<string>('');
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [capturedByWhite, setCapturedByWhite] = useState<PieceSymbol[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<PieceSymbol[]>([]);

  // Modals
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [isPgnModalOpen, setIsPgnModalOpen] = useState(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);

  // Opening
  const detectedOpening = detectOpening(history);

  // Captured pieces calculation
  const updateCapturedPieces = useCallback(() => {
    const counts: Record<'w' | 'b', Record<string, number>> = {
      w: { p: 8, n: 2, b: 2, r: 2, q: 1 },
      b: { p: 8, n: 2, b: 2, r: 2, q: 1 }
    };
    const board = chess.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type !== 'k') {
          counts[p.color][p.type]--;
        }
      }
    }

    const whiteCaps: PieceSymbol[] = [];
    const blackCaps: PieceSymbol[] = [];

    (['q', 'r', 'b', 'n', 'p'] as PieceSymbol[]).forEach((type) => {
      for (let i = 0; i < counts.b[type]; i++) whiteCaps.push(type);
      for (let i = 0; i < counts.w[type]; i++) blackCaps.push(type);
    });

    setCapturedByWhite(whiteCaps);
    setCapturedByBlack(blackCaps);
  }, [chess]);

  // Finish Game Handler
  const handleFinishGame = useCallback((result: '1-0' | '0-1' | '1/2-1/2', reason: string) => {
    setIsGameOver(true);
    setIsClockRunning(false);
    setGameResult(result);
    setEndReason(reason);
    setIsGameOverModalOpen(true);

    const isWin = (playerColor === 'w' && result === '1-0') || (playerColor === 'b' && result === '0-1');
    if (settings.soundEnabled) {
      soundManager.playGameOver(isWin);
    }

    // Save Game Record to Storage
    const duration = Math.max(1, Math.round((Date.now() - gameStartTime) / 1000));
    const gameRecord: GameRecord = {
      id: `game_${Date.now()}`,
      date: new Date().toISOString(),
      mode,
      playerColor,
      opponent: mode === 'ai' ? `ChessAI (${aiDifficulty})` : 'Local Player',
      difficulty: mode === 'ai' ? aiDifficulty : undefined,
      result,
      reason,
      timeControl: timeControl.name,
      moveCount: history.length,
      durationSeconds: duration,
      opening: {
        name: detectedOpening.name,
        eco: detectedOpening.eco
      },
      pgn: chess.pgn(),
      fen: chess.fen(),
      moves: [...history]
    };

    storageService.saveGame(gameRecord);
  }, [playerColor, settings.soundEnabled, gameStartTime, mode, aiDifficulty, timeControl.name, history, detectedOpening.name, detectedOpening.eco, chess]);

  // Clock countdown timer
  useEffect(() => {
    if (!isClockRunning || isGameOver || timeControl.initialMinutes === 0) return;

    const timer = setInterval(() => {
      const turn = chess.turn();
      if (turn === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinishGame('0-1', 'timeout');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinishGame('1-0', 'timeout');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isClockRunning, isGameOver, chess, timeControl.initialMinutes, handleFinishGame]);

  // Check game termination after every move
  const checkGameRulesTermination = useCallback(() => {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? '0-1' : '1-0';
      handleFinishGame(winner, 'checkmate');
      return true;
    }
    if (chess.isStalemate()) {
      handleFinishGame('1/2-1/2', 'stalemate');
      return true;
    }
    if (chess.isThreefoldRepetition()) {
      handleFinishGame('1/2-1/2', 'threefold');
      return true;
    }
    if (chess.isInsufficientMaterial()) {
      handleFinishGame('1/2-1/2', 'insufficient');
      return true;
    }
    if (chess.isDraw()) {
      handleFinishGame('1/2-1/2', 'draw');
      return true;
    }
    return false;
  }, [chess, handleFinishGame]);

  // Execute AI move when it is AI turn
  useEffect(() => {
    if (mode !== 'ai' || isGameOver) return;

    const currentTurn = chess.turn();
    const isAiTurn = currentTurn !== playerColor;

    if (!isAiTurn) {
      setIsAiThinking(false);
      return;
    }

    let isMounted = true;
    setIsAiThinking(true);

    chessEngine.getBestMove(chess.fen(), aiDifficulty).then((result) => {
      if (!isMounted || !result) {
        setIsAiThinking(false);
        return;
      }

      try {
        const move = chess.move({
          from: result.from as Square,
          to: result.to as Square,
          promotion: (result.promotion as PieceSymbol) || 'q'
        });

        if (move) {
          // Play audio
          if (settings.soundEnabled) {
            if (move.captured) soundManager.playCapture();
            else if (move.san.includes('O-O')) soundManager.playCastle();
            else if (chess.inCheck()) soundManager.playCheck();
            else soundManager.playMove();
          }

          // Add increment to AI clock
          if (timeControl.incrementSeconds > 0) {
            if (currentTurn === 'w') setWhiteTime(t => t + timeControl.incrementSeconds);
            else setBlackTime(t => t + timeControl.incrementSeconds);
          }

          setBoardVersion(v => v + 1);
          setHistory(chess.history());
          setCurrentReviewIndex(chess.history().length - 1);
          setLastMove({ from: move.from, to: move.to });
          setHintMove(null);
          setHintMessage(null);
          updateCapturedPieces();
          checkGameRulesTermination();

          // Update evaluation score on next frame
          setTimeout(() => {
            setEvaluation(evaluateBoard(chess));
          }, 0);
        }
      } catch (err) {
        console.error('Failed to make AI move:', err);
      } finally {
        if (isMounted) {
          setIsAiThinking(false);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [mode, isGameOver, chess, playerColor, aiDifficulty, settings.soundEnabled, timeControl.incrementSeconds, updateCapturedPieces, checkGameRulesTermination]);

  // Make human move - runs immediately with zero lag
  const handleMakeMove = useCallback((from: Square, to: Square, promotion: PieceSymbol = 'q'): boolean => {
    if (isGameOver || isAiThinking) return false;

    // In AI mode, prevent moving on AI's turn
    if (mode === 'ai' && chess.turn() !== playerColor) return false;

    try {
      const move = chess.move({ from, to, promotion });
      if (!move) return false;

      // Start clock on first move
      if (!isClockRunning && timeControl.initialMinutes > 0) {
        setIsClockRunning(true);
      }

      // Increment clock for current mover
      if (timeControl.incrementSeconds > 0) {
        if (move.color === 'w') setWhiteTime(t => t + timeControl.incrementSeconds);
        else setBlackTime(t => t + timeControl.incrementSeconds);
      }

      // Audio feedback
      if (settings.soundEnabled) {
        if (promotion && move.promotion) soundManager.playPromotion();
        else if (move.captured) soundManager.playCapture();
        else if (move.san.includes('O-O')) soundManager.playCastle();
        else if (chess.inCheck()) soundManager.playCheck();
        else soundManager.playMove();
      }

      // 1. UPDATE BOARD IMMEDIATELY
      setBoardVersion(v => v + 1);
      setHistory(chess.history());
      setCurrentReviewIndex(chess.history().length - 1);
      setLastMove({ from, to });
      setHintMove(null);
      setHintMessage(null);
      updateCapturedPieces();

      const terminated = checkGameRulesTermination();
      if (!terminated) {
        // Calculate evaluation on next tick so user piece move renders with 0ms delay
        setTimeout(() => {
          setEvaluation(evaluateBoard(chess));
        }, 10);
      }
      return true;
    } catch {
      return false;
    }
  }, [isGameOver, isAiThinking, mode, chess, playerColor, isClockRunning, timeControl, settings.soundEnabled, updateCapturedPieces, checkGameRulesTermination]);

  // Start new game setup
  const handleStartConfiguredGame = (config: {
    mode: GameMode;
    playerColor: PlayerColor;
    difficulty: AIDifficulty;
    timeControl: TimeControl;
  }) => {
    chessEngine.cancelActiveSearch();
    setIsAiThinking(false);
    chess.reset();
    const resolvedColor: Color = config.playerColor === 'random'
      ? (Math.random() < 0.5 ? 'w' : 'b')
      : config.playerColor;

    setMode(config.mode);
    setPlayerColor(resolvedColor);
    setBoardOrientation(resolvedColor);
    setAiDifficulty(config.difficulty);
    setTimeControl(config.timeControl);

    setWhiteTime(config.timeControl.initialMinutes * 60);
    setBlackTime(config.timeControl.initialMinutes * 60);
    setIsClockRunning(false);

    setBoardVersion(v => v + 1);
    setHistory([]);
    setCurrentReviewIndex(-1);
    setLastMove(null);
    setHintMove(null);
    setHintMessage(null);
    setEvaluation(0);
    setIsGameOver(false);
    setIsGameOverModalOpen(false);
    setGameStartTime(Date.now());
    setCapturedByWhite([]);
    setCapturedByBlack([]);
  };

  // Restart identical match
  const handleRestart = () => {
    chessEngine.cancelActiveSearch();
    setIsAiThinking(false);
    chess.reset();
    setWhiteTime(timeControl.initialMinutes * 60);
    setBlackTime(timeControl.initialMinutes * 60);
    setIsClockRunning(false);
    setBoardVersion(v => v + 1);
    setHistory([]);
    setCurrentReviewIndex(-1);
    setLastMove(null);
    setHintMove(null);
    setHintMessage(null);
    setEvaluation(0);
    setIsGameOver(false);
    setIsGameOverModalOpen(false);
    setGameStartTime(Date.now());
    setCapturedByWhite([]);
    setCapturedByBlack([]);
  };

  // Undo move
  const handleUndo = () => {
    if (isGameOver || isAiThinking || history.length === 0) return;
    chessEngine.cancelActiveSearch();
    setIsAiThinking(false);

    if (mode === 'ai') {
      // Undo twice so human player can make a different move
      chess.undo();
      if (chess.history().length > 0 && chess.turn() !== playerColor) {
        chess.undo();
      }
    } else {
      chess.undo();
    }

    setBoardVersion(v => v + 1);
    const newHistory = chess.history();
    setHistory(newHistory);
    setCurrentReviewIndex(newHistory.length - 1);
    setHintMove(null);
    setHintMessage(null);
    setEvaluation(evaluateBoard(chess));
    updateCapturedPieces();

    if (newHistory.length > 0) {
      const last = chess.history({ verbose: true }).slice(-1)[0];
      setLastMove({ from: last.from, to: last.to });
    } else {
      setLastMove(null);
    }
  };

  // Resign
  const handleResign = () => {
    if (isGameOver) return;
    const winner = playerColor === 'w' ? '0-1' : '1-0';
    handleFinishGame(winner, 'resignation');
  };

  // Draw Offer
  const handleDrawOffer = () => {
    if (isGameOver) return;
    if (mode === 'ai') {
      // AI evaluates position: if evaluation is between -0.5 and +0.5, accepts draw!
      const cp = evaluateBoard(chess);
      if (Math.abs(cp) <= 60) {
        handleFinishGame('1/2-1/2', 'agreement');
      } else {
        alert("The AI evaluated its position and respectfully declined the draw offer.");
      }
    } else {
      // Local 2 player
      handleFinishGame('1/2-1/2', 'agreement');
    }
  };

  // Hint
  const handleGetHint = async () => {
    if (isGameOver || isAiThinking) return;
    const hint = await chessEngine.getHint(chess.fen());
    if (hint) {
      setHintMove({ from: hint.from, to: hint.to });
      setHintMessage(`Suggested Move: ${hint.san} - ${hint.explanation}`);
    }
  };

  // Review past move on board
  const handleSelectReviewMove = (index: number) => {
    setCurrentReviewIndex(index);
    // Construct position up to selected move
    const reviewChess = new Chess();
    const allMoves = chess.history({ verbose: true });
    for (let i = 0; i <= index && i < allMoves.length; i++) {
      reviewChess.move(allMoves[i]);
    }
    setBoardVersion(v => v + 1);
    if (index >= 0 && index < allMoves.length) {
      setLastMove({ from: allMoves[index].from, to: allMoves[index].to });
    } else {
      setLastMove(null);
    }
  };

  // Review chess object passed to ChessBoard - memoized to prevent creating new instances every render
  const boardDisplayChess = useMemo(() => {
    if (currentReviewIndex === history.length - 1 || (currentReviewIndex === -1 && history.length === 0)) {
      return chess;
    }
    const c = new Chess();
    const moves = chess.history({ verbose: true });
    for (let i = 0; i <= currentReviewIndex && i < moves.length; i++) {
      c.move(moves[i]);
    }
    return c;
  }, [chess, currentReviewIndex, history.length]);

  const isCurrentBoardLive = currentReviewIndex === history.length - 1;

  // Player Display Names
  const topPlayerName = boardOrientation === 'w'
    ? (mode === 'ai' ? `ChessAI (${aiDifficulty})` : 'Black')
    : (mode === 'ai' ? 'ChessAI Arena' : 'White');
  const bottomPlayerName = boardOrientation === 'w'
    ? (mode === 'ai' ? 'You' : 'White')
    : (mode === 'ai' ? 'You' : 'Black');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
      {/* Top Banner: Detected Opening & AI Status */}
      <div className="glass-panel p-2.5 px-4 border border-slate-700/60 rounded-xl bg-slate-900/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-400">Opening:</span>
          <span className="font-bold text-cyan-300 truncate" title={detectedOpening.description}>
            {detectedOpening.eco !== '---' ? `[${detectedOpening.eco}] ` : ''}
            {detectedOpening.name}
          </span>
        </div>

        {isAiThinking && (
          <div className="flex items-center gap-2 text-cyan-400 font-bold animate-pulse">
            <Bot className="w-4 h-4" />
            <span>AI THINKING...</span>
          </div>
        )}
      </div>

      {/* Main Board Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Board, Clocks, Eval Bar */}
        <div className="lg:col-span-8 flex flex-col items-center gap-3">
          {/* Top Clock (Opponent) */}
          <div className="w-full max-w-[min(100%,min(74vh,600px))]">
            <ChessClock
              color={boardOrientation === 'w' ? 'b' : 'w'}
              timeRemainingSeconds={boardOrientation === 'w' ? blackTime : whiteTime}
              isActive={isClockRunning && chess.turn() === (boardOrientation === 'w' ? 'b' : 'w')}
              playerName={topPlayerName}
              hasClock={timeControl.initialMinutes > 0}
            />
          </div>

          {/* Board + Vertical Evaluation Bar - strictly square, never stretched */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-[min(100%,min(74vh,600px))] mx-auto">
            <EvaluationBar
              evaluation={evaluation}
              orientation={boardOrientation}
              visible={settings.showEvalBar}
              isThinking={isAiThinking}
            />

            <div className="flex-1 min-w-0 flex items-center justify-center">
              <ChessBoard
                chess={boardDisplayChess}
                orientation={boardOrientation}
                theme={settings.boardTheme}
                pieceStyle={settings.pieceStyle}
                showCoordinates={settings.showCoordinates}
                highlightLegalMoves={settings.highlightLegalMoves}
                lastMove={lastMove}
                hintMove={hintMove}
                isInteractive={isCurrentBoardLive && !isGameOver && !isAiThinking}
                onMakeMove={handleMakeMove}
              />
            </div>
          </div>

          {/* Bottom Clock (You) */}
          <div className="w-full max-w-[min(100%,min(74vh,600px))]">
            <ChessClock
              color={boardOrientation === 'w' ? 'w' : 'b'}
              timeRemainingSeconds={boardOrientation === 'w' ? whiteTime : blackTime}
              isActive={isClockRunning && chess.turn() === (boardOrientation === 'w' ? 'w' : 'b')}
              playerName={bottomPlayerName}
              hasClock={timeControl.initialMinutes > 0}
            />
          </div>

          {/* Hint Toast Banner */}
          {hintMessage && (
            <div className="w-full max-w-[min(100%,min(74vh,600px))] p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {hintMessage}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Controls & Move History */}
        <div className="lg:col-span-4 space-y-4">
          <GameControls
            mode={mode}
            isGameOver={isGameOver}
            canUndo={history.length > 0}
            isAiThinking={isAiThinking}
            onNewGame={() => setIsNewGameOpen(true)}
            onRestart={handleRestart}
            onResign={handleResign}
            onDrawOffer={handleDrawOffer}
            onUndo={handleUndo}
            onFlipBoard={() => setBoardOrientation(o => o === 'w' ? 'b' : 'w')}
            onGetHint={handleGetHint}
            onOpenSettings={onOpenSettings}
            onExportPgn={() => setIsPgnModalOpen(true)}
          />

          <MoveHistory
            history={history}
            currentMoveIndex={currentReviewIndex}
            onSelectMove={handleSelectReviewMove}
            capturedByWhite={capturedByWhite}
            capturedByBlack={capturedByBlack}
            pieceStyle={settings.pieceStyle}
          />
        </div>
      </div>

      {/* Modals */}
      <NewGameModal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        onStartGame={handleStartConfiguredGame}
        initialMode={mode}
      />

      <GameOverModal
        isOpen={isGameOverModalOpen}
        result={gameResult}
        reason={endReason}
        playerColor={playerColor}
        moveCount={history.length}
        durationSeconds={Math.max(1, Math.round((Date.now() - gameStartTime) / 1000))}
        openingName={detectedOpening.name}
        eco={detectedOpening.eco}
        onAnalyzeGame={() => {
          setIsGameOverModalOpen(false);
          const games = storageService.getGames();
          if (games.length > 0) onAnalyzeGame(games[0]);
        }}
        onNewGame={() => {
          setIsGameOverModalOpen(false);
          setIsNewGameOpen(true);
        }}
        onReturnHome={() => {
          setIsGameOverModalOpen(false);
          onReturnHome();
        }}
      />

      <PgnModal
        isOpen={isPgnModalOpen}
        onClose={() => setIsPgnModalOpen(false)}
        currentPgn={chess.pgn()}
        onLoadPgn={(importedPgn) => {
          try {
            chess.loadPgn(importedPgn);
            setBoardVersion(v => v + 1);
            setHistory(chess.history());
            setCurrentReviewIndex(chess.history().length - 1);
            setEvaluation(evaluateBoard(chess));
            updateCapturedPieces();
          } catch {
            alert('Failed to load PGN.');
          }
        }}
      />
    </div>
  );
};
