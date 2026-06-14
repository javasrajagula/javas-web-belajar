'use client';

import React, { useState, useEffect, use, useMemo, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Play, 
  CheckSquare, 
  BookOpen 
} from 'lucide-react';
import { toast } from 'sonner';
import { resolveSmkPathway } from '@/lib/pathway';

interface Soal {
  id: string;
  pertanyaan: string;
  tipe: string;
  pilihan: string[] | null;
  jawabanBenar?: string;
  pembahasan?: string;
  tingkat: string;
  tags: string[];
}

interface MapelInfo {
  nama: string;
  kode: string;
  kelas: number;
}

export default function UjianClientPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Resolve params
  const resolvedParams = use(params);
  const mapelId = resolvedParams?.id;
  const examMode = searchParams.get('mode') || 'ujian_bab';
  const isPracticeMode = examMode === 'latihan_santai';

  const { profile } = useUserStore();
  const selectedPathway = resolveSmkPathway(profile.selectedPathway);

  // State
  const [mapelInfo, setMapelInfo] = useState<MapelInfo | null>(null);
  const [questions, setQuestions] = useState<Soal[]>([]);
  const [loading, setLoading] = useState(true);

  // Exam Progress
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> answer string
  const [flaggedRagu, setFlaggedRagu] = useState<Record<string, boolean>>({}); // questionId -> true if flagged
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer state (seconds)
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Latihan santai state (checks if question was answered to show explanation)
  const [latihanSantaiChecked, setLatihanSantaiChecked] = useState<Record<string, boolean>>({});
  const storageKey = useMemo(
    () => (mapelId ? `academy_os_exam_draft_${mapelId}_${examMode}` : ''),
    [mapelId, examMode]
  );

  // Initialize Exam details
  useEffect(() => {
    if (!mapelId) return;

    async function loadExamData() {
      try {
        // Fetch Subject details
        const mapelRes = await fetch(`/api/jurusan/${selectedPathway}`);
        if (!mapelRes.ok) throw new Error();
        const mapelData = await mapelRes.json();
        const activeMapel = mapelData.mataPelajaran?.find((m: any) => m.id === mapelId);
        if (activeMapel) {
          setMapelInfo({
            nama: activeMapel.nama,
            kode: activeMapel.kode,
            kelas: activeMapel.kelas
          });
        }

        // Fetch Questions
        const params = new URLSearchParams();
        if (isPracticeMode) params.set('includeAnswers', 'true');
        const res = await fetch(`/api/jurusan/${selectedPathway}/mapel/${mapelId}/bank-soal?${params.toString()}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        // Subset questions based on Mode
        let subsetCount = 10;
        if (examMode === 'ujian_semester') subsetCount = 20;
        else if (examMode === 'tryout_un') subsetCount = 30;
        else if (examMode === 'adaptif') subsetCount = 15;
        
        let restoredDraft: any = null;
        if (storageKey) {
          const draftRaw = window.localStorage.getItem(storageKey);
          if (draftRaw) {
            try {
              restoredDraft = JSON.parse(draftRaw);
            } catch {
              window.localStorage.removeItem(storageKey);
            }
          }
        }

        // Randomize questions for a new session, but keep the original order when restoring a draft.
        let selected = [...data].sort(() => 0.5 - Math.random()).slice(0, Math.min(subsetCount, data.length));
        if (restoredDraft?.questionIds?.length) {
          const byId = new Map(data.map((question: Soal) => [question.id, question]));
          const restoredQuestions = restoredDraft.questionIds
            .map((id: string) => byId.get(id))
            .filter(Boolean);
          if (restoredQuestions.length > 0) {
            selected = restoredQuestions;
          }
        }
        
        setQuestions(selected);

        // Timer initial values
        let initialTimeLeft: number | null = null;
        if (examMode === 'ujian_bab') initialTimeLeft = 30 * 60;
        else if (examMode === 'ujian_semester') initialTimeLeft = 60 * 60;
        else if (examMode === 'tryout_un') initialTimeLeft = 90 * 60;
        setTimeLeft(initialTimeLeft);

        startTimeRef.current = Date.now();
        if (restoredDraft) {
          setAnswers(restoredDraft.answers || {});
          setFlaggedRagu(restoredDraft.flaggedRagu || {});
          setCurrentIndex(Math.min(Number(restoredDraft.currentIndex) || 0, selected.length - 1));
          if (typeof restoredDraft.timeLeft === 'number') setTimeLeft(restoredDraft.timeLeft);
          if (typeof restoredDraft.startedAt === 'number') startTimeRef.current = restoredDraft.startedAt;
          toast.info('Draft jawaban ujian dipulihkan.');
        }
      } catch (err) {
        toast.error('Gagal memuat kuis ujian.');
        router.push('/ujian/mulai');
      } finally {
        setLoading(false);
      }
    }

    loadExamData();
  }, [mapelId, examMode, selectedPathway, router, storageKey, isPracticeMode]);

  useEffect(() => {
    if (!storageKey || questions.length === 0 || isSubmitting) return;
    const draft = {
      answers,
      flaggedRagu,
      currentIndex,
      timeLeft,
      startedAt: startTimeRef.current,
      questionIds: questions.map((question) => question.id),
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [answers, currentIndex, flaggedRagu, isSubmitting, questions, storageKey, timeLeft]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1));
  }, [questions.length]);

  const handleAnswer = useCallback((val: string) => {
    const qId = questions[currentIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: val }));
  }, [questions, currentIndex]);

  const toggleFlagRagu = useCallback(() => {
    const qId = questions[currentIndex].id;
    setFlaggedRagu(prev => ({ ...prev, [qId]: !prev[qId] }));
  }, [questions, currentIndex]);

  // Submit and save exam results
  const handleSubmitExam = useCallback(async () => {
    if (isSubmitting) return;

    // Check for unanswered questions
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = questions.length - answeredCount;

    if (unansweredCount > 0 && timeLeft !== 0) {
      const confirmSubmit = window.confirm(
        `Anda memiliki ${unansweredCount} soal yang belum dijawab. Yakin ingin mengumpulkan jawaban?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Mengumpulkan lembar jawaban Anda...');

    try {
      const detailAnswers: Record<string, any> = {};

      questions.forEach((q) => {
        const userAnswer = answers[q.id] || '';
        detailAnswers[q.id] = {
          pertanyaan: q.pertanyaan,
          userAnswer,
          options: q.pilihan,
          tipe: q.tipe
        };
      });

      const total = questions.length;
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      // Save to database
      const res = await fetch('/api/ujian/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mataPelajaranId: mapelId,
          judul: `Ujian ${examMode.replace('_', ' ').toUpperCase()} - ${mapelInfo?.nama || 'Pelajaran SMK'}`,
          tipe: examMode,
          totalSoal: total,
          durasiDetik: durationSeconds,
          jawabanDetail: detailAnswers
        })
      });

      if (!res.ok) throw new Error();
      const result = await res.json();

      if (storageKey) window.localStorage.removeItem(storageKey);
      toast.success(`Ujian Selesai! Kamu mendapatkan +${result.xpReward} XP`, { id: toastId });
      router.push(`/ujian/hasil/${result.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengumpulkan lembar jawaban.', { id: toastId });
      setIsSubmitting(false);
    }
  }, [isSubmitting, answers, questions, timeLeft, mapelId, examMode, mapelInfo, storageKey, router]);

  // Timer Tick Logic
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      toast.warning('Waktu ujian telah habis! Mengumpulkan otomatis...');
      handleSubmitExam();
      return;
    }

    timerIntervalRef.current = setTimeout(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearTimeout(timerIntervalRef.current);
    };
  }, [timeLeft, handleSubmitExam]);

  // Keyboard navigation & inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in inputs
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;

      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      
      // Options A-E selection
      if (['a', 'b', 'c', 'd', 'e', 'A', 'B', 'C', 'D', 'E'].includes(e.key)) {
        const optionIdx = e.key.toLowerCase().charCodeAt(0) - 97;
        const activeSoal = questions[currentIndex];
        if (activeSoal && activeSoal.tipe === 'pilihan_ganda' && activeSoal.pilihan && activeSoal.pilihan[optionIdx]) {
          handleAnswer(String.fromCharCode(65 + optionIdx));
        }
      }
      
      // Toggle flag
      if (e.key === 'f' || e.key === 'F') {
        toggleFlagRagu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions, handleAnswer, handleNext, handlePrev, toggleFlagRagu]);

  // Latihan santai check answer logic
  const handleLatihanSantaiCheck = () => {
    const qId = questions[currentIndex].id;
    if (!answers[qId]) {
      toast.warning('Pilih jawaban terlebih dahulu!');
      return;
    }
    setLatihanSantaiChecked(prev => ({ ...prev, [qId]: true }));
  };

  // Formatting seconds into MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="text-center py-40 flex flex-col items-center justify-center gap-3 text-text-primary">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm">Menyusun naskah ujian kejuruan...</span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20 text-text-primary">
        <h2 className="text-sm font-bold text-danger">Soal Tidak Ditemukan</h2>
        <p className="text-xs text-text-secondary mt-2">Belum ada bank soal untuk mata pelajaran ini.</p>
        <Button onClick={() => router.push('/ujian/mulai')} className="mt-4 text-xs">Kembali</Button>
      </div>
    );
  }

  const activeQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const activeAnswer = answers[activeQuestion.id] || '';
  const isQuestionFlagged = flaggedRagu[activeQuestion.id] || false;
  const isSantaiChecked = latihanSantaiChecked[activeQuestion.id] || false;

  return (
    <div className="contrast-safe flex flex-col gap-5 text-text-primary relative min-h-[calc(100vh-140px)] pb-24">
      
      {/* FIXED HEADER AT TOP */}
      <div className="flex flex-col gap-3 bg-bg-secondary border border-border p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center gap-4">
          <div>
            <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
              {examMode.replace('_', ' ')} • Kelas {mapelInfo?.kelas}
            </h2>
            <h1 className="text-sm font-bold text-white leading-tight mt-0.5">{mapelInfo?.nama}</h1>
          </div>
          
          {/* Timer element */}
          {timeLeft !== null ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-tertiary border border-border rounded-md font-mono text-sm font-bold">
              <Clock className="w-4 h-4 text-accent animate-pulse" />
              <span className={timeLeft < 60 ? 'text-danger' : 'text-white'}>
                {formatTime(timeLeft)}
              </span>
            </div>
          ) : (
            <div className="px-3 py-1 bg-success-subtle/10 border border-success/20 text-success rounded text-[10px] uppercase font-mono font-bold">
              Tanpa Batas Waktu
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-4 mt-1">
          <div className="flex-1">
            <Progress value={progressPercent} />
          </div>
          <span className="text-[10px] font-mono text-text-secondary whitespace-nowrap">
            SOAL {currentIndex + 1} DARI {questions.length} ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* BODY WITH QUESTION AND NAV GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-grow">
        
        {/* LEFT COLUMN: QUESTION CARD (75%) */}
        <Card className="lg:col-span-9 p-6 border border-border bg-bg-secondary/20 min-h-[380px] flex flex-col justify-between">
          <div className="space-y-5">
            {/* Title question number */}
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <span className="text-xs font-mono font-bold text-text-tertiary">
                PERTANYAAN NO. <span className="text-white text-sm font-bold">{currentIndex + 1}</span>
              </span>
              <span className="text-[9px] font-mono font-bold text-primary px-2 py-0.5 border border-primary/20 bg-primary/10 rounded uppercase">
                {activeQuestion.tipe.replace('_', ' ')}
              </span>
            </div>

            {/* Question Text */}
            <p className="text-xs font-semibold text-white leading-relaxed whitespace-pre-line bg-bg-tertiary/10 p-3 rounded-lg border border-border/30">
              {activeQuestion.pertanyaan}
            </p>

            {/* Answers layout depending on type */}
            <div className="space-y-2.5 pt-2">
              {/* PILIHAN GANDA */}
              {activeQuestion.tipe === 'pilihan_ganda' && activeQuestion.pilihan && (
                <div className="grid grid-cols-1 gap-2.5">
                  {activeQuestion.pilihan.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isSelected = activeAnswer === letter;
                    
                    let cardClass = 'border-border bg-bg-tertiary/20 text-text-secondary hover:border-primary/40 hover:bg-bg-tertiary/40';
                    
                    if (isSelected) {
                      cardClass = 'border-primary bg-primary-subtle/10 text-white font-semibold';
                    }

                    // Show correct/incorrect in instant training mode (latihan santai checked)
                      if (examMode === 'latihan_santai' && isSantaiChecked && activeQuestion.jawabanBenar) {
                        const isCorrectOpt = activeQuestion.jawabanBenar.trim().startsWith(letter) || activeQuestion.jawabanBenar.trim() === letter;
                      if (isCorrectOpt) {
                        cardClass = 'border-success bg-success-subtle text-success font-semibold';
                      } else if (isSelected) {
                        cardClass = 'border-danger bg-danger-subtle text-danger font-semibold';
                      } else {
                        cardClass = 'border-border/30 bg-bg-tertiary/10 text-text-tertiary opacity-60';
                      }
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => !(examMode === 'latihan_santai' && isSantaiChecked) && handleAnswer(letter)}
                        className={`p-3.5 border rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-150 ${cardClass}`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-primary text-white' : 'bg-bg-hover text-text-tertiary'
                        }`}>
                          {letter}
                        </span>
                        <span className="text-xs leading-relaxed">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* BENAR SALAH */}
              {activeQuestion.tipe === 'benar_salah' && (
                <div className="grid grid-cols-2 gap-4">
                  {['Benar', 'Salah'].map((val) => {
                    const isSelected = activeAnswer === val;
                    let btnStyle = isSelected ? 'bg-primary hover:bg-primary text-white border-primary' : 'bg-bg-tertiary/20 hover:bg-bg-tertiary/40 text-text-secondary border-border';

                      if (examMode === 'latihan_santai' && isSantaiChecked && activeQuestion.jawabanBenar) {
                        const isCorrectVal = val.toLowerCase() === activeQuestion.jawabanBenar.toLowerCase();
                      if (isCorrectVal) {
                        btnStyle = 'bg-success text-white border-success';
                      } else if (isSelected) {
                        btnStyle = 'bg-danger text-white border-danger';
                      }
                    }

                    return (
                      <button
                        key={val}
                        onClick={() => !(examMode === 'latihan_santai' && isSantaiChecked) && handleAnswer(val)}
                        className={`h-14 border rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${btnStyle}`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ESSAY */}
              {activeQuestion.tipe === 'essay' && (
                <div className="flex flex-col gap-2">
                  <textarea
                    rows={5}
                    value={activeAnswer}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Tuliskan jawaban essay Anda secara terstruktur dan rinci di sini..."
                    className="w-full p-3 bg-bg-tertiary border border-border rounded-lg text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted leading-relaxed"
                  />
                  <div className="text-right text-[10px] text-text-tertiary font-mono">
                    Jumlah Karakter: {activeAnswer.length}
                  </div>
                </div>
              )}

              {/* ISIAN */}
              {activeQuestion.tipe === 'isian' && (
                <input
                  type="text"
                  value={activeAnswer}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Tuliskan jawaban isian singkat..."
                  className="w-full h-10 px-3 bg-bg-tertiary border border-border rounded-lg text-xs text-white focus:outline-none focus:border-primary"
                />
              )}
            </div>
          </div>

          {/* Latihan Santai Instant check / explanation view */}
          {examMode === 'latihan_santai' && (
            <div className="mt-6 border-t border-border/30 pt-4 flex flex-col gap-3">
              {!isSantaiChecked ? (
                <Button
                  onClick={handleLatihanSantaiCheck}
                  disabled={!activeAnswer}
                  className="w-36 h-8 text-[11px] self-start"
                >
                  Periksa Jawaban
                </Button>
              ) : (
                  <div className={`p-3.5 rounded-lg border text-xs leading-relaxed animate-fade-in ${
                    activeQuestion.jawabanBenar && activeAnswer.toLowerCase() === activeQuestion.jawabanBenar.toLowerCase()
                      ? 'border-success/30 bg-success/5 text-success'
                      : 'border-danger/30 bg-danger/5 text-text-secondary'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5 mb-1.5">
                      {activeQuestion.jawabanBenar && activeAnswer.toLowerCase() === activeQuestion.jawabanBenar.toLowerCase() ? (
                        <>🎉 Benar!</>
                      ) : (
                        <>❌ Kurang Tepat{activeQuestion.jawabanBenar ? ` (Jawaban Benar: ${activeQuestion.jawabanBenar})` : ''}</>
                      )}
                    </div>
                    <p>
                      <strong className="text-white block font-semibold mb-0.5">Penjelasan & Pembahasan:</strong>
                      {activeQuestion.pembahasan || 'Pembahasan lengkap tersedia setelah ujian dikumpulkan.'}
                    </p>
                  </div>
              )}
            </div>
          )}
        </Card>

        {/* RIGHT COLUMN: NAV GRID (25%) */}
        <Card className="lg:col-span-3 p-5 border border-border bg-bg-secondary/20 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 border-b border-border/40 pb-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Navigasi Soal</span>
          </div>

          {/* Grid numbers */}
          <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isCurrent = currentIndex === idx;
              const hasAnswer = !!answers[q.id];
              const isFlagged = !!flaggedRagu[q.id];

              let boxClass = 'border-border bg-bg-tertiary/10 text-text-tertiary hover:bg-bg-hover hover:text-white';
              
              if (hasAnswer) {
                boxClass = 'border-primary bg-primary text-white';
              }
              if (isFlagged) {
                boxClass = 'border-accent bg-accent text-white';
              }
              if (isCurrent) {
                boxClass = 'ring-2 ring-white border-primary-hover bg-primary-hover text-white';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-full aspect-square rounded-md border text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${boxClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Color legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-border/30 pt-3 text-text-secondary mt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-bg-tertiary border border-border inline-block"></span>
              <span>Belum diisi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-primary inline-block"></span>
              <span>Sudah diisi</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <span className="w-2.5 h-2.5 rounded bg-accent inline-block"></span>
              <span>Ragu-ragu / Ditandai</span>
            </div>
          </div>
        </Card>

      </div>

      {/* FIXED FOOTER AT BOTTOM */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary border-t border-border py-4 px-6 flex justify-between items-center shadow-lg backdrop-blur-md">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              disabled={currentIndex === 0}
              onClick={handlePrev}
              variant="outline"
              size="sm"
              className="h-9 text-xs flex items-center gap-1 border-border/80 hover:bg-bg-tertiary"
            >
              <ChevronLeft size={14} /> Sebelumnya
            </Button>
            
            <Button
              onClick={toggleFlagRagu}
              variant="secondary"
              size="sm"
              className={`h-9 text-xs flex items-center gap-1 border border-border ${
                isQuestionFlagged ? 'bg-accent/20 border-accent text-accent' : 'bg-bg-tertiary hover:bg-bg-hover text-text-secondary'
              }`}
            >
              <Flag size={12} className={isQuestionFlagged ? 'fill-accent' : ''} /> Ragu-Ragu
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              disabled={currentIndex === questions.length - 1}
              onClick={handleNext}
              variant="outline"
              size="sm"
              className="h-9 text-xs flex items-center gap-1 border-border/80 hover:bg-bg-tertiary"
            >
              Selanjutnya <ChevronRight size={14} />
            </Button>
            
            <Button
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="h-9 text-xs px-5 font-bold flex items-center gap-1.5 bg-success hover:bg-success/90 text-white"
            >
              <CheckSquare size={13} />
              Kumpulkan Ujian
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
