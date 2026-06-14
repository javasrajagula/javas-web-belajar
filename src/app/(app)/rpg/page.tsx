'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUserStore } from '@/stores/user-store';
import { useCurriculumStore } from '@/stores/curriculum-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, Award, Sparkles, Clock, Brain, Compass,
  ArrowUp, Lock, CheckCircle, Star, Zap, Trophy,
  Shield, Target, Crown, TrendingUp, BookOpen,
  Users, Plus, LogOut
} from 'lucide-react';
import { createGuild, joinGuild, leaveGuild, getGuildsList, getGlobalLeaderboard } from '@/lib/actions/guild';

const ACHIEVEMENT_LIST = [
  { id: 'first_lesson', title: 'Bintang Pertama', desc: 'Selesaikan pelajaran pertama Anda.', icon: Star, xpReward: 100, condition: (completed: number, streak: number, xp: number) => completed >= 1 },
  { id: 'streak_3', title: 'Pejuang Konsisten', desc: '3 hari berturut-turut belajar.', icon: Flame, xpReward: 150, condition: (_: number, streak: number) => streak >= 3 },
  { id: 'streak_7', title: 'Ritme Mingguan', desc: 'Pertahankan streak 7 hari!', icon: Trophy, xpReward: 500, condition: (_: number, streak: number) => streak >= 7 },
  { id: 'lessons_5', title: 'Penjelajah Ilmu', desc: 'Selesaikan 5 pelajaran berbeda.', icon: BookOpen, xpReward: 200, condition: (completed: number) => completed >= 5 },
  { id: 'lessons_10', title: 'Cendekiawan Muda', desc: 'Selesaikan 10 pelajaran.', icon: GraduationCapIcon, xpReward: 400, condition: (completed: number) => completed >= 10 },
  { id: 'xp_500', title: 'Penyihir XP', desc: 'Kumpulkan total 500 XP.', icon: Sparkles, xpReward: 250, condition: (_1: number, _2: number, xp: number) => xp >= 500 },
  { id: 'xp_1000', title: 'Maestro Pengetahuan', desc: 'Kumpulkan total 1000 XP.', icon: Crown, xpReward: 500, condition: (_1: number, _2: number, xp: number) => xp >= 1000 },
  { id: 'level_5', title: 'Pahlawan Akademik', desc: 'Capai Level 5.', icon: Shield, xpReward: 300, condition: (_1: number, _2: number, _3: number, level: number) => level >= 5 },
];

function GraduationCapIcon({ size = 16, className = '' }) {
  return <span className={`inline-block ${className}`} style={{ fontSize: size }}>🎓</span>;
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'Magang Pemula', 2: 'Pelajar Aktif', 3: 'Peneliti Mandiri',
  4: 'Cendekiawan Muda', 5: 'Master Akademis', 10: 'Penyihir Utama',
  20: 'Legenda Cendekiawan',
};

const getLevelTitle = (lvl: number) => {
  if (lvl >= 20) return LEVEL_TITLES[20];
  if (lvl >= 10) return LEVEL_TITLES[10];
  if (lvl >= 5) return LEVEL_TITLES[5];
  return LEVEL_TITLES[lvl] || LEVEL_TITLES[1];
};

const XP_PER_LEVEL = (lvl: number) => lvl * 500;

