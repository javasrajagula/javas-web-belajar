'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUserStore } from '@/stores/user-store';
import { 
  FileText, 
  Clock, 
  Award, 
  CheckCircle, 
  XCircle, 
  Play,
  RotateCcw
} from 'lucide-react';
import { QuizQuestion, ExamSession } from '@/types';

const MOCK_DB_QUESTIONS: Record<string, QuizQuestion[]> = {
  'Keadaan Kuantum': [
    {
      id: 'ex-q1',
      question: 'Persamaan mana yang menggambarkan evolusi waktu dari suatu sistem mekanika kuantum?',
      options: ['Persamaan gelombang Schrödinger', 'Persamaan elektromagnetik Maxwell', 'Persamaan Euler-Lagrange', 'Persamaan Navier-Stokes'],
      correctOptionIndex: 0,
      explanation: 'Persamaan Schrödinger menyediakan hukum dasar perambatan waktu untuk fungsi gelombang kuantum.'
    },
    {
      id: 'ex-q2',
      question: 'Dalam notasi bra-ket Dirac, apa yang direpresentasikan oleh "ket" |ψ⟩?',
      options: ['Vektor baris konjugat kompleks', 'Vektor keadaan dalam ruang Hilbert', 'Nilai eigen kerapatan partikel terlokalisasi', 'Tensor distribusi probabilitas'],
      correctOptionIndex: 1,
      explanation: 'Vektor ket |ψ⟩ merepresentasikan vektor keadaan kolom dalam ruang Hilbert, sedangkan bra ⟨ψ| mewakili transpos konjugasinya.'
    }
  ],
  'Integrasi Kalkulus': [
    {
      id: 'ex-q3',
      question: 'Berapakah integral dari 1/x terhadap x?',
      options: ['x^2 / 2', 'ln|x| + C', 'e^x', '-1/x^2'],
      correctOptionIndex: 1,
      explanation: 'Karena turunan dari ln|x| adalah 1/x, maka integral tak tentu dari 1/x adalah ln|x| + C.'
    },
    {
      id: 'ex-q4',
      question: 'Teknik integrasi mana yang konsepnya diturunkan langsung dari aturan perkalian (product rule) pada diferensiasi?',
      options: ['Aturan substitusi variabel', 'Integrasi parsial (integration by parts)', 'Dekomposisi pecahan parsial', 'Optimasi trigonometri'],
      correctOptionIndex: 1,
      explanation: 'Integrasi parsial diturunkan langsung dari aturan diferensial perkalian: d(uv) = u dv + v du.'
    }
  ],
  'Kata Kerja Prancis': [
    {
      id: 'ex-q5',
      question: 'Terjemahkan kata kerja "menjadi (to be)" ke dalam bahasa Prancis dalam kala kini (present tense) orang ketiga jamak.',
      options: ['Ils sont', 'Ils ont', 'Ils vont', 'Ils font'],
      correctOptionIndex: 0,
      explanation: 'Kala kini dari kata kerja "être" (menjadi/to be) untuk orang ketiga jamak (mereka) adalah "ils sont". "Ils ont" adalah kala kini dari "avoir" (memiliki/to have).'
    }
  ]
};

