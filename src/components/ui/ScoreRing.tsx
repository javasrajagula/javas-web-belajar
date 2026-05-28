'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ScoreRingProps {
  score: number; // 0 to 100
  size?: number; // size in pixels
  strokeWidth?: number;
  className?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 120,
  strokeWidth = 8,
  className
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorClass = score >= 75 
    ? 'stroke-success' 
    : score >= 50 
      ? 'stroke-warning' 
      : 'stroke-danger';

  return (
    <div className={clsx('relative flex items-center justify-center select-none', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-bg-tertiary"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated fill circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={colorClass}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold text-white font-mono leading-none">{score}</span>
        <span className="text-[8px] text-text-tertiary mt-1 font-mono uppercase tracking-wider">Nilai</span>
      </div>
    </div>
  );
};
export default ScoreRing;
