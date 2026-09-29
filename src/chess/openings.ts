export interface OpeningData {
  eco: string;
  name: string;
  moves: string[]; // sequence of SAN moves
  description: string;
}

export const OPENINGS: OpeningData[] = [
  // Italian Game & variations
  {
    eco: 'C50',
    name: 'Italian Game',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
    description: 'One of the oldest recorded chess openings, aiming for rapid development and pressure on the weak f7 square.'
  },
  {
    eco: 'C53',
    name: 'Italian Game: Giuoco Piano',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3'],
    description: 'The "Quiet Game", aiming to construct a powerful pawn center with d2-d4.'
  },
  {
    eco: 'C55',
    name: 'Two Knights Defense',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'],
    description: 'An aggressive counter-attacking opening challenging White’s central initiative.'
  },

  // Ruy Lopez
  {
    eco: 'C60',
    name: 'Ruy Lopez (Spanish Opening)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    description: 'White attacks the knight defending e5, seeking enduring positional pressure.'
  },
  {
    eco: 'C65',
    name: 'Ruy Lopez: Berlin Defense',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'],
    description: 'The "Berlin Wall", famed for its resilience at the World Championship level.'
  },
  {
    eco: 'C70',
    name: 'Ruy Lopez: Morphy Defense',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'],
    description: 'The most popular modern defense, forcing White’s bishop to make a positional choice.'
  },

  // Sicilian Defense
  {
    eco: 'B20',
    name: 'Sicilian Defense',
    moves: ['e4', 'c5'],
    description: 'The most popular and aggressive response to 1.e4, fighting for the center asymmetrically.'
  },
  {
    eco: 'B90',
    name: 'Sicilian Defense: Najdorf Variation',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    description: 'Kasparov and Fischer’s weapon of choice, leading to sharp tactical play.'
  },
  {
    eco: 'B70',
    name: 'Sicilian Defense: Dragon Variation',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'],
    description: 'Black fianchettoes the dark-squared bishop resembling the Draco constellation.'
  },
  {
    eco: 'B22',
    name: 'Sicilian Defense: Alapin Variation',
    moves: ['e4', 'c5', 'c3'],
    description: 'White establishes a classical pawn center with d4 supported by c3.'
  },

  // French Defense
  {
    eco: 'C00',
    name: 'French Defense',
    moves: ['e4', 'e6'],
    description: 'A solid and resilient opening establishing a resilient pawn chain.'
  },
  {
    eco: 'C02',
    name: 'French Defense: Advance Variation',
    moves: ['e4', 'e6', 'd4', 'd5', 'e5'],
    description: 'White gains space in the center, locking pawns and directing attack toward Black’s kingside.'
  },
  {
    eco: 'C10',
    name: 'French Defense: Classical Variation',
    moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6'],
    description: 'A principled main line developing minor pieces to dispute the center.'
  },

  // Caro-Kann Defense
  {
    eco: 'B10',
    name: 'Caro-Kann Defense',
    moves: ['e4', 'c6'],
    description: 'A solid defense preparing ...d5 while keeping the c8 bishop’s diagonal unblocked.'
  },
  {
    eco: 'B12',
    name: 'Caro-Kann: Advance Variation',
    moves: ['e4', 'c6', 'd4', 'd5', 'e5'],
    description: 'White closes the center, allowing Black to develop the light-squared bishop outside the pawn chain.'
  },

  // Queen\'s Gambit & 1.d4
  {
    eco: 'D06',
    name: "Queen's Gambit",
    moves: ['d4', 'd5', 'c4'],
    description: 'White offers a flank pawn to divert Black’s central d5 pawn and seize control of e4.'
  },
  {
    eco: 'D20',
    name: "Queen's Gambit Accepted",
    moves: ['d4', 'd5', 'c4', 'dxc4'],
    description: 'Black accepts the pawn gambit, allowing White easy central development.'
  },
  {
    eco: 'D30',
    name: "Queen's Gambit Declined",
    moves: ['d4', 'd5', 'c4', 'e6'],
    description: 'A bedrock classical defense maintaining a secure pawn bastion on d5.'
  },
  {
    eco: 'D10',
    name: 'Slav Defense',
    moves: ['d4', 'd5', 'c4', 'c6'],
    description: 'Black bolsters d5 with the c-pawn, keeping the diagonal open for the c8 bishop.'
  },

  // Indian Defenses
  {
    eco: 'E60',
    name: "King's Indian Defense",
    moves: ['d4', 'Nf6', 'c4', 'g6'],
    description: 'A dynamic hypermodern opening where Black allows White space before counter-striking.'
  },
  {
    eco: 'E20',
    name: 'Nimzo-Indian Defense',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'],
    description: 'Black pins the c3 knight, stopping e4 and fighting for the dark squares.'
  },
  {
    eco: 'D80',
    name: 'Grünfeld Defense',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5'],
    description: 'Black challenges White’s central space dynamically with piece pressure and ...c5.'
  },

  // Other popular systems
  {
    eco: 'A04',
    name: 'Réti Opening',
    moves: ['Nf3', 'd5', 'c4'],
    description: 'A flexible hypermodern flank opening developing without committing central pawns early.'
  },
  {
    eco: 'A10',
    name: 'English Opening',
    moves: ['c4'],
    description: 'White controls the d5 square from the flank, often transposing into Queen’s Pawn or reversed Sicilian systems.'
  },
  {
    eco: 'D02',
    name: 'London System',
    moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4'],
    description: 'A solid, harmonious setup for White with a durable pawn pyramid and active bishop.'
  },
  {
    eco: 'B01',
    name: 'Scandinavian Defense',
    moves: ['e4', 'd5'],
    description: 'Directly strikes at White’s e4 pawn on move 1, often leading to rapid queen mobilization.'
  },
  {
    eco: 'C45',
    name: 'Scotch Game',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'],
    description: 'White breaks open the center immediately with 3.d4, leading to open tactical positions.'
  },
  {
    eco: 'C20',
    name: "King's Pawn Opening",
    moves: ['e4', 'e5'],
    description: 'The classical foundation of open chess games, establishing mutual central presence.'
  },
  {
    eco: 'D00',
    name: "Queen's Pawn Game",
    moves: ['d4', 'd5'],
    description: 'The foundation of closed and semi-closed classical chess systems.'
  }
];

/**
 * Accurately detects opening from played moves sequence
 */
export function detectOpening(moves: string[]): { name: string; eco: string; description: string } {
  if (!moves || moves.length === 0) {
    return {
      name: 'Standard Starting Position',
      eco: 'A00',
      description: 'Initial position of chess.'
    };
  }

  // Find longest matching opening
  let bestMatch: OpeningData | null = null;
  let maxMatchLength = 0;

  for (const opening of OPENINGS) {
    if (opening.moves.length <= moves.length) {
      const isMatch = opening.moves.every((move, idx) => {
        // Strip check/mate symbols or whitespace for robust matching
        const cleanA = move.replace(/[+#?!]/g, '').trim();
        const cleanB = moves[idx].replace(/[+#?!]/g, '').trim();
        return cleanA === cleanB;
      });

      if (isMatch && opening.moves.length > maxMatchLength) {
        bestMatch = opening;
        maxMatchLength = opening.moves.length;
      }
    }
  }

  if (bestMatch) {
    return {
      name: bestMatch.name,
      eco: bestMatch.eco,
      description: bestMatch.description
    };
  }

  return {
    name: 'Opening not identified',
    eco: '---',
    description: 'Move sequence does not match standard opening catalog.'
  };
}
