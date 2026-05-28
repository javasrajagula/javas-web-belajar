'use client';

import React from 'react';
import { Card } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { ArrowRight, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface JurusanCardProps {
  nama: string;
  kode: string;
  bidang: string;
  icon: string;
  warna: string;
  popular?: boolean;
  isActive?: boolean;
  mapelCount?: number;
  onClick?: () => void;
  className?: string;
}

export const JurusanCard: React.FC<JurusanCardProps> = ({
  nama,
  kode,
  bidang,
  icon,
  warna,
  popular = false,
  isActive = false,
  mapelCount = 9,
  onClick,
  className
}) => {
  return (
    <Card 
      className={clsx(
        'relative border border-border bg-bg-secondary/40 hover:bg-bg-secondary/60 hover:border-primary/20 transition-all flex flex-col justify-between p-5 min-h-[220px] select-none',
        className
      )}
    >
      {/* Colored top strip */}
      <div 
        className="absolute top-0 inset-x-0 h-1.5"
        style={{ backgroundColor: warna }}
      ></div>

      <div className="space-y-4">
        {/* Header Icon & Badges */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-2xl">{icon}</span>
          <div className="flex gap-1.5">
            {popular && (
              <Badge className="text-[8px] font-bold bg-accent-subtle border-accent/25 text-accent font-mono">
                POPULER
              </Badge>
            )}
            <Badge variant="secondary" className="text-[8px] font-mono">
              {kode}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xs font-extrabold text-white leading-snug">{nama}</h3>
          <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider block mt-1">
            {bidang}
          </span>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="border-t border-border/20 pt-4 mt-5 flex justify-between items-center">
        <span className="text-[9px] font-mono text-text-tertiary">
          {mapelCount} Mata Pelajaran
        </span>

        {isActive ? (
          <Badge variant="success" className="text-[9px] font-bold py-1 px-2.5 flex items-center gap-1">
            <Check size={10} /> Aktif
          </Badge>
        ) : (
          <Button 
            onClick={onClick}
            size="sm" 
            className="h-7 text-[10px] px-3 font-bold flex items-center gap-1 bg-primary hover:bg-primary-hover text-white"
          >
            Pilih Jurusan <ArrowRight size={10} />
          </Button>
        )}
      </div>
    </Card>
  );
};
export default JurusanCard;
