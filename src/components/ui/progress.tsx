import React from 'react';
import { clsx } from 'clsx';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  color?: 'accent' | 'success' | 'warning' | 'danger';
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, color = 'accent', ...props }, ref) => {
    const percentage = Math.max(0, Math.min(100, value));

    return (
      <div
        ref={ref}
        className={clsx('w-full h-2 bg-bg-tertiary rounded-full overflow-hidden', className)}
        {...props}
      >
        <div
          className={clsx('h-full rounded-full transition-all duration-300 ease-out origin-left', {
            'bg-accent': color === 'accent',
            'bg-success': color === 'success',
            'bg-warning': color === 'warning',
            'bg-danger': color === 'danger',
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';
