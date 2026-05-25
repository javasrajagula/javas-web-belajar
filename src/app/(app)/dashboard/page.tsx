'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/stores/user-store';
import { useMaterialsStore } from '@/stores/materials-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Clock, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const { profile, addStudyTime } = useUserStore();
  const { materials } = useMaterialsStore();
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<any>(null);

  const startTimer = () => {
    if (isRunning) {
      clearInterval(intervalId);
      setIsRunning(false);
    } else {
      setIsRunning(true);
      const id = setInterval(() => {
        setTimerMinutes(prev => prev + 1);
        addStudyTime(1);
      }, 60000);
      setIntervalId(id);
    }
  };

  const stopTimer = () => {
    if (intervalId) clearInterval(intervalId);
    setIsRunning(false);
    setTimerMinutes(0);
    setShowFocusTimer(false);
  };

  const recommendations = [
    { title: 'Perkuat Keadaan Kuantum', desc: 'Penguasaan Anda saat ini adalah 42%. Tinjau peta konsep kustom di Otak Kedua.', route: '/brain/m-default-1' },
    { title: 'Konsultasikan ke Profesor AI', desc: 'Tanyakan pembuktian rumus sulit pada Claude di mode Profesor untuk validasi catatan.', route: '/tutor' },
    { title: 'Tuntaskan Misi Harian', desc: 'Dapatkan tambahan 150 XP dengan menyelesaikan target durasi belajar hari ini.', route: '/rpg' }
  ];

  const recentActivities = [
    { title: 'Bertanya Pada Tutor AI (Mode Pengajar)', time: '2 jam yang lalu', icon: Sparkles, color: 'text-accent' },
    { title: 'Mengunggah: intro_to_quantum.pdf', time: 'Kemarin', icon: Brain, color: 'text-info' },
    { title: 'Menyelesaikan Target Mingguan', time: '2 hari yang lalu', icon: Trophy, color: 'text-warning' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-bg-secondary border border-border p-6 rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-text-primary">
            Selamat datang kembali, {profile.name}
          </h1>
          <p className="text-xs text-text-secondary">
            Status sistem: Berjalan lancar. Beruntun belajar aktif selama <span className="text-accent font-semibold">{profile.streak} hari</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!showFocusTimer ? (
            <Button onClick={() => setShowFocusTimer(true)} className="flex items-center gap-2 h-9 text-xs">
              <Clock size={14} /> Mulai Pengukur Fokus
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-bg-tertiary px-3 py-1.5 rounded-md border border-border text-xs">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              <span className="font-mono">{timerMinutes}m belajar</span>
              <Button size="sm" onClick={startTimer} variant="ghost" className="h-6 px-2 text-[10px]">
                {isRunning ? 'Jeda' : 'Mulai'}
              </Button>
              <Button size="sm" onClick={stopTimer} variant="danger" className="h-6 px-2 text-[10px]">
                Berhenti
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Goal Card */}
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">Target Belajar Harian</span>
            <CheckCircle2 size={16} className="text-accent" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono">{profile.studyTimeToday}</span>
              <span className="text-xs text-text-secondary">/ {profile.dailyGoalMinutes}m</span>
            </div>
            <Progress value={(profile.studyTimeToday / profile.dailyGoalMinutes) * 100} color="accent" className="mt-2 h-1" />
          </div>
        </Card>

        {/* Level & XP */}
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">Tingkat Sistem</span>
            <Trophy size={16} className="text-warning" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono">Lvl {profile.level}</span>
              <span className="text-xs text-text-secondary">{profile.xp} XP</span>
            </div>
            <Progress value={(profile.xp / (profile.level * 500)) * 100} color="warning" className="mt-2 h-1" />
          </div>
        </Card>

        {/* Streak Heatmap */}
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">Beruntun Belajar</span>
            <Zap size={16} className="text-warning fill-warning" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono">{profile.streak} Hari</span>
            <div className="flex gap-1 mt-3">
              {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, idx) => {
                const hasStudied = idx < 5;
                return (
                  <div
                    key={day}
                    title={`${day}: ${hasStudied ? 'Target Tercapai' : 'Belum Ada Aktivitas'}`}
                    className={`flex-1 h-3 rounded-[2px] transition-colors ${
                      hasStudied ? 'bg-accent/80' : 'bg-bg-tertiary'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </Card>

        {/* Weak Topics */}
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">Topik Perlu Latihan</span>
            <TrendingUp size={16} className="text-danger" />
          </div>
          <div className="mt-4 space-y-1.5">
            {profile.weakTopics.slice(0, 2).map((wt) => (
              <div key={wt.topic} className="flex justify-between items-center text-xs">
                <span className="text-text-primary truncate max-w-[120px]">{wt.topic}</span>
                <span className="text-danger font-mono font-medium">{wt.mastery}% dikuasai</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-text-primary">Lanjutkan Belajar</h3>
              <Link href="/brain" className="text-xs text-accent hover:underline flex items-center gap-1">
                Lihat Otak Kedua <ChevronRight size={12} />
              </Link>
            </div>
            {materials.length > 0 ? (
              <div className="divide-y divide-border">
                {materials.slice(0, 2).map((mat) => (
                  <div key={mat.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between group">
                    <div className="space-y-1 min-w-0 flex-1 pr-4">
                      <h4 className="text-xs font-bold text-text-primary truncate group-hover:text-accent transition-colors duration-150">
                        {mat.title}
                      </h4>
                      <p className="text-[10px] text-text-secondary font-mono">
                        {mat.fileName} • {mat.fileSize}
                      </p>
                    </div>
                    <Link href={`/brain/${mat.id}`}>
                      <Button size="sm" variant="secondary" className="h-8 text-xs flex items-center gap-1">
                        Lanjut <ArrowRight size={12} />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-text-secondary border border-dashed border-border rounded-lg">
                Tidak ada materi belajar ditemukan di Otak Kedua Anda.
              </div>
            )}
          </Card>

          {/* AI Recommended Tasks */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Sparkles size={14} className="text-accent" /> Rekomendasi Adaptif Claude
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.slice(0, 2).map((rec) => (
                <div
                  key={rec.title}
                  className="p-4 rounded-lg border border-border bg-bg-tertiary/40 hover:bg-bg-tertiary transition-all duration-150 flex flex-col justify-between group"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-[11px] text-text-secondary leading-relaxed">{rec.desc}</p>
                  </div>
                  <Link href={rec.route} className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline">
                    Aktifkan <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Columns */}
        <div className="space-y-6">
          {/* Daily Quests List */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Trophy size={14} className="text-accent" /> Tugas Belajar Harian
            </h3>
            <div className="space-y-3">
              {profile.dailyQuests.map((quest) => (
                <div key={quest.id} className="space-y-1.5 p-3 rounded bg-bg-tertiary/50 border border-border">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-semibold ${quest.completed ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                      {quest.title}
                    </span>
                    <Badge variant={quest.completed ? 'success' : 'primary'} className="text-[9px]">
                      +{quest.xpReward} XP
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(quest.current / quest.target) * 100} color={quest.completed ? 'success' : 'accent'} className="h-1 flex-1" />
                    <span className="text-[10px] font-mono text-text-secondary">
                      {quest.current}/{quest.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* System Audit log */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary">Aktivitas Sistem</h3>
            <div className="space-y-3.5">
              {recentActivities.map((act) => (
                <div key={act.title} className="flex gap-3">
                  <act.icon size={16} className={`${act.color} mt-0.5`} />
                  <div className="space-y-0.5">
                    <h4 className="text-xs text-text-primary font-medium">{act.title}</h4>
                    <p className="text-[10px] text-text-secondary">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
