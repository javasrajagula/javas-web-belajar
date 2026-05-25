'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { updateProfile } = useUserStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setIsLoading(true);
    setTimeout(() => {
      updateProfile({
        name,
        email,
        xp: 0,
        level: 1,
        studyTimeToday: 0
      });
      setIsLoading(false);
      router.push('/onboarding');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-center items-center px-4 relative select-none">
      <Link href="/" className="absolute top-6 left-6 text-text-secondary hover:text-text-primary flex items-center gap-1.5 text-xs font-mono">
        <ArrowLeft size={14} /> Kembali
      </Link>

      <Card className="max-w-md w-full p-8 border border-border bg-bg-secondary shadow-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded bg-accent text-white font-mono font-bold text-xl mb-3">
            Ω
          </div>
          <h2 className="text-xl font-bold tracking-tight">Daftarkan Akun</h2>
          <p className="text-xs text-text-secondary mt-1">Konfigurasikan sistem operasi pembelajaran personal Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-text-tertiary" size={16} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full h-10 pl-10 pr-4 bg-bg-tertiary border border-border rounded text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-text-tertiary" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full h-10 pl-10 pr-4 bg-bg-tertiary border border-border rounded text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Kata Sandi Baru</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-text-tertiary" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-10 pr-4 bg-bg-tertiary border border-border rounded text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-11 mt-4">
            {isLoading ? 'Menyiapkan Workspace Sandbox...' : 'Mulai Konfigurasi'}
          </Button>
        </form>

        <div className="text-center mt-6 text-xs text-text-secondary">
          Sudah terdaftar?{' '}
          <Link href="/login" className="text-accent hover:text-accent-hover font-semibold">
            Masuk di sini
          </Link>
        </div>
      </Card>
    </div>
  );
}
