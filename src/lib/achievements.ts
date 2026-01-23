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
    // Common Achievements (Primeros Pasos)
    {
        id: 'first-win',
        name: 'Primer Paso',
        description: 'Gana tu primer partido.',
        icon: '🎯',
        color: 'from-blue-500 to-cyan-500',
        rarity: 'common'
    },
    {
        id: 'first-match',
        name: 'Debutante',
        description: 'Juega tu primer partido.',
        icon: '⚽',
        color: 'from-gray-500 to-gray-600',
        rarity: 'common'
    },
    {
        id: 'social-player',
        name: 'Social',
        description: 'Juega con 5 jugadores diferentes.',
        icon: '👥',
        color: 'from-blue-400 to-indigo-500',
        rarity: 'common'
    },
    {
        id: 'veteran',
        name: 'Veterano',
        description: 'Juega 50 partidos.',
        icon: '🎮',
        color: 'from-green-500 to-teal-500',
        rarity: 'common'
    },

    // Rare Achievements (Rendimiento)
    {
        id: 'hat-trick',
        name: 'Hat-trick Hero',
        description: 'Anota 3 o más goles en un solo partido.',
        icon: '🔥',
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
        id: 'comeback-king',
        name: 'Comeback King',
        description: 'Gana después de 3 derrotas seguidas.',
        icon: '⚡',
        color: 'from-yellow-500 to-orange-500',
        rarity: 'rare'
    },
    {
        id: 'precision',
        name: 'Precisión Letal',
        description: 'Gana 5 partidos por 3+ goles de diferencia.',
        icon: '🎯',
        color: 'from-red-500 to-pink-500',
        rarity: 'rare'
    },
    {
        id: 'wall',
        name: 'Muralla',
        description: '3 partidos consecutivos sin recibir goles.',
        icon: '🧱',
        color: 'from-slate-500 to-gray-600',
        rarity: 'rare'
    },
    {
        id: 'drama-queen',
        name: 'Drama Queen',
        description: 'Gana 3 partidos por penales.',
        icon: '🎪',
        color: 'from-purple-500 to-fuchsia-500',
        rarity: 'rare'
    },

    // Epic Achievements (Dominio)
    {
        id: 'unbeatable',
        name: 'Racha Imparable',
        description: 'Gana 5 partidos seguidos.',
        icon: '🔥',
        color: 'from-purple-500 to-pink-500',
        rarity: 'epic'
    },
    {
        id: 'domination',
        name: 'Dominación Total',
        description: 'Gana 10 partidos seguidos.',
        icon: '👑',
        color: 'from-yellow-500 to-orange-600',
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
        id: 'artist',
        name: 'Artista',
        description: 'Marca 10+ goles en un solo partido.',
        icon: '🎨',
        color: 'from-pink-500 to-rose-600',
        rarity: 'epic'
    },
    {
        id: 'shark',
        name: 'Tiburón',
        description: 'Gana contra el jugador #1 del ranking.',
        icon: '🦈',
        color: 'from-cyan-500 to-blue-600',
        rarity: 'epic'
    },

    // Legendary Achievements (Leyendas)
    {
        id: 'tournament-king',
        name: 'Rey de Copas',
        description: 'Gana un torneo oficial.',
        icon: '🏆',
        color: 'from-yellow-500 to-amber-600',
        rarity: 'legendary'
    },
    {
        id: 'legend',
        name: 'Leyenda',
        description: 'Juega 100 partidos.',
        icon: '⭐',
        color: 'from-yellow-400 to-yellow-600',
        rarity: 'legendary'
    },
    {
        id: 'centurion',
        name: 'Centurión',
        description: 'Alcanza los 100 goles totales.',
        icon: '💯',
        color: 'from-amber-500 to-orange-600',
        rarity: 'legendary'
    }
];

