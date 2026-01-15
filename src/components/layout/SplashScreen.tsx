import { motion } from 'framer-motion';
import { Gamepad2, Circle } from 'lucide-react';

export function SplashScreen() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
        >
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-accent/10 blur-[80px] rounded-full delay-1000" />

            <div className="relative flex flex-col items-center">
                {/* Logo Animation */}
                <div className="relative mb-8">
                    {/* Joystick */}
                    <motion.div
                        initial={{ x: -20, opacity: 0, rotate: -15 }}
                        animate={{ x: 0, opacity: 1, rotate: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-10"
                    >
                        <Gamepad2 className="w-24 h-24 text-primary drop-shadow-[0_0_15px_rgba(var(--color-primary),0.5)]" />
                    </motion.div>

                    {/* Soccer Ball */}
                    <motion.div
                        initial={{ x: 20, opacity: 0, rotate: 45 }}
                        animate={{ x: 0, opacity: 1, rotate: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="absolute -bottom-2 -right-4 z-20"
                    >
                        <div className="relative">
                            <Circle className="w-12 h-12 text-accent fill-accent/20 drop-shadow-[0_0_10px_rgba(var(--color-accent),0.5)]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-accent/40 rounded-full" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Text Animation */}
                <div className="text-center">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-4xl font-bold font-heading italic tracking-tighter uppercase mb-1"
                    >
                        FIFA <span className="text-primary italic">TRACKER</span>
                    </motion.h1>
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="h-1 w-32 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mt-2"
                    />
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-500 mt-4"
                    >
                        Cargando tu progreso...
                    </motion.p>
                </div>
            </div>

            {/* Bottom Version Tag */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-10 text-[8px] uppercase tracking-widest font-black text-white/10"
            >
                v1.0.0 • Premium PWA Experience
            </motion.div>
        </motion.div>
    );
}
