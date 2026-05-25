'use client';

import React from 'react';
import { useUserStore } from '@/stores/user-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Brain, 
  Clock, 
  Activity,
  Heart,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DigitalTwinPage() {
  const { profile } = useUserStore();

  const learningPace = {
    weeklyHours: 4.8,
    paceTrend: '+12% dari minggu lalu',
    retentionRate: 84,
    optimalStudyHour: '19:00 - 21:00 (Malam)',
  };

  const readinessIndex = {
    overall: 76,
    subcategories: [
      { name: 'Fondasi Keadaan Kuantum', score: 85, status: 'Siap Ujian' },
      { name: 'Teknik Integrasi Kalkulus', score: 62, status: 'Perlu Ulasan' },
      { name: 'Konjugasi Kata Kerja Prancis', score: 81, status: 'Sangat Stabil' }
    ]
  };

  const habits = [
    { title: 'Konsistensi Waktu Mulai', description: 'Anda mulai belajar antara pukul 18:30 dan 19:15 setiap harinya.', streak: '5 hari', score: 92 },
    { title: 'Tinjauan Kuis Aktif', description: 'Anda menyelesaikan kuis latihan dalam waktu 30 menit setelah mengunggah catatan belajar baru.', streak: '3 materi', score: 85 },
    { title: 'Belajar Fokus Mingguan', description: 'Sesi belajar fokus tanpa gangguan melebihi 40 menit.', streak: 'Selesai', score: 78 }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-secondary">
            <span className="text-xs font-semibold">Durasi Belajar Mingguan</span>
            <Clock size={16} />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono">{learningPace.weeklyHours}j</span>
            <p className="text-[10px] text-success font-medium mt-1">{learningPace.paceTrend}</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-secondary">
            <span className="text-xs font-semibold">Prediksi Daya Serap</span>
            <Brain size={16} />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono">{learningPace.retentionRate}%</span>
            <p className="text-[10px] text-text-secondary mt-1">Dihitung dari ketepatan kuis</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-secondary">
            <span className="text-xs font-semibold">Jam Fokus Optimal</span>
            <Activity size={16} />
          </div>
          <div className="mt-4">
            <span className="text-sm font-bold text-text-primary">{learningPace.optimalStudyHour}</span>
            <p className="text-[10px] text-text-secondary mt-1">Akurasi kuis tertinggi dicapai pada jam ini</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start text-text-secondary">
            <span className="text-xs font-semibold">Indeks Kesiapan Ujian</span>
            <TrendingUp size={16} />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono">{readinessIndex.overall}%</span>
            <p className="text-[10px] text-accent font-semibold mt-1">Bobot penguasaan rata-rata subjek</p>
          </div>
        </Card>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary">Matriks Kesiapan Kognitif</h3>
              <p className="text-[11px] text-text-secondary">Estimasi kesiapan materi belajar dihitung dari interval pengulangan dan skor kuis aktif.</p>
            </div>

            <div className="space-y-4">
              {readinessIndex.subcategories.map((sub) => (
                <div key={sub.name} className="space-y-2 p-4 rounded-lg border border-border bg-bg-tertiary/20">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-text-primary truncate max-w-[280px]">{sub.name}</span>
                    <Badge variant={sub.score >= 80 ? 'success' : sub.score >= 60 ? 'warning' : 'danger'}>
                      {sub.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={sub.score} color={sub.score >= 80 ? 'success' : sub.score >= 60 ? 'warning' : 'danger'} className="h-1.5 flex-1" />
                    <span className="text-xs font-mono font-bold">{sub.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Advisor Panel */}
          <Card className="space-y-4 bg-bg-secondary relative overflow-hidden border border-border">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5 z-10 relative">
              <Sparkles size={14} className="text-accent" /> Saran Kembaran Digital AI
            </h3>
            
            <div className="space-y-3 z-10 relative">
              <div className="p-4 rounded border border-border bg-bg-tertiary/30 text-xs leading-relaxed text-text-secondary">
                &ldquo;Integrasi Kalkulus adalah subjek dengan penguasaan terendah Anda saat ini yaitu <span className="text-warning font-semibold font-mono">62%</span>. Berdasarkan histori, daya fokus Anda sangat tinggi ketika mempelajari konsep eksakta pada malam hari. Saya sarankan menjadwalkan sesi latihan Kalkulus selama 30 menit malam ini pukul 19:00.&rdquo;
              </div>

              <div className="flex justify-end">
                <Link href="/planner">
                  <Button size="sm" className="h-8 text-xs flex items-center gap-1">
                    Jadwalkan Otomatis Rekomendasi <ArrowRight size={12} />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <Heart size={14} className="text-accent" /> Ringkasan Kebiasaan Belajar
          </h3>
          <div className="space-y-3">
            {habits.map((h) => (
              <div key={h.title} className="p-3.5 rounded bg-bg-tertiary/40 border border-border space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-text-primary">{h.title}</span>
                  <span className="text-[10px] font-mono text-text-secondary bg-bg-secondary px-2 py-0.5 rounded border border-border">
                    {h.streak}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">{h.description}</p>
                <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-border/30">
                  <span className="text-text-tertiary font-mono">Kekuatan Kebiasaan</span>
                  <span className="text-accent font-mono font-bold">{h.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
