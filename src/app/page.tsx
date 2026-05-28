'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, BookOpen, Brain, Shield, Sparkles, Terminal, 
  Zap, Trophy, Cpu, Network, BarChart3, GraduationCap,
  ChevronDown, Star, Users, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Brain,
    title: 'Otak Kedua AI',
    desc: 'Upload catatan → AI ekstrak ringkasan, buat kuis adaptif, peta galaksi pengetahuan secara otomatis.',
    color: 'from-violet-500/20 to-indigo-500/20',
    border: 'border-violet-500/30',
    iconColor: 'text-violet-400',
  },
  {
    icon: Sparkles,
    title: 'Tutor AI 5 Mode',
    desc: 'Mode Metafora, Guru, Profesor, Penguji Sokrates, atau Debater. Konteks kurikulum Merdeka terintegrasi.',
    color: 'from-cyan-500/20 to-sky-500/20',
    border: 'border-cyan-500/30',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Trophy,
    title: 'Sistem RPG Belajar',
    desc: 'XP, level, skill tree Fokus/Logika/Kreativitas, misi harian, achievement badge. Belajar jadi game.',
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
  },
  {
    icon: Network,
    title: 'Galaksi Pengetahuan',
    desc: 'Visualisasi koneksi antar konsep dalam peta galaksi interaktif. Temukan blind spot belajar Anda.',
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Cpu,
    title: 'Kembaran Digital AI',
    desc: 'AI menganalisis pola belajar Anda, prediksi kesiapan ujian, dan rekomendasikan jadwal optimal.',
    color: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-500/30',
    iconColor: 'text-pink-400',
  },
  {
    icon: GraduationCap,
    title: 'Kurikulum Merdeka',
    desc: 'Peta pelajaran SMA/SMK Fase E & F dengan Capaian Pembelajaran, Deep Learning, dan HOTS terintegrasi.',
    color: 'from-blue-500/20 to-indigo-500/20',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
  },
];

