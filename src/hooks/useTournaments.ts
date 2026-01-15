import { useState } from 'react';
import type { Tournament } from '../types';

const INITIAL_TOURNAMENTS: Tournament[] = [];

export function useTournaments() {
    const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);

    const createTournament = (name: string, type: 'league' | 'knockout', participants: string[]) => {
        const newTournament: Tournament = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            type,
            status: 'active',
            participants,
            matches: [], // We would generate the fixture here
            createdAt: Date.now()
        };

        // Simple fixture generation logic could go here
        // For now, just creating the tournament object

        setTournaments((prev) => [newTournament, ...prev]);
        return newTournament;
    };

    return { tournaments, createTournament };
}
