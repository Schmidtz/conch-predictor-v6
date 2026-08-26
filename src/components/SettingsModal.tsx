import React from 'react';
import { EmoticonConfig, EmoticonType, SimulationConfig } from '../types';
import { EMOTICON_CONFIGS } from '../data/defaultConches';
import { Sliders, RotateCcw, Check, X, Shield, Zap, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SimulationConfig;
  onChangeConfig: (newConfig: SimulationConfig) => void;
  emoticonConfigs: Record<EmoticonType, EmoticonConfig>;
  onChangeEmoticonConfig: (emoticon: EmoticonType, updated: Partial<EmoticonConfig>) => void;
  onResetAllSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  emoticonConfigs,
  onChangeEmoticonConfig,
  onResetAllSettings,
}) => {
  if (!isOpen) return null;

  const emoticons: EmoticonType[] = ['cool', 'happy', 'nervous', 'distressed', 'angry'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 rounded-3xl p-6 max-w-2xl w-full border border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-scale-up text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100">
                Simulation & Model Customization
              </h3>
              <p className="text-xs text-slate-400">
                Tune Monte Carlo iteration depth, weightings, and individual emoticon multipliers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Monte Carlo Global Settings */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase text-blue-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>1. Monte Carlo Engine Parameters</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            {/* Iterations */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-300">Iteration Count</span>
                <span className="text-blue-400 font-black">
                  {config.iterations.toLocaleString()} Runs
                </span>
              </div>
              <select
                value={config.iterations}
                onChange={(e) =>
                  onChangeConfig({ ...config, iterations: parseInt(e.target.value, 10) })
                }
                className="w-full bg-slate-900 text-xs font-bold text-slate-100 p-2 rounded-xl border border-slate-700 focus:ring-1 focus:ring-blue-500"
              >
                <option value="5000">5,000 (Fastest)</option>
                <option value="10000">10,000 (Standard)</option>
                <option value="25000">25,000 (High Precision)</option>
                <option value="50000">50,000 (Ultra Deep)</option>
                <option value="100000">100,000 (Maximum Fidelity)</option>
              </select>
            </div>

            {/* Random Track Variance */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-300">Track Randomness / Jitter</span>
                <span className="text-blue-400 font-black">
                  {(config.randomVariance * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={config.randomVariance}
                onChange={(e) =>
                  onChangeConfig({ ...config, randomVariance: parseFloat(e.target.value) })
                }
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Predictable</span>
                <span>High Chaos</span>
              </div>
            </div>

            {/* Emoticon Morale Weight */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-300">Emoticon Impact Weight</span>
                <span className="text-blue-400 font-black">
                  {(config.emoticonWeight * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.1"
                value={config.emoticonWeight}
                onChange={(e) =>
                  onChangeConfig({ ...config, emoticonWeight: parseFloat(e.target.value) })
                }
                className="w-full accent-blue-500"
              />
            </div>

            {/* Historical Win Weight */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-300">Historical Stats Weight</span>
                <span className="text-blue-400 font-black">
                  {(config.historicalWeight * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.1"
                value={config.historicalWeight}
                onChange={(e) =>
                  onChangeConfig({ ...config, historicalWeight: parseFloat(e.target.value) })
                }
                className="w-full accent-blue-500"
              />
            </div>

            {/* Popularity Weight */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-300">Popularity Weight (Crowd)</span>
                <span className="text-blue-400 font-black">
                  {(config.popularityWeight * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={config.popularityWeight}
                onChange={(e) =>
                  onChangeConfig({ ...config, popularityWeight: parseFloat(e.target.value) })
                }
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Individual Emoticon Morale Customization */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-blue-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>2. Custom Emoticon Speed Multipliers & Variance</span>
          </h4>

          <div className="space-y-2">
            {emoticons.map((em) => {
              const cfg = emoticonConfigs[em] || EMOTICON_CONFIGS[em];

              return (
                <div
                  key={em}
                  className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-[150px]">
                    <span className="text-xl">{cfg.emoji}</span>
                    <div>
                      <span className="font-bold text-slate-200 block">{cfg.name}</span>
                      <span className="text-[10px] text-slate-400">{cfg.description}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Speed Multiplier</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.5"
                        max="2.0"
                        value={cfg.speedMultiplier}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            onChangeEmoticonConfig(em, { speedMultiplier: val });
                          }
                        }}
                        className="w-20 bg-slate-900 font-bold text-slate-100 p-1.5 rounded-lg border border-slate-700"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Variance (Volatility)</span>
                      <input
                        type="number"
                        step="0.05"
                        min="0.2"
                        max="3.0"
                        value={cfg.varianceFactor}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            onChangeEmoticonConfig(em, { varianceFactor: val });
                          }
                        }}
                        className="w-20 bg-slate-900 font-bold text-slate-100 p-1.5 rounded-lg border border-slate-700"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onResetAllSettings}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All to Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-900/30 cursor-pointer transition"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
