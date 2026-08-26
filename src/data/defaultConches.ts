import { Conch, EmoticonConfig, EmoticonType } from '../types';

export const ALL_CONCHES: Conch[] = [
  {
    id: 'karl',
    name: 'Karl, the Fatebringer',
    title: 'The Destiny Weaver',
    shellType: 'Amber Star Spiral',
    themeColor: '#f59e0b', // Amber / Gold
    accentColor: '#10b981', // Emerald star
    primaryColor: 'from-amber-400 to-yellow-600',
    baseSpeed: 76,
    baseStamina: 82,
    initialWins: 238,
    description: 'A mystical hermit crab blessed with uncanny intuition and steady endurance.',
    avatarIcon: '🐚'
  },
  {
    id: 'dejavu',
    name: 'Deja Vu',
    title: 'The Violet Speedster',
    shellType: 'Purple Nebula Shell',
    themeColor: '#8b5cf6', // Violet
    accentColor: '#fbbf24', // Star
    primaryColor: 'from-purple-500 to-indigo-600',
    baseSpeed: 81,
    baseStamina: 74,
    initialWins: 227,
    description: 'Fast off the starting line with rapid momentum, repeats past winning sprints.',
    avatarIcon: '⚡'
  },
  {
    id: 'crazy_conch',
    name: 'Crazy Conch',
    title: 'Rainbow Psyche',
    shellType: 'Opal Rainbow Swirl',
    themeColor: '#06b6d4', // Cyan / Pink swirl
    accentColor: '#ec4899',
    primaryColor: 'from-cyan-400 via-pink-400 to-indigo-400',
    baseSpeed: 79,
    baseStamina: 78,
    initialWins: 229,
    description: 'Unpredictable and wild, capable of dazzling bursts of otherworldly speed.',
    avatarIcon: '🌀'
  },
  {
    id: 'fiery_warrior',
    name: 'Fiery Conch Warrior',
    title: 'Obsidian Juggernaut',
    shellType: 'Armored Black & Gold',
    themeColor: '#d97706', // Dark Gold
    accentColor: '#1f2937', // Obsidian
    primaryColor: 'from-amber-600 via-stone-800 to-black',
    baseSpeed: 74,
    baseStamina: 86,
    initialWins: 189,
    description: 'Heavy plated powerhouse built for tough tracks and late-race surges.',
    avatarIcon: '🛡️'
  },
  {
    id: 'blackhat',
    name: 'Captain Blackhat',
    title: 'The Corsair Buccaneer',
    shellType: 'Deep Sea Pirate Tricorn',
    themeColor: '#3b82f6', // Ocean Blue
    accentColor: '#0f172a', // Pirate hat
    primaryColor: 'from-blue-600 to-slate-900',
    baseSpeed: 82,
    baseStamina: 80,
    initialWins: 260,
    description: 'Veteran sea pirate who ruthlessly cuts through turbulent sand corridors.',
    avatarIcon: '🏴‍☠️'
  },
  {
    id: 'galloping_tractor',
    name: 'Galloping Tractor',
    title: 'Strawberry Heavyweight',
    shellType: 'Crimson Star Carapace',
    themeColor: '#ef4444', // Red
    accentColor: '#22c55e', // Green star
    primaryColor: 'from-red-500 to-rose-700',
    baseSpeed: 80,
    baseStamina: 84,
    initialWins: 258,
    description: 'High torque engine of the beach, relentless stride with huge stamina reserves.',
    avatarIcon: '🚜'
  },
  {
    id: 'conchie',
    name: 'Conchie',
    title: 'The Coral Blossom',
    shellType: 'Pink Coral Starlet',
    themeColor: '#f43f5e', // Rose Pink
    accentColor: '#38bdf8', // Cyan star
    primaryColor: 'from-pink-400 to-rose-500',
    baseSpeed: 78,
    baseStamina: 79,
    initialWins: 254,
    description: 'Fan favorite darling with lightweight shell agility and sharp acceleration.',
    avatarIcon: '🌸'
  },
  {
    id: 'gold_miner',
    name: 'Gold Miner',
    title: 'Drill Master',
    shellType: 'Industrial Crystal Hardhat',
    themeColor: '#eab308', // Bright Yellow
    accentColor: '#a855f7', // Purple crystal
    primaryColor: 'from-yellow-400 to-amber-600',
    baseSpeed: 84,
    baseStamina: 82,
    initialWins: 267,
    description: 'Equipped with dual diamond drills, tunnels past opponents with explosive power.',
    avatarIcon: '⛏️'
  },
  {
    id: 'poseidonn',
    name: 'Poseidonn',
    title: 'Tide Sovereign',
    shellType: 'Azure Ocean Waves',
    themeColor: '#0ea5e9', // Ocean Cyan
    accentColor: '#f43f5e', // Pink starfish
    primaryColor: 'from-cyan-500 to-blue-600',
    baseSpeed: 80,
    baseStamina: 81,
    initialWins: 245,
    description: 'Commands the coastal tide streams to glide effortlessly over sand drifts.',
    avatarIcon: '🌊'
  }
];

