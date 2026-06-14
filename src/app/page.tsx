'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Brain, Sparkles,
  Zap, Trophy, Cpu, Network, GraduationCap,
  Star, Rocket, Gamepad2, PenTool, Bot
} from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'Otak Kedua AI',
    desc: 'Upload catatan → AI rangkum, buat kuis adaptif, dan peta galaksi pengetahuan otomatis.',
    color: 'bg-[#a388ee]',
    shadow: '6px 6px 0 #1a1c1c',
  },
  {
    icon: Sparkles,
    title: 'Tutor AI 5 Mode',
    desc: 'Mode Metafora, Guru, Profesor, Penguji Sokrates, atau Debater. Kurikulum Merdeka terintegrasi.',
    color: 'bg-[#88d8f8]',
    shadow: '6px 6px 0 #1a1c1c',
  },
  {
    icon: Trophy,
    title: 'Sistem RPG Belajar',
    desc: 'XP, level, skill tree, misi harian, achievement badge. Belajar jadi game seru!',
    color: 'bg-[#fde047]',
    shadow: '6px 6px 0 #1a1c1c',
  },
  {
    icon: Network,
    title: 'Galaksi Pengetahuan',
    desc: 'Visualisasi koneksi antar konsep dalam peta galaksi interaktif. Temukan blind spot Anda.',
    color: 'bg-[#86efac]',
    shadow: '6px 6px 0 #1a1c1c',
  },
  {
    icon: Cpu,
    title: 'Kembaran Digital AI',
    desc: 'AI analisis pola belajar, prediksi kesiapan ujian, dan jadwal optimal personal.',
    color: 'bg-[#fca5a5]',
    shadow: '6px 6px 0 #1a1c1c',
  },
  {
    icon: GraduationCap,
    title: 'Kurikulum Merdeka',
    desc: 'Peta pelajaran SMA/SMK Fase E & F dengan Capaian Pembelajaran dan HOTS terintegrasi.',
    color: 'bg-[#fdba74]',
    shadow: '6px 6px 0 #1a1c1c',
  },
];

const STATS = [
  { label: 'Mata Pelajaran', value: '24+', icon: BookOpen, color: 'bg-[#a388ee]' },
  { label: 'Bank Soal', value: '500+', icon: Star, color: 'bg-[#fde047]' },
  { label: 'Mode Belajar AI', value: '7', icon: Bot, color: 'bg-[#88d8f8]' },
  { label: 'Kurikulum Merdeka', value: '100%', icon: GraduationCap, color: 'bg-[#86efac]' },
];

