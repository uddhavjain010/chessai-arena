import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navigation/Navbar';
import { HomePage } from './pages/Home/HomePage';
import { GamePage } from './pages/Game/GamePage';
import { PuzzlesPage } from './pages/Puzzles/PuzzlesPage';
import { AnalysisPage } from './pages/Analysis/AnalysisPage';
import { StatisticsPage } from './pages/Statistics/StatisticsPage';
import { SettingsModal } from './components/Settings/SettingsModal';
import { storageService } from './services/storage';
import { AppSettings, UserStats, GameRecord } from './types/chess';
import { soundManager } from './chess/audio';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [stats, setStats] = useState<UserStats>(() => storageService.getStats());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [gameForAnalysis, setGameForAnalysis] = useState<GameRecord | null>(null);

  // Sync sound manager with settings
  useEffect(() => {
    soundManager.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  const handleRefreshStats = () => {
    setStats(storageService.getStats());
  };

  const handleAnalyzeGame = (game: GameRecord) => {
    setGameForAnalysis(game);
    setActiveTab('analysis');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0e17] text-slate-100 select-none">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          handleRefreshStats();
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            stats={stats}
            onNavigate={(tab) => {
              setActiveTab(tab);
              handleRefreshStats();
            }}
          />
        )}

        {activeTab === 'game-ai' && (
          <GamePage
            key="game-ai"
            initialMode="ai"
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onAnalyzeGame={handleAnalyzeGame}
            onReturnHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'game-local' && (
          <GamePage
            key="game-local"
            initialMode="local"
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onAnalyzeGame={handleAnalyzeGame}
            onReturnHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'puzzles' && (
          <PuzzlesPage settings={settings} />
        )}

        {activeTab === 'analysis' && (
          <AnalysisPage
            settings={settings}
            gameToAnalyze={gameForAnalysis}
          />
        )}

        {activeTab === 'stats' && (
          <StatisticsPage
            stats={stats}
            onAnalyzeGame={handleAnalyzeGame}
            onRefreshStats={handleRefreshStats}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 bg-slate-950/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-400">ChessAI Arena</span> © 2026. Built with React, TypeScript & Vite.
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Modular Chess Engine · Quiescence Search · Opening Book
          </div>
        </div>
      </footer>

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
};
