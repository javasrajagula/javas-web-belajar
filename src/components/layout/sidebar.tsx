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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  BookOpen,
  User,
  Settings
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile } = useUserStore();

  const navItems = [
    { name: 'Dasbor', path: '/dashboard', icon: Home },
    { name: 'Mata Pelajaran', path: '/subjects', icon: BookOpen },
    { name: 'Otak Kedua', path: '/brain', icon: Brain },
    { name: 'Tutor AI', path: '/tutor', icon: MessageSquare },
    { name: 'RPG Belajar', path: '/rpg', icon: Sword },
    { name: 'Analisis Belajar', path: '/analytics', icon: Activity },
    { name: 'Galaksi Pengetahuan', path: '/galaxy', icon: Globe },
    { name: 'Perencana Pintar', path: '/planner', icon: Calendar },
    { name: 'Mesin Ujian', path: '/exams', icon: FileText },
    { name: 'Profil & Portofolio', path: '/profile', icon: User },
    { name: 'Pengaturan', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={clsx(
        'hidden md:flex flex-col bg-bg-secondary border-r border-border h-screen sticky top-0 transition-all duration-300 z-30 select-none',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-border">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-accent text-white font-mono font-bold text-lg">
              Ω
            </div>
            <span className="font-bold text-text-primary text-base tracking-wide group-hover:text-accent transition-colors duration-200">
              ACADEMY OS
            </span>
          </Link>
        )}
        {isCollapsed && (
          <div className="mx-auto flex items-center justify-center w-8 h-8 rounded-md bg-accent text-white font-mono font-bold text-lg">
            Ω
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-text-tertiary hover:text-text-primary transition-colors p-1 hover:bg-bg-tertiary rounded cursor-pointer hidden md:block"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Profile summary */}
      <div className={clsx('p-4 border-b border-border flex items-center gap-3', isCollapsed && 'justify-center')}>
        <div className="relative flex-shrink-0">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-8 h-8 rounded-full border border-border"
          />
          <div className="absolute -bottom-1 -right-1 bg-accent text-[9px] text-white font-mono font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-bg-secondary">
            {profile.level}
          </div>
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-text-primary truncate leading-tight">
              {profile.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Zap size={12} className="text-warning fill-warning" />
              <span className="text-xs text-text-secondary font-mono">{profile.streak} hari beruntun</span>
            </div>
          </div>
        )}
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={clsx(
                'flex items-center gap-3 px-3 h-10 rounded-md transition-all duration-200 group relative',
                isActive
                  ? 'bg-accent/10 text-accent font-semibold border-l-2 border-accent pl-2.5'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
              )}
            >
              <item.icon
                size={18}
                className={clsx(
                  'flex-shrink-0 transition-transform duration-200 group-hover:scale-105',
                  isActive ? 'text-accent' : 'text-text-tertiary group-hover:text-text-primary'
                )}
              />
              {!isCollapsed && <span className="text-sm">{item.name}</span>}
              {isCollapsed && (
                <div className="absolute left-14 bg-bg-primary text-text-primary text-xs px-2.5 py-1.5 rounded border border-border shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none z-50 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className={clsx('p-3 border-t border-border flex flex-col gap-2', isCollapsed && 'items-center')}>
        <Link
          href="/login"
          className={clsx(
            'flex items-center gap-3 px-3 h-10 rounded-md text-text-tertiary hover:text-danger hover:bg-danger-subtle/10 transition-all duration-200 group relative w-full',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Keluar Sistem</span>}
          {isCollapsed && (
            <div className="absolute left-14 bg-bg-primary text-danger text-xs px-2.5 py-1.5 rounded border border-danger/20 shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none z-50 whitespace-nowrap">
              Keluar Sistem
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
};
