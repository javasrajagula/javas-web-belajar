'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';
import { resolveSmkPathway } from '@/lib/pathway';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Sparkles, 
  Award, 
  ArrowRight,
  GraduationCap,
  Briefcase,
  Check,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface Jurusan {
  id: string;
  kode: string;
  nama: string;
  bidang: string;
  deskripsi: string;
  icon: string;
  warna: string;
  popular: boolean;
  _count?: {
    mataPelajaran: number;
  };
}

export default function JurusanExplorerPage() {
  const router = useRouter();
  const { profile, updateProfile } = useUserStore();
  const activeJurusanKode = resolveSmkPathway(profile.selectedPathway);

  const [jurusans, setJurusans] = useState<Jurusan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Semua');

  // Major switching state
  const [switchingKode, setSwitchingKode] = useState<string | null>(null);
  const [switchingKelas, setSwitchingKelas] = useState<number>(11);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    async function loadJurusans() {
      try {
        const res = await fetch('/api/jurusan');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setJurusans(data);
      } catch (err) {
        toast.error('Gagal memuat kompetensi keahlian.');
      } finally {
        setLoading(false);
      }
    }
    loadJurusans();
  }, []);

  const handleSwitchMajor = async (kode: string) => {
    setSwitchingKode(kode);
  };

  const confirmSwitchMajor = async () => {
    if (!switchingKode) return;
    setIsSwitching(true);
    const toastId = toast.loading(`Mengaktifkan program keahlian ${switchingKode}...`);

    try {
      const res = await fetch('/api/user/jurusan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jurusanKode: switchingKode,
          kelas: switchingKelas
        })
      });

      if (!res.ok) throw new Error();
      
      // Update local Zustand store profile
      await updateProfile({
        selectedPathway: switchingKode,
        grade: switchingKelas,
        schoolType: 'smk'
      });

      toast.success(`Program keahlian ${switchingKode} Kelas ${switchingKelas} berhasil diaktifkan!`, { id: toastId });
      setSwitchingKode(null);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
      toast.error('Gagal memperbarui program keahlian.', { id: toastId });
    } finally {
      setIsSwitching(false);
    }
  };

  // Filter Categories
  const categories = ['Semua', 'Teknologi', 'Bisnis', 'Pariwisata', 'Kesehatan'];

  const filteredJurusans = jurusans.filter((j) => {
    const matchesSearch = j.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          j.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          j.bidang.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'Semua') return matchesSearch;
    if (selectedFilter === 'Teknologi') {
      return matchesSearch && (j.bidang.includes('Teknologi') || j.bidang.includes('Rekayasa'));
    }
    if (selectedFilter === 'Bisnis') {
      return matchesSearch && j.bidang.includes('Bisnis');
    }
    if (selectedFilter === 'Pariwisata') {
      return matchesSearch && j.bidang.includes('Pariwisata');
    }
    if (selectedFilter === 'Kesehatan') {
      return matchesSearch && j.bidang.includes('Kesehatan');
    }
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-text-primary max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary/40 border border-border p-5 rounded-lg backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <GraduationCap className="text-primary w-5.5 h-5.5" />
            Program Keahlian SMK
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Telusuri kurikulum kejuruan, mata pelajaran industri, dan sesuaikan fokus belajarmu sesuai program studi.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-text-tertiary w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Cari jurusan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-52 h-9 pl-9 pr-4 bg-bg-secondary border border-border rounded-md text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              selectedFilter === cat
                ? 'bg-primary border-primary text-white shadow-sm'
                : 'bg-bg-secondary/40 border-border text-text-secondary hover:text-white hover:bg-bg-tertiary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Jurusan Cards */}
      {loading ? (
        <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-text-secondary">Memuat program keahlian...</span>
        </div>
      ) : filteredJurusans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJurusans.map((j) => {
            const isActive = activeJurusanKode === j.kode;
            return (
              <Card 
                key={j.id} 
                className="relative border border-border bg-bg-secondary/20 hover:border-border-subtle hover:bg-bg-secondary/30 transition-all flex flex-col justify-between p-5 min-h-[220px]"
              >
                {/* Top colored strip */}
                <div 
                  className="absolute top-0 inset-x-0 h-1.5"
                  style={{ backgroundColor: j.warna }}
                ></div>

                <div className="space-y-4">
                  {/* Icon & Badges */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-2xl">{j.icon}</span>
                    <div className="flex gap-1.5">
                      {j.popular && (
                        <Badge className="text-[8px] font-bold bg-accent-subtle border-accent/25 text-accent font-mono">
                          POPULER
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[8px] font-mono">
                        {j.kode}
                      </Badge>
                    </div>
                  </div>

                  {/* Title & Bidang */}
                  <div>
                    <h3 className="text-xs font-extrabold text-white leading-snug">{j.nama}</h3>
                    <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider block mt-1">
                      {j.bidang}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-3">
                    {j.deskripsi}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="border-t border-border/40 pt-4 mt-5 flex justify-between items-center">
                  <span className="text-[9px] font-mono text-text-tertiary">
                    {j._count?.mataPelajaran || 9} Mata Pelajaran
                  </span>

                  {isActive ? (
                    <Badge variant="success" className="text-[9px] font-bold py-1 px-2.5 flex items-center gap-1">
                      <Check size={10} /> Aktif
                    </Badge>
                  ) : (
                    <Button 
                      onClick={() => handleSwitchMajor(j.kode)}
                      size="sm" 
                      className="h-7 text-[10px] px-3 font-bold flex items-center gap-1 bg-primary hover:bg-primary-hover text-white"
                    >
                      Pilih Jurusan <ArrowRight size={10} />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-lg text-xs text-text-muted">
          Tidak ada program keahlian yang cocok dengan pencarian atau filter aktif.
        </div>
      )}

      {/* SELECT GRADE MODAL ON SWITCH */}
      {switchingKode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <Card className="w-full max-w-sm p-6 bg-bg-secondary border border-border flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Briefcase size={14} className="text-primary" />
                Aktifkan Jurusan {switchingKode}
              </h3>
              <button 
                onClick={() => !isSwitching && setSwitchingKode(null)}
                className="text-text-tertiary hover:text-white font-bold cursor-pointer text-xs"
                disabled={isSwitching}
              >
                Batal
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Tentukan tingkat kelas kejuruan aktif untuk menyesuaikan materi belajar kurikulum di dasbor Anda.
              </p>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-text-secondary uppercase">Pilih Kelas</label>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 11, 12].map((kls) => (
                    <button
                      key={kls}
                      type="button"
                      disabled={isSwitching}
                      onClick={() => setSwitchingKelas(kls)}
                      className={`h-9 rounded text-xs font-bold transition-all border cursor-pointer ${
                        switchingKelas === kls
                          ? 'bg-primary border-primary text-white'
                          : 'bg-bg-tertiary border-border text-text-secondary hover:text-white'
                      }`}
                    >
                      Kelas {kls === 10 ? 'X' : kls === 11 ? 'XI' : 'XII'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 mt-2">
                <Button 
                  disabled={isSwitching}
                  onClick={confirmSwitchMajor}
                  className="w-full h-9 text-xs flex items-center justify-center gap-1.5 font-bold"
                >
                  {isSwitching ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      Konfirmasi Pilihan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
