import type { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Gamepad2, Trophy, User, Palette } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const { theme, setTheme } = useTheme();
    const location = useLocation();

    const cycleTheme = () => {
        const themes: typeof theme[] = ['fifa', 'cyberpunk', 'retro'];
        const currentIndex = themes.indexOf(theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        setTheme(nextTheme);
    };

    return (
        <div className="min-h-screen pb-20 bg-background text-white transition-colors duration-500 font-body overflow-x-hidden">
            {/* Top Bar */}
            <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-white/5 px-4 py-3 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-2">
                    <Gamepad2 className="w-6 h-6 text-primary animate-pulse" />
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        FIFA TRACKER
                    </h1>
                </div>
                <button
                    onClick={cycleTheme}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all border border-white/5"
                    aria-label="Change Theme"
                >
                    <Palette className="w-5 h-5 text-secondary" />
                </button>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                >
                    {children}
                </motion.div>
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-white/10 px-6 py-4 z-50">
                <div className="flex justify-around items-center max-w-md mx-auto">
                    <NavLink to="/" icon={<Trophy className="w-6 h-6" />} label="Rankings" active={location.pathname === '/'} />
                    <div className="relative -top-6">
                        <Link to="/match/new" className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-accent shadow-[0_0_15px_rgba(var(--color-primary),0.5)] border-4 border-background hover:scale-110 transition-transform">
                            <Gamepad2 className="w-8 h-8 text-white" />
                        </Link>
                    </div>
                    <NavLink to="/profile" icon={<User className="w-6 h-6" />} label="Perfil" active={location.pathname === '/profile'} />
                </div>
            </nav>
        </div>
    );
};

const NavLink = ({ to, icon, label, active }: { to: string, icon: ReactNode, label: string, active: boolean }) => (
    <Link to={to} className={cn("flex flex-col items-center gap-1 transition-colors", active ? "text-primary" : "text-gray-500 hover:text-gray-300")}>
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
    </Link>
);
