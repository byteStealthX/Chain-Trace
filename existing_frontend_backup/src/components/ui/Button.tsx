import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-neon disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-accent-neon text-bg-primary hover:bg-accent-neon/90 shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:shadow-[0_0_25px_rgba(0,255,136,0.5)]',
                destructive: 'bg-red-500 text-white hover:bg-red-600',
                outline: 'border border-accent-neon/30 text-accent-neon hover:bg-accent-neon/10 backdrop-blur-sm',
                secondary: 'bg-bg-card border border-border text-text-primary hover:bg-bg-secondary hover:border-accent-neon/50',
                ghost: 'hover:bg-accent-neon/10 text-text-primary hover:text-accent-neon',
                link: 'text-accent-neon underline-offset-4 hover:underline',
                glow: 'bg-bg-primary border border-accent-neon text-accent-neon shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] hover:bg-accent-neon/10',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-11 rounded-md px-8',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends Omit<HTMLMotionProps<"button">, "ref" | "variant"> { // Explicitly omit variant from motion props if exists (it shouldn't but just in case)
    asChild?: boolean;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glow" | null;
    size?: "default" | "sm" | "lg" | "icon" | null;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = motion.button;
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
