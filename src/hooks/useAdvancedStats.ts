import { useData } from '../context/DataContext';
import type { Player } from '../types';

interface AdvancedStats {
    nemesis: { player: Player | null; losses: number };
    bestDuo: { partner: Player | null; wins: number };
    currentStreak: { type: 'win' | 'loss' | null; count: number };
    soloStats: { wins: number; losses: number; draws: number };
    teamStats: { wins: number; losses: number; draws: number };
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    totalGoalsScored: number;
    totalGoalsConceded: number;
}

export function useAdvancedStats(playerId: string) {
    const { matches, getPlayer } = useData();

    const calculateAdvancedStats = (): AdvancedStats => {
        const playerMatches = matches.filter(m =>
            m.players.team1.includes(playerId) || m.players.team2.includes(playerId)
        ).sort((a, b) => a.date - b.date);

        // Initialize stats
        const rivalStats = new Map<string, { wins: number; losses: number }>();
        const partnerStats = new Map<string, { wins: number; losses: number }>();
        let currentStreak: { type: 'win' | 'loss' | null; count: number } = { type: null, count: 0 };
        let soloStats = { wins: 0, losses: 0, draws: 0 };
        let teamStats = { wins: 0, losses: 0, draws: 0 };

        let matchesPlayed = 0;
        let wins = 0;
        let draws = 0;
        let losses = 0;
        let totalGoalsScored = 0;
        let totalGoalsConceded = 0;

        playerMatches.forEach(match => {
            const isTeam1 = match.players.team1.includes(playerId);
            const myTeam = isTeam1 ? match.players.team1 : match.players.team2;
            const opponentTeam = isTeam1 ? match.players.team2 : match.players.team1;
            const myScore = isTeam1 ? match.score.team1 : match.score.team2;
            const opponentScore = isTeam1 ? match.score.team2 : match.score.team1;

            matchesPlayed++;
            totalGoalsScored += myScore;
            totalGoalsConceded += opponentScore;

            // Determine result
            let result: 'win' | 'loss' | 'draw' = 'draw';
            if (match.endedBy === 'regular') {
                if (myScore > opponentScore) result = 'win';
                if (myScore < opponentScore) result = 'loss';
            } else if (match.endedBy === 'penalties') {
                const amIWinner = (isTeam1 && match.penaltyWinner === 1) || (!isTeam1 && match.penaltyWinner === 2);
                result = amIWinner ? 'win' : 'loss';
            } else if (match.endedBy === 'forfeit') {
                const amILoser = (isTeam1 && match.forfeitLoser === 1) || (!isTeam1 && match.forfeitLoser === 2);
                result = amILoser ? 'loss' : 'win';
            }

            if (result === 'win') wins++;
            if (result === 'draw') draws++;
            if (result === 'loss') losses++;

            // Solo vs Team stats
            const isSolo = myTeam.length === 1;
            if (isSolo) {
                if (result === 'win') soloStats.wins++;
                if (result === 'loss') soloStats.losses++;
                if (result === 'draw') soloStats.draws++;
            } else {
                if (result === 'win') teamStats.wins++;
                if (result === 'loss') teamStats.losses++;
                if (result === 'draw') teamStats.draws++;
            }

            // Track rivals (opponents)
            opponentTeam.forEach(opponentId => {
                if (!rivalStats.has(opponentId)) {
                    rivalStats.set(opponentId, { wins: 0, losses: 0 });
                }
                const stats = rivalStats.get(opponentId)!;
                if (result === 'win') stats.wins++;
                if (result === 'loss') stats.losses++;
            });

            // Track partners (teammates)
            myTeam.forEach(partnerId => {
                if (partnerId !== playerId) {
                    if (!partnerStats.has(partnerId)) {
                        partnerStats.set(partnerId, { wins: 0, losses: 0 });
                    }
                    const stats = partnerStats.get(partnerId)!;
                    if (result === 'win') stats.wins++;
                    if (result === 'loss') stats.losses++;
                }
            });

            // Update streak
            if (result !== 'draw') {
                if (currentStreak.type === result) {
                    currentStreak.count++;
                } else {
                    currentStreak = { type: result, count: 1 };
                }
            }
        });

        // Find nemesis (rival with most losses against)
        let nemesis: { player: Player | null; losses: number } = { player: null, losses: 0 };
        rivalStats.forEach((stats, rivalId) => {
            if (stats.losses > nemesis.losses) {
                nemesis = { player: getPlayer(rivalId) || null, losses: stats.losses };
            }
        });

        // Find best duo (partner with most wins)
        let bestDuo: { partner: Player | null; wins: number } = { partner: null, wins: 0 };
        partnerStats.forEach((stats, partnerId) => {
            if (stats.wins > bestDuo.wins) {
                bestDuo = { partner: getPlayer(partnerId) || null, wins: stats.wins };
            }
        });

        return {
            nemesis,
            bestDuo,
            currentStreak,
            soloStats,
            teamStats,
            matchesPlayed,
            wins,
            draws,
            losses,
            totalGoalsScored,
            totalGoalsConceded
        };
    };

    return calculateAdvancedStats();
}