const STATS = [
  { label: 'Mata Pelajaran', value: '24+', icon: BookOpen },
  { label: 'Bank Soal Nasional', value: '500+', icon: Shield },
  { label: 'Mode Belajar AI', value: '7', icon: Sparkles },
  { label: 'Capaian Kurikulum', value: '100%', icon: Star },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#080810] text-white flex flex-col relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow orbs */}
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[700px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(79,70,229,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Floating particles */}
        {mounted && Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-indigo-400/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-16 h-20 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-[#080810]/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-mono font-bold text-lg shadow-lg shadow-indigo-500/30">
            Ω
          </div>
          <div>
            <span className="font-black text-white text-base tracking-wider">ACADEMY OS</span>
            <span className="block text-[9px] font-mono text-indigo-400/80 tracking-widest uppercase">Learning Operating System</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-xs text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Fitur</a>
          <a href="#curriculum" className="hover:text-white transition-colors">Kurikulum</a>
          <a href="#stats" className="hover:text-white transition-colors">Platform</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="h-9 px-4 text-xs font-semibold text-white/70 hover:text-white transition-colors border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/5">
              Masuk
            </button>
          </Link>
          <Link href="/register">
            <button className="h-9 px-5 text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-lg text-white hover:from-indigo-500 hover:to-cyan-500 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50">
              Mulai Gratis →
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">
        <section className="flex flex-col items-center justify-center text-center px-4 pt-24 pb-20 max-w-6xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Disesuaikan dengan Kurikulum Merdeka SMA & SMK Indonesia 2025
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.05] mb-6"
          >
            <span className="text-white">Belajar dengan</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Presisi Mutlak.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-white/50 max-w-2xl leading-relaxed mb-10"
          >
            Platform belajar bertenaga AI pertama di Indonesia yang sepenuhnya selaras dengan 
            <strong className="text-white/70"> Kurikulum Merdeka</strong>. Upload materi → AI rangkum, buat kuis, 
            susun jadwal optimal, dan prediksi kesiapan ujian Anda.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/register">
              <button className="group h-13 px-8 py-3.5 text-sm font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl text-white hover:from-indigo-500 hover:to-cyan-500 transition-all shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 flex items-center gap-2">
                <Zap size={16} className="group-hover:rotate-12 transition-transform" />
                Aktifkan Ruang Belajar
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="h-13 px-8 py-3.5 text-sm font-semibold text-white/70 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/5 hover:text-white transition-all flex items-center gap-2">
                <Globe size={16} />
                Demo Langsung
              </button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            id="stats"
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 w-full max-w-3xl"
          >
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-xs text-white/40 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* OS Preview / App Window Mockup */}
        <section className="px-4 max-w-6xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative rounded-2xl border border-white/10 overflow-hidden bg-[#0d0d18] shadow-2xl shadow-black/60"
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 h-10 bg-white/5 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-4 text-[10px] font-mono text-white/30">academy-os.vercel.app/dashboard</span>
            </div>

            {/* App content mockup */}
            <div className="grid grid-cols-[200px_1fr] h-80">
              {/* Sidebar */}
              <div className="bg-[#0a0a14] border-r border-white/5 p-4 space-y-1">
                {['Dashboard', 'Kurikulum', 'AI Tutor', 'Galaksi', 'RPG System', 'Planner'].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${i === 0 ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/30'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-indigo-400' : 'bg-white/20'}`} />
                    {item}
                  </div>
                ))}
              </div>
              
              {/* Main content area */}
              <div className="p-6 space-y-4 overflow-hidden">
                <div className="flex gap-3">
                  {[['24', 'Pelajaran Aktif', 'indigo'], ['87%', 'Prediksi Ujian', 'cyan'], ['12 Hari', 'Streak Belajar', 'amber']].map(([val, label, color], i) => (
                    <div key={i} className="flex-1 p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className={`text-lg font-black text-${color}-400`}>{val}</div>
                      <div className="text-[9px] text-white/30 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                  <div className="text-[10px] text-indigo-400 font-mono mb-2">📚 KURIKULUM MERDEKA — MATEMATIKA FASE F</div>
                  <div className="space-y-1.5">
                    {['Turunan & Integral Fungsi', 'Statistika & Peluang', 'Trigonometri Lanjut'].map((lesson, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-white/50">{lesson}</span>
                        <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500" style={{ width: `${[75, 42, 20][i]}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-xs text-cyan-400/80">
                    <span className="font-mono text-[9px] block mb-1">AI TUTOR</span>
                    &quot;Berdasarkan pola belajar Anda, saya rekomendasikan fokus di Integral Tertentu malam ini...&quot;
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs text-amber-400/80">
                    <span className="font-mono text-[9px] block mb-1">MISI RPG</span>
                    🏆 Selesaikan 2 latihan soal HOTS untuk naik ke Level 7!
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="px-4 max-w-6xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-mono mb-4">
              <Cpu size={11} /> Sistem Terintegrasi Penuh
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Bukan Sekadar Platform Belajar.</h2>
            <p className="text-white/40 mt-3 max-w-xl mx-auto text-sm">
              Academy OS adalah sistem operasi belajar lengkap — setiap modul terhubung, beradaptasi, dan berevolusi bersama Anda.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className={`p-6 rounded-xl border ${feat.border} bg-gradient-to-br ${feat.color} hover:scale-[1.02] transition-transform duration-200 cursor-default`}
              >
                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${feat.iconColor} mb-4`}>
                  <feat.icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Curriculum Highlight */}
        <section id="curriculum" className="px-4 max-w-6xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px]" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-4">
                  <GraduationCap size={11} /> Kurikulum Merdeka 2025
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
                  Dibangun di atas Fondasi Kurikulum Nasional
                </h2>
                <p className="text-sm text-white/50 leading-relaxed mb-6">
                  Setiap pelajaran, kuis, dan capaian dikurasi selaras dengan <strong className="text-white/80">Fase E & F</strong>, 
                  mendukung jalur SMA (Umum, IPA, IPS, Bahasa) dan SMK (Teknologi, Bisnis, Seni) 
                  dengan pendekatan <strong className="text-white/80">Deep Learning</strong> dan <strong className="text-white/80">Profil Pelajar Pancasila</strong>.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Fase E (Kelas 10)', 'Fase F (Kelas 11-12)', 'SMA Umum', 'SMK Kejuruan', 'Capaian Pembelajaran', 'HOTS'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { subject: 'Matematika', lessons: 18, phase: 'Fase E & F' },
                  { subject: 'Fisika', lessons: 14, phase: 'Fase F (IPA)' },
                  { subject: 'Informatika', lessons: 12, phase: 'Fase E & F' },
                  { subject: 'Bahasa Indonesia', lessons: 16, phase: 'Fase E & F' },
                  { subject: 'SMK: Pemrograman', lessons: 20, phase: 'SMK Teknologi' },
                ].map((sub, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <div>
                      <div className="text-xs font-bold text-white">{sub.subject}</div>
                      <div className="text-[10px] text-white/30 font-mono">{sub.phase}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-indigo-400">{sub.lessons}</div>
                      <div className="text-[9px] text-white/30">modul</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="px-4 max-w-4xl mx-auto mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.15),transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
                Siap Naik Level?
              </h2>
              <p className="text-white/40 max-w-lg mx-auto mb-8 text-sm">
                Bergabung dan mulai belajar dengan sistem yang dirancang untuk memaksimalkan setiap menit sesi belajar Anda.
              </p>
              <Link href="/register">
                <button className="group h-14 px-10 text-base font-black bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 rounded-xl text-white hover:opacity-90 transition-all shadow-2xl shadow-indigo-600/40 flex items-center gap-3 mx-auto">
                  <Zap size={18} className="group-hover:rotate-12 transition-transform" />
                  Aktifkan Academy OS Anda
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 md:px-16 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded flex items-center justify-center text-white font-mono font-bold text-xs">Ω</div>
            <span className="text-xs font-bold text-white/40 tracking-wider">ACADEMY OS — OMEGA v2.0</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] text-white/20 font-mono">
            <span>KURIKULUM MERDEKA 2025</span>
            <span>SMA & SMK TERINTEGRASI</span>
            <span>FASE E + F</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
