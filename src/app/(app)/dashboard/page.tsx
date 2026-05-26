'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/stores/user-store';
import { useCurriculumStore } from '@/stores/curriculum-store';
import { getSubjectsByPathway } from '@/lib/curriculum-data';
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
  TrendingUp,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Coffee,
  CloudRain,
  Music,
  BookOpen
} from 'lucide-react';

export default function DashboardPage() {
  const { profile, addStudyTime } = useUserStore();
  const { completedLessons } = useCurriculumStore();
  
  // Pomodoro Focus Engine States
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  
  // Soundscape States
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(prev => prev - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(prev => prev - 1);
          setTimerSeconds(59);
          if ((selectedDuration * 60 - (timerMinutes * 60 + timerSeconds)) % 60 === 0) {
            addStudyTime(1);
          }
        } else {
          setIsRunning(false);
          alert('Sesi Fokus Selesai! Waktunya istirahat sejenak.');
          setShowFocusTimer(false);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerMinutes, timerSeconds]);

  const startTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = (duration: number) => {
    setIsRunning(false);
    setSelectedDuration(duration);
    setTimerMinutes(duration);
    setTimerSeconds(0);
  };

  const toggleSound = (soundId: string) => {
    if (activeSound === soundId) {
      setIsPlayingSound(!isPlayingSound);
    } else {
      setActiveSound(soundId);
      setIsPlayingSound(true);
    }
  };

  const soundscapes = [
    { id: 'lofi', label: 'Lofi Chill', icon: Music, desc: 'Beat santai pengiring fokus' },
    { id: 'rain', label: 'Hujan Lebat', icon: CloudRain, desc: 'Frekuensi alam penenang otak' },
    { id: 'cafe', label: 'Kafe Cyberpunk', icon: Coffee, desc: 'Suara latar ambient produktif' }
  ];

  // Get matching curriculum lessons
  const subjects = getSubjectsByPathway(profile.schoolType, profile.grade);
  const recommendedLessons = subjects.flatMap(sub => 
    sub.modules.flatMap(mod => 
      mod.lessons.map(les => ({
        ...les,
        subjectTitle: sub.title,
        moduleTitle: mod.title
      }))
    )
  ).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-bg-secondary border border-border p-6 rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary" className="text-[9px] uppercase font-mono bg-primary/10 text-primary border-primary/20">
              Jalur: {profile.schoolType === 'sma' ? 'SMA' : 'SMK'} - {profile.selectedPathway}
            </Badge>
            <Badge variant="secondary" className="text-[9px] uppercase font-mono bg-secondary/10 text-secondary border-secondary/20">
              Kelas {profile.grade}
            </Badge>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary pt-1">
            Selamat datang kembali, {profile.name}
          </h1>
          <p className="text-xs text-text-secondary">
            Sistem aktif. Target harian belajar Anda dipertahankan selama <span className="text-primary font-semibold">{profile.streak} hari beruntun</span>.
          </p>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          {!showFocusTimer ? (
            <Button onClick={() => setShowFocusTimer(true)} className="flex items-center gap-2 h-9 text-xs">
              <Clock size={14} /> Buka Ruang Pomodoro
            </Button>
          ) : (
            <Button onClick={() => setShowFocusTimer(false)} variant="secondary" className="h-9 text-xs">
              Tutup Pengukur Fokus
            </Button>
          )}
        </div>
      </div>

      {/* Pomodoro Focus & Sounds */}
      {showFocusTimer && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          <Card className="lg:col-span-2 flex flex-col justify-between p-6 bg-gradient-to-br from-bg-secondary to-bg-tertiary/20 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-text-secondary tracking-widest font-mono">POMODORO FOCUS DECK</span>
              <div className="flex gap-1.5">
                {[25, 50, 60].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => resetTimer(dur)}
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold border cursor-pointer transition-colors ${
                      selectedDuration === dur
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-bg-tertiary/60 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {dur} Menit
                  </button>
                ))}
              </div>
            </div>

            <div className="py-8 text-center">
              <h2 className="text-6xl font-extrabold font-mono text-text-primary tracking-tight">
                {timerMinutes.toString().padStart(2, '0')}:{timerSeconds.toString().padStart(2, '0')}
              </h2>
              <p className="text-[10px] text-text-tertiary mt-2">Status: {isRunning ? 'Fokus aktif' : 'Jeda'}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={startTimer} className="flex-grow flex items-center justify-center gap-1.5 h-9 text-xs">
                {isRunning ? <Pause size={12} /> : <Play size={12} />} {isRunning ? 'Jeda Sesi' : 'Mulai Sesi'}
              </Button>
              <Button onClick={() => resetTimer(selectedDuration)} variant="secondary" className="h-9 text-xs">
                Mulai Ulang
              </Button>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary">Terapi Suara Ambient</h3>
              <p className="text-[11px] text-text-secondary">Aktifkan frekuensi suara untuk merangsang konsentrasi gelombang otak.</p>
            </div>

            <div className="space-y-2">
              {soundscapes.map((sound) => {
                const isActive = activeSound === sound.id;
                const isPlayingThis = isActive && isPlayingSound;
                return (
                  <div
                    key={sound.id}
                    onClick={() => toggleSound(sound.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-150 flex items-center justify-between ${
                      isPlayingThis
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-bg-tertiary/40 hover:bg-bg-tertiary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded ${isPlayingThis ? 'bg-primary/10 text-primary' : 'bg-bg-secondary text-text-secondary'}`}>
                        <sound.icon size={13} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">{sound.label}</h4>
                        <p className="text-[9px] text-text-secondary mt-0.5">{sound.desc}</p>
                      </div>
                    </div>
                    {isPlayingThis ? <Volume2 size={13} className="text-primary animate-pulse" /> : <VolumeX size={13} className="text-text-tertiary" />}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Target Progress Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Target */}
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">Target Harian</span>
            <CheckCircle2 size={16} className="text-primary" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono">{profile.studyTimeToday}</span>
              <span className="text-xs text-text-secondary">/ {profile.dailyGoalMinutes}m</span>
            </div>
            <Progress value={(profile.studyTimeToday / profile.dailyGoalMinutes) * 100} color="accent" className="mt-2 h-1" />
          </div>
        </Card>

        {/* Level RPG */}
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">Tingkat Kemampuan</span>
            <Trophy size={16} className="text-accent" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono">Tingkat {profile.level}</span>
              <span className="text-xs text-text-secondary">{profile.xp} XP</span>
            </div>
            <Progress value={(profile.xp / (profile.level * 500)) * 100} color="accent" className="mt-2 h-1" />
          </div>
        </Card>

        {/* Streak */}
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-secondary">Beruntun Belajar</span>
            <Zap size={16} className="text-accent fill-accent" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono">{profile.streak} Hari</span>
            <div className="flex gap-1 mt-3">
              {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, idx) => {
                const hasStudied = idx < 5;
                return (
                  <div
                    key={day}
                    className={`flex-1 h-3 rounded-[2px] ${
                      hasStudied ? 'bg-primary/80' : 'bg-bg-tertiary'
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
            <span className="text-xs font-semibold text-text-secondary">Topik Butuh Latihan</span>
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
        
        {/* Left Side: Lesson Progression */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Subjects Progress list */}
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-text-primary">Mata Pelajaran Kurikulum Aktif</h3>
              <Link href="/subjects" className="text-xs text-primary hover:underline flex items-center gap-1">
                Buka Peta Kurikulum <ChevronRight size={12} />
              </Link>
            </div>

            <div className="divide-y divide-border">
              {recommendedLessons.map((les) => {
                if (!les.id) return null;
                const isCompleted = completedLessons[les.id];
                return (
                  <div key={les.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between group">
                    <div className="space-y-1 min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" className="text-[8px] px-1 py-0 font-mono bg-primary/10 text-primary border-primary/20">
                          {les.subjectTitle}
                        </Badge>
                        <span className="text-[9px] font-mono text-text-tertiary">{les.moduleTitle}</span>
                      </div>
                      <h4 className="text-xs font-bold text-text-primary truncate group-hover:text-primary transition-colors mt-1">
                        {les.title}
                      </h4>
                    </div>
                    <Link href={`/lessons/${les.id}`}>
                      <Button size="sm" variant="secondary" className="h-8 text-xs flex items-center gap-1.5">
                        {isCompleted ? 'Pelajari Ulang' : 'Mulai Belajar'} <ArrowRight size={12} />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Achievements RPG */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Trophy size={14} className="text-accent" /> Misi Aktivitas Harian
            </h3>
            <div className="space-y-3">
              {profile.dailyQuests.map((quest) => (
                <div key={quest.id} className="space-y-1.5 p-3 rounded bg-bg-tertiary/40 border border-border">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-semibold ${quest.completed ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                      {quest.title}
                    </span>
                    <Badge variant={quest.completed ? 'success' : 'primary'} className="text-[8px]">
                      +{quest.xpReward} XP
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(quest.current / quest.target) * 100} color={quest.completed ? 'success' : 'accent'} className="h-1 flex-1" />
                    <span className="text-[9px] font-mono text-text-secondary">
                      {quest.current}/{quest.target}
                    </span>
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
