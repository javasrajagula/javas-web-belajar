'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/stores/user-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JurusanCard } from '@/components/ui/JurusanCard';
import { 
  BookOpen, 
  Calendar, 
  Rocket, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  School, 
  Clock, 
  Target, 
  GraduationCap, 
  Smile, 
  Check 
} from 'lucide-react';
import { toast } from 'sonner';
import { JURUSAN_CATALOG } from '@/lib/data/jurusan';

interface Jurusan {
  id: string;
  kode: string;
  nama: string;
  bidang: string;
  deskripsi: string;
  icon: string;
  warna: string;
  popular: boolean;
}

const LEGACY_FALLBACK_JURUSAN: Jurusan[] = [
  {
    id: 'tkj',
    kode: 'TKJ',
    nama: 'Teknik Komputer dan Jaringan',
    bidang: 'Teknologi Informasi',
    deskripsi: 'Merancang, membangun, dan mengelola jaringan komputer skala lokal hingga luas.',
    icon: '🖥️',
    warna: '#3B82F6',
    popular: true
  },
  {
    id: 'rpl',
    kode: 'RPL',
    nama: 'Rekayasa Perangkat Lunak',
    bidang: 'Teknologi Informasi',
    deskripsi: 'Mempelajari pembuatan website, aplikasi mobile, game, dan sistem database.',
    icon: '💻',
    warna: '#8B5CF6',
    popular: true
  },
  {
    id: 'akl',
    kode: 'AKL',
    nama: 'Akuntansi & Keuangan Lembaga',
    bidang: 'Bisnis dan Manajemen',
    deskripsi: 'Mengelola pencatatan keuangan, audit perpajakan, dan laporan neraca perusahaan.',
    icon: '📊',
    warna: '#10B981',
    popular: false
  },
  {
    id: 'bdp',
    kode: 'BDP',
    nama: 'Bisnis Daring & Pemasaran',
    bidang: 'Bisnis dan Manajemen',
    deskripsi: 'Strategi pemasaran digital, manajemen ritel modern, dan e-commerce.',
    icon: '🛒',
    warna: '#F97316',
    popular: false
  },
  {
    id: 'otkp',
    kode: 'OTKP',
    nama: 'Otomatisasi Tata Kelola Perkantoran',
    bidang: 'Bisnis dan Manajemen',
    deskripsi: 'Manajemen administrasi kantor, kearsipan digital, dan humas perkantoran.',
    icon: '🏢',
    warna: '#F59E0B',
    popular: false
  },
  {
    id: 'mm',
    kode: 'MM',
    nama: 'Multimedia & Desain Komunikasi Visual',
    bidang: 'Seni & Ekonomi Kreatif',
    deskripsi: 'Desain grafis, produksi video, animasi 2D/3D, dan fotografi digital.',
    icon: '🎨',
    warna: '#EC4899',
    popular: true
  }
];
void LEGACY_FALLBACK_JURUSAN;

const FALLBACK_JURUSAN: Jurusan[] = JURUSAN_CATALOG.map((jurusan) => ({
  id: `catalog-${jurusan.kode.toLowerCase()}`,
  kode: jurusan.kode,
  nama: jurusan.nama,
  bidang: jurusan.bidang,
  deskripsi: jurusan.deskripsi,
  icon: jurusan.icon,
  warna: jurusan.warna,
  popular: jurusan.popular,
}));

