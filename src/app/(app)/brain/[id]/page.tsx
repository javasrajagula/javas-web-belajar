'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMaterialsStore } from '@/stores/materials-store';
import { useUserStore } from '@/stores/user-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CheckCircle, 
  RotateCw,
  CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function BrainDetailPage({ params }: any) {
  const router = useRouter();
  const resolvedParams = use<{ id: string }>(params);
  const { id } = resolvedParams;
  const { materials, updateFlashcardStatus } = useMaterialsStore();
  const { addXp, upgradeSkill, updateQuestProgress } = useUserStore();

  const material = materials.find((m) => m.id === id);

  const [activeTab, setActiveTab] = useState<'ringkasan' | 'kuis' | 'kartu' | 'linimasa'>('ringkasan');

  // Kuis States
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState<Record<string, boolean>>({});

  // Kartu Belajar States
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  if (!material) {
    return (
      <div className="text-center py-20">
        <h2 className="text-sm font-bold text-danger">Materi Tidak Ditemukan</h2>
        <p className="text-xs text-text-secondary mt-2">Materi yang Anda minta tidak dapat ditemukan di penyimpanan lokal.</p>
        <Link href="/brain" className="mt-4 inline-block">
          <Button size="sm" variant="secondary">Kembali ke Otak Kedua</Button>
        </Link>
      </div>
    );
  }

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submittedQuizzes[questionId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = (questionId: string, correctIdx: number) => {
    if (selectedAnswers[questionId] === undefined) return;
    setSubmittedQuizzes((prev) => ({ ...prev, [questionId]: true }));
    
    const isCorrect = selectedAnswers[questionId] === correctIdx;
    if (isCorrect) {
      addXp(30);
      upgradeSkill('logic', 2);
      updateQuestProgress('quiz', 1);
    } else {
      addXp(5);
    }
  };

  const handleToggleFlashcard = (cardId: string) => {
    setFlippedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const handleMarkMastered = (cardId: string, currentlyMastered: boolean) => {
    updateFlashcardStatus(material.id, cardId, !currentlyMastered);
    addXp(15);
    upgradeSkill('focus', 1);
  };

  return (
    <div className="space-y-6">
      {/* Detail Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary border border-border p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <Link href="/brain">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-sm font-bold text-text-primary">{material.title}</h1>
            <p className="text-[10px] text-text-secondary mt-0.5">{material.fileName} • {material.fileSize}</p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex gap-1.5 bg-bg-tertiary/60 p-1 rounded-md border border-border">
          {[
            { id: 'ringkasan', label: 'Ringkasan' },
            { id: 'kuis', label: 'Kuis AI' },
            { id: 'kartu', label: 'Kartu Memori' },
            { id: 'linimasa', label: 'Linimasa' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 text-[11px] font-semibold rounded cursor-pointer transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="w-full">
        {/* RINGKASAN */}
        {activeTab === 'ringkasan' && (
          <Card className="p-6 md:p-8 bg-bg-secondary border border-border max-w-3xl mx-auto prose prose-invert prose-xs">
            <ReactMarkdown>{material.summary}</ReactMarkdown>
          </Card>
        )}

        {/* KUIS */}
        {activeTab === 'kuis' && (
          <div className="max-w-xl mx-auto space-y-4">
            {material.quizzes.length > 0 ? (
              material.quizzes.map((q, idx) => {
                const selected = selectedAnswers[q.id];
                const submitted = submittedQuizzes[q.id];
                const isCorrect = selected === q.correctOptionIndex;

                return (
                  <Card key={q.id} className="space-y-4">
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-xs font-bold text-text-secondary font-mono">PERTANYAAN {idx + 1}</span>
                      {submitted && (
                        <Badge variant={isCorrect ? 'success' : 'danger'}>
                          {isCorrect ? 'Benar +30 XP' : 'Salah'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-text-primary">{q.question}</p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selected === optIdx;
                        let optionClass = 'border-border bg-bg-tertiary/40 hover:bg-bg-tertiary text-text-secondary hover:text-text-primary';

                        if (submitted) {
                          if (optIdx === q.correctOptionIndex) {
                            optionClass = 'border-success bg-success-subtle text-success';
                          } else if (isSelected) {
                            optionClass = 'border-danger bg-danger-subtle text-danger';
                          } else {
                            optionClass = 'border-border bg-bg-tertiary/20 text-text-tertiary opacity-60';
                          }
                        } else if (isSelected) {
                          optionClass = 'border-accent bg-accent/5 text-text-primary';
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`p-3 border rounded text-xs cursor-pointer transition-all duration-150 flex items-center justify-between ${optionClass}`}
                          >
                            <span>{opt}</span>
                            {submitted && optIdx === q.correctOptionIndex && <CheckCircle size={14} className="text-success" />}
                          </div>
                        );
                      })}
                    </div>

                    {!submitted ? (
                      <Button
                        onClick={() => handleSubmitQuiz(q.id, q.correctOptionIndex)}
                        disabled={selected === undefined}
                        className="w-full h-9 text-xs"
                      >
                        Kirim Jawaban
                      </Button>
                    ) : (
                      <div className="p-3 bg-bg-tertiary/40 rounded border border-border text-[11px] text-text-secondary leading-relaxed">
                        <span className="font-bold text-text-primary">Penjelasan:</span> {q.explanation}
                      </div>
                    )}
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-10 text-xs text-text-secondary">
                Tidak ada kuis yang tersedia untuk materi ini.
              </div>
            )}
          </div>
        )}

        {/* KARTU BELAJAR */}
        {activeTab === 'kartu' && (
          <div className="max-w-md mx-auto space-y-6">
            {material.flashcards.length > 0 ? (
              material.flashcards.map((fc) => {
                const flipped = flippedCards[fc.id] || false;
                return (
                  <Card key={fc.id} className="space-y-4">
                    <div
                      onClick={() => handleToggleFlashcard(fc.id)}
                      className="h-44 w-full rounded border border-border bg-bg-tertiary/30 hover:bg-bg-tertiary/60 transition-all duration-200 cursor-pointer flex items-center justify-center p-6 text-center select-none"
                    >
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono text-text-tertiary tracking-widest uppercase">
                          {flipped ? 'Jawaban / Belakang' : 'Pertanyaan / Depan'}
                        </span>
                        <p className="text-xs font-medium text-text-primary leading-relaxed">
                          {flipped ? fc.back : fc.front}
                        </p>
                        <span className="text-[9px] text-accent flex items-center justify-center gap-1 mt-3">
                          <RotateCw size={10} /> Ketuk untuk membalik kartu
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleMarkMastered(fc.id, fc.mastered)}
                        variant={fc.mastered ? 'success' : 'outline'}
                        className="flex-1 h-8 text-[11px] flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={12} /> {fc.mastered ? 'Dikuasai +15 XP' : 'Tandai Selesai Dipelajari'}
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-10 text-xs text-text-secondary">
                Tidak ada kartu belajar yang tersedia untuk materi ini.
              </div>
            )}
          </div>
        )}

        {/* LINIMASA */}
        {activeTab === 'linimasa' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="relative border-l border-border pl-6 ml-4 space-y-8">
              {material.timeline.map((event) => (
                <div key={event.id} className="relative">
                  <span className="absolute -left-[30px] top-1 bg-accent border-4 border-bg-primary w-4.5 h-4.5 rounded-full" />
                  
                  <Card className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-accent">{event.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-text-primary">{event.title}</h4>
                    <p className="text-[11px] text-text-secondary leading-relaxed">{event.description}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