export function calculateUnlockedAchievements(player: Player, matches: Match[]): string[] {
    const unlocked: string[] = [];
    const playerMatches = matches.filter(m =>
        m.players.team1.includes(player.id) || m.players.team2.includes(player.id)
    ).sort((a, b) => a.date - b.date);

    // First Match
    if (playerMatches.length > 0) unlocked.push('first-match');

    // First Win
    if (player.derivedStats?.wins && player.derivedStats.wins > 0) unlocked.push('first-win');

    // Social Player: 5 different opponents
    const uniqueOpponents = new Set<string>();
    playerMatches.forEach(m => {
        const allPlayers = [...m.players.team1, ...m.players.team2];
        allPlayers.forEach(pid => {
            if (pid !== player.id) uniqueOpponents.add(pid);
        });
    });
    if (uniqueOpponents.size >= 5) unlocked.push('social-player');

    // Veteran: 50 matches
    if (playerMatches.length >= 50) unlocked.push('veteran');

    // Legend: 100 matches
    if (playerMatches.length >= 100) unlocked.push('legend');

    // Hat-trick: 3+ goals in a match
    const hadHatTrick = playerMatches.some(m => {
        const isT1 = m.players.team1.includes(player.id);
        const score = isT1 ? m.score.team1 : m.score.team2;
        return score >= 3;
    });
    if (hadHatTrick) unlocked.push('hat-trick');

    // Artist: 10+ goals in a match
    const hadArtist = playerMatches.some(m => {
        const isT1 = m.players.team1.includes(player.id);
        const score = isT1 ? m.score.team1 : m.score.team2;
        return score >= 10;
    });
    if (hadArtist) unlocked.push('artist');

    // Clean Sheet: Win with 0 goals against
    const hadCleanSheet = playerMatches.some(m => {
        const isT1 = m.players.team1.includes(player.id);
        const win = (isT1 && m.score.team1 > m.score.team2) || (!isT1 && m.score.team2 > m.score.team1);
        const goalsAgainst = isT1 ? m.score.team2 : m.score.team1;
        return win && goalsAgainst === 0;
    });
    if (hadCleanSheet) unlocked.push('clean-sheet');

    // Wall: 3 consecutive clean sheets
    let cleanSheetStreak = 0;
    let maxCleanSheetStreak = 0;
    playerMatches.forEach(m => {
        const isT1 = m.players.team1.includes(player.id);
        const win = (isT1 && m.score.team1 > m.score.team2) || (!isT1 && m.score.team2 > m.score.team1);
        const goalsAgainst = isT1 ? m.score.team2 : m.score.team1;
        if (win && goalsAgainst === 0) cleanSheetStreak++;
        else cleanSheetStreak = 0;
        if (cleanSheetStreak > maxCleanSheetStreak) maxCleanSheetStreak = cleanSheetStreak;
    });
    if (maxCleanSheetStreak >= 3) unlocked.push('wall');

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

    // Domination: 10 wins in a row
    if (maxStreak >= 10) unlocked.push('domination');

    // Comeback King: Win after 3 losses
    let lossStreak = 0;
    let hadComeback = false;
    playerMatches.forEach(m => {
        const isT1 = m.players.team1.includes(player.id);
        const win = (isT1 && m.score.team1 > m.score.team2) || (!isT1 && m.score.team2 > m.score.team1);
        const loss = (isT1 && m.score.team1 < m.score.team2) || (!isT1 && m.score.team2 < m.score.team1);

        if (loss) lossStreak++;
        else if (win && lossStreak >= 3) {
            hadComeback = true;
            lossStreak = 0;
        } else lossStreak = 0;
    });
    if (hadComeback) unlocked.push('comeback-king');

    // Precision: 5 wins by 3+ goal difference
    let precisionWins = 0;
    playerMatches.forEach(m => {
        const isT1 = m.players.team1.includes(player.id);
        const myScore = isT1 ? m.score.team1 : m.score.team2;
        const oppScore = isT1 ? m.score.team2 : m.score.team1;
        if (myScore - oppScore >= 3) precisionWins++;
    });
    if (precisionWins >= 5) unlocked.push('precision');

    // Drama Queen: 3 penalty wins
    let penaltyWins = 0;
    playerMatches.forEach(m => {
        if (m.endedBy === 'penalties') {
            const isT1 = m.players.team1.includes(player.id);
            const won = (isT1 && m.penaltyWinner === 1) || (!isT1 && m.penaltyWinner === 2);
            if (won) penaltyWins++;
        }
    });
    if (penaltyWins >= 3) unlocked.push('drama-queen');

    // Goal Machine: 50 total goals
    if (player.derivedStats?.goalsScored && player.derivedStats.goalsScored >= 50) unlocked.push('goal-machine');

    // Centurion: 100 total goals
    if (player.derivedStats?.goalsScored && player.derivedStats.goalsScored >= 100) unlocked.push('centurion');

    // Tournament King: Win a tournament
    if (player.derivedStats && (player.derivedStats as any).tournamentsWon > 0) unlocked.push('tournament-king');

    // Shark: Beat #1 player (would need ranking data)
    // This would require additional logic to track rankings

    return unlocked;
}
