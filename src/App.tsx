import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Conch,
  ConchStats,
  EmoticonConfig,
  EmoticonType,
  RaceParticipantInput,
  RaceRecord,
  SimulationConfig,
  SimulationOutput,
} from './types';
import { ALL_CONCHES, EMOTICON_CONFIGS, SCREENSHOT_PRESETS } from './data/defaultConches';
import { runMonteCarloSimulation } from './services/monteCarlo';
import { calculateConchStats } from './services/statsService';
import { Navbar } from './components/Navbar';
import { LineupInputCard } from './components/LineupInputCard';
import { PredictionDashboard } from './components/PredictionDashboard';
import { DatabaseManager } from './components/DatabaseManager';
import { ConchRosterView } from './components/ConchRosterView';
import { LiveRaceSimulator } from './components/LiveRaceSimulator';
import { SettingsModal } from './components/SettingsModal';
import { QuickRaceSaveCard } from './components/QuickRaceSaveCard';
import { Sparkles, Play, RotateCcw, Shuffle, Info, Zap } from 'lucide-react';

const LOCAL_STORAGE_DB_KEY = 'conch_race_records_v1';
const LOCAL_STORAGE_CONFIG_KEY = 'conch_race_sim_config_v1';
const LOCAL_STORAGE_EMOTICONS_KEY = 'conch_race_emoticons_v1';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'predictor' | 'database' | 'roster'>('predictor');
  const [isLiveRaceOpen, setIsLiveRaceOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Database Records State: Cloudflare D1 is the source of truth; localStorage is offline fallback only
  const [records, setRecords] = useState<RaceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DB_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [serverConnected, setServerConnected] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  // Load the shared server database. LocalStorage remains as an offline fallback.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/records');
        if (!response.ok) throw new Error('API unavailable');
        const data = await response.json();
        if (!cancelled && Array.isArray(data.records)) {
          setRecords(data.records);
          setServerConnected(true);
        }
      } catch {
        if (!cancelled) setServerConnected(false);
      } finally {
        if (!cancelled) setIsLoadingRecords(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Keep a local offline cache. When the API is available, D1 remains the source of truth.
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(records));
    } catch {
      // ignore cache failures
    }
  }, [records]);

  // Simulation Config
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            iterations: 50000,
            emoticonWeight: 1.0,
            historicalWeight: 1.0,
            popularityWeight: 0.25,
            randomVariance: 0.35,
            raceDistance: 100,
          };
    } catch {
      return {
        iterations: 50000,
        emoticonWeight: 1.0,
        historicalWeight: 1.0,
        popularityWeight: 0.25,
        randomVariance: 0.35,
        raceDistance: 100,
      };
    }
  });

  // Emoticon Configs
  const [emoticonConfigs, setEmoticonConfigs] = useState<Record<EmoticonType, EmoticonConfig>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_EMOTICONS_KEY);
      return saved ? JSON.parse(saved) : EMOTICON_CONFIGS;
    } catch {
      return EMOTICON_CONFIGS;
    }
  });

  // 6 Active Conch Participants in the Lineup
  // Default to Screenshot 1 lineup
  const [lineup, setLineup] = useState<RaceParticipantInput[]>([
    { conchId: 'karl', emoticon: 'distressed', popularity: 21.9, currentWins: 238 },
    { conchId: 'dejavu', emoticon: 'distressed', popularity: 6.8, currentWins: 227 },
    { conchId: 'crazy_conch', emoticon: 'nervous', popularity: 2.2, currentWins: 229 },
    { conchId: 'fiery_warrior', emoticon: 'nervous', popularity: 5.2, currentWins: 189 },
    { conchId: 'blackhat', emoticon: 'angry', popularity: 56.7, currentWins: 260 },
    { conchId: 'galloping_tractor', emoticon: 'nervous', popularity: 6.8, currentWins: 258 },
  ]);

  // Simulation Output & Calculation State
  const [simulationOutput, setSimulationOutput] = useState<SimulationOutput | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Compute Conch Stats from Database
  const databaseStats = useMemo(() => {
    return calculateConchStats(records, ALL_CONCHES);
  }, [records]);

  // Run Simulation Function
  const handleExecuteSimulation = useCallback(() => {
    let cancelled = false;
    setIsSimulating(true);

    // Free Cloudflare Workers has a 10 ms CPU limit per invocation, so the
    // heavy Monte Carlo calculation intentionally runs in the user's browser.
    // The historical database remains shared in Cloudflare D1.
    const run = async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (cancelled) return;
      const browserConfig = {
        ...simulationConfig,
        iterations: Math.min(100000, Math.max(5000, simulationConfig.iterations)),
      };
      const output = runMonteCarloSimulation(
        lineup,
        databaseStats,
        emoticonConfigs,
        browserConfig,
        ALL_CONCHES,
      );
      if (!cancelled) {
        setSimulationOutput(output);
        setIsSimulating(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [lineup, databaseStats, emoticonConfigs, simulationConfig]);

  // Trigger simulation on lineup or config changes
  useEffect(() => {
    handleExecuteSimulation();
  }, [handleExecuteSimulation]);

  // Handler: Change Conch in Slot
  const handleChangeConch = (slotIndex: number, newConchId: string) => {
    const next = [...lineup];
    const conch = ALL_CONCHES.find((c) => c.id === newConchId);
    next[slotIndex] = {
      ...next[slotIndex],
      conchId: newConchId,
      currentWins: conch?.initialWins ?? 240,
    };
    setLineup(next);
  };

  // Handler: Change Emoticon
  const handleChangeEmoticon = (slotIndex: number, newEmoticon: EmoticonType) => {
    const next = [...lineup];
    next[slotIndex] = {
      ...next[slotIndex],
      emoticon: newEmoticon,
    };
    setLineup(next);
  };

  // Handler: Change Popularity
  const handleChangePopularity = (slotIndex: number, popularity: number) => {
    const next = [...lineup];
    next[slotIndex] = {
      ...next[slotIndex],
      popularity,
    };
    setLineup(next);
  };

  // Handler: Change Wins
  const handleChangeWins = (slotIndex: number, wins: number) => {
    const next = [...lineup];
    next[slotIndex] = {
      ...next[slotIndex],
      currentWins: wins,
    };
    setLineup(next);
  };

  // Handler: Apply Preset Lineup
  const handleApplyPreset = (presetIndex: number) => {
    const preset = SCREENSHOT_PRESETS[presetIndex];
    if (preset) {
      setLineup([...preset.participants]);
      setActiveTab('predictor');
    }
  };

  // Handler: Randomize Lineup
  const handleRandomizeLineup = () => {
    const shuffled = [...ALL_CONCHES].sort(() => 0.5 - Math.random());
    const emoticons: EmoticonType[] = ['cool', 'happy', 'nervous', 'distressed', 'angry'];
    const chosen = shuffled.slice(0, 6).map((c) => ({
      conchId: c.id,
      emoticon: emoticons[Math.floor(Math.random() * emoticons.length)],
      popularity: Number((Math.random() * 30 + 5).toFixed(1)),
      currentWins: c.initialWins,
    }));
    setLineup(chosen);
  };

  // Handler: Add Race to Database
  const handleAddRecord = async (newRec: Omit<RaceRecord, 'id'>) => {
    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRec),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.error || 'Shared database save failed');
      const record = body as RaceRecord;
      setRecords((prev) => [record, ...prev.filter((x) => x.id !== record.id)]);
      setServerConnected(true);
      return record;
    } catch (error) {
      setServerConnected(false);
      throw error;
    }
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    fetch(`/api/records/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => setServerConnected(false));
  };

  const handleClearDatabase = () => {
    setRecords([]);
    fetch('/api/records', { method: 'DELETE' }).catch(() => setServerConnected(false));
  };

  const handleImportRecords = (imported: RaceRecord[]) => {
    setRecords(imported);
    fetch('/api/records/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ records: imported }) })
      .then((r) => { if (!r.ok) throw new Error(); setServerConnected(true); })
      .catch(() => setServerConnected(false));
  };

  // Handler: Seed Sample Data based on screenshot battles
  const handleSeedScreenshotData = () => {
    const sampleRaces: RaceRecord[] = [
      {
        id: 'seed_1',
        timestamp: Date.now() - 3600000 * 5,
        raceNumber: 1,
        participants: SCREENSHOT_PRESETS[0].participants,
        winnerId: 'blackhat',
        secondId: 'karl',
        thirdId: 'galloping_tractor',
        notes: 'Screenshot 1 lineup match: Blackhat enraged surge won.',
      },
      {
        id: 'seed_2',
        timestamp: Date.now() - 3600000 * 4,
        raceNumber: 2,
        participants: SCREENSHOT_PRESETS[1].participants,
        winnerId: 'blackhat',
        secondId: 'gold_miner',
        thirdId: 'galloping_tractor',
        notes: 'Screenshot 2 match: Blackhat cool mood took 1st place.',
      },
      {
        id: 'seed_3',
        timestamp: Date.now() - 3600000 * 3,
        raceNumber: 3,
        participants: SCREENSHOT_PRESETS[2].participants,
        winnerId: 'dejavu',
        secondId: 'fiery_warrior',
        thirdId: 'poseidonn',
        notes: 'Screenshot 3 match: Deja Vu cool sprint dominated.',
      },
      {
        id: 'seed_4',
        timestamp: Date.now() - 3600000 * 2,
        raceNumber: 4,
        participants: SCREENSHOT_PRESETS[3].participants,
        winnerId: 'poseidonn',
        secondId: 'gold_miner',
        thirdId: 'dejavu',
        notes: 'Screenshot 4 match: Poseidonn happy high popularity finish.',
      },
      {
        id: 'seed_5',
        timestamp: Date.now() - 3600000 * 1,
        raceNumber: 5,
        participants: SCREENSHOT_PRESETS[4].participants,
        winnerId: 'gold_miner',
        secondId: 'blackhat',
        thirdId: 'dejavu',
        notes: 'Screenshot 5 match: Gold miner happy high morale victory.',
      },
    ];
    setRecords(sampleRaces);
    fetch('/api/records/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ records: sampleRaces }) }).catch(() => setServerConnected(false));
  };

  // Handler: Update Emoticon Config
  const handleUpdateEmoticonConfig = (
    emoticon: EmoticonType,
    updated: Partial<EmoticonConfig>
  ) => {
    setEmoticonConfigs((prev) => {
      const next = {
        ...prev,
        [emoticon]: {
          ...prev[emoticon],
          ...updated,
        },
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_EMOTICONS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Reset all settings
  const handleResetAllSettings = () => {
    const defaultConfig: SimulationConfig = {
      iterations: 50000,
      emoticonWeight: 1.0,
      historicalWeight: 1.0,
      popularityWeight: 0.25,
      randomVariance: 0.35,
      raceDistance: 100,
    };
    setSimulationConfig(defaultConfig);
    setEmoticonConfigs(EMOTICON_CONFIGS);
    localStorage.removeItem(LOCAL_STORAGE_CONFIG_KEY);
    localStorage.removeItem(LOCAL_STORAGE_EMOTICONS_KEY);
  };

  const allSelectedConchIds = lineup.map((p) => p.conchId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLiveSimulator={() => setIsLiveRaceOpen(true)}
        onApplyPreset={handleApplyPreset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TAB 1: RACE PREDICTOR */}
        {activeTab === 'predictor' && (
          <div className="space-y-6 animate-fade-in">
            {/* Active Race Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-xs">
              <div>
                <h2 className="text-lg font-black text-slate-100 tracking-tight flex items-center gap-2">
                  <span>Current Race Lineup (6 of 9 Conches)</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                    2x3 Arena Grid
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Select the 6 conches in the current round, pick their mood emoticon, and enter
                  popularity to calculate win probabilities from the shared historical database.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${serverConnected ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-300 bg-amber-500/10 border-amber-500/30'}`}>
                  {serverConnected ? '● SHARED DATABASE' : '● OFFLINE / LOCAL'}
                </span>
                <button
                  type="button"
                  onClick={handleRandomizeLineup}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                  title="Randomize 6 conches and emoticons"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Shuffle</span>
                </button>

                <button
                  type="button"
                  onClick={handleExecuteSimulation}
                  disabled={isSimulating}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-900/30 transition cursor-pointer"
                >
                  <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>{isSimulating ? 'Simulating...' : 'Recalculate'}</span>
                </button>
              </div>
            </div>

            {/* 2x3 Lineup Grid replicating the in-game display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lineup.map((participant, index) => (
                <LineupInputCard
                  key={index}
                  slotIndex={index}
                  participant={participant}
                  allSelectedIds={allSelectedConchIds}
                  databaseStats={databaseStats}
                  onChangeConch={handleChangeConch}
                  onChangeEmoticon={handleChangeEmoticon}
                  onChangePopularity={handleChangePopularity}
                  onChangeWins={handleChangeWins}
                />
              ))}
            </div>

            {/* Actual-result recorder is always visible, even when Monte Carlo fails. */}
            <QuickRaceSaveCard
              lineup={lineup}
              recordCount={records.length}
              serverConnected={serverConnected}
              onAddRecord={handleAddRecord}
            />

            {/* Monte Carlo Prediction Results Dashboard */}
            <PredictionDashboard
              simulationOutput={simulationOutput}
              isRunning={isSimulating}
              onRunSimulation={handleExecuteSimulation}
              onOpenLiveSimulator={() => setIsLiveRaceOpen(true)}
            />
          </div>
        )}

        {/* TAB 2: HISTORICAL DATABASE */}
        {activeTab === 'database' && (
          <div className="animate-fade-in">
            <DatabaseManager
              records={records}
              databaseStats={databaseStats}
              onAddRecord={handleAddRecord}
              onDeleteRecord={handleDeleteRecord}
              onClearDatabase={handleClearDatabase}
              onImportRecords={handleImportRecords}
              onSeedScreenshotData={handleSeedScreenshotData}
              currentLineup={lineup}
            />
          </div>
        )}

        {/* TAB 3: 9 CONCHES ROSTER */}
        {activeTab === 'roster' && (
          <div className="animate-fade-in">
            <ConchRosterView
              databaseStats={databaseStats}
              customConches={ALL_CONCHES}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-5 px-4 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-base">🐚</span>
            <span className="font-bold text-slate-200">Conch Race Prediction System</span>
            <span className="text-slate-500">• Monte Carlo 9-Conch Simulator</span>
          </div>
          <div className="text-slate-500 text-[11px]">
            Shared Cloudflare D1 database • Bayesian historical model • browser Monte Carlo up to 100k simulations
          </div>
        </div>
      </footer>

      {/* Interactive 2D/3D Live Race Simulator Modal */}
      <LiveRaceSimulator
        participants={lineup}
        config={simulationConfig}
        isOpen={isLiveRaceOpen}
        onClose={() => setIsLiveRaceOpen(false)}
        onRecordWinner={(winnerId, secondId, thirdId) => {
          // Record finished simulated race to history if user wants
          handleAddRecord({
            timestamp: Date.now(),
            raceNumber: records.length + 1,
            participants: lineup,
            winnerId,
            secondId,
            thirdId,
            notes: 'Live 2D Track Simulation sprint result',
          });
        }}
      />

      {/* Simulation Customization & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={simulationConfig}
        onChangeConfig={(newCfg) => {
          setSimulationConfig(newCfg);
          try {
            localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(newCfg));
          } catch {
            // ignore
          }
        }}
        emoticonConfigs={emoticonConfigs}
        onChangeEmoticonConfig={handleUpdateEmoticonConfig}
        onResetAllSettings={handleResetAllSettings}
      />
    </div>
  );
}
