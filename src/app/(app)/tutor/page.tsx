'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTutorStore } from '@/stores/tutor-store';
import { useUserStore } from '@/stores/user-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Send, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  Sword, 
  ShieldAlert, 
  MessageSquare 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AITutorPage() {
  const { session, isResponding, setMode, sendMessage, clearHistory } = useTutorStore();
  const { updateQuestProgress } = useUserStore();
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isResponding]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isResponding) return;

    const currentText = input;
    setInput('');
    await sendMessage(currentText);
    updateQuestProgress('chat', 1);
  };

  const tutorModes = [
    { id: 'simple', label: 'Metafora Sederhana', desc: 'Bebas jargon. Penjelasan menggunakan perumpamaan sehari-hari.', icon: BookOpen, color: 'text-info bg-info/10 border-info/20' },
    { id: 'teacher', label: 'Guru Terbimbing', desc: 'Metode membimbing langkah-demi-langkah disertai contoh kasus.', icon: GraduationCap, color: 'text-accent bg-accent/10 border-accent/20' },
    { id: 'professor', label: 'Profesor Akademis', desc: 'Pembahasan teoretis mendalam, pembuktian rumus, dan basis ilmiah.', icon: Sparkles, color: 'text-warning bg-warning/10 border-warning/20' },
    { id: 'exam', label: 'Penguji Sokrates', desc: 'Uji pemahaman Anda dengan pertanyaan evaluatif secara berturut-turut.', icon: ShieldAlert, color: 'text-danger bg-danger/10 border-danger/20' },
    { id: 'debate', label: 'Debat Dialektika', desc: 'Tantang asumsi Anda tentang suatu topik untuk memperkuat argumentasi.', icon: Sword, color: 'text-success bg-success/10 border-success/20' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 h-full min-h-[calc(100vh-8rem)]">
      {/* Modes Sidebar */}
      <div className="lg:col-span-1 space-y-4 flex flex-col">
        <Card className="p-4 space-y-4 flex-grow flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary">Mode Kognitif</h3>
              <p className="text-[11px] text-text-secondary">Ubah kepribadian mengajar Claude secara dinamis saat berkonsultasi.</p>
            </div>

            <div className="space-y-2">
              {tutorModes.map((m) => {
                const active = session.mode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setMode(m.id as any)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-150 flex flex-col ${
                      active
                        ? 'border-accent bg-accent/5'
                        : 'border-border bg-bg-tertiary/40 hover:bg-bg-tertiary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <m.icon size={13} className={active ? 'text-accent' : 'text-text-secondary'} />
                      <span className="text-[11px] font-bold text-text-primary">{m.label}</span>
                    </div>
                    <span className="text-[10px] text-text-secondary mt-1 leading-normal">{m.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Button 
            onClick={clearHistory}
            variant="ghost" 
            className="w-full text-xs hover:text-danger hover:bg-danger-subtle/10 flex items-center gap-1.5"
          >
            <Trash2 size={13} /> Reset Sesi Chat
          </Button>
        </Card>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-3 flex flex-col h-full">
        <Card className="flex-1 flex flex-col h-full min-h-[500px] justify-between p-0 border border-border bg-bg-secondary">
          {/* Active Mode Banner */}
          <div className="flex items-center justify-between px-5 h-12 border-b border-border bg-bg-tertiary/20">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-accent" />
              <span className="text-xs font-semibold text-text-primary">Saluran Belajar AI</span>
            </div>
            <Badge variant="primary" className="text-[9px] font-mono">
              Mode: {session.mode}
            </Badge>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[450px]">
            {session.messages.map((msg) => {
              const isTutor = msg.sender === 'tutor';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isTutor ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-4 text-xs leading-relaxed ${
                      isTutor
                        ? 'bg-bg-tertiary/60 border border-border text-text-primary prose prose-invert prose-xs'
                        : 'bg-accent text-white'
                    }`}
                  >
                    {isTutor ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
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
                <div className="max-w-[70%] rounded-lg p-4 border border-border bg-bg-tertiary/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-accent text-[10px] font-mono">
                    <Sparkles size={11} className="animate-spin" /> Claude sedang merumuskan jawaban...
                  </div>
                  <Skeleton className="h-3 w-44" />
                  <Skeleton className="h-2 w-32" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-4 border-t border-border bg-bg-tertiary/20 flex gap-2">
            <input
              type="text"
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ajukan pertanyaan, minta analogi, atau uji argumen Anda..."
              className="flex-grow h-10 px-4 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
            <Button type="submit" disabled={isResponding || !input.trim()} className="h-10 px-4">
              <Send size={14} />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
