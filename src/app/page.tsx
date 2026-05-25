'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, Shield, Sparkles, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden select-none">
      {/* Background radial pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1c1c21_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 h-20 border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-white font-mono font-bold text-lg">
            Ω
          </div>
          <span className="font-bold text-text-primary text-base tracking-wide">
            ACADEMY OS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Masuk</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Mulai Belajar</Button>
          </Link>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 max-w-4xl mx-auto text-center py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-accent/20 text-accent text-xs font-mono mb-6"
        >
          <Sparkles size={12} /> Sistem Operasi Pembelajaran Adaptif
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-tight"
        >
          Belajar dengan <span className="gradient-text">Presisi Mutlak.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-sm sm:text-base text-text-secondary max-w-xl mt-6 leading-relaxed"
        >
          Hentikan menghafal secara membabi buta. Academy OS Ω mengurai materi belajar Anda, menyusun peta pengetahuan personal, meningkatkan keterampilan Anda, dan memprediksi kesiapan ujian dengan presisi mikro.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-6">
              Masuk ke Ruang Kerja <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto h-11 px-6">
              Akses Profil Lama
            </Button>
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24 text-left"
        >
          <div className="p-6 rounded-lg bg-bg-secondary border border-border">
            <div className="w-10 h-10 rounded bg-accent-subtle flex items-center justify-center text-accent mb-4">
              <Brain size={18} />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Otak Kedua</h3>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Unggah PDF atau dokumen teks untuk mengekstrak ringkasan, membuat kuis adaptif, dan memetakan koneksi dalam galaksi node.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-bg-secondary border border-border">
            <div className="w-10 h-10 rounded bg-success-subtle flex items-center justify-center text-success mb-4">
              <Sparkles size={18} />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Tutor AI Claude</h3>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Belajar dengan mode khusus: metafora sederhana, bimbingan pengajar, analisis profesor, pertanyaan ujian sokratik, atau debat teori.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-bg-secondary border border-border">
            <div className="w-10 h-10 rounded bg-warning-subtle flex items-center justify-center text-warning mb-4">
              <Terminal size={18} />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Studi RPG</h3>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Dapatkan XP, capai prestasi baru, selesaikan misi harian, dan tingkatkan keterampilan Fokus, Logika, dan Disiplin secara interaktif.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-border/40 flex items-center justify-between px-6 md:px-12 text-[10px] font-mono text-text-tertiary mt-auto">
        <span>VERSI SISTEM: OMEGA 1.0.0</span>
        <span>SIAP DEPLOY</span>
      </footer>
    </div>
  );
}
