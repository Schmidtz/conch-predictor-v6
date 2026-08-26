import React, { useState, useEffect, useRef } from 'react';
import { Conch, EmoticonType, RaceParticipantInput, SimulationConfig } from '../types';
import { ALL_CONCHES, EMOTICON_CONFIGS } from '../data/defaultConches';
import { ConchAvatar } from './ConchAvatar';
import { Play, Pause, RotateCcw, Zap, Trophy, Flag, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveRaceSimulatorProps {
  participants: RaceParticipantInput[];
  config: SimulationConfig;
  isOpen: boolean;
  onClose: () => void;
  onRecordWinner?: (winnerId: string, secondId?: string, thirdId?: string) => void;
}

interface RunnerState {
  conchId: string;
  conch: Conch;
  emoticon: EmoticonType;
  position: number; // 0 to 100%
  currentSpeed: number;
  burstActive: boolean;
  stumbleActive: boolean;
  finishTime: number | null;
  rank: number | null;
}

export const LiveRaceSimulator: React.FC<LiveRaceSimulatorProps> = ({
  participants,
  config,
  isOpen,
  onClose,
  onRecordWinner,
}) => {
  const [runners, setRunners] = useState<RunnerState[]>([]);
  const [raceState, setRaceState] = useState<'ready' | 'running' | 'finished'>('ready');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [podium, setPodium] = useState<RunnerState[]>([]);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Initialize runners from participants
  const initRunners = () => {
    const initialRunners: RunnerState[] = participants.map((p) => {
      const conch =
        ALL_CONCHES.find((c) => c.id === p.conchId) || ALL_CONCHES[0];
      return {
        conchId: p.conchId,
        conch,
        emoticon: p.emoticon,
        position: 0,
        currentSpeed: conch.baseSpeed / 12,
        burstActive: false,
        stumbleActive: false,
        finishTime: null,
        rank: null,
      };
    });
    setRunners(initialRunners);
    setRaceState('ready');
    setElapsedSeconds(0);
    setPodium([]);
  };

  useEffect(() => {
    if (isOpen) {
      initRunners();
    }
  }, [isOpen, participants]);

  // Animation Loop
  const updateRace = (timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    const delta = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    setElapsedSeconds((prev) => prev + delta * playbackSpeed);

    setRunners((prevRunners) => {
      const nextRunners = [...prevRunners];
      let finishedCount = 0;

      nextRunners.forEach((runner) => {
        if (runner.finishTime !== null) {
          finishedCount++;
          return;
        }

        const emConfig = EMOTICON_CONFIGS[runner.emoticon];
        let speed = (runner.conch.baseSpeed / 8) * emConfig.speedMultiplier;

        // Random jitter
        const noise = (Math.random() - 0.5) * emConfig.varianceFactor * 2;
        speed += noise;

        // Random burst / stumble chance
        let burst = false;
        let stumble = false;
        const roll = Math.random();

        if (runner.emoticon === 'angry' && roll < 0.04) {
          speed *= 1.8;
          burst = true;
        } else if (runner.emoticon === 'distressed' && roll < 0.04) {
          speed *= 0.3;
          stumble = true;
        } else if (runner.emoticon === 'cool' && roll < 0.03) {
          speed *= 1.4;
          burst = true;
        }

        runner.burstActive = burst;
        runner.stumbleActive = stumble;
        runner.currentSpeed = Math.max(1, speed);

        // Advance position (scale to 100m track)
        const advance = (runner.currentSpeed * delta * playbackSpeed * 10);
        runner.position = Math.min(100, runner.position + advance);

        if (runner.position >= 100) {
          runner.finishTime = Date.now();
        }
      });

      // Assign ranks to finished runners
      const finished = nextRunners
        .filter((r) => r.finishTime !== null)
        .sort((a, b) => (a.finishTime ?? 0) - (b.finishTime ?? 0));

      finished.forEach((r, idx) => {
        r.rank = idx + 1;
      });

      if (finished.length === nextRunners.length && raceState === 'running') {
        setRaceState('finished');
        setPodium(finished);

        // Fire victory confetti!
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }

        if (onRecordWinner && finished[0]) {
          onRecordWinner(
            finished[0].conchId,
            finished[1]?.conchId,
            finished[2]?.conchId
          );
        }
      }

      return nextRunners;
    });

    if (raceState === 'running') {
      requestRef.current = requestAnimationFrame(updateRace);
    }
  };

  useEffect(() => {
    if (raceState === 'running') {
      lastTimeRef.current = null;
      requestRef.current = requestAnimationFrame(updateRace);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [raceState, playbackSpeed]);

  if (!isOpen) return null;

  const currentLeaderboard = [...runners].sort((a, b) => b.position - a.position);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        id="live-race-modal"
        className="relative w-full max-w-5xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-200"
      >
        {/* Header Bar */}
        <div className="bg-slate-950 px-6 py-3.5 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-wide flex items-center gap-2">
                <span>CONCH RACE ARENA</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                  LIVE 2D TRACK
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                100m Sand Track Simulation • Real-time Physics & Emoticon Boosts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="bg-slate-950/60 px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {raceState === 'ready' && (
              <button
                id="btn-start-race"
                type="button"
                onClick={() => setRaceState('running')}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl shadow-md shadow-blue-900/30 cursor-pointer transition transform hover:scale-102"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START RACE!</span>
              </button>
            )}

            {raceState === 'running' && (
              <button
                id="btn-pause-race"
                type="button"
                onClick={() => setRaceState('ready')}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl shadow-md cursor-pointer transition"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}

            {raceState === 'finished' && (
              <button
                id="btn-restart-race"
                type="button"
                onClick={initRunners}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-900/30 cursor-pointer transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Race Again</span>
              </button>
            )}

            <button
              type="button"
              onClick={initRunners}
              className="p-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700 cursor-pointer"
              title="Reset Track"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 px-2">Speed:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <div className="text-xs font-black text-blue-300 bg-blue-500/20 px-3 py-1.5 rounded-xl border border-blue-500/30">
            ⏱️ {elapsedSeconds.toFixed(1)}s
          </div>
        </div>

        {/* The Sand Race Track Canvas Container */}
        <div className="relative p-6 overflow-y-auto flex-1 space-y-4">
          {/* Sandy Track Surface */}
          <div className="relative bg-slate-950 rounded-2xl border-2 border-slate-800 p-4 shadow-inner overflow-hidden">
            {/* Subtle Grid / Track Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

            {/* Distance Markers at Top */}
            <div className="relative flex justify-between text-[11px] font-black text-slate-500 pb-2 border-b-2 border-dashed border-slate-800 mb-2 pl-36 pr-14">
              <span>START (0m)</span>
              <span>25m</span>
              <span>50m (Midway)</span>
              <span>75m</span>
              <span className="text-rose-400">🏁 FINISH (100m)</span>
            </div>

            {/* 6 Race Lanes */}
            <div className="space-y-3 relative">
              {runners.map((r, index) => {
                const emConfig = EMOTICON_CONFIGS[r.emoticon];
                const isWinner = r.rank === 1;

                return (
                  <div
                    key={r.conchId}
                    id={`track-lane-${index}`}
                    className="relative flex items-center h-16 bg-slate-900/90 rounded-xl border border-slate-800 px-2"
                  >
                    {/* Lane Label & Conch Info */}
                    <div className="w-32 flex-shrink-0 flex items-center gap-2 border-r border-slate-800 pr-2">
                      <span className="w-5 h-5 rounded-md bg-blue-600/30 text-blue-300 border border-blue-500/30 font-black text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {r.conch.name.split(',')[0]}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span>{emConfig.emoji}</span>
                          <span>{emConfig.name.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Lane Track Distance Area */}
                    <div className="relative flex-1 h-full flex items-center mx-2">
                      {/* Checkered Finish Line Line */}
                      <div className="absolute right-8 top-0 bottom-0 w-2.5 bg-[repeating-linear-gradient(45deg,#0f172a,#0f172a_4px,#38bdf8_4px,#38bdf8_8px)] opacity-50 rounded" />

                      {/* Moving Conch Racer */}
                      <div
                        className="absolute flex items-center gap-1 transition-all duration-100"
                        style={{
                          left: `calc(${r.position}% * 0.85)`,
                          transform: 'translateY(-2px)',
                        }}
                      >
                        {/* Speed Dust / Sparks */}
                        {r.burstActive && (
                          <div className="absolute -left-6 flex items-center text-blue-400 animate-pulse">
                            <Zap className="w-5 h-5 fill-blue-400" />
                          </div>
                        )}

                        {/* Conch Avatar with Emoticon */}
                        <div className="relative">
                          <ConchAvatar
                            conch={r.conch}
                            emoticon={r.emoticon}
                            size="md"
                            showEmoticonBadge={true}
                            isAnimated={raceState === 'running'}
                          />
                        </div>

                        {/* Finish Rank Badge */}
                        {r.rank && (
                          <span
                            className={`px-2 py-0.5 rounded-full font-black text-xs shadow-md border-2 border-slate-900 ${
                              r.rank === 1
                                ? 'bg-amber-400 text-amber-950 animate-bounce'
                                : r.rank === 2
                                ? 'bg-slate-300 text-slate-900'
                                : r.rank === 3
                                ? 'bg-amber-700 text-white'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            #{r.rank}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Position Leaderboard */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-blue-400" />
              <span>Live Race Leaderboard</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {currentLeaderboard.map((r, rankIdx) => (
                <div
                  key={r.conchId}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    rankIdx === 0
                      ? 'bg-blue-600/20 border-blue-500/40 shadow-xs'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-[10px] font-black text-slate-400 block">
                    POS #{rankIdx + 1}
                  </span>
                  <div className="font-bold text-xs text-slate-200 truncate mt-0.5">
                    {r.conch.name.split(',')[0]}
                  </div>
                  <div className="text-xs font-black text-blue-400 mt-0.5">
                    {r.position.toFixed(0)}m / 100m
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Finished Podium Overlay Announcement */}
          {raceState === 'finished' && podium.length > 0 && (
            <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-900/60 p-5 rounded-2xl text-slate-100 shadow-lg border border-blue-500/40 flex flex-col md:flex-row items-center justify-between gap-4 animate-scale-up">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl shadow-md text-amber-400">
                  <Trophy className="w-8 h-8 fill-amber-400" />
                </div>
                <div>
                  <span className="text-xs font-black tracking-widest uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                    RACE WINNER
                  </span>
                  <h3 className="text-2xl font-black mt-1 text-white">
                    🎉 {podium[0].conch.name} Triumphs!
                  </h3>
                  <p className="text-xs font-bold text-slate-300">
                    2nd: {podium[1]?.conch.name} • 3rd: {podium[2]?.conch.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={initRunners}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-900/40 transition cursor-pointer"
                >
                  Run Another Sim
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
