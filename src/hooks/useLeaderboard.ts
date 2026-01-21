import { usePlayers } from './usePlayers';
import { useData } from '../context/DataContext';
import { calculatePlayerScore } from '../lib/utils';
import type { PlayerStats } from '../types';

export type RankingMode = '1v1' | '2v2' | 'global';

export function useLeaderboard(mode: RankingMode = '1v1') {
    const { players } = usePlayers();
    const { matches } = useData();

    const calculateStats = (playerMatches: any[], playerId: string): PlayerStats => {
        let wins = 0;
        let draws = 0;
        let losses = 0;
        let goalsScored = 0;
        let goalsConceded = 0;

        playerMatches.forEach(m => {
            const isTeam1 = m.players.team1.includes(playerId);
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

        return {
            matchesPlayed: playerMatches.length,
            wins,
            draws,
            losses,
            goalsScored,
            goalsConceded
        };
    };

    const getRankedPool = (allMatches: any[], filterMode: RankingMode, filterPeriod: 'all' | 'recent') => {
        let filteredMatches = [...allMatches];

        // Filter by Period
        if (filterPeriod === 'recent') {
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            filteredMatches = filteredMatches.filter(m => m.date >= thirtyDaysAgo);
        }

        // Filter by Mode
        if (filterMode === '1v1') {
            filteredMatches = filteredMatches.filter(m => m.players.team1.length === 1 && m.players.team2.length === 1);
        } else if (filterMode === '2v2') {
            filteredMatches = filteredMatches.filter(m => m.players.team1.length === 2 && m.players.team2.length === 2);
        }

        return players.map(p => {
            const myMatches = filteredMatches.filter(m =>
                m.players.team1.includes(p.id) || m.players.team2.includes(p.id)
            );
            const derivedStats = calculateStats(myMatches, p.id);
            return {
                ...p,
                derivedStats,
                score: calculatePlayerScore(derivedStats)
            };
        }).sort((a, b) => b.score - a.score);
    };

    const rankedPlayers = getRankedPool(matches, mode, 'all');
    const recentRankedPlayers = getRankedPool(matches, mode, 'recent');

    return { rankedPlayers, recentRankedPlayers };
}

