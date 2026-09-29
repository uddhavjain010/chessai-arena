import { Puzzle } from '../types/chess';

export const CHESS_PUZZLES: Puzzle[] = [
  // MATE IN 1
  {
    id: 'mate_1_scholar',
    title: "Scholar's Mate Finish",
    category: 'mate_in_1',
    rating: 800,
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5',
    playerColor: 'w',
    solution: ['Qxf7#'],
    description: 'White has concentrated attack on the weak f7 square with queen and bishop.',
    hint: 'Look for an undefended square near the enemy king that gives checkmate.'
  },
  {
    id: 'mate_1_backrank',
    title: 'Classic Back-Rank Smother',
    category: 'back_rank',
    rating: 900,
    fen: '3r2k1/5ppp/8/8/8/8/4QPPP/6K1 w - - 0 1',
    playerColor: 'w',
    solution: ['Qe8+'],
    description: 'The black king is trapped behind its own pawns. Deliver the decisive invasion.',
    hint: 'Invade the 8th rank to exploit the locked king.'
  },
  {
    id: 'mate_1_anastasia',
    title: "Anastasia's Mate Concept",
    category: 'mate_in_1',
    rating: 1050,
    fen: '5rk1/5ppp/8/8/8/4N3/1r5R/6QK b - - 0 1',
    playerColor: 'b',
    solution: ['Rxh2#'],
    description: 'Black delivers a direct knockout blow on the edge.',
    hint: 'Direct capture on the pinned and overloaded square.'
  },

  // MATE IN 2
  {
    id: 'mate_2_corridor',
    title: 'Rook Corridor Mate',
    category: 'mate_in_2',
    rating: 1100,
    fen: '6k1/R7/6K1/8/8/8/8/8 w - - 0 1',
    playerColor: 'w',
    solution: ['Ra8#'],
    description: 'White’s king and rook dominate the edge of the board.',
    hint: 'Cut off all king escape squares on the 8th rank.'
  },
  {
    id: 'mate_2_smothered',
    title: 'Smothered Mate Combination',
    category: 'mate_in_2',
    rating: 1350,
    fen: '6k1/5ppp/8/8/8/8/1Q4PP/6K1 w - - 0 1',
    playerColor: 'w',
    solution: ['Qb8+'],
    description: 'Deliver the checking move that forces back-rank capitulation.',
    hint: 'Attack the back rank with the Queen.'
  },

  // FORK
  {
    id: 'fork_royal',
    title: 'The Royal Knight Fork',
    category: 'fork',
    rating: 1150,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 1 5',
    playerColor: 'w',
    solution: ['a3'],
    description: 'Kick the intrusive bishop and dismantle Black’s pin.',
    hint: 'Use a pawn push to challenge the bishop.'
  },
  {
    id: 'fork_knight_cq',
    title: 'Knight Fork on c7',
    category: 'fork',
    rating: 1200,
    fen: 'r3k2r/pppb1ppp/2n5/3qp3/3P4/2N2N2/PPP2PPP/R2QKB1R w KQkq - 0 8',
    playerColor: 'w',
    solution: ['Nxd5'],
    description: 'Black left their queen vulnerable in the center.',
    hint: 'Win the queen right now!'
  },

  // PIN
  {
    id: 'pin_absolute',
    title: 'The Absolute Queen Pin',
    category: 'pin',
    rating: 1250,
    fen: '4k3/8/8/3q4/8/8/8/3R2K1 w - - 0 1',
    playerColor: 'w',
    solution: ['Rxd5'],
    description: 'The queen is pinned or undefended along the open d-file.',
    hint: 'Capture the defenseless piece on the file.'
  },
  {
    id: 'pin_bishop_f7',
    title: 'Pinning the Knight to the Queen',
    category: 'pin',
    rating: 1300,
    fen: 'r1bqk2r/pppp1ppp/2n5/4p3/2B5/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5',
    playerColor: 'w',
    solution: ['Bxf7+'],
    description: 'Sacrifice to shatter the enemy king’s shelter.',
    hint: 'Look at the f7 square with check.'
  },

  // SKEWER
  {
    id: 'skewer_king_rook',
    title: 'The Bishop Skewer',
    category: 'skewer',
    rating: 1350,
    fen: '4k3/8/8/8/8/8/4B3/r3K3 w - - 0 1',
    playerColor: 'w',
    solution: ['Bd1'],
    description: 'Block the check cleanly and protect your king.',
    hint: 'Interpose your bishop to neutralize the attack.'
  },

  // DISCOVERED ATTACK
  {
    id: 'discovered_check',
    title: 'Devastating Discovered Check',
    category: 'discovered_attack',
    rating: 1400,
    fen: 'r1b1k2r/pppp1ppp/8/8/1b2q3/2N5/PPP2PPP/R1B1KB1R w KQkq - 0 9',
    playerColor: 'w',
    solution: ['Be2'],
    description: 'Black checked your king. Block the check with the bishop.',
    hint: 'Shield the king with minor piece development.'
  },

  // DOUBLE ATTACK
  {
    id: 'double_attack_queen',
    title: 'Double Central Attack',
    category: 'discovered_attack',
    rating: 1250,
    fen: 'rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
    playerColor: 'w',
    solution: ['Nxe5'],
    description: 'Capture the unguarded central pawn and establish a dominant knight outpost.',
    hint: 'Recapture the center with your knight.'
  }
];
