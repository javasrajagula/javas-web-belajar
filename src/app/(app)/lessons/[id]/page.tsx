'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getLessonById } from '@/lib/curriculum-data';
import { getDbLessonById } from '@/lib/actions/curriculum';
import { useCurriculumStore } from '@/stores/curriculum-store';
import { useUserStore } from '@/stores/user-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  RotateCw, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  CheckCircle,
  HelpCircle,
  Award,
  BookMarked
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const lessonId = resolvedParams?.id;

  const [data, setData] = useState<{ lesson: any; subject: any; moduleTitle: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const { markLessonComplete, completedLessons, lessonScores } = useCurriculumStore();
  const { addXp, upgradeSkill } = useUserStore();

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const dbData = await getDbLessonById(lessonId);
        if (dbData) {
          setData(dbData);
        } else {
          const localData = getLessonById(lessonId);
          setData(localData);
        }
      } catch (err) {
        console.error('Failed to fetch from DB, falling back to local JSON:', err);
        const localData = getLessonById(lessonId);
        setData(localData);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const [activeTab, setActiveTab] = useState<'explanation' | 'visual' | 'quiz' | 'summary' | 'flashcards' | 'hots' | 'practice'>('explanation');
  
  // Quiz states
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState<Record<string, boolean>>({});

  // HOTS states
  const [selectedHots, setSelectedHots] = useState<Record<string, number>>({});
  const [submittedHots, setSubmittedHots] = useState<Record<string, boolean>>({});

  // Flashcards states
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});

  // Podcast Player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLineIdx, setActiveLineIdx] = useState(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [podcastFinished, setPodcastFinished] = useState(false);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      stopPodcast();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-text-secondary">Memuat materi pembelajaran...</p>
      </div>
    );
  }

  if (!lessonId || !data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-sm font-bold text-danger">Pelajaran Tidak Ditemukan</h2>
        <p className="text-xs text-text-secondary mt-2">Materi yang Anda minta tidak terdaftar di kurikulum saat ini.</p>
        <Link href="/subjects" className="mt-4 inline-block">
          <Button size="sm" variant="secondary">Kembali ke Mata Pelajaran</Button>
        </Link>
      </div>
    );
  }

  const { lesson, subject, moduleTitle } = data;

  // --- PODCAST TTS CONTROLS ---
  const speakLine = (index: number) => {
    if (!synthRef.current || !lesson.podcastScript || index >= lesson.podcastScript.length) {
      setIsPlaying(false);
      setActiveLineIdx(-1);
      if (index >= (lesson.podcastScript?.length || 0)) {
        setPodcastFinished(true);
        // Award XP and Discipline status
        addXp(50);
        upgradeSkill('discipline', 5);
        markLessonComplete(lesson.id);
      }
      return;
    }

    setActiveLineIdx(index);
    const line = lesson.podcastScript[index];
    
    // Stop any previous speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(line.text);
    utteranceRef.current = utterance;
    
    // Try to find an Indonesian voice
    const voices = synthRef.current.getVoices();
    const indonesianVoice = voices.find((v) => v.lang.startsWith('id') || v.lang.startsWith('in'));
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    // Set voice properties based on character
    if (line.role === 'budi') {
      utterance.pitch = 0.9;
      utterance.rate = 0.95 * playbackSpeed;
    } else {
      utterance.pitch = 1.2;
      utterance.rate = 1.05 * playbackSpeed;
    }

    utterance.onend = () => {
      speakLine(index + 1);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      speakLine(index + 1);
    };

    synthRef.current.speak(utterance);
  };

  const playPodcast = () => {
    if (!synthRef.current || !lesson.podcastScript) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (synthRef.current.paused) {
        synthRef.current.resume();
      } else {
        speakLine(activeLineIdx === -1 ? 0 : activeLineIdx);
      }
    }
  };

  const stopPodcast = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setActiveLineIdx(-1);
  };

  const handleSpeedChange = () => {
    const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1;
    setPlaybackSpeed(nextSpeed);
    if (isPlaying && activeLineIdx !== -1) {
      // Re-trigger current line with new speed
      speakLine(activeLineIdx);
    }
  };

  // --- QUIZ AND HOTS ACTIONS ---
  const handleSelectOption = (qId: string, idx: number, type: 'quiz' | 'hots') => {
    if (type === 'quiz') {
      if (submittedQuizzes[qId]) return;
      setSelectedAnswers(prev => ({ ...prev, [qId]: idx }));
    } else {
      if (submittedHots[qId]) return;
      setSelectedHots(prev => ({ ...prev, [qId]: idx }));
    }
  };

  const handleSubmitQuestion = (qId: string, correctIdx: number, type: 'quiz' | 'hots') => {
    const isCorrect = (type === 'quiz' ? selectedAnswers[qId] : selectedHots[qId]) === correctIdx;
    
    if (type === 'quiz') {
      setSubmittedQuizzes(prev => ({ ...prev, [qId]: true }));
      if (isCorrect) {
        addXp(20);
        upgradeSkill('logic', 2);
      }
    } else {
      setSubmittedHots(prev => ({ ...prev, [qId]: true }));
      if (isCorrect) {
        addXp(40);
        upgradeSkill('logic', 5);
        markLessonComplete(lesson.id);
      }
    }
  };

  // --- FLASHCARDS ACTIONS ---
  const handleFlipCard = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMarkMasteredCard = (id: string) => {
    setMasteredCards(prev => ({ ...prev, [id]: !prev[id] }));
    addXp(10);
    upgradeSkill('focus', 1);
  };

  return (
    <div className="space-y-6">
      {/* Lesson Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary border border-border p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <Link href="/subjects">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <span className="text-[9px] font-mono text-secondary uppercase block font-bold">{subject.title} • {moduleTitle}</span>
            <h1 className="text-sm font-bold text-text-primary mt-0.5">{lesson.title}</h1>
          </div>
        </div>

        {/* 7 Tabs Header Selection */}
        <div className="flex flex-wrap gap-1 bg-bg-tertiary/60 p-1 rounded-md border border-border max-w-full overflow-x-auto no-scrollbar">
          {[
            { id: 'explanation', label: 'Penjelasan' },
            { id: 'visual', label: 'Visual' },
            { id: 'quiz', label: 'Kuis' },
            { id: 'summary', label: 'Rangkuman' },
            { id: 'flashcards', label: 'Flashcard' },
            { id: 'hots', label: 'Soal HOTS' },
            { id: 'practice', label: 'Bank Soal' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 text-[10px] font-semibold rounded cursor-pointer whitespace-nowrap transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Podcast Deck Section */}
      {lesson.podcastScript && (
        <Card className="p-5 border border-border bg-gradient-to-r from-bg-secondary to-bg-tertiary/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-radial-gradient from-primary/5 to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            
            {/* Player Info & Wave */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-primary" />
                <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest">AI PODCAST PEMBELAJARAN (BETA)</span>
              </div>
              <p className="text-xs text-text-primary leading-relaxed">
                Obrolan edukatif antara **Pak Budi** dan **Kak Siska** menyederhanakan topik ini secara interaktif.
              </p>
              
              {/* Sound wave visualizer */}
              {isPlaying && (
                <div className="flex items-end gap-1.5 pt-2 h-6">
                  {[2, 4, 3, 5, 2, 6, 3, 4, 2, 5, 4, 3, 2].map((h, i) => (
                    <div
                      key={i}
                      style={{ animationDelay: `${i * 100}ms`, height: `${h * 4}px` }}
                      className="w-1 bg-secondary rounded-full animate-pulse"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button onClick={handleSpeedChange} variant="secondary" className="h-9 px-3 text-[10px] font-mono">
                {playbackSpeed}x Speed
              </Button>
              <Button onClick={playPodcast} className="h-9 px-4 flex items-center gap-1.5">
                {isPlaying ? <Pause size={14} /> : <Play size={14} />} {isPlaying ? 'Pause' : 'Dengarkan Obrolan'}
              </Button>
              {isPlaying && (
                <Button onClick={stopPodcast} variant="ghost" className="h-9 w-9 p-0 hover:text-danger">
                  <Volume2 size={14} />
                </Button>
              )}
            </div>
          </div>

          {/* Active Transcript Line Display */}
          {activeLineIdx !== -1 && lesson.podcastScript && (
            <div className="mt-4 p-3 bg-bg-secondary/60 rounded border border-border border-l-2 border-l-secondary text-[11px] leading-relaxed transition-all duration-200 animate-slide-up">
              <span className={`font-bold block uppercase text-[9px] mb-0.5 ${lesson.podcastScript[activeLineIdx].role === 'budi' ? 'text-primary' : 'text-secondary'}`}>
                {lesson.podcastScript[activeLineIdx].role === 'budi' ? 'Pak Budi' : 'Kak Siska'}
              </span>
              <p className="text-text-primary italic">&ldquo;{lesson.podcastScript[activeLineIdx].text}&rdquo;</p>
            </div>
          )}

          {podcastFinished && (
            <div className="mt-4 p-2 bg-success-subtle/10 border border-success/20 text-success rounded text-[10px] text-center font-semibold">
              Selamat! Anda telah mendengarkan podcast ini sampai selesai. +50 XP & +5 Poin Disiplin diperoleh!
            </div>
          )}
        </Card>
      )}

      {/* Tabs Content Renderer */}
      <div className="flex-1 w-full max-w-4xl mx-auto">
        {/* TABS 1: PENJELASAN */}
        {activeTab === 'explanation' && (
          <Card className="p-6 md:p-8 bg-bg-secondary border border-border prose prose-invert prose-xs">
            <ReactMarkdown>{lesson.explanation}</ReactMarkdown>
          </Card>
        )}

        {/* TABS 2: CONTOH VISUAL */}
        {activeTab === 'visual' && (
          <Card className="p-6 bg-bg-secondary border border-border prose prose-invert prose-xs font-mono">
            <ReactMarkdown>{lesson.visualExample}</ReactMarkdown>
          </Card>
        )}

        {/* TABS 3: KUIS */}
        {activeTab === 'quiz' && (
          <div className="space-y-4 max-w-xl mx-auto">
            {lesson.quizzes.map((q: any, idx: number) => {
              const selected = selectedAnswers[q.id];
              const submitted = submittedQuizzes[q.id];
              const isCorrect = selected === q.correctOptionIndex;

              return (
                <Card key={q.id} className="space-y-4">
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-[10px] font-bold text-text-secondary font-mono">PERTANYAAN {idx + 1}</span>
                    {submitted && (
                      <Badge variant={isCorrect ? 'success' : 'danger'}>
                        {isCorrect ? 'Benar +20 XP' : 'Salah'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-text-primary">{q.question}</p>

                  <div className="space-y-2">
                    {q.options.map((opt: any, optIdx: number) => {
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
                        optionClass = 'border-primary bg-primary-subtle text-text-primary';
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx, 'quiz')}
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
                      onClick={() => handleSubmitQuestion(q.id, q.correctOptionIndex, 'quiz')}
                      disabled={selected === undefined}
                      className="w-full h-9 text-xs"
                    >
                      Kirim Jawaban
                    </Button>
                  ) : (
                    <div className="p-3 bg-bg-tertiary/40 rounded border border-border text-[10px] text-text-secondary leading-relaxed">
                      <span className="font-bold text-text-primary">Penjelasan:</span> {q.explanation}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* TABS 4: RANGKUMAN */}
        {activeTab === 'summary' && (
          <Card className="p-6 bg-bg-secondary border border-border prose prose-invert prose-xs">
            <h3 className="text-xs font-mono font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <BookMarked size={14} className="text-primary" /> Rangkuman Pelajaran
            </h3>
            <ReactMarkdown>{lesson.summary}</ReactMarkdown>
          </Card>
        )}

        {/* TABS 5: FLASHCARDS */}
        {activeTab === 'flashcards' && (
          <div className="max-w-md mx-auto space-y-4">
            {lesson.flashcards.map((fc: any) => {
              const flipped = flippedCards[fc.id] || false;
              const mastered = masteredCards[fc.id] || false;
              return (
                <Card key={fc.id} className="space-y-4">
                  <div
                    onClick={() => handleFlipCard(fc.id)}
                    className="h-44 w-full rounded border border-border bg-bg-tertiary/30 hover:bg-bg-tertiary/60 transition-all duration-200 cursor-pointer flex items-center justify-center p-6 text-center select-none"
                  >
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-text-tertiary tracking-widest uppercase">
                        {flipped ? 'JAWABAN / BELAKANG' : 'PERTANYAAN / DEPAN'}
                      </span>
                      <p className="text-xs font-semibold text-text-primary leading-relaxed">
                        {flipped ? fc.back : fc.front}
                      </p>
                      <span className="text-[9px] text-primary flex items-center justify-center gap-1 mt-3">
                        <RotateCw size={10} /> Ketuk untuk membalik kartu
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleMarkMasteredCard(fc.id)}
                      variant={mastered ? 'primary' : 'outline'}
                      className="flex-grow h-8 text-[10px] flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={12} /> {mastered ? 'Dikuasai +10 XP' : 'Tandai Selesai Dipelajari'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* TABS 6: SOAL HOTS */}
        {activeTab === 'hots' && (
          <div className="space-y-4 max-w-xl mx-auto">
            {lesson.hotsQuestions.map((q: any) => {
              const selected = selectedHots[q.id];
              const submitted = submittedHots[q.id];
              const isCorrect = selected === q.correctOptionIndex;

              return (
                <Card key={q.id} className="space-y-4 border-l-4 border-l-accent">
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-[10px] font-bold text-accent font-mono flex items-center gap-1">
                      <HelpCircle size={12} /> SOAL EVALUATIF HOTS
                    </span>
                    {submitted && (
                      <Badge variant={isCorrect ? 'success' : 'danger'}>
                        {isCorrect ? 'Benar +40 XP' : 'Salah'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-text-primary leading-relaxed">{q.question}</p>

                  <div className="space-y-2">
                    {q.options.map((opt: any, optIdx: number) => {
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
                        optionClass = 'border-accent bg-accent-subtle text-text-primary';
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx, 'hots')}
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
                      onClick={() => handleSubmitQuestion(q.id, q.correctOptionIndex, 'hots')}
                      disabled={selected === undefined}
                      className="w-full h-9 text-xs"
                    >
                      Kirim Jawaban Evaluasi
                    </Button>
                  ) : (
                    <div className="p-3 bg-bg-tertiary/40 rounded border border-border text-[10px] text-text-secondary leading-relaxed">
                      <span className="font-bold text-text-primary">Pembahasan HOTS:</span> {q.explanation}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* TABS 7: BANK SOAL */}
        {activeTab === 'practice' && (
          <div className="max-w-xl mx-auto space-y-4">
            {lesson.practiceBank.map((pb: any, idx: number) => (
              <Card key={idx} className="p-4 space-y-3">
                <span className="text-[10px] font-mono font-bold text-text-tertiary uppercase">LATIHAN {idx + 1}</span>
                <p className="text-xs font-medium text-text-primary">{pb.question}</p>
                <div className="p-3 bg-bg-tertiary/50 border border-border rounded text-[11px] text-text-secondary font-mono leading-relaxed">
                  <span className="font-bold text-text-primary">Kunci Jawaban:</span> {pb.answer}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
