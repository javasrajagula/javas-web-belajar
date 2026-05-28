'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';
import { 
  Home, 
  Brain, 
  MessageSquare, 
  Sword, 
  Activity, 
  Globe, 
  Calendar, 
  FileText,
  PlayCircle,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  BookOpen,
  User,
  Settings,
  Users,
  BookMarked
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '@/components/ui/badge';
import { signOut } from 'next-auth/react';
import { getJurusanByKode, resolveJurusanKode } from '@/lib/data/jurusan';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile } = useUserStore();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayProfile = mounted ? profile : {
    name: 'Alex Mercer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    level: 4,
    streak: 5,
    selectedPathway: 'Umum',
    grade: 10,
    role: 'student',
  };

  const activeKode = resolveJurusanKode(displayProfile.selectedPathway);
  const majorInfo = getJurusanByKode(activeKode) || {
    nama: activeKode,
    warna: '#4F46E5',
    icon: activeKode,
    kode: activeKode,
  };

  // Nav Groups configuration
  const navGroups = [
    {
      label: 'BERANDA',
      items: [
        { name: 'Dasbor', path: '/dashboard', icon: Home },
        ...(displayProfile.role === 'teacher' || displayProfile.role === 'admin' 
          ? [{ name: 'Panel Guru', path: '/teacher', icon: Users }] 
          : []
        ),
      ]
    },
    {
      label: 'BELAJAR',
      items: [
        { name: 'Materi', path: '/materi', icon: BookOpen },
        { name: 'Video Panduan', path: '/video-panduan', icon: PlayCircle },
        { name: 'Buku Modul', path: '/buku-modul', icon: FileText },
        { name: 'Planner Belajar', path: '/planner', icon: Calendar },
      ]
    },
    {
      label: 'LATIHAN',
      items: [
        { name: 'Bank Soal', path: '/bank-soal', icon: BookMarked },
        { name: 'Mulai Ujian', path: '/ujian/mulai', icon: ClipboardList },
        { name: 'RPG Belajar', path: '/rpg', icon: Sword },
      ]
    },
    {
      label: 'TOOLS',
      items: [
        { name: 'Otak Kedua', path: '/brain', icon: Brain },
        { name: 'Tutor AI', path: '/tutor', icon: MessageSquare },
        { name: 'Galaksi Ilmu', path: '/galaxy', icon: Globe },
      ]
    },
    {
      label: 'STATISTIK',
      items: [
        { name: 'Analisis Belajar', path: '/analytics', icon: Activity },
        { name: 'Profil & Portofolio', path: '/profile', icon: User },
        { name: 'Pengaturan', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside
      className={clsx(
        'hidden md:flex flex-col bg-bg-secondary border-r-[4px] border-border h-screen sticky top-0 transition-all duration-300 z-30 select-none shadow-sm',
        isCollapsed ? 'w-16' : 'w-[280px]',
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-20 border-b-[3px] border-border bg-bg-primary">
        {!isCollapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-11 h-11 rounded-none bg-accent text-black border-[3px] border-border font-mono font-black text-base shadow-xs">
              Ω
            </div>
            <div className="flex flex-col">
              <span className="font-black text-text-primary text-sm tracking-tight group-hover:text-primary transition-colors uppercase">
                Academy OS
              </span>
              <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider font-bold">
                SMK Edition
              </span>
            </div>
          </Link>
        ) : (
          <div className="mx-auto flex items-center justify-center w-10 h-10 rounded-none bg-accent text-black border-[3px] border-border font-mono font-black text-sm shadow-xs">
            Ω
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-text-primary bg-white border-[2px] border-border shadow-xs transition-all p-1.5 hover:bg-accent cursor-pointer hidden md:block active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* User summary section */}
      <div className={clsx('p-4 border-b-[3px] border-border flex flex-col gap-3 bg-white', isCollapsed && 'items-center justify-center')}>
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-shrink-0">
            <img
              src={displayProfile.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=belajarku'}
              alt={displayProfile.name}
              className="w-12 h-12 rounded-none border-[3px] border-border bg-accent object-cover shadow-xs"
            />
            <div className="absolute -bottom-1 -right-1 bg-primary text-[9px] text-white font-mono font-bold w-5 h-5 rounded-none flex items-center justify-center border-[2px] border-border">
              {displayProfile.level}
            </div>
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-text-primary truncate leading-tight uppercase">
                {displayProfile.name}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Zap size={11} className="text-warning fill-warning" />
                <span className="text-[10px] text-text-secondary font-mono font-semibold">{displayProfile.streak} hari beruntun</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Major & Grade badges */}
        {!isCollapsed && (
          <div className="flex flex-wrap gap-1.5 mt-1 border-t border-border/20 pt-2.5">
            <span 
               className="px-2 py-0.5 text-[9px] font-bold rounded-none border-[2px] uppercase text-white font-mono"
              style={{ 
                backgroundColor: `${majorInfo.warna}15`, 
                borderColor: `${majorInfo.warna}30`, 
                color: majorInfo.warna 
              }}
            >
              {majorInfo.icon} {activeKode}
            </span>
            <Badge variant="secondary" className="text-[9px] px-2 py-0.5 bg-bg-tertiary border-border text-text-secondary font-mono">
              Kelas {displayProfile.grade === 10 ? 'X' : displayProfile.grade === 11 ? 'XI' : 'XII'}
            </Badge>
          </div>
        )}
      </div>

      {/* Grouped Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto no-scrollbar bg-bg-primary">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-[9px] font-bold text-text-tertiary tracking-widest block uppercase mb-1">
                {group.label}
              </span>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={clsx(
                       'flex items-center gap-3 px-3 h-10 rounded-none border-[2px] transition-all duration-150 group relative',
                       isActive
                        ? 'bg-accent text-black font-black border-border shadow-xs'
                        : 'bg-white text-text-secondary border-transparent hover:text-text-primary hover:bg-secondary-subtle hover:border-border hover:shadow-xs'
                    )}
                  >
                    <item.icon
                      size={16}
                      className={clsx(
                        'flex-shrink-0 transition-transform duration-200 group-hover:scale-105',
                        isActive ? 'text-primary' : 'text-text-tertiary group-hover:text-text-primary'
                      )}
                    />
                    {!isCollapsed && <span className="text-xs uppercase font-extrabold">{item.name}</span>}
                    {isCollapsed && (
                      <div className="absolute left-14 bg-bg-primary text-text-primary text-xs px-2.5 py-1.5 rounded border border-border shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none z-50 whitespace-nowrap">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className={clsx('p-3 border-t-[3px] border-border flex flex-col gap-2 bg-white', isCollapsed && 'items-center')}>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={clsx(
            'flex items-center gap-3 px-3 h-10 rounded-none border-[2px] border-transparent text-text-tertiary hover:text-danger hover:bg-danger-subtle/10 hover:border-danger transition-all duration-150 group relative w-full text-left cursor-pointer',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!isCollapsed && <span className="text-xs">Keluar Sistem</span>}
          {isCollapsed && (
            <div className="absolute left-14 bg-bg-primary text-danger text-xs px-2.5 py-1.5 rounded border border-danger/20 shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none z-50 whitespace-nowrap">
              Keluar Sistem
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
