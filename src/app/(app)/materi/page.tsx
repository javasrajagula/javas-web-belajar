'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle, Clock, FileText, Play, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GENERAL_LEARNING_TRACKS } from '@/lib/data/learning-content';
import { resolveSmkPathway } from '@/lib/pathway';
import { useUserStore } from '@/stores/user-store';

type MateriItem = {
  id: string;
  judul: string;
  tipe: string;
  konten: string;
  urutan: number;
  selesai?: boolean;
  bab: {
    id: string;
    nomor: number;
    judul: string;
    deskripsi: string;
    estimasiMenit: number;
    mataPelajaran: {
      id: string;
      kode: string;
      nama: string;
      kelas: number;
      semester: number;
      jurusan: {
        kode: string;
        nama: string;
        warna: string;
      };
    };
  };
};

const tipeIcon: Record<string, React.ReactNode> = {
  video: <Play className="h-4 w-4" />,
  pdf: <FileText className="h-4 w-4" />,
  ringkasan: <BookOpen className="h-4 w-4" />,
  teks: <BookOpen className="h-4 w-4" />,
};

const smkCategoryOptions = [
  ['semua', 'Semua SMK'],
  ['umum', 'Pelajaran Umum'],
  ['kejuruan', 'Pelajaran Kejuruan'],
];