export const EMOTICON_CONFIGS: Record<EmoticonType, EmoticonConfig> = {
  cool: {
    type: 'cool',
    emoji: '😎',
    name: 'Confident (Cool)',
    description: 'Peak physical condition. High steady speed boost with minimal errors.',
    speedMultiplier: 1.18,
    varianceFactor: 0.7,
    color: '#0284c7',
    bgLight: 'bg-sky-50 text-sky-700 border-sky-300'
  },
  happy: {
    type: 'happy',
    emoji: '😁',
    name: 'Excited (Happy)',
    description: 'High energy and enthusiastic sprint stride. Good boost to acceleration.',
    speedMultiplier: 1.10,
    varianceFactor: 0.85,
    color: '#16a34a',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-300'
  },
  nervous: {
    type: 'nervous',
    emoji: '😲',
    name: 'Nervous (Sweating)',
    description: 'Hesitant and anxious. Moderate pace with inconsistent timing.',
    speedMultiplier: 0.95,
    varianceFactor: 1.2,
    color: '#d97706',
    bgLight: 'bg-amber-50 text-amber-700 border-amber-300'
  },
  distressed: {
    type: 'distressed',
    emoji: '💣',
    name: 'Distressed (Black Sweat)',
    description: 'Low morale and sluggish reflexes. High risk of stumbling on sand.',
    speedMultiplier: 0.82,
    varianceFactor: 1.45,
    color: '#475569',
    bgLight: 'bg-slate-100 text-slate-700 border-slate-300'
  },
  angry: {
    type: 'angry',
    emoji: '😡',
    name: 'Furious (Rage)',
    description: 'Extreme adrenaline and aggressive bursts, but highly volatile course.',
    speedMultiplier: 1.22,
    varianceFactor: 1.65,
    color: '#dc2626',
    bgLight: 'bg-rose-50 text-rose-700 border-rose-300'
  }
};

