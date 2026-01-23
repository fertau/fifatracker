import { useState, useEffect } from 'react';

const STORAGE_KEY = 'fifa_tracker_remembered_accounts';

interface RememberedAccountsHook {
    rememberedAccountIds: string[];
    rememberAccount: (playerId: string) => void;
    forgetAccount: (playerId: string) => void;
    isAccountRemembered: (playerId: string) => boolean;
}

/**
 * Hook to manage remembered accounts on this device.
 * Similar to Google account selector - accounts that have logged in before
 * are remembered for quick access, but can be removed from this device.
 */
export function useRememberedAccounts(): RememberedAccountsHook {
    const [rememberedAccountIds, setRememberedAccountIds] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading remembered accounts:', error);
            return [];
        }
    });

    // Sync to localStorage whenever the list changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(rememberedAccountIds));
        } catch (error) {
            console.error('Error saving remembered accounts:', error);
        }
    }, [rememberedAccountIds]);

    const rememberAccount = (playerId: string) => {
        setRememberedAccountIds(prev => {
            if (prev.includes(playerId)) return prev;
            return [...prev, playerId];
        });
    };

    const forgetAccount = (playerId: string) => {
        setRememberedAccountIds(prev => prev.filter(id => id !== playerId));
    };

    const isAccountRemembered = (playerId: string) => {
        return rememberedAccountIds.includes(playerId);
    };

    return {
        rememberedAccountIds,
        rememberAccount,
        forgetAccount,
        isAccountRemembered
    };
}