function makeExcerpt(text: string) {
  return text
    .replace(/[#*_>`\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

export default function MateriPage() {
  const { profile } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<MateriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [kelas, setKelas] = useState('semua');
  const [track, setTrack] = useState('profil');
  const [kategori, setKategori] = useState('semua');

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathway = resolveSmkPathway(mounted ? profile.selectedPathway : 'TKJ');
  const effectivePathway = track === 'profil' ? pathway : track;
  const isProfileTrack = track === 'profil';
  const trackLabel =
    track === 'profil'
      ? `SMK ${pathway}`
      : GENERAL_LEARNING_TRACKS.find((item) => item.kode === track)?.nama || track;

  useEffect(() => {
    const controller = new AbortController();

    async function loadMateri() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ jurusan: effectivePathway });
        if (kelas !== 'semua') params.set('kelas', kelas);
        if (query.trim()) params.set('q', query.trim());
        if (isProfileTrack && kategori !== 'semua') params.set('kategori', kategori);

        const res = await fetch(`/api/materi?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal memuat materi');
        setItems(data.data || []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Gagal memuat materi');
        }
      } finally {
        setLoading(false);
      }
    }

    const timeout = window.setTimeout(loadMateri, 180);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [effectivePathway, isProfileTrack, kelas, kategori, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, MateriItem[]>();
    items.forEach((item) => {
      const key = `${item.bab.mataPelajaran.kode} - ${item.bab.mataPelajaran.nama}`;
      map.set(key, [...(map.get(key) || []), item]);
    });
    return Array.from(map.entries());
  }, [items]);

  return (
    <div className="contrast-safe space-y-6 text-text-primary">
      <section className="border-[3px] border-border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="bg-accent text-black border-border">Materi {trackLabel}</Badge>
            <h1 className="mt-3 text-2xl font-black uppercase tracking-tight text-text-primary">
              Pusat Materi Belajar
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-text-secondary">
              Materi dipisahkan berdasarkan jenjang dan jenis pelajaran. Siswa SMK tetap mendapat pelajaran umum serta pelajaran kejuruan, sementara SD, SMP, dan SMA tersedia sebagai jalur belajar umum.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari judul, bab, atau isi materi..."
                className="h-10 w-full border-[2px] border-border bg-bg-primary pl-9 pr-3 text-xs font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent sm:w-80"
              />
            </div>
            <select
              value={track}
              onChange={(event) => {
                setTrack(event.target.value);
                setKategori('semua');
                setKelas('semua');
              }}
              className="h-10 w-full appearance-none border-[2px] border-border bg-bg-primary px-3 text-xs font-black text-text-primary focus:outline-none focus:ring-2 focus:ring-accent sm:w-44"
            >
              <option value="profil">SMK Profil Saya</option>
              {GENERAL_LEARNING_TRACKS.map((item) => (
                <option key={item.kode} value={item.kode}>
                  {item.nama}
                </option>
              ))}
            </select>
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <select
                value={kelas}
                onChange={(event) => setKelas(event.target.value)}
                className="h-10 w-full appearance-none border-[2px] border-border bg-bg-primary pl-9 pr-8 text-xs font-black text-text-primary focus:outline-none focus:ring-2 focus:ring-accent sm:w-36"
              >
                <option value="semua">Semua Kelas</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((value) => (
                  <option key={value} value={String(value)}>
                    Kelas {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isProfileTrack && (
          <div className="mt-4 flex flex-wrap gap-2">
            {smkCategoryOptions.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setKategori(value)}
                className={`border-[2px] border-border px-3 py-2 text-xs font-black uppercase ${
                  kategori === value ? 'bg-primary text-white' : 'bg-white text-text-primary hover:bg-bg-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </section>

      {loading ? (
        <Card className="flex items-center gap-3 bg-white">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-bold text-text-secondary">Memuat materi dari database...</span>
        </Card>
      ) : error ? (
        <Card className="bg-danger-subtle text-danger">
          <p className="text-sm font-black">Materi gagal dimuat</p>
          <p className="mt-1 text-xs font-semibold">{error}</p>
        </Card>
      ) : items.length === 0 ? (
        <Card className="bg-white">
          <p className="text-sm font-black text-text-primary">Belum ada materi untuk filter ini.</p>
          <p className="mt-1 text-xs font-semibold text-text-secondary">
            Coba reset pencarian, pilih semua kelas, atau ganti jalur belajar. Data seed kini tersedia untuk SD, SMP, SMA, pelajaran umum SMK, dan pelajaran kejuruan SMK.
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {grouped.map(([mapelName, materiList]) => {
            const first = materiList[0];
            const mapel = first.bab.mataPelajaran;
            return (
              <section key={mapelName} className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-black uppercase text-text-primary">{mapel.nama}</h2>
                    <p className="text-xs font-semibold text-text-secondary">
                      {mapel.jurusan.kode} - Kelas {mapel.kelas} - Semester {mapel.semester} - {materiList.length} materi
                    </p>
                  </div>
                  <Link href={`/belajar/${mapel.jurusan.kode}/${mapel.id}/${first.bab.id}`}>
                    <Button size="sm" variant="outline">Buka Reader Bab</Button>
                  </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {materiList.map((materi) => (
                    <Card key={materi.id} hoverable className="flex h-full flex-col bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center border-[2px] border-border bg-accent text-black">
                            {tipeIcon[materi.tipe] || <BookOpen className="h-4 w-4" />}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[10px] font-black uppercase text-primary">
                              Bab {materi.bab.nomor}: {materi.bab.judul.replace(`Bab ${materi.bab.nomor}: `, '')}
                            </p>
                            <h3 className="mt-0.5 line-clamp-2 text-sm font-black text-text-primary">
                              {materi.judul}
                            </h3>
                          </div>
                        </div>
                        {materi.selesai && <CheckCircle className="h-5 w-5 shrink-0 text-success" />}
                      </div>

                      <p className="mt-3 line-clamp-3 flex-1 text-xs font-medium leading-relaxed text-text-secondary">
                        {makeExcerpt(materi.konten) || 'Materi ini berisi konten pembelajaran yang bisa dibuka di halaman detail.'}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-text-tertiary">
                          <Clock className="h-3.5 w-3.5" />
                          {materi.bab.estimasiMenit} menit
                        </span>
                        <Link href={`/materi/${materi.id}`}>
                          <Button size="sm">Buka Materi</Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
