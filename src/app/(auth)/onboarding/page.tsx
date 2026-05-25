'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Rocket, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { updateProfile } = useUserStore();
  const [step, setStep] = useState(1);

  // Langkah 1: Subjek
  const [subjects, setSubjects] = useState<string[]>([]);
  const toggleSubject = (subj: string) => {
    setSubjects(prev =>
      prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]
    );
  };

  // Langkah 2: Goal Belajar / Mode AI
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [tutorMode, setTutorMode] = useState<'simple' | 'teacher' | 'professor' | 'exam' | 'debate'>('teacher');

  const availableSubjects = [
    'Fisika Kuantum',
    'Kimia Organik',
    'Kalkulus & Analisis',
    'Ilmu Saraf (Neuroscience)',
    'Sejarah Modern',
    'Mikroekonomi',
    'Kecerdasan Buatan',
    'Linguistik'
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      updateProfile({
        dailyGoalMinutes: dailyMinutes,
        weakTopics: subjects.map(s => ({ topic: s, mastery: 50 }))
      });
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-center items-center px-4 relative select-none">
      <Card className="max-w-xl w-full p-8 border border-border bg-bg-secondary shadow-md">
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-accent/20 text-accent px-2 py-0.5 rounded">LANGKAH {step} / 3</span>
            <h2 className="text-sm font-bold">Konfigurasi Workspace</h2>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-4 h-1 rounded transition-colors ${s <= step ? 'bg-accent' : 'bg-bg-tertiary'}`}
              />
            ))}
          </div>
        </div>

        {/* Langkah 1 Content */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold flex items-center gap-1.5">
                <BookOpen size={16} className="text-accent" /> Apa yang sedang Anda pelajari?
              </h3>
              <p className="text-xs text-text-secondary">Pilih subjek yang ingin diimpor ke peta Galaksi Pengetahuan Anda</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {availableSubjects.map((subj) => {
                const selected = subjects.includes(subj);
                return (
                  <div
                    key={subj}
                    onClick={() => toggleSubject(subj)}
                    className={`p-3 border rounded text-xs cursor-pointer transition-all duration-150 text-center ${
                      selected
                        ? 'border-accent bg-accent/5 text-text-primary'
                        : 'border-border bg-bg-tertiary/40 hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {subj}
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleNext} disabled={subjects.length === 0} className="w-28">
                Lanjut
              </Button>
            </div>
          </div>
        )}

        {/* Langkah 2 Content */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold flex items-center gap-1.5">
                <Calendar size={16} className="text-accent" /> Tentukan Intensitas Belajar
              </h3>
              <p className="text-xs text-text-secondary">Tentukan target waktu belajar harian dan profil kepribadian Tutor AI Anda</p>
            </div>

            {/* Daily Target Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-text-secondary">
                <span>Target Belajar Harian</span>
                <span className="text-accent">{dailyMinutes} Menit</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="5"
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="w-full accent-accent bg-bg-tertiary h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* AI Tutor Personalities */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-text-secondary">Mode Utama Tutor AI</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'simple', label: 'Metafora Sederhana', desc: 'Penjelasan bebas jargon menggunakan perbandingan dunia nyata.' },
                  { id: 'teacher', label: 'Pengajar Terbimbing', desc: 'Bimbingan interaktif langkah demi langkah disertai contoh soal.' },
                  { id: 'professor', label: 'Profesor Akademis', desc: 'Formulasi teoretis mendalam, pembuktian rumus, dan referensi jurnal.' }
                ].map((modeItem) => {
                  const active = tutorMode === modeItem.id;
                  return (
                    <div
                      key={modeItem.id}
                      onClick={() => setTutorMode(modeItem.id as any)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-150 flex flex-col ${
                        active
                          ? 'border-accent bg-accent/5'
                          : 'border-border bg-bg-tertiary/40 hover:bg-bg-tertiary'
                      }`}
                    >
                      <span className="text-xs font-bold text-text-primary">{modeItem.label}</span>
                      <span className="text-[11px] text-text-secondary mt-1">{modeItem.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border/40">
              <Button variant="ghost" onClick={() => setStep(1)} className="w-24">
                Kembali
              </Button>
              <Button onClick={handleNext} className="w-28">
                Lanjut
              </Button>
            </div>
          </div>
        )}

        {/* Langkah 3 Content */}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 bg-accent-subtle text-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Rocket size={24} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-bold">Sistem Operasi Belajar Siap</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                Sandbox belajar Anda telah dikonfigurasi. Klik tombol di bawah untuk meluncurkan dasbor Anda.
              </p>
            </div>

            <div className="bg-bg-tertiary/40 border border-border p-4 rounded-lg text-left max-w-sm mx-auto space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subjek Dipilih:</span>
                <span className="text-text-primary font-semibold">{subjects.length} Topik</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Target Harian:</span>
                <span className="text-text-primary font-semibold">{dailyMinutes} Menit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Profil Tutor:</span>
                <span className="text-text-primary font-semibold uppercase">{tutorMode}</span>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-border/40">
              <Button variant="ghost" onClick={() => setStep(2)} className="w-24">
                Kembali
              </Button>
              <Button onClick={handleNext} className="w-36 flex items-center gap-1.5 justify-center">
                Buka Dasbor <Sparkles size={12} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
