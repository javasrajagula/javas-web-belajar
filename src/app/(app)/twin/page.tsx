'use client';

import React, { useState, useMemo } from 'react';
import { useUserStore } from '@/stores/user-store';
import { useCurriculumStore } from '@/stores/curriculum-store';
import { getSubjectsByPathway } from '@/lib/curriculum-data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  TrendingUp, Brain, Clock, Activity, Heart, Sparkles,
  ArrowRight, Target, Zap, AlertTriangle, CheckCircle2,
  BarChart3, Calendar, BookOpen, Award
} from 'lucide-react';

export default function DigitalTwinPage() {
  const { profile } = useUserStore();
  const { completedLessons } = useCurriculumStore();
  const [selectedView, setSelectedView] = useState<'overview' | 'cognitive' | 'habits' | 'forecast'>('overview');

  // Dynamic curriculum data
  const subjects = useMemo(
    () => getSubjectsByPathway(profile.schoolType, profile.grade),
    [profile.schoolType, profile.grade]
  );

  // Calculate real progress from completed lessons
  const subjectProgress = useMemo(() => {
    return subjects.map(sub => {
      let total = 0;
      let done = 0;
      sub.modules.forEach(mod => {
        mod.lessons.forEach(les => {
          total++;
          if (completedLessons[les.id]) done++;
        });
      });
      const score = total > 0 ? Math.round((done / total) * 100) : 0;
      return {
        name: sub.title,
        score,
        status: score >= 80 ? 'Siap Ujian' : score >= 50 ? 'Perlu Ulasan' : score > 0 ? 'Dalam Progres' : 'Belum Dimulai',
        total,
        done,
      };
    });
  }, [subjects, completedLessons]);

  const overallReadiness = useMemo(() => {
    if (subjectProgress.length === 0) return 0;
    return Math.round(subjectProgress.reduce((acc, s) => acc + s.score, 0) / subjectProgress.length);
  }, [subjectProgress]);

  const weakSubjects = subjectProgress.filter(s => s.score < 50 && s.total > 0).slice(0, 3);
  const strongSubjects = subjectProgress.filter(s => s.score >= 70).slice(0, 3);

  const habits = [
    { title: 'Konsistensi Waktu Mulai', score: Math.min(100, profile.streak * 14), desc: `Streak ${profile.streak} hari beruntun aktif.`, streak: `${profile.streak} hari` },
    { title: 'Pengerjaan Kuis Aktif', score: Math.min(100, Object.keys(completedLessons).length * 10), desc: `${Object.keys(completedLessons).length} sesi pelajaran diselesaikan.`, streak: `${Object.keys(completedLessons).length} sesi` },
    { title: 'Target Belajar Harian', score: Math.min(100, Math.round((profile.studyTimeToday / profile.dailyGoalMinutes) * 100)), desc: `${profile.studyTimeToday}/${profile.dailyGoalMinutes} menit hari ini.`, streak: `${profile.studyTimeToday}m` },
  ];

  const viewTabs = [
    { id: 'overview', label: 'Ringkasan', icon: BarChart3 },
    { id: 'cognitive', label: 'Kognitif', icon: Brain },
    { id: 'habits', label: 'Kebiasaan', icon: Heart },
    { id: 'forecast', label: 'Prediksi', icon: TrendingUp },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-secondary border border-border rounded-lg p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" className="text-[9px] font-mono uppercase bg-accent/10 text-accent border-accent/20">
                Kembaran Digital AI
              </Badge>
            </div>
            <h1 className="text-lg font-bold text-text-primary">Profil Kognitif: {profile.name}</h1>
            <p className="text-xs text-text-secondary mt-1">
              Model pembelajaran Anda diperbarui secara real-time berdasarkan sesi belajar dan hasil kuis.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black font-mono text-accent">{overallReadiness}%</div>
            <div className="text-[10px] text-text-tertiary">Indeks Kesiapan Global</div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-1 mt-4 relative z-10">
          {viewTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                selectedView === tab.id
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Pelajaran Selesai', value: Object.keys(completedLessons).length, color: 'text-success', icon: CheckCircle2 },
              { label: 'Streak Belajar', value: `${profile.streak} Hari`, color: 'text-warning', icon: Zap },
              { label: 'XP Terkumpul', value: `${profile.xp} XP`, color: 'text-accent', icon: Award },
              { label: 'Target Harian', value: `${profile.studyTimeToday}m`, color: 'text-primary', icon: Clock },
            ].map(stat => (
              <Card key={stat.label} className="flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-semibold text-text-secondary">{stat.label}</span>
                  <stat.icon size={14} className={stat.color} />
                </div>
                <span className={`text-xl font-black font-mono mt-3 ${stat.color}`}>{stat.value}</span>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="space-y-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <TrendingUp size={13} className="text-success" /> Mata Pelajaran Dikuasai
              </h3>
              {strongSubjects.length > 0 ? strongSubjects.map(s => (
                <div key={s.name} className="space-y-1.5 p-3 rounded border border-success/20 bg-success/5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text-primary truncate max-w-[180px]">{s.name}</span>
                    <Badge variant="success" className="text-[8px]">{s.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={s.score} color="success" className="h-1 flex-1" />
                    <span className="text-[10px] font-mono text-success">{s.score}%</span>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-text-secondary py-4 text-center border border-dashed border-border rounded">Belum ada mata pelajaran yang dikuasai. Mulai belajar!</p>
              )}
            </Card>

            <Card className="space-y-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-warning" /> Perlu Perhatian Lebih
              </h3>
              {weakSubjects.length > 0 ? weakSubjects.map(s => (
                <div key={s.name} className="space-y-1.5 p-3 rounded border border-warning/20 bg-warning/5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text-primary truncate max-w-[180px]">{s.name}</span>
                    <Badge variant="warning" className="text-[8px]">{s.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={s.score} color="warning" className="h-1 flex-1" />
                    <span className="text-[10px] font-mono text-warning">{s.score}%</span>
                  </div>
                </div>
              )) : (
                <div className="space-y-2">
                  {profile.weakTopics.slice(0, 2).map(wt => (
                    <div key={wt.topic} className="p-3 rounded border border-warning/20 bg-warning/5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-text-primary">{wt.topic}</span>
                        <span className="text-warning font-mono">{wt.mastery}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Cognitive Matrix */}
      {selectedView === 'cognitive' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Brain size={14} className="text-accent" /> Matriks Penguasaan Per Mata Pelajaran
            </h3>
            <div className="space-y-3">
              {subjectProgress.map(sub => (
                <div key={sub.name} className="space-y-1.5 p-3 rounded-lg border border-border bg-bg-tertiary/20">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-text-primary truncate max-w-[200px]">{sub.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-text-tertiary">{sub.done}/{sub.total} modul</span>
                      <Badge variant={sub.score >= 80 ? 'success' : sub.score >= 50 ? 'warning' : sub.score > 0 ? 'primary' : 'secondary'} className="text-[8px]">
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress 
                      value={sub.score} 
                      color={sub.score >= 80 ? 'success' : sub.score >= 50 ? 'warning' : 'primary'} 
                      className="h-1.5 flex-1" 
                    />
                    <span className="text-xs font-mono font-bold w-9 text-right">{sub.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Habits */}
      {selectedView === 'habits' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Heart size={14} className="text-danger" /> Analisis Kebiasaan Belajar
            </h3>
            <div className="space-y-3">
              {habits.map(h => (
                <div key={h.title} className="p-4 rounded border border-border bg-bg-tertiary/20 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-primary">{h.title}</span>
                    <span className="font-mono text-[10px] bg-bg-secondary border border-border px-2 py-0.5 rounded text-text-secondary">{h.streak}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary">{h.desc}</p>
                  <div className="flex items-center gap-3">
                    <Progress value={h.score} color="accent" className="h-1 flex-1" />
                    <span className="text-[10px] font-mono text-accent font-bold">{h.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Activity size={14} className="text-primary" /> Performa Skill RPG
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(profile.skills).map(([key, value]) => {
                const labels: Record<string, string> = { focus: 'Fokus', logic: 'Logika', creativity: 'Kreativitas', discipline: 'Disiplin' };
                return (
                  <div key={key} className="p-3 rounded border border-border bg-bg-tertiary/20 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-text-primary">{labels[key] || key}</span>
                      <span className="font-mono text-accent">Lvl {value}</span>
                    </div>
                    <Progress value={value} color="accent" className="h-1" />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Forecast */}
      {selectedView === 'forecast' && (
        <div className="space-y-6">
          <Card className="space-y-4 bg-bg-secondary relative overflow-hidden border border-border">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5 relative z-10">
              <Sparkles size={14} className="text-accent" /> Rekomendasi Kembaran Digital
            </h3>
            <div className="relative z-10 space-y-3">
              <div className="p-4 rounded border border-accent/20 bg-accent/5 text-xs leading-relaxed text-text-secondary">
                {weakSubjects.length > 0 ? (
                  <span>
                    Berdasarkan analisis profil Anda, <strong className="text-text-primary">{weakSubjects[0]?.name}</strong> adalah 
                    area dengan penguasaan terendah saat ini (<span className="text-warning font-mono font-semibold">{weakSubjects[0]?.score}%</span>). 
                    Saya rekomendasikan sesi belajar intensif 30 menit malam ini untuk materi tersebut. 
                    Gunakan mode <strong className="text-accent">"Penguji Sokrates"</strong> di AI Tutor untuk melatih pemahaman mendalam.
                  </span>
                ) : overallReadiness > 70 ? (
                  <span>
                    Performa Anda sangat baik dengan indeks kesiapan global <strong className="text-success font-mono">{overallReadiness}%</strong>! 
                    Pertahankan konsistensi belajar. Coba tingkatkan tantangan dengan mengerjakan soal-soal HOTS di Exam Engine.
                  </span>
                ) : (
                  <span>
                    Mulailah dengan membuka Kurikulum dan pilih mata pelajaran pertama Anda. AI akan otomatis melacak progres 
                    dan memberikan rekomendasi belajar yang dipersonalisasi.
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link href="/tutor">
                  <Button className="w-full h-9 text-xs flex items-center justify-center gap-1">
                    <Brain size={13} /> Tanya AI Tutor
                  </Button>
                </Link>
                <Link href="/subjects">
                  <Button variant="secondary" className="w-full h-9 text-xs flex items-center justify-center gap-1">
                    <BookOpen size={13} /> Buka Kurikulum
                  </Button>
                </Link>
                <Link href="/planner">
                  <Button variant="secondary" className="w-full h-9 text-xs flex items-center justify-center gap-1">
                    <Calendar size={13} /> Buat Jadwal AI
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Study Time Projection */}
          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-text-primary">Proyeksi Penguasaan 30 Hari</h3>
            <p className="text-[11px] text-text-secondary">
              Dengan target belajar harian <strong>{profile.dailyGoalMinutes} menit</strong>, 
              diproyeksikan penguasaan Anda akan meningkat ke:
            </p>
            <div className="space-y-2">
              {subjectProgress.slice(0, 4).map(s => {
                const projected = Math.min(100, s.score + Math.round(profile.dailyGoalMinutes / 10));
                return (
                  <div key={s.name} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-secondary truncate max-w-[180px]">{s.name}</span>
                      <span className="font-mono text-success">→ {projected}%</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-1.5 rounded bg-primary/60" style={{ width: `${s.score}%`, flex: 'none', maxWidth: '50%' }} />
                      <div className="h-1.5 rounded bg-success/40" style={{ width: `${projected - s.score}%`, flex: 'none', maxWidth: '50%' }} />
                      <div className="h-1.5 rounded bg-bg-tertiary flex-1" />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] font-mono text-text-tertiary">Estimasi dengan asumsi sesi belajar konsisten setiap hari.</p>
          </Card>
        </div>
      )}
    </div>
  );
}
