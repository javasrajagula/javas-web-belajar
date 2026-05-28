'use client';

import React from 'react';
import { Card } from './card';
import { Button } from './button';
import { Inbox } from 'lucide-react';
import { clsx } from 'clsx';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  cta?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  cta,
  className
}) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/80 rounded-xl bg-bg-secondary/10 min-h-[260px]', className)}>
      <div className="p-3 bg-bg-tertiary/50 text-text-tertiary rounded-full flex items-center justify-center mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xs font-bold text-white tracking-wide">{title}</h3>
      <p className="text-[11px] text-text-secondary max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>
      {cta && (
        <Button 
          onClick={cta.onClick} 
          size="sm" 
          className="mt-4 h-8 px-4 text-[10px] font-bold"
        >
          {cta.label}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
