import React, { useState } from 'react';
import { Conch, ConchStats, EmoticonType } from '../types';
import { ALL_CONCHES, EMOTICON_CONFIGS } from '../data/defaultConches';
import { ConchAvatar } from './ConchAvatar';
import { Trophy, Zap, Shield, Flame, Activity, Star, ChevronRight, Swords, Sparkles } from 'lucide-react';

interface ConchRosterViewProps {
  databaseStats: Record<string, ConchStats>;
  customConches: Conch[];
  onUpdateConch?: (updatedConch: Conch) => void;
}

export const ConchRosterView: React.FC<ConchRosterViewProps> = ({
  databaseStats,
  customConches,
  onUpdateConch,
}) => {
  const [selectedConch, setSelectedConch] = useState<Conch | null>(null);

  const conches = customConches || ALL_CONCHES;

  return (
    <div id="conch-roster-view" className="space-y-6">
      {/* Top Description */}
      <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <span>The 9 Champion Conches</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
              Full Roster
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Examine the individual profiles, baseline shell traits, and historical morale win rates for
            all 9 competing hermit conches.
          </p>
        </div>
      </div>

      {/* 9 Conch Grid (3x3 on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {conches.map((conch) => {
          const stats = databaseStats[conch.id];
          const hasDbData = stats && stats.totalRaces > 0;

          return (
            <div
              key={conch.id}
              id={`roster-card-${conch.id}`}
              onClick={() => setSelectedConch(conch)}
              className="group bg-slate-900 rounded-2xl border border-slate-800 shadow-xs hover:shadow-lg hover:border-blue-500/60 transition-all duration-200 p-4 cursor-pointer relative overflow-hidden flex flex-col justify-between"
            >
              {/* Top Row: Name & Shell type */}
              <div>
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="font-black text-slate-100 text-sm group-hover:text-blue-400 transition truncate max-w-[170px]">
                      {conch.name}
                    </h3>
                    <span className="text-[11px] font-medium text-slate-400 block truncate">
                      {conch.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[100px]">
                    {conch.shellType}
                  </span>
                </div>

                {/* Center Visual Avatar */}
                <div className="py-4 flex items-center justify-center bg-slate-950/60 rounded-xl my-2 border border-slate-800/80">
                  <ConchAvatar conch={conch} size="lg" showEmoticonBadge={false} />
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 italic mb-3">
                  "{conch.description}"
                </p>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="grid grid-cols-3 gap-1 text-center bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">
                      Base Spd
                    </span>
                    <span className="text-xs font-black text-slate-200">
                      {conch.baseSpeed}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">
                      Stamina
                    </span>
                    <span className="text-xs font-black text-slate-200">
                      {conch.baseStamina}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">
                      Scr Wins
                    </span>
                    <span className="text-xs font-black text-blue-400">
                      {conch.initialWins}
                    </span>
                  </div>
                </div>

                {hasDbData ? (
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-slate-400 font-medium">DB Win Rate:</span>
                    <span className="font-black text-emerald-400">
                      {stats.winRate.toFixed(1)}% ({stats.totalWins}/{stats.totalRaces})
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 text-center">
                    No custom races logged yet
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Conch Detail Modal */}
      {selectedConch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-xl w-full border border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-scale-up text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <ConchAvatar conch={selectedConch} size="md" showEmoticonBadge={false} />
                <div>
                  <h3 className="text-lg font-black text-slate-100">
                    {selectedConch.name}
                  </h3>
                  <p className="text-xs text-blue-400 font-bold">
                    {selectedConch.title} • {selectedConch.shellType}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConch(null)}
                className="text-slate-400 hover:text-slate-200 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Trait & Lore */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {selectedConch.description}
              </p>
            </div>

            {/* Morale / Emoticon Breakdown from Database */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Historical Win Rate by Morale / Emoticon</span>
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {(['cool', 'happy', 'nervous', 'distressed', 'angry'] as EmoticonType[]).map((em) => {
                  const cfg = EMOTICON_CONFIGS[em];
                  const emStat =
                    databaseStats[selectedConch.id]?.emoticonStats[em];

                  return (
                    <div
                      key={em}
                      className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center"
                    >
                      <span className="text-xl block">{cfg.emoji}</span>
                      <span className="text-[10px] font-bold text-slate-400 block mt-1">
                        {cfg.name.split(' ')[0]}
                      </span>
                      <span className="text-xs font-black text-slate-200 block mt-0.5">
                        {emStat && emStat.races > 0
                          ? `${emStat.winRate.toFixed(0)}%`
                          : `~${(cfg.speedMultiplier * 16.6).toFixed(0)}%`}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        {emStat ? `${emStat.wins}/${emStat.races} w` : 'model est'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Head-to-Head Top Matchups */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-red-400" />
                <span>Head-to-Head Records against Competitors</span>
              </h4>

              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {conches
                  .filter((c) => c.id !== selectedConch.id)
                  .map((opponent) => {
                    const h2h =
                      databaseStats[selectedConch.id]?.headToHead[opponent.id];
                    const races = h2h ? h2h.races : 0;
                    const wins = h2h ? h2h.wins : 0;
                    const winrate = races > 0 ? (wins / races) * 100 : 50;

                    return (
                      <div
                        key={opponent.id}
                        className="flex items-center justify-between p-2 bg-slate-950/70 rounded-xl text-xs border border-slate-800"
                      >
                        <div className="flex items-center gap-2 font-bold text-slate-200">
                          <span>{opponent.name.split(',')[0]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">
                            {races > 0 ? `${wins}W - ${races - wins}L` : 'No direct races'}
                          </span>
                          <span
                            className={`font-black px-2 py-0.5 rounded-full text-[10px] ${
                              winrate > 50
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : winrate < 50
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {winrate.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedConch(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
