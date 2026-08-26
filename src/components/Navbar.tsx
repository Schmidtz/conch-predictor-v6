import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Trophy,
  Database,
  Sliders,
  Play,
  RotateCcw,
  Clock,
  Layers,
  ChevronDown,
  Shell,
} from 'lucide-react';
import { SCREENSHOT_PRESETS } from '../data/defaultConches';

interface NavbarProps {
  activeTab: 'predictor' | 'database' | 'roster';
  setActiveTab: (tab: 'predictor' | 'database' | 'roster') => void;
  onOpenSettings: () => void;
  onOpenLiveSimulator: () => void;
  onApplyPreset: (presetIndex: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenLiveSimulator,
  onApplyPreset,
}) => {
  // Simulated remaining voting countdown timer (like screenshot "Remaining voting time: 9m 11s")
  const [secondsLeft, setSecondsLeft] = useState(551); // ~9m 11s

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-slate-100 shadow-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Conch Race Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-inner">
            <span className="text-2xl">🐚</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-wider text-slate-100 font-sans">
                CONCH RACE
              </h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                AI PREDICTOR
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>Voting round timer:</span>
              <span className="font-semibold text-blue-300">{formatTimer(secondsLeft)}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            id="nav-tab-predictor"
            type="button"
            onClick={() => setActiveTab('predictor')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'predictor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Race Predictor</span>
          </button>

          <button
            id="nav-tab-database"
            type="button"
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'database'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database</span>
          </button>

          <button
            id="nav-tab-roster"
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>9 Conches</span>
          </button>
        </nav>

        {/* Preset Selector & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Screenshot Preset Picker */}
          <div className="relative group">
            <select
              onChange={(e) => {
                const idx = parseInt(e.target.value, 10);
                if (!isNaN(idx)) {
                  onApplyPreset(idx);
                }
              }}
              defaultValue=""
              className="appearance-none bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-medium text-xs pl-3 pr-7 py-1.5 rounded-xl border border-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled className="bg-slate-900 text-slate-300">
                Load Screenshot Lineup...
              </option>
              {SCREENSHOT_PRESETS.map((preset, idx) => (
                <option key={idx} value={idx} className="bg-slate-900 text-slate-200">
                  {preset.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={onOpenLiveSimulator}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-900/30 cursor-pointer transition"
            title="Open Live Race Track Simulator"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">Live 2D Track</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer"
            title="Simulation Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
