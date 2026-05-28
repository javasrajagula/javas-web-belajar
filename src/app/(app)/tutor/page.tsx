'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTutorStore } from '@/stores/tutor-store';
import { useUserStore } from '@/stores/user-store';
import { useCurriculumStore } from '@/stores/curriculum-store';
import { getSubjectsByPathway } from '@/lib/curriculum-data';
import { resolveSmkPathway } from '@/lib/pathway';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Send, Trash2, Sparkles, BookOpen, GraduationCap, Sword, 
  ShieldAlert, MessageSquare, ChevronDown, Brain, Lightbulb,
  Cpu, Paperclip, Calculator, Volume2, VolumeX, MoreVertical,
  User, RotateCcw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ChatQuizCard from '@/components/chat-quiz';
import ChatFlashcard from '@/components/chat-flashcard';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Helper to parse Generative UI tokens
function parseMessageContent(content: string) {
  const quizRegex = /\[QUIZ:\s*([^\]]+)\]/g;
  const flashcardRegex = /\[FLASHCARD:\s*([^\]]+)\]/g;

  let quizMatch;
  const quizzes: string[] = [];
  const tempQuizRegex = new RegExp(quizRegex);
  while ((quizMatch = tempQuizRegex.exec(content)) !== null) {
    quizzes.push(quizMatch[1]);
  }

  let flashcardMatch;
  const flashcards: string[] = [];
  const tempFlashcardRegex = new RegExp(flashcardRegex);
  while ((flashcardMatch = tempFlashcardRegex.exec(content)) !== null) {
    flashcards.push(flashcardMatch[1]);
  }

  const cleanContent = content
    .replace(quizRegex, '')
    .replace(flashcardRegex, '')
    .trim();

  return { cleanContent, quizzes, flashcards };
}

const QUICK_PROMPTS = [
  'Jelaskan konsep ini dengan analogi sehari-hari',
  'Buat 3 soal latihan untuk topik ini',
  'Apa kesalahan umum dalam materi ini?',
  'Hubungkan materi ini dengan dunia nyata',
  'Buat ringkasan poin-poin kunci',
];

