import type { ReactNode } from 'react';
import { Gamepad2, Trophy, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { Player } from '../../types';

interface LayoutProps {
    children: ReactNode;
    player: Player;
}

export const Layout = ({ children, player }: LayoutProps) => {
    const location = useLocation();

    // Real notification check
    const hasFriendRequests = player.friendRequests && player.friendRequests.length > 0;

    return (
        <div className="min-h-screen pb-20 bg-background text-white transition-colors duration-500 font-body overflow-x-hidden">
            {/* Top Bar */}
            <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-white/5 px-4 py-3 flex justify-between items-center shadow-lg">
                <Link to="/" className="flex items-center gap-2">
                    <Gamepad2 className="w-6 h-6 text-primary animate-pulse" />
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        FIFA TRACKER
                    </h1>
                </Link>
                <div className="flex items-center gap-3">
                    <Link
                        to="/profile"
                        className="p-1 rounded-full border border-white/10 hover:border-primary transition-colors relative"
                    >
                        {player.photoURL ? (
                            <img src={player.photoURL} alt={player.name} className="w-8 h-8 rounded-full" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xl">
                                {player.avatar}
                            </div>
                        )}
                        {hasFriendRequests && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-background rounded-full animate-bounce" />
                        )}
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    key={location.pathname}
                    className="space-y-6"
                >
                    {children}
                </motion.div>
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-white/10 px-6 py-4 z-50">
                <div className="flex justify-around items-center max-w-md mx-auto">
                    <NavLink to="/" icon={<Trophy className="w-6 h-6" />} label="Dashboard" active={location.pathname === '/'} />
                    <div className="relative -top-6">
                        <Link to="/play" className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-accent shadow-[0_0_15px_rgba(var(--color-primary),0.5)] border-4 border-background hover:scale-110 transition-transform">
                            <Gamepad2 className="w-8 h-8 text-white" />
                        </Link>
                    </div>
                    <NavLink to="/friends" icon={<Users className="w-6 h-6" />} label="Social" active={location.pathname === '/friends'} />
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
