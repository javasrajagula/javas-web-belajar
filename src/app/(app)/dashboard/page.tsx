'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  FileUp,
  Flame,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { resolveSmkPathway } from '@/lib/pathway';
import { getJurusanLabel } from '@/lib/data/jurusan';

interface UserStats {
  totalExams: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  completedLessonsCount: number;
  latestExam: {
    id: string;
    judul: string;
    tipe: string;
    nilaiAkhir: number;
    benar: number;
    salah: number;
    createdAt: string;
  } | null;
  weakTopics: Array<{
    topic: string;
    mastery: number;
    wrong: number;
    total: number;
  }>;
}

interface Mapel {
  id: string;
  kode: string;
  nama: string;
  kelas: number;
  semester: number;
  bab?: { id: string; nomor: number }[];
}

const EMPTY_STATS: UserStats = {
  totalExams: 0,
  averageScore: 0,
  totalQuestionsAnswered: 0,
  completedLessonsCount: 0,
  latestExam: null,
  weakTopics: [],
};

const SSR_SAFE_PROFILE = {
  name: 'Siswa',
  schoolType: 'smk',
  selectedPathway: 'TKJ',
  level: 1,
  studyTimeToday: 0,
  dailyGoalMinutes: 45,
  streak: 0,
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export default function DashboardPage() {
  const { profile, addStudyTime } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const displayProfile = mounted ? profile : SSR_SAFE_PROFILE;
  const selectedPathway = resolveSmkPathway(displayProfile.selectedPathway);
  const pathwayName = getJurusanLabel(selectedPathway);

  const [stats, setStats] = useState<UserStats>(EMPTY_STATS);
  const [mapels, setMapels] = useState<Mapel[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusMinutes, setFocusMinutes] = useState(15);
  const [focusRunning, setFocusRunning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function loadDashboardData() {
      setLoading(true);
      try {
        const [statsRes, mapelsRes] = await Promise.all([
          fetch('/api/user/stats'),
          fetch(`/api/jurusan/${selectedPathway}`),
        ]);

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }

        if (mapelsRes.ok) {
          const data = await mapelsRes.json();
          setMapels(data.mataPelajaran || []);
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        toast.error('Gagal memuat dashboard belajar.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [mounted, selectedPathway]);

  useEffect(() => {
    if (!focusRunning) return;

    const timer = window.setInterval(() => {
      setFocusMinutes((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setFocusRunning(false);
          addStudyTime(15);
          toast.success('Sesi fokus selesai. +15 menit belajar tercatat.');
          return 15;
        }
        return current - 1;
      });
    }, 60000);

    return () => window.clearInterval(timer);
  }, [focusRunning, addStudyTime]);

  const continueMapel = mapels[0] || null;
  const continueBabId = continueMapel?.bab?.[0]?.id;
  const dailyProgress = Math.min(100, Math.round((displayProfile.studyTimeToday / displayProfile.dailyGoalMinutes) * 100));
  const weakestTopic = stats.weakTopics[0];

  const aiPlan = useMemo(() => {
    const plan = [];

    if (displayProfile.studyTimeToday < displayProfile.dailyGoalMinutes) {
      plan.push({
        icon: Clock,
        title: 'Selesaikan fokus 15 menit',
        desc: `Target harian baru ${dailyProgress}% tercapai. Mulai sesi pendek dulu.`,
        href: '#focus',
        tone: 'yellow',
      });
    }

    if (weakestTopic) {
      plan.push({
        icon: Target,
        title: `Latih ulang: ${weakestTopic.topic}`,
        desc: `Penguasaan ${weakestTopic.mastery}%. AI bisa buat ringkasan dan latihan tambahan.`,
        href: `/tutor?prompt=${encodeURIComponent(`Buat rencana remedial singkat untuk topik ${weakestTopic.topic}`)}`,
        tone: 'purple',
      });
    }

    if (continueMapel && continueBabId) {
      plan.push({
        icon: BookOpen,
        title: `Lanjut ${continueMapel.nama}`,
        desc: `Mulai Bab ${continueMapel.bab?.[0]?.nomor || 1}, lalu kerjakan 5 soal cek pemahaman.`,
        href: `/belajar/${selectedPathway}/${continueMapel.id}/${continueBabId}`,
        tone: 'green',
      });
    }

    plan.push({
      icon: Brain,
      title: 'Tanya Tutor AI',
      desc: 'Minta AI menjelaskan materi yang membingungkan dengan analogi sederhana.',
      href: '/tutor',
      tone: 'purple',
    });

    return plan.slice(0, 4);
  }, [continueBabId, continueMapel, dailyProgress, displayProfile.dailyGoalMinutes, displayProfile.studyTimeToday, selectedPathway, weakestTopic]);

  const statCards = [
    { label: 'Nilai Rata-rata', value: loading ? '...' : stats.averageScore || 0, icon: Trophy },
    { label: 'Ujian Selesai', value: loading ? '...' : stats.totalExams, icon: ShieldCheck },
    { label: 'Soal Dikerjakan', value: loading ? '...' : stats.totalQuestionsAnswered, icon: CheckCircle2 },
    { label: 'Materi Tuntas', value: loading ? '...' : stats.completedLessonsCount, icon: BookOpen },
  ];

  return (
    <div className="space-y-6 text-text-primary">
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 bg-accent border-[4px] border-border shadow-[8px_8px_0_#1a1c1c] p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <Badge className="bg-white text-black border-2 border-black font-extrabold uppercase">
              {displayProfile.schoolType.toUpperCase()} - {selectedPathway}
            </Badge>
            <Badge className="bg-primary text-white border-2 border-black font-extrabold uppercase">
              Level {displayProfile.level}
            </Badge>
          </div>

          <div className="max-w-3xl space-y-3">
            <p className="font-mono text-xs font-extrabold uppercase tracking-widest">{mounted ? getGreeting() : 'Selamat belajar'}, {displayProfile.name}</p>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight text-black">
              Hari ini AI menyusun jalur belajar paling pendek untuk maju.
            </h1>
            <p className="text-sm font-semibold text-black/75">
              Fokus utama: {weakestTopic ? `perkuat ${weakestTopic.topic}` : `bangun ritme belajar di ${pathwayName}`}. Dashboard ini sekarang menjadi ruang komando harian, bukan sekadar papan angka.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/tutor">
              <Button className="w-full sm:w-auto bg-primary text-white">
                <Sparkles size={16} /> Buka Tutor AI
              </Button>
            </Link>
            {continueMapel && continueBabId && (
              <Link href={`/belajar/${selectedPathway}/${continueMapel.id}/${continueBabId}`}>
                <Button variant="secondary" className="w-full sm:w-auto">
                  <Play size={16} /> Lanjut Belajar
                </Button>
              </Link>
            )}
          </div>
        </div>

        <Card id="focus" className="xl:col-span-4 p-5 bg-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-mono font-black uppercase text-text-secondary">Target Harian</p>
              <h2 className="text-xl font-black text-text-primary">{dailyProgress}% selesai</h2>
            </div>
            <div className="h-14 w-14 border-[3px] border-black bg-secondary text-white shadow-[4px_4px_0_#1a1c1c] flex items-center justify-center">
              <Zap size={24} />
            </div>
          </div>

          <Progress value={dailyProgress} className="h-3 mt-5" />
          <div className="mt-3 flex justify-between text-xs font-bold">
            <span>{displayProfile.studyTimeToday} menit</span>
            <span>{displayProfile.dailyGoalMinutes} menit</span>
          </div>

          <div className="mt-5 border-[3px] border-black bg-bg-tertiary p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-black uppercase text-text-secondary">Focus Sprint</p>
                <p className="text-2xl font-black">{focusMinutes}:00</p>
              </div>
              <Button onClick={() => setFocusRunning((value) => !value)} size="sm">
                {focusRunning ? <RefreshCw size={14} /> : <Play size={14} />}
                {focusRunning ? 'Jeda' : 'Mulai'}
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 bg-white">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] font-mono font-black uppercase text-text-secondary">{stat.label}</p>
                <Icon size={17} className="text-primary" />
              </div>
              <p className="mt-3 text-2xl font-black">{stat.value}</p>
            </Card>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <Card className="xl:col-span-7 p-5 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b-[3px] border-black pb-4">
            <div>
              <p className="text-[10px] font-mono font-black uppercase text-primary">AI Action Plan</p>
              <h2 className="text-lg font-black">Apa yang perlu dilakukan sekarang</h2>
            </div>
            <Badge className="bg-accent text-black border-2 border-black font-black uppercase">
              {aiPlan.length} aksi
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiPlan.map((item) => {
              const Icon = item.icon;
              const toneClass = item.tone === 'green' ? 'bg-secondary text-white' : item.tone === 'purple' ? 'bg-primary text-white' : 'bg-accent text-black';
              return (
                <Link key={item.title} href={item.href} className="group border-[3px] border-black bg-bg-tertiary p-4 shadow-[4px_4px_0_#1a1c1c] transition-transform hover:-translate-y-0.5">
                  <div className={`mb-3 h-10 w-10 border-[3px] border-black ${toneClass} flex items-center justify-center`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="text-sm font-black">{item.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-text-secondary leading-relaxed">{item.desc}</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-black uppercase">
                    Kerjakan <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="xl:col-span-5 p-5 bg-white">
          <div className="flex items-center justify-between border-b-[3px] border-black pb-4">
            <div>
              <p className="text-[10px] font-mono font-black uppercase text-danger">Diagnosis AI</p>
              <h2 className="text-lg font-black">Topik yang perlu dikuatkan</h2>
            </div>
            <BarChart3 size={20} className="text-primary" />
          </div>

          <div className="mt-4 space-y-3">
            {stats.weakTopics.length > 0 ? (
              stats.weakTopics.map((topic) => (
                <div key={topic.topic} className="border-[3px] border-black bg-bg-tertiary p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black line-clamp-1">{topic.topic}</p>
                    <span className="text-xs font-mono font-black">{topic.mastery}%</span>
                  </div>
                  <Progress value={topic.mastery} className="h-2 mt-2" />
                  <p className="mt-2 text-[10px] font-semibold text-text-secondary">
                    {topic.wrong} dari {topic.total} jawaban perlu diperbaiki.
                  </p>
                </div>
              ))
            ) : (
              <div className="border-[3px] border-dashed border-black bg-bg-tertiary p-5 text-sm font-semibold text-text-secondary">
                Belum ada pola kelemahan. Kerjakan ujian atau latihan dulu agar AI bisa membaca kebutuhanmu.
              </div>
            )}
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 bg-white">
          <Flame className="text-danger" size={20} />
          <h3 className="mt-3 text-base font-black">Streak {displayProfile.streak} hari</h3>
          <p className="mt-1 text-xs font-semibold text-text-secondary">Pertahankan ritme dengan satu sesi fokus pendek setiap hari.</p>
        </Card>

        <Card className="p-5 bg-white">
          <FileUp className="text-secondary" size={20} />
          <h3 className="mt-3 text-base font-black">Portfolio dan tugas</h3>
          <p className="mt-1 text-xs font-semibold text-text-secondary">Simpan bukti proyek, link, dan file tugas di profil siswa.</p>
          <Link href="/profile" className="mt-4 inline-flex text-xs font-black uppercase items-center gap-1">
            Buka Profil <ArrowRight size={13} />
          </Link>
        </Card>

        <Card className="p-5 bg-white">
          <ShieldCheck className="text-primary" size={20} />
          <h3 className="mt-3 text-base font-black">Mode ujian serius</h3>
          <p className="mt-1 text-xs font-semibold text-text-secondary">Nilai dihitung server-side dan hasil ujian memberi diagnosis topik.</p>
          <Link href="/ujian/mulai" className="mt-4 inline-flex text-xs font-black uppercase items-center gap-1">
            Mulai Ujian <ArrowRight size={13} />
          </Link>
        </Card>
      </section>
    </div>
  );
}
