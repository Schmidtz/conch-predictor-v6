import React from 'react';
import { Conch, EmoticonType } from '../types';
import { EMOTICON_CONFIGS } from '../data/defaultConches';

interface ConchAvatarProps {
  conch: Conch;
  emoticon?: EmoticonType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showEmoticonBadge?: boolean;
  isAnimated?: boolean;
  className?: string;
}

export const ConchAvatar: React.FC<ConchAvatarProps> = ({
  conch,
  emoticon,
  size = 'md',
  showEmoticonBadge = true,
  isAnimated = false,
  className = '',
}) => {
  const emConfig = emoticon ? EMOTICON_CONFIGS[emoticon] : null;

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
  };

  const bubbleSizes = {
    sm: 'text-xs p-0.5 -top-1 -right-1 min-w-[20px] h-[20px]',
    md: 'text-sm p-1 -top-2 -right-2 min-w-[28px] h-[28px]',
    lg: 'text-base p-1.5 -top-3 -right-3 min-w-[34px] h-[34px]',
    xl: 'text-lg p-2 -top-4 -right-4 min-w-[42px] h-[42px]',
  };

  // Distinctive SVG illustration per conch
  const renderConchShell = () => {
    switch (conch.id) {
      case 'karl': // Karl, the Fatebringer - Golden spiral with green moss/star
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <ellipse cx="50" cy="72" rx="36" ry="14" fill="#d97706" opacity="0.2" />
            {/* Claws & Legs */}
            <path d="M22 68 Q12 76 18 84 Q28 80 30 70 Z" fill="#ea580c" />
            <path d="M78 68 Q88 76 82 84 Q72 80 70 70 Z" fill="#ea580c" />
            <circle cx="28" cy="75" r="2.5" fill="#fed7aa" />
            <circle cx="72" cy="75" r="2.5" fill="#fed7aa" />
            {/* Crab Body */}
            <ellipse cx="50" cy="66" rx="22" ry="12" fill="#fb923c" />
            {/* Eyes */}
            <circle cx="42" cy="58" r="4" fill="#ffffff" stroke="#78350f" strokeWidth="1.5" />
            <circle cx="58" cy="58" r="4" fill="#ffffff" stroke="#78350f" strokeWidth="1.5" />
            <circle cx="43" cy="58" r="2" fill="#000000" />
            <circle cx="57" cy="58" r="2" fill="#000000" />
            {/* Golden Amber Conch Shell */}
            <path
              d="M32 58 C25 45 35 22 55 20 C75 18 88 36 82 52 C78 62 62 66 50 64 C40 62 34 60 32 58 Z"
              fill="url(#goldGrad)"
              stroke="#b45309"
              strokeWidth="2"
            />
            {/* Shell Spirals */}
            <path
              d="M55 20 C68 28 72 42 66 54 C60 64 45 62 42 52"
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Green Moss / Star Decor */}
            <polygon
              points="62,32 65,39 72,40 67,45 68,52 62,48 56,52 57,45 52,40 59,39"
              fill="#10b981"
              stroke="#047857"
              strokeWidth="1"
            />
            <circle cx="45" cy="35" r="3" fill="#34d399" />
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'blackhat': // Captain Blackhat - Pirate hat, Blue shell
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <ellipse cx="50" cy="74" rx="36" ry="13" fill="#1e3a8a" opacity="0.2" />
            {/* Blue Legs */}
            <path d="M22 70 Q12 78 18 85 Q28 82 30 72 Z" fill="#3b82f6" />
            <path d="M78 70 Q88 78 82 85 Q72 82 70 72 Z" fill="#3b82f6" />
            {/* Crab Body */}
            <ellipse cx="50" cy="68" rx="22" ry="12" fill="#60a5fa" />
            {/* Glowing Pirate Eyes */}
            <circle cx="43" cy="62" r="3.5" fill="#facc15" stroke="#1e3a8a" strokeWidth="1" />
            <circle cx="57" cy="62" r="3.5" fill="#facc15" stroke="#1e3a8a" strokeWidth="1" />
            {/* Deep Blue Shell */}
            <path
              d="M30 60 C24 46 36 26 56 24 C76 22 86 38 80 54 C76 64 60 66 48 64 Z"
              fill="url(#blueGrad)"
              stroke="#1e40af"
              strokeWidth="2"
            />
            {/* Tricorn Pirate Hat */}
            <path
              d="M20 40 Q50 20 80 40 Q65 14 50 14 Q35 14 20 40 Z"
              fill="#0f172a"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            {/* Skull & Crossbones Decal */}
            <circle cx="50" cy="26" r="3.5" fill="#ffffff" />
            <line x1="44" y1="32" x2="56" y2="24" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="44" y1="24" x2="56" y2="32" stroke="#ffffff" strokeWidth="1.5" />
            <defs>
              <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'gold_miner': // Gold Miner - Hardhat, Crystals, Twin Drills
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <ellipse cx="50" cy="74" rx="36" ry="13" fill="#854d0e" opacity="0.2" />
            {/* Twin Drills */}
            <polygon points="12,72 28,64 28,80" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
            <polygon points="88,72 72,64 72,80" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
            <line x1="16" y1="68" x2="26" y2="76" stroke="#475569" strokeWidth="1" />
            <line x1="84" y1="68" x2="74" y2="76" stroke="#475569" strokeWidth="1" />
            {/* Crab Body */}
            <ellipse cx="50" cy="68" rx="20" ry="11" fill="#fde047" />
            {/* Miner Shell */}
            <path
              d="M32 58 C26 44 38 24 58 22 C78 20 86 38 82 54 C78 64 62 66 50 64 Z"
              fill="url(#minerGrad)"
              stroke="#ca8a04"
              strokeWidth="2"
            />
            {/* Headlamp */}
            <circle cx="50" cy="36" r="6" fill="#fef08a" stroke="#475569" strokeWidth="2" />
            <circle cx="50" cy="36" r="3" fill="#ffffff" />
            {/* Purple Crystal Shards on shell */}
            <polygon points="68,26 74,18 78,28" fill="#c084fc" stroke="#7e22ce" strokeWidth="1" />
            <polygon points="76,32 84,24 86,34" fill="#a855f7" stroke="#6b21a8" strokeWidth="1" />
            <defs>
              <linearGradient id="minerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef9c3" />
                <stop offset="60%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'crazy_conch': // Crazy Conch - Opal rainbow swirl
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <ellipse cx="50" cy="74" rx="36" ry="13" fill="#0891b2" opacity="0.2" />
            {/* Pastel Claws */}
            <path d="M22 68 Q12 76 18 84 Q28 80 30 70 Z" fill="#f472b6" />
            <path d="M78 68 Q88 76 82 84 Q72 80 70 70 Z" fill="#38bdf8" />
            {/* Body */}
            <ellipse cx="50" cy="66" rx="22" ry="12" fill="#c084fc" />
            {/* Rainbow Conch Shell */}
            <path
              d="M30 60 C22 44 34 22 56 20 C78 18 88 38 82 54 C78 64 62 66 48 64 Z"
              fill="url(#rainbowGrad)"
              stroke="#06b6d4"
              strokeWidth="2"
            />
            {/* Swirls */}
            <path
              d="M56 20 C70 30 74 46 66 56 C58 64 42 60 40 50"
              fill="none"
              stroke="#f472b6"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M62 26 C72 36 70 48 60 56"
              fill="none"
              stroke="#fde047"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Sparkle Star */}
            <polygon
              points="70,34 72,39 77,40 73,44 74,49 70,46 66,49 67,44 63,40 68,39"
              fill="#ffffff"
            />
            <defs>
              <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="35%" stopColor="#f472b6" />
                <stop offset="70%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#a7f3d0" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'fiery_warrior': // Fiery Conch Warrior - Armored Black & Gold Spikes
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <ellipse cx="50" cy="74" rx="36" ry="13" fill="#000000" opacity="0.3" />
            {/* Heavy Claws */}
            <path d="M20 66 Q8 74 16 84 Q28 80 30 68 Z" fill="#d97706" stroke="#451a03" strokeWidth="1.5" />
            <path d="M80 66 Q92 74 84 84 Q72 80 70 68 Z" fill="#d97706" stroke="#451a03" strokeWidth="1.5" />
            {/* Armor Shell */}
            <path
              d="M28 60 C20 44 34 22 56 20 C78 18 90 38 84 56 C80 66 62 68 48 64 Z"
              fill="url(#armorGrad)"
              stroke="#fbbf24"
              strokeWidth="2"
            />
            {/* Gold Spikes & Plates */}
            <polygon points="38,24 44,14 48,26" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
            <polygon points="56,22 64,12 68,24" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
            <polygon points="74,28 84,20 84,32" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
            <line x1="38" y1="46" x2="74" y2="46" stroke="#fbbf24" strokeWidth="2.5" />
            <line x1="42" y1="56" x2="70" y2="56" stroke="#fbbf24" strokeWidth="2" />
            <defs>
              <linearGradient id="armorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#44403c" />
                <stop offset="50%" stopColor="#1c1917" />
                <stop offset="100%" stopColor="#0c0a09" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'galloping_tractor': // Galloping Tractor - Red Shell with Strawberry Green Leaf & Star
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <ellipse cx="50" cy="74" rx="36" ry="13" fill="#991b1b" opacity="0.2" />
            {/* Red Claws */}
            <path d="M22 68 Q12 76 18 84 Q28 80 30 70 Z" fill="#ef4444" />
            <path d="M78 68 Q88 76 82 84 Q72 80 70 70 Z" fill="#ef4444" />
            {/* Body */}
            <ellipse cx="50" cy="66" rx="22" ry="12" fill="#f87171" />
            {/* Red Strawberry Conch */}
            <path
              d="M30 60 C22 44 34 22 56 20 C78 18 88 38 82 54 C78 64 62 66 48 64 Z"
              fill="url(#redGrad)"
              stroke="#b91c1c"
              strokeWidth="2"
            />
            {/* Green Leaf / Star on top */}
            <path
              d="M48 20 C42 12 58 10 54 20 C64 14 70 24 58 26"
              fill="#22c55e"
              stroke="#15803d"
              strokeWidth="1.5"
            />
            <polygon
              points="64,36 67,42 74,43 69,48 70,55 64,51 58,55 59,48 54,43 61,42"
              fill="#fde047"
              stroke="#ca8a04"
              strokeWidth="1"
            />
            <defs>
              <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'conchie': // Conchie - Cute Pastel Pink Shell with Star & Jelly-feel
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <ellipse cx="50" cy="74" rx="36" ry="13" fill="#fda4af" opacity="0.3" />
            {/* Cute Pink Claws */}
            <path d="M22 68 Q14 76 20 84 Q28 80 30 70 Z" fill="#fb7185" />
            <path d="M78 68 Q86 76 80 84 Q72 80 70 70 Z" fill="#fb7185" />
            {/* Body */}
            <ellipse cx="50" cy="66" rx="22" ry="12" fill="#ffe4e6" />
            {/* Eyes */}
            <circle cx="44" cy="60" r="3" fill="#0f172a" />
            <circle cx="56" cy="60" r="3" fill="#0f172a" />
            <circle cx="45" cy="59" r="1" fill="#ffffff" />
            <circle cx="57" cy="59" r="1" fill="#ffffff" />
            <ellipse cx="40" cy="64" rx="2" ry="1" fill="#f43f5e" opacity="0.6" />
            <ellipse cx="60" cy="64" rx="2" ry="1" fill="#f43f5e" opacity="0.6" />
            {/* Pink Pearl Shell */}
            <path
              d="M30 58 C22 44 34 24 56 22 C78 20 88 38 82 54 C78 64 62 66 48 64 Z"
              fill="url(#pinkGrad)"
              stroke="#f43f5e"
              strokeWidth="2"
            />
            {/* Starfish & Dots */}
            <polygon
              points="66,32 68,37 74,38 69,42 70,48 65,45 60,48 61,42 56,38 62,37"
              fill="#38bdf8"
              stroke="#0284c7"
              strokeWidth="1"
            />
            <circle cx="45" cy="38" r="2.5" fill="#f43f5e" />
            <circle cx="54" cy="30" r="2" fill="#f43f5e" />
            <defs>
              <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff1f2" />
                <stop offset="40%" stopColor="#fda4af" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'poseidonn': // Poseidonn - Ocean wave teal/cyan shell with pink star
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <ellipse cx="50" cy="74" rx="36" ry="13" fill="#0284c7" opacity="0.2" />
            {/* Cyan Claws */}
            <path d="M22 68 Q12 76 18 84 Q28 80 30 70 Z" fill="#38bdf8" />
            <path d="M78 68 Q88 76 82 84 Q72 80 70 70 Z" fill="#38bdf8" />
            {/* Body */}
            <ellipse cx="50" cy="66" rx="22" ry="12" fill="#bae6fd" />
            {/* Ocean Wave Shell */}
            <path
              d="M30 60 C22 44 34 22 56 20 C78 18 88 38 82 54 C78 64 62 66 48 64 Z"
              fill="url(#cyanGrad)"
              stroke="#0284c7"
              strokeWidth="2"
            />
            {/* Wave crest stripes */}
            <path
              d="M40 32 Q58 26 74 38"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M36 46 Q54 40 76 50"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Pink Coral Star */}
            <polygon
              points="64,36 67,42 74,43 69,48 70,55 64,51 58,55 59,48 54,43 61,42"
              fill="#fb7185"
              stroke="#e11d48"
              strokeWidth="1"
            />
            <defs>
              <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'dejavu': // Deja Vu - Violet / Purple Shell with yellow star
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <ellipse cx="50" cy="74" rx="36" ry="13" fill="#6d28d9" opacity="0.2" />
            {/* Violet Claws */}
            <path d="M22 68 Q12 76 18 84 Q28 80 30 70 Z" fill="#a855f7" />
            <path d="M78 68 Q88 76 82 84 Q72 80 70 70 Z" fill="#a855f7" />
            {/* Body */}
            <ellipse cx="50" cy="66" rx="22" ry="12" fill="#c084fc" />
            {/* Purple Nebula Shell */}
            <path
              d="M30 60 C22 44 34 22 56 20 C78 18 88 38 82 54 C78 64 62 66 48 64 Z"
              fill="url(#purpleGrad)"
              stroke="#7e22ce"
              strokeWidth="2"
            />
            {/* Shell lines */}
            <path
              d="M54 22 C66 30 72 44 66 54 C60 62 46 60 42 50"
              fill="none"
              stroke="#d8b4fe"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Yellow Star */}
            <polygon
              points="64,34 67,40 74,41 69,46 70,53 64,49 58,53 59,46 54,41 61,40"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="1"
            />
            <defs>
              <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3e8ff" />
                <stop offset="45%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6b21a8" />
              </linearGradient>
            </defs>
          </svg>
        );
    }
  };

  return (
    <div
      id={`conch-avatar-${conch.id}`}
      className={`relative flex items-center justify-center select-none ${sizeClasses[size]} ${className} ${
        isAnimated ? 'animate-bounce' : ''
      }`}
    >
      {renderConchShell()}

      {/* Emoticon Speech Bubble Badge */}
      {showEmoticonBadge && emConfig && (
        <div
          id={`conch-emoticon-bubble-${conch.id}`}
          className={`absolute flex items-center justify-center rounded-full shadow-lg border bg-white/95 backdrop-blur-xs transform hover:scale-110 transition-transform ${
            bubbleSizes[size]
          } ${
            emoticon === 'distressed'
              ? 'bg-slate-900 text-white border-slate-700'
              : emoticon === 'angry'
              ? 'bg-rose-50 border-rose-400'
              : emoticon === 'cool'
              ? 'bg-sky-50 border-sky-400'
              : emoticon === 'happy'
              ? 'bg-emerald-50 border-emerald-400'
              : 'bg-amber-50 border-amber-400'
          }`}
          title={`${emConfig.name}: ${emConfig.description}`}
        >
          <span>{emConfig.emoji}</span>
        </div>
      )}
    </div>
  );
};
