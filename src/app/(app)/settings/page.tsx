'use client';

import React, { useState } from 'react';
import { useUserStore } from '@/stores/user-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  User, 
  BookOpen, 
  Clock, 
  Sparkles,
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const { profile, updateProfile } = useUserStore();

  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyGoalMinutes);
  
  // Curriculum Select states
  const [schoolType, setSchoolType] = useState(profile.schoolType);
  const [grade, setGrade] = useState(profile.grade);
  const [selectedPathway, setSelectedPathway] = useState(profile.selectedPathway);
  
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      avatar,
      dailyGoalMinutes: dailyGoal,
      schoolType,
      grade,
      selectedPathway
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const getAvailablePathways = () => {
    if (schoolType === 'sma') {
      return ['Umum', 'IPA (MIPA)', 'IPS (IIS)', 'Bahasa'];
    } else {
      return ['Rekayasa Perangkat Lunak (RPL)', 'Teknik Komputer Jaringan (TKJ)', 'Desain Komunikasi Visual (DKV)', 'Akuntansi'];
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
          <Settings size={16} className="text-primary" /> Pengaturan Sistem Operasi Belajar
        </h3>
        <Badge variant="secondary" className="font-mono text-[9px]">OMEGA v1.0.0</Badge>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <Card className="space-y-4">
          <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5 border-b border-border/20 pb-2">
            <User size={13} className="text-primary" /> Informasi Pribadi
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-text-secondary uppercase">Nama Lengkap</label>
              <input
                type="text" required
                value={name} onChange={e => setName(e.target.value)}
                className="w-full h-9 px-3 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-text-secondary uppercase">URL Foto Avatar</label>
              <input
                type="url" required
                value={avatar} onChange={e => setAvatar(e.target.value)}
                className="w-full h-9 px-3 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </Card>

        {/* Dynamic National Curriculum Selector */}
        <Card className="space-y-4">
          <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5 border-b border-border/20 pb-2">
            <BookOpen size={13} className="text-secondary" /> Konfigurasi Jalur Kurikulum Merdeka
          </h4>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Menentukan jenis mata pelajaran dan capaian kompetensi nasional yang akan diujikan pada Dasbor, Galaksi, dan Halaman Subjek.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tipe Sekolah */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-text-secondary uppercase">Tipe Sekolah</label>
              <select
                value={schoolType}
                onChange={e => {
                  const val = e.target.value as 'sma' | 'smk';
                  setSchoolType(val);
                  setSelectedPathway(val === 'sma' ? 'Umum' : 'Rekayasa Perangkat Lunak (RPL)');
                }}
                className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="sma">SMA (Akademik)</option>
                <option value="smk">SMK (Vokasi/Kejuruan)</option>
              </select>
            </div>

            {/* Tingkat Kelas */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-text-secondary uppercase">Tingkat Kelas</label>
              <select
                value={grade}
                onChange={e => setGrade(Number(e.target.value))}
                className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary"
              >
                <option value={10}>Kelas X (Fase E)</option>
                <option value={11}>Kelas XI (Fase F)</option>
                <option value={12}>Kelas XII (Fase F)</option>
              </select>
            </div>

            {/* Jurusan/Pathway */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-text-secondary uppercase">Fokus / Jurusan</label>
              <select
                value={selectedPathway}
                onChange={e => setSelectedPathway(e.target.value)}
                className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary"
              >
                {getAvailablePathways().map((path, i) => (
                  <option key={i} value={path}>{path}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Daily Study Planner Target */}
        <Card className="space-y-4">
          <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5 border-b border-border/20 pb-2">
            <Clock size={13} className="text-accent" /> Target Agenda Belajar
          </h4>
          
          <div className="space-y-1.5 max-w-xs">
            <label className="text-[10px] font-semibold text-text-secondary uppercase">Target Belajar Harian (Menit)</label>
            <div className="flex items-center gap-3">
              <input
                type="number" required min="10" max="300"
                value={dailyGoal} onChange={e => setDailyGoal(Number(e.target.value))}
                className="w-24 h-9 px-3 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary"
              />
              <span className="text-xs text-text-secondary">Menit per Hari</span>
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-success bg-success-subtle/10 border border-success/20 px-3 rounded-md animate-fade-in">
              <Check size={12} /> Berhasil disimpan
            </div>
          )}
          <Button type="submit" className="h-10 px-6 text-xs flex items-center gap-1.5">
            <Sparkles size={13} /> Simpan Seluruh Konfigurasi
          </Button>
        </div>
      </form>
    </div>
  );
}
