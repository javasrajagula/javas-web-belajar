'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface ChatQuizProps {
  rawContent: string; //Format: question | option1 | option2 | option3 | option4 | correctIndex | explanation
  onCorrect: () => void;
}

export default function ChatQuizCard({ rawContent, onCorrect }: ChatQuizProps) {
  const parts = rawContent.split('|').map(p => p.trim());
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  if (parts.length < 7) {
    return (
      <div className="p-3 border border-border bg-bg-tertiary/40 rounded-lg text-[10px] text-text-secondary">
        Format Kuis Tidak Valid.
      </div>
    );
  }

  const [question, opt1, opt2, opt3, opt4, correctIndexStr, explanation] = parts;
  const options = [opt1, opt2, opt3, opt4];
  const correctIndex = parseInt(correctIndexStr) || 0;

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelectedIdx(idx);
  };

  const handleSubmit = () => {
    if (selectedIdx === null || submitted) return;
    setSubmitted(true);
    if (selectedIdx === correctIndex) {
      onCorrect();
    }
  };

  const isCorrect = selectedIdx === correctIndex;

  return (
    <Card className="my-4 border border-border bg-bg-secondary p-5 space-y-4 shadow-md max-w-md">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <HelpCircle size={15} className="text-primary" />
        <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider">KUIS EVALUASI AI</span>
      </div>

      {/* Question */}
      <p className="text-xs font-bold text-text-primary leading-relaxed">{question}</p>

      {/* Options */}
      <div className="space-y-2">
        {options.map((opt, idx) => {
          let btnClass = 'border-border bg-bg-tertiary/40 text-text-secondary hover:bg-bg-tertiary hover:text-text-primary';
          
          if (selectedIdx === idx) {
            btnClass = 'border-primary bg-primary/10 text-primary font-semibold';
          }

          if (submitted) {
            if (idx === correctIndex) {
              btnClass = 'border-success bg-success/15 text-success font-semibold';
            } else if (selectedIdx === idx) {
              btnClass = 'border-danger bg-danger/15 text-danger font-semibold';
            } else {
              btnClass = 'border-border/30 bg-bg-tertiary/10 text-text-tertiary cursor-not-allowed';
            }
          }

          return (
            <button
              key={idx}
              disabled={submitted}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-3 rounded-lg border text-xs transition-all duration-150 flex items-center justify-between ${btnClass}`}
            >
              <span>{opt}</span>
              {submitted && idx === correctIndex && <CheckCircle2 size={13} className="text-success flex-shrink-0 ml-2" />}
              {submitted && selectedIdx === idx && idx !== correctIndex && <AlertCircle size={13} className="text-danger flex-shrink-0 ml-2" />}
            </button>
          );
        })}
      </div>

      {/* Action button */}
      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={selectedIdx === null}
          size="sm"
          className="w-full h-8 text-[11px]"
        >
          Kirim Jawaban
        </Button>
      )}

      {/* Explanation & Results */}
      {submitted && (
        <div className={`p-3 rounded-lg border text-[11px] leading-relaxed animate-fade-in ${
          isCorrect ? 'border-success/30 bg-success/5 text-success' : 'border-danger/30 bg-danger/5 text-text-secondary'
        }`}>
          <div className="font-bold flex items-center gap-1.5 mb-1 text-xs">
            {isCorrect ? (
              <>🎉 Jawaban Benar! (+50 XP)</>
            ) : (
              <>❌ Jawaban Kurang Tepat</>
            )}
          </div>
          <p className="text-text-secondary">{explanation}</p>
        </div>
      )}
    </Card>
  );
}
