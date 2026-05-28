'use client';

import React from 'react';
import { Card } from './card';
import { clsx } from 'clsx';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon: Icon,
  description,
  className
}) => {
  return (
    <Card className={clsx('p-4 border border-border bg-bg-secondary/20 flex flex-col justify-between hover:border-primary/30 transition-all duration-200 shadow-xs', className)}>
      <div className="flex justify-between items-start gap-4">
        <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider">{label}</span>
        <div className="p-1 rounded bg-bg-tertiary text-primary flex items-center justify-center">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="mt-3.5">
        <h3 className="text-xl font-bold font-mono text-white leading-tight">{value}</h3>
        {description && (
          <p className="text-[10px] text-text-tertiary mt-1 leading-normal">{description}</p>
        )}
      </div>
    </Card>
  );
};
export default StatsCard;
