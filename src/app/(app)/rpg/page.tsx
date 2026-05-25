'use client';

import React from 'react';
import { useUserStore } from '@/stores/user-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  Award, 
  Sparkles, 
  Clock, 
  Brain, 
  Compass,
  ArrowUp,
  Lock,
  CheckCircle
} from 'lucide-react';

export default function StudyRPGPage() {
  const { profile, upgradeSkill, completeQuest, addXp } = useUserStore();

  const getLevelTitle = (lvl: number) => {
    if (lvl >= 20) return 'Legenda Cendekiawan';
    if (lvl >= 10) return 'Penyihir Utama Akademis';
    if (lvl >= 5) return 'Master Cendekiawan';
    return 'Magang Pemula';
  };

  const skillItems = [
    { key: 'focus' as const, label: 'Fokus Kognitif', desc: 'Sesi belajar fokus tanpa terputus.', icon: Clock, color: 'text-info bg-info/10' },
    { key: 'logic' as const, label: 'Logika Sistemis', desc: 'Ketepatan dalam menjawab kuis & simulasi ujian.', icon: Brain, color: 'text-accent bg-accent/10' },
    { key: 'creativity' as const, label: 'Kreativitas Adaptif', desc: 'Menghubungkan antar materi di Galaksi Pengetahuan.', icon: Compass, color: 'text-warning bg-warning/10' },
    { key: 'discipline' as const, label: 'Disiplin Rutin', desc: 'Konsistensi mencapai target belajar harian.', icon: Flame, color: 'text-danger bg-danger/10' }
  ];

  const handleLevelSkill = (skillKey: 'focus' | 'logic' | 'creativity' | 'discipline') => {
    if (profile.xp >= 150) {
      addXp(-150);
      upgradeSkill(skillKey, 5);
    }
  };

  return (
    <div className="space-y-6">
      {/* RPG Profile Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Character Card */}
        <Card className="md:col-span-1 p-6 flex flex-col items-center text-center relative overflow-hidden bg-bg-secondary border border-border">
          <div className="absolute top-2 right-2">
            <Badge variant="primary" className="font-mono text-[9px]">
              KELAS: CENDEKIAWAN
            </Badge>
          </div>

          <div className="relative mt-4">
            <img src={profile.avatar} alt={profile.name} className="w-16 h-16 rounded-full border-2 border-accent" />
            <div className="absolute -bottom-2 -right-2 bg-accent text-white font-mono font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-bg-secondary">
              {profile.level}
            </div>
          </div>

          <h2 className="text-sm font-bold text-text-primary mt-4">{profile.name}</h2>
          <p className="text-[10px] text-accent font-mono font-semibold tracking-wider uppercase mt-1">
            {getLevelTitle(profile.level)}
          </p>

          <div className="w-full mt-6 space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-text-secondary">
              <span>Kemajuan Tingkat Berikutnya</span>
              <span>{profile.xp} / {profile.level * 500} XP</span>
            </div>
            <Progress value={(profile.xp / (profile.level * 500)) * 100} color="accent" className="h-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-6 border-t border-border/40 text-center">
            <div>
              <span className="text-[10px] text-text-tertiary uppercase font-mono block">Beruntun</span>
              <span className="text-sm font-bold text-warning font-mono">{profile.streak} Hari</span>
            </div>
            <div>
              <span className="text-[10px] text-text-tertiary uppercase font-mono block">Waktu Belajar</span>
              <span className="text-sm font-bold text-info font-mono">{profile.studyTimeToday}m hari ini</span>
            </div>
          </div>
        </Card>

        {/* Skill Tree Grid */}
        <Card className="md:col-span-2 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-text-primary">Pohon Kemampuan Belajar</h3>
            <p className="text-[11px] text-text-secondary">Tingkatkan status kemampuan belajar dengan menukarkan 150 XP. Kemampuan yang lebih tinggi membuka gelar kustom baru.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skillItems.map((skill) => {
              const value = profile.skills[skill.key] || 0;
              const hasEnougXp = profile.xp >= 150;

              return (
                <div key={skill.key} className="p-4 rounded-lg border border-border bg-bg-tertiary/20 flex flex-col justify-between space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${skill.color}`}>
                        <skill.icon size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">{skill.label}</h4>
                        <p className="text-[10px] text-text-secondary mt-0.5">{skill.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-accent">Lvl {value}</span>
                  </div>

                  <Progress value={value} color="accent" className="h-1" />

                  <Button
                    onClick={() => handleLevelSkill(skill.key)}
                    disabled={!hasEnougXp}
                    size="sm"
                    variant={hasEnougXp ? 'primary' : 'secondary'}
                    className="w-full h-8 text-[10px] flex items-center justify-center gap-1.5"
                  >
                    <ArrowUp size={11} /> Tingkatkan Status (-150 XP)
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Quests & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Quests */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <Sparkles size={14} className="text-accent" /> Misi Sistem Pembelajaran
          </h3>
          <div className="space-y-3">
            {profile.dailyQuests.map((quest) => (
              <div key={quest.id} className="p-3 rounded bg-bg-tertiary/40 border border-border flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-text-primary">{quest.title}</h4>
                  <p className="text-[10px] text-text-secondary">Kemajuan: {quest.current} / {quest.target}</p>
                </div>
                {!quest.completed ? (
                  <Button onClick={() => completeQuest(quest.id)} size="sm" variant="secondary" className="h-8 text-[10px]">
                    Selesaikan Misi
                  </Button>
                ) : (
                  <Badge variant="success" className="text-[9px] flex items-center gap-1.5">
                    <CheckCircle size={10} /> Selesai
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Unlocked Achievements */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <Award size={14} className="text-warning" /> Prestasi yang Diraih
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.achievements.map((ach) => {
              const isUnlocked = !!ach.unlockedAt;
              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded border flex gap-3 items-center ${
                    isUnlocked ? 'border-border bg-bg-tertiary/30' : 'border-border/30 bg-bg-tertiary/10 opacity-50'
                  }`}
                >
                  <div className={`p-2 rounded ${isUnlocked ? 'bg-warning/10 text-warning' : 'bg-bg-tertiary text-text-tertiary'}`}>
                    {isUnlocked ? <Award size={14} /> : <Lock size={14} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">{ach.title}</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">{ach.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