export default function LandingPage() {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col relative overflow-hidden select-none"
      style={{ backgroundImage: 'radial-gradient(rgba(26,28,28,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
    >
      {/* ──────── HEADER ──────── */}
      <header className="flex items-center justify-between px-6 md:px-12 h-20 border-b-[3px] border-[#1a1c1c] bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#fde047] border-[3px] border-[#1a1c1c] flex items-center justify-center font-mono font-black text-xl"
            style={{ boxShadow: '3px 3px 0 #1a1c1c' }}>
            Ω
          </div>
          <div>
            <span className="font-black text-base tracking-wider uppercase">Web Belajar</span>
            <span className="block text-[9px] font-mono text-[#8127cf] tracking-widest uppercase font-bold">Platform Belajar Online</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wide">
          <a href="#features" className="hover:text-[#8127cf] transition-colors">Fitur</a>
          <a href="#curriculum" className="hover:text-[#8127cf] transition-colors">Kurikulum</a>
          <a href="#stats" className="hover:text-[#8127cf] transition-colors">Platform</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="h-10 px-5 text-xs font-black uppercase border-[3px] border-[#1a1c1c] bg-white hover:bg-[#f3f3f4] transition-colors cursor-pointer"
              style={{ boxShadow: '3px 3px 0 #1a1c1c' }}>
              Masuk
            </button>
          </Link>
          <Link href="/register">
            <button className="h-10 px-5 text-xs font-black uppercase border-[3px] border-[#1a1c1c] bg-[#fde047] hover:bg-[#e2c62d] transition-colors cursor-pointer"
              style={{ boxShadow: '3px 3px 0 #1a1c1c' }}>
              Mulai Gratis →
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* ──────── HERO SECTION ──────── */}
        <section className="flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 max-w-5xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border-[3px] border-[#1a1c1c] bg-[#a388ee] text-xs font-bold uppercase tracking-wide mb-8"
            style={{ boxShadow: '4px 4px 0 #1a1c1c' }}>
            <span className="w-2 h-2 bg-[#1a1c1c] animate-pulse" />
            Kurikulum Merdeka SMA & SMK 2025
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] font-black tracking-tight leading-[1.05] mb-6 uppercase">
            <span>Belajar dengan</span>
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">Presisi Mutlak.</span>
              <span className="absolute bottom-1 left-0 right-0 h-5 bg-[#fde047] -z-0 -skew-x-2" />
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-[#4b4734] max-w-2xl leading-relaxed mb-10">
            Platform belajar bertenaga AI pertama di Indonesia yang sepenuhnya selaras dengan
            <strong className="text-[#1a1c1c]"> Kurikulum Merdeka</strong>. Upload materi → AI rangkum, buat kuis,
            susun jadwal, dan prediksi kesiapan ujian.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register">
              <button className="group h-14 px-8 text-sm font-black uppercase border-[3px] border-[#1a1c1c] bg-[#8127cf] text-white hover:bg-[#6900b3] transition-all flex items-center gap-2 cursor-pointer"
                style={{ boxShadow: '6px 6px 0 #1a1c1c' }}>
                <Zap size={18} className="group-hover:rotate-12 transition-transform" />
                Aktifkan Ruang Belajar
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/login">
              <button className="h-14 px-8 text-sm font-black uppercase border-[3px] border-[#1a1c1c] bg-white hover:bg-[#f3f3f4] transition-all flex items-center gap-2 cursor-pointer"
                style={{ boxShadow: '6px 6px 0 #1a1c1c' }}>
                <Gamepad2 size={18} />
                Demo Langsung
              </button>
            </Link>
          </div>

          {/* Stats Row */}
          <div id="stats" className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-3xl">
            {STATS.map((stat, i) => (
              <div key={i} className={`${stat.color} border-[3px] border-[#1a1c1c] p-4 text-center`}
                style={{ boxShadow: '4px 4px 0 #1a1c1c' }}>
                <stat.icon size={20} className="mx-auto mb-1" />
                <div className="text-2xl font-black font-mono">{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wide mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ──────── APP PREVIEW MOCKUP ──────── */}
        <section className="px-4 max-w-5xl mx-auto mb-16">
          <div className="border-[3px] border-[#1a1c1c] bg-white overflow-hidden"
            style={{ boxShadow: '8px 8px 0 #1a1c1c' }}>
            {/* Window Chrome */}
            <div className="flex items-center gap-2 px-4 h-10 bg-[#f3f3f4] border-b-[3px] border-[#1a1c1c]">
              <div className="w-3 h-3 bg-[#ef4444] border-2 border-[#1a1c1c]" />
              <div className="w-3 h-3 bg-[#fde047] border-2 border-[#1a1c1c]" />
              <div className="w-3 h-3 bg-[#22c55e] border-2 border-[#1a1c1c]" />
              <span className="ml-4 text-[10px] font-mono font-bold text-[#7d7761]">academy-os.app/dashboard</span>
            </div>

            {/* App Content */}
            <div className="grid grid-cols-[180px_1fr] min-h-[300px]">
              {/* Mini Sidebar */}
              <div className="bg-white border-r-[3px] border-[#1a1c1c] p-3 space-y-1">
                {['Dashboard', 'Kurikulum', 'AI Tutor', 'Galaksi', 'RPG', 'Planner'].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2 text-[11px] font-bold border-[2px] border-[#1a1c1c] ${i === 0 ? 'bg-[#fde047]' : 'bg-white hover:bg-[#f3f3f4]'}`}
                    style={i === 0 ? { boxShadow: '2px 2px 0 #1a1c1c' } : {}}>
                    <div className={`w-2 h-2 ${i === 0 ? 'bg-[#1a1c1c]' : 'bg-[#cec6ad]'}`} />
                    {item}
                  </div>
                ))}
              </div>

              {/* Main Content Area */}
              <div className="p-5 space-y-4 bg-[#f9f9f9]">
                <div className="flex gap-3">
                  {[
                    { val: '24', label: 'Pelajaran Aktif', bg: 'bg-[#a388ee]' },
                    { val: '87%', label: 'Prediksi Ujian', bg: 'bg-[#88d8f8]' },
                    { val: '12 Hari', label: 'Streak Belajar', bg: 'bg-[#fde047]' }
                  ].map((card, i) => (
                    <div key={i} className={`flex-1 p-3 ${card.bg} border-[2px] border-[#1a1c1c]`}
                      style={{ boxShadow: '3px 3px 0 #1a1c1c' }}>
                      <div className="text-lg font-black font-mono">{card.val}</div>
                      <div className="text-[9px] font-bold uppercase mt-0.5">{card.label}</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-white border-[2px] border-[#1a1c1c]" style={{ boxShadow: '3px 3px 0 #1a1c1c' }}>
                  <div className="text-[10px] font-mono font-black text-[#8127cf] mb-2">📚 KURIKULUM MERDEKA — MATEMATIKA FASE F</div>
                  <div className="space-y-2">
                    {[
                      { name: 'Turunan & Integral Fungsi', pct: 75 },
                      { name: 'Statistika & Peluang', pct: 42 },
                      { name: 'Trigonometri Lanjut', pct: 20 }
                    ].map((lesson, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="font-bold">{lesson.name}</span>
                        <div className="w-20 h-3 bg-[#f3f3f4] border-[2px] border-[#1a1c1c] overflow-hidden">
                          <div className="h-full bg-[#8127cf]" style={{ width: `${lesson.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 p-3 bg-[#88d8f8] border-[2px] border-[#1a1c1c] text-[11px] font-bold" style={{ boxShadow: '3px 3px 0 #1a1c1c' }}>
                    <span className="font-mono text-[9px] font-black block mb-1">🤖 AI TUTOR</span>
                    &quot;Fokus di Integral Tertentu malam ini berdasarkan pola belajar Anda...&quot;
                  </div>
                  <div className="flex-1 p-3 bg-[#fde047] border-[2px] border-[#1a1c1c] text-[11px] font-bold" style={{ boxShadow: '3px 3px 0 #1a1c1c' }}>
                    <span className="font-mono text-[9px] font-black block mb-1">🏆 MISI RPG</span>
                    Selesaikan 2 latihan HOTS untuk naik ke Level 7!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────── FEATURES GRID ──────── */}
        <section id="features" className="px-4 max-w-5xl mx-auto mb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 border-[3px] border-[#1a1c1c] bg-[#fde047] text-xs font-black uppercase tracking-wide mb-4"
              style={{ boxShadow: '4px 4px 0 #1a1c1c' }}>
              <Rocket size={14} /> Sistem Terintegrasi Penuh
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase">Bukan Sekadar Platform Belajar.</h2>
            <p className="text-[#4b4734] mt-3 max-w-xl mx-auto text-sm font-medium">
              Web Belajar adalah platform belajar online lengkap — setiap modul terhubung, beradaptasi, dan berevolusi bersama Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                className={`${feat.color} border-[3px] border-[#1a1c1c] p-6 hover:-translate-y-1 transition-transform duration-200 cursor-default`}
                style={{ boxShadow: feat.shadow }}
              >
                <div className="w-12 h-12 bg-white border-[3px] border-[#1a1c1c] flex items-center justify-center mb-4"
                  style={{ boxShadow: '3px 3px 0 #1a1c1c' }}>
                  <feat.icon size={20} />
                </div>
                <h3 className="text-sm font-black uppercase mb-2">{feat.title}</h3>
                <p className="text-xs font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ──────── CURRICULUM SECTION ──────── */}
        <section id="curriculum" className="px-4 max-w-5xl mx-auto mb-16">
          <div className="border-[3px] border-[#1a1c1c] bg-white p-8 md:p-10"
            style={{ boxShadow: '8px 8px 0 #1a1c1c' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border-[3px] border-[#1a1c1c] bg-[#86efac] text-[11px] font-black uppercase tracking-wide mb-4"
                  style={{ boxShadow: '3px 3px 0 #1a1c1c' }}>
                  <GraduationCap size={13} /> Kurikulum Merdeka 2025
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase mb-4">
                  Dibangun di atas Fondasi Kurikulum Nasional
                </h2>
                <p className="text-sm text-[#4b4734] leading-relaxed mb-6">
                  Setiap pelajaran, kuis, dan capaian dikurasi selaras dengan <strong>Fase E & F</strong>,
                  mendukung jalur SMA dan SMK dengan pendekatan <strong>Deep Learning</strong> dan <strong>Profil Pelajar Pancasila</strong>.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Fase E (Kelas 10)', 'Fase F (Kelas 11-12)', 'SMA Umum', 'SMK Kejuruan', 'HOTS', 'Deep Learning'].map((tag) => (
                    <span key={tag} className="px-3 py-1.5 border-[2px] border-[#1a1c1c] bg-[#f3f3f4] text-[10px] font-black uppercase"
                      style={{ boxShadow: '2px 2px 0 #1a1c1c' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { subject: 'Matematika', lessons: 18, phase: 'Fase E & F', bg: 'bg-[#a388ee]' },
                  { subject: 'Fisika', lessons: 14, phase: 'Fase F (IPA)', bg: 'bg-[#88d8f8]' },
                  { subject: 'Informatika', lessons: 12, phase: 'Fase E & F', bg: 'bg-[#fde047]' },
                  { subject: 'Bahasa Indonesia', lessons: 16, phase: 'Fase E & F', bg: 'bg-[#fdba74]' },
                  { subject: 'SMK: Pemrograman', lessons: 20, phase: 'SMK Teknologi', bg: 'bg-[#86efac]' },
                ].map((sub, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 border-[2px] border-[#1a1c1c] ${sub.bg}`}
                    style={{ boxShadow: '3px 3px 0 #1a1c1c' }}>
                    <div>
                      <div className="text-xs font-black uppercase">{sub.subject}</div>
                      <div className="text-[10px] font-mono font-bold">{sub.phase}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black font-mono">{sub.lessons}</div>
                      <div className="text-[9px] font-bold uppercase">modul</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ──────── CTA SECTION ──────── */}
        <section className="px-4 max-w-4xl mx-auto mb-16 text-center">
          <div className="border-[3px] border-[#1a1c1c] bg-[#fde047] p-12 relative"
            style={{ boxShadow: '8px 8px 0 #1a1c1c' }}>
            {/* Decorative stickers */}
            <div className="absolute top-4 right-4 w-16 h-16 bg-[#a388ee] border-[3px] border-[#1a1c1c] flex items-center justify-center rotate-12"
              style={{ boxShadow: '3px 3px 0 #1a1c1c' }}>
              <Star size={28} />
            </div>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-[#88d8f8] border-[3px] border-[#1a1c1c] flex items-center justify-center -rotate-6"
              style={{ boxShadow: '3px 3px 0 #1a1c1c' }}>
              <Zap size={22} />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black uppercase mb-4">
              Siap Naik Level?
            </h2>
            <p className="text-[#4b4734] max-w-lg mx-auto mb-8 text-sm font-medium">
              Bergabung dan mulai belajar dengan sistem yang dirancang untuk memaksimalkan setiap menit sesi belajar Anda.
            </p>
            <Link href="/register">
              <button className="group h-14 px-10 text-base font-black uppercase border-[3px] border-[#1a1c1c] bg-[#8127cf] text-white hover:bg-[#6900b3] transition-all flex items-center gap-3 mx-auto cursor-pointer"
                style={{ boxShadow: '6px 6px 0 #1a1c1c' }}>
                <Rocket size={20} className="group-hover:rotate-12 transition-transform" />
                Aktifkan Web Belajar
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* ──────── FOOTER ──────── */}
      <footer className="border-t-[3px] border-[#1a1c1c] bg-white px-6 md:px-12 py-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#fde047] border-[2px] border-[#1a1c1c] flex items-center justify-center font-mono font-black text-sm"
              style={{ boxShadow: '2px 2px 0 #1a1c1c' }}>
              Ω
            </div>
            <span className="text-xs font-black uppercase tracking-wider">Web Belajar — v2.0</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-mono font-bold uppercase text-[#7d7761]">
            <span>Kurikulum Merdeka 2025</span>
            <span>SMA & SMK</span>
            <span>Fase E + F</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
