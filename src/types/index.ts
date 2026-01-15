export interface Player {
    id: string;
    name: string;
    avatar: string; // URL or emoji or local asset path
    photoURL?: string; // Firebase Storage URL for profile photo
    stats: {
        matchesPlayed: number;
        wins: number;
        draws: number;
        losses: number;
        goalsScored: number;
        goalsConceded: number;
    };
    friends: string[]; // List of Player IDs
    friendRequests?: string[]; // Array of player IDs who sent a request
    pin?: string; // Optional security PIN
    ownerId: string;
    createdAt: number;
}

export interface AuditLogEntry {
    userId: string;
    userName: string;
    timestamp: number;
    changes: string; // Description of what changed
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
    edits?: AuditLogEntry[];
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