export default function StudyRPGPage() {
  const { profile, upgradeSkill, completeQuest, addXp, updateProfile } = useUserStore();
  const { completedLessons } = useCurriculumStore();
  const [activeTab, setActiveTab] = useState<'character' | 'skills' | 'quests' | 'achievements' | 'guild'>('character');

  const completedCount = Object.keys(completedLessons).length;

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [guilds, setGuilds] = useState<any[]>([]);
  const [loadingGuildData, setLoadingGuildData] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDesc, setNewGuildDesc] = useState('');
  const [creatingGuild, setCreatingGuild] = useState(false);

  const fetchGuildData = async () => {
    setLoadingGuildData(true);
    try {
      const [board, list] = await Promise.all([
        getGlobalLeaderboard(),
        getGuildsList()
      ]);
      setLeaderboard(board);
      setGuilds(list);
    } catch (err) {
      console.error("Failed to load Guilds/Leaderboard:", err);
    } finally {
      setLoadingGuildData(false);
    }
  };

  useEffect(() => {
    fetchGuildData();
  }, []);

  const handleCreateGuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuildName.trim()) return;
    setCreatingGuild(true);
    try {
      const created = await createGuild(newGuildName, newGuildDesc);
      updateProfile({ guildId: created.id });
      setNewGuildName('');
      setNewGuildDesc('');
      await fetchGuildData();
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingGuild(false);
    }
  };

  const handleJoinGuild = async (id: string) => {
    try {
      await joinGuild(id);
      updateProfile({ guildId: id });
      await fetchGuildData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveGuild = async () => {
    try {
      await leaveGuild();
      updateProfile({ guildId: null });
      await fetchGuildData();
    } catch (err) {
      console.error(err);
    }
  };

  const skillItems = [
    { key: 'focus' as const, label: 'Fokus Kognitif', desc: 'Meningkat dari sesi Pomodoro dan belajar tanpa gangguan.', icon: Clock, color: 'text-info bg-info/10 border-info/20', gradient: 'from-blue-500' },
    { key: 'logic' as const, label: 'Logika Sistemis', desc: 'Meningkat dari ketepatan menjawab kuis dan ujian diagnostik.', icon: Brain, color: 'text-accent bg-accent/10 border-accent/20', gradient: 'from-cyan-500' },
    { key: 'creativity' as const, label: 'Kreativitas Adaptif', desc: 'Meningkat dari menghubungkan konsep di Galaksi Pengetahuan.', icon: Compass, color: 'text-warning bg-warning/10 border-warning/20', gradient: 'from-amber-500' },
    { key: 'discipline' as const, label: 'Disiplin Rutin', desc: 'Meningkat dari konsistensi mencapai target belajar harian.', icon: Flame, color: 'text-danger bg-danger/10 border-danger/20', gradient: 'from-rose-500' },
  ];

  const xpNeeded = XP_PER_LEVEL(profile.level);
  const xpPercent = Math.min(100, Math.round((profile.xp / xpNeeded) * 100));

  const handleLevelSkill = (skillKey: typeof skillItems[number]['key']) => {
    if (profile.xp >= 150) {
      addXp(-150);
      upgradeSkill(skillKey, 5);
    }
  };

  // Check dynamic achievements
  const unlockedAchievements = ACHIEVEMENT_LIST.filter(ach =>
    ach.condition(completedCount, profile.streak, profile.xp, profile.level)
  );
  const lockedAchievements = ACHIEVEMENT_LIST.filter(ach =>
    !ach.condition(completedCount, profile.streak, profile.xp, profile.level)
  );

  const tabs = [
    { id: 'character', label: 'Karakter', icon: Star },
    { id: 'guild', label: 'Guild & Leaderboard', icon: Users },
    { id: 'skills', label: 'Pohon Skill', icon: TrendingUp },
    { id: 'quests', label: 'Misi', icon: Target },
    { id: 'achievements', label: 'Prestasi', icon: Award },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-lg bg-bg-secondary border border-border w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CHARACTER TAB */}
      {activeTab === 'character' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <Card className="relative overflow-hidden bg-bg-secondary border border-border">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/20 to-transparent rounded-bl-full" />
            <div className="relative z-10 flex flex-col items-center text-center p-6">
              <div className="relative mt-2">
                <Image src={profile.avatar} alt={profile.name} width={80} height={80} className="w-20 h-20 rounded-full border-2 border-accent shadow-lg shadow-accent/30" unoptimized />
                <div className="absolute -bottom-2 -right-2 bg-accent text-white font-mono font-black text-sm w-8 h-8 rounded-full flex items-center justify-center border-2 border-bg-secondary shadow-md">
                  {profile.level}
                </div>
              </div>

              <h2 className="text-base font-bold text-text-primary mt-5">{profile.name}</h2>
              <p className="text-[11px] text-accent font-mono font-semibold tracking-wider uppercase mt-1">
                {getLevelTitle(profile.level)}
              </p>

              {/* XP Bar */}
              <div className="w-full mt-5 space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-text-secondary">
                  <span>Menuju Tingkat {profile.level + 1}</span>
                  <span>{profile.xp} / {xpNeeded} XP</span>
                </div>
                <Progress value={xpPercent} color="accent" className="h-2" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 w-full mt-5 pt-5 border-t border-border/40">
                <div className="text-center p-3 rounded-lg bg-bg-tertiary/40">
                  <Flame size={16} className="text-warning mx-auto mb-1" />
                  <span className="text-base font-black font-mono text-warning">{profile.streak}</span>
                  <div className="text-[9px] text-text-tertiary mt-0.5 uppercase font-mono">Hari Beruntun</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-bg-tertiary/40">
                  <CheckCircle size={16} className="text-success mx-auto mb-1" />
                  <span className="text-base font-black font-mono text-success">{completedCount}</span>
                  <div className="text-[9px] text-text-tertiary mt-0.5 uppercase font-mono">Pelajaran Selesai</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-bg-tertiary/40">
                  <Clock size={16} className="text-info mx-auto mb-1" />
                  <span className="text-base font-black font-mono text-info">{profile.studyTimeToday}m</span>
                  <div className="text-[9px] text-text-tertiary mt-0.5 uppercase font-mono">Belajar Hari Ini</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-bg-tertiary/40">
                  <Trophy size={16} className="text-accent mx-auto mb-1" />
                  <span className="text-base font-black font-mono text-accent">{unlockedAchievements.length}</span>
                  <div className="text-[9px] text-text-tertiary mt-0.5 uppercase font-mono">Prestasi Diraih</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Daily Quests Preview */}
          <div className="space-y-4">
            <Card className="space-y-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Zap size={13} className="text-accent" /> Misi Harian Aktif
              </h3>
              {profile.dailyQuests.map((quest) => (
                <div key={quest.id} className="p-3 rounded border border-border bg-bg-tertiary/20 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-semibold ${quest.completed ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
                      {quest.title}
                    </span>
                    <Badge variant={quest.completed ? 'success' : 'primary'} className="text-[8px]">
                      +{quest.xpReward} XP
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(quest.current / quest.target) * 100} color={quest.completed ? 'success' : 'accent'} className="h-1 flex-1" />
                    <span className="text-[9px] font-mono text-text-secondary">{quest.current}/{quest.target}</span>
                  </div>
                </div>
              ))}
            </Card>

            {/* Level roadmap */}
            <Card className="space-y-3">
              <h3 className="text-sm font-bold text-text-primary">Peta Perjalanan Tingkat</h3>
              <div className="space-y-2">
                {[1, 2, 3, 5, 10, 20].map(lvl => {
                  const isPassed = profile.level > lvl;
                  const isCurrent = profile.level === lvl;
                  return (
                    <div key={lvl} className={`flex items-center gap-3 p-2.5 rounded text-xs ${
                      isCurrent ? 'bg-accent/10 border border-accent/20' : 
                      isPassed ? 'bg-success/5 border border-success/10' : 
                      'border border-border/30 opacity-40'
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                        isCurrent ? 'bg-accent text-white' : isPassed ? 'bg-success/20 text-success' : 'bg-bg-tertiary text-text-tertiary'
                      }`}>
                        {lvl}
                      </div>
                      <span className={`font-semibold ${isCurrent ? 'text-accent' : isPassed ? 'text-success' : 'text-text-tertiary'}`}>
                        {LEVEL_TITLES[lvl]}
                      </span>
                      {isPassed && <CheckCircle size={11} className="text-success ml-auto" />}
                      {isCurrent && <span className="text-[9px] text-accent font-mono ml-auto">SEKARANG</span>}
                      {!isCurrent && !isPassed && <Lock size={11} className="text-text-tertiary ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* GUILD TAB */}
      {activeTab === 'guild' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          
          {/* Global Leaderboard */}
          <Card className="p-5 border border-border bg-bg-secondary space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Trophy size={14} className="text-warning" /> Papan Peringkat Global (Top 10)
              </h3>
              <p className="text-[10px] text-text-secondary">Peringkat siswa dengan XP tertinggi secara real-time.</p>
            </div>

            {loadingGuildData ? (
              <div className="py-10 text-center text-xs text-text-secondary">Memuat leaderboard...</div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((user, idx) => {
                  const isCurrentUser = user.name === profile.name || user.email === profile.email;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                        isCurrentUser
                          ? 'border-accent bg-accent/5'
                          : 'border-border bg-bg-tertiary/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 font-mono font-bold text-center ${
                          idx === 0 ? 'text-yellow-400' :
                          idx === 1 ? 'text-gray-400' :
                          idx === 2 ? 'text-amber-600' :
                          'text-text-tertiary'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className={`font-semibold ${isCurrentUser ? 'text-accent' : 'text-text-primary'}`}>
                          {user.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-accent">{user.xp} XP</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Guild System */}
          <div className="space-y-6">
            
            {/* Active Guild Status */}
            {profile.guildId ? (
              (() => {
                const myGuild = guilds.find(g => g.id === profile.guildId);
                return (
                  <Card className="p-5 border border-border bg-bg-secondary space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-accent font-bold uppercase tracking-wider">GUILD SAYA</span>
                      <h3 className="text-base font-black text-text-primary mt-1">
                        🛡️ {myGuild ? myGuild.name : 'Memuat nama guild...'}
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed mt-1">
                        {myGuild?.description || 'Tidak ada deskripsi guild.'}
                      </p>
                    </div>

                    {myGuild && (
                      <div className="flex justify-between items-center text-[10px] font-mono text-text-tertiary bg-bg-tertiary/40 p-2.5 rounded border border-border/40">
                        <span>Anggota Aktif: {myGuild._count?.members || 1} siswa</span>
                        <span>Total XP: {myGuild.xp || 0} XP</span>
                      </div>
                    )}

                    <Button
                      onClick={handleLeaveGuild}
                      variant="outline"
                      className="w-full h-8 text-xs border-danger text-danger hover:bg-danger/10 flex items-center justify-center gap-1.5"
                    >
                      <LogOut size={12} /> Keluar Guild
                    </Button>
                  </Card>
                );
              })()
            ) : (
              <div className="space-y-6">
                {/* Create Guild Form */}
                <Card className="p-5 border border-border bg-bg-secondary space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                      <Plus size={14} className="text-primary" /> Buat Guild Baru
                    </h3>
                    <p className="text-[10px] text-text-secondary">Bentuk kelompok belajar mandiri bersama rekan sekolah.</p>
                  </div>
                  <form onSubmit={handleCreateGuild} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-text-tertiary uppercase block">Nama Guild</label>
                      <input
                        type="text"
                        required
                        value={newGuildName}
                        onChange={(e) => setNewGuildName(e.target.value)}
                        placeholder="Contoh: Python Wizards SMKN 2"
                        className="w-full h-9 px-3 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-text-tertiary uppercase block">Deskripsi Singkat</label>
                      <textarea
                        rows={2}
                        value={newGuildDesc}
                        onChange={(e) => setNewGuildDesc(e.target.value)}
                        placeholder="Deskripsikan fokus belajar kelompok Anda..."
                        className="w-full p-2.5 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary transition-colors resize-none"
                      />
                    </div>
                    <Button type="submit" disabled={creatingGuild} className="w-full h-9 text-xs">
                      {creatingGuild ? 'Membuat...' : 'Buat Guild'}
                    </Button>
                  </form>
                </Card>

                {/* Available Guilds List */}
                <Card className="p-5 border border-border bg-bg-secondary space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                      <Users size={14} className="text-accent" /> Guild Belajar Tersedia
                    </h3>
                    <p className="text-[10px] text-text-secondary">Gabung ke guild belajar yang sudah ada untuk mempercepat XP.</p>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {guilds.filter(g => g.id !== profile.guildId).length > 0 ? (
                      guilds.filter(g => g.id !== profile.guildId).map((guild) => (
                        <div key={guild.id} className="p-3 rounded border border-border bg-bg-tertiary/20 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-text-primary truncate">🛡️ {guild.name}</h4>
                            <p className="text-[10px] text-text-secondary truncate mt-0.5">{guild.description || 'Tidak ada deskripsi.'}</p>
                            <span className="text-[8.5px] font-mono text-text-tertiary block mt-1">
                              {guild._count?.members || 0} Anggota • {guild.xp || 0} XP
                            </span>
                          </div>
                          <Button
                            onClick={() => handleJoinGuild(guild.id)}
                            size="sm"
                            className="h-7 text-[10px] flex-shrink-0"
                          >
                            Gabung
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-text-tertiary text-center py-4">Belum ada guild lain yang tersedia.</p>
                    )}
                  </div>
                </Card>
              </div>
            )}

          </div>
        </div>
      )}

      {/* SKILLS TAB */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="p-4 bg-bg-secondary border border-border rounded-lg text-xs text-text-secondary">
            <span className="flex items-center gap-1.5 text-accent font-semibold mb-1">
              <Zap size={12} /> Cara Meningkatkan Skill
            </span>
            Tukarkan <strong className="text-text-primary">150 XP</strong> untuk menaikkan skill +5 poin. 
            Skill juga naik otomatis saat Anda menggunakan fitur terkait (Pomodoro, Kuis, Galaksi, Streak).
            XP Anda saat ini: <strong className="text-accent font-mono">{profile.xp} XP</strong>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skillItems.map((skill) => {
              const value = profile.skills[skill.key] || 0;
              const hasEnoughXp = profile.xp >= 150;
              const maxed = value >= 100;

              return (
                <Card key={skill.key} className="flex flex-col justify-between space-y-4 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${skill.gradient}/10 to-transparent rounded-bl-full pointer-events-none`} />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded ${skill.color}`}>
                        <skill.icon size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">{skill.label}</h4>
                        <p className="text-[10px] text-text-secondary mt-0.5 leading-tight">{skill.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black font-mono text-accent">{value}</span>
                      <span className="text-[9px] text-text-tertiary block">/ 100</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 relative z-10">
                    <Progress value={value} color="accent" className="h-2" />
                    <div className="flex justify-between text-[9px] font-mono text-text-tertiary">
                      <span>Level {Math.floor(value / 10)}</span>
                      <span>{value}%</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleLevelSkill(skill.key)}
                    disabled={!hasEnoughXp || maxed}
                    size="sm"
                    variant={hasEnoughXp && !maxed ? 'primary' : 'secondary'}
                    className="w-full h-8 text-[10px] flex items-center justify-center gap-1.5 relative z-10"
                  >
                    {maxed ? (
                      <><CheckCircle size={11} /> Skill Penuh!</>
                    ) : !hasEnoughXp ? (
                      <><Lock size={11} /> Butuh 150 XP</>
                    ) : (
                      <><ArrowUp size={11} /> Tingkatkan (-150 XP)</>
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* QUESTS TAB */}
      {activeTab === 'quests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Target size={14} className="text-primary" /> Misi Sistem Aktif
            </h3>
            <div className="space-y-3">
              {profile.dailyQuests.map((quest) => (
                <div key={quest.id} className="p-4 rounded border border-border bg-bg-tertiary/20 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">{quest.title}</h4>
                      <p className="text-[10px] text-text-secondary mt-0.5">
                        Kemajuan: <span className="font-mono font-semibold text-text-primary">{quest.current}</span> / {quest.target}
                      </p>
                    </div>
                    <Badge variant={quest.completed ? 'success' : 'primary'} className="text-[9px]">
                      +{quest.xpReward} XP
                    </Badge>
                  </div>
                  <Progress value={(quest.current / quest.target) * 100} color={quest.completed ? 'success' : 'accent'} className="h-1.5" />
                  {!quest.completed ? (
                    <Button onClick={() => completeQuest(quest.id)} size="sm" variant="secondary" className="w-full h-7 text-[10px]">
                      Tandai Selesai
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-success text-[10px]">
                      <CheckCircle size={11} /> Misi Selesai — XP Diberikan!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Sparkles size={14} className="text-warning" /> Cara Mendapatkan XP
            </h3>
            <div className="space-y-2">
              {[
                { action: 'Selesaikan 1 Pelajaran', xp: '+50 XP', color: 'text-primary' },
                { action: 'Jawab Kuis Benar', xp: '+50 XP/soal', color: 'text-accent' },
                { action: 'Selesaikan Misi Harian', xp: '+100-300 XP', color: 'text-success' },
                { action: 'Gunakan AI Tutor', xp: '+25 XP', color: 'text-info' },
                { action: 'Tingkatkan Skill', xp: '-150 XP', color: 'text-warning' },
                { action: 'Raih Achievement', xp: '+100-500 XP', color: 'text-yellow-400' },
              ].map(({ action, xp, color }) => (
                <div key={action} className="flex justify-between items-center p-2.5 rounded border border-border bg-bg-tertiary/20 text-xs">
                  <span className="text-text-secondary">{action}</span>
                  <span className={`font-mono font-bold ${color}`}>{xp}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ACHIEVEMENTS TAB */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {unlockedAchievements.length > 0 && (
            <div>
              <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest block mb-3 pl-1">
                ✅ Prestasi Diraih ({unlockedAchievements.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {unlockedAchievements.map(ach => (
                  <div key={ach.id} className="p-4 rounded-lg border border-warning/30 bg-warning/5 flex gap-3 items-start">
                    <div className="p-2 rounded bg-warning/10 text-warning flex-shrink-0">
                      <ach.icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">{ach.title}</h4>
                      <p className="text-[10px] text-text-secondary mt-0.5">{ach.desc}</p>
                      <span className="text-[9px] text-warning font-mono font-semibold mt-1 block">+{ach.xpReward} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest block mb-3 pl-1">
              🔒 Belum Diraih ({lockedAchievements.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lockedAchievements.map(ach => (
                <div key={ach.id} className="p-4 rounded-lg border border-border/30 bg-bg-tertiary/10 flex gap-3 items-start opacity-50">
                  <div className="p-2 rounded bg-bg-tertiary text-text-tertiary flex-shrink-0">
                    <Lock size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-tertiary">{ach.title}</h4>
                    <p className="text-[10px] text-text-tertiary mt-0.5">{ach.desc}</p>
                    <span className="text-[9px] text-text-tertiary font-mono mt-1 block">+{ach.xpReward} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
