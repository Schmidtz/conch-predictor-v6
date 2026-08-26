import React from 'react';
import { Conch, ConchStats, EmoticonType, RaceParticipantInput } from '../types';
import { ALL_CONCHES, EMOTICON_CONFIGS } from '../data/defaultConches';
import { ConchAvatar } from './ConchAvatar';
import { ChevronDown, Trophy, Users, ShieldAlert, Sparkles } from 'lucide-react';

interface LineupInputCardProps {
  slotIndex: number;
  participant: RaceParticipantInput;
  allSelectedIds: string[];
  databaseStats: Record<string, ConchStats>;
  onChangeConch: (slotIndex: number, newConchId: string) => void;
  onChangeEmoticon: (slotIndex: number, newEmoticon: EmoticonType) => void;
  onChangePopularity: (slotIndex: number, popularity: number) => void;
  onChangeWins: (slotIndex: number, wins: number) => void;
}

const EMOTICON_LIST: EmoticonType[] = ['cool', 'happy', 'nervous', 'distressed', 'angry'];

export const LineupInputCard: React.FC<LineupInputCardProps> = ({
  slotIndex,
  participant,
  allSelectedIds,
  databaseStats,
  onChangeConch,
  onChangeEmoticon,
  onChangePopularity,
  onChangeWins,
}) => {
  const currentConch =
    ALL_CONCHES.find((c) => c.id === participant.conchId) || ALL_CONCHES[0];
  const stats = databaseStats[participant.conchId];
  const activeEmConfig = EMOTICON_CONFIGS[participant.emoticon];

  return (
    <div
      id={`lineup-slot-${slotIndex}`}
      className="relative flex flex-col bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-800 shadow-sm hover:border-slate-700 transition-all duration-200 overflow-hidden"
    >
      {/* Top Banner with Name & Conch Selection */}
      <div className="bg-slate-800/60 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-xs flex items-center justify-center">
            {slotIndex + 1}
          </span>
          <div className="relative group">
            <select
              id={`select-conch-slot-${slotIndex}`}
              value={participant.conchId}
              onChange={(e) => onChangeConch(slotIndex, e.target.value)}
              className="appearance-none bg-transparent font-bold text-slate-100 text-sm md:text-base pr-6 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
            >
              {ALL_CONCHES.map((c) => {
                const isSelectedElsewhere =
                  allSelectedIds.includes(c.id) && c.id !== participant.conchId;
                return (
                  <option
                    key={c.id}
                    value={c.id}
                    disabled={isSelectedElsewhere}
                    className={isSelectedElsewhere ? 'bg-slate-900 text-slate-500' : 'bg-slate-900 text-slate-100'}
                  >
                    {c.name} {isSelectedElsewhere ? '(In Use)' : ''}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Title or Shell Tag */}
        <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full truncate max-w-[120px] border border-slate-700/50">
          {currentConch.shellType}
        </span>
      </div>

      {/* Conch Visual Stage & Emoticon Indicator */}
      <div className="relative p-3 flex flex-col items-center justify-center bg-slate-950/40">
        <div className="relative my-1">
          <ConchAvatar
            conch={currentConch}
            emoticon={participant.emoticon}
            size="lg"
            showEmoticonBadge={true}
          />
        </div>

        {/* Emoticon Selector Row */}
        <div className="w-full mt-2 pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Current Morale / Emoticon:</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                participant.emoticon === 'cool'
                  ? 'text-sky-300 bg-sky-950/70 border-sky-800'
                  : participant.emoticon === 'happy'
                  ? 'text-emerald-300 bg-emerald-950/70 border-emerald-800'
                  : participant.emoticon === 'angry'
                  ? 'text-rose-300 bg-rose-950/70 border-rose-800'
                  : participant.emoticon === 'distressed'
                  ? 'text-slate-300 bg-slate-800 border-slate-700'
                  : 'text-amber-300 bg-amber-950/70 border-amber-800'
              }`}
            >
              {activeEmConfig.name.split(' ')[0]}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1">
            {EMOTICON_LIST.map((em) => {
              const cfg = EMOTICON_CONFIGS[em];
              const isSelected = participant.emoticon === em;
              return (
                <button
                  key={em}
                  id={`btn-emoticon-${slotIndex}-${em}`}
                  type="button"
                  onClick={() => onChangeEmoticon(slotIndex, em)}
                  title={`${cfg.name}: ${cfg.description} (x${cfg.speedMultiplier} spd)`}
                  className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-blue-600/30 border-blue-500 text-white shadow-xs ring-1 ring-blue-400 transform scale-105'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="text-lg leading-none">{cfg.emoji}</span>
                  <span className="text-[9px] font-medium text-slate-400 mt-0.5 leading-none truncate max-w-full">
                    {em === 'distressed' ? 'Bomb' : em === 'nervous' ? 'Sweat' : em}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats & Inputs (Popularity & Wins) */}
        <div className="w-full mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          {/* Popularity Input */}
          <div className="bg-slate-950/70 rounded-lg p-2 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor={`popularity-input-${slotIndex}`}
                className="text-[11px] font-semibold text-slate-400 flex items-center gap-1"
                title="Crowd Support / Popularity %"
              >
                <Users className="w-3 h-3 text-cyan-400" />
                <span>Popularity</span>
              </label>
              <span className="text-xs font-bold text-cyan-400">
                {participant.popularity !== undefined
                  ? `${participant.popularity.toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <input
                id={`popularity-input-${slotIndex}`}
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={participant.popularity ?? ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onChangePopularity(slotIndex, isNaN(val) ? 0 : Math.max(0, Math.min(100, val)));
                }}
                className="w-full bg-slate-900 text-xs font-bold text-slate-100 px-2 py-1 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0.0"
              />
            </div>
          </div>

          {/* Win Count Input */}
          <div className="bg-slate-950/70 rounded-lg p-2 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor={`wins-input-${slotIndex}`}
                className="text-[11px] font-semibold text-slate-400 flex items-center gap-1"
                title="Historical Wins recorded"
              >
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Total Wins</span>
              </label>
              {stats && stats.totalRaces > 0 ? (
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1 rounded">
                  {stats.winRate.toFixed(0)}% db
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">screen</span>
              )}
            </div>
            <input
              id={`wins-input-${slotIndex}`}
              type="number"
              min="0"
              max="99999"
              value={participant.currentWins ?? currentConch.initialWins}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onChangeWins(slotIndex, isNaN(val) ? 0 : Math.max(0, val));
              }}
              className="w-full bg-slate-900 text-xs font-bold text-slate-100 px-2 py-1 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="240"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
