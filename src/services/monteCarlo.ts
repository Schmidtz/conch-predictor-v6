import { ALL_CONCHES, EMOTICON_CONFIGS } from '../data/defaultConches';
import {
  Conch,
  ConchSimResult,
  ConchStats,
  EmoticonConfig,
  EmoticonType,
  ExactaTrifectaPrediction,
  RaceParticipantInput,
  SimulationConfig,
  SimulationOutput,
} from '../types';

function randomNormal(mean = 0, stdev = 1): number {
  const u1 = Math.max(1e-9, Math.random());
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdev + mean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothedRate(successes: number, trials: number, priorRate: number, priorWeight: number) {
  if (trials <= 0) return priorRate;
  return (successes + priorRate * priorWeight) / (trials + priorWeight);
}

/**
 * V2 hybrid predictor:
 * historical database -> Bayesian/recency features -> current lineup -> Monte Carlo.
 * The database therefore changes the distribution that Monte Carlo samples from,
 * rather than being consulted only after the simulation.
 */
export function runMonteCarloSimulation(
  participants: RaceParticipantInput[],
  databaseStats: Record<string, ConchStats>,
  emoticonConfigs: Record<EmoticonType, EmoticonConfig> = EMOTICON_CONFIGS,
  config: SimulationConfig = {
    iterations: 50000,
    emoticonWeight: 1.0,
    historicalWeight: 1.0,
    popularityWeight: 0.25,
    randomVariance: 0.35,
    raceDistance: 100,
  },
  customConches: Conch[] = ALL_CONCHES
): SimulationOutput {
  if (!participants || participants.length < 2) {
    return { iterations: 0, timestamp: Date.now(), results: [], exactas: [], trifectas: [], headToHeadMatrix: {} };
  }

  const conchMap = new Map(customConches.map((c) => [c.id, c]));
  const fieldSize = participants.length;
  const neutralWinRate = 1 / fieldSize;
  const totalHistoricalRaces = Object.values(databaseStats).reduce((sum, s) => sum + s.totalRaces, 0);

  const runners = participants.map((p, lane) => {
    const conch = conchMap.get(p.conchId) || {
      id: p.conchId, name: p.conchId, title: '', shellType: 'Standard Shell', themeColor: '#3b82f6',
      accentColor: '#fbbf24', primaryColor: 'from-blue-500 to-indigo-600', baseSpeed: 75,
      baseStamina: 75, initialWins: 230, description: '', avatarIcon: '🐚',
    };
    const stats = databaseStats[p.conchId];
    const emConfig = emoticonConfigs[p.emoticon] || EMOTICON_CONFIGS.nervous;

    // 1) Historical Bayesian skill. More races = less shrinkage toward the neutral prior.
    const observedWinRate = stats?.totalRaces
      ? smoothedRate(stats.totalWins, stats.totalRaces, neutralWinRate, 8)
      : neutralWinRate;
    const observedTop3Rate = stats?.totalRaces
      ? smoothedRate(stats.top3Count, stats.totalRaces, Math.min(3 / fieldSize, 0.5), 8)
      : Math.min(3 / fieldSize, 0.5);

    // 2) Recency: reward recent wins/podiums while keeping the effect modest.
    let recencyScore = 0;
    const recent = stats?.recentResults || [];
    recent.forEach((result, i) => {
      const weight = (i + 1) / Math.max(1, recent.length);
      recencyScore += result === '1st' ? 1.0 * weight : result === '2nd' ? 0.55 * weight : result === '3rd' ? 0.3 * weight : -0.25 * weight;
    });
    const recencyFactor = 1 + clamp(recencyScore / Math.max(1, recent.length), -0.12, 0.12);

    // 3) Current lineup strength / pairwise evidence.
    let h2hAdjustment = 0;
    if (stats) {
      for (const other of participants) {
        if (other.conchId === p.conchId) continue;
        const pair = stats.headToHead[other.conchId];
        if (pair && pair.races > 0) {
          const pairRate = smoothedRate(pair.wins, pair.races, 0.5, 4);
          h2hAdjustment += (pairRate - 0.5) * Math.min(0.08, 0.025 + pair.races * 0.002);
        }
      }
    }

    // 4) Emoticon effect is blended with observed emoticon performance when available.
    const emObserved = stats?.emoticonStats[p.emoticon];
    const emEmpiricalRate = emObserved && emObserved.races > 0
      ? smoothedRate(emObserved.wins, emObserved.races, observedWinRate, 5)
      : observedWinRate;
    const emRelative = clamp((emEmpiricalRate - observedWinRate) * 2.0, -0.10, 0.10);
    const emMechanical = (emConfig.speedMultiplier - 1) * 0.45 * config.emoticonWeight;

    // 5) Crowd popularity is an optional weak signal, never the main driver.
    const popularity = p.popularity ?? 0;
    const popularityFactor = popularity > 0
      ? 1 + clamp((popularity / 100 - neutralWinRate) * config.popularityWeight, -0.08, 0.08)
      : 1;

    // Convert the historical win-rate evidence into a relative skill multiplier.
    // Exponent prevents one small sample from dominating the prediction.
    const historicalRatio = clamp(observedWinRate / neutralWinRate, 0.45, 2.8);
    const historicalFactor = Math.pow(historicalRatio, 0.55 * config.historicalWeight);

    const winsPrior = p.currentWins ?? conch.initialWins;
    const baselineFactor = 0.94 + clamp((winsPrior - 220) / 3000, -0.04, 0.06);
    const skillMultiplier = clamp(
      historicalFactor * recencyFactor * (1 + h2hAdjustment) * (1 + emRelative + emMechanical) * popularityFactor * baselineFactor,
      0.65,
      1.65
    );

    const baseVelocity = (conch.baseSpeed / 10) * skillMultiplier;
    const variance = Math.max(0.02, emConfig.varianceFactor * config.randomVariance * (1 + (1 - observedTop3Rate) * 0.18));

    return {
      conchId: p.conchId,
      conch,
      emoticon: p.emoticon,
      popularity,
      baseVelocity,
      stamina: conch.baseStamina,
      variance,
      stats,
      lane,
      skillMultiplier,
    };
  });

  // Browser-safe cap. A server build can raise this to 1M without changing the model.
  const iterations = Math.max(5000, Math.min(1000000, Math.floor(config.iterations || 50000)));
  const winCounts: Record<string, number> = {};
  const top2Counts: Record<string, number> = {};
  const top3Counts: Record<string, number> = {};
  const rankSum: Record<string, number> = {};
  const exactaCounts: Record<string, number> = {};
  const trifectaCounts: Record<string, number> = {};
  const h2hWins: Record<string, Record<string, number>> = {};

  runners.forEach((r) => {
    winCounts[r.conchId] = 0;
    top2Counts[r.conchId] = 0;
    top3Counts[r.conchId] = 0;
    rankSum[r.conchId] = 0;
    h2hWins[r.conchId] = {};
    runners.forEach((other) => {
      if (other.conchId !== r.conchId) h2hWins[r.conchId][other.conchId] = 0;
    });
  });

  for (let iter = 0; iter < iterations; iter++) {
    const raceTimes = runners.map((r) => {
      let totalTime = 0;
      const sectors = 4;
      const sectorDistance = config.raceDistance / sectors;

      for (let sec = 0; sec < sectors; sec++) {
        const fatigue = sec === 3 ? 0.9 + (r.stamina / 100) * 0.2 : 1;
        const noise = randomNormal(0, r.variance);
        let surge = 1;
        const eventRoll = Math.random();
        if (r.emoticon === 'angry' && eventRoll < 0.20) surge = 1.22;
        else if (r.emoticon === 'distressed' && eventRoll < 0.18) surge = 0.78;
        else if (r.emoticon === 'cool' && eventRoll < 0.16) surge = 1.12;
        else if (r.emoticon === 'happy' && eventRoll < 0.12) surge = 1.08;

        const sectorSpeed = Math.max(1, (r.baseVelocity + noise) * fatigue * surge);
        totalTime += sectorDistance / sectorSpeed;
      }
      return { conchId: r.conchId, time: totalTime };
    }).sort((a, b) => a.time - b.time);

    raceTimes.forEach((res, rankIdx) => {
      const id = res.conchId;
      rankSum[id] += rankIdx + 1;
      if (rankIdx === 0) winCounts[id]++;
      if (rankIdx < 2) top2Counts[id]++;
      if (rankIdx < 3) top3Counts[id]++;
    });

    for (let i = 0; i < raceTimes.length; i++) {
      for (let j = i + 1; j < raceTimes.length; j++) h2hWins[raceTimes[i].conchId][raceTimes[j].conchId]++;
    }

    if (raceTimes.length >= 2) {
      const key = `${raceTimes[0].conchId}_${raceTimes[1].conchId}`;
      exactaCounts[key] = (exactaCounts[key] || 0) + 1;
    }
    if (raceTimes.length >= 3) {
      const key = `${raceTimes[0].conchId}_${raceTimes[1].conchId}_${raceTimes[2].conchId}`;
      trifectaCounts[key] = (trifectaCounts[key] || 0) + 1;
    }
  }

  const results: ConchSimResult[] = runners.map((r) => {
    const winProb = (winCounts[r.conchId] / iterations) * 100;
    const top2Prob = (top2Counts[r.conchId] / iterations) * 100;
    const top3Prob = (top3Counts[r.conchId] / iterations) * 100;
    const avgRank = rankSum[r.conchId] / iterations;
    const evScore = r.popularity > 0 ? winProb - r.popularity : 0;

    let recommendationTier: ConchSimResult['recommendationTier'] = 'strong_contender';
    let recommendationReason = `Model combines historical evidence, current lineup strength, morale and race variance.`;
    if (winProb >= 30) {
      recommendationTier = 'top_pick';
      recommendationReason = `Highest simulated win probability (${winProb.toFixed(1)}%) after conditioning on the historical database and current lineup.`;
    } else if (evScore > 6 && winProb >= 12) {
      recommendationTier = 'value_bet';
      recommendationReason = `Positive model-vs-crowd edge of ${evScore.toFixed(1)} percentage points.`;
    } else if (winProb >= 20 || top3Prob >= 55) {
      recommendationTier = 'strong_contender';
      recommendationReason = `Strong podium profile with ${top3Prob.toFixed(1)}% simulated Top-3 probability.`;
    } else if (r.emoticon === 'angry' && winProb > 10) {
      recommendationTier = 'dark_horse';
      recommendationReason = `Higher-variance runner with upset potential; treat the probability as less certain.`;
    } else if (winProb < 7) {
      recommendationTier = 'avoid';
      recommendationReason = `Low simulated win probability relative to this field.`;
    }

    return {
      conchId: r.conchId,
      conch: r.conch,
      emoticon: r.emoticon,
      popularity: r.popularity,
      winCount: winCounts[r.conchId],
      winProbability: Number(winProb.toFixed(2)),
      top2Probability: Number(top2Prob.toFixed(2)),
      top3Probability: Number(top3Prob.toFixed(2)),
      avgRank: Number(avgRank.toFixed(2)),
      expectedValueScore: Number(evScore.toFixed(2)),
      recommendationTier,
      recommendationReason,
    };
  }).sort((a, b) => b.winProbability - a.winProbability);

  const exactas = Object.entries(exactaCounts)
    .map(([key, count]) => ({ combination: key.split('_'), probability: Number(((count / iterations) * 100).toFixed(2)) }))
    .sort((a, b) => b.probability - a.probability).slice(0, 5);
  const trifectas = Object.entries(trifectaCounts)
    .map(([key, count]) => ({ combination: key.split('_'), probability: Number(((count / iterations) * 100).toFixed(2)) }))
    .sort((a, b) => b.probability - a.probability).slice(0, 5);

  const headToHeadMatrix: Record<string, Record<string, number>> = {};
  runners.forEach((r) => {
    headToHeadMatrix[r.conchId] = {};
    runners.forEach((other) => {
      if (other.conchId !== r.conchId) {
        headToHeadMatrix[r.conchId][other.conchId] = Number(((h2hWins[r.conchId][other.conchId] / iterations) * 100).toFixed(1));
      }
    });
  });

  return {
    iterations,
    timestamp: Date.now(),
    modelVersion: 'Hybrid DB → Bayesian features → Monte Carlo v2',
    dataDriven: totalHistoricalRaces > 0,
    historicalRacesUsed: totalHistoricalRaces,
    modelNotes: [
      'Historical win/top-3 rates are Bayesian-smoothed toward the field-size prior.',
      'Recent finishes and actual pairwise head-to-head results influence the current race distribution.',
      'Current lineup is applied before Monte Carlo; the database is not consulted only after simulation.',
      'Popularity is intentionally a weak crowd signal, not the primary predictor.',
    ],
    results,
    exactas,
    trifectas,
    headToHeadMatrix,
  };
}
