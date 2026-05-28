'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle2 } from 'lucide-react';

interface ChatFlashcardProps {
  rawContent: string; // Format: frontText | backText
}

export default function ChatFlashcard({ rawContent }: ChatFlashcardProps) {
  const parts = rawContent.split('|').map(p => p.trim());
  const [front = '', back = ''] = parts;
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState(false);
  
  if (parts.length < 2) {
    return (
      <div className="p-3 border border-border bg-bg-tertiary/40 rounded-lg text-[10px] text-text-secondary">
        Format Flashcard Tidak Valid.
      </div>
    );
  }

  return (
    <div className="my-4 max-w-sm w-full perspective-1000 select-none">
      <div
        onClick={() => setIsFlipped(f => !f)}
        className={`relative w-full h-44 cursor-pointer transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Side */}
        <Card className="absolute inset-0 backface-hidden border border-border bg-bg-secondary p-5 flex flex-col justify-between shadow-md">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <span className="text-[9px] font-mono font-bold text-text-tertiary uppercase tracking-wider">KARTU HAFALAN CEPAT</span>
            <Eye size={12} className="text-text-tertiary" />
          </div>
          <div className="flex-1 flex items-center justify-center py-2">
            <p className="text-xs font-bold text-text-primary text-center leading-relaxed">{front}</p>
          </div>
          <span className="text-[8px] text-text-tertiary text-center font-mono">KLIK UNTUK MEMBALIK KARTU</span>
        </Card>

        {/* Back Side */}
        <Card className="absolute inset-0 backface-hidden rotate-y-180 border border-accent/30 bg-bg-tertiary p-5 flex flex-col justify-between shadow-md">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <span className="text-[9px] font-mono font-bold text-accent uppercase tracking-wider">KUNCI JAWABAN</span>
            <CheckCircle2 size={12} className="text-accent" />
          </div>
          <div className="flex-1 flex items-center justify-center py-2">
            <p className="text-xs font-semibold text-text-primary text-center leading-relaxed">{back}</p>
          </div>
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <Button
              onClick={() => setKnown(true)}
              variant={known ? 'secondary' : 'primary'}
              size="sm"
              className="h-6 px-3 text-[9px] font-mono"
            >
              {known ? '✓ Saya Paham!' : 'Sudah Paham?'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
