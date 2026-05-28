'use client';

import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'auto';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'auto',
  className
}) => {
  const percentage = Math.max(0, Math.min(100, value));

  let fillClass = 'bg-primary';
  if (color === 'auto') {
    if (percentage < 40) fillClass = 'bg-danger';
    else if (percentage < 70) fillClass = 'bg-warning';
    else fillClass = 'bg-success';
  } else {
    fillClass = {
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
      info: 'bg-info',
    }[color];
  }

  return (
    <div className={clsx('w-full h-2 bg-bg-tertiary rounded-full overflow-hidden', className)}>
      <div
        className={clsx('h-full rounded-full transition-all duration-500 ease-out origin-left', fillClass)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
export default ProgressBar;
