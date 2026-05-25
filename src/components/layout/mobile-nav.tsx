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
    { name: 'Subjek', path: '/subjects', icon: BookOpen },
    { name: 'Otak', path: '/brain', icon: Brain },
    { name: 'Tutor', path: '/tutor', icon: MessageSquare },
    { name: 'Profil', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-secondary/95 border-t border-border backdrop-blur-md z-40 mobile-nav-safe flex justify-around items-center h-16 px-2 select-none">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.path);
        return (
          <Link
            key={item.path}
            href={item.path}
            className={clsx(
              'flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200',
              isActive ? 'text-accent' : 'text-text-tertiary active:text-text-primary'
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
