'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Brain, 
  MessageSquare, 
  BookOpen,
  User
} from 'lucide-react';
import { clsx } from 'clsx';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Beranda', path: '/dashboard', icon: Home },
    { name: 'Materi', path: '/materi', icon: BookOpen },
    { name: 'Otak', path: '/brain', icon: Brain },
    { name: 'Tutor', path: '/tutor', icon: MessageSquare },
    { name: 'Profil', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-secondary border-t-[4px] border-border z-40 mobile-nav-safe flex justify-around items-center h-16 px-2 select-none shadow-sm">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.path);
        return (
          <Link
            key={item.path}
            href={item.path}
            className={clsx(
              'flex flex-col items-center justify-center flex-1 h-12 py-2 border-[2px] transition-all duration-150',
              isActive ? 'text-black bg-accent border-border shadow-xs' : 'text-text-tertiary border-transparent active:text-text-primary'
            )}
          >
            <item.icon size={20} className={clsx('transition-transform duration-200', isActive && 'scale-110')} />
            <span className="text-[9px] mt-1 font-mono tracking-tighter truncate max-w-full px-0.5">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
