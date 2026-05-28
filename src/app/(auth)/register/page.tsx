'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { registerUser } from '@/lib/actions/user';
import { signIn } from 'next-auth/react';
import { useUserStore } from '@/stores/user-store';

export default function RegisterPage() {
  const router = useRouter();
  const { loadFromDb } = useUserStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setIsLoading(true);
    setError('');

    try {
      // 1. Create the user in PostgreSQL
      await registerUser({ name, email, password });

      // 2. Perform credentials login immediately
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (res?.error) {
        setError('Pendaftaran berhasil, tetapi gagal masuk otomatis. Silakan masuk secara manual.');
        setIsLoading(false);
      } else {
        // 3. Load from DB to populate Zustand store
        await loadFromDb(email);
        setIsLoading(false);
        router.push('/onboarding');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal membuat profil baru. Alamat email mungkin sudah terdaftar.');
      setIsLoading(false);
    }
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
          <h2 className="text-xl font-bold tracking-tight">Daftarkan Akun</h2>
          <p className="text-xs text-text-secondary mt-1">Konfigurasikan sistem operasi pembelajaran personal Anda</p>
        </div>

        {error && (
          <div className="p-3 bg-danger-subtle/10 border border-danger/20 text-danger rounded text-[11px] leading-relaxed">
            {error}
          </div>
        )}

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
                className="w-full h-10 pl-10 pr-4 bg-bg-tertiary border border-border rounded text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
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
                placeholder="alex@academy.os"
                className="w-full h-10 pl-10 pr-4 bg-bg-tertiary border border-border rounded text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
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
                className="w-full h-10 pl-10 pr-4 bg-bg-tertiary border border-border rounded text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-11 mt-4">
            {isLoading ? 'Menyiapkan Workspace Sandbox...' : 'Mulai Konfigurasi'}
          </Button>
        </form>

        <div className="text-center text-xs text-text-secondary">
          Sudah terdaftar?{' '}
          <Link href="/login" className="text-primary hover:text-primary-hover font-semibold">
            Masuk di sini
          </Link>
        </div>
      </Card>
    </div>
  );
}
