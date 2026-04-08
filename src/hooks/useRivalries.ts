import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useRivalry, getRivalryKey, type RivalryStats } from './useRivalry';

export interface DetectedRivalry {
    playerAId: string;
    playerBId: string;
    key: string;
    stats: RivalryStats;
    isPinned: boolean;
}

/**
 * Auto-detects rivalries for a player, sorted by heat score.
 * Merges with pinned rivalries (pinned always show, even if low heat).
 */
export function useRivalries(playerId: string): {
    rivalries: DetectedRivalry[];
    pinnedRivalries: DetectedRivalry[];
    detectedRivalries: DetectedRivalry[];
    togglePin: (opponentId: string) => Promise<void>;
    isPinned: (opponentId: string) => boolean;
} {
    const { matches, getPlayer, updatePlayer } = useData();

    // Find all opponents this player has faced
    const opponentIds = useMemo(() => {
        const opponents = new Set<string>();
        matches.forEach(m => {
            const inTeam1 = m.players.team1.includes(playerId);
            const inTeam2 = m.players.team2.includes(playerId);
            if (inTeam1) {
                m.players.team2.forEach(id => opponents.add(id));
            } else if (inTeam2) {
                m.players.team1.forEach(id => opponents.add(id));
            }
        });
        return Array.from(opponents);
    }, [matches.length, playerId, matches]);

    // Get current player's pinned rivalries
    const player = getPlayer(playerId);
    const pinnedKeys = useMemo(() => new Set(player?.pinnedRivalries || []), [player?.pinnedRivalries]);

    // Compute rivalry stats for each opponent
    // Note: We can't call useRivalry in a loop (hooks rules), so we compute inline
    const allRivalries = useMemo(() => {
        return opponentIds.map(opponentId => {
            const [a, b] = [playerId, opponentId].sort();
            const key = getRivalryKey(a, b);
            return {
                playerAId: a,
                playerBId: b,
                key,
                opponentId,
                isPinned: pinnedKeys.has(key),
            };
        });
    }, [opponentIds, playerId, pinnedKeys]);

    // Since we can't use hooks in loops, compute stats directly
    const rivalriesWithStats = useMemo(() => {
        return allRivalries.map(({ playerAId, playerBId, key, opponentId, isPinned }) => {
            // Inline computation matching useRivalry logic
            const rivalryMatches = matches.filter(m => {
                const aInTeam1 = m.players.team1.includes(playerAId);
                const aInTeam2 = m.players.team2.includes(playerAId);
                const bInTeam1 = m.players.team1.includes(playerBId);
                const bInTeam2 = m.players.team2.includes(playerBId);
                return (aInTeam1 && bInTeam2) || (aInTeam2 && bInTeam1);
            }).sort((a, b) => a.date - b.date);

            const totalMatches = rivalryMatches.length;
            if (totalMatches === 0) return null;

            const record = { a: 0, b: 0, draws: 0 };
            let penaltyMatches = 0;
            const now = Date.now();
            const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
            let matchesLast30Days = 0;
            let streak = { holder: '', count: 0 };

            rivalryMatches.forEach(match => {
                const isTeam1ForA = match.players.team1.includes(playerAId);
                const scoreA = isTeam1ForA ? match.score.team1 : match.score.team2;
                const scoreB = isTeam1ForA ? match.score.team2 : match.score.team1;

                let result: 'win' | 'loss' | 'draw' = 'draw';
                if (match.endedBy === 'regular') {
                    if (scoreA > scoreB) result = 'win';
                    else if (scoreA < scoreB) result = 'loss';
                } else if (match.endedBy === 'penalties') {
                    const aWins = (isTeam1ForA && match.penaltyWinner === 1) || (!isTeam1ForA && match.penaltyWinner === 2);
                    result = aWins ? 'win' : 'loss';
                } else if (match.endedBy === 'forfeit') {
                    const aLoses = (isTeam1ForA && match.forfeitLoser === 1) || (!isTeam1ForA && match.forfeitLoser === 2);
                    result = aLoses ? 'loss' : 'win';
                }

                if (result === 'win') record.a++;
                else if (result === 'loss') record.b++;
                else record.draws++;

                if (now - match.date < thirtyDaysMs) matchesLast30Days++;
                if (match.endedBy === 'penalties') penaltyMatches++;

                if (result !== 'draw') {
                    const winner = result === 'win' ? playerAId : playerBId;
                    if (streak.holder === winner) streak.count++;
                    else streak = { holder: winner, count: 1 };
                }
            });

            const raw =
                (totalMatches * 2) +
                (matchesLast30Days * 10) +
                (penaltyMatches * 15) +
                (100 - Math.abs(record.a - record.b) * 3) +
                (streak.count > 3 ? 20 : 0);
            const heatScore = Math.min(Math.max(raw, 0), 100);

            const pA = getPlayer(playerAId);
            const pB = getPlayer(playerBId);
            const nameA = pA?.name || 'Jugador A';
            const nameB = pB?.name || 'Jugador B';

            // Commentary
            let commentary = `${nameA} vs ${nameB}: la rivalidad más intensa del grupo`;
            if (totalMatches === 0) {
                commentary = `${nameA} vs ${nameB}: sin historial`;
            } else if (streak.count >= 3) {
                const holderName = streak.holder === playerAId ? nameA : nameB;
                commentary = `Racha caliente: ${holderName} ganó ${streak.count} seguidos`;
            } else {
                const total = record.a + record.b + record.draws;
                const leaderWins = Math.max(record.a, record.b);
                const winRate = total > 0 ? leaderWins / total : 0;
                if (winRate > 0.6 && total >= 3) {
                    const leader = record.a > record.b ? nameA : nameB;
                    const trailer = record.a > record.b ? nameB : nameA;
                    commentary = `${leader} domina la serie ${record.a}-${record.b}, pero ${trailer} no se rinde`;
                } else if (total > 0 && Math.abs(record.a - record.b) / total < 0.15) {
                    commentary = `Rivalidad pareja: ${nameA} ${record.a} - ${nameB} ${record.b} en ${totalMatches} partidos`;
                }
            }

            return {
                playerAId,
                playerBId,
                key,
                isPinned,
                stats: {
                    allTimeRecord: record,
                    currentStreak: streak,
                    biggestWin: null,
                    mostDramatic: null,
                    recentForm: rivalryMatches.slice(-5),
                    heatScore,
                    commentary,
                    totalMatches,
                    playerA: pA,
                    playerB: pB,
                } as RivalryStats,
            };
        }).filter((r): r is DetectedRivalry => r !== null);
    }, [matches.length, matches, allRivalries, getPlayer, playerId]);

    // Sort by heat, separate pinned vs detected
    const sorted = useMemo(() => {
        const all = [...rivalriesWithStats].sort((a, b) => b.stats.heatScore - a.stats.heatScore);
        const pinned = all.filter(r => r.isPinned);
        const detected = all.filter(r => !r.isPinned).slice(0, 5);
        return { all: [...pinned, ...detected.filter(d => !pinned.some(p => p.key === d.key))], pinned, detected };
    }, [rivalriesWithStats]);

    const togglePin = async (opponentId: string) => {
        const key = getRivalryKey(playerId, opponentId);
        const current = player?.pinnedRivalries || [];
        const updated = current.includes(key)
            ? current.filter(k => k !== key)
            : [...current, key];
        await updatePlayer(playerId, { pinnedRivalries: updated });
    };

    const isPinned = (opponentId: string) => {
        const key = getRivalryKey(playerId, opponentId);
        return pinnedKeys.has(key);
    };

    return {
        rivalries: sorted.all,
        pinnedRivalries: sorted.pinned,
        detectedRivalries: sorted.detected,
        togglePin,
        isPinned,
    };
}