export const SCREENSHOT_PRESETS = [
  {
    name: 'Screenshot 1 (Karl, Deja Vu, Crazy, Fiery, Blackhat, Tractor)',
    participants: [
      { conchId: 'karl', emoticon: 'distressed' as EmoticonType, popularity: 21.9, currentWins: 238 },
      { conchId: 'dejavu', emoticon: 'distressed' as EmoticonType, popularity: 6.8, currentWins: 227 },
      { conchId: 'crazy_conch', emoticon: 'nervous' as EmoticonType, popularity: 2.2, currentWins: 229 },
      { conchId: 'fiery_warrior', emoticon: 'nervous' as EmoticonType, popularity: 5.2, currentWins: 189 },
      { conchId: 'blackhat', emoticon: 'angry' as EmoticonType, popularity: 56.7, currentWins: 260 },
      { conchId: 'galloping_tractor', emoticon: 'nervous' as EmoticonType, popularity: 6.8, currentWins: 258 },
    ]
  },
  {
    name: 'Screenshot 2 (Crazy, Fiery, Conchie, Blackhat, Gold Miner, Tractor)',
    participants: [
      { conchId: 'crazy_conch', emoticon: 'nervous' as EmoticonType, popularity: 3.8, currentWins: 229 },
      { conchId: 'fiery_warrior', emoticon: 'nervous' as EmoticonType, popularity: 2.7, currentWins: 189 },
      { conchId: 'conchie', emoticon: 'distressed' as EmoticonType, popularity: 15.8, currentWins: 254 },
      { conchId: 'blackhat', emoticon: 'cool' as EmoticonType, popularity: 21.8, currentWins: 260 },
      { conchId: 'gold_miner', emoticon: 'nervous' as EmoticonType, popularity: 25.1, currentWins: 267 },
      { conchId: 'galloping_tractor', emoticon: 'distressed' as EmoticonType, popularity: 30.6, currentWins: 258 },
    ]
  },
  {
    name: 'Screenshot 3 (Deja Vu, Fiery, Conchie, Blackhat, Poseidonn, Tractor)',
    participants: [
      { conchId: 'dejavu', emoticon: 'cool' as EmoticonType, popularity: 15.2, currentWins: 227 },
      { conchId: 'fiery_warrior', emoticon: 'cool' as EmoticonType, popularity: 18.6, currentWins: 189 },
      { conchId: 'conchie', emoticon: 'distressed' as EmoticonType, popularity: 18.6, currentWins: 253 },
      { conchId: 'blackhat', emoticon: 'angry' as EmoticonType, popularity: 14.2, currentWins: 260 },
      { conchId: 'poseidonn', emoticon: 'angry' as EmoticonType, popularity: 14.2, currentWins: 246 },
      { conchId: 'galloping_tractor', emoticon: 'nervous' as EmoticonType, popularity: 18.9, currentWins: 258 },
    ]
  },
  {
    name: 'Screenshot 4 (Karl, Deja Vu, Gold Miner, Conchie, Poseidonn, Tractor)',
    participants: [
      { conchId: 'karl', emoticon: 'distressed' as EmoticonType, popularity: 6.9, currentWins: 238 },
      { conchId: 'dejavu', emoticon: 'nervous' as EmoticonType, popularity: 7.5, currentWins: 227 },
      { conchId: 'gold_miner', emoticon: 'nervous' as EmoticonType, popularity: 7.0, currentWins: 267 },
      { conchId: 'conchie', emoticon: 'distressed' as EmoticonType, popularity: 8.9, currentWins: 253 },
      { conchId: 'poseidonn', emoticon: 'happy' as EmoticonType, popularity: 52.5, currentWins: 245 },
      { conchId: 'galloping_tractor', emoticon: 'nervous' as EmoticonType, popularity: 17.0, currentWins: 258 },
    ]
  },
  {
    name: 'Screenshot 5 (Karl, Deja Vu, Gold Miner, Blackhat, Poseidonn, Tractor)',
    participants: [
      { conchId: 'karl', emoticon: 'nervous' as EmoticonType, popularity: 9.4, currentWins: 238 },
      { conchId: 'dejavu', emoticon: 'nervous' as EmoticonType, popularity: 11.2, currentWins: 227 },
      { conchId: 'gold_miner', emoticon: 'happy' as EmoticonType, popularity: 43.3, currentWins: 266 },
      { conchId: 'blackhat', emoticon: 'cool' as EmoticonType, popularity: 25.0, currentWins: 260 },
      { conchId: 'poseidonn', emoticon: 'nervous' as EmoticonType, popularity: 7.5, currentWins: 245 },
      { conchId: 'galloping_tractor', emoticon: 'nervous' as EmoticonType, popularity: 3.3, currentWins: 258 },
    ]
  }
];
