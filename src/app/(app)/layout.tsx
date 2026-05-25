'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { PageTransition } from '@/components/layout/page-transition';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <Sidebar />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 md:pb-0 h-screen relative">
        <TopBar />
        <main className="flex-grow p-4 md:p-6 flex flex-col">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Mobile Nav - Mobile Only */}
      <MobileNav />
    </div>
  );
}
