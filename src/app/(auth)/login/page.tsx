'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';
import { Lock, Mail, ArrowLeft, Chrome, Github, Zap, BookOpen, Brain, Sparkles } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const { loadFromDb } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (res?.error) {
        setError('Alamat email tidak terdaftar atau sandi salah. Demo: alex@academy.os / academy123');
        setIsLoading(false);
      } else {
        await loadFromDb(email);
        setIsLoading(false);
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi database.');
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    setIsLoading(true);
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col justify-center items-center px-4 relative select-none"
      style={{ backgroundImage: 'radial-gradient(rgba(26,28,28,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      
      {/* Floating decorative elements */}
      <div className="absolute top-12 left-12 w-16 h-16 bg-[#fde047] border-[3px] border-[#1a1c1c] rotate-12 hidden md:flex items-center justify-center"
        style={{ boxShadow: '4px 4px 0 #1a1c1c' }}>
        <Zap size={28} />
      </div>
      <div className="absolute top-32 right-16 w-14 h-14 bg-[#86efac] border-[3px] border-[#1a1c1c] -rotate-6 hidden md:flex items-center justify-center"
        style={{ boxShadow: '4px 4px 0 #1a1c1c' }}>
        <BookOpen size={24} />
      </div>
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-[#88d8f8] border-[3px] border-[#1a1c1c] rotate-6 hidden md:flex items-center justify-center"
        style={{ boxShadow: '3px 3px 0 #1a1c1c' }}>
        <Brain size={22} />
      </div>
      <div className="absolute bottom-32 right-24 w-14 h-14 bg-[#a388ee] border-[3px] border-[#1a1c1c] -rotate-12 hidden md:flex items-center justify-center"
        style={{ boxShadow: '4px 4px 0 #1a1c1c' }}>
        <Sparkles size={24} />
      </div>
      
      {/* Back button */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-black uppercase border-[2px] border-[#1a1c1c] bg-white px-3 py-2 hover:bg-[#f3f3f4] transition-colors"
        style={{ boxShadow: '2px 2px 0 #1a1c1c' }}>
        <ArrowLeft size={14} /> Kembali
      </Link>

      {/* Login Card */}
      <div className="max-w-md w-full bg-white border-[3px] border-[#1a1c1c] p-8 space-y-6"
        style={{ boxShadow: '8px 8px 0 #1a1c1c' }}>
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#fde047] border-[3px] border-[#1a1c1c] font-mono font-black text-2xl mb-4"
            style={{ boxShadow: '4px 4px 0 #1a1c1c' }}>
            Ω
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Masuk ke Web Belajar</h2>
          <p className="text-xs font-bold text-[#7d7761] mt-1 uppercase tracking-wide">Verifikasi kredensial profil belajar</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-[#fca5a5] border-[3px] border-[#1a1c1c] text-[11px] font-bold leading-relaxed"
            style={{ boxShadow: '3px 3px 0 #1a1c1c' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wide">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-[#7d7761]" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@academy.os"
                className="w-full h-11 pl-10 pr-4 bg-[#f3f3f4] border-[3px] border-[#1a1c1c] text-sm font-bold text-[#1a1c1c] focus:outline-none focus:bg-[#fde047]/20 transition-colors placeholder:text-[#7d7761] placeholder:font-normal"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wide">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-[#7d7761]" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-4 bg-[#f3f3f4] border-[3px] border-[#1a1c1c] text-sm font-bold text-[#1a1c1c] focus:outline-none focus:bg-[#fde047]/20 transition-colors placeholder:text-[#7d7761] placeholder:font-normal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-2 text-sm font-black uppercase bg-[#8127cf] text-white border-[3px] border-[#1a1c1c] hover:bg-[#6900b3] disabled:opacity-50 transition-colors cursor-pointer"
            style={{ boxShadow: '4px 4px 0 #1a1c1c' }}
          >
            {isLoading ? '⏳ Membuka Kunci Profil...' : '🔓 Masuk ke Ruang Kerja'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t-[2px] border-[#1a1c1c]" />
          <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest bg-white px-2">Atau</span>
          <div className="flex-grow border-t-[2px] border-[#1a1c1c]" />
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
            className="h-11 text-xs font-black uppercase flex items-center justify-center gap-2 border-[3px] border-[#1a1c1c] bg-[#fca5a5] hover:bg-[#f87171] transition-colors cursor-pointer disabled:opacity-50"
            style={{ boxShadow: '3px 3px 0 #1a1c1c' }}
          >
            <Chrome size={14} /> Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuthLogin('github')}
            disabled={isLoading}
            className="h-11 text-xs font-black uppercase flex items-center justify-center gap-2 border-[3px] border-[#1a1c1c] bg-[#f3f3f4] hover:bg-[#e2e2e2] transition-colors cursor-pointer disabled:opacity-50"
            style={{ boxShadow: '3px 3px 0 #1a1c1c' }}
          >
            <Github size={14} /> GitHub
          </button>
        </div>

        {/* Register Link */}
        <div className="text-center text-xs font-bold">
          Belum punya profil?{' '}
          <Link href="/register" className="text-[#8127cf] hover:underline font-black uppercase">
            Daftar Sekarang →
          </Link>
        </div>
      </div>
    </div>
  );
}
