import { usePlayers } from './usePlayers';
import { useData } from '../context/DataContext';
import { calculatePlayerScore } from '../lib/utils';
import type { PlayerStats } from '../types';

export function useLeaderboard() {
    const { players } = usePlayers();
    const { matches } = useData();

    const playersWithStats = players.map(p => {
        const myMatches = matches.filter(m =>
            m.players.team1.includes(p.id) || m.players.team2.includes(p.id)
        );

        let wins = 0;
        let draws = 0;
        let losses = 0;
        let goalsScored = 0;
        let goalsConceded = 0;

        myMatches.forEach(m => {
            const isTeam1 = m.players.team1.includes(p.id);
            // const isTeam2 = m.players.team2.includes(p.id); // implied
            const myScore = isTeam1 ? m.score.team1 : m.score.team2;
            const oppScore = isTeam1 ? m.score.team2 : m.score.team1;

            goalsScored += myScore;
            goalsConceded += oppScore;

            if (m.endedBy === 'regular') {
                if (myScore > oppScore) wins++;
                else if (myScore < oppScore) losses++;
                else draws++;
            } else if (m.endedBy === 'penalties') {
                const amIWinner = (isTeam1 && m.penaltyWinner === 1) || (!isTeam1 && m.penaltyWinner === 2);
                if (amIWinner) wins++; else losses++;
            } else if (m.endedBy === 'forfeit') {
                const amILoser = (isTeam1 && m.forfeitLoser === 1) || (!isTeam1 && m.forfeitLoser === 2);
                if (amILoser) losses++; else wins++;
            }
        });

        const derivedStats: PlayerStats = {
            matchesPlayed: myMatches.length,
            wins,
            draws,
            losses,
            goalsScored,
            goalsConceded
        };

        return {
            ...p,
            derivedStats,
            score: calculatePlayerScore(derivedStats)
        };
    });

    const rankedPlayers = [...playersWithStats].sort((a, b) => b.score - a.score);

    return { rankedPlayers };
}
