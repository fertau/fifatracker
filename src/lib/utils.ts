import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { PlayerStats } from '../types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function calculatePlayerScore(stats: PlayerStats | undefined): number {
    if (!stats) return 0;

    // Formula: (Wins * 300) + (Draws * 100) + (GoalDiff * 10) + (Matches * 5)
    // This emphasizes winning (regular league points scale x100)
    // Adds value for Goal Diff
    // Adds value for Activity (Matches played)

    const goalDiff = stats.goalsScored - stats.goalsConceded;

    const score = (stats.wins * 300) +
        (stats.draws * 100) +
        (goalDiff * 10) +
        (stats.matchesPlayed * 5);

    return Math.max(0, score); // Ensure no negative scores for display
}
