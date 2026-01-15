import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Session } from '../types';

interface SessionContextType {
    session: Session | null;
    startSession: (playersIds: string[]) => void;
    endSession: () => void;
    addPlayerToSession: (playerId: string) => void;
    removePlayerFromSession: (playerId: string) => void;
    updateSessionPlayers: (playersIds: string[]) => void;
    isSessionActive: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const STORAGE_KEY = 'fifa_tracker_active_session';

export function SessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (session) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [session]);

    const startSession = (playersIds: string[]) => {
        const newSession: Session = {
            id: Math.random().toString(36).substr(2, 9),
            isActive: true,
            playersPresent: playersIds,
            startedAt: Date.now(),
        };
        setSession(newSession);
    };

    const endSession = () => {
        if (session) {
            // Here we could save to history before clearing
            setSession(null);
        }
    };

    const addPlayerToSession = (playerId: string) => {
        if (session && !session.playersPresent.includes(playerId)) {
            setSession({
                ...session,
                playersPresent: [...session.playersPresent, playerId]
            });
        }
    };

    const removePlayerFromSession = (playerId: string) => {
        if (session) {
            setSession({
                ...session,
                playersPresent: session.playersPresent.filter(id => id !== playerId)
            });
        }
    };

    const updateSessionPlayers = (playersIds: string[]) => {
        if (session) {
            setSession({
                ...session,
                playersPresent: playersIds
            });
        }
    };

    return (
        <SessionContext.Provider value={{
            session,
            startSession,
            endSession,
            addPlayerToSession,
            removePlayerFromSession,
            updateSessionPlayers,
            isSessionActive: !!session
        }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}
