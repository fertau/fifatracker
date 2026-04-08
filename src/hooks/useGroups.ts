import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import type { PlayerGroup } from '../types';

export interface GroupRankedPlayer {
    id: string;
    name: string;
    avatar: string;
    wins: number;
    losses: number;
    draws: number;
    matchesPlayed: number;
    goalsScored: number;
    goalsConceded: number;
    score: number;
}

export function useGroups(playerId: string) {
    const { groups, addGroup, updateGroup, deleteGroup } = useData();

    const myGroups = useMemo(() => {
        return groups.filter(g => g.members.includes(playerId));
    }, [groups, playerId]);

    return {
        groups: myGroups,
        allGroups: groups,
        createGroup: async (name: string, members: string[]) => {
            return addGroup(name, members, playerId);
        },
        updateGroup,
        deleteGroup,
        leaveGroup: async (groupId: string) => {
            const group = groups.find(g => g.id === groupId);
            if (!group) return;
            await updateGroup(groupId, {
                members: group.members.filter(id => id !== playerId)
            });
        },
    };
}

/**
 * Compute group-scoped rankings: only matches where ALL participants are group members.
 */
export function useGroupRankings(group: PlayerGroup | undefined) {
    const { matches, players } = useData();

    return useMemo(() => {
        if (!group) return [];
        const memberSet = new Set(group.members);

        // Filter matches where every player is a group member
        const groupMatches = matches.filter(m => {
            const allPlayers = [...m.players.team1, ...m.players.team2];
            return allPlayers.every(pid => memberSet.has(pid));
        });

        // Compute stats per member
        const statsMap = new Map<string, {
            wins: number; losses: number; draws: number;
            matchesPlayed: number; goalsScored: number; goalsConceded: number;
        }>();

        group.members.forEach(id => {
            statsMap.set(id, { wins: 0, losses: 0, draws: 0, matchesPlayed: 0, goalsScored: 0, goalsConceded: 0 });
        });

        groupMatches.forEach(match => {
            const allPlayers = [...match.players.team1, ...match.players.team2];
            allPlayers.forEach(pid => {
                const s = statsMap.get(pid);
                if (!s) return;

                const isTeam1 = match.players.team1.includes(pid);
                const myScore = isTeam1 ? match.score.team1 : match.score.team2;
                const oppScore = isTeam1 ? match.score.team2 : match.score.team1;

                s.matchesPlayed++;
                s.goalsScored += myScore;
                s.goalsConceded += oppScore;

                let result: 'win' | 'loss' | 'draw' = 'draw';
                if (match.endedBy === 'regular') {
                    if (myScore > oppScore) result = 'win';
                    else if (myScore < oppScore) result = 'loss';
                } else if (match.endedBy === 'penalties') {
                    const iWin = (isTeam1 && match.penaltyWinner === 1) || (!isTeam1 && match.penaltyWinner === 2);
                    result = iWin ? 'win' : 'loss';
                } else if (match.endedBy === 'forfeit') {
                    const iLose = (isTeam1 && match.forfeitLoser === 1) || (!isTeam1 && match.forfeitLoser === 2);
                    result = iLose ? 'loss' : 'win';
                }

                if (result === 'win') s.wins++;
                else if (result === 'loss') s.losses++;
                else s.draws++;
            });
        });

        // Build ranked list
        const ranked: GroupRankedPlayer[] = group.members.map(id => {
            const player = players.find(p => p.id === id);
            const s = statsMap.get(id)!;
            const gd = s.goalsScored - s.goalsConceded;
            const score = (s.wins * 300) + (s.draws * 100) + (gd * 10) + (s.matchesPlayed * 5);
            return {
                id,
                name: player?.name || 'Jugador',
                avatar: player?.avatar || '👤',
                ...s,
                score,
            };
        }).sort((a, b) => b.score - a.score);

        return ranked;
    }, [matches.length, matches, group, players]);
}
