'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Download, FileText, RefreshCw, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUserStore } from '@/stores/user-store';
import { resolveJurusanKode } from '@/lib/data/jurusan';
import { GENERAL_LEARNING_TRACKS } from '@/lib/data/learning-content';

type ModulMateri = {
  id: string;
  judul: string;
  konten: string;
  bab: {
    nomor: number;
    judul: string;
    mataPelajaran: {
      nama: string;
      kelas: number;
      jurusan: { kode: string; nama: string };
    };
  };
};

function parseModul(konten: string) {
  try {
    const parsed = JSON.parse(konten);
    return {
      title: parsed.title || '',
      description: parsed.description || '',
      pdfUrl: parsed.pdfUrl || '',
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      chapters: Array.isArray(parsed.chapters) ? parsed.chapters : [],
      objectives: Array.isArray(parsed.objectives) ? parsed.objectives : [],
      evaluation: Array.isArray(parsed.evaluation) ? parsed.evaluation : [],
      references: Array.isArray(parsed.references) ? parsed.references : [],
      workedExample: parsed.workedExample || null,
      content: parsed.content || '',
      unavailableReason: parsed.unavailableReason || '',
    };
  } catch {
    return {
      title: '',
      description: '',
      pdfUrl: konten.startsWith('http') ? konten : '',
      topics: [],
      chapters: [],
      objectives: [],
      evaluation: [],
      references: [],
      workedExample: null,
      content: '',
      unavailableReason: '',
    };
  }
}

export default function BukuModulPage() {
  const { profile } = useUserStore();
  const jurusanKode = resolveJurusanKode(profile.selectedPathway);
  const [track, setTrack] = useState('profil');
  const [items, setItems] = useState<ModulMateri[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const effectiveTrack = track === 'profil' ? jurusanKode : track;
  const trackLabel = track === 'profil'
    ? `SMK ${jurusanKode}`
    : GENERAL_LEARNING_TRACKS.find((item) => item.kode === track)?.nama || track;

  useEffect(() => {
    async function loadModules() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ jurusan: effectiveTrack, tipe: 'pdf' });
        if (query.trim()) params.set('q', query.trim());
        const res = await fetch(`/api/materi?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal memuat buku modul');
        setItems(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat buku modul');
      } finally {
        setLoading(false);
      }
    }
    const timeout = window.setTimeout(loadModules, 180);
    return () => window.clearTimeout(timeout);
  }, [effectiveTrack, query]);

  return (
    <div className="contrast-safe space-y-6 text-text-primary">
      <section className="border-[3px] border-border bg-white p-5 shadow-sm">
        <Badge className="bg-accent text-black border-border">Modul {trackLabel}</Badge>
        <h1 className="mt-3 text-2xl font-black uppercase tracking-tight text-text-primary">Buku Modul</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-text-secondary">
          Daftar modul belajar dari materi bertipe PDF/modul. Tombol download hanya aktif jika URL PDF asli tersedia.
        </p>
        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari modul, bab, atau mapel..."
            className="h-10 w-full border-[2px] border-border bg-bg-primary pl-9 pr-3 text-xs font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <select
          value={track}
          onChange={(event) => setTrack(event.target.value)}
          className="mt-3 h-10 w-full max-w-md appearance-none border-[2px] border-border bg-bg-primary px-3 text-xs font-black text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="profil">SMK Profil Saya</option>
          {GENERAL_LEARNING_TRACKS.map((item) => (
            <option key={item.kode} value={item.kode}>{item.nama}</option>
          ))}
        </select>
      </section>

      {loading ? (
        <Card className="flex items-center gap-3 bg-white">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-bold text-text-secondary">Memuat buku modul...</span>
        </Card>
      ) : error ? (
        <Card className="bg-danger-subtle text-danger">{error}</Card>
      ) : items.length === 0 ? (
        <Card className="bg-white">
          <p className="text-sm font-black text-text-primary">Belum ada buku modul untuk filter ini.</p>
          <p className="mt-1 text-xs font-semibold text-text-secondary">Pilih jurusan lain atau seed data modul terlebih dahulu.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const modul = parseModul(item.konten);
            return (
              <Card key={item.id} className="flex flex-col bg-white">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border-[2px] border-border bg-accent text-black">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase text-primary">
                      {item.bab.mataPelajaran.nama} - Bab {item.bab.nomor}
                    </p>
                    <h2 className="mt-1 text-base font-black text-text-primary">{modul.title || item.judul}</h2>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-xs font-semibold leading-relaxed text-text-secondary">
                  {modul.description || modul.content || item.bab.judul}
                </p>
                {modul.topics.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-4 text-xs font-semibold text-text-secondary">
                    {modul.topics.slice(0, 4).map((topic: string) => <li key={topic}>{topic}</li>)}
                  </ul>
                )}
                {modul.chapters.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {modul.chapters.slice(0, 2).map((chapter: { title: string; summary: string }) => (
                      <div key={chapter.title} className="border-[2px] border-border bg-bg-primary p-3">
                        <p className="text-xs font-black text-text-primary">{chapter.title}</p>
                        <p className="mt-1 text-xs font-semibold leading-relaxed text-text-secondary">{chapter.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
                {modul.workedExample?.question && (
                  <div className="mt-3 border-[2px] border-border bg-white p-3">
                    <p className="text-xs font-black text-text-primary">Contoh Soal</p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-text-secondary">{modul.workedExample.question}</p>
                  </div>
                )}
                {!modul.pdfUrl && (
                  <p className="mt-3 border-[2px] border-dashed border-border bg-bg-primary p-3 text-xs font-semibold text-text-secondary">
                    {modul.unavailableReason || 'File PDF belum tersedia.'}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <Badge variant={modul.pdfUrl ? 'success' : 'warning'}>{modul.pdfUrl ? 'PDF tersedia' : 'Outline modul'}</Badge>
                  <div className="flex gap-2">
                    {modul.pdfUrl && (
                      <a href={modul.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          PDF
                        </Button>
                      </a>
                    )}
                    <Link href={`/materi/${item.id}`}>
                      <Button size="sm">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Baca
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
