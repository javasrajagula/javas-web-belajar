import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border uppercase tracking-wider',
          {
            'bg-accent-subtle text-accent border-accent/20': variant === 'primary',
            'bg-bg-tertiary text-text-secondary border-border': variant === 'secondary',
            'bg-success-subtle text-success border-success/20': variant === 'success',
            'bg-warning-subtle text-warning border-warning/20': variant === 'warning',
            'bg-danger-subtle text-danger border-danger/20': variant === 'danger',
            'bg-info-subtle text-info border-info/20': variant === 'info',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
