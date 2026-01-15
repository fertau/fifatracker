import { useNavigate } from 'react-router-dom';
import { Gamepad2, Users, Trophy, Play, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function PlayMenu() {
    const navigate = useNavigate();

    const menuOptions = [
        {
            id: 'match',
            title: 'Nuevo Partido',
            description: 'Un partido rápido entre amigos.',
            icon: <Play className="w-8 h-8 text-primary" />,
            path: '/match/new',
            color: 'border-primary/20 hover:border-primary'
        },
        {
            id: 'session',
            title: 'Nueva Sesión',
            description: 'Juega con varios amigos al mismo tiempo.',
            icon: <Users className="w-8 h-8 text-accent" />,
            path: '/session/new',
            color: 'border-accent/20 hover:border-accent'
        },
        {
            id: 'tournament',
            title: 'Nuevo Torneo',
            description: 'Crea una liga o eliminatoria.',
            icon: <Trophy className="w-8 h-8 text-yellow-500" />,
            path: '/tournament/new',
            color: 'border-yellow-500/20 hover:border-yellow-500'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-3xl font-bold font-heading uppercase tracking-tighter">¿A qué jugamos?</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {menuOptions.map((option, idx) => (
                    <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => navigate(option.path)}
                    >
                        <Card
                            glass
                            className={`p-6 cursor-pointer group transition-all transform hover:scale-[1.02] border ${option.color} relative overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Gamepad2 className="w-24 h-24" />
                            </div>

                            <div className="flex items-center gap-6 relative z-10">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:shadow-primary/20 transition-all">
                                    {option.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-white transition-colors">
                                        {option.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 group-hover:text-gray-300">
                                        {option.description}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="pt-4 text-center">
                <p className="text-gray-500 text-xs uppercase tracking-widest font-bold opacity-50">
                    Selecciona una modalidad para continuar
                </p>
            </div>
        </div>
    );
}
