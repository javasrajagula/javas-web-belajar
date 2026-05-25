import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={clsx('skeleton w-full h-4', className)}
      {...props}
    />
  );
};
