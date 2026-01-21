import { useState } from 'react';
import { Trophy, Flag, Smile, Zap, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AvatarSelectorProps {
    onSelect: (avatar: string) => void;
    selectedAvatar: string;
}

type Category = 'emojis' | 'sports' | 'flags' | 'other' | 'animals' | 'clubes';

const AVATARS = {
    sports: ['⚽', '🥅', '🏆', '🥇', '🥈', '🥉', '🎽', '👟', '🏟️', '🎫', '🥊', '🥋', '🏓', '🏸', '🏒', '🏀', '🏐', '🏈', '🏉', '🎾', '🎳', '⚾', '🥎', '⛳', '🏄'],
    animals: ['🦁', '🐯', '🐻', '🦈', '🦅', '🦍', '🐺', '🦊', '🦄', '🐲', '🐼', '🐨', '🐸', '🐙', '🦖', '🐝', '🦋', '🦉', '🦂', '🐢', '🐈', '🐕', '🐒', '🐧', '🐳'],
    emojis: ['👻', '👽', '🤖', '💩', '🔥', '⚡', '💎', '👑', '💀', '🚀', '🌈', '🍕', '🍔', '🍟', '🍩', '🍦', '🍭', '🧁', '🍪', '🍫', '🎭', '🎨', '🎪', '🕹️', '🎲'],
    flags: ['🇦🇷', '🇧🇷', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇬🇧', '🇵🇹', '🇳🇱', '🇧🇪', '🇭🇷', '🇺🇾', '🇨🇱', '🇨🇴', '🇲🇽', '🇺🇸', '🇨🇦', '🇯🇵', '🇰🇷', '🇨🇳', '🇳🇴', '🇸🇪', '🇫🇮', '🇩🇰', '🇬🇷'],
    clubes: [
        '🟦🟨', // Boca
        '⬜🟥⬜', // River
        '🟥⬜🟥', // Independiente
        '🟦⬜🟦', // Racing
        '🟥🟦', // San Lorenzo
        '⬜🟦⬜', // Vélez
        '⬜🎈', // Huracán
        '🟥⬜🟥⬜', // Estudiantes
        '🟦⬜', // Gimnasia
        '🟨🟦', // Central
        '🟥⬛', // Newell's
        '⬜🟦', // Talleres
        '🟦⚪', // Belgrano
        '⬜🟩', // Banfield
        '🟥🟩', // Lanús
        '⬜🐞', // Argentinos
        '🟥⬜', // Unión
        '🟦🟥', // Colón
        '⬛🟨', // Peñarol (bonus)
        '⬜🟦⬜', // Nacional (bonus)
        '🟢⚪', // Ferro
        '🟤⚪', // Platense
        '🟠⬛', // Berazategui (example)
        '🟣⚪', // Sacachispas
        '⚽🏆' // AFA
    ],
    other: ['🎮', '🎯', '🎰', '🎼', '🎵', '🎧', '🎤', '🎬', '🚗', '✈️', '⚓', '⌚', '💡', '📱', '💻', '🔋', '🧿', '🍀', '✨', '🪐', '🌋', '🌊', '🌪️', '🔥', '🧊']
};

export function AvatarSelector({ onSelect, selectedAvatar }: AvatarSelectorProps) {
    const [category, setCategory] = useState<Category>('sports');

    const categories = [
        { id: 'sports', icon: Trophy, label: 'Deportes' },
        { id: 'clubes', icon: Flag, label: 'Clubes' },
        { id: 'animals', icon: Smile, label: 'Animales' },
        { id: 'emojis', icon: Zap, label: 'Cool' },
        { id: 'flags', icon: Flag, label: 'Países' },
        { id: 'other', icon: Smile, label: 'Varios' }
    ];

    const handleRandom = () => {
        const allAvatars = Object.values(AVATARS).flat();
        const randomAvatar = allAvatars[Math.floor(Math.random() * allAvatars.length)];
        onSelect(randomAvatar);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex gap-2 p-1 bg-black/20 rounded-xl overflow-x-auto scrollbar-hide flex-1 mr-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id as Category)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                                category === cat.id
                                    ? "bg-primary text-black shadow-lg"
                                    : "hover:bg-white/5 text-gray-400 hover:text-white"
                            )}
                        >
                            <cat.icon className="w-3 h-3" />
                            {cat.label}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={handleRandom}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                    title="Aleatorio"
                >
                    <RefreshCw className="w-4 h-4 text-primary group-hover:rotate-180 transition-transform duration-500" />
                </button>
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

            <p className="text-[10px] text-center text-gray-500 italic uppercase font-black tracking-widest opacity-50">
                Selecciona tu Avatar
            </p>
        </div>
    );
}

