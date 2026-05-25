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
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus-ring cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          {
            // Variants
            'bg-accent hover:bg-accent-hover text-white rounded-md shadow-sm': variant === 'primary',
            'bg-bg-tertiary hover:bg-bg-hover text-text-primary border border-border rounded-md': variant === 'secondary',
            'hover:bg-bg-tertiary text-text-secondary hover:text-text-primary rounded-md': variant === 'ghost',
            'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 rounded-md': variant === 'danger',
            'border border-border hover:border-text-tertiary hover:bg-bg-secondary text-text-primary rounded-md': variant === 'outline',
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
