import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center font-extrabold uppercase tracking-wide border-[2px] border-border rounded-none shadow-xs transition-all duration-150 focus-ring cursor-pointer disabled:opacity-50 disabled:pointer-events-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
          {
            // Variants
            'bg-accent hover:bg-accent-hover text-black': variant === 'primary',
            'bg-bg-secondary hover:bg-bg-hover text-text-primary': variant === 'secondary',
            'bg-transparent shadow-none border-transparent hover:bg-bg-tertiary text-text-secondary hover:text-text-primary': variant === 'ghost',
            'bg-danger hover:bg-danger/80 text-white': variant === 'danger',
            'bg-white hover:bg-bg-tertiary text-text-primary': variant === 'outline',
            // Sizes
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
