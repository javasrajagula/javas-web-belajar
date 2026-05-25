import type { Metadata } from 'next';
import './globals.css';

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
      </head>
      <body className="antialiased selection:bg-accent/30 selection:text-text-primary bg-bg-primary text-text-primary min-h-screen">
        {children}
      </body>
    </html>
  );
}
