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
import type { Player, Match, AuditLogEntry } from '../types';

interface DataContextType {
    players: Player[];
    matches: Match[];
    loading: boolean;
    addMatch: (match: Match) => Promise<void>;
    updateMatch: (oldMatch: Match, updatedMatch: Match, audit: AuditLogEntry) => Promise<void>;
    deleteMatch: (matchId: string) => Promise<void>;
    addPlayer: (name: string, avatar: string, photoURL?: string, pin?: string) => Promise<Player>;
    updatePlayer: (playerId: string, updates: Partial<Player>) => Promise<void>;
    deletePlayer: (playerId: string) => Promise<void>;
    updatePlayerFriends: (hostId: string, friendId: string) => Promise<void>;
    removePlayerFriend: (hostId: string, friendId: string) => Promise<void>;
    getPlayer: (id: string) => Player | undefined;
    recalculateAllStats: () => Promise<void>;
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

    const cleanData = (data: any) => {
        return JSON.parse(JSON.stringify(data));
    };

    const addPlayer = async (name: string, avatar: string, photoURL?: string, pin?: string) => {
        try {
            const rawPlayer = {
                name,
                avatar,
                photoURL,
                pin,
                stats: { matchesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0 },
                friends: [],
                createdAt: Date.now(),
                ownerId: auth.currentUser?.uid || 'anonymous'
            };
            const newPlayer = cleanData(rawPlayer);
            const docRef = await addDoc(collection(db, 'players'), newPlayer);
            return { id: docRef.id, ...newPlayer } as Player;
        } catch (error) {
            console.error('❌ Error creating player:', error);
            throw error;
        }
    };

    const updatePlayer = async (playerId: string, updates: Partial<Player>) => {
        try {
            const playerRef = doc(db, 'players', playerId);
            const cleanedUpdates = cleanData(updates);
            await updateDoc(playerRef, cleanedUpdates);
        } catch (error) {
            console.error('❌ Error updating player:', error);
            throw error;
        }
    };

    const deletePlayer = async (playerId: string) => {
        try {
            await deleteDoc(doc(db, 'players', playerId));
        } catch (error) {
            console.error('❌ Error deleting player:', error);
            throw error;
        }
    };

    const updatePlayerFriends = async (hostId: string, friendId: string) => {
        try {
            const hostRef = doc(db, 'players', hostId);
            const friendRef = doc(db, 'players', friendId);
            await updateDoc(hostRef, { friends: arrayUnion(friendId) });
            await updateDoc(friendRef, { friends: arrayUnion(hostId) });
        } catch (error) {
            console.error('❌ Error updating friends:', error);
            throw error;
        }
    };

    const removePlayerFriend = async (hostId: string, friendId: string) => {
        try {
            const hostRef = doc(db, 'players', hostId);
            const friendRef = doc(db, 'players', friendId);
            const { arrayRemove } = await import('firebase/firestore');
            await updateDoc(hostRef, { friends: arrayRemove(friendId) });
            await updateDoc(friendRef, { friends: arrayRemove(hostId) });
        } catch (error) {
            console.error('❌ Error removing friend:', error);
            throw error;
        }
    };

    const getPlayer = (id: string) => players.find(p => p.id === id);

