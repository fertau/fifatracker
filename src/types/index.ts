export interface Player {
    id: string;
    name: string;
    avatar: string; // URL or emoji or local asset path
    themePreference: 'fifa' | 'cyberpunk' | 'retro';
    stats: {
        matchesPlayed: number;
        wins: number;
        draws: number;
        losses: number;
        goalsScored: number;
        goalsConceded: number;
    };
    friends: string[]; // List of Player IDs
    createdAt: number;
}

export interface Match {
    id: string;
    date: number;
    type: '1v1' | '2v2' | '3v1' | 'custom';
    players: {
        team1: string[]; // Player IDs
        team2: string[]; // Player IDs
    };
    score: {
        team1: number;
        team2: number;
    };
    endedBy: 'regular' | 'penalties' | 'forfeit';
    penaltyWinner?: 1 | 2; // Team 1 or Team 2
    forfeitLoser?: 1 | 2; // Team 1 or Team 2
    tournamentId?: string;
}

export interface Tournament {
    id: string;
    name: string;
    status: 'draft' | 'active' | 'completed';
    type: 'league' | 'knockout';
    participants: string[]; // Player IDs
    matches: string[]; // Match IDs
    winner?: string; // Player ID
    createdAt: number;
}

export interface Session {
    id: string;
    isActive: boolean;
    playersPresent: string[]; // Player IDs
    startedAt: number;
    endedAt?: number;
    hostId?: string; // Optional host
}
