import { useNavigate } from 'react-router-dom';
import { Users, Trophy, Play, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function PlayMenu() {
    const navigate = useNavigate();



    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold font-heading uppercase tracking-tighter">¿Cómo jugamos?</h2>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1 italic">Selecciona tu modalidad preferida</p>
                </div>
            </div>

            {/* Section 1: Ways to Play */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 border-l-2 border-primary pl-3">
                    Modos de Juego
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {[
                        {
                            id: 'match',
                            title: 'Partido rápido',
                            description: 'Un partido casual 1v1 o 2v2.',
                            icon: <Play className="w-8 h-8 text-primary" />,
                            path: '/match/new',
                            color: 'border-primary/20 hover:border-primary',
                            badge: 'Express'
                        },
                        {
                            id: 'session',
                            title: 'Nueva Sesión',
                            description: 'Registra historial del día con amigos.',
                            icon: <Users className="w-8 h-8 text-accent" />,
                            path: '/session/new',
                            color: 'border-accent/20 hover:border-accent',
                            badge: 'Social'
                        }
                    ].map((option, idx) => (
                        <motion.div
                            key={option.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => navigate(option.path)}
                        >
                            <Card
                                glass
                                className={`p-5 cursor-pointer group transition-all transform hover:translate-x-1 border-l-4 ${option.color} relative overflow-hidden bg-gradient-to-r from-white/[0.03] to-transparent`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform shadow-lg">
                                        {option.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-xl font-bold uppercase tracking-tighter text-white group-hover:text-primary transition-colors">
                                                {option.title}
                                            </h3>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                {option.badge}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors line-clamp-2">
                                            {option.description}
                                        </p>
                                    </div>
                                    <ArrowLeft className="w-4 h-4 text-gray-600 rotate-180 group-hover:text-white transition-colors" />
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Section 2: Competitions (Consult/Continue) */}
            <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 border-l-2 border-yellow-500 pl-3">
                    Consultar / Continuar
                </h3>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => navigate('/tournaments')}
                >
                    <Card
                        glass
                        className="p-5 cursor-pointer group transition-all transform hover:translate-x-1 border-l-4 border-yellow-500/20 hover:border-yellow-500 relative overflow-hidden bg-gradient-to-r from-yellow-500/[0.03] to-transparent"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Trophy className="w-24 h-24 rotate-12" />
                        </div>

                        <div className="flex items-center gap-5 relative z-10">
                            <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 group-hover:scale-110 transition-transform shadow-lg">
                                <Trophy className="w-8 h-8 text-yellow-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-xl font-bold uppercase tracking-tighter text-white group-hover:text-yellow-400 transition-colors">
                                        Torneos
                                    </h3>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                                        Gestión
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Consulta tablas, fixtures o continúa tus competiciones activas.
                                </p>
                            </div>
                            <ArrowLeft className="w-4 h-4 text-gray-600 rotate-180 group-hover:text-white transition-colors" />
                        </div>
                    </Card>
                </motion.div>
            </div>



            <div className="pt-4 text-center">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-black opacity-30">
                    Sincronizado con el historial de partidos
                </p>
            </div>
        </div>
    );
}
