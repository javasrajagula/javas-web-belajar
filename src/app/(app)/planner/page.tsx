'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePlannerStore } from '@/stores/planner-store';
import { useUserStore } from '@/stores/user-store';
import { resolveSmkPathway } from '@/lib/pathway';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Square, 
  Trash2, 
  Sparkles, 
  Plus,
  Clock,
  BookOpen,
  Target,
  ChevronLeft,
  ChevronRight,
  Brain,
  Zap,
  CalendarDays,
  ListTodo
} from 'lucide-react';
import { toast } from 'sonner';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAYS_NAME = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DURATION_OPTIONS = [15, 25, 30, 45, 60, 90, 120];

interface Mapel {
  id: string;
  kode: string;
  nama: string;
  kelas: number;
}

export default function SmartPlannerPage() {
  const { tasks, addTask, addTasks, toggleTask, deleteTask } = usePlannerStore();
  const { profile } = useUserStore();
  const selectedPathway = resolveSmkPathway(profile.selectedPathway);

  // Load user's subjects
  const [mapels, setMapels] = useState<Mapel[]>([]);
  const [loadingMapels, setLoadingMapels] = useState(true);

  useEffect(() => {
    async function loadMapels() {
      try {
        const res = await fetch(`/api/jurusan/${selectedPathway}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMapels(data.mataPelajaran || []);
      } catch (err) {
        toast.error('Gagal memuat mata pelajaran.');
      } finally {
        setLoadingMapels(false);
      }
    }
    loadMapels();
  }, [selectedPathway]);

  // Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Manual Task fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTopic, setTaskTopic] = useState('');
  const [taskDuration, setTaskDuration] = useState(30);

  // AI Modal States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiMapelId, setAiMapelId] = useState('');
  const [aiExamDate, setAiExamDate] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Calendar Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysGrid = useMemo(() => {
    // First day of current month (0 = Sun, 1 = Mon, etc.)
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Total days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();
    // Total days in previous month
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const grid = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      const prevDate = new Date(year, month - 1, d);
      const tzOffsetDate = new Date(prevDate.getTime() - prevDate.getTimezoneOffset() * 60000);
      grid.push({
        dateStr: tzOffsetDate.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const currDate = new Date(year, month, i);
      const tzOffsetDate = new Date(currDate.getTime() - currDate.getTimezoneOffset() * 60000);
      grid.push({
        dateStr: tzOffsetDate.toISOString().split('T')[0],
        dayNum: i,
        isCurrentMonth: true
      });
    }

    // Next month padding days to complete 6-week grid (42 days)
    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      const tzOffsetDate = new Date(nextDate.getTime() - nextDate.getTimezoneOffset() * 60000);
      grid.push({
        dateStr: tzOffsetDate.toISOString().split('T')[0],
        dayNum: i,
        isCurrentMonth: false
      });
    }

    return grid;
  }, [year, month]);

  // Navigate Months
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Add manual task handler
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskTopic) {
      toast.error('Data tugas tidak lengkap!');
      return;
    }

    addTask({
      title: taskTitle.trim(),
      date: selectedDateStr,
      duration: taskDuration,
      completed: false,
      category: 'study',
      topic: taskTopic
    });

    setTaskTitle('');
    toast.success('Agenda belajar berhasil ditambahkan!');
  };

  // Call Claude AI Scheduler endpoint
  const handleAiAutoSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMapelId || !aiExamDate) {
      toast.error('Pilih mata pelajaran dan tanggal ujian!');
      return;
    }

    setIsScheduling(true);
    const toastId = toast.loading('Claude sedang merancang jadwal belajar optimum...');

    try {
      const res = await fetch('/api/ai/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapelId: aiMapelId,
          tanggalUjian: aiExamDate,
          weakTopics: profile.weakTopics
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal merancang jadwal');
      }

      const result = await res.json();

      // Map API sessions into Tasks
      const formattedTasks = result.sessions.map((session: any, idx: number) => ({
        id: `task-ai-${Date.now()}-${idx}`,
        title: `AI Sesi: ${session.kategori === 'exercise' ? 'Latihan Soal' : session.kategori === 'revision' ? 'Ulang Materi' : 'Fokus Belajar'} - ${session.topik}`,
        date: session.tanggal,
        duration: session.durasiMenit,
        completed: false,
        category: session.kategori,
        topic: session.topik
      }));

      addTasks(formattedTasks);
      setIsAiModalOpen(false);
      setAiMapelId('');
      setAiExamDate('');
      
      toast.success(`Berhasil menyusun ${result.sessions.length} jadwal harian AI di kalender!`, { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message || 'Gagal menyusun jadwal'}`, { id: toastId });
    } finally {
      setIsScheduling(false);
    }
  };

  // Stats calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalMinutes = tasks.filter(t => t.completed).reduce((acc, t) => acc + t.duration, 0);

  // Selected date tasks
  const selectedDateTasks = useMemo(() => {
    return tasks.filter(t => t.date === selectedDateStr);
  }, [tasks, selectedDateStr]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-text-primary">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary/40 border border-border p-5 rounded-lg backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarDays className="text-primary w-5.5 h-5.5" />
            Kalender Belajar
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Visualisasikan rencana belajar bulananmu. Gunakan kecerdasan Claude AI untuk membagi porsi belajar menjelang ujian sekolah.
          </p>
        </div>
        <div>
          <Button 
            onClick={() => setIsAiModalOpen(true)}
            className="text-xs bg-primary hover:bg-primary-hover text-white flex items-center gap-1.5 h-10 px-4"
          >
            <Sparkles size={14} className="text-accent" /> AI Auto-Schedule
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Agenda', value: totalTasks, icon: BookOpen, color: 'text-primary' },
          { label: 'Selesai', value: completedTasks, icon: CheckSquare, color: 'text-success' },
          { label: 'Rasio Pencapaian', value: `${completionRate}%`, icon: Target, color: 'text-accent' },
          { label: 'Total Waktu Belajar', value: `${totalMinutes}m`, icon: Clock, color: 'text-warning' },
        ].map((stat) => (
          <Card key={stat.label} className="flex flex-col justify-between p-4 border border-border bg-bg-secondary/20">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-text-secondary">{stat.label}</span>
              <stat.icon size={15} className={stat.color} />
            </div>
            <span className={`text-2xl font-bold font-mono mt-3 ${stat.color}`}>{stat.value}</span>
          </Card>
        ))}
      </div>

      {/* 2-Panel Layout: Monthly Grid & Date Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* PANEL KIRI: MONTHLY CALENDAR GRID (col-span-8) */}
        <Card className="lg:col-span-8 p-5 border border-border bg-bg-secondary/20 flex flex-col gap-4">
          
          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarIcon size={16} className="text-primary" />
              {MONTH_NAMES[month]} {year}
            </h2>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={prevMonth} 
                className="p-1 border border-border bg-bg-tertiary/40 rounded hover:bg-bg-hover text-text-secondary hover:text-white cursor-pointer transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())} 
                className="text-[9px] font-mono font-bold px-2 py-1 border border-border bg-bg-tertiary/40 rounded text-text-secondary hover:text-white cursor-pointer transition-colors"
              >
                BULAN INI
              </button>
              <button 
                onClick={nextMonth} 
                className="p-1 border border-border bg-bg-tertiary/40 rounded hover:bg-bg-hover text-text-secondary hover:text-white cursor-pointer transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono font-bold text-text-secondary border-b border-border/20 pb-2">
            {DAYS_NAME.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {/* 42-cell Monthly Grid */}
          <div className="grid grid-cols-7 gap-2 flex-grow">
            {daysGrid.map((cell, idx) => {
              const isSelected = selectedDateStr === cell.dateStr;
              const isToday = cell.dateStr === todayStr;
              
              // Filter tasks on this day
              const dayTasks = tasks.filter(t => t.date === cell.dateStr);
              const completedCount = dayTasks.filter(t => t.completed).length;

              // Color dot logic
              let dotColor = null;
              if (dayTasks.length > 0) {
                if (completedCount === dayTasks.length) {
                  dotColor = 'bg-success'; // Green
                } else if (completedCount > 0) {
                  dotColor = 'bg-warning'; // Amber (partial)
                } else {
                  // None completed
                  const cellDate = new Date(cell.dateStr + 'T00:00:00');
                  const todayDate = new Date(todayStr + 'T00:00:00');
                  if (cellDate < todayDate) {
                    dotColor = 'bg-danger'; // Red (missed in the past)
                  } else {
                    dotColor = 'bg-warning'; // Amber (pending future)
                  }
                }
              }

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`aspect-square p-2 border rounded-lg flex flex-col justify-between cursor-pointer transition-all ${
                    !cell.isCurrentMonth ? 'opacity-40' : ''
                  } ${
                    isSelected 
                      ? 'border-primary bg-primary-subtle/10 shadow-xs' 
                      : 'border-border bg-bg-tertiary/10 hover:border-primary/30 hover:bg-bg-tertiary/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-bold font-mono ${
                      isToday ? 'text-primary' : 'text-text-primary'
                    }`}>
                      {cell.dayNum}
                    </span>
                    {/* Status dot */}
                    {dotColor && (
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                    )}
                  </div>
                  
                  {/* Miniature tasks indicators on day cell */}
                  {dayTasks.length > 0 && (
                    <span className="text-[7px] font-mono text-text-tertiary block text-right mt-1">
                      {dayTasks.length} sesi
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* PANEL KANAN: DAY AGENDA DETAIL (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Day tasks card */}
          <Card className="p-5 border border-border bg-bg-secondary/20 flex flex-col gap-4 flex-grow justify-between min-h-[300px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-primary" /> Agenda Belajar
                </span>
                <span className="text-[10px] font-mono text-text-tertiary">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              {/* Day tasks list */}
              <div className="space-y-2.5 max-h-[30vh] overflow-y-auto pr-1">
                {selectedDateTasks.length > 0 ? (
                  selectedDateTasks.map((t) => (
                    <div 
                      key={t.id}
                      className="p-3 border border-border bg-bg-tertiary/20 rounded flex items-center justify-between group transition-colors hover:bg-bg-tertiary/40"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button 
                          onClick={() => toggleTask(t.id)} 
                          className="text-text-secondary hover:text-accent transition-colors flex-shrink-0 cursor-pointer"
                        >
                          {t.completed ? <CheckSquare size={14} className="text-success" /> : <Square size={14} />}
                        </button>
                        <div className="min-w-0">
                          <h4 className={`text-xs font-semibold truncate ${t.completed ? 'line-through text-text-tertiary' : 'text-white'}`}>
                            {t.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="primary" className="text-[8px] px-1 py-0">{t.topic}</Badge>
                            <span className="text-[8px] font-mono text-text-tertiary flex items-center gap-0.5">
                              <Clock size={8} /> {t.duration}m
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          deleteTask(t.id);
                          toast.success('Agenda dihapus.');
                        }}
                        className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger p-0.5 transition-all rounded hover:bg-danger/10 cursor-pointer flex-shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-text-muted border border-dashed border-border/50 rounded-lg">
                    Tidak ada agenda belajar pada tanggal ini.
                  </div>
                )}
              </div>
            </div>

            {/* Quick manual task insertion form */}
            <form onSubmit={handleCreateTask} className="border-t border-border/40 pt-4 mt-4 flex flex-col gap-3">
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider block">
                Tambah Agenda Harian
              </span>
              
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  required
                  placeholder="Nama tugas (cth: Baca bab routing)"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full h-8 px-2.5 bg-bg-tertiary/50 border border-border rounded text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  required
                  value={taskTopic}
                  onChange={(e) => setTaskTopic(e.target.value)}
                  className="h-8 px-1 bg-bg-tertiary/50 border border-border rounded text-xs text-white focus:outline-none focus:border-primary disabled:opacity-50"
                  disabled={loadingMapels || mapels.length === 0}
                >
                  <option value="">Mapel...</option>
                  {mapels.map((m) => (
                    <option key={m.id} value={m.nama}>
                      {m.kode}
                    </option>
                  ))}
                </select>

                <select
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(parseInt(e.target.value))}
                  className="h-8 px-1.5 bg-bg-tertiary/50 border border-border rounded text-xs text-white focus:outline-none focus:border-primary"
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}m
                    </option>
                  ))}
                </select>
              </div>

              <Button 
                type="submit" 
                className="w-full h-8 text-xs flex items-center justify-center gap-1.5 font-bold"
              >
                <Plus size={12} /> Tambah Agenda
              </Button>
            </form>
          </Card>
        </div>

      </div>

      {/* AI AUTO-SCHEDULER MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <Card className="w-full max-w-md p-6 bg-bg-secondary border border-border flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Brain className="text-primary w-4 h-4" />
                AI Auto-Scheduler (Claude 3.5)
              </h3>
              <button 
                onClick={() => !isScheduling && setIsAiModalOpen(false)}
                className="text-text-tertiary hover:text-white font-bold cursor-pointer text-xs disabled:opacity-50"
                disabled={isScheduling}
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleAiAutoSchedule} className="flex flex-col gap-4">
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Claude AI akan menyusun rencana belajar harian otomatis terhitung mulai hari ini sampai sebelum tanggal ujian. Target porsi belajar disesuaikan dengan topik kelemahan Anda.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-text-secondary uppercase">Mata Pelajaran Ujian</label>
                <select
                  required
                  disabled={isScheduling || loadingMapels || mapels.length === 0}
                  value={aiMapelId}
                  onChange={(e) => setAiMapelId(e.target.value)}
                  className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-white focus:outline-none focus:border-primary disabled:opacity-50"
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {mapels.map((m) => (
                    <option key={m.id} value={m.id}>
                      Kelas {m.kelas} - {m.nama} ({m.kode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-text-secondary uppercase">Tanggal Ujian Akhir</label>
                <input
                  type="date"
                  required
                  disabled={isScheduling}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Must be tomorrow onwards
                  value={aiExamDate}
                  onChange={(e) => setAiExamDate(e.target.value)}
                  className="w-full h-9 px-3 bg-bg-tertiary border border-border rounded text-xs text-white focus:outline-none focus:border-primary disabled:opacity-50"
                />
              </div>

              <div className="border-t border-border/40 pt-4 mt-2">
                <Button 
                  type="submit" 
                  disabled={isScheduling} 
                  className="w-full h-10 text-xs flex items-center justify-center gap-1.5 font-bold"
                >
                  {isScheduling ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyusun Rencana Belajar AI...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      Rencanakan Studi AI
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
