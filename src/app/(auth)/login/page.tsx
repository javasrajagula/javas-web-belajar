'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Mail, ArrowLeft, Chrome, Github } from 'lucide-react';
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
        setError('Alamat email tidak terdaftar atau sandi salah. Gunakan email demo: alex@academy.os atau budi@academy.os');
        setIsLoading(false);
      } else {
        // Load the profile from DB into Zustand store
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
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-center items-center px-4 relative select-none">
      <Link href="/" className="absolute top-6 left-6 text-text-secondary hover:text-text-primary flex items-center gap-1.5 text-xs font-mono">
        <ArrowLeft size={14} /> Kembali
      </Link>

      <Card className="max-w-md w-full p-8 border border-border bg-bg-secondary shadow-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded bg-primary text-white font-mono font-bold text-xl mb-3">
            Ω
          </div>
          <h2 className="text-xl font-bold tracking-tight">Masuk ke Academy OS</h2>
          <p className="text-xs text-text-secondary mt-1">Verifikasi kredensial untuk memuat profil belajar</p>
        </div>

        {error && (
          <div className="p-3 bg-danger-subtle/10 border border-danger/20 text-danger rounded text-[11px] leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-text-tertiary" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@academy.os"
                className="w-full h-10 pl-10 pr-4 bg-bg-tertiary border border-border rounded text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-text-tertiary" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-10 pr-4 bg-bg-tertiary border border-border rounded text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-11 mt-4">
            {isLoading ? 'Membuka Kunci Profil Aman...' : 'Masuk ke Ruang Kerja'}
          </Button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-[10px] text-text-tertiary font-mono uppercase">Atau masuk dengan</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleOAuthLogin('google')} 
            disabled={isLoading}
            className="h-10 text-xs flex items-center justify-center gap-2 border border-border hover:bg-bg-tertiary"
          >
            <Chrome size={14} className="text-danger" /> Google
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleOAuthLogin('github')} 
            disabled={isLoading}
            className="h-10 text-xs flex items-center justify-center gap-2 border border-border hover:bg-bg-tertiary"
          >
            <Github size={14} /> GitHub
          </Button>
        </div>

        <div className="text-center text-xs text-text-secondary">
          Belum memiliki profil?{' '}
          <Link href="/register" className="text-primary hover:text-primary-hover font-semibold">
            Inisialisasi Profil Baru
          </Link>
        </div>
      </Card>
    </div>
  );
}
