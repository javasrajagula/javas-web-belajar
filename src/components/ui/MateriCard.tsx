'use client';

import React from 'react';
import { FileText, PlayCircle, FileDown, BookOpen, CheckCircle, ArrowRight, Lock } from 'lucide-react';
import { clsx } from 'clsx';

interface MateriCardProps {
  title: string;
  type: string; // 'teks' | 'video' | 'pdf' | 'ringkasan'
  status?: 'completed' | 'active' | 'unlocked' | 'locked';
  onClick?: () => void;
  className?: string;
}

export const MateriCard: React.FC<MateriCardProps> = ({
  title,
  type,
  status = 'unlocked',
  onClick,
  className
}) => {
  // Select icon based on type
  const getTypeIcon = () => {
    switch (type) {
      case 'video':
        return PlayCircle;
      case 'pdf':
        return FileDown;
      case 'ringkasan':
        return BookOpen;
      default:
        return FileText;
    }
  };

  const Icon = getTypeIcon();

  const statusIcons = {
    completed: <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />,
    active: <ArrowRight className="w-3.5 h-3.5 text-primary animate-pulse flex-shrink-0" />,
    unlocked: <div className="w-3.5 h-3.5 rounded-full border border-border/80 flex-shrink-0" />,
    locked: <Lock className="w-3 h-3 text-text-muted flex-shrink-0" />
  };

  return (
    <div
      onClick={status !== 'locked' ? onClick : undefined}
      className={clsx(
        'p-3 border rounded-lg flex items-center justify-between gap-3 transition-all select-none',
        status === 'locked' ? 'opacity-50 cursor-not-allowed border-border/40 bg-bg-tertiary/5' : 'cursor-pointer',
        status === 'active' 
          ? 'border-primary bg-primary-subtle/10 text-white font-semibold' 
          : 'border-border/60 bg-bg-tertiary/10 text-text-secondary hover:border-border hover:bg-bg-tertiary/20 hover:text-white',
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className={clsx('w-4 h-4 flex-shrink-0', status === 'active' ? 'text-primary' : 'text-text-tertiary')} />
        <span className="text-[11px] truncate leading-none">{title}</span>
      </div>
      {statusIcons[status]}
    </div>
  );
};
export default MateriCard;
