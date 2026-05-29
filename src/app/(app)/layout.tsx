'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { PageTransition } from '@/components/layout/page-transition';
import { useUserStore } from '@/stores/user-store';
import { useCurriculumStore } from '@/stores/curriculum-store';
import { useSession } from 'next-auth/react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loadFromDb: loadUser } = useUserStore();
  const { loadFromDb: loadCurriculum } = useCurriculumStore();
  const { data: session, status } = useSession();
  const email = session?.user?.email || '';

  React.useEffect(() => {
    if (status !== 'authenticated' || !email) return;
    
    const initDb = async () => {
      try {
        // Load latest state from PostgreSQL database
        await loadUser(email);
        await loadCurriculum(email);
      } catch (err) {
        console.error('Failed to sync/load data from database:', err);
      }
    };
    
    initDb();
  }, [email, status, loadUser, loadCurriculum]);

  return (
    <div className="contrast-safe flex min-h-dvh bg-bg-primary text-text-primary overflow-x-hidden md:overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <Sidebar />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-visible md:overflow-y-auto pb-20 md:pb-0 min-h-dvh md:h-screen relative bg-bg-tertiary">
        <TopBar />
        <main className="flex-grow p-3 sm:p-4 md:p-6 flex flex-col min-w-0 min-h-0">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Mobile Nav - Mobile Only */}
      <MobileNav />
    </div>
  );
}
