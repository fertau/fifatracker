import { useState } from 'react';
import { Trophy, Flag, Smile, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AvatarSelectorProps {
    onSelect: (avatar: string) => void;
    selectedAvatar: string;
}

type Category = 'emojis' | 'sports' | 'flags' | 'other';

export function AvatarSelector({ onSelect, selectedAvatar }: AvatarSelectorProps) {
    const [category, setCategory] = useState<Category>('sports');

    const AVATARS = {
        sports: ['⚽', '🥅', '🏆', '🥇', '🥈', '🥉', '🎽', '👟', '🏟️', '🎫', '🥊', '🥋', '🏓', '🏸', '🏒', '🏀', '🏐', '🏈', '🏉', '🎾'],
        emojis: ['🦁', '🐯', '🐻', '🦈', '🦅', '🦍', '🐺', '🦊', '🦄', '🐲', '👻', '👽', '🤖', '💩', '🔥', '⚡', '💎', '👑', '💀', '🚀'],
        flags: ['🇦🇷', '🇧🇷', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇬🇧', '🇵🇹', '🇳🇱', '🇧🇪', '🇭🇷', '🇺🇾', '🇨🇱', '🇨🇴', '🇲🇽', '🇺🇸', '🇨🇦', '🇯🇵', '🇰🇷', '🇨🇳'],
        other: ['🎮', '🎲', '🎯', '🎰', '🎳', '🎼', '🎵', '🎧', '🎤', '🎬', '🎨', '🎭', '🎪', '🍔', '🍕', '🍺', '🚗', '✈️', '⚓', '⌚']
    };

    const categories = [
        { id: 'sports', icon: Trophy, label: 'Deportes' },
        { id: 'emojis', icon: Smile, label: 'Avatares' },
        { id: 'flags', icon: Flag, label: 'Países' },
        { id: 'other', icon: Zap, label: 'Otros' }
    ];

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex gap-2 p-1 bg-black/20 rounded-xl overflow-x-auto">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as Category)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                            category === cat.id
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "hover:bg-white/5 text-gray-400 hover:text-white"
                        )}
                    >
                        <cat.icon className="w-3 h-3" />
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                {AVATARS[category].map((avatar) => (
                    <button
                        key={avatar}
                        type="button"
                        onClick={() => onSelect(avatar)}
                        className={cn(
                            "aspect-square flex items-center justify-center text-2xl rounded-xl transition-all hover:scale-110",
                            selectedAvatar === avatar
                                ? "bg-primary/20 ring-2 ring-primary scale-110 shadow-[0_0_15px_rgba(var(--color-primary),0.3)]"
                                : "bg-white/5 hover:bg-white/10 border border-white/5"
                        )}
                    >
                        {avatar}
                    </button>
                ))}
            </div>

            <p className="text-[10px] text-center text-gray-500 italic">
                Selecciona un ícono para tu perfil
            </p>
        </div>
    );
}
