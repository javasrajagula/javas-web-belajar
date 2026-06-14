import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'sonner';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Web Belajar — Platform Belajar Online',
  description: 'Platform belajar online bertenaga AI untuk siswa SMA & SMK Indonesia, selaras dengan Kurikulum Merdeka.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700;800;900&family=Geist+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased selection:bg-accent/30 selection:text-text-primary bg-bg-primary text-text-primary min-h-screen">
        <SessionProvider>
          {children}
          <Toaster richColors position="top-right" />
          <Analytics />
          <SpeedInsights />
        </SessionProvider>
        {/* Commented out SW for testing client load stability
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(reg) { console.log('PWA ServiceWorker registered successfully:', reg.scope); },
                  function(err) { console.log('PWA ServiceWorker registration failed:', err); }
                );
              });
            }
          `}
        </Script>
        */}
      </body>
    </html>
  );
}
