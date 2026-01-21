import type { Match, Player } from '../types';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-win',
        name: 'Primer Paso',
        description: 'Gana tu primer partido.',
        icon: '🎯',
        color: 'from-blue-500 to-cyan-500',
        rarity: 'common'
    },
    {
        id: 'hat-trick',
        name: 'Hat-trick Hero',
        description: 'Anota 3 o más goles en un solo partido.',
        icon: '⚽',
        color: 'from-orange-500 to-red-500',
        rarity: 'rare'
    },
    {
        id: 'clean-sheet',
        name: 'Valla Invicta',
        description: 'Gana un partido sin recibir goles.',
        icon: '🛡️',
        color: 'from-green-500 to-emerald-500',
        rarity: 'rare'
    },
    {
        id: 'unbeatable',
        name: 'Imbatible',
        description: 'Gana 5 partidos seguidos.',
        icon: '🔥',
        color: 'from-purple-500 to-pink-500',
        rarity: 'epic'
    },
    {
        id: 'goal-machine',
        name: 'Máquina de Goles',
        description: 'Alcanza los 50 goles totales.',
        icon: '🤖',
        color: 'from-yellow-400 to-orange-500',
        rarity: 'epic'
    },
    {
        id: 'tournament-king',
        name: 'Rey de Copas',
        description: 'Gana un torneo oficial.',
        icon: '👑',
        color: 'from-yellow-500 to-amber-600',
        rarity: 'legendary'
    }
];

export function calculateUnlockedAchievements(player: Player, matches: Match[]): string[] {
    const unlocked: string[] = [];
    const playerMatches = matches.filter(m =>
        m.players.team1.includes(player.id) || m.players.team2.includes(player.id)
    ).sort((a, b) => a.date - b.date);

    if (player.derivedStats?.wins && player.derivedStats.wins > 0) unlocked.push('first-win');

    // Hat-trick: Check if any match had 3+ goals for this player
    const hadHatTrick = playerMatches.some(m => {
        const isT1 = m.players.team1.includes(player.id);
        const score = isT1 ? m.score.team1 : m.score.team2;
        return score >= 3;
    });
    if (hadHatTrick) unlocked.push('hat-trick');

    // Clean Sheet: Win with 0 goals against
    const hadCleanSheet = playerMatches.some(m => {
        const isT1 = m.players.team1.includes(player.id);
        const win = (isT1 && m.score.team1 > m.score.team2) || (!isT1 && m.score.team2 > m.score.team1);
        const goalsAgainst = isT1 ? m.score.team2 : m.score.team1;
        return win && goalsAgainst === 0;
    });
    if (hadCleanSheet) unlocked.push('clean-sheet');

    // Unbeatable: 5 wins in a row
    let streak = 0;
    let maxStreak = 0;
    playerMatches.forEach(m => {
        const isT1 = m.players.team1.includes(player.id);
        const win = (isT1 && m.score.team1 > m.score.team2) || (!isT1 && m.score.team2 > m.score.team1);
        if (win) streak++;
        else streak = 0;
        if (streak > maxStreak) maxStreak = streak;
    });
    if (maxStreak >= 5) unlocked.push('unbeatable');

    // Goal Machine: 50 total goals
    if (player.derivedStats?.goalsScored && player.derivedStats.goalsScored >= 50) unlocked.push('goal-machine');

    // Tournament King: Check tournament wins
    if (player.derivedStats && (player.derivedStats as any).tournamentsWon > 0) unlocked.push('tournament-king');

    return unlocked;
}
