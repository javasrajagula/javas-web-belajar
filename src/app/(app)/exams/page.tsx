'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUserStore } from '@/stores/user-store';
import { getSubjectsByPathway } from '@/lib/curriculum-data';
import { 
  FileText, Clock, Award, CheckCircle, XCircle, Play,
  RotateCcw, AlertCircle, Brain, Zap, Filter, Star
} from 'lucide-react';
import { QuizQuestion, ExamSession } from '@/types';

// Extended question bank from curriculum data
const STATIC_BANK: Record<string, QuizQuestion[]> = {
  'Eksponen dan Logaritma': [
    { id: 'ex-mat10-q1', question: 'Berapakah nilai x dari persamaan eksponen $3^{2x - 1} = 27$?', options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'], correctOptionIndex: 1, explanation: '$3^{2x-1} = 3^3 \\Rightarrow 2x-1 = 3 \\Rightarrow x = 2$.' },
    { id: 'ex-mat10-q2', question: 'Nilai dari $^3\\log(81)$ adalah...', options: ['2', '3', '4', '5'], correctOptionIndex: 2, explanation: '$3^4 = 81$, maka $^3\\log(81) = 4$.' },
    { id: 'ex-mat10-q3', question: 'Jika $2^x = 32$, maka nilai $x$ adalah...', options: ['3', '4', '5', '6'], correctOptionIndex: 2, explanation: '$2^5 = 32$, maka $x = 5$.' },
  ],
  'Kimia Hijau': [
    { id: 'ex-kim10-q1', question: 'Manakah yang bukan merupakan prinsip Kimia Hijau?', options: ['Mencegah terbentuknya limbah', 'Efisiensi ekonomi atom', 'Menggunakan bahan baku tak terbarukan', 'Sintesis kimia yang aman'], correctOptionIndex: 2, explanation: 'Kimia Hijau mendorong bahan baku terbarukan, bukan yang tak terbarukan.' },
    { id: 'ex-kim10-q2', question: 'Tujuan utama Kimia Hijau dalam konteks SDGs adalah...', options: ['Meningkatkan produksi kimia', 'Mengurangi biaya produksi', 'Mengurangi dampak lingkungan dan zat berbahaya', 'Mempercepat reaksi kimia'], correctOptionIndex: 2, explanation: 'Kimia Hijau berfokus pada keberlanjutan lingkungan sesuai SDG 12 dan 13.' },
  ],
  'Fungsi Komposisi & Invers': [
    { id: 'ex-mat11-q1', question: 'Jika $f(x) = x^2$ dan $g(x) = x - 2$, maka $(f \\circ g)(x) =$...', options: ['$x^2 - 2$', '$x^2 - 4x + 4$', '$x^2 - 4$', '$x^2 + 4x - 4$'], correctOptionIndex: 1, explanation: '$(f \\circ g)(x) = f(g(x)) = (x-2)^2 = x^2 - 4x + 4$.' },
    { id: 'ex-mat11-q2', question: 'Jika $f(x) = 3x + 1$, maka invers $f^{-1}(x) = ...$', options: ['$\\frac{x-1}{3}$', '$\\frac{x+1}{3}$', '$3x - 1$', '$\\frac{1}{3x+1}$'], correctOptionIndex: 0, explanation: 'Buat $y = 3x+1$, tukar: $x = 3y+1$, selesaikan: $y = \\frac{x-1}{3}$.' },
  ],
  'Berpikir Komputasional': [
    { id: 'ex-inf10-q1', question: 'Memecah masalah kompleks menjadi bagian-bagian kecil disebut...', options: ['Abstraksi', 'Algoritma', 'Dekomposisi', 'Pengenalan Pola'], correctOptionIndex: 2, explanation: 'Dekomposisi adalah pilar berpikir komputasional untuk memecah masalah besar.' },
    { id: 'ex-inf10-q2', question: 'Mengabaikan detail yang tidak relevan dalam pemecahan masalah disebut...', options: ['Dekomposisi', 'Abstraksi', 'Algoritma', 'Evaluasi'], correctOptionIndex: 1, explanation: 'Abstraksi berfokus pada esensi masalah dengan mengabaikan detail tidak penting.' },
  ],
  'Object-Oriented Programming': [
    { id: 'ex-smk-oop-q1', question: 'Keyword Java untuk pewarisan kelas adalah...', options: ['extends', 'implements', 'inherits', 'super'], correctOptionIndex: 0, explanation: "'extends' digunakan untuk inheritance/pewarisan class." },
    { id: 'ex-smk-oop-q2', question: 'Konsep OOP yang menyembunyikan detail implementasi disebut...', options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'], correctOptionIndex: 2, explanation: 'Encapsulation (enkapsulasi) membungkus data dan menyembunyikan implementasi internal.' },
    { id: 'ex-smk-oop-q3', question: 'Kemampuan suatu metode untuk berperilaku berbeda pada objek yang berbeda disebut...', options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Interface'], correctOptionIndex: 1, explanation: 'Polymorphism memungkinkan satu nama metode memiliki banyak implementasi.' },
  ],
  'Turunan Fungsi Aljabar': [
    { id: 'ex-mat12-turunan-q1', question: "Turunan pertama $f(x) = 4x^3 - 2x^2 + 7x$ adalah...", options: ["$12x^2 - 4x + 7$", "$12x^2 - 4x$", "$4x^2 - 2x + 7$", "$12x^3 - 4x^2 + 7$"], correctOptionIndex: 0, explanation: "$f'(x) = 12x^2 - 4x + 7$." },
    { id: 'ex-mat12-turunan-q2', question: "Nilai $f'(2)$ dari $f(x) = x^3 - 3x$ adalah...", options: ["6", "9", "12", "15"], correctOptionIndex: 1, explanation: "$f'(x) = 3x^2 - 3$. Maka $f'(2) = 12 - 3 = 9$." },
  ],
  'Fisika Mekanika': [
    { id: 'ex-fis10-q1', question: 'Sebuah balok 10 kg dikenai gaya 50 N. Percepatannya adalah...', options: ['2 m/s²', '5 m/s²', '50 m/s²', '0.2 m/s²'], correctOptionIndex: 1, explanation: '$a = F/m = 50/10 = 5 \\text{ m/s}^2$.' },
    { id: 'ex-fis10-q2', question: 'Hukum Newton I menyatakan bahwa...', options: ['F = ma', 'Benda diam memerlukan gaya untuk bergerak', 'Benda mempertahankan keadaannya jika tidak ada gaya luar', 'Gaya aksi = gaya reaksi'], correctOptionIndex: 2, explanation: 'Hukum I Newton (Inersia): benda diam tetap diam, benda bergerak tetap bergerak jika tidak ada gaya luar.' },
  ],
  'Bahasa Indonesia - Teks LHO': [
    { id: 'ex-ind10-q1', question: 'Bagian teks LHO yang menjelaskan objek secara umum disebut...', options: ['Deskripsi Bagian', 'Pernyataan Umum', 'Deskripsi Manfaat', 'Kesimpulan'], correctOptionIndex: 1, explanation: 'Pernyataan Umum adalah bagian pembuka LHO yang mendefinisikan objek secara keseluruhan.' },
    { id: 'ex-ind10-q2', question: 'Ciri kebahasaan teks LHO yang membedakannya dari teks narasi adalah...', options: ['Menggunakan kata ganti orang pertama', 'Menggunakan kalimat fakta dan istilah ilmiah', 'Berisi pendapat dan opini penulis', 'Memiliki alur cerita'], correctOptionIndex: 1, explanation: 'LHO menggunakan kalimat fakta yang dapat diverifikasi dan istilah ilmiah yang presisi.' },
  ],
};

type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'adaptive';

export default function ExamEnginePage() {
  const { profile, addXp, upgradeSkill } = useUserStore();

  // Load subjects from curriculum
  const curriculumSubjects = useMemo(
    () => getSubjectsByPathway(profile.schoolType, profile.grade, profile.selectedPathway),
    [profile.schoolType, profile.grade, profile.selectedPathway]
  );

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [useStaticBank, setUseStaticBank] = useState(false);

  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [showResults, setShowResults] = useState(false);

  const timerRef = useRef<any>(null);

  // Get available topics - merge curriculum lessons + static bank
  const availableTopics = useMemo(() => {
    const curriculumTopics = curriculumSubjects.flatMap(sub =>
      sub.modules.flatMap(mod =>
        mod.lessons.flatMap(les =>
          les.quizzes && les.quizzes.length > 0 ? [{ label: les.title, questions: les.quizzes as QuizQuestion[] }] : []
        )
      )
    );
    const staticTopics = Object.keys(STATIC_BANK).map(key => ({ label: key, questions: STATIC_BANK[key] }));
    return [...curriculumTopics, ...staticTopics];
  }, [curriculumSubjects]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleStartExam = () => {
    if (selectedTopics.length === 0) return;

    let gathered: QuizQuestion[] = [];
    selectedTopics.forEach(topicLabel => {
      const found = availableTopics.find(t => t.label === topicLabel);
      if (found) gathered = [...gathered, ...found.questions];
    });

    const finalQuestions = gathered.sort(() => 0.5 - Math.random()).slice(0, questionCount);

    if (finalQuestions.length === 0) {
      alert('Tidak ada soal tersedia untuk topik terpilih.');
      return;
    }

    const timeSecs = finalQuestions.length * (difficulty === 'easy' ? 90 : difficulty === 'hard' ? 45 : 60);

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
      accuracy: 0,
    };

    setActiveSession(session);
    setCurrentIdx(0);
    setTimeLeft(timeSecs);
    setShowResults(false);
  };

  const handleSubmitExam = useCallback(() => {
    if (!activeSession) return;
    clearTimeout(timerRef.current);

    let correctCount = 0;
    activeSession.questions.forEach(q => {
      if (activeSession.answers[q.id] === q.correctOptionIndex) correctCount++;
    });

    const elapsedSeconds = activeSession.questions.length * (difficulty === 'easy' ? 90 : difficulty === 'hard' ? 45 : 60) - timeLeft;
    const accuracy = Math.round((correctCount / activeSession.questions.length) * 100);

    setActiveSession({
      ...activeSession,
      score: correctCount,
      completedAt: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      speedSecsPerQuestion: Math.round(elapsedSeconds / activeSession.questions.length),
      accuracy,
    });
    setShowResults(true);

    const xpReward = correctCount * 50;
    addXp(xpReward);
    upgradeSkill('logic', Math.round(correctCount * 2));
  }, [activeSession, difficulty, timeLeft, addXp, upgradeSkill]);

  useEffect(() => {
    if (activeSession && !showResults && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { handleSubmitExam(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [activeSession, timeLeft, showResults, handleSubmitExam]);

  const handleSelectOption = (idx: number) => {
    if (!activeSession) return;
    const qId = activeSession.questions[currentIdx].id;
    setActiveSession(prev => prev ? { ...prev, answers: { ...prev.answers, [qId]: idx } } : null);
  };

  const handleReset = () => {
    setActiveSession(null);
    setShowResults(false);
    setCurrentIdx(0);
  };

  const formatTime = (secs: number) => `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
  const timePercent = activeSession ? (timeLeft / (activeSession.totalQuestions * (difficulty === 'easy' ? 90 : difficulty === 'hard' ? 45 : 60))) * 100 : 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Setup Screen */}
      {!activeSession && (
        <div className="space-y-5">
          <Card className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Brain size={15} className="text-accent" /> Evaluasi Kompetensi Nasional
              </h3>
              <p className="text-[11px] text-text-secondary">
                Uji penguasaan materi berdasarkan Kurikulum Merdeka {profile.schoolType.toUpperCase()} Kelas {profile.grade}.
                Soal diambil dari pelajaran yang telah Anda akses dan bank soal terintegrasi.
              </p>
            </div>

            {/* Topic Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Filter size={10} /> Pilih Topik Evaluasi
              </label>
              
              {/* Curriculum topics */}
              {curriculumSubjects.some(sub => sub.modules.some(mod => mod.lessons.some(les => les.quizzes?.length > 0))) && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-text-tertiary uppercase">📚 Dari Kurikulum Aktif Anda</span>
                  <div className="flex flex-wrap gap-2">
                    {curriculumSubjects.flatMap(sub =>
                      sub.modules.flatMap(mod =>
                        mod.lessons.filter(les => les.quizzes?.length > 0).map(les => (
                          <button
                            key={les.id}
                            type="button"
                            onClick={() => toggleTopic(les.title)}
                            className={`px-3 py-1.5 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                              selectedTopics.includes(les.title)
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-bg-tertiary/40 hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            {les.title}
                          </button>
                        ))
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Static bank topics */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-text-tertiary uppercase">📦 Bank Soal Tambahan</span>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(STATIC_BANK).map(topic => {
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
            </div>

            {/* Config */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Jumlah Soal</label>
                <select
                  value={questionCount}
                  onChange={e => setQuestionCount(Number(e.target.value))}
                  className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  {[3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Soal</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Level Kesulitan</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="easy">Mudah (90 det/soal)</option>
                  <option value="medium">Sedang (60 det/soal)</option>
                  <option value="hard">Sulit (45 det/soal)</option>
                  <option value="adaptive">Adaptif (Smart Timer)</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleStartExam}
              disabled={selectedTopics.length === 0}
              className="w-full h-11 text-xs flex items-center justify-center gap-1.5"
            >
              <Play size={14} /> Mulai Ujian Evaluasi
              {selectedTopics.length > 0 && (
                <Badge variant="primary" className="text-[8px] ml-1">{selectedTopics.length} topik</Badge>
              )}
            </Button>

            {selectedTopics.length === 0 && (
              <p className="text-center text-[10px] text-text-tertiary flex items-center justify-center gap-1">
                <AlertCircle size={11} /> Pilih minimal 1 topik untuk memulai
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Active Exam */}
      {activeSession && !showResults && (
        <Card className="space-y-5">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <div>
              <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">UJIAN DIAGNOSTIK — {difficulty.toUpperCase()}</span>
              <h3 className="text-sm font-bold text-text-primary mt-0.5">
                Soal {currentIdx + 1} dari {activeSession.totalQuestions}
              </h3>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border ${
              timeLeft < 30 ? 'text-danger border-danger/30 bg-danger/5 animate-pulse' : 
              timeLeft < 60 ? 'text-warning border-warning/30 bg-warning/5' : 
              'text-text-secondary border-border bg-bg-tertiary/30'
            }`}>
              <Clock size={12} />
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="space-y-1.5">
            <Progress value={((currentIdx) / activeSession.totalQuestions) * 100} className="h-1" />
            <div className="flex gap-1">
              {activeSession.questions.map((_, i) => (
                <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
                  i < currentIdx ? 'bg-success/60' : i === currentIdx ? 'bg-accent' : 'bg-bg-tertiary'
                }`} />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-sm font-semibold text-text-primary leading-relaxed">
              {activeSession.questions[currentIdx].question}
            </p>

            <div className="space-y-2.5">
              {activeSession.questions[currentIdx].options.map((opt, optIdx) => {
                const isSelected = activeSession.answers[activeSession.questions[currentIdx].id] === optIdx;
                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-4 border rounded-xl text-xs cursor-pointer transition-all duration-150 flex items-start gap-3 ${
                      isSelected
                        ? 'border-accent bg-accent/5 text-text-primary'
                        : 'border-border bg-bg-tertiary/30 hover:bg-bg-tertiary text-text-secondary hover:text-text-primary hover:border-border-subtle'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] font-bold font-mono mt-0.5 ${
                      isSelected ? 'border-accent bg-accent text-white' : 'border-text-tertiary text-text-tertiary'
                    }`}>
                      {['A', 'B', 'C', 'D'][optIdx]}
                    </div>
                    <span className="flex-1">{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-border/40">
            <Button disabled={currentIdx === 0} onClick={() => setCurrentIdx(p => p - 1)} variant="secondary" className="h-9 text-xs w-24">
              ← Sebelumnya
            </Button>

            {currentIdx < activeSession.totalQuestions - 1 ? (
              <Button
                disabled={activeSession.answers[activeSession.questions[currentIdx].id] === undefined}
                onClick={() => setCurrentIdx(p => p + 1)}
                className="h-9 text-xs w-24"
              >
                Berikutnya →
              </Button>
            ) : (
              <Button
                disabled={Object.keys(activeSession.answers).length < activeSession.totalQuestions}
                onClick={handleSubmitExam}
                className="h-9 text-xs w-32"
              >
                Kirim Ujian ✓
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Results */}
      {activeSession && showResults && (
        <div className="space-y-5">
          <Card className="p-6 text-center space-y-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto relative z-10 ${
              activeSession.accuracy >= 80 ? 'bg-success/10 text-success' : 
              activeSession.accuracy >= 60 ? 'bg-warning/10 text-warning' : 
              'bg-danger/10 text-danger'
            }`}>
              {activeSession.accuracy >= 80 ? <Star size={28} /> : 
               activeSession.accuracy >= 60 ? <Award size={28} /> : 
               <AlertCircle size={28} />}
            </div>

            <div className="relative z-10 space-y-1">
              <h3 className="text-base font-bold text-text-primary">
                {activeSession.accuracy >= 80 ? '🏆 Luar Biasa!' : activeSession.accuracy >= 60 ? '✅ Cukup Baik!' : '💪 Terus Berlatih!'}
              </h3>
              <p className="text-xs text-text-secondary">
                Anda mendapatkan <strong className="text-accent font-mono">+{activeSession.score * 50} XP</strong>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 py-4 border-y border-border/40 relative z-10 max-w-md mx-auto font-mono">
              <div>
                <span className="text-[10px] text-text-tertiary block">SKOR</span>
                <span className="text-xl font-bold">{activeSession.score}/{activeSession.totalQuestions}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-tertiary block">AKURASI</span>
                <span className={`text-xl font-bold ${activeSession.accuracy >= 80 ? 'text-success' : activeSession.accuracy >= 60 ? 'text-warning' : 'text-danger'}`}>
                  {activeSession.accuracy}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-tertiary block">KECEPATAN</span>
                <span className="text-xl font-bold text-info">{activeSession.speedSecsPerQuestion}s/soal</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center relative z-10">
              <Button onClick={handleReset} className="h-9 text-xs flex items-center gap-1.5">
                <RotateCcw size={13} /> Ujian Baru
              </Button>
            </div>
          </Card>

          {/* Review */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest">📋 Tinjauan Jawaban</span>
            {activeSession.questions.map((q, idx) => {
              const chosen = activeSession.answers[q.id];
              const isCorrect = chosen === q.correctOptionIndex;
              return (
                <Card key={q.id} className="space-y-3 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-text-secondary font-mono">SOAL {idx + 1}</span>
                    <Badge variant={isCorrect ? 'success' : 'danger'} className="text-[9px] flex items-center gap-1">
                      {isCorrect ? <CheckCircle size={9} /> : <XCircle size={9} />}
                      {isCorrect ? 'BENAR' : 'SALAH'}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-text-primary">{q.question}</p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between text-text-secondary">
                      <span>Jawaban Anda:</span>
                      <span className={isCorrect ? 'text-success font-semibold' : 'text-danger font-semibold'}>
                        {q.options[chosen] || '— Tidak Dijawab —'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="flex justify-between text-text-secondary">
                        <span>Jawaban Benar:</span>
                        <span className="text-success font-semibold">{q.options[q.correctOptionIndex]}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-bg-tertiary/40 rounded border border-border text-[11px] text-text-secondary leading-relaxed">
                    <span className="font-bold text-text-primary">💡 Penjelasan:</span> {q.explanation}
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
