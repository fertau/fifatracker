import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import type { Match, Player } from '../types';

export interface RivalryStats {
    allTimeRecord: { a: number; b: number; draws: number };
    currentStreak: { holder: string; count: number };
    biggestWin: { match: Match; margin: number; winner: string } | null;
    mostDramatic: Match | null;
    recentForm: Match[];
    heatScore: number;
    commentary: string;
    totalMatches: number;
    playerA: Player | undefined;
    playerB: Player | undefined;
}

function getMatchResult(match: Match, playerId: string): 'win' | 'loss' | 'draw' {
    const isTeam1 = match.players.team1.includes(playerId);
    const myScore = isTeam1 ? match.score.team1 : match.score.team2;
    const opponentScore = isTeam1 ? match.score.team2 : match.score.team1;

    if (match.endedBy === 'regular') {
        if (myScore > opponentScore) return 'win';
        if (myScore < opponentScore) return 'loss';
        return 'draw';
    } else if (match.endedBy === 'penalties') {
        const amIWinner = (isTeam1 && match.penaltyWinner === 1) || (!isTeam1 && match.penaltyWinner === 2);
        return amIWinner ? 'win' : 'loss';
    } else if (match.endedBy === 'forfeit') {
        const amILoser = (isTeam1 && match.forfeitLoser === 1) || (!isTeam1 && match.forfeitLoser === 2);
        return amILoser ? 'loss' : 'win';
    }
    return 'draw';
}

export function useRivalry(playerAId: string, playerBId: string): RivalryStats {
    const { matches, getPlayer } = useData();

    return useMemo(() => {
        // Filter matches where A and B are on opposing teams
        const rivalryMatches = matches.filter(m => {
            const aInTeam1 = m.players.team1.includes(playerAId);
            const aInTeam2 = m.players.team2.includes(playerAId);
            const bInTeam1 = m.players.team1.includes(playerBId);
            const bInTeam2 = m.players.team2.includes(playerBId);
            return (aInTeam1 && bInTeam2) || (aInTeam2 && bInTeam1);
        }).sort((a, b) => a.date - b.date);

        const record = { a: 0, b: 0, draws: 0 };
        let streak = { holder: '', count: 0 };
        let biggestWin: { match: Match; margin: number; winner: string } | null = null;
        let mostDramatic: Match | null = null;
        let penaltyMatches = 0;
        const now = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        let matchesLast30Days = 0;

        rivalryMatches.forEach(match => {
            const resultForA = getMatchResult(match, playerAId);

            if (resultForA === 'win') record.a++;
            else if (resultForA === 'loss') record.b++;
            else record.draws++;

            // Recency
            if (now - match.date < thirtyDaysMs) matchesLast30Days++;

            // Penalties
            if (match.endedBy === 'penalties') penaltyMatches++;

            // Streak (from A's perspective)
            if (resultForA !== 'draw') {
                const winner = resultForA === 'win' ? playerAId : playerBId;
                if (streak.holder === winner) {
                    streak.count++;
                } else {
                    streak = { holder: winner, count: 1 };
                }
            }

            // Biggest win (goal margin)
            const margin = Math.abs(match.score.team1 - match.score.team2);
            if (margin > 0) {
                const winner = resultForA === 'win' ? playerAId : resultForA === 'loss' ? playerBId : '';
                if (winner && (!biggestWin || margin > biggestWin.margin)) {
                    biggestWin = { match, margin, winner };
                }
            }

            // Most dramatic: penalty > closest non-0-0 score
            if (match.endedBy === 'penalties') {
                if (!mostDramatic || mostDramatic.endedBy !== 'penalties' ||
                    Math.abs(match.score.team1 - match.score.team2) <
                    Math.abs(mostDramatic.score.team1 - mostDramatic.score.team2)) {
                    mostDramatic = match;
                }
            } else if (!mostDramatic || mostDramatic.endedBy !== 'penalties') {
                const scoreDiff = Math.abs(match.score.team1 - match.score.team2);
                const totalGoals = match.score.team1 + match.score.team2;
                if (totalGoals > 0 && scoreDiff <= 1) {
                    if (!mostDramatic ||
                        Math.abs(match.score.team1 - match.score.team2) <
                        Math.abs(mostDramatic.score.team1 - mostDramatic.score.team2)) {
                        mostDramatic = match;
                    }
                }
            }
        });

        const totalMatches = rivalryMatches.length;

        // Heat score (0-100)
        const raw =
            (totalMatches * 2) +
            (matchesLast30Days * 10) +
            (penaltyMatches * 15) +
            (100 - Math.abs(record.a - record.b) * 3) +
            (streak.count > 3 ? 20 : 0);
        const heatScore = Math.min(Math.max(raw, 0), 100);

        // Commentary (Spanish)
        const playerA = getPlayer(playerAId);
        const playerB = getPlayer(playerBId);
        const nameA = playerA?.name || 'Jugador A';
        const nameB = playerB?.name || 'Jugador B';
        const commentary = generateCommentary(nameA, nameB, record, streak, totalMatches, playerAId);

        // Recent form: last 5 matches
        const recentForm = rivalryMatches.slice(-5);

        return {
            allTimeRecord: record,
            currentStreak: streak,
            biggestWin,
            mostDramatic,
            recentForm,
            heatScore,
            commentary,
            totalMatches,
            playerA,
            playerB,
        };
    }, [matches.length, playerAId, playerBId, matches, getPlayer]);
}

function generateCommentary(
    nameA: string,
    nameB: string,
    record: { a: number; b: number; draws: number },
    streak: { holder: string; count: number },
    totalMatches: number,
    playerAId: string,
): string {
    if (totalMatches === 0) return `${nameA} vs ${nameB}: sin historial`;

    // 1. Hot streak
    if (streak.count >= 3) {
        const holderName = streak.holder === playerAId ? nameA : nameB;
        return `Racha caliente: ${holderName} ganó ${streak.count} seguidos`;
    }

    // 2. Dominant leader, but trailing player won recently
    const total = record.a + record.b + record.draws;
    const leaderWins = Math.max(record.a, record.b);
    const winRate = total > 0 ? leaderWins / total : 0;
    if (winRate > 0.6 && total >= 3) {
        const leader = record.a > record.b ? nameA : nameB;
        const trailer = record.a > record.b ? nameB : nameA;
        return `${leader} domina la serie ${record.a}-${record.b}, pero ${trailer} no se rinde`;
    }

    // 3. Close rivalry
    if (total > 0 && Math.abs(record.a - record.b) / total < 0.15) {
        return `Rivalidad pareja: ${nameA} ${record.a} - ${nameB} ${record.b} en ${totalMatches} partidos`;
    }

    // 4. Fallback
    return `${nameA} vs ${nameB}: la rivalidad más intensa del grupo`;
}

export function getRivalryKey(playerAId: string, playerBId: string): string {
    return [playerAId, playerBId].sort().join('_');
}
