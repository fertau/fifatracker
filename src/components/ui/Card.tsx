import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLMotionProps<"div"> {
    glass?: boolean;
}

export const Card = ({ className, glass = true, children, ...props }: CardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                'rounded-2xl p-6 border transition-colors duration-300',
                glass
                    ? 'backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg'
                    : 'bg-surface border-white/5',
                'hover:border-primary/30',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};
