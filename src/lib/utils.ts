import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { PlayerStats } from '../types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface ScoreBreakdown {
    base: number;
    activity: number;
    confidence: number;
    total: number;
    wins: number;
    draws: number;
    goalDiff: number;
    matches: number;
}

export function calculatePlayerScore(stats: PlayerStats | undefined): number {
    if (!stats) return 0;
    const breakdown = getScoreBreakdown(stats);
    return breakdown.total;
}

export function getScoreBreakdown(stats: PlayerStats): ScoreBreakdown {
    const goalDiff = stats.goalsScored - stats.goalsConceded;

    // 1. Performance base
    const base = (stats.wins * 300) + (stats.draws * 100) + (goalDiff * 10);

    // 2. Activity bonus with diminishing returns after 50 matches
    let activity = 0;
    if (stats.matchesPlayed <= 50) {
        activity = stats.matchesPlayed * 5;
    } else {
        activity = (50 * 5) + ((stats.matchesPlayed - 50) * 1);
    }

    // 3. Confidence Factor (Normalización)
    // Starts at 0.5 and reaches 1.0 at 20 matches played
    const confidence = Math.min(1.0, 0.5 + (stats.matchesPlayed * 0.025));

    const total = Math.max(0, Math.round((base + activity) * confidence));

    return {
        base,
        activity,
        confidence,
        total,
        wins: stats.wins * 300,
        draws: stats.draws * 100,
        goalDiff: goalDiff * 10,
        matches: activity
    };
}

