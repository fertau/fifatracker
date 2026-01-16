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
            title: 'Partido rápido',
            description: 'Un partido casual 1v1 o 2v2. Ideal si solo quieres registrar un resultado rápido sin gestionar quiénes están presentes.',
            icon: <Play className="w-8 h-8 text-primary" />,
            path: '/match/new',
            color: 'border-primary/20 hover:border-primary',
            badge: 'Express'
        },
        {
            id: 'session',
            title: 'Nueva Sesión de Juego',
            description: 'La forma recomendada de jugar con amigos. Define quiénes están presentes hoy para registrar múltiples partidos, torneos y ver estadísticas del día.',
            icon: <Users className="w-8 h-8 text-accent" />,
            path: '/session/new',
            color: 'border-accent/20 hover:border-accent',
            badge: 'Recomendado'
        }
    ];

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

            <div className="grid grid-cols-1 gap-5">
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
                            {/* Decorative Background Icon */}
                            <div className="absolute -bottom-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                {option.id === 'match' ? <Gamepad2 className="w-32 h-32" /> : <Trophy className="w-32 h-32" />}
                            </div>

                            <div className="flex flex-col gap-4 relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="p-4 rounded-[1.5rem] bg-white/5 border border-white/10 shadow-inner group-hover:shadow-primary/20 transition-all">
                                        {option.icon}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${option.id === 'session' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                        {option.badge}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold uppercase tracking-tighter group-hover:text-white transition-colors flex items-center gap-2">
                                        {option.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300">
                                        {option.description}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>



            <div className="pt-4 text-center">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-black opacity-30">
                    Sincronizado con el historial de partidos
                </p>
            </div>
        </div>
    );
}
