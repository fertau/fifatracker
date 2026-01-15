import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    updateDoc,
    arrayUnion
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { Player, Match } from '../types';

interface DataContextType {
    players: Player[];
    matches: Match[];
    loading: boolean;
    addMatch: (match: Match) => Promise<void>;
    deleteMatch: (matchId: string) => Promise<void>;
    addPlayer: (name: string, avatar: string, photoURL?: string) => Promise<Player>;
    deletePlayer: (playerId: string) => Promise<void>;
    updatePlayerFriends: (hostId: string, friendId: string) => Promise<void>;
    getPlayer: (id: string) => Player | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Load & Realtime Sync
    useEffect(() => {
        const unsubscribePlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
            const loadedPlayers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
            setPlayers(loadedPlayers);
        });

        const unsubscribeMatches = onSnapshot(collection(db, 'matches'), (snapshot) => {
            const loadedMatches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
            setMatches(loadedMatches);
        });

        setLoading(false);

        return () => {
            unsubscribePlayers();
            unsubscribeMatches();
        };
    }, []);

    const addPlayer = async (name: string, avatar: string, photoURL?: string) => {
        try {
            console.log('🔵 Attempting to create player:', { name, avatar, photoURL });
            console.log('🔵 Auth user:', auth.currentUser?.uid);

            const newPlayer = {
                name,
                avatar,
                photoURL,
                stats: { matchesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0 },
                friends: [],
                createdAt: Date.now(),
                ownerId: auth.currentUser?.uid || 'anonymous'
            };

            console.log('🔵 Player data to save:', newPlayer);
            const docRef = await addDoc(collection(db, 'players'), newPlayer);
            console.log('✅ Player created successfully with ID:', docRef.id);
            return { id: docRef.id, ...newPlayer } as Player;
        } catch (error: any) {
            console.error('❌ Error creating player:', error);
            console.error('❌ Error code:', error?.code);
            console.error('❌ Error message:', error?.message);
            throw error;
        }
    };

    const deletePlayer = async (playerId: string) => {
        try {
            console.log('🗑️ Deleting player:', playerId);
            await deleteDoc(doc(db, 'players', playerId));
            console.log('✅ Player deleted successfully');
        } catch (error) {
            console.error('❌ Error deleting player:', error);
            throw error;
        }
    };

    const updatePlayerFriends = async (hostId: string, friendId: string) => {
        const hostRef = doc(db, 'players', hostId);
        await updateDoc(hostRef, {
            friends: arrayUnion(friendId)
        });
    };

    const getPlayer = (id: string) => players.find(p => p.id === id);

    const updateStatsForPlayers = async (match: Match, reverse = false) => {
        const allPlayerIds = [...match.players.team1, ...match.players.team2];
        const uniqueIds = Array.from(new Set(allPlayerIds));

        for (const playerId of uniqueIds) {
            const player = players.find(p => p.id === playerId);
            if (!player) continue;

            const isTeam1 = match.players.team1.includes(playerId);
            const isTeam2 = match.players.team2.includes(playerId);
            const myScore = isTeam1 ? match.score.team1 : match.score.team2;
            const opponentScore = isTeam1 ? match.score.team2 : match.score.team1;

            let result: 'win' | 'loss' | 'draw' = 'draw';
            if (match.endedBy === 'regular') {
                if (myScore > opponentScore) result = 'win';
                if (myScore < opponentScore) result = 'loss';
            } else if (match.endedBy === 'penalties') {
                const amIWinner = (isTeam1 && match.penaltyWinner === 1) || (isTeam2 && match.penaltyWinner === 2);
                result = amIWinner ? 'win' : 'loss';
            } else if (match.endedBy === 'forfeit') {
                const amILoser = (isTeam1 && match.forfeitLoser === 1) || (isTeam2 && match.forfeitLoser === 2);
                result = amILoser ? 'loss' : 'win';
            }

            const factor = reverse ? -1 : 1;
            const newStats = {
                matchesPlayed: Math.max(0, player.stats.matchesPlayed + (1 * factor)),
                wins: Math.max(0, player.stats.wins + ((result === 'win' ? 1 : 0) * factor)),
                losses: Math.max(0, player.stats.losses + ((result === 'loss' ? 1 : 0) * factor)),
                draws: Math.max(0, player.stats.draws + ((result === 'draw' ? 1 : 0) * factor)),
                goalsScored: Math.max(0, player.stats.goalsScored + (myScore * factor)),
                goalsConceded: Math.max(0, player.stats.goalsConceded + (opponentScore * factor))
            };

            const playerRef = doc(db, 'players', playerId);
            await updateDoc(playerRef, { stats: newStats });
        }
    };

    const addMatch = async (match: Match) => {
        const { id, ...matchData } = match;
        await addDoc(collection(db, 'matches'), matchData);
        await updateStatsForPlayers(match);
    };

    const deleteMatch = async (matchId: string) => {
        const matchToRemove = matches.find(m => m.id === matchId);
        if (!matchToRemove) return;

        await deleteDoc(doc(db, 'matches', matchId));
        await updateStatsForPlayers(matchToRemove, true);
    };

    return (
        <DataContext.Provider value={{
            players,
            matches,
            loading,
            addMatch,
            deleteMatch,
            addPlayer,
            deletePlayer,
            updatePlayerFriends,
            getPlayer
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
