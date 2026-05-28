'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/stores/user-store';
import { resolveSmkPathway } from '@/lib/pathway';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  GraduationCap,
  RefreshCw,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

interface Mapel {
  id: string;
  kode: string;
  nama: string;
  kelas: number;
  semester: number;
  deskripsi: string;
  bab: Array<{
    id: string;
    nomor: number;
  }>;
}

interface JurusanDetail {
  kode: string;
  nama: string;
  bidang: string;
  mataPelajaran: Mapel[];
}

export default function SubjectsPage() {
  const { profile } = useUserStore();
  const activePathway = resolveSmkPathway(profile.selectedPathway);
  const [jurusan, setJurusan] = useState<JurusanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedMapelId, setExpandedMapelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [kelasFilter, setKelasFilter] = useState<number | 'semua'>('semua');

  useEffect(() => {
    async function loadSubjects() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/jurusan/${activePathway}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Gagal memuat mata pelajaran');
        }
        setJurusan(data);
        setExpandedMapelId(data.mataPelajaran?.[0]?.id || null);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data materi');
        toast.error(err.message || 'Gagal memuat data materi');
      } finally {
        setLoading(false);
      }
    }

    loadSubjects();
  }, [activePathway]);

  const filteredMapels = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return (jurusan?.mataPelajaran || []).filter((mapel) => {
      const matchesSearch =
        mapel.nama.toLowerCase().includes(query) ||
        mapel.kode.toLowerCase().includes(query) ||
        mapel.deskripsi.toLowerCase().includes(query);
      const matchesKelas = kelasFilter === 'semua' || mapel.kelas === kelasFilter;
      return matchesSearch && matchesKelas;
    });
  }, [jurusan, kelasFilter, searchQuery]);

  return (
    <div className="contrast-safe space-y-6 text-text-primary">
      <section className="bg-white border-[4px] border-border shadow-sm p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-accent text-black border-2 border-black font-black uppercase">
                {activePathway}
              </Badge>
              <Badge className="bg-primary text-white border-2 border-black font-black uppercase">
                Kelas {profile.grade}
              </Badge>
            </div>
            <h1 className="text-2xl font-black">Materi & Mata Pelajaran</h1>
            <p className="text-sm font-semibold text-text-secondary max-w-2xl">
              Materi ini dibaca langsung dari database jurusan. Buka mata pelajaran, pilih bab, lalu masuk ke reader materi yang berisi teks, video, PDF, ringkasan, progres, dan Tutor AI.
            </p>
          </div>

          <Link href="/jurusan">
            <Button variant="secondary" className="w-full lg:w-auto">
              <GraduationCap size={16} /> Ganti Jurusan
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <Card className="p-4 bg-white h-fit">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-black uppercase text-text-secondary">Cari Materi</label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-tertiary" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Cari mapel, kode, deskripsi..."
                  className="w-full h-10 pl-9 pr-3 border-[3px] border-border bg-bg-secondary text-sm font-bold text-text-primary focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-black uppercase text-text-secondary">Filter Kelas</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(['semua', 10, 11, 12] as const).map((kelas) => (
                  <button
                    key={kelas}
                    onClick={() => setKelasFilter(kelas)}
                    className={`h-9 border-[3px] border-border text-xs font-black ${
                      kelasFilter === kelas ? 'bg-accent text-black shadow-xs' : 'bg-white text-text-secondary hover:bg-bg-hover'
                    }`}
                  >
                    {kelas === 'semua' ? 'Semua' : `Kelas ${kelas}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-[3px] border-border bg-bg-tertiary p-3">
              <p className="text-[10px] font-mono font-black uppercase text-primary">Status Data</p>
              <p className="mt-1 text-sm font-black">{loading ? 'Memuat...' : `${filteredMapels.length} mapel tampil`}</p>
              <p className="mt-1 text-xs font-semibold text-text-secondary">
                {jurusan ? `${jurusan.nama} - ${jurusan.bidang}` : 'Data jurusan belum terbaca.'}
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <Card key={item} className="p-5 bg-white animate-pulse">
                  <div className="h-5 w-2/3 bg-bg-hover" />
                  <div className="h-3 w-full bg-bg-hover mt-4" />
                  <div className="h-3 w-4/5 bg-bg-hover mt-2" />
                  <div className="h-10 w-32 bg-bg-hover mt-6" />
                </Card>
              ))}
            </div>
          )}

          {!loading && error && (
            <Card className="p-6 bg-white text-center">
              <AlertCircle className="mx-auto text-danger" size={32} />
              <h2 className="mt-3 text-lg font-black">Materi Gagal Dimuat</h2>
              <p className="mt-1 text-sm font-semibold text-text-secondary">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                <RefreshCw size={14} /> Muat Ulang
              </Button>
            </Card>
          )}

          {!loading && !error && filteredMapels.length === 0 && (
            <Card className="p-8 bg-white text-center">
              <BookOpen className="mx-auto text-text-tertiary" size={36} />
              <h2 className="mt-3 text-lg font-black">Tidak Ada Materi</h2>
              <p className="mt-1 text-sm font-semibold text-text-secondary">
                Tidak ada mata pelajaran yang cocok. Ubah filter atau pilih jurusan lain.
              </p>
            </Card>
          )}

          {!loading && !error && filteredMapels.map((mapel) => {
            const isExpanded = expandedMapelId === mapel.id;
            const firstBab = mapel.bab?.[0];
            const progress = 0;

            return (
              <Card key={mapel.id} className="p-0 bg-white overflow-hidden">
                <button
                  onClick={() => setExpandedMapelId(isExpanded ? null : mapel.id)}
                  className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-bg-tertiary transition-colors"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-primary text-white border-2 border-black font-black">{mapel.kode}</Badge>
                      <Badge variant="secondary" className="font-black">Kelas {mapel.kelas}</Badge>
                      <Badge variant="secondary" className="font-black">Semester {mapel.semester}</Badge>
                    </div>
                    <h2 className="text-lg font-black leading-tight">{mapel.nama}</h2>
                    <p className="text-xs font-semibold text-text-secondary line-clamp-2">{mapel.deskripsi}</p>
                    <div className="max-w-sm">
                      <Progress value={progress} className="h-2" />
                      <p className="mt-1 text-[10px] font-mono font-bold text-text-tertiary">{mapel.bab?.length || 0} bab tersedia</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>

                {isExpanded && (
                  <div className="border-t-[3px] border-black bg-bg-tertiary p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(mapel.bab || []).map((bab) => (
                        <Link
                          key={bab.id}
                          href={`/belajar/${activePathway}/${mapel.id}/${bab.id}`}
                          className="border-[3px] border-border bg-white p-4 shadow-xs hover:-translate-y-0.5 transition-transform"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-mono font-black uppercase text-primary">Bab {bab.nomor}</p>
                              <h3 className="text-sm font-black">Buka Materi Bab {bab.nomor}</h3>
                            </div>
                            <ArrowRight size={17} />
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                      {firstBab && (
                        <Link href={`/belajar/${activePathway}/${mapel.id}/${firstBab.id}`}>
                          <Button className="w-full sm:w-auto">
                            <BookOpen size={15} /> Mulai Belajar
                          </Button>
                        </Link>
                      )}
                      <Link href={`/ujian/${mapel.id}?mode=latihan_santai`}>
                        <Button variant="secondary" className="w-full sm:w-auto">
                          <FileText size={15} /> Latihan Soal
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
