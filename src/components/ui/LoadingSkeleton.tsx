'use client';

import React from 'react';
import { clsx } from 'clsx';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'reader' | 'circle' | 'line';
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  className
}) => {
  if (variant === 'circle') {
    return (
      <div className={clsx('skeleton rounded-full', className)} />
    );
  }

  if (variant === 'list') {
    return (
      <div className={clsx('space-y-3 w-full', className)}>
        <div className="skeleton h-8 w-full" />
        <div className="skeleton h-8 w-5/6" />
        <div className="skeleton h-8 w-4/5" />
      </div>
    );
  }

  if (variant === 'reader') {
    return (
      <div className={clsx('space-y-4 w-full p-4', className)}>
        <div className="skeleton h-8 w-1/3" />
        <div className="skeleton h-4 w-1/4" />
        <div className="space-y-2 mt-4">
          <div className="skeleton h-3.5 w-full" />
          <div className="skeleton h-3.5 w-full" />
          <div className="skeleton h-3.5 w-5/6" />
          <div className="skeleton h-3.5 w-11/12" />
        </div>
        <div className="skeleton h-40 w-full mt-6" />
      </div>
    );
  }

  if (variant === 'line') {
    return (
      <div className={clsx('skeleton h-3 w-full', className)} />
    );
  }

  // Card Variant default
  return (
    <div className={clsx('p-5 border border-border bg-bg-secondary/40 rounded-xl space-y-3.5', className)}>
      <div className="flex justify-between items-center">
        <div className="skeleton h-4 w-1/4" />
        <div className="skeleton h-4 w-8 rounded-full" />
      </div>
      <div className="skeleton h-3.5 w-5/6" />
      <div className="skeleton h-3 w-2/3" />
      <div className="flex justify-between items-center border-t border-border/20 pt-3 mt-2">
        <div className="skeleton h-3 w-12" />
        <div className="skeleton h-7 w-20" />
      </div>
    </div>
  );
};
export default LoadingSkeleton;