// Presets for mock session history
const SESSION_PRESETS: Record<string, Array<{ id: string, sender: 'tutor' | 'user', content: string, timestamp: string }>> = {
  'session-default': [], // Empty means use the live session store messages
  'session-08': [
    { id: 'm-web-1', sender: 'tutor', content: 'Halo! Mari kita review materi Pemrograman Web Lanjut tentang RESTful API. Apakah kamu sudah mengerti perbedaan HTTP Method GET dan POST?', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: 'm-web-2', sender: 'user', content: 'GET untuk mengambil data, POST untuk mengirim data baru ya?', timestamp: new Date(Date.now() - 3600000 * 24 + 60000).toISOString() },
    { id: 'm-web-3', sender: 'tutor', content: 'Tepat sekali! GET mengirim data melalui URL query string (stateless), sedangkan POST mengirimkan data melalui request body. \n\nMari kita coba kuis singkat:\n\n[QUIZ: Manakah HTTP Method yang paling tepat digunakan untuk memperbarui data yang sudah ada di database? | GET | POST | PUT | DELETE | 2 | Method PUT digunakan untuk memperbarui (update) data secara keseluruhan, sedangkan PATCH digunakan untuk memperbarui sebagian data.]', timestamp: new Date(Date.now() - 3600000 * 24 + 120000).toISOString() }
  ],
  'session-07': [
    { id: 'm-akt-1', sender: 'tutor', content: 'Selamat datang kembali di kelas Akuntansi. Kemarin kita membahas Persamaan Dasar Akuntansi: Aset = Liabilitas + Ekuitas.', timestamp: new Date(Date.now() - 3600000 * 48).toISOString() },
    { id: 'm-akt-2', sender: 'user', content: 'Bisa berikan contoh pencatatan transaksi jika kas bertambah?', timestamp: new Date(Date.now() - 3600000 * 48 + 60000).toISOString() },
    { id: 'm-akt-3', sender: 'tutor', content: 'Tentu! Jika pemilik menyetorkan uang tunai sebesar Rp 10.000.000 sebagai modal awal:\n1. Aset berupa Kas bertambah Rp 10.000.000 (Dicatat di sisi Debit).\n2. Ekuitas berupa Modal bertambah Rp 10.000.000 (Dicatat di sisi Kredit).\n\n[FLASHCARD: Debet vs Kredit | Debet adalah pencatatan akuntansi di sisi kiri akun, sedangkan Kredit adalah pencatatan di sisi kanan akun. Keduanya harus selalu seimbang.]', timestamp: new Date(Date.now() - 3600000 * 48 + 120000).toISOString() }
  ],
  'session-06': [
    { id: 'm-mm-1', sender: 'tutor', content: 'Halo desainer muda! Mari kita bahas tentang Dasar Desain Grafis, khususnya perbedaan format Vektor dan Raster.', timestamp: new Date(Date.now() - 3600000 * 120).toISOString() },
    { id: 'm-mm-2', sender: 'user', content: 'Vektor kalau di-zoom tidak pecah kan?', timestamp: new Date(Date.now() - 3600000 * 120 + 60000).toISOString() },
    { id: 'm-mm-3', sender: 'tutor', content: 'Benar sekali! Gambar vektor dibentuk oleh kurva matematis (bezier), sehingga memiliki ketajaman tak terbatas. Sedangkan gambar raster dibentuk oleh piksel (grid warna) yang akan pecah saat diperbesar.\n\n[QUIZ: Perangkat lunak manakah yang berbasis VEKTOR untuk pembuatan logo? | Adobe Photoshop | CorelDraw | GIMP | Blender 3D | 1 | CorelDraw dan Adobe Illustrator adalah software desain berbasis vektor, sedangkan Photoshop berbasis bitmap/raster.]', timestamp: new Date(Date.now() - 3600000 * 120 + 120000).toISOString() }
  ]
};

