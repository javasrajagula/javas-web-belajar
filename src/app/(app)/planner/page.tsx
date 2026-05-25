'use client';

import React, { useState, useMemo } from 'react';
import { usePlannerStore } from '@/stores/planner-store';
import { useUserStore } from '@/stores/user-store';
import { getSubjectsByPathway } from '@/lib/curriculum-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  CheckSquare, 
  Square, 
  Trash2, 
  Sparkles, 
  Plus,
  Clock,
  BookOpen,
  Zap,
  Target,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DURATION_OPTIONS = [15, 25, 30, 45, 60, 90, 120];

export default function SmartPlannerPage() {
  const { tasks, addTask, toggleTask, deleteTask, generateAISchedule } = usePlannerStore();
  const { profile } = useUserStore();

  // Load curriculum subjects dynamically
  const curriculumSubjects = useMemo(
    () => getSubjectsByPathway(profile.schoolType, profile.grade).map(s => s.title),
    [profile.schoolType, profile.grade]
  );

  const [taskTitle, setTaskTitle] = useState('');
  const [taskTopic, setTaskTopic] = useState('');
  const [taskDuration, setTaskDuration] = useState(30);
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);

  // AI Generator
  const [aiDays, setAiDays] = useState(7);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Week navigation
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekDates = (offset: number) => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  };

  const weekDates = getWeekDates(weekOffset);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskTopic) return;
    addTask({
      title: taskTitle,
      date: taskDate,
      duration: taskDuration,
      completed: false,
      category: 'study',
      topic: taskTopic
    });
    setTaskTitle('');
  };

  const handleToggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleGenerateAI = async () => {
    if (selectedTopics.length === 0) return;
    setIsGenerating(true);
    await new Promise(res => setTimeout(res, 800));
    generateAISchedule(selectedTopics, aiDays);
    setIsGenerating(false);
  };

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalMinutes = tasks.filter(t => t.completed).reduce((acc, t) => acc + t.duration, 0);

  const getTasksForDate = (date: string) => tasks.filter(t => t.date === date);

  const weekLabel = () => {
    const start = new Date(weekDates[0]);
    const end = new Date(weekDates[6]);
    return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} — ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Agenda', value: totalTasks, icon: BookOpen, color: 'text-primary' },
          { label: 'Selesai', value: completedTasks, icon: CheckSquare, color: 'text-success' },
          { label: 'Tingkat Selesai', value: `${completionRate}%`, icon: Target, color: 'text-accent' },
          { label: 'Menit Belajar', value: `${totalMinutes}m`, icon: Clock, color: 'text-warning' },
        ].map((stat) => (
          <Card key={stat.label} className="flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-text-secondary">{stat.label}</span>
              <stat.icon size={15} className={stat.color} />
            </div>
            <span className={`text-2xl font-bold font-mono mt-3 ${stat.color}`}>{stat.value}</span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Forms */}
        <div className="space-y-5">
          {/* Manual Task Add */}
          <Card className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Plus size={14} className="text-primary" /> Tambah Sesi Belajar
              </h3>
              <p className="text-[11px] text-text-secondary">Jadwalkan sesi khusus untuk satu mata pelajaran.</p>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Nama Sesi</label>
                <input
                  type="text"
                  required
                  placeholder="Cth: Latihan Soal Integral"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full h-9 px-3 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Mata Pelajaran</label>
                <select
                  required
                  value={taskTopic}
                  onChange={(e) => setTaskTopic(e.target.value)}
                  className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="">-- Pilih Mapel --</option>
                  {curriculumSubjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-text-secondary uppercase">Tanggal</label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-text-secondary uppercase">Durasi</label>
                  <select
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(Number(e.target.value))}
                    className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    {DURATION_OPTIONS.map(d => (
                      <option key={d} value={d}>{d} Menit</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button type="submit" className="w-full h-9 text-xs flex items-center justify-center gap-1.5">
                <Plus size={14} /> Tambah ke Jadwal
              </Button>
            </form>
          </Card>

          {/* AI Schedule Generator */}
          <Card className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Sparkles size={14} className="text-accent" /> Distribusi Jadwal AI
              </h3>
              <p className="text-[11px] text-text-secondary">
                AI akan membagikan sesi belajar mata pelajaran pilihan secara merata berdasarkan prinsip <em>spaced repetition</em>.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Pilih Mata Pelajaran</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {curriculumSubjects.map((topic) => {
                    const active = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleToggleTopic(topic)}
                        className={`px-2.5 py-1 rounded border text-[10px] font-medium transition-colors cursor-pointer ${
                          active
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-bg-tertiary text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Rentang Distribusi</label>
                <select
                  value={aiDays}
                  onChange={(e) => setAiDays(Number(e.target.value))}
                  className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="3">3 Hari ke Depan</option>
                  <option value="7">7 Hari (1 Minggu)</option>
                  <option value="14">14 Hari (2 Minggu)</option>
                </select>
              </div>

              <Button
                onClick={handleGenerateAI}
                disabled={selectedTopics.length === 0 || isGenerating}
                className="w-full h-9 text-xs flex items-center justify-center gap-1.5"
              >
                {isGenerating ? (
                  <><Sparkles size={12} className="animate-spin" /> Menyusun jadwal optimal...</>
                ) : (
                  <><Zap size={13} /> Buat Jadwal AI Cerdas</>
                )}
              </Button>

              {selectedTopics.length > 0 && (
                <div className="flex items-center justify-between text-[10px] text-text-tertiary">
                  <span>{selectedTopics.length} mata pelajaran dipilih</span>
                  <button onClick={() => setSelectedTopics([])} className="flex items-center gap-1 hover:text-text-secondary transition-colors cursor-pointer">
                    <RotateCcw size={10} /> Reset
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Weekly Calendar */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="space-y-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Calendar size={14} className="text-accent" /> Kalender Mingguan
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-text-tertiary">{weekLabel()}</span>
                <button onClick={() => setWeekOffset(o => o - 1)} className="p-1 rounded hover:bg-bg-tertiary transition-colors cursor-pointer">
                  <ChevronLeft size={14} className="text-text-secondary" />
                </button>
                <button onClick={() => setWeekOffset(0)} className="text-[9px] px-1.5 py-0.5 rounded border border-border text-text-secondary hover:bg-bg-tertiary transition-colors cursor-pointer font-mono">
                  HARI INI
                </button>
                <button onClick={() => setWeekOffset(o => o + 1)} className="p-1 rounded hover:bg-bg-tertiary transition-colors cursor-pointer">
                  <ChevronRight size={14} className="text-text-secondary" />
                </button>
              </div>
            </div>

            {/* 7-day grid */}
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, dayIdx) => {
                const dayTasks = getTasksForDate(date);
                const isToday = date === todayStr;
                const dateObj = new Date(date + 'T00:00:00');
                return (
                  <div key={date} className={`flex flex-col rounded-lg border transition-colors ${isToday ? 'border-primary bg-primary/5' : 'border-border bg-bg-tertiary/10'}`}>
                    <div className={`p-1.5 text-center border-b ${isToday ? 'border-primary/30' : 'border-border/40'}`}>
                      <div className="text-[9px] font-mono text-text-tertiary uppercase">{DAYS_ID[dateObj.getDay()]}</div>
                      <div className={`text-sm font-black mt-0.5 ${isToday ? 'text-primary' : 'text-text-primary'}`}>
                        {dateObj.getDate()}
                      </div>
                    </div>
                    <div className="p-1.5 space-y-1 flex-1 min-h-[80px]">
                      {dayTasks.map(t => (
                        <div
                          key={t.id}
                          onClick={() => toggleTask(t.id)}
                          className={`p-1 rounded text-[8px] cursor-pointer leading-tight border transition-colors ${
                            t.completed
                              ? 'border-success/20 bg-success/5 text-success/60 line-through'
                              : 'border-accent/20 bg-accent/5 text-accent hover:bg-accent/10'
                          }`}
                        >
                          <div className="font-semibold truncate">{t.topic}</div>
                          <div className="text-[7px] mt-0.5 text-text-tertiary">{t.duration}m</div>
                        </div>
                      ))}
                      {dayTasks.length === 0 && (
                        <div className="flex items-center justify-center h-full text-[8px] text-text-tertiary/40 font-mono pt-2">
                          —
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Task List Below Calendar */}
          <Card className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-text-primary">Semua Agenda Terjadwal</h3>
              <span className="text-[10px] font-mono text-text-secondary">{tasks.length} total sesi</span>
            </div>

            {tasks.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {tasks.slice().sort((a, b) => a.date.localeCompare(b.date)).map(t => (
                  <div
                    key={t.id}
                    className="p-3 border border-border bg-bg-tertiary/20 rounded flex items-center justify-between group transition-colors hover:bg-bg-tertiary/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button onClick={() => toggleTask(t.id)} className="text-text-secondary hover:text-accent transition-colors flex-shrink-0">
                        {t.completed ? <CheckSquare size={15} className="text-success" /> : <Square size={15} />}
                      </button>
                      <div className="min-w-0">
                        <h4 className={`text-xs font-semibold truncate ${t.completed ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
                          {t.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="primary" className="text-[8px] px-1 py-0">{t.topic}</Badge>
                          <span className="text-[9px] font-mono text-text-tertiary flex items-center gap-0.5">
                            <Clock size={9} /> {t.duration}m
                          </span>
                          <span className="text-[9px] font-mono text-text-tertiary">{t.date}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger p-1 transition-all rounded hover:bg-danger/10 cursor-pointer flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-text-secondary border border-dashed border-border rounded-lg space-y-2">
                <Calendar size={24} className="mx-auto text-text-tertiary" />
                <p>Belum ada agenda. Tambahkan secara manual atau gunakan AI untuk membuat jadwal.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
