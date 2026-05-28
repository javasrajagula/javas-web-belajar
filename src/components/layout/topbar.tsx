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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayProfile = mounted ? profile : {
    level: 4,
    xp: 1250,
  };
  
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
    if (pathname.includes('/materi')) return 'Materi';
    if (pathname.includes('/video-panduan')) return 'Video Panduan';
    if (pathname.includes('/buku-modul')) return 'Buku Modul';
    if (pathname.includes('/bank-soal')) return 'Bank Soal';
    if (pathname.includes('/rpg')) return 'RPG Belajar';
    if (pathname.includes('/twin')) return 'Kembaran Digital';
    if (pathname.includes('/galaxy')) return 'Galaksi Pengetahuan';
    if (pathname.includes('/planner')) return 'Perencana Pintar';
    if (pathname.includes('/ujian') || pathname.includes('/exams')) return 'Mesin Ujian';
    return 'Dasbor';
  };

  const commandItems = [
    { title: 'Dasbor Utama', route: '/dashboard', desc: 'Ringkasan performa belajar Anda' },
    { title: 'Buka Materi', route: '/materi', desc: 'Daftar dan detail materi dari database' },
    { title: 'Video Panduan', route: '/video-panduan', desc: 'Panduan praktik video atau instruksi tertulis' },
    { title: 'Buku Modul', route: '/buku-modul', desc: 'Modul belajar dan status PDF resmi' },
    { title: 'Bank Soal', route: '/bank-soal', desc: 'Latihan soal dan pembahasan' },
    { title: 'Mulai Ujian', route: '/ujian/mulai', desc: 'Mode ujian dengan timer dan hasil' },
    { title: 'Unggah Bahan Belajar', route: '/brain', desc: 'Proses berkas PDF, teks, atau catatan kuliah baru' },
    { title: 'Konsultasi Tutor AI', route: '/tutor', desc: 'Ajukan pertanyaan lewat endpoint AI server-side' },
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
      <header className="flex items-center justify-between h-16 md:h-20 border-b-[3px] md:border-b-[4px] border-border bg-bg-primary px-3 sm:px-4 md:px-6 select-none sticky top-0 z-20 shadow-sm gap-3">
        {/* Left Side: Route Title */}
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm sm:text-base md:text-lg font-black text-text-primary tracking-tight uppercase truncate">
            <span className="hidden sm:inline">Academy OS / </span>{getPageTitle()}
          </h2>
        </div>

        {/* Middle: Command Bar Input */}
        <div className="hidden sm:flex items-center max-w-md w-full relative">
          <div 
            onClick={() => setShowSearchModal(true)}
            className="w-full flex items-center justify-between h-11 px-3 rounded-none bg-white hover:bg-bg-hover text-text-tertiary hover:text-text-secondary cursor-pointer border-[3px] border-border shadow-xs transition-all duration-150"
          >
            <div className="flex items-center gap-2">
              <Search size={14} />
              <span className="text-xs">Cari atau jalankan perintah...</span>
            </div>
            <div className="flex items-center gap-1 bg-accent px-1.5 py-0.5 rounded-none border-[2px] border-border font-mono text-[9px] text-black">
              <Command size={8} /> K
            </div>
          </div>
        </div>

        {/* Right Side: Quick Stats & Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          {/* Level Progress */}
          <div className="hidden lg:flex flex-col w-36">
            <div className="flex justify-between items-center text-[10px] font-mono text-text-secondary mb-1">
              <span>TINGKAT {displayProfile.level}</span>
              <span>{displayProfile.xp} / {displayProfile.level * 500} XP</span>
            </div>
            <Progress value={(displayProfile.xp / (displayProfile.level * 500)) * 100} color="accent" className="h-1" />
          </div>

          {/* Online/Offline Status Indicator */}
          <Badge
            variant={isOnline ? 'success' : 'danger'}
            className="hidden sm:flex text-[9.5px] font-mono font-black items-center gap-1 border-[2px] border-border shadow-xs rounded-none bg-secondary-subtle text-text-primary"
          >
            {isOnline ? <Wifi size={10} className="text-success" /> : <WifiOff size={10} className="text-danger" />}
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Badge>

          {/* Icons */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setShowSearchModal(true)}
              className="sm:hidden text-text-primary bg-white border-[2px] border-border p-2 hover:bg-accent transition-colors shadow-xs"
            >
              <Search size={16} />
            </button>
            <button className="hidden sm:block text-text-primary bg-white border-[2px] border-border p-2 hover:bg-accent transition-colors relative shadow-xs">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-none animate-pulse" />
            </button>
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4">
          <div className="bg-bg-secondary border-[4px] border-border rounded-none max-w-xl w-full shadow-xl overflow-hidden animate-scale-in">
            {/* Search Input */}
            <div className="flex items-center h-14 px-4 border-b-[3px] border-border bg-accent">
              <Search size={16} className="text-text-tertiary mr-3" />
              <input
                type="text"
                placeholder="Cari fitur, dasbor, aksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-sm text-text-primary placeholder-text-secondary focus:outline-none font-bold"
              />
              <button 
                onClick={() => setShowSearchModal(false)}
                className="text-[10px] bg-white hover:bg-bg-hover text-text-primary px-2 py-1 rounded-none border-[2px] border-border font-mono cursor-pointer shadow-xs"
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
                    className="flex items-center justify-between px-4 py-3 hover:bg-secondary-subtle cursor-pointer group transition-colors duration-150 border-b border-border/20"
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