export default function AITutorPage() {
  const router = useRouter();
  const { session, isResponding, setMode, sendMessage, clearHistory } = useTutorStore();
  const { updateQuestProgress, profile, addXp } = useUserStore();
  const { completedLessons } = useCurriculumStore();
  const activePathway = resolveSmkPathway(profile.selectedPathway);
  
  const [input, setInput] = useState('');
  const [showSubjects, setShowSubjects] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [activeSessionId, setActiveSessionId] = useState('session-default');
  const [soundOn, setSoundOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prompt = new URLSearchParams(window.location.search).get('prompt');
    if (prompt && !input) {
      setInput(prompt);
      setMode('teacher');
    }
  }, [input, setMode]);

  // Load real curriculum subjects for context
  const curriculumSubjects = useMemo(
    () => getSubjectsByPathway('smk', profile.grade, activePathway),
    [profile.grade, activePathway]
  );

  const completedCount = Object.keys(completedLessons).length;

  useEffect(() => {
    const chatScrollEl = chatScrollRef.current;
    if (!chatScrollEl) return;

    chatScrollEl.scrollTo({
      top: chatScrollEl.scrollHeight,
      behavior: isResponding ? 'auto' : 'smooth'
    });
  }, [session.messages, isResponding, activeSessionId]);

  // Audio player loop for ambient study sound
  useEffect(() => {
    if (soundOn) {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.2;
      }
      audioRef.current.play().catch(e => console.log("Audio play blocked by browser policies", e));
    } else {
      audioRef.current?.pause();
    }
    return () => {
      audioRef.current?.pause();
    };
  }, [soundOn]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isResponding) return;

    const currentText = input;
    setInput('');

    // If currently in a mock session, switch to live chat and notify user
    if (activeSessionId !== 'session-default') {
      setActiveSessionId('session-default');
      toast.info('Beralih kembali ke Sesi Aktif Utama.');
    }

    // Construct context object for AI route
    const activeSub = curriculumSubjects.find(s => s.title === selectedSubject);
    const context = {
      studentName: profile.name,
      grade: profile.grade,
      schoolType: profile.schoolType,
      selectedPathway: activePathway,
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
    { id: 'simple', label: 'Metafora', icon: Lightbulb },
    { id: 'teacher', label: 'Guru', icon: GraduationCap },
    { id: 'professor', label: 'Profesor', icon: Sparkles },
    { id: 'exam', label: 'Sokrates', icon: ShieldAlert },
    { id: 'debate', label: 'Debater', icon: Sword },
  ];

  const modeLabels: Record<string, string> = {
    simple: 'Metafora', teacher: 'Guru', professor: 'Profesor',
    exam: 'Sokrates', debate: 'Debater'
  };

  // Get active session messages (either live store session or mock preset)
  const displayMessages = useMemo(() => {
    if (activeSessionId === 'session-default') {
      return session.messages;
    }
    return SESSION_PRESETS[activeSessionId] || [];
  }, [activeSessionId, session.messages]);

  const historySessions = [
    { id: 'session-default', title: selectedSubject || 'Sesi Aktif Utama', time: '12:45 PM', code: 'SESSION_09' },
    { id: 'session-08', title: 'Dasar Pemrograman Web Lanjut', time: 'YESTERDAY', code: 'SESSION_08' },
    { id: 'session-07', title: 'Persamaan Dasar Akuntansi', time: 'OCT 12', code: 'SESSION_07' },
    { id: 'session-06', title: 'Dasar Desain Grafis & Vektor', time: 'OCT 08', code: 'SESSION_06' },
  ];

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-6rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-5 bg-[#E4E4E7] min-h-[calc(100vh-6rem)] border-[4px] border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black relative max-w-full overflow-x-hidden" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.15) 1.2px, transparent 1.2px)', backgroundSize: '16px 16px' }}>
      
      {/* LEFT PANEL: History, Mode, Curriculum Context */}
      <div className="w-full lg:w-80 flex flex-col gap-5 flex-shrink-0">
        
        {/* History Widget */}
        <div className="flex flex-col bg-white border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden flex-1 min-h-[300px]">
          {/* Header */}
          <div className="bg-[#FCD34D] border-b-[3px] border-black px-4 py-3 flex items-center justify-between">
            <span className="font-extrabold text-sm uppercase tracking-wider font-mono flex items-center gap-1.5">
              <RotateCcw size={14} className="animate-spin-slow" /> HISTORY
            </span>
            <button 
              onClick={() => {
                clearHistory();
                setActiveSessionId('session-default');
                toast.success('Sesi chat aktif berhasil direset.');
              }}
              title="Reset Sesi Aktif"
              className="p-1 rounded border border-black bg-white hover:bg-zinc-100 transition-colors shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              <Trash2 size={12} className="text-black" />
            </button>
          </div>

          {/* Session List */}
          <div className="p-3 flex-1 space-y-2.5 overflow-y-auto max-h-[320px]">
            {historySessions.map((hs) => {
              const active = activeSessionId === hs.id;
              return (
                <div
                  key={hs.id}
                  onClick={() => {
                    setActiveSessionId(hs.id);
                    if (hs.id !== 'session-default') {
                      toast.success(`Memuat riwayat: ${hs.title}`);
                    }
                  }}
                  className={`p-3 border-2 border-black rounded-lg cursor-pointer transition-all ${
                    active 
                      ? 'bg-[#7C3AED] text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]' 
                      : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[9px] font-mono font-bold ${active ? 'text-purple-200' : 'text-zinc-500'}`}>{hs.code}</span>
                    <span className={`text-[9px] font-mono ${active ? 'text-purple-300' : 'text-zinc-400'}`}>{hs.time}</span>
                  </div>
                  <h4 className="text-[11px] font-extrabold truncate">{hs.title}</h4>
                </div>
              );
            })}
          </div>

          {/* New Session Button */}
          <div className="p-3 border-t-[3px] border-black bg-zinc-50">
            <button
              onClick={() => {
                clearHistory();
                setActiveSessionId('session-default');
                toast.success('Memulai sesi pembelajaran baru.');
              }}
              className="w-full py-2.5 bg-white border-2 border-black rounded-lg text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-center"
            >
              + NEW SESSION
            </button>
          </div>
        </div>

        {/* Cognitive Mode Widget */}
        <div className="bg-white border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-4 flex flex-col gap-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-extrabold uppercase font-mono tracking-wider flex items-center gap-1">
              <Brain size={13} className="text-[#7C3AED]" /> COGNITIVE DECK
            </h3>
            <p className="text-[9px] text-zinc-500 font-medium">Atur cara Tutor AI membimbing pemahaman Anda.</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {tutorModes.map((m) => {
              const active = session.mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id as any);
                    toast.success(`Mode kognitif diubah ke: ${m.label}`);
                  }}
                  className={`py-2 px-2 border-2 border-black rounded-lg font-bold text-[10px] flex items-center gap-1.5 transition-all shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer ${
                    active 
                      ? 'bg-[#7C3AED] text-white' 
                      : 'bg-white text-black hover:bg-zinc-100'
                  }`}
                >
                  <m.icon size={12} className={active ? 'text-white' : 'text-[#7C3AED]'} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Curriculum context picker */}
        <div className="bg-white border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-4 space-y-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-extrabold uppercase font-mono tracking-wider flex items-center gap-1">
              <BookOpen size={13} className="text-purple-600" /> MAPEL CONTEXT
            </h3>
            <p className="text-[9px] text-zinc-500 font-medium font-sans">Kaitkan sesi belajar dengan kurikulum aktif.</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSubjects(o => !o)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 border-black bg-zinc-50 hover:bg-zinc-100 text-xs font-bold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              <span className="truncate flex-1 text-left">
                {selectedSubject || '— Belajar Umum —'}
              </span>
              <ChevronDown size={12} className={`ml-2 flex-shrink-0 transition-transform ${showSubjects ? 'rotate-180' : ''}`} />
            </button>
            
            {showSubjects && (
              <div className="absolute left-0 right-0 mt-1 border-2 border-black rounded-lg overflow-hidden bg-white z-20 max-h-40 overflow-y-auto shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <button
                  onClick={() => { setSelectedSubject(''); setShowSubjects(false); }}
                  className="w-full text-left text-[10px] font-bold px-3 py-2.5 hover:bg-zinc-100 transition-colors text-zinc-400 border-b-2 border-black"
                >
                  — Belajar Umum —
                </button>
                {curriculumSubjects.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => { setSelectedSubject(sub.title); setShowSubjects(false); }}
                    className={`w-full text-left text-[10px] font-bold px-3 py-2.5 hover:bg-zinc-100 transition-colors border-b border-zinc-100 last:border-0 ${
                      selectedSubject === sub.title ? 'text-[#7C3AED] bg-purple-50' : 'text-black'
                    }`}
                  >
                    {sub.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: Chat Deck (Interactive Connection) */}
      <div className="flex-grow flex flex-col min-h-[500px] min-w-0 max-w-full">
        <div className="flex-grow flex flex-col bg-white border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden min-h-[550px] max-h-[calc(100vh-10rem)] min-w-0 max-w-full">
          
          {/* Header */}
          <div className="bg-[#7C3AED] text-white border-b-[3px] border-black px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                <Brain size={18} className="text-[#7C3AED]" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold uppercase font-mono tracking-wider">TUTOR Ω</h2>
                <p className="text-[9px] font-bold text-purple-200 uppercase tracking-widest font-mono">ACTIVE CONNECTION</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-black text-[#4ADE80] font-mono border-2 border-black shadow-[1.5px_1.5px_0px_rgba(255,255,255,1)] px-2.5 py-1 text-[9px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" /> SYSTEM ONLINE
              </Badge>

              <button
                onClick={() => setSoundOn(!soundOn)}
                title="Toggle Ambient Audio"
                className={`p-2 rounded-lg border-2 border-black transition-all cursor-pointer shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  soundOn ? 'bg-[#4ADE80] text-black' : 'bg-white text-black hover:bg-zinc-100'
                }`}
              >
                {soundOn ? <Volume2 size={13} className="animate-bounce" /> : <VolumeX size={13} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  clearHistory();
                  setActiveSessionId('session-default');
                  toast.success('Konteks tutor dibersihkan.');
                }}
                title="Bersihkan Konteks Tutor"
                className="p-2 rounded-lg border-2 border-black bg-white hover:bg-zinc-100 text-black transition-all shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                <MoreVertical size={13} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={chatScrollRef} className="ai-chat-scroll flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-6 bg-zinc-50/50 min-w-0" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 1.2px, transparent 1.2px)', backgroundSize: '12px 12px' }}>
            
            {displayMessages.length === 0 && activeSessionId === 'session-default' && (
              <div className="text-center py-12 space-y-4 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-full bg-purple-100 border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                  <MessageSquare className="text-[#7C3AED] w-6 h-6" />
                </div>
                <h3 className="text-sm font-extrabold uppercase">Mulai Percakapan Anda</h3>
                <p className="text-xs text-zinc-500 font-medium">Tanyakan tentang materi SMK kejuruan, teori, atau minta simulasi kuis interaktif dengan mengetik di bawah.</p>
              </div>
            )}

            {displayMessages.map((msg) => {
              const isTutor = msg.sender === 'tutor';
              return (
                <div key={msg.id} className={`flex flex-col ${isTutor ? 'items-start' : 'items-end'} space-y-1.5 min-w-0 w-full`}>
                  {/* Sender title */}
                  <span className="text-[9px] font-extrabold font-mono text-zinc-500 uppercase tracking-widest px-1">
                    {isTutor ? 'TUTOR Ω' : `${profile.name.toUpperCase()} 👤`}
                  </span>
                  
                  <div className={`flex ${isTutor ? 'justify-start' : 'justify-end'} w-full min-w-0`}>
                    <div
                      className={`ai-message-bubble w-fit max-w-[92%] sm:max-w-[85%] border-[3px] border-black rounded-xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] relative transition-all duration-200 ${
                        isTutor
                          ? 'bg-[#7C3AED] text-white'
                          : 'bg-[#4ADE80] text-black'
                      }`}
                    >
                      {isTutor ? (
                        (() => {
                          const { cleanContent, quizzes, flashcards } = parseMessageContent(msg.content);
                          return (
                            <div className="space-y-4 min-w-0 max-w-full">
                              <div className="ai-message-content font-sans text-xs leading-relaxed font-semibold">
                                <ReactMarkdown
                                  components={{
                                    p: ({children}) => <p className="mb-3 last:mb-0 text-white font-semibold">{children}</p>,
                                    h1: ({children}) => <h1 className="text-[13px] font-extrabold text-white mt-4 mb-2 uppercase tracking-wider border-b border-white/20 pb-0.5">{children}</h1>,
                                    h2: ({children}) => <h2 className="text-xs font-extrabold text-white mt-3 mb-1 uppercase">{children}</h2>,
                                    ul: ({children}) => <ul className="list-disc pl-4 space-y-1 mb-3 text-white">{children}</ul>,
                                    ol: ({children}) => <ol className="list-decimal pl-4 space-y-1 mb-3 text-white">{children}</ol>,
                                    li: ({children}) => <li className="text-[11px] text-white/90">{children}</li>,
                                    a: ({children, href}) => <a href={href} target="_blank" rel="noreferrer" className="text-yellow-200 underline decoration-yellow-200/60 break-all">{children}</a>,
                                    code: ({node, className, children, ...props}) => (
                                      <code className="bg-black/40 text-yellow-300 px-1 py-0.5 rounded font-mono text-[10px]" {...props}>
                                        {children}
                                      </code>
                                    ),
                                    pre: ({children}) => (
                                      <pre className="max-w-full bg-black/60 border border-black/40 p-3 rounded-lg font-mono text-[10px] text-green-400 overflow-x-auto my-3 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                                        {children}
                                      </pre>
                                    )
                                  }}
                                >
                                  {cleanContent}
                                </ReactMarkdown>
                              </div>
                              
                              {quizzes.map((quiz, qIdx) => (
                                <div key={`quiz-${msg.id}-${qIdx}`} className="border-2 border-black rounded-lg overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white text-black p-1">
                                  <ChatQuizCard
                                    rawContent={quiz}
                                    onCorrect={() => {
                                      addXp(50);
                                      updateQuestProgress('quiz', 1);
                                    }}
                                  />
                                </div>
                              ))}

                              {flashcards.map((fc, fcIdx) => (
                                <div key={`fc-${msg.id}-${fcIdx}`} className="border-2 border-black rounded-lg overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white text-black p-1">
                                  <ChatFlashcard
                                    rawContent={fc}
                                  />
                                </div>
                              ))}
                            </div>
                          );
                        })()
                      ) : (
                        <p className="whitespace-pre-wrap text-xs font-bold leading-relaxed break-words">{msg.content}</p>
                      )}
                      
                      <div className="flex justify-between items-center mt-3 pt-1.5 border-t border-black/10 text-[9px] font-mono opacity-80">
                        <span>MODE: {(modeLabels[session.mode] || session.mode).toUpperCase()}</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {isResponding && (
              <div className="flex flex-col items-start space-y-1.5">
                <span className="text-[9px] font-extrabold font-mono text-zinc-500 uppercase tracking-widest px-1">TUTOR Ω</span>
                <div className="flex justify-start w-full">
                  <div className="max-w-[70%] border-[3px] border-black rounded-xl p-4 bg-[#7C3AED] text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
                    <div className="flex items-center gap-2 text-[#4ADE80] text-[10px] font-extrabold font-mono">
                      <Cpu size={12} className="animate-spin text-[#4ADE80]" /> MEMPROSES LOGIKA BELAJAR...
                    </div>
                    <Skeleton className="h-3.5 w-48 bg-purple-900/60" />
                    <Skeleton className="h-3 w-36 bg-purple-900/60" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-5 py-3 border-t-2 border-black bg-zinc-50 flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-full border-2 border-black bg-white hover:bg-zinc-100 text-[10px] font-bold shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-4 border-t-[3px] border-black bg-white flex gap-4 flex-shrink-0 items-center">
            {/* Action buttons (Paperclip & Sigma/Calculator) */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push('/brain')}
                className="p-2.5 border-2 border-black rounded-lg bg-zinc-50 hover:bg-zinc-100 text-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                title="Unggah dokumen di Otak Kedua"
              >
                <Paperclip size={14} />
              </button>
              
              <button
                type="button"
                onClick={() => setInput(prev => prev + ' $$ f(x) = ... $$ ')}
                className="p-2.5 border-2 border-black rounded-lg bg-zinc-50 hover:bg-zinc-100 text-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                title="Sisipkan Rumus Matematika"
              >
                <Calculator size={14} />
              </button>
            </div>

            {/* Input field */}
            <input
              ref={inputRef}
              type="text"
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                selectedSubject
                  ? `Tanyakan materi: ${selectedSubject}...`
                  : 'Ketik tanggapan atau ajukan pertanyaan Anda di sini...'
              }
              className="flex-grow h-11 px-4 bg-zinc-50 border-2 border-black rounded-lg text-xs font-bold text-black focus:outline-none placeholder:text-zinc-400 focus:bg-white transition-all shadow-[inset_1.5px_1.5px_3px_rgba(0,0,0,0.15)]"
            />

            {/* Send button */}
            <button 
              type="submit" 
              disabled={isResponding || !input.trim()} 
              className="h-11 px-6 flex-shrink-0 bg-[#FBBF24] hover:bg-[#F59E0B] text-black border-2 border-black rounded-lg font-bold text-xs shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              SEND <Send size={12} className="stroke-[2.5]" />
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
