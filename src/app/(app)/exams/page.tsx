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
  'Eksponen dan Logaritma': [
    {
      id: 'ex-mat10-q1',
      question: 'Berapakah nilai x dari persamaan eksponen 3^(2x - 1) = 27?',
      options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'],
      correctOptionIndex: 1,
      explanation: '3^(2x - 1) = 27 -> 3^(2x - 1) = 3^3 -> 2x - 1 = 3 -> 2x = 4 -> x = 2.'
    },
    {
      id: 'ex-mat10-q2',
      question: 'Jika ${^3}\\log(x) = 4, berapakah nilai x?',
      options: ['x = 12', 'x = 64', 'x = 81', 'x = 243'],
      correctOptionIndex: 2,
      explanation: 'Berdasarkan definisi logaritma, ${^3}\\log(x) = 4 setara dengan x = 3^4 = 81.'
    }
  ],
  'Kimia Hijau': [
    {
      id: 'ex-kim10-q1',
      question: 'Manakah di bawah ini yang bukan merupakan salah satu dari 12 prinsip Kimia Hijau?',
      options: ['Mencegah terbentuknya limbah', 'Memaksimalkan efisiensi ekonomi atom', 'Menggunakan bahan baku kimia tak terbarukan', 'Merancang sintesis kimia yang kurang berbahaya'],
      correctOptionIndex: 2,
      explanation: 'Kimia Hijau mendorong penggunaan bahan baku terbarukan, bukan bahan baku tak terbarukan.'
    }
  ],
  'Fungsi Komposisi & Invers': [
    {
      id: 'ex-mat11-q1',
      question: 'Diketahui f(x) = x^2 dan g(x) = x - 2. Berapakah rumus fungsi komposisi (f o g)(x)?',
      options: ['x^2 - 2', 'x^2 - 4x + 4', 'x^2 - 4', 'x^2 + 4x - 4'],
      correctOptionIndex: 1,
      explanation: '(f o g)(x) = f(g(x)) = (x - 2)^2 = x^2 - 4x + 4.'
    }
  ],
  'Object-Oriented Programming': [
    {
      id: 'ex-smk-q1',
      question: 'Pewarisan properti dan metode dari suatu Class induk ke Class anak dalam pemrograman OOP disebut dengan istilah...',
      options: ['Encapsulation', 'Polymorphism', 'Abstraction', 'Inheritance'],
      correctOptionIndex: 3,
      explanation: 'Inheritance (Pewarisan) memungkinkan suatu kelas anak menyalin atribut dan metode milik kelas induk.'
    }
  ],
  'Turunan Fungsi Aljabar': [
    {
      id: 'ex-mat12-q1',
      question: 'Berapakah turunan pertama dari fungsi f(x) = 4x^3 - 2x^2 + 7x?',
      options: ['f\'(x) = 12x^2 - 4x + 7', 'f\'(x) = 12x^2 - 4x', 'f\'(x) = 4x^2 - 2x + 7', 'f\'(x) = 12x^3 - 4x^2 + 7'],
      correctOptionIndex: 0,
      explanation: 'd/dx(4x^3) = 12x^2, d/dx(-2x^2) = -4x, d/dx(7x) = 7. Maka f\'(x) = 12x^2 - 4x + 7.'
    }
  ],
  'Sel Volta & Elektrokimia': [
    {
      id: 'ex-kim12-q1',
      question: 'Logam Cu (E0 = +0,34 V) dan logam Zn (E0 = -0,76 V) dirangkai dalam Sel Volta. Berapakah nilai potensial sel standar (E0 sel) yang dihasilkan?',
      options: ['+0,42 V', '-0,42 V', '+1,10 V', '-1,10 V'],
      correctOptionIndex: 2,
      explanation: 'E0 sel = E0 katode (reduksi) - E0 anode (oksidasi) = (+0,34) - (-0,76) = +1,10 V.'
    }
  ]
};

export default function ExamEnginePage() {
  const { addXp, upgradeSkill } = useUserStore();

  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Eksponen dan Logaritma']);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'adaptive'>('medium');
  const [questionCount, setQuestionCount] = useState(3);

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
    setTimeLeft(finalQuestions.length * 60);
    setShowResults(false);
  };

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
      {!activeSession && (
        <Card className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <FileText size={16} className="text-accent" /> Evaluasi Kompetensi Nasional
            </h3>
            <p className="text-[11px] text-text-secondary">Uji pemahaman Anda terhadap silabus SMA & SMK Kurikulum Merdeka terbaru.</p>
          </div>

          <div className="space-y-4">
            {/* Topic Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-text-secondary uppercase">Pilih Subjek Evaluasi</label>
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
                  <option value="1">1 Pertanyaan</option>
                  <option value="2">2 Pertanyaan</option>
                  <option value="3">3 Pertanyaan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Kesulitan Kurikulum</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="easy">Kelas 10 (Fase E - Dasar)</option>
                  <option value="medium">Kelas 11 (Fase F - Menengah)</option>
                  <option value="hard">Kelas 12 (Fase F - Lanjut)</option>
                  <option value="adaptive">Evaluasi Mandiri Adaptif</option>
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
              <span className="text-[10px] font-mono text-text-tertiary uppercase">UJIAN DIAGNOSTIK NASIONAL</span>
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
                <RotateCcw size={13} /> Reset Ujian
              </Button>
            </div>
          </Card>

          {/* Detailed corrections reviews */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest pl-1">Tinjauan Soal</span>
            
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