    const updateStatsForPlayers = async (match: Match, reverse = false) => {
        const { runTransaction, doc: firestoreDoc } = await import('firebase/firestore');
        const allPlayerIds = [...match.players.team1, ...match.players.team2];
        const uniqueIds = Array.from(new Set(allPlayerIds));

        try {
            await runTransaction(db, async (transaction) => {
                const playerDocs = await Promise.all(
                    uniqueIds.map(id => transaction.get(firestoreDoc(db, 'players', id)))
                );

                for (const playerDoc of playerDocs) {
                    if (!playerDoc.exists()) continue;
                    const playerId = playerDoc.id;
                    const playerData = playerDoc.data() as Player;

                    const isTeam1 = match.players.team1.includes(playerId);
                    const isTeam2 = match.players.team2.includes(playerId);
                    const myScore = isTeam1 ? match.score.team1 : match.score.team2;
                    const opponentScore = isTeam1 ? match.score.team2 : match.score.team1;

                    let result: 'win' | 'loss' | 'draw' = 'draw';
                    if (match.endedBy === 'regular') {
                        if (myScore > opponentScore) result = 'win';
                        else if (myScore < opponentScore) result = 'loss';
                    } else if (match.endedBy === 'penalties') {
                        const amIWinner = (isTeam1 && match.penaltyWinner === 1) || (isTeam2 && match.penaltyWinner === 2);
                        result = amIWinner ? 'win' : 'loss';
                    } else if (match.endedBy === 'forfeit') {
                        const amILoser = (isTeam1 && match.forfeitLoser === 1) || (isTeam2 && match.forfeitLoser === 2);
                        result = amILoser ? 'loss' : 'win';
                    }

                    const factor = reverse ? -1 : 1;
                    const currentStats = playerData.stats || { matchesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0 };

                    const newStats = {
                        matchesPlayed: Math.max(0, currentStats.matchesPlayed + (1 * factor)),
                        wins: Math.max(0, currentStats.wins + ((result === 'win' ? 1 : 0) * factor)),
                        losses: Math.max(0, currentStats.losses + ((result === 'loss' ? 1 : 0) * factor)),
                        draws: Math.max(0, currentStats.draws + ((result === 'draw' ? 1 : 0) * factor)),
                        goalsScored: Math.max(0, currentStats.goalsScored + (myScore * factor)),
                        goalsConceded: Math.max(0, currentStats.goalsConceded + (opponentScore * factor))
                    };

                    transaction.update(playerDoc.ref, { stats: newStats });
                }
            });
        } catch (error) {
            console.error('❌ Transaction failed:', error);
            throw error;
        }
    };

    const addMatch = async (match: Match) => {
        try {
            const { id, ...matchData } = match;
            await addDoc(collection(db, 'matches'), cleanData(matchData));
            await updateStatsForPlayers(match);
        } catch (error) {
            console.error('❌ Error saving match:', error);
            throw error;
        }
    };

    const updateMatch = async (oldMatch: Match, updatedMatch: Match, audit: AuditLogEntry) => {
        try {
            // 1. Revert old stats
            await updateStatsForPlayers(oldMatch, true);

            // 2. Prepare updated data
            const history = oldMatch.edits || [];
            const newHistory = [...history, audit];
            const { id, ...matchData } = updatedMatch;
            const cleanedData = cleanData({ ...matchData, edits: newHistory });

            // 3. Save to Firestore
            await updateDoc(doc(db, 'matches', oldMatch.id), cleanedData);

            // 4. Apply new stats
            await updateStatsForPlayers(updatedMatch);
        } catch (error) {
            console.error('❌ Error updating match:', error);
            throw error;
        }
    };

    const deleteMatch = async (matchId: string) => {
        const matchToRemove = matches.find(m => m.id === matchId);
        if (!matchToRemove) return;
        await deleteDoc(doc(db, 'matches', matchId));
        await updateStatsForPlayers(matchToRemove, true);
    };

    const recalculateAllStats = async () => {
        const { writeBatch, collection: fsCollection, getDocs } = await import('firebase/firestore');
        const batch = writeBatch(db);

        // Reset all player stats
        const playersSnapshot = await getDocs(fsCollection(db, 'players'));

        const resetStats = { matchesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0 };
        playersSnapshot.docs.forEach(pDoc => {
            batch.update(pDoc.ref, { stats: resetStats });
        });
        await batch.commit();

        // Reload fresh players (optional but good practice)
        // Now calculate from all matches
        const matchesSnapshot = await getDocs(fsCollection(db, 'matches'));
        const allMatches = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));

        // We can't use transactions easily for ALL matches at once if too many, 
        // but since this is a manual fix and we are doing it sequentially here:
        for (const match of allMatches) {
            await updateStatsForPlayers(match);
        }
    };

    return (
        <DataContext.Provider value={{
            players,
            matches,
            loading,
            addMatch,
            updateMatch,
            deleteMatch,
            addPlayer,
            updatePlayer,
            deletePlayer,
            updatePlayerFriends,
            removePlayerFriend,
            getPlayer,
            recalculateAllStats
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
