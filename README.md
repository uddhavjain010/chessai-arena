# ChessAI Arena ♛

> **"Play. Analyze. Improve."** — A modern, production-quality AI-powered chess web application with progressive engine evaluation, move analysis, interactive tactical puzzles, and personalized AI Coach reviews.

![ChessAI Arena Banner](https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Overview

**ChessAI Arena** is a full-featured, tournament-ready chess platform built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**. It incorporates standard FIDE chess rules, client-side Web Worker engine calculations, a live heuristic evaluation bar, tactical puzzle solvers, real-time opening identification, and deep post-game analysis with an educational AI Coach breakdown.

Designed as an exemplary college project, portfolio piece, and live demonstration platform with zero mandatory backend dependencies.

---

## 🚀 Key Features

### 1. Complete Legal Chess Rules
- Full standard chess mechanics enforced through `chess.js`:
  - Standard piece movements, captures, and pawn double-push
  - **En Passant** capture detection
  - **Castling** (Kingside `O-O` and Queenside `O-O-O`)
  - **Pawn Promotion** modal with Queen, Rook, Bishop, Knight choices
  - **Check, Checkmate, and Stalemate** detection
  - **Threefold Repetition**, **Fifty-Move Rule**, and **Insufficient Material** draws

### 2. Game Modes
- **Play vs AI**:
  - 5 Difficulty levels: **Beginner**, **Easy**, **Medium**, **Hard**, **Expert**
  - Side selection: **White**, **Black**, or **Random**
  - Live "AI THINKING..." status indicator
- **Local 2-Player**:
  - Pass-and-play on a shared device with move validation and clocks

### 3. Modular AI Engine & Stockfish Architecture
- **Web Worker Execution**: AI calculations run in dedicated background threads (`src/chess/ai.worker.ts`), ensuring the UI never stutters or drops frames.
- **Minimax with Alpha-Beta Pruning**:
  - Transposition-ready state representation
  - **Quiescence Search**: Solves the horizon effect by resolving dynamic tactical captures before returning evaluations
  - **Piece-Square Tables (PST)**: Opening, middlegame, and active endgame king evaluations
  - **Tactical Ordering**: Most Valuable Victim - Least Valuable Attacker (MVV-LVA) + checks prioritization
- **Stockfish Compatibility Bridge**: UCI protocol compliant service wrapper with automatic fallback.

### 4. Live Heuristic Evaluation Bar
- Smoothly animated vertical evaluation bar next to the board.
- Displays advantage from White's perspective (+1.8, -0.4, or Mate: #2).
- Sigmoid-normalized win percentage representation.

### 5. Configurable Official Chess Clocks
- Presets: `1+0`, `2+1`, `3+0`, `3+2`, `5+0`, `5+3`, `10+0`, `10+5`, `15+10`, `30+0`, and **No Clock**.
- Fischer increment addition after each move.
- Active player glowing status ring and low-time danger warning (< 30 seconds).
- Automatic flag-fall / timeout termination.

### 6. Opening Detection Engine
- Real-time opening identification matching ECO codes:
  - Italian Game (Giuoco Piano, Two Knights)
  - Ruy Lopez (Spanish Opening, Berlin, Morphy)
  - Sicilian Defense (Najdorf, Dragon, Alapin)
  - French Defense (Advance, Classical)
  - Caro-Kann Defense
  - Queen's Gambit (Accepted, Declined, Slav)
  - King's Indian, Nimzo-Indian, Grünfeld, English, London System, etc.

### 7. Post-Game Analysis & AI Chess Coach
- **Move-by-Move Review**:
  - Classifies every move: **Best**, **Good**, **Book**, **Inaccuracy**, **Mistake**, **Blunder**
  - Displays evaluation swing ($\Delta$) and engine-recommended alternative
- **AI Coach Report**:
  - Generates comprehensive scores for **Opening**, **Tactics**, and **Endgame**
  - Reports on **King Safety**, **Piece Activity**, and specific tactical oversights
  - Educational, actionable recommendations for improvement

### 8. Tactical Chess Puzzles
- Curated collection of verified legal chess tactics:
  - *Mate in 1, Mate in 2, Forks, Pins, Skewers, Discovered Attacks, Back-Rank Combinations*
  - Interactive board validation, hints, and celebration animations
  - Session and career puzzle accuracy tracking

### 9. Web Audio API Synthesizer
- Zero external MP3 downloads required; sounds are synthesized natively using Web Audio oscillators and envelope filters:
  - Crisp wooden move clicks, heavy capture thuds, harmonic check chimes, rhythmic castle slides, and promotion fanfares.

### 10. Modern Aesthetic Design & Customization
- Deep Obsidian & Midnight Slate glassmorphic design system.
- Multiple Board Themes: **Midnight Slate**, **Classic Wood**, **Tournament Emerald**, **Cyberpunk Neon**, **Arctic Ocean**.
- Multiple Piece Styles: **Neo Modern**, **Classic Wood**, **Minimalist Vector**.
- Export and import standard **PGN** files.
- Local Storage history and statistics persistence with clear confirmation.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, TypeScript 5, Vite 6 |
| **Styling & Design System**| Tailwind CSS 3, Vanilla CSS Design Tokens, Glassmorphism |
| **Chess Engine & Rules** | `chess.js` (v1.0.0-beta.9), Minimax + Alpha-Beta Worker |
| **Audio Engine** | Web Audio API Synthesizer |
| **Icons & Visuals** | `lucide-react`, Vector SVG Chess Sets, `canvas-confetti` |
| **Testing** | Vitest 3 |

---

## 🏗️ Architecture

```
[ ChessBoard UI ]  ◄───►  [ Game Controller / Hooks ]  ◄───►  [ Chess.js Rules ]
       ▲                                 ▲
       │                                 │
[ Evaluation Bar ]              [ Chess Engine Bridge ]
                                         │
                                [ Web Worker Thread ]
                           (Minimax / Alpha-Beta / Quiescence)
```

1. **Board Interaction**: User clicks a square; the controller queries `chess.moves({ square, verbose: true })`.
2. **Move Execution**: Legal move is processed, audio synthesized, clock updated, and PGN recorded.
3. **Engine Evaluation**: Position FEN sent to the Web Worker without blocking browser rendering.
4. **Post-Game Review**: Finished PGN is evaluated move-by-move to calculate evaluation swings and formulate the AI Coach summary.

---

## 💻 Installation & Local Development

### Prerequisites
- Node.js (v18 or higher recommended; developed and tested with Node v26)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/your-username/chessai-arena.git
cd chessai-arena
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Tests
```bash
npm test
```
Executes all 20 unit tests across chess rules, piece movements, AI engines, openings, and puzzles.

### 4. Build for Production
```bash
npm run build
```
Generates optimized, minified production assets in the `dist/` directory.

---

## 📁 Project Structure

```
chessai-arena/
├── dist/                      # Production build assets
├── public/
│   └── assets/favicon.svg     # Vector favicon
├── src/
│   ├── chess/
│   │   ├── ai.ts              # Minimax, alpha-beta, quiescence, hint & coach generator
│   │   ├── ai.worker.ts       # Non-blocking background Web Worker
│   │   ├── audio.ts           # Web Audio API sound synthesizer
│   │   ├── evaluation.ts      # Centipawn evaluator & Piece-Square Tables (PST)
│   │   ├── openings.ts        # Opening catalog & sequence detection
│   │   ├── pieces.tsx         # High-resolution vector SVG piece renderer
│   │   ├── puzzles.ts         # Curated legal tactical puzzle database
│   │   └── stockfish.ts       # Engine worker client & fallback service
│   ├── components/
│   │   ├── ChessBoard/        # 8x8 interactive board, highlights & promotion
│   │   ├── ChessClock/        # Digital clock with increment & active player glow
│   │   ├── EvaluationBar/     # Live vertical evaluation bar
│   │   ├── GameControls/      # Move controls, New Game modal, PGN modal
│   │   ├── GameOverModal/     # Polished game termination modal & confetti
│   │   ├── MoveHistory/       # SAN notation, review scrubber & captured trays
│   │   ├── Navigation/        # Top navbar with responsive mobile drawer
│   │   └── Settings/          # Theme, sound, and board customization modal
│   ├── pages/
│   │   ├── Home/              # Landing page & career snapshot
│   │   ├── Game/              # Main game loop, clock & AI opponent
│   │   ├── Analysis/          # Move-by-move analysis & AI Coach report
│   │   ├── Puzzles/           # Tactical puzzle solver arena
│   │   └── Statistics/        # Outcome charts, AI metrics & history table
│   ├── services/
│   │   └── storage.ts         # LocalStorage persistence & PGN export/import
│   ├── styles/
│   │   └── main.css           # Glassmorphism tokens, animations, themes
│   ├── types/
│   │   └── chess.ts           # TypeScript interfaces & types
│   ├── App.tsx                # App root & navigation router
│   └── main.tsx               # React DOM entry point
├── tests/
│   ├── ai_engine.test.ts      # Tests for engine evaluation & analysis
│   ├── chess_rules.test.ts    # Tests for moves, castling, promotion, checkmate
│   └── openings_puzzles.test.ts # Tests for openings & puzzle legality
├── index.html                 # Main HTML with SEO meta tags & Google fonts
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🚢 Deployment

The application compiles into a zero-dependency static bundle deployable on:
- **Vercel**: Simply connect the GitHub repo; the build command is `npm run build` and output directory is `dist`.
- **Netlify**: Connect repository or run `netlify deploy --prod --dir=dist`.
- **GitHub Pages**: Build with `npm run build` and push `dist` to `gh-pages` branch.

---

## 📄 License

MIT License. Open-source for academic, educational, and portfolio use.
