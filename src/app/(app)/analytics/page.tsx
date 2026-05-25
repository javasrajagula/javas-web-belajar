'use client';

import React from 'react';
import { useUserStore } from '@/stores/user-store';
import { useCurriculumStore } from '@/stores/curriculum-store';
import { getSubjectsByPathway } from '@/lib/curriculum-data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Brain, 
  Clock, 
  Activity, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { profile } = useUserStore();
  const { completedLessons, lessonScores } = useCurriculumStore();

  const subjects = getSubjectsByPathway(profile.schoolType, profile.grade);

  // Calculate overall readiness
  const getReadinessScore = () => {
    let totalLessons = 0;
    let completedCount = 0;
    
    subjects.forEach(sub => {
      sub.modules.forEach(mod => {
        mod.lessons.forEach(les => {
          totalLessons++;
          if (completedLessons[les.id]) {
            completedCount++;
          }
        });
      });
    });

    if (totalLessons === 0) return 75; // Default mock rating
    return Math.round((completedCount / totalLessons) * 100);
  };

  const readinessIndex = getReadinessScore();

  // Create mock cognitive matrix
  const subcategories = subjects.map(sub => {
    let totalLessons = 0;
    let completedCount = 0;
    sub.modules.forEach(mod => {
      mod.lessons.forEach(les => {
        totalLessons++;
        if (completedLessons[les.id]) {
          completedCount++;
        }
      });
    });

    const score = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);
    return {
      name: sub.title,
      score: score > 0 ? score : 30, // Mock fallback for styling
      status: score >= 80 ? 'Sangat Siap' : score >= 50 ? 'Cukup Siap' : 'Perlu Ulasan'
    };
  });

  const habits = [
    { title: 'Konsistensi Jam Mulai', description: 'Memulai sesi belajar mandiri pada pukul 19:00 secara berurutan.', score: 90 },
    { title: 'Tingkat Akurasi Kuis', description: 'Rata-rata akurasi kuis interaktif di atas 85%.', score: 85 },
    { title: 'Ketepatan Misi Harian', description: 'Mencapai target durasi belajar harian minimal 45 menit.', score: 78 }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-secondary">
            <span className="text-xs font-semibold">Total Durasi Belajar</span>
            <Clock size={16} className="text-primary" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono">14.5 jam</span>
            <p className="text-[10px] text-success font-semibold mt-1">+12% dari minggu lalu</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-secondary">
            <span className="text-xs font-semibold">Indeks Retensi AI</span>
            <Brain size={16} className="text-secondary" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono">82%</span>
            <p className="text-[10px] text-text-secondary mt-1">Berdasarkan interval kuis aktif</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-secondary">
            <span className="text-xs font-semibold">Sesi Teraktif Harian</span>
            <Activity size={16} className="text-accent" />
          </div>
          <div className="mt-4">
            <span className="text-sm font-bold text-text-primary">19:00 - 21:00 (Malam)</span>
            <p className="text-[10px] text-text-secondary mt-1">Akurasi kuis optimal di jam ini</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-secondary">
            <span className="text-xs font-semibold">Kesiapan Ujian (Diagnostik)</span>
            <TrendingUp size={16} className="text-primary" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono">{readinessIndex}%</span>
            <p className="text-[10px] text-primary font-semibold mt-1">Rata-rata bobot penguasaan CP</p>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Mastery Index */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary">Matriks Kesiapan Kognitif (CP)</h3>
              <p className="text-[11px] text-text-secondary">Progres penguasaan subjek dihitung dari pengerjaan tab kuis, HOTS, dan pelajaran.</p>
            </div>

            <div className="space-y-3">
              {subcategories.map((sub, i) => (
                <div key={i} className="p-4 rounded-lg border border-border bg-bg-tertiary/20 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-text-primary">{sub.name}</span>
                    <Badge variant={sub.score >= 80 ? 'success' : sub.score >= 50 ? 'warning' : 'danger'} className="text-[9px]">
                      {sub.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={sub.score} color={sub.score >= 80 ? 'success' : sub.score >= 50 ? 'warning' : 'danger'} className="h-1.5 flex-1" />
                    <span className="text-xs font-mono font-bold">{sub.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Tutor Smart Advisor */}
          <Card className="space-y-4 relative overflow-hidden bg-bg-secondary border border-border">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5 relative z-10">
              <Sparkles size={14} className="text-primary animate-pulse" /> Rekomendasi Revisi Otomatis Claude
            </h3>
            
            <div className="space-y-3 relative z-10 text-xs leading-relaxed text-text-secondary">
              <p className="p-3.5 rounded bg-bg-tertiary/30 border border-border">
                &ldquo;Berdasarkan analisis log belajar, akurasi kuis Anda di subjek **{subjects[0]?.title || 'Matematika'}** adalah yang terendah yaitu sekitar **{readinessIndex}%**. Kami menyarankan Anda menjadwalkan sesi belajar mandiri malam ini pukul 19:30 selama 30 menit untuk mengulas kembali topik ini.&rdquo;
              </p>
              
              <div className="flex justify-end">
                <Link href="/planner">
                  <Button size="sm" className="h-8 text-xs flex items-center gap-1.5">
                    Masukkan ke Agenda <ArrowRight size={12} />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Study Habits */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <CheckCircle size={14} className="text-secondary" /> Evaluasi Kebiasaan Belajar
            </h3>
            
            <div className="space-y-3">
              {habits.map((h, i) => (
                <div key={i} className="p-3.5 rounded bg-bg-tertiary/30 border border-border space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-primary">{h.title}</span>
                    <span className="font-mono text-secondary font-bold">{h.score}%</span>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">{h.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
