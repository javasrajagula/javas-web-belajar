'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, 
  Clock, 
  HelpCircle, 
  Award, 
  TrendingUp, 
  Sparkles,
  ChevronRight,
  ShieldQuestion,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { resolveSmkPathway } from '@/lib/pathway';
import { getJurusanLabel, resolveJurusanKode } from '@/lib/data/jurusan';

interface Jurusan {
  id: string;
  kode: string;
  nama: string;
  bidang?: string;
}

interface MataPelajaran {
  id: string;
  kode: string;
  nama: string;
  kelas: number;
}

export default function UjianMulaiPage() {
  const router = useRouter();
  const { profile } = useUserStore();
  const profileJurusanKode = resolveSmkPathway(profile.selectedPathway);

  const [jurusans, setJurusans] = useState<Jurusan[]>([]);
  const [selectedJurusanKode, setSelectedJurusanKode] = useState(profileJurusanKode);
  const [mapels, setMapels] = useState<MataPelajaran[]>([]);
  const [selectedMapelId, setSelectedMapelId] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('ujian_bab');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJurusans() {
      try {
        const res = await fetch('/api/jurusan');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setJurusans(data);
      } catch (err) {
        toast.error('Gagal memuat daftar jurusan.');
      }
    }
    loadJurusans();
  }, []);

  useEffect(() => {
    setSelectedJurusanKode(resolveJurusanKode(profile.selectedPathway));
  }, [profile.selectedPathway]);

  useEffect(() => {
    async function loadMapels() {
      try {
        setLoading(true);
        const res = await fetch(`/api/jurusan/${selectedJurusanKode}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMapels(data.mataPelajaran || []);
        if (data.mataPelajaran && data.mataPelajaran.length > 0) {
          setSelectedMapelId(data.mataPelajaran[0].id);
        }
      } catch (err) {
        toast.error('Gagal memuat mata pelajaran.');
      } finally {
        setLoading(false);
      }
    }
    loadMapels();
  }, [selectedJurusanKode]);

  const examModes = [
    {
      id: 'latihan_santai',
      name: 'Latihan Santai',
      description: 'Latihan soal tanpa batasan waktu. Pembahasan instan muncul tepat setelah Anda mengirim jawaban untuk tiap nomor.',
      duration: 'Bebas',
      soal: '10 Soal',
      icon: HelpCircle,
      color: 'border-success/30 bg-success-subtle/10 text-success',
      badge: 'Santai'
    },
    {
      id: 'ujian_bab',
      name: 'Ujian Bab (Kuis)',
      description: 'Format simulasi kuis per bab terstruktur. Timer diaktifkan dan pembahasan diberikan setelah seluruh lembar jawaban dikumpulkan.',
      duration: '30 Menit',
      soal: '10 Soal',
      icon: Clock,
      color: 'border-primary/30 bg-primary-subtle/10 text-primary',
      badge: 'Fokus'
    },
    {
      id: 'ujian_semester',
      name: 'Ujian Akhir Semester (UAS)',
      description: 'Asesmen komprehensif mencakup materi multi-bab dalam satu semester. Dirancang mirip dengan ujian akhir sekolah asli.',
      duration: '60 Menit',
      soal: '20 Soal',
      icon: ClipboardList,
      color: 'border-warning/30 bg-warning-subtle/10 text-warning',
      badge: 'Ujian Resmi'
    },
    {
      id: 'tryout_un',
      name: 'Tryout Uji Kompetensi Keahlian (UKK)',
      description: 'Ujian simulasi profesional standar industri nasional untuk siswa kejuruan. Soal mencakup materi teoritis dasar kejuruan.',
      duration: '90 Menit',
      soal: '30 Soal',
      icon: Award,
      color: 'border-danger/30 bg-danger-subtle/10 text-danger',
      badge: 'Ujian Nasional'
    },
    {
      id: 'adaptif',
      name: 'Adaptif AI',
      description: 'Mesin ujian cerdas. Tingkat kesulitan soal disesuaikan otomatis dengan tingkat akurasimu (menjawab benar -> soal berikutnya makin sukar).',
      duration: 'Bebas',
      soal: '15 Soal',
      icon: Sparkles,
      color: 'border-secondary/30 bg-secondary-subtle/10 text-secondary',
      badge: 'AI Cerdas'
    }
  ];

  const handleStartExam = () => {
    if (!selectedMapelId) {
      toast.error('Pilih mata pelajaran terlebih dahulu!');
      return;
    }
    
    router.push(`/ujian/${selectedMapelId}?mode=${selectedMode}`);
  };

  return (
    <div className="contrast-safe flex flex-col gap-6 animate-fade-in text-text-primary max-w-4xl mx-auto py-4">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldQuestion className="text-primary w-5.5 h-5.5" />
          Mulai Ujian & Evaluasi
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Pilih mata pelajaran kejuruan aktif dan tentukan mode ujian untuk melatih pemahaman materi industri Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Select Mapel */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <Card className="p-5 border border-border bg-bg-secondary/20 flex flex-col gap-4">
            <div className="flex items-center gap-1.5 border-b border-border/40 pb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Pilih Mata Pelajaran</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-text-secondary uppercase">Jurusan Aktif Anda</label>
              <select
                value={selectedJurusanKode}
                onChange={(event) => setSelectedJurusanKode(resolveJurusanKode(event.target.value))}
                className="h-9 px-3 bg-bg-tertiary/40 border border-border/80 rounded text-xs text-text-primary flex items-center font-bold focus:outline-none focus:border-primary"
              >
                {jurusans.length > 0 ? (
                  jurusans.map((jurusan) => (
                    <option key={jurusan.kode} value={jurusan.kode}>
                      {jurusan.nama} ({jurusan.kode})
                    </option>
                  ))
                ) : (
                  <option value={selectedJurusanKode}>
                    {getJurusanLabel(selectedJurusanKode)} ({selectedJurusanKode})
                  </option>
                )}
              </select>
              {selectedJurusanKode !== profileJurusanKode && (
                <p className="text-[10px] text-warning">
                  Mode ujian memakai jurusan manual: {getJurusanLabel(selectedJurusanKode)}. Profil tetap {getJurusanLabel(profileJurusanKode)}.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[10px] font-mono text-text-secondary uppercase">Pelajaran Kejuruan</label>
              {loading ? (
                <div className="h-9 w-full bg-bg-tertiary animate-pulse rounded"></div>
              ) : mapels.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {mapels.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMapelId(m.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedMapelId === m.id
                          ? 'border-primary bg-primary-subtle/10 text-white font-semibold'
                          : 'border-border bg-bg-tertiary/10 text-text-secondary hover:text-white'
                      }`}
                    >
                      <div className="text-xs truncate">{m.nama}</div>
                      <div className="text-[9px] font-mono text-text-tertiary mt-1">Kelas {m.kelas} • Kode: {m.kode}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-text-muted py-4 text-center">Tidak ada mata pelajaran di jurusan ini.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Select Mode */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Card className="p-5 border border-border bg-bg-secondary/20 flex flex-col gap-4">
            <div className="flex items-center gap-1.5 border-b border-border/40 pb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Pilih Mode Evaluasi</span>
            </div>

            <div className="flex flex-col gap-3">
              {examModes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;

                return (
                  <div
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-4 ${
                      isSelected
                        ? 'border-primary bg-primary-subtle/5 shadow-xs'
                        : 'border-border bg-bg-tertiary/10 hover:border-border-subtle hover:bg-bg-tertiary/20'
                    }`}
                  >
                    <div className={`p-3 rounded-lg border ${mode.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-text-secondary'}`}>
                          {mode.name}
                        </h4>
                        <Badge variant="primary" className="text-[8px] bg-bg-tertiary border-border text-text-tertiary font-mono">
                          {mode.badge}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
                        {mode.description}
                      </p>
                      <div className="flex gap-4 mt-2.5 text-[9px] text-text-tertiary font-mono uppercase tracking-wider">
                        <span>Waktu: <strong className="text-text-secondary">{mode.duration}</strong></span>
                        <span>Beban: <strong className="text-text-secondary">{mode.soal}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border/40 pt-4 mt-2 flex justify-end">
              <Button
                disabled={!selectedMapelId}
                onClick={handleStartExam}
                className="h-10 text-xs px-6 font-bold flex items-center gap-1 bg-primary hover:bg-primary-hover text-white"
              >
                Mulai Ujian Sekarang <ChevronRight size={14} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
