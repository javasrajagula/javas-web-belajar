'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTutorStore } from '@/stores/tutor-store';
import { useUserStore } from '@/stores/user-store';
import { useCurriculumStore } from '@/stores/curriculum-store';
import { getSubjectsByPathway } from '@/lib/curriculum-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Send, Trash2, Sparkles, BookOpen, GraduationCap, Sword, 
  ShieldAlert, MessageSquare, ChevronDown, Brain, Lightbulb,
  Cpu, List, Hash
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const QUICK_PROMPTS = [
  'Jelaskan konsep ini dengan analogi sehari-hari',
  'Buat 3 soal latihan untuk topik ini',
  'Apa kesalahan umum dalam materi ini?',
  'Hubungkan materi ini dengan dunia nyata',
  'Buat ringkasan poin-poin kunci',
];

export default function AITutorPage() {
  const { session, isResponding, setMode, sendMessage, clearHistory } = useTutorStore();
  const { updateQuestProgress, profile } = useUserStore();
  const { completedLessons } = useCurriculumStore();
  
  const [input, setInput] = useState('');
  const [showSubjects, setShowSubjects] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load real curriculum subjects for context
  const curriculumSubjects = useMemo(
    () => getSubjectsByPathway(profile.schoolType, profile.grade),
    [profile.schoolType, profile.grade]
  );

  const completedCount = Object.keys(completedLessons).length;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isResponding]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isResponding) return;

    const currentText = input;
    setInput('');

    // Construct context object for AI route
    const activeSub = curriculumSubjects.find(s => s.title === selectedSubject);
    const context = {
      studentName: profile.name,
      grade: profile.grade,
      schoolType: profile.schoolType,
      selectedPathway: profile.selectedPathway,
      lessonTitle: activeSub ? activeSub.modules[0]?.lessons[0]?.title : undefined,
      subjectTitle: selectedSubject || undefined,
      cpStatement: activeSub?.cpStatement || undefined
    };

    await sendMessage(currentText, context);
    updateQuestProgress('chat', 1);
  };

  const handleQuickPrompt = (prompt: string) => {
    const finalPrompt = selectedSubject
      ? `Untuk materi ${selectedSubject}: ${prompt}`
      : prompt;
    setInput(finalPrompt);
    inputRef.current?.focus();
  };

  const tutorModes = [
    { id: 'simple', label: 'Metafora Sederhana', desc: 'Penjelasan tanpa jargon menggunakan analogi sehari-hari.', icon: Lightbulb, color: 'text-info bg-info/10 border-info/20' },
    { id: 'teacher', label: 'Guru Terbimbing', desc: 'Bimbingan langkah-demi-langkah dengan contoh kasus nyata.', icon: GraduationCap, color: 'text-accent bg-accent/10 border-accent/20' },
    { id: 'professor', label: 'Profesor Akademis', desc: 'Pembahasan teoretis mendalam, pembuktian rumus, basis ilmiah.', icon: Sparkles, color: 'text-warning bg-warning/10 border-warning/20' },
    { id: 'exam', label: 'Penguji Sokrates', desc: 'Uji pemahaman dengan pertanyaan evaluatif beruntun.', icon: ShieldAlert, color: 'text-danger bg-danger/10 border-danger/20' },
    { id: 'debate', label: 'Debat Dialektika', desc: 'Tantang asumsi Anda untuk memperkuat argumentasi.', icon: Sword, color: 'text-success bg-success/10 border-success/20' },
  ];

  const modeLabels: Record<string, string> = {
    simple: 'Metafora', teacher: 'Guru', professor: 'Profesor',
    exam: 'Sokrates', debate: 'Debater'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 flex-1 min-h-[calc(100vh-8rem)]">
      
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-4 flex flex-col">
        
        {/* Mode selector */}
        <Card className="p-4 space-y-4 flex-grow flex flex-col">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Brain size={13} className="text-accent" /> Mode Kognitif
            </h3>
            <p className="text-[10px] text-text-secondary">Ubah kepribadian AI mengajar secara dinamis.</p>
          </div>

          <div className="space-y-1.5 flex-1">
            {tutorModes.map((m) => {
              const active = session.mode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setMode(m.id as any)}
                  className={`p-2.5 border rounded-lg cursor-pointer transition-all duration-150 flex items-center gap-2 ${
                    active ? `border-accent bg-accent/5` : 'border-border bg-bg-tertiary/40 hover:bg-bg-tertiary'
                  }`}
                >
                  <div className={`p-1 rounded flex-shrink-0 ${active ? 'bg-accent/10 text-accent' : 'bg-bg-secondary text-text-secondary'}`}>
                    <m.icon size={12} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-text-primary block">{m.label}</span>
                    <span className="text-[9px] text-text-secondary leading-tight truncate block">{m.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Curriculum context picker */}
          <div className="pt-3 border-t border-border/40 space-y-2">
            <label className="text-[9px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">Konteks Kurikulum</label>
            <button
              onClick={() => setShowSubjects(o => !o)}
              className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-bg-tertiary text-xs text-text-secondary hover:text-text-primary hover:border-accent transition-colors cursor-pointer"
            >
              <span className="truncate flex-1 text-left">
                {selectedSubject || 'Tanpa Konteks Mapel'}
              </span>
              <ChevronDown size={12} className={`ml-2 flex-shrink-0 transition-transform ${showSubjects ? 'rotate-180' : ''}`} />
            </button>
            {showSubjects && (
              <div className="border border-border rounded-lg overflow-hidden bg-bg-secondary max-h-40 overflow-y-auto">
                <button
                  onClick={() => { setSelectedSubject(''); setShowSubjects(false); }}
                  className="w-full text-left text-[10px] px-3 py-2 hover:bg-bg-tertiary transition-colors text-text-tertiary border-b border-border/40"
                >
                  — Tanpa Konteks
                </button>
                {curriculumSubjects.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => { setSelectedSubject(sub.title); setShowSubjects(false); }}
                    className={`w-full text-left text-[10px] px-3 py-2 hover:bg-bg-tertiary transition-colors border-b border-border/20 last:border-0 ${
                      selectedSubject === sub.title ? 'text-accent bg-accent/5' : 'text-text-secondary'
                    }`}
                  >
                    {sub.title}
                  </button>
                ))}
              </div>
            )}
            {selectedSubject && (
              <Badge variant="primary" className="text-[8px] font-mono">
                📚 {selectedSubject}
              </Badge>
            )}
          </div>

          <Button
            onClick={clearHistory}
            variant="ghost"
            className="w-full text-xs hover:text-danger hover:bg-danger/5 flex items-center gap-1.5 mt-2"
          >
            <Trash2 size={12} /> Reset Sesi Chat
          </Button>
        </Card>

        {/* Stats */}
        <Card className="p-3 space-y-2">
          <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-widest">Statistik Sesi</span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-text-secondary">Pesan Dikirim</span>
              <span className="font-mono text-text-primary">{session.messages.filter(m => m.sender === 'user').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Pelajaran Selesai</span>
              <span className="font-mono text-accent">{completedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Mode Aktif</span>
              <span className="font-mono text-text-primary">{modeLabels[session.mode] || session.mode}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-3 flex flex-col h-full">
        <Card className="flex-1 flex flex-col min-h-[500px] max-h-[calc(100vh-12rem)] p-0 border border-border bg-bg-secondary">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-12 border-b border-border bg-bg-tertiary/20 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <MessageSquare size={13} className="text-accent" />
              <span className="text-xs font-semibold text-text-primary">Tutor AI — Academy OS</span>
            </div>
            <div className="flex items-center gap-2">
              {selectedSubject && (
                <Badge variant="primary" className="text-[8px] font-mono">
                  📚 {selectedSubject}
                </Badge>
              )}
              <Badge variant="secondary" className="text-[9px] font-mono">
                Mode: {modeLabels[session.mode] || session.mode}
              </Badge>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {session.messages.map((msg) => {
              const isTutor = msg.sender === 'tutor';
              return (
                <div key={msg.id} className={`flex ${isTutor ? 'justify-start' : 'justify-end'}`}>
                  {isTutor && (
                    <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <Sparkles size={12} className="text-accent" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed ${
                      isTutor
                        ? 'bg-bg-tertiary/60 border border-border text-text-primary'
                        : 'bg-gradient-to-br from-accent to-accent/80 text-white'
                    }`}
                  >
                    {isTutor ? (
                      <div className="prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                    <span className={`block text-[9px] mt-2 font-mono ${isTutor ? 'text-text-tertiary' : 'text-white/60'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isResponding && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-accent animate-spin" />
                </div>
                <div className="max-w-[70%] rounded-xl p-4 border border-border bg-bg-tertiary/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-accent text-[10px] font-mono">
                    <Cpu size={11} className="animate-pulse" /> Merumuskan jawaban...
                  </div>
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-2.5 w-36" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 border-t border-border/40 bg-bg-tertiary/10 flex-shrink-0">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="flex-shrink-0 px-2.5 py-1 rounded-full border border-border bg-bg-tertiary/60 text-[9px] text-text-secondary hover:text-text-primary hover:border-accent hover:bg-bg-tertiary transition-colors cursor-pointer font-medium whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-border bg-bg-tertiary/20 flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                selectedSubject
                  ? `Tanyakan tentang ${selectedSubject}...`
                  : 'Ajukan pertanyaan, minta analogi, atau uji argumen Anda...'
              }
              className="flex-grow h-10 px-4 bg-bg-tertiary border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
            <Button type="submit" disabled={isResponding || !input.trim()} className="h-10 px-4 flex-shrink-0">
              <Send size={14} />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
