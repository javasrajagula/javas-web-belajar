'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  BarChart2, 
  BookOpen, 
  AlertCircle,
  Brain,
  MessageSquare,
  Target,
  Sparkles
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface HasilUjian {
  id: string;
  mataPelajaranId: string;
  judul: string;
  tipe: string;
  totalSoal: number;
  benar: number;
  salah: number;
  nilaiAkhir: number;
  durasiDetik: number;
  jawabanDetail: Record<string, {
    pertanyaan: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    pembahasan: string;
    options: string[] | null;
    tipe: string;
    tags?: string[];
  }>;
  createdAt: string;
}

interface MapelInfo {
  nama: string;
  kode: string;
  kelas: number;
  semester: number;
  jurusan: {
    nama: string;
    kode: string;
    warna: string;
  };
}

export default function HasilUjianPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const hasilId = resolvedParams?.id;

  const [hasilData, setHasilData] = useState<HasilUjian | null>(null);
  const [mapelInfo, setMapelInfo] = useState<MapelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSoalId, setExpandedSoalId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!hasilId) return;

    async function loadHasil() {
      try {
        const res = await fetch(`/api/ujian/hasil/${hasilId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        setHasilData(data.hasil);
        setMapelInfo(data.mapel);
      } catch (err) {
        toast.error('Gagal memuat hasil evaluasi.');
      } finally {
        setLoading(false);
      }
    }
    loadHasil();
  }, [hasilId]);

  if (loading) {
    return (
      <div className="text-center py-40 flex flex-col items-center justify-center gap-3 text-text-primary">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm">Menganalisis hasil ujian Anda...</span>
      </div>
    );
  }

  if (!hasilData) {
    return (
      <div className="text-center py-20 text-text-primary">
        <h2 className="text-sm font-bold text-danger">Hasil Tidak Ditemukan</h2>
        <p className="text-xs text-text-secondary mt-2">Data hasil evaluasi tidak tersedia atau tidak sah.</p>
        <Button onClick={() => router.push('/ujian/mulai')} className="mt-4 text-xs">Kembali</Button>
      </div>
    );
  }

  // Format duration into MM:SS or HH:MM:SS
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hrs} jam ${remainingMins} menit`;
    }
    return `${mins} menit ${remainingSecs} detik`;
  };

  // Process Recharts data based on question tags
  const tagsData: Record<string, { total: number; correct: number }> = {};
  Object.values(hasilData.jawabanDetail).forEach((q: any) => {
    const isCorrect = q.isCorrect;
    
    // Group by topic tag or default
    const tag = (q.tags && q.tags[2]) || (q.tags && q.tags[0]) || 'Topik Umum';
    
    if (!tagsData[tag]) {
      tagsData[tag] = { total: 0, correct: 0 };
    }
    tagsData[tag].total += 1;
    if (isCorrect) {
      tagsData[tag].correct += 1;
    }
  });

  const radarData = Object.entries(tagsData).map(([name, val]) => ({
    subject: name.length > 20 ? name.slice(0, 18) + '...' : name,
    A: Math.round((val.correct / val.total) * 100),
    fullMark: 100,
  }));

  // SVG Circular ScoreRing Config
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (hasilData.nilaiAkhir / 100) * circumference;

  // Grade evaluation text
  const getEvaluationText = (score: number) => {
    if (score >= 90) return { title: 'Luar Biasa! 🏆', desc: 'Kamu telah menguasai kompetensi industri ini dengan sempurna. Siap menghadapi sertifikasi!', color: 'text-success' };
    if (score >= 75) return { title: 'Kompeten 👍', desc: 'Nilai kamu memenuhi Kriteria Ketercapaian Tujuan Pembelajaran (KKTP). Pertahankan prestasimu!', color: 'text-primary-hover' };
    if (score >= 50) return { title: 'Perlu Latihan 📝', desc: 'Sedikit lagi untuk mencapai nilai kompeten. Pelajari kembali materi di modul belajar.', color: 'text-warning' };
    return { title: 'Coba Lagi 💪', desc: 'Jangan patah semangat! Pelajari pembahasan di bawah dan diskusikan dengan guru atau Tutor AI.', color: 'text-danger' };
  };

  const evaluation = getEvaluationText(hasilData.nilaiAkhir);
  const topicReview = Object.entries(tagsData)
    .map(([topic, data]) => ({
      topic,
      mastery: Math.round((data.correct / data.total) * 100),
      wrong: data.total - data.correct,
      total: data.total,
    }))
    .sort((a, b) => a.mastery - b.mastery);
  const weakestReviewTopic = topicReview[0];
  const tutorPrompt = encodeURIComponent(
    weakestReviewTopic
      ? `Saya baru ujian ${hasilData.judul} dan lemah di topik ${weakestReviewTopic.topic}. Buatkan analisis kesalahan, ringkasan materi, dan 5 latihan bertahap.`
      : `Saya baru ujian ${hasilData.judul}. Bantu saya memahami kesalahan dan buat rencana belajar singkat.`
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-text-primary max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary/40 border border-border p-5 rounded-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/ujian/mulai">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border border-border">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Hasil Evaluasi</h1>
            <p className="text-xs text-text-secondary mt-0.5">{hasilData.judul}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary" className="text-[9px] bg-primary-subtle text-primary border-primary/20">
            {hasilData.tipe.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="text-[9px]">
            {new Date(hasilData.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* PANEL LEFT: SCORE & EVALUATION (col-span-4) */}
        <Card className="lg:col-span-4 p-6 border border-border bg-bg-secondary/20 flex flex-col items-center justify-between text-center gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Nilai Akhir</span>
            <h3 className={`text-lg font-bold ${evaluation.color}`}>{evaluation.title}</h3>
          </div>

          {/* SVG ScoreRing */}
          <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              {/* Outer track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-bg-tertiary"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Animated fill */}
              <motion.circle
                cx="80"
                cy="80"
                r={radius}
                className={hasilData.nilaiAkhir >= 75 ? 'stroke-success' : hasilData.nilaiAkhir >= 50 ? 'stroke-warning' : 'stroke-danger'}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white leading-none font-mono">
                {hasilData.nilaiAkhir}
              </span>
              <span className="text-[10px] text-text-tertiary mt-1 font-mono uppercase">Skala 100</span>
            </div>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed px-2">
            {evaluation.desc}
          </p>

          <div className="w-full border-t border-border/40 pt-4 flex flex-col gap-2">
            <Link href={`/ujian/${hasilData.mataPelajaranId}?mode=${hasilData.tipe}`} className="w-full">
              <Button className="w-full text-xs flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white h-9">
                <RefreshCw size={13} /> Ulangi Ujian
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full">
              <Button variant="secondary" className="w-full text-xs h-9">
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>
        </Card>

        {/* PANEL MIDDLE: STATS & ANALYTICS (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Benar', value: `${hasilData.benar} soal`, icon: CheckCircle, color: 'text-success bg-success-subtle/10 border-success/20' },
              { label: 'Salah', value: `${hasilData.salah} soal`, icon: XCircle, color: 'text-danger bg-danger-subtle/10 border-danger/20' },
              { label: 'Durasi Pengerjaan', value: formatDuration(hasilData.durasiDetik), icon: Clock, color: 'text-white bg-bg-secondary/40 border-border' },
              { label: 'Rasio Akurasi', value: `${Math.round((hasilData.benar / hasilData.totalSoal) * 100)}%`, icon: Award, color: 'text-secondary bg-secondary-subtle/10 border-secondary/20' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className={`p-4 border flex flex-col gap-1.5 ${stat.color}`}>
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase opacity-75">
                    <span>{stat.label}</span>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-bold truncate leading-tight font-mono">{stat.value}</span>
                </Card>
              );
            })}
          </div>

          {/* Radar Chart Card */}
          <Card className="p-5 border border-border bg-bg-secondary/20 flex-grow flex flex-col gap-4">
            <div className="flex items-center gap-1.5 border-b border-border/40 pb-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Analisis Kompetensi Topik</span>
            </div>

            {/* Render Recharts Radar Chart */}
            <div className="w-full h-64 flex items-center justify-center">
              {isMounted && radarData.length > 2 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 8 }} />
                    <Radar
                      name="Akurasi"
                      dataKey="A"
                      stroke="#4F46E5"
                      fill="#4F46E5"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10 text-xs text-text-tertiary flex flex-col items-center gap-2">
                  <AlertCircle size={20} />
                  <span>Data grafik topik tidak mencukupi (membutuhkan minimal 3 topik/bab berbeda).</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* AI COACH SUMMARY */}
      <Card className="p-5 border border-border bg-accent text-black flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b-[3px] border-black pb-4">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 border-[3px] border-black bg-primary text-white shadow-[4px_4px_0_#1a1c1c] flex items-center justify-center">
              <Brain size={21} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-black uppercase">AI Coach Setelah Ujian</p>
              <h2 className="text-lg font-black">
                {weakestReviewTopic
                  ? `Prioritas remedial: ${weakestReviewTopic.topic}`
                  : 'Belum cukup data topik, mulai dari review soal salah.'}
              </h2>
              <p className="text-xs font-semibold text-black/70 mt-1">
                {weakestReviewTopic
                  ? `Penguasaan topik ini ${weakestReviewTopic.mastery}% dengan ${weakestReviewTopic.wrong} jawaban perlu diperbaiki.`
                  : 'AI akan memakai pembahasan soal di bawah untuk membuat rencana latihan.'}
              </p>
            </div>
          </div>
          <Link href={`/tutor?prompt=${tutorPrompt}`}>
            <Button className="w-full md:w-auto bg-primary text-white">
              <MessageSquare size={15} /> Bahas Dengan AI
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              icon: Target,
              title: '10 menit review',
              desc: weakestReviewTopic ? `Baca ulang materi ${weakestReviewTopic.topic}.` : 'Buka 3 soal salah pertama.',
            },
            {
              icon: Sparkles,
              title: 'Latihan adaptif',
              desc: 'Minta Tutor AI membuat soal mudah, sedang, lalu sukar.',
            },
            {
              icon: RefreshCw,
              title: 'Ujian ulang',
              desc: 'Kerjakan ulang setelah nilai latihan stabil di atas 80.',
            },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#1a1c1c]">
                <Icon size={18} className="text-primary" />
                <h3 className="text-sm font-black mt-2">{step.title}</h3>
                <p className="text-xs font-semibold text-black/65 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* DETAILED QUESTION REVIEW & EXPLANATIONS */}
      <Card className="p-5 border border-border bg-bg-secondary/20 flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-1.5 border-b border-border/40 pb-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Review Pembahasan Soal</span>
        </div>

        <div className="space-y-4">
          {Object.entries(hasilData.jawabanDetail).map(([qId, q], idx) => {
            const isExpanded = expandedSoalId === qId;
            return (
              <div 
                key={qId} 
                className={`p-4 border rounded-xl flex flex-col gap-3 transition-all ${
                  q.isCorrect 
                    ? 'border-success/20 bg-success-subtle/5' 
                    : 'border-danger/20 bg-danger-subtle/5'
                }`}
              >
                {/* Score badge & number */}
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-text-tertiary">SOAL {idx + 1}</span>
                    <Badge variant={q.isCorrect ? 'success' : 'danger'} className="text-[8px] uppercase tracking-wider font-mono">
                      {q.isCorrect ? 'Benar' : 'Salah'}
                    </Badge>
                  </div>
                  
                  <button
                    onClick={() => setExpandedSoalId(isExpanded ? null : qId)}
                    className="text-text-tertiary hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {isExpanded ? (
                      <>Tutup Pembahasan <ChevronUp size={14} /></>
                    ) : (
                      <>Lihat Pembahasan <ChevronDown size={14} /></>
                    )}
                  </button>
                </div>

                {/* Question Text */}
                <p className="text-xs font-semibold text-white leading-relaxed">
                  {q.pertanyaan}
                </p>

                {/* Multiple choice options if present */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                    {q.options.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      const isUserChoice = q.userAnswer.trim().startsWith(letter) || q.userAnswer.trim() === letter;
                      const isCorrectChoice = q.correctAnswer.trim().startsWith(letter) || q.correctAnswer.trim() === letter;
                      
                      let boxClass = 'border-border/50 bg-bg-tertiary/10 text-text-secondary';
                      if (isCorrectChoice) {
                        boxClass = 'border-success bg-success-subtle/20 text-success font-semibold';
                      } else if (isUserChoice) {
                        boxClass = 'border-danger bg-danger-subtle/20 text-danger font-semibold';
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`p-2 rounded border text-xs flex items-center gap-2 ${boxClass}`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isCorrectChoice 
                              ? 'bg-success text-white' 
                              : isUserChoice 
                                ? 'bg-danger text-white' 
                                : 'bg-bg-hover text-text-tertiary'
                          }`}>
                            {letter}
                          </span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Expanded Details / Explanation */}
                {isExpanded && (
                  <div className="mt-2 border-t border-border/20 pt-3 flex flex-col gap-2.5">
                    <div className="p-3 bg-bg-tertiary/40 border border-border/80 rounded-lg text-[11px] leading-relaxed text-text-secondary">
                      <div className="flex flex-col md:flex-row gap-2 border-b border-border/40 pb-2 mb-2">
                        <span>Jawaban Kamu: <strong className={q.isCorrect ? 'text-success' : 'text-danger'}>{q.userAnswer || '(Kosong)'}</strong></span>
                        <span className="hidden md:inline text-text-tertiary">•</span>
                        <span>Kunci Jawaban: <strong className="text-success">{q.correctAnswer}</strong></span>
                      </div>
                      <p>
                        <strong className="text-white block mb-0.5">Penjelasan & Analisis Soal:</strong>
                        {q.pembahasan}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
