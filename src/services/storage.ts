import { GameRecord, UserStats, AppSettings } from '../types/chess';

const STORAGE_KEYS = {
  GAMES: 'chessai_games_history',
  STATS: 'chessai_user_stats',
  SETTINGS: 'chessai_user_settings'
};

export const DEFAULT_SETTINGS: AppSettings = {
  boardTheme: 'slate',
  pieceStyle: 'neo',
  soundEnabled: true,
  animationsEnabled: true,
  showCoordinates: true,
  showEvalBar: true,
  highlightLegalMoves: true,
  autoQueen: false
};

export const DEFAULT_STATS: UserStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winStreak: 0,
  maxWinStreak: 0,
  totalTimePlayed: 0,
  puzzlesSolved: 0,
  puzzlesAttempted: 0,
  difficultyDistribution: {
    beginner: { played: 0, won: 0 },
    easy: { played: 0, won: 0 },
    medium: { played: 0, won: 0 },
    hard: { played: 0, won: 0 },
    expert: { played: 0, won: 0 }
  }
};

class StorageService {
  /**
   * Save a finished game record and update statistics
   */
  public saveGame(game: GameRecord): void {
    try {
      const games = this.getGames();
      games.unshift(game);
      // Keep most recent 100 games
      const trimmed = games.slice(0, 100);
      localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(trimmed));

      // Update statistics
      this.updateStatsWithGame(game);
    } catch (e) {
      console.warn('[StorageService] Failed to save game to localStorage:', e);
    }
  }

  public getGames(): GameRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAMES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getGameById(id: string): GameRecord | null {
    const games = this.getGames();
    return games.find(g => g.id === id) || null;
  }

  public deleteGame(id: string): void {
    try {
      const games = this.getGames().filter(g => g.id !== id);
      localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
    } catch (e) {
      console.warn('[StorageService] Failed to delete game:', e);
    }
  }

  public clearAllGames(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.GAMES);
    } catch (e) {
      console.warn('[StorageService] Failed to clear games:', e);
    }
  }

  /**
   * User statistics management
   */
  public getStats(): UserStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  }

  private updateStatsWithGame(game: GameRecord): void {
    const stats = this.getStats();
    stats.gamesPlayed++;
    stats.totalTimePlayed += game.durationSeconds || 0;

    const isWin = (game.playerColor === 'w' && game.result === '1-0') ||
                  (game.playerColor === 'b' && game.result === '0-1');
    const isLoss = (game.playerColor === 'w' && game.result === '0-1') ||
                   (game.playerColor === 'b' && game.result === '1-0');
    const isDraw = game.result === '1/2-1/2';

    if (isWin) {
      stats.wins++;
      stats.winStreak++;
      if (stats.winStreak > stats.maxWinStreak) {
        stats.maxWinStreak = stats.winStreak;
      }
    } else if (isLoss) {
      stats.losses++;
      stats.winStreak = 0;
    } else if (isDraw) {
      stats.draws++;
      stats.winStreak = 0;
    }

    if (game.mode === 'ai' && game.difficulty) {
      if (!stats.difficultyDistribution[game.difficulty]) {
        stats.difficultyDistribution[game.difficulty] = { played: 0, won: 0 };
      }
      stats.difficultyDistribution[game.difficulty].played++;
      if (isWin) {
        stats.difficultyDistribution[game.difficulty].won++;
      }
    }

    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.warn('[StorageService] Failed to save stats:', e);
    }
  }

  public recordPuzzleResult(solved: boolean): void {
    const stats = this.getStats();
    stats.puzzlesAttempted++;
    if (solved) {
      stats.puzzlesSolved++;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.warn('[StorageService] Failed to save puzzle stats:', e);
    }
  }

  /**
   * Settings management
   */
  public getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('[StorageService] Failed to save settings:', e);
    }
  }

  /**
   * Export PGN file download
   */
  public downloadPgn(pgn: string, filename: string = 'chessai-arena-game.pgn'): void {
    const blob = new Blob([pgn], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const storageService = new StorageService();
