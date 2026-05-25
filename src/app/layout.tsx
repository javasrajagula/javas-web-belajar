import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'Academy OS Ω — Personal Learning Operating System',
  description: 'An adaptive learning environment for students to organize notes, practice quizzes, tutor with Claude AI, track Study RPG levels, and plan milestones.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Geist+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(
                function(reg) { console.log('PWA ServiceWorker registered successfully:', reg.scope); },
                function(err) { console.log('PWA ServiceWorker registration failed:', err); }
              );
            });
          }
        ` }} />
      </head>
      <body className="antialiased selection:bg-accent/30 selection:text-text-primary bg-bg-primary text-text-primary min-h-screen">
        <SessionProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </SessionProvider>
      </body>
    </html>
  );
}

