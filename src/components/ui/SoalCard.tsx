'use client';

import React from 'react';
import { Card } from './card';
import { Badge } from './badge';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface Soal {
  id: string;
  pertanyaan: string;
  tipe: string;
  pilihan: string[] | null;
  jawabanBenar: string;
  pembahasan: string;
  tingkat: string;
}

interface SoalCardProps {
  soal: Soal;
  index: number;
  userAnswer?: string;
  onAnswer?: (val: string) => void;
  showExplanation?: boolean;
  className?: string;
}

export const SoalCard: React.FC<SoalCardProps> = ({
  soal,
  index,
  userAnswer = '',
  onAnswer,
  showExplanation = false,
  className
}) => {
  const handleOptionClick = (val: string) => {
    if (onAnswer) onAnswer(val);
  };

  return (
    <Card className={clsx('p-5 border border-border bg-bg-secondary/40 flex flex-col gap-3.5', className)}>
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border/20 pb-2">
        <span className="text-xs font-mono font-bold text-text-tertiary">SOAL {index + 1}</span>
        <div className="flex gap-1.5">
          <Badge variant="primary" className="text-[8px] bg-primary-subtle text-primary border-primary/20 uppercase tracking-wider font-mono">
            {soal.tipe.replace('_', ' ')}
          </Badge>
          <Badge variant={soal.tingkat === 'mudah' ? 'success' : soal.tingkat === 'sedang' ? 'warning' : 'danger'} className="text-[8px] uppercase tracking-wider font-mono">
            {soal.tingkat}
          </Badge>
        </div>
      </div>

      {/* Pertanyaan */}
      <p className="text-xs font-medium text-white leading-relaxed whitespace-pre-line bg-bg-tertiary/10 p-3 rounded-lg border border-border/30">
        {soal.pertanyaan}
      </p>

      {/* Pilihan / Answer Options */}
      <div className="space-y-2">
        {soal.tipe === 'pilihan_ganda' && soal.pilihan && (
          <div className="grid grid-cols-1 gap-2">
            {soal.pilihan.map((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              const isSelected = userAnswer === letter;
              const isCorrectChoice = soal.jawabanBenar.trim().startsWith(letter) || soal.jawabanBenar.trim() === letter;

              let btnClass = 'border-border bg-bg-tertiary/10 text-text-secondary hover:border-primary/45 hover:bg-bg-tertiary/30';
              if (isSelected) {
                btnClass = 'border-primary bg-primary-subtle/10 text-white font-semibold';
              }
              if (showExplanation) {
                if (isCorrectChoice) {
                  btnClass = 'border-success bg-success-subtle text-success font-semibold';
                } else if (isSelected) {
                  btnClass = 'border-danger bg-danger-subtle text-danger font-semibold';
                } else {
                  btnClass = 'border-border/30 bg-bg-tertiary/5 text-text-tertiary opacity-50 cursor-not-allowed';
                }
              }

              return (
                <div
                  key={oIdx}
                  onClick={() => !showExplanation && handleOptionClick(letter)}
                  className={clsx('p-3 border rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-150', btnClass)}
                >
                  <span className={clsx('w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold', 
                    isSelected ? 'bg-primary text-white' : 'bg-bg-hover text-text-tertiary'
                  )}>
                    {letter}
                  </span>
                  <span className="text-xs leading-relaxed">{opt}</span>
                </div>
              );
            })}
          </div>
        )}

        {soal.tipe === 'benar_salah' && (
          <div className="grid grid-cols-2 gap-3">
            {['Benar', 'Salah'].map((val) => {
              const isSelected = userAnswer === val;
              const isCorrectVal = val.toLowerCase() === soal.jawabanBenar.toLowerCase();

              let btnStyle = isSelected ? 'bg-primary border-primary text-white' : 'bg-bg-tertiary/20 border-border text-text-secondary hover:bg-bg-tertiary/40';
              if (showExplanation) {
                if (isCorrectVal) {
                  btnStyle = 'bg-success text-white border-success';
                } else if (isSelected) {
                  btnStyle = 'bg-danger text-white border-danger';
                } else {
                  btnStyle = 'bg-bg-tertiary/5 border-border/30 text-text-tertiary opacity-50 cursor-not-allowed';
                }
              }

              return (
                <button
                  key={val}
                  disabled={showExplanation}
                  onClick={() => handleOptionClick(val)}
                  className={clsx('h-11 border rounded-lg text-xs font-bold transition-all cursor-pointer', btnStyle)}
                >
                  {val}
                </button>
              );
            })}
          </div>
        )}

        {soal.tipe === 'essay' && (
          <textarea
            disabled={showExplanation}
            rows={4}
            value={userAnswer}
            onChange={(e) => handleOptionClick(e.target.value)}
            placeholder="Tuliskan jawaban uraian Anda..."
            className="w-full p-3 bg-bg-tertiary/50 border border-border rounded-lg text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted leading-relaxed"
          />
        )}

        {soal.tipe === 'isian' && (
          <input
            disabled={showExplanation}
            type="text"
            value={userAnswer}
            onChange={(e) => handleOptionClick(e.target.value)}
            placeholder="Tuliskan isian singkat..."
            className="w-full h-10 px-3 bg-bg-tertiary/50 border border-border rounded-lg text-xs text-white focus:outline-none focus:border-primary"
          />
        )}
      </div>

      {/* Explanation Box */}
      {showExplanation && (
        <div className={clsx('p-3 rounded-lg border text-[11px] leading-relaxed mt-1 animate-fade-in', 
          userAnswer.trim().toLowerCase() === soal.jawabanBenar.trim().toLowerCase()
            ? 'border-success/30 bg-success/5 text-success'
            : 'border-danger/30 bg-danger/5 text-text-secondary'
        )}>
          <div className="font-bold flex items-center gap-1.5 mb-1.5 text-xs">
            {userAnswer.trim().toLowerCase() === soal.jawabanBenar.trim().toLowerCase() ? (
              <>🎉 Benar!</>
            ) : (
              <>❌ Jawaban Tepat: {soal.jawabanBenar}</>
            )}
          </div>
          <p>
            <strong className="text-white block font-semibold mb-0.5">Pembahasan:</strong>
            {soal.pembahasan}
          </p>
        </div>
      )}
    </Card>
  );
};
export default SoalCard;
