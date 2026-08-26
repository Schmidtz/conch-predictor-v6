import React, { useState } from 'react';
import { ConchSimResult, ExactaTrifectaPrediction, SimulationOutput } from '../types';
import { ConchAvatar } from './ConchAvatar';
import {
  Crown,
  Sparkles,
  TrendingUp,
  Award,
  Flame,
  AlertTriangle,
  Play,
  RotateCcw,
  BarChart3,
  ListOrdered,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ALL_CONCHES, EMOTICON_CONFIGS } from '../data/defaultConches';

interface PredictionDashboardProps {
  simulationOutput: SimulationOutput | null;
  isRunning: boolean;
  onRunSimulation: () => void;
  onOpenLiveSimulator: () => void;
}

export const PredictionDashboard: React.FC<PredictionDashboardProps> = ({
  simulationOutput,
  isRunning,
  onRunSimulation,
  onOpenLiveSimulator,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ranks' | 'exactas' | 'h2h'>('ranks');

  if (!simulationOutput || simulationOutput.results.length === 0) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-8 text-center border border-slate-800 shadow-sm">
        <div className="w-16 h-16 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">Monte Carlo Simulation Ready</h3>
        <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
          Input or customize your 6 competing conches above, then run the simulation to calculate win
          probabilities and optimal betting tiers.
        </p>
        <button
          id="btn-run-initial-simulation"
          type="button"
          onClick={onRunSimulation}
          disabled={isRunning}
          className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-900/30 transition-all hover:scale-102 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{isRunning ? 'Calculating Simulation...' : 'Calculate Monte Carlo Predictions'}</span>
        </button>
      </div>
    );
  }

  const { results, exactas, trifectas, headToHeadMatrix, iterations, dataDriven, historicalRacesUsed, modelVersion } = simulationOutput;
  const topPick = results[0];
  const secondPick = results[1];
  const thirdPick = results[2];

  const getTierBadge = (tier: ConchSimResult['recommendationTier']) => {
    switch (tier) {
      case 'top_pick':
        return {
          label: '⭐ TOP PICK',
          bg: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs',
          border: 'border-amber-400',
        };
      case 'value_bet':
        return {
          label: '💎 VALUE BET',
          bg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs',
          border: 'border-emerald-400',
        };
      case 'strong_contender':
        return {
          label: '🥈 CONTENDER',
          bg: 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-xs',
          border: 'border-blue-400',
        };
      case 'dark_horse':
        return {
          label: '⚡ DARK HORSE',
          bg: 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs',
          border: 'border-purple-400',
        };
      case 'avoid':
      default:
        return {
          label: '⚠️ LOW EV / RISK',
          bg: 'bg-slate-800 text-slate-400 border border-slate-700',
          border: 'border-slate-700',
        };
    }
  };

  return (
    <div id="prediction-dashboard" className="space-y-6">
      {/* Top Bar with Simulation Stats & Live Race Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-md">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-100 tracking-tight">
                Monte Carlo Prediction Results
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                {iterations.toLocaleString()} Iterations
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${dataDriven ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'}`}>
                {dataDriven ? `DATABASE MODEL • ${historicalRacesUsed ?? 0} races` : 'PRIOR MODEL • NO HISTORY'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {modelVersion || 'Hybrid historical model + Monte Carlo'} — historical evidence is applied before simulation, then the current lineup is simulated.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-re-run-sim"
            type="button"
            onClick={onRunSimulation}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 hover:bg-slate-700 transition shadow-xs cursor-pointer"
            title="Re-run Monte Carlo simulation"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Re-Simulate</span>
          </button>

          <button
            id="btn-open-live-track"
            type="button"
            onClick={onOpenLiveSimulator}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-900/30 transition hover:scale-102 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Watch Live 2D/3D Race</span>
          </button>
        </div>
      </div>

      {/* Hero Projected Winner Banner */}
      {topPick && (
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 rounded-2xl p-5 border border-slate-700 shadow-sm overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
            <Crown className="w-48 h-48 text-blue-400" />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <ConchAvatar
                  conch={topPick.conch}
                  emoticon={topPick.emoticon}
                  size="xl"
                  showEmoticonBadge={true}
                />
                <div className="absolute -top-3 -left-2 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md border-2 border-slate-900">
                  <Crown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider ${getTierBadge(topPick.recommendationTier).bg}`}>
                  {getTierBadge(topPick.recommendationTier).label}
                </span>
                <span className="text-xs font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  Rank #1 Favorite
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-100">
                {topPick.conch.name}
              </h3>
              <p className="text-xs text-slate-300 max-w-xl font-medium">
                {topPick.recommendationReason}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="bg-slate-950/80 rounded-lg px-3 py-1.5 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Win Probability
                  </span>
                  <span className="text-xl font-black text-amber-400">
                    {topPick.winProbability.toFixed(1)}%
                  </span>
                </div>

                <div className="bg-slate-950/80 rounded-lg px-3 py-1.5 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Top 2 (Place)
                  </span>
                  <span className="text-lg font-bold text-slate-200">
                    {topPick.top2Probability.toFixed(1)}%
                  </span>
                </div>

                <div className="bg-slate-950/80 rounded-lg px-3 py-1.5 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Top 3 (Show)
                  </span>
                  <span className="text-lg font-bold text-slate-200">
                    {topPick.top3Probability.toFixed(1)}%
                  </span>
                </div>

                {topPick.popularity > 0 && (
                  <div className="bg-slate-950/80 rounded-lg px-3 py-1.5 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      EV Edge vs Crowd
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        topPick.expectedValueScore >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {topPick.expectedValueScore >= 0 ? '+' : ''}
                      {topPick.expectedValueScore.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs for Detailed Analytics */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="flex border-b border-slate-800 bg-slate-950/80 p-1.5 gap-1.5">
          <button
            id="tab-ranks"
            type="button"
            onClick={() => setActiveSubTab('ranks')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer ${
              activeSubTab === 'ranks'
                ? 'bg-slate-800 text-slate-100 shadow-xs border border-slate-700'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>Full Field Probability & Ranks</span>
          </button>

          <button
            id="tab-exactas"
            type="button"
            onClick={() => setActiveSubTab('exactas')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer ${
              activeSubTab === 'exactas'
                ? 'bg-slate-800 text-slate-100 shadow-xs border border-slate-700'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-sky-400" />
            <span>Exacta (1-2) & Trifecta (1-2-3) Forecast</span>
          </button>

          <button
            id="tab-h2h"
            type="button"
            onClick={() => setActiveSubTab('h2h')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer ${
              activeSubTab === 'h2h'
                ? 'bg-slate-800 text-slate-100 shadow-xs border border-slate-700'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Head-to-Head Matrix</span>
          </button>
        </div>

        {/* Tab 1: Full Field Probability & Ranks */}
        {activeSubTab === 'ranks' && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {results.map((res, index) => {
                const tier = getTierBadge(res.recommendationTier);
                const emConfig = EMOTICON_CONFIGS[res.emoticon];

                return (
                  <div
                    key={res.conchId}
                    id={`result-row-${res.conchId}`}
                    className={`relative p-3.5 rounded-xl border transition-all ${
                      index === 0
                        ? 'bg-slate-950/80 border-blue-500/50'
                        : index === 1
                        ? 'bg-slate-950/60 border-slate-700'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Left: Conch info & Avatar */}
                      <div className="flex items-center gap-3 min-w-[240px]">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full font-black text-sm bg-slate-800 text-slate-200 border border-slate-700">
                          #{index + 1}
                        </div>
                        <ConchAvatar
                          conch={res.conch}
                          emoticon={res.emoticon}
                          size="md"
                          showEmoticonBadge={true}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-100 text-sm">{res.conch.name}</h4>
                            <span className="text-xs">{emConfig.emoji}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${tier.bg}`}>
                              {tier.label}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Avg Finish: #{res.avgRank.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Win Probability Visual Bar */}
                      <div className="flex-1 max-w-md">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-slate-400">Win Rate Simulation</span>
                          <span className="text-amber-400 text-sm font-black">
                            {res.winProbability.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              index === 0
                                ? 'bg-gradient-to-r from-blue-500 to-amber-400'
                                : index === 1
                                ? 'bg-gradient-to-r from-blue-600 to-sky-400'
                                : 'bg-gradient-to-r from-slate-600 to-slate-400'
                            }`}
                            style={{ width: `${Math.max(2, res.winProbability)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>Top 2: {res.top2Probability.toFixed(1)}%</span>
                          <span>Top 3: {res.top3Probability.toFixed(1)}%</span>
                          {res.popularity > 0 && <span>Popularity: {res.popularity.toFixed(1)}%</span>}
                        </div>
                      </div>

                      {/* Right: Edge / Reasoning snippet */}
                      <div className="md:text-right text-left min-w-[180px]">
                        <p className="text-xs text-slate-300 font-medium leading-tight">
                          {res.recommendationReason}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Exacta & Trifecta Combinations */}
        {activeSubTab === 'exactas' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Exactas (1st & 2nd) */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  1-2
                </span>
                <h4 className="font-bold text-slate-100 text-sm">
                  Top Exacta Predictions (1st & 2nd)
                </h4>
              </div>

              <div className="space-y-2">
                {exactas.map((ex, idx) => {
                  const c1 = ALL_CONCHES.find((c) => c.id === ex.combination[0]);
                  const c2 = ALL_CONCHES.find((c) => c.id === ex.combination[1]);

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-200">
                        <span className="w-4 text-slate-500">#{idx + 1}</span>
                        <span className="text-amber-400">{c1?.name || ex.combination[0]}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-sky-400">{c2?.name || ex.combination[1]}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-100">{ex.probability.toFixed(1)}%</span>
                        <span className="block text-[10px] text-slate-500">
                          odds ~{(100 / Math.max(0.1, ex.probability)).toFixed(1)}x
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Trifectas (1st, 2nd & 3rd) */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                  1-2-3
                </span>
                <h4 className="font-bold text-slate-100 text-sm">
                  Top Trifecta Predictions (1st, 2nd, 3rd)
                </h4>
              </div>

              <div className="space-y-2">
                {trifectas.map((tri, idx) => {
                  const c1 = ALL_CONCHES.find((c) => c.id === tri.combination[0]);
                  const c2 = ALL_CONCHES.find((c) => c.id === tri.combination[1]);
                  const c3 = ALL_CONCHES.find((c) => c.id === tri.combination[2]);

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-slate-200 truncate max-w-[260px]">
                        <span className="w-4 text-slate-500">#{idx + 1}</span>
                        <span className="text-amber-400 truncate">{c1?.name.split(',')[0]}</span>
                        <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                        <span className="text-sky-400 truncate">{c2?.name.split(',')[0]}</span>
                        <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                        <span className="text-purple-400 truncate">{c3?.name.split(',')[0]}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-black text-slate-100">{tri.probability.toFixed(1)}%</span>
                        <span className="block text-[10px] text-slate-500">
                          odds ~{(100 / Math.max(0.1, tri.probability)).toFixed(1)}x
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Head to Head Matrix */}
        {activeSubTab === 'h2h' && (
          <div className="p-4 overflow-x-auto">
            <div className="text-xs text-slate-400 mb-3">
              Values represent the row conch's simulated win rate (%) when directly racing against the column conch.
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                  <th className="p-2.5">Conch</th>
                  {results.map((r) => (
                    <th key={r.conchId} className="p-2.5 text-center truncate max-w-[90px]" title={r.conch.name}>
                      {r.conch.name.split(',')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {results.map((row) => (
                  <tr key={row.conchId} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-slate-200 flex items-center gap-1.5">
                      <span>{EMOTICON_CONFIGS[row.emoticon].emoji}</span>
                      <span>{row.conch.name.split(',')[0]}</span>
                    </td>
                    {results.map((col) => {
                      if (col.conchId === row.conchId) {
                        return (
                          <td key={col.conchId} className="p-2.5 text-center text-slate-600 bg-slate-950">
                            -
                          </td>
                        );
                      }
                      const winRateAgainst =
                        headToHeadMatrix[row.conchId]?.[col.conchId] ?? 50;

                      return (
                        <td
                          key={col.conchId}
                          className={`p-2.5 text-center font-bold ${
                            winRateAgainst > 60
                              ? 'text-emerald-400 bg-emerald-950/40'
                              : winRateAgainst < 40
                              ? 'text-rose-400 bg-rose-950/40'
                              : 'text-slate-300'
                          }`}
                        >
                          {winRateAgainst.toFixed(0)}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
