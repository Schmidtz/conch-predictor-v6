export type EmoticonType = 'cool' | 'happy' | 'nervous' | 'distressed' | 'angry';

export interface EmoticonConfig {
  type: EmoticonType;
  emoji: string;
  name: string;
  description: string;
  speedMultiplier: number; // e.g. 1.15
  varianceFactor: number;   // e.g. 0.8 (steady) or 1.5 (volatile)
  color: string;
  bgLight: string;
}

export interface Conch {
  id: string;
  name: string;
  title: string;
  shellType: string;
  themeColor: string;
  accentColor: string;
  primaryColor: string;
  baseSpeed: number; // 1-100 baseline
  baseStamina: number; // 1-100
  initialWins: number; // baseline from game screenshot
  description: string;
  avatarIcon: string;
}

export interface RaceParticipantInput {
  conchId: string;
  emoticon: EmoticonType;
  popularity?: number; // % e.g. 21.9
  currentWins?: number; // displayed win count on screen e.g. 238
}

export interface RaceRecord {
  id: string;
  timestamp: number;
  raceNumber: number;
  participants: RaceParticipantInput[];
  winnerId: string;
  secondId?: string;
  thirdId?: string;
  notes?: string;
}

export interface SimulationConfig {
  iterations: number;
  emoticonWeight: number; // 0.0 - 2.0
  historicalWeight: number; // 0.0 - 2.0
  popularityWeight: number; // 0.0 - 1.0
  randomVariance: number; // 0.1 - 1.0
  raceDistance: number; // virtual meters
}

export interface ConchSimResult {
  conchId: string;
  conch: Conch;
  emoticon: EmoticonType;
  popularity: number;
  winCount: number;
  winProbability: number; // 0 - 100%
  top2Probability: number; // 0 - 100%
  top3Probability: number; // 0 - 100%
  avgRank: number;
  expectedValueScore: number;
  recommendationTier: 'top_pick' | 'strong_contender' | 'value_bet' | 'dark_horse' | 'avoid';
  recommendationReason: string;
}

export interface ExactaTrifectaPrediction {
  combination: string[]; // conch ids
  probability: number;
}

export interface SimulationOutput {
  iterations: number;
  modelVersion?: string;
  dataDriven?: boolean;
  historicalRacesUsed?: number;
  modelNotes?: string[];
  timestamp: number;
  results: ConchSimResult[];
  exactas: ExactaTrifectaPrediction[];
  trifectas: ExactaTrifectaPrediction[];
  headToHeadMatrix: Record<string, Record<string, number>>; // conchA -> conchB -> win%
}

export interface ConchStats {
  conchId: string;
  totalRaces: number;
  totalWins: number;
  winRate: number;
  top3Count: number;
  emoticonStats: Record<EmoticonType, { races: number; wins: number; winRate: number }>;
  headToHead: Record<string, { races: number; wins: number }>;
  recentResults: ('1st' | '2nd' | '3rd' | 'loss')[];
}
