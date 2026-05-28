'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Play, RefreshCw, Search, Video } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/stores/user-store';
import { resolveJurusanKode } from '@/lib/data/jurusan';
import { GENERAL_LEARNING_TRACKS } from '@/lib/data/learning-content';

type VideoMateri = {
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

function parseVideo(konten: string) {
  try {
    const parsed = JSON.parse(konten);
    return {
      title: parsed.title || '',
      description: parsed.description || '',
      embedUrl: parsed.embedUrl || '',
      externalUrl: parsed.externalUrl || '',
      transcript: Array.isArray(parsed.transcript) ? parsed.transcript : [],
      unavailableReason: parsed.unavailableReason || '',
    };
  } catch {
    return {
      title: '',
      description: '',
      embedUrl: konten.startsWith('http') ? konten : '',
      externalUrl: konten.startsWith('http') ? konten : '',
      transcript: [],
      unavailableReason: '',
    };
  }
}

export default function VideoPanduanPage() {
  const { profile } = useUserStore();
  const jurusanKode = resolveJurusanKode(profile.selectedPathway);
  const [track, setTrack] = useState('profil');
  const [items, setItems] = useState<VideoMateri[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const effectiveTrack = track === 'profil' ? jurusanKode : track;
  const trackLabel = track === 'profil'
    ? `SMK ${jurusanKode}`
    : GENERAL_LEARNING_TRACKS.find((item) => item.kode === track)?.nama || track;

  useEffect(() => {
    async function loadVideos() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ jurusan: effectiveTrack, tipe: 'video' });
        if (query.trim()) params.set('q', query.trim());
        const res = await fetch(`/api/materi?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal memuat video panduan');
        setItems(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat video panduan');
      } finally {
        setLoading(false);
      }
    }
    const timeout = window.setTimeout(loadVideos, 180);
    return () => window.clearTimeout(timeout);
  }, [effectiveTrack, query]);

  const totalWithEmbed = useMemo(() => items.filter((item) => parseVideo(item.konten).embedUrl).length, [items]);

  return (
    <div className="contrast-safe space-y-6 text-text-primary">
      <section className="border-[3px] border-border bg-white p-5 shadow-sm">
        <Badge className="bg-accent text-black border-border">Video {trackLabel}</Badge>
        <h1 className="mt-3 text-2xl font-black uppercase tracking-tight text-text-primary">Video Panduan</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-text-secondary">
          Kumpulan materi bertipe video. Jika sekolah belum mengisi URL video resmi, halaman ini menampilkan panduan praktik tertulis yang jujur, bukan embed palsu.
        </p>
        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari video, bab, atau mapel..."
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
          <span className="text-sm font-bold text-text-secondary">Memuat video panduan...</span>
        </Card>
      ) : error ? (
        <Card className="bg-danger-subtle text-danger">{error}</Card>
      ) : items.length === 0 ? (
        <Card className="bg-white">
          <p className="text-sm font-black text-text-primary">Belum ada video panduan untuk filter ini.</p>
          <p className="mt-1 text-xs font-semibold text-text-secondary">Pilih jurusan lain atau seed data video terlebih dahulu.</p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const video = parseVideo(item.konten);
            return (
              <Card key={item.id} className="bg-white">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border-[2px] border-border bg-accent text-black">
                    <Video className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase text-primary">
                      {item.bab.mataPelajaran.nama} - Bab {item.bab.nomor}
                    </p>
                    <h2 className="mt-1 text-base font-black text-text-primary">{video.title || item.judul}</h2>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-text-secondary">
                      {video.description || item.bab.judul}
                    </p>
                  </div>
                </div>

                {video.embedUrl ? (
                  <iframe title={item.judul} src={video.embedUrl} className="mt-4 aspect-video w-full border-[3px] border-border bg-black" allowFullScreen />
                ) : (
                  <div className="mt-4 border-[2px] border-dashed border-border bg-bg-primary p-4">
                    <p className="text-xs font-black text-text-primary">Video eksternal belum tersedia</p>
                    <p className="mt-1 text-xs font-semibold text-text-secondary">{video.unavailableReason || 'Belum ada URL video resmi untuk materi ini.'}</p>
                    {video.externalUrl && (
                      <a href={video.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Buka Referensi Video
                        </Button>
                      </a>
                    )}
                    {video.transcript.length > 0 && (
                      <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs font-semibold text-text-secondary">
                        {video.transcript.map((step: string) => <li key={step}>{step}</li>)}
                      </ol>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <Badge variant={video.embedUrl || video.externalUrl ? 'success' : 'warning'}>{video.embedUrl ? 'Embed tersedia' : video.externalUrl ? 'Link video tersedia' : 'Panduan tertulis'}</Badge>
                  <Link href={`/materi/${item.id}`}>
                    <Button size="sm">
                      <Play className="mr-2 h-4 w-4" />
                      Buka Detail
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && items.length > 0 && (
        <p className="text-xs font-semibold text-text-secondary">
          {items.length} video/panduan ditemukan. {totalWithEmbed} memiliki embed eksternal.
        </p>
      )}
    </div>
  );
}