const EMOJIS = [
  '👨‍💻', '👩‍💻', '🧑‍💻', '🚀', '🎓', '🧠', '🎨', '📊', '💻', '🖥️', 
  '⚙️', '🧪', '🔧', '📐', '📈', '📖', '🌟', '⚡', '🍕', '🎯'
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update: updateSession, status } = useSession();
  const { updateProfile, profile } = useUserStore();
  
  const [step, setStep] = useState(1);
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [loadingJurusan, setLoadingJurusan] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedJurusan, setSelectedJurusan] = useState<string>('');
  const [selectedKelas, setSelectedKelas] = useState<number>(10);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [dailyMinutes, setDailyMinutes] = useState<number>(45);
  const [uasDate, setUasDate] = useState<string>('');
  const [studyTimeSlot, setStudyTimeSlot] = useState<string>('Malam');
  const [name, setName] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('👨‍💻');

  // Prepopulate name from session when available
  useEffect(() => {
    if (session?.user?.name && !name) {
      setName(session.user.name);
    }
  }, [session, name]);

  // Fetch Jurusan from API
  useEffect(() => {
    async function fetchJurusan() {
      try {
        const res = await fetch('/api/jurusan');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setJurusanList(data);
          } else {
            setJurusanList(FALLBACK_JURUSAN);
          }
        } else {
          setJurusanList(FALLBACK_JURUSAN);
        }
      } catch (err) {
        console.error('Error fetching jurusan:', err);
        setJurusanList(FALLBACK_JURUSAN);
      } finally {
        setLoadingJurusan(false);
      }
    }
    fetchJurusan();
  }, []);

  // Set default target UAS date to 6 months from now
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 6);
    setUasDate(defaultDate.toISOString().split('T')[0]);
  }, []);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    if (!name.trim()) {
      toast.error('Nama Lengkap wajib diisi');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Menyiapkan ruang belajar kejuruan Anda...');

    try {
      // 1. Save Jurusan and Kelas to PostgreSQL via API
      const res = await fetch('/api/user/jurusan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jurusanKode: selectedJurusan,
          kelas: selectedKelas.toString(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal memperbarui jurusan di database');
      }

      // 2. Set custom study goals
      const goals = [
        `Target UAS Semester: ${uasDate}`,
        `Target belajar: ${dailyMinutes} menit/hari`,
        `Waktu favorit belajar: ${studyTimeSlot}`
      ];
      if (schoolName.trim()) {
        goals.push(`Sekolah: ${schoolName}`);
      }

      // 3. Sync profile update to Zustand and PostgreSQL
      await updateProfile({
        name,
        avatar: selectedEmoji,
        grade: selectedKelas,
        selectedPathway: selectedJurusan,
        schoolType: 'smk',
        dailyGoalMinutes: dailyMinutes,
        goals,
      });

      // 4. Update the NextAuth session token client-side so middleware realizes SelectedPathway is not 'Umum' anymore
      await updateSession({
        name,
        grade: selectedKelas,
        selectedPathway: selectedJurusan,
        schoolType: 'smk',
      });

      toast.dismiss(loadingToast);
      toast.success(`Selamat datang di BelajarKU, ${name}! 🎉`);
      
      // Delay redirect slightly to ensure session tokens are updated
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 500);
    } catch (err: any) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Terjadi kesalahan saat memproses onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step validation
  const isStepValid = () => {
    if (step === 1) return selectedJurusan !== '';
    if (step === 2) return true; // grade/semester are pre-selected
    if (step === 3) return uasDate !== '' && studyTimeSlot !== '';
    if (step === 4) return name.trim() !== '';
    return false;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono text-text-secondary">Memuat Sesi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-center items-center py-10 px-4 relative overflow-hidden select-none">
      {/* Background gradients for ambient look */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <Card className="max-w-2xl w-full p-8 border border-border bg-bg-secondary/40 backdrop-blur-md shadow-xl flex flex-col justify-between min-h-[500px]">
        {/* Step Indicator Header */}
        <div className="flex justify-between items-center mb-8 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono font-bold bg-primary-subtle text-primary border border-primary/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Langkah {step} dari 4
            </span>
            <h2 className="text-sm font-bold text-white tracking-tight">Setup Profil BelajarKU</h2>
          </div>
          {/* Top dots progress indicator */}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-5 h-1.5 rounded-full transition-all duration-300 ${
                  s === step 
                    ? 'bg-primary w-8 shadow-[0_0_8px_rgba(79,70,229,0.5)]' 
                    : s < step 
                      ? 'bg-success' 
                      : 'bg-bg-tertiary border border-border/45'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content Area */}
        <div className="flex-grow flex flex-col justify-center">
          
          {/* STEP 1: PILIH JURUSAN */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <GraduationCap className="text-primary w-5 h-5" /> Pilih Kompetensi Keahlian (Jurusan)
                </h3>
                <p className="text-xs text-text-secondary">
                  Sesuaikan konten kurikulum, bab pelajaran, kuis, dan simulasi soal dengan program kejuruanmu.
                </p>
              </div>

              {loadingJurusan ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[220px] rounded-lg bg-bg-tertiary/20 border border-border/30 animate-pulse flex items-center justify-center text-xs text-text-tertiary">
                      Memuat kartu jurusan...
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[340px] overflow-y-auto pr-1">
                  {jurusanList.map((jurusan) => (
                    <JurusanCard
                      key={jurusan.kode}
                      nama={jurusan.nama}
                      kode={jurusan.kode}
                      bidang={jurusan.bidang}
                      icon={jurusan.icon}
                      warna={jurusan.warna}
                      popular={jurusan.popular}
                      isActive={selectedJurusan === jurusan.kode}
                      onClick={() => setSelectedJurusan(jurusan.kode)}
                      className="cursor-pointer border-2 hover:scale-[1.01]"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PILIH KELAS & SEMESTER */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <BookOpen className="text-primary w-5 h-5" /> Tingkatan Kelas & Semester
                </h3>
                <p className="text-xs text-text-secondary">
                  Tentukan bahan ajar dan bab materi yang sesuai dengan jenjang semester aktifmu sekarang.
                </p>
              </div>

              <div className="space-y-5">
                {/* Kelas Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Pilih Tingkatan Kelas</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: 10, label: 'Kelas X', desc: 'Dasar Program Keahlian (C1/C2)' },
                      { val: 11, label: 'Kelas XI', desc: 'Konsentrasi Keahlian & PKL (C3)' },
                      { val: 12, label: 'Kelas XII', desc: 'Uji Kompetensi & Portofolio Kerja' }
                    ].map((kelasObj) => {
                      const isActive = selectedKelas === kelasObj.val;
                      return (
                        <div
                          key={kelasObj.val}
                          onClick={() => setSelectedKelas(kelasObj.val)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center flex flex-col items-center justify-center gap-1.5 ${
                            isActive
                              ? 'border-primary bg-primary-subtle text-white shadow-[0_0_12px_rgba(79,70,229,0.15)]'
                              : 'border-border bg-bg-tertiary/20 hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <span className="text-sm font-bold">{kelasObj.label}</span>
                          <span className="text-[9px] text-text-tertiary leading-snug">{kelasObj.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Semester Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Pilih Semester Aktif</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: 1, label: 'Semester Ganjil', desc: 'Semester 1, 3, atau 5' },
                      { val: 2, label: 'Semester Genap', desc: 'Semester 2, 4, atau 6' }
                    ].map((semObj) => {
                      const isActive = selectedSemester === semObj.val;
                      return (
                        <div
                          key={semObj.val}
                          onClick={() => setSelectedSemester(semObj.val)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center flex flex-col items-center justify-center gap-1 ${
                            isActive
                              ? 'border-primary bg-primary-subtle text-white shadow-[0_0_12px_rgba(79,70,229,0.15)]'
                              : 'border-border bg-bg-tertiary/20 hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <span className="text-xs font-bold">{semObj.label}</span>
                          <span className="text-[9px] text-text-tertiary leading-snug">{semObj.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TARGET BELAJAR */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Calendar className="text-primary w-5 h-5" /> Target Belajar & Jadwal
                </h3>
                <p className="text-xs text-text-secondary">
                  Konfigurasikan sasaran belajarmu agar AI Auto-Scheduler dapat merancang program belajar yang adaptif.
                </p>
              </div>

              <div className="space-y-5">
                {/* Daily Goal Slider */}
                <div className="space-y-2.5 p-4 border border-border rounded-lg bg-bg-tertiary/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-text-secondary">Target Waktu Belajar Harian</span>
                    <Badge variant="primary" className="text-xs font-mono font-bold bg-primary-subtle text-primary border-primary/20">
                      {dailyMinutes} Menit / hari
                    </Badge>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="5"
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    className="w-full accent-primary bg-bg-tertiary h-2 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-text-tertiary">
                    <span>15m (Ringan)</span>
                    <span>45m (Sedang)</span>
                    <span>90m (Intensif)</span>
                    <span>120m (Maraton)</span>
                  </div>
                </div>

                {/* Target UAS & Preferred Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Target UAS Date */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Target Ujian Akhir Semester</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={uasDate}
                        onChange={(e) => setUasDate(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-bg-tertiary border border-border rounded-lg text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Preferred study time slot */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Waktu Belajar Terfavorit</label>
                    <select
                      value={studyTimeSlot}
                      onChange={(e) => setStudyTimeSlot(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-bg-tertiary border border-border rounded-lg text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                      <option value="Pagi">🌅 Pagi (06:00 - 12:00)</option>
                      <option value="Siang">☀️ Siang (12:00 - 17:00)</option>
                      <option value="Sore">🌇 Sore (17:00 - 20:00)</option>
                      <option value="Malam">🌙 Malam (20:00 - 06:00)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PROFIL DIRI & AVATAR */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <User className="text-primary w-5 h-5" /> Identitas Belajar & Avatar
                </h3>
                <p className="text-xs text-text-secondary">
                  Sesuaikan nama akun dan pilih emoji avatar ikonik untuk profil RPG belajarmu.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Nama Lengkap Siswa</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkapmu..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-bg-tertiary border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  {/* School Name Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Asal Sekolah (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: SMKN 1 Jakarta..."
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-bg-tertiary border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Avatar Emoji Selector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                      <Smile size={13} /> Pilih Avatar Emoji
                    </label>
                    <span className="text-[10px] text-text-tertiary">Terpilih: <strong className="text-primary text-sm ml-1">{selectedEmoji}</strong></span>
                  </div>
                  
                  {/* Grid of Emojis */}
                  <div className="grid grid-cols-10 gap-2 p-3 border border-border rounded-lg bg-bg-tertiary/10">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`text-xl p-2 rounded-lg hover:bg-bg-hover transition-colors duration-150 flex items-center justify-center cursor-pointer ${
                          selectedEmoji === emoji 
                            ? 'bg-primary/20 border border-primary scale-110 shadow-[0_0_8px_rgba(79,70,229,0.3)]' 
                            : 'border border-transparent'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons Footer */}
        <div className="flex justify-between pt-8 border-t border-border/40 mt-8">
          {step > 1 ? (
            <Button 
              type="button"
              variant="outline" 
              onClick={handleBack} 
              className="w-28 flex items-center justify-center gap-1.5 h-10 text-xs font-bold"
              disabled={isSubmitting}
            >
              <ArrowLeft size={13} /> Kembali
            </Button>
          ) : (
            <div /> // Spacer
          )}

          <Button 
            type="button"
            onClick={handleNext} 
            disabled={!isStepValid() || isSubmitting}
            className={`w-36 flex items-center justify-center gap-1.5 h-10 text-xs font-bold ${
              isStepValid() 
                ? 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/10' 
                : 'bg-bg-tertiary text-text-tertiary border border-border cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : step === 4 ? (
              <>
                Selesai <Rocket size={13} className="animate-pulse" />
              </>
            ) : (
              <>
                Lanjut <ArrowRight size={13} />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
