'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/stores/user-store';
import { useCurriculumStore } from '@/stores/curriculum-store';
import { getSubjectsByPathway } from '@/lib/curriculum-data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  CheckCircle,
  FileText,
  Bookmark,
  Award
} from 'lucide-react';

export default function SubjectsPage() {
  const { profile } = useUserStore();
  const { completedLessons, portfolios, pklLogs } = useCurriculumStore();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Load matching subjects from content layer
  const subjects = getSubjectsByPathway(profile.schoolType, profile.grade);

  const toggleSubject = (id: string) => {
    setExpandedSubject(expandedSubject === id ? null : id);
  };

  // Helper to calculate progress
  const getSubjectProgress = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return 0;
    
    let totalLessons = 0;
    let completedCount = 0;
    
    subject.modules.forEach(mod => {
      mod.lessons.forEach(les => {
        totalLessons++;
        if (completedLessons[les.id]) {
          completedCount++;
        }
      });
    });

    if (totalLessons === 0) return 0;
    return Math.round((completedCount / totalLessons) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-bg-secondary border border-border p-6 rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary" className="text-[10px] font-mono tracking-wider uppercase bg-primary/10 text-primary border-primary/20">
              {profile.schoolType === 'sma' ? `SMA - FASE ${profile.grade === 10 ? 'E' : 'F'}` : `SMK KEJURUAN - FASE ${profile.grade === 10 ? 'E' : 'F'}`}
            </Badge>
            <Badge variant="secondary" className="text-[10px] font-mono tracking-wider uppercase bg-secondary/10 text-secondary border-secondary/20">
              KELAS {profile.grade}
            </Badge>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary mt-2">
            Peta Kurikulum Nasional Terintegrasi
          </h1>
          <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
            Struktur materi ini disesuaikan sepenuhnya dengan **Kurikulum Merdeka terbaru** untuk menyajikan proses *Deep Learning* secara terpadu.
          </p>
        </div>
      </div>

      {/* Main Subjects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Subjects List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-mono font-bold text-text-secondary uppercase tracking-widest pl-1">Daftar Mata Pelajaran</h3>
          
          {subjects.length > 0 ? (
            subjects.map((sub) => {
              const progress = getSubjectProgress(sub.id);
              const isExpanded = expandedSubject === sub.id;

              return (
                <Card key={sub.id} className="p-0 border border-border overflow-hidden transition-all duration-200">
                  {/* Collapsible Header */}
                  <div 
                    onClick={() => toggleSubject(sub.id)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-bg-tertiary/20 transition-colors"
                  >
                    <div className="space-y-2 flex-1 pr-4 min-w-0">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-primary flex-shrink-0" />
                        <h4 className="text-sm font-bold text-text-primary truncate">{sub.title}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[150px]">
                          <Progress value={progress} color="accent" className="h-1" />
                        </div>
                        <span className="text-[10px] font-mono text-text-secondary">{progress}% penguasaan</span>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? <ChevronDown size={18} className="text-text-tertiary" /> : <ChevronRight size={18} className="text-text-tertiary" />}
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="border-t border-border bg-bg-tertiary/10 p-5 space-y-4 animate-fade-in">
                      {/* CP Statement */}
                      <div className="p-3.5 rounded bg-bg-secondary border border-border/60 text-[11px] leading-relaxed text-text-secondary space-y-1">
                        <span className="font-mono font-bold text-text-primary text-[10px] uppercase flex items-center gap-1">
                          <Sparkles size={11} className="text-secondary" /> Capaian Pembelajaran (CP)
                        </span>
                        <p>{sub.cpStatement}</p>
                      </div>

                      {/* Modules list */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-mono font-bold text-text-tertiary uppercase tracking-wider block">Daftar Modul Belajar</span>
                        {sub.modules.map((mod) => (
                          <div key={mod.id} className="space-y-1.5 pl-2 border-l-2 border-border">
                            <span className="text-[10px] font-bold text-text-secondary font-mono">{mod.title}</span>
                            <div className="space-y-1">
                              {mod.lessons.map((les) => {
                                const isCompleted = completedLessons[les.id];
                                return (
                                  <Link href={`/lessons/${les.id}`} key={les.id} className="flex items-center justify-between p-2.5 rounded bg-bg-secondary/40 border border-border/40 hover:border-primary/40 hover:bg-bg-tertiary/40 group transition-all duration-150">
                                    <div className="flex items-center gap-2 min-w-0">
                                      {isCompleted ? (
                                        <CheckCircle size={12} className="text-success flex-shrink-0" />
                                      ) : (
                                        <div className="w-3 h-3 rounded-full border border-text-tertiary flex-shrink-0 group-hover:border-primary transition-colors" />
                                      )}
                                      <span className="text-xs text-text-primary truncate font-medium group-hover:text-primary transition-colors">{les.title}</span>
                                    </div>
                                    <ChevronRight size={12} className="text-text-tertiary group-hover:text-primary transition-colors" />
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12 text-xs text-text-secondary border border-dashed border-border rounded-lg">
              Tidak ada mata pelajaran yang dijadwalkan untuk tingkat Anda saat ini.
            </div>
          )}
        </div>

        {/* Right: Path Info & Highlights */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-text-secondary uppercase tracking-widest pl-1">Status Kesiapan</h3>
          
          {/* Diagnostic Info Card */}
          <Card className="space-y-4">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Award size={14} className="text-accent" /> Evaluasi Kompetensi
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">Pelajaran Selesai:</span>
                <span className="font-mono font-bold text-text-primary">
                  {Object.keys(completedLessons).length} Sesi
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">Proyek Portofolio (SMK):</span>
                <span className="font-mono font-bold text-text-primary">
                  {portfolios.length} Proyek
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">Log Magang / PKL (SMK):</span>
                <span className="font-mono font-bold text-text-primary">
                  {pklLogs.length} Jurnal
                </span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border/40">
              <Link href="/analytics">
                <Button variant="secondary" size="sm" className="w-full h-8 text-[11px] flex items-center justify-center gap-1">
                  <FileText size={11} /> Buka Analisis Detail
                </Button>
              </Link>
            </div>
          </Card>

          {/* Curriculum Guidelines */}
          <Card className="space-y-3.5 bg-bg-secondary/40">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Bookmark size={14} className="text-primary" /> Profil Pelajar Pancasila
            </h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Platform ini dirancang untuk mengembangkan Profil Pelajar Pancasila: **Bernalar Kritis**, **Mandiri**, dan **Kreatif** melalui materi deep learning.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