export default function ExamEnginePage() {
  const { addXp, upgradeSkill } = useUserStore();

  // Settings configuration
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Keadaan Kuantum']);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'adaptive'>('medium');
  const [questionCount, setQuestionCount] = useState(3);

  // Active Exam status
  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [showResults, setShowResults] = useState(false);

  const timerRef = useRef<any>(null);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) => 
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleStartExam = () => {
    if (selectedTopics.length === 0) return;

    let gathered: QuizQuestion[] = [];
    selectedTopics.forEach((t) => {
      const qList = MOCK_DB_QUESTIONS[t] || [];
      gathered = [...gathered, ...qList];
    });

    const finalQuestions = gathered.sort(() => 0.5 - Math.random()).slice(0, questionCount);

    if (finalQuestions.length === 0) {
      alert('Tidak ada pertanyaan yang tersedia di bank soal untuk topik terpilih.');
      return;
    }

    const session: ExamSession = {
      id: `exam-${Date.now()}`,
      topics: selectedTopics,
      totalQuestions: finalQuestions.length,
      difficulty,
      questions: finalQuestions,
      answers: {},
      score: 0,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      speedSecsPerQuestion: 0,
      accuracy: 0
    };

    setActiveSession(session);
    setCurrentIdx(0);
    setTimeLeft(finalQuestions.length * 60); // 60s per question
    setShowResults(false);
  };

  // Timer tick
  useEffect(() => {
    if (activeSession && !showResults && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [activeSession, timeLeft, showResults]);

  const handleSelectOption = (idx: number) => {
    if (!activeSession) return;
    const qId = activeSession.questions[currentIdx].id;
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        answers: { ...prev.answers, [qId]: idx }
      };
    });
  };

  const handleSubmitExam = () => {
    if (!activeSession) return;
    clearTimeout(timerRef.current);

    let correctCount = 0;
    activeSession.questions.forEach((q) => {
      const chosen = activeSession.answers[q.id];
      if (chosen === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const elapsedSeconds = activeSession.questions.length * 60 - timeLeft;
    const accuracy = Math.round((correctCount / activeSession.questions.length) * 100);
    
    const finalSession: ExamSession = {
      ...activeSession,
      score: correctCount,
      completedAt: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      speedSecsPerQuestion: Math.round(elapsedSeconds / activeSession.questions.length),
      accuracy
    };

    setActiveSession(finalSession);
    setShowResults(true);

    const xpReward = correctCount * 50;
    addXp(xpReward);
    upgradeSkill('logic', Math.round(correctCount * 1.5));
  };

  const handleReset = () => {
    setActiveSession(null);
    setShowResults(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Config setup view */}
      {!activeSession && (
        <Card className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <FileText size={16} className="text-accent" /> Konfigurasi Mesin Ujian
            </h3>
            <p className="text-[11px] text-text-secondary">Uji pemahaman Anda dengan simulasi ujian mandiri adaptif.</p>
          </div>

          <div className="space-y-4">
            {/* Topic Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-text-secondary uppercase">Pilih Subjek Ujian</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(MOCK_DB_QUESTIONS).map((topic) => {
                  const active = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`px-3 py-1.5 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                        active
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border bg-bg-tertiary/40 hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions count and Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Jumlah Soal</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="2">2 Pertanyaan</option>
                  <option value="3">3 Pertanyaan</option>
                  <option value="5">5 Pertanyaan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Tingkat Kesulitan</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="easy">Mudah (Pengenalan Konseptual)</option>
                  <option value="medium">Sedang (Analisis & Penerapan)</option>
                  <option value="hard">Sulit (Evaluasi & Sintesis Rumus)</option>
                  <option value="adaptive">Adaptif AI (Skala Otomatis)</option>
                </select>
              </div>
            </div>

            <Button onClick={handleStartExam} disabled={selectedTopics.length === 0} className="w-full h-11 text-xs flex items-center justify-center gap-1.5 mt-2">
              <Play size={14} /> Mulai Ujian Evaluasi
            </Button>
          </div>
        </Card>
      )}

      {/* Active Exam view */}
      {activeSession && !showResults && (
        <Card className="space-y-6">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-text-tertiary uppercase">UJIAN DIAGNOSTIK ADAPTIF</span>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-text-primary">
                  Soal {currentIdx + 1} dari {activeSession.totalQuestions}
                </h3>
              </div>
            </div>
            {/* Timer */}
            <div className="flex items-center gap-1.5 text-xs text-warning bg-warning-subtle/10 border border-warning/20 px-2.5 py-1 rounded">
              <Clock size={12} />
              <span className="font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          <Progress value={((currentIdx) / activeSession.totalQuestions) * 100} className="h-1" />

          {/* Question Text */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-text-primary leading-relaxed">
              {activeSession.questions[currentIdx].question}
            </p>

            <div className="space-y-2">
              {activeSession.questions[currentIdx].options.map((opt, optIdx) => {
                const isSelected = activeSession.answers[activeSession.questions[currentIdx].id] === optIdx;
                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-3.5 border rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-accent bg-accent/5 text-text-primary'
                        : 'border-border bg-bg-tertiary/40 hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {opt}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-border/40">
            <Button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => prev - 1)}
              variant="secondary"
              className="h-8 text-xs w-20"
            >
              Sebelumnya
            </Button>

            {currentIdx < activeSession.totalQuestions - 1 ? (
              <Button
                disabled={activeSession.answers[activeSession.questions[currentIdx].id] === undefined}
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="h-8 text-xs w-20"
              >
                Berikutnya
              </Button>
            ) : (
              <Button
                disabled={Object.keys(activeSession.answers).length < activeSession.totalQuestions}
                onClick={handleSubmitExam}
                className="h-8 text-xs w-28"
              >
                Kirim Ujian
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Results Dashboard view */}
      {activeSession && showResults && (
        <div className="space-y-6">
          <Card className="p-6 text-center space-y-4 relative overflow-hidden bg-bg-secondary border border-border">
            <div className="absolute top-2 right-2">
              <Badge variant="success" className="font-mono text-[9px]">
                SELESAI
              </Badge>
            </div>

            <div className="w-12 h-12 bg-success-subtle text-success rounded-full flex items-center justify-center mx-auto">
              <Award size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary">Evaluasi Hasil Ujian</h3>
              <p className="text-xs text-text-secondary">
                Anda mendapatkan <span className="text-accent font-bold font-mono">+{activeSession.score * 50} XP</span> dan meningkatkan status Logika.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-4 border-y border-border/40 max-w-md mx-auto font-mono">
              <div>
                <span className="text-[10px] text-text-tertiary block">SKOR</span>
                <span className="text-sm font-bold text-text-primary">
                  {activeSession.score} / {activeSession.totalQuestions}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-tertiary block">AKURASI</span>
                <span className="text-sm font-bold text-success">
                  {activeSession.accuracy}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-tertiary block">KECEPATAN</span>
                <span className="text-sm font-bold text-info">
                  {activeSession.speedSecsPerQuestion}s / Soal
                </span>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button onClick={handleReset} className="flex items-center gap-1 h-9 text-xs">
                <RotateCcw size={13} /> Reset Mesin Ujian
              </Button>
            </div>
          </Card>

          {/* Detailed corrections reviews */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest pl-1">Tinjauan Pertanyaan</span>
            
            {activeSession.questions.map((q, idx) => {
              const chosen = activeSession.answers[q.id];
              const isCorrect = chosen === q.correctOptionIndex;

              return (
                <Card key={q.id} className="space-y-3 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-text-secondary font-mono">SOAL {idx + 1}</span>
                    <Badge variant={isCorrect ? 'success' : 'danger'} className="text-[9px] flex items-center gap-1">
                      {isCorrect ? 'Benar' : 'Salah'}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-text-primary">{q.question}</p>

                  <div className="text-xs space-y-1">
                    <div className="flex justify-between text-text-secondary">
                      <span>Jawaban Anda:</span>
                      <span className={isCorrect ? 'text-success font-semibold' : 'text-danger font-semibold'}>
                        {q.options[chosen] || 'Belum Dijawab'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="flex justify-between text-text-secondary">
                        <span>Jawaban Benar:</span>
                        <span className="text-success font-semibold">{q.options[q.correctOptionIndex]}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-bg-tertiary/40 rounded border border-border text-[11px] text-text-secondary leading-relaxed mt-2">
                    <span className="font-bold text-text-primary">Penjelasan:</span> {q.explanation}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
