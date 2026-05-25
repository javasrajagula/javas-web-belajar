'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/user-store';
import { Search, Bell, Command, Settings, HelpCircle, Check, Book, Wifi, WifiOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export const TopBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useUserStore();
  
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  // Track online/offline status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(window.navigator.onLine);
      
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Listen to Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getPageTitle = () => {
    if (pathname.includes('/brain')) return 'Otak Kedua';
    if (pathname.includes('/tutor')) return 'Tutor AI';
    if (pathname.includes('/rpg')) return 'RPG Belajar';
    if (pathname.includes('/twin')) return 'Kembaran Digital';
    if (pathname.includes('/galaxy')) return 'Galaksi Pengetahuan';
    if (pathname.includes('/planner')) return 'Perencana Pintar';
    if (pathname.includes('/exams')) return 'Mesin Ujian';
    return 'Dasbor';
  };

  const commandItems = [
    { title: 'Dasbor Utama', route: '/dashboard', desc: 'Ringkasan performa belajar Anda' },
    { title: 'Unggah Bahan Belajar', route: '/brain', desc: 'Proses berkas PDF, teks, atau catatan kuliah baru' },
    { title: 'Konsultasi Tutor AI', route: '/tutor', desc: 'Ajukan pertanyaan pada Claude' },
    { title: 'Pohon Kemampuan RPG', route: '/rpg', desc: 'Kelola level atribut & hadiah harian' },
    { title: 'Kembaran Digital', route: '/twin', desc: 'Analisis statistik penyerapan materi' },
    { title: 'Buka Galaksi Pengetahuan', route: '/galaxy', desc: 'Visualisasikan materi dalam peta node' },
  ];

  const filteredCommands = commandItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="flex items-center justify-between h-16 border-b border-border bg-bg-secondary px-6 select-none sticky top-0 z-20">
        {/* Left Side: Route Title */}
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-text-primary tracking-tight">
            {getPageTitle()}
          </h2>
        </div>

        {/* Middle: Command Bar Input */}
        <div className="hidden sm:flex items-center max-w-md w-full relative">
          <div 
            onClick={() => setShowSearchModal(true)}
            className="w-full flex items-center justify-between h-9 px-3 rounded-md bg-bg-tertiary hover:bg-bg-hover text-text-tertiary hover:text-text-secondary cursor-pointer border border-border transition-colors duration-150"
          >
            <div className="flex items-center gap-2">
              <Search size={14} />
              <span className="text-xs">Cari atau jalankan perintah...</span>
            </div>
            <div className="flex items-center gap-1 bg-bg-secondary px-1.5 py-0.5 rounded border border-border font-mono text-[9px]">
              <Command size={8} /> K
            </div>
          </div>
        </div>

        {/* Right Side: Quick Stats & Avatar */}
        <div className="flex items-center gap-4">
          {/* Level Progress */}
          <div className="hidden lg:flex flex-col w-36">
            <div className="flex justify-between items-center text-[10px] font-mono text-text-secondary mb-1">
              <span>TINGKAT {profile.level}</span>
              <span>{profile.xp} / {profile.level * 500} XP</span>
            </div>
            <Progress value={(profile.xp / (profile.level * 500)) * 100} color="accent" className="h-1" />
          </div>

          {/* Online/Offline Status Indicator */}
          <Badge 
            variant={isOnline ? 'success' : 'danger'} 
            className="text-[9.5px] font-mono font-bold flex items-center gap-1"
          >
            {isOnline ? <Wifi size={10} className="text-success" /> : <WifiOff size={10} className="text-danger" />}
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Badge>

          {/* Icons */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setShowSearchModal(true)}
              className="sm:hidden text-text-secondary hover:text-text-primary p-2 hover:bg-bg-tertiary rounded-md transition-colors"
            >
              <Search size={16} />
            </button>
            <button className="text-text-secondary hover:text-text-primary p-2 hover:bg-bg-tertiary rounded-md transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            </button>
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
          <div className="bg-bg-secondary border border-border rounded-lg max-w-xl w-full shadow-xl overflow-hidden animate-scale-in">
            {/* Search Input */}
            <div className="flex items-center h-12 px-4 border-b border-border">
              <Search size={16} className="text-text-tertiary mr-3" />
              <input
                type="text"
                placeholder="Cari fitur, dasbor, aksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-sm text-text-primary placeholder-text-tertiary focus:outline-none"
              />
              <button 
                onClick={() => setShowSearchModal(false)}
                className="text-[10px] bg-bg-tertiary hover:bg-bg-hover text-text-secondary px-2 py-1 rounded border border-border font-mono cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto py-2">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd) => (
                  <div
                    key={cmd.route}
                    onClick={() => {
                      router.push(cmd.route);
                      setShowSearchModal(false);
                    }}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-bg-tertiary cursor-pointer group transition-colors duration-150"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors duration-150">
                        {cmd.title}
                      </h4>
                      <p className="text-xs text-text-tertiary mt-0.5">{cmd.desc}</p>
                    </div>
                    <Book size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-text-tertiary text-xs">
                  Perintah tidak ditemukan.
                </div>
              )}
            </div>
          </div>
          {/* Overlay click to close */}
          <div className="absolute inset-0 -z-10" onClick={() => setShowSearchModal(false)} />
        </div>
      )}
    </>
  );
};
