import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    glow?: boolean;
}

export const Button = ({
    className,
    variant = 'primary',
    size = 'md',
    glow = false,
    children,
    ...props
}: ButtonProps) => {
    const variants = {
        primary: 'bg-gradient-to-r from-primary to-accent text-white border-none',
        secondary: 'bg-surface text-secondary border border-secondary/20 hover:border-secondary/50',
        outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10',
        ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg font-bold',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                'relative overflow-hidden rounded-xl font-heading transition-all duration-300 flex items-center justify-center gap-2',
                variants[variant],
                sizes[size],
                glow && 'shadow-[0_0_20px_rgba(var(--color-primary),0.5)] hover:shadow-[0_0_30px_rgba(var(--color-primary),0.8)]',
                className
            )}
            {...props}
        >
            {/* Animated Shine Effect for Primary Buttons */}
            {variant === 'primary' && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
            {children as React.ReactNode}
        </motion.button>
    );
};
