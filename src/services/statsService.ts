import { ALL_CONCHES } from '../data/defaultConches';
import { ConchStats, EmoticonType, RaceRecord } from '../types';

/**
 * Builds historical features used by the prediction engine.
 * H2H is calculated from the actual finishing order, not only from winners.
 */
export function calculateConchStats(
  records: RaceRecord[],
  initialConchList = ALL_CONCHES
): Record<string, ConchStats> {
  const statsMap: Record<string, ConchStats> = {};

  for (const conch of initialConchList) {
    statsMap[conch.id] = {
      conchId: conch.id,
      totalRaces: 0,
      totalWins: 0,
      winRate: 0,
      top3Count: 0,
      emoticonStats: {
        cool: { races: 0, wins: 0, winRate: 0 },
        happy: { races: 0, wins: 0, winRate: 0 },
        nervous: { races: 0, wins: 0, winRate: 0 },
        distressed: { races: 0, wins: 0, winRate: 0 },
        angry: { races: 0, wins: 0, winRate: 0 },
      },
      headToHead: {},
      recentResults: [],
    };
  }

  const sortedRecords = [...(records || [])].sort((a, b) => a.timestamp - b.timestamp);

  for (const record of sortedRecords) {
    // Build the known finishing order. Unreported places are left after 3rd.
    const order = [record.winnerId, record.secondId, record.thirdId].filter(
      (id): id is string => Boolean(id)
    );
    const uniqueOrder = [...new Set(order)];
    const participantIds = record.participants.map((p) => p.conchId);

    for (const p of record.participants) {
      const stat = statsMap[p.conchId];
      if (!stat) continue;

      stat.totalRaces += 1;
      const rank = uniqueOrder.indexOf(p.conchId);
      const isWinner = rank === 0;
      const isTop3 = rank >= 0 && rank < 3;

      if (isWinner) {
        stat.totalWins += 1;
        stat.top3Count += 1;
        stat.recentResults.push('1st');
      } else if (rank === 1) {
        stat.top3Count += 1;
        stat.recentResults.push('2nd');
      } else if (rank === 2) {
        stat.top3Count += 1;
        stat.recentResults.push('3rd');
      } else {
        stat.recentResults.push('loss');
      }

      const em = p.emoticon;
      if (em && stat.emoticonStats[em]) {
        stat.emoticonStats[em].races += 1;
        if (isWinner) stat.emoticonStats[em].wins += 1;
      }

      // Pairwise result: if both runners have a known rank, record who finished ahead.
      for (const otherId of participantIds) {
        if (otherId === p.conchId) continue;
        if (!stat.headToHead[otherId]) stat.headToHead[otherId] = { races: 0, wins: 0 };

        const otherRank = uniqueOrder.indexOf(otherId);
        if (rank >= 0 && otherRank >= 0) {
          stat.headToHead[otherId].races += 1;
          if (rank < otherRank) stat.headToHead[otherId].wins += 1;
        }
      }
    }
  }

  for (const id of Object.keys(statsMap)) {
    const s = statsMap[id];
    s.winRate = s.totalRaces > 0 ? (s.totalWins / s.totalRaces) * 100 : 0;
    if (s.recentResults.length > 12) s.recentResults = s.recentResults.slice(-12);

    (Object.keys(s.emoticonStats) as EmoticonType[]).forEach((em) => {
      const emStat = s.emoticonStats[em];
      emStat.winRate = emStat.races > 0 ? (emStat.wins / emStat.races) * 100 : 0;
    });
  }

  return statsMap;
}
