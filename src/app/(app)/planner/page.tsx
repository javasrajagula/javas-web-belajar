'use client';

import React, { useState } from 'react';
import { usePlannerStore } from '@/stores/planner-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CheckSquare, 
  Square, 
  Trash2, 
  Sparkles, 
  Plus,
  Clock
} from 'lucide-react';

export default function SmartPlannerPage() {
  const { tasks, addTask, toggleTask, deleteTask, generateAISchedule } = usePlannerStore();
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTopic, setTaskTopic] = useState('Keadaan Kuantum');
  const [taskDuration, setTaskDuration] = useState(30);

  // AI Generator local configurations
  const [aiDays, setAiDays] = useState(3);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Keadaan Kuantum']);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle,
      date: new Date().toISOString().split('T')[0],
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

  const handleGenerateAI = () => {
    if (selectedTopics.length === 0) return;
    generateAISchedule(selectedTopics, aiDays);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const upcomingTasks = tasks.filter((t) => t.date > todayStr);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side: Task Scheduler / Add task */}
      <div className="space-y-6">
        {/* Manual Add Task */}
        <Card className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-text-primary">Tambah Blok Sesi Belajar</h3>
            <p className="text-[11px] text-text-secondary">Masukkan agenda belajar khusus secara manual ke dalam antrean hari ini.</p>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-text-secondary uppercase">Nama Agenda Belajar</label>
              <input
                type="text"
                required
                placeholder="Contoh: Baca pembuktian ruang Hilbert"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full h-9 px-3 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Subjek</label>
                <select
                  value={taskTopic}
                  onChange={(e) => setTaskTopic(e.target.value)}
                  className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="Keadaan Kuantum">Keadaan Kuantum</option>
                  <option value="Integrasi Kalkulus">Integrasi Kalkulus</option>
                  <option value="Kata Kerja Prancis">Kata Kerja Prancis</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Durasi (Menit)</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-9 text-xs flex items-center justify-center gap-1.5">
              <Plus size={14} /> Tambah Agenda Belajar
            </Button>
          </form>
        </Card>

        {/* AI Scheduler Generator */}
        <Card className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Sparkles size={14} className="text-accent" /> Pembuat Jadwal AI
            </h3>
            <p className="text-[11px] text-text-secondary">Claude mengoptimalkan distribusi materi secara seimbang sesuai prioritas topik.</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-text-secondary uppercase">Pilih Subjek Untuk Didistribusikan</label>
              <div className="flex flex-wrap gap-1.5">
                {['Keadaan Kuantum', 'Integrasi Kalkulus', 'Kata Kerja Prancis'].map((topic) => {
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
              <label className="text-[10px] font-semibold text-text-secondary uppercase">Pilih Rentang Waktu</label>
              <select
                value={aiDays}
                onChange={(e) => setAiDays(Number(e.target.value))}
                className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="3">Jadwal Sesi 3 Hari</option>
                <option value="7">Jadwal Sesi 7 Hari</option>
                <option value="14">Jadwal Sesi 14 Hari</option>
              </select>
            </div>

            <Button onClick={handleGenerateAI} variant="outline" className="w-full h-9 text-xs flex items-center justify-center gap-1.5">
              <Sparkles size={13} className="text-accent" /> Distribusikan Kurikulum Secara Merata
            </Button>
          </div>
        </Card>
      </div>

      {/* Right side: Active Tasks Lists */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Calendar size={14} className="text-accent" /> Agenda Sesi Belajar Aktif
            </h3>
            <span className="text-[10px] font-mono text-text-secondary">HARI INI: {todayStr}</span>
          </div>

          <div className="space-y-6">
            {/* Today's Tasks */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest">Sesi Hari Ini</span>
              {todayTasks.length > 0 ? (
                <div className="space-y-2">
                  {todayTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 border border-border bg-bg-tertiary/20 rounded flex items-center justify-between group transition-colors hover:bg-bg-tertiary/40"
                    >
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleTask(t.id)} className="text-text-secondary hover:text-accent transition-colors">
                          {t.completed ? <CheckSquare size={16} className="text-accent" /> : <Square size={16} />}
                        </button>
                        <div className="space-y-0.5">
                          <h4 className={`text-xs font-semibold ${t.completed ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
                            {t.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-text-secondary font-mono">
                            <Badge variant="secondary" className="text-[8px]">{t.topic}</Badge>
                            <span className="flex items-center gap-0.5"><Clock size={10} /> {t.duration}m</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger p-1 transition-all rounded hover:bg-danger-subtle/10 cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-text-secondary border border-dashed border-border rounded-lg">
                  Tidak ada agenda belajar yang dijadwalkan hari ini.
                </div>
              )}
            </div>

            {/* Upcoming Tasks */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest">Sesi Berikutnya</span>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-2">
                  {upcomingTasks.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="p-3 border border-border bg-bg-tertiary/10 rounded flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-text-secondary font-mono bg-bg-tertiary/50 px-2 py-0.5 rounded border border-border">
                          {t.date}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-semibold text-text-primary">{t.title}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-text-secondary font-mono">
                            <Badge variant="secondary" className="text-[8px]">{t.topic}</Badge>
                            <span className="flex items-center gap-0.5"><Clock size={10} /> {t.duration}m</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => deleteTask(t.id)} className="text-text-tertiary hover:text-danger p-1 transition-all rounded hover:bg-danger-subtle/10 cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-text-secondary border border-dashed border-border rounded-lg">
                  Belum ada agenda belajar untuk hari-hari berikutnya.
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
