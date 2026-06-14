import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password';
import * as fs from 'fs';
import * as path from 'path';
import { JURUSAN_CATALOG } from '../src/lib/data/jurusan';
import {
  GENERAL_LEARNING_TRACKS,
  SMK_COMMON_SUBJECTS_BY_GRADE,
  buildYoutubeSearchUrl,
  getLearningReferences,
} from '../src/lib/data/learning-content';

const prisma = new PrismaClient();

// Legacy inline data is kept only as historical reference. Active seed data
// comes from the centralized SMK catalog in src/lib/data/jurusan.ts.
const LEGACY_JURUSAN_DATA = [
  {
    kode: 'TKJ',
    nama: 'Teknik Komputer dan Jaringan',
    bidang: 'Teknologi Informasi dan Komunikasi',
    icon: '🖥️',
    warna: '#3B82F6',
    popular: true,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Teknik Jaringan Komputer dan Telekomunikasi', semester: 1 },
        { kode: 'C2', nama: 'Penggunaan Alat Ukur Jaringan', semester: 1 },
        { kode: 'C2', nama: 'Pemrograman Dasar', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Administrasi Infrastruktur Jaringan', semester: 1 },
        { kode: 'C3', nama: 'Administrasi Sistem Jaringan', semester: 2 },
        { kode: 'C3', nama: 'Teknologi Wide Area Network', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Administrasi Infrastruktur Jaringan Lanjut', semester: 1 },
        { kode: 'C3', nama: 'Keamanan Jaringan', semester: 1 },
        { kode: 'C3', nama: 'Perencanaan dan Pengalamatan Jaringan', semester: 2 },
      ]
    }
  },
  {
    kode: 'RPL',
    nama: 'Rekayasa Perangkat Lunak',
    bidang: 'Teknologi Informasi dan Komunikasi',
    icon: '💻',
    warna: '#8B5CF6',
    popular: true,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Pengembangan Perangkat Lunak dan GIM', semester: 1 },
        { kode: 'C2', nama: 'Pemrograman Dasar', semester: 1 },
        { kode: 'C2', nama: 'Basis Data', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Pemrograman Berorientasi Objek', semester: 1 },
        { kode: 'C3', nama: 'Pemrograman Web dan Perangkat Bergerak', semester: 2 },
        { kode: 'C3', nama: 'Rekayasa Perangkat Lunak', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Pemrograman Web Dinamis', semester: 1 },
        { kode: 'C3', nama: 'Pengujian Perangkat Lunak', semester: 1 },
        { kode: 'C3', nama: 'Proyek Perangkat Lunak', semester: 2 },
      ]
    }
  },
  {
    kode: 'MM',
    nama: 'Multimedia',
    bidang: 'Teknologi Informasi dan Komunikasi',
    icon: '🎨',
    warna: '#EC4899',
    popular: false,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Kreatif', semester: 1 },
        { kode: 'C2', nama: 'Desain Grafis', semester: 1 },
        { kode: 'C2', nama: 'Fotografi Dasar', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Desain Grafis Lanjutan', semester: 1 },
        { kode: 'C3', nama: 'Animasi 2D dan 3D', semester: 2 },
        { kode: 'C3', nama: 'Produksi Video', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Teknik Pengolahan Audio', semester: 1 },
        { kode: 'C3', nama: 'Desain Media Interaktif', semester: 1 },
        { kode: 'C3', nama: 'Proyek Multimedia', semester: 2 },
      ]
    }
  },
  {
    kode: 'OTKP',
    nama: 'Otomatisasi dan Tata Kelola Perkantoran',
    bidang: 'Bisnis dan Manajemen',
    icon: '🏢',
    warna: '#F59E0B',
    popular: true,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Manajemen Perkantoran dan Layanan Bisnis', semester: 1 },
        { kode: 'C2', nama: 'Teknologi Perkantoran', semester: 1 },
        { kode: 'C2', nama: 'Korespondensi', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Otomatisasi Tata Kelola Kepegawaian', semester: 1 },
        { kode: 'C3', nama: 'Otomatisasi Tata Kelola Keuangan', semester: 1 },
        { kode: 'C3', nama: 'Otomatisasi Tata Kelola Sarana dan Prasarana', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Otomatisasi Tata Kelola Humas dan Keprotokolan', semester: 1 },
        { kode: 'C3', nama: 'Administrasi Sistem Informasi Manajemen', semester: 1 },
        { kode: 'C3', nama: 'Proyek Kreatif dan Kewirausahaan', semester: 2 },
      ]
    }
  },
  {
    kode: 'AKL',
    nama: 'Akuntansi dan Keuangan Lembaga',
    bidang: 'Bisnis dan Manajemen',
    icon: '📊',
    warna: '#10B981',
    popular: true,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Akuntansi dan Keuangan Lembaga', semester: 1 },
        { kode: 'C2', nama: 'Dasar Akuntansi', semester: 1 },
        { kode: 'C2', nama: 'Aplikasi Pengolah Angka', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Akuntansi Perusahaan Jasa dan Dagang', semester: 1 },
        { kode: 'C3', nama: 'Akuntansi Perbankan Syariah', semester: 2 },
        { kode: 'C3', nama: 'Akuntansi Keuangan', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Akuntansi Perusahaan Manufaktur', semester: 1 },
        { kode: 'C3', nama: 'Komputer Akuntansi', semester: 1 },
        { kode: 'C3', nama: 'Administrasi Pajak', semester: 2 },
      ]
    }
  },
  {
    kode: 'BDP',
    nama: 'Bisnis Daring dan Pemasaran',
    bidang: 'Bisnis dan Manajemen',
    icon: '🛒',
    warna: '#F97316',
    popular: false,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Pemasaran', semester: 1 },
        { kode: 'C2', nama: 'Pengelolaan Bisnis Ritel', semester: 1 },
        { kode: 'C2', nama: 'Komunikasi Bisnis', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Penataan Produk', semester: 1 },
        { kode: 'C3', nama: 'Bisnis Online', semester: 2 },
        { kode: 'C3', nama: 'Pengelolaan Bisnis Daring', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Administrasi Transaksi', semester: 1 },
        { kode: 'C3', nama: 'Strategi Pemasaran', semester: 1 },
        { kode: 'C3', nama: 'Proyek Kreatif Pemasaran', semester: 2 },
      ]
    }
  },
  {
    kode: 'PHT',
    nama: 'Perhotelan',
    bidang: 'Pariwisata',
    icon: '🏨',
    warna: '#06B6D4',
    popular: false,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Perhotelan', semester: 1 },
        { kode: 'C2', nama: 'Layanan Makanan dan Minuman', semester: 1 },
        { kode: 'C2', nama: 'Housekeeping', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Front Office', semester: 1 },
        { kode: 'C3', nama: 'Tata Hidang', semester: 2 },
        { kode: 'C3', nama: 'Laundry', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Kantor Depan Hotel', semester: 1 },
        { kode: 'C3', nama: 'Tata Graha Lanjutan', semester: 1 },
        { kode: 'C3', nama: 'Proyek Perhotelan', semester: 2 },
      ]
    }
  },
  {
    kode: 'KULINER',
    nama: 'Tata Boga',
    bidang: 'Pariwisata',
    icon: '🍳',
    warna: '#EF4444',
    popular: false,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Kuliner', semester: 1 },
        { kode: 'C2', nama: 'Keamanan Pangan', semester: 1 },
        { kode: 'C2', nama: 'Pengetahuan Bahan Makanan', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Pengolahan dan Penyajian Makanan Kontinental', semester: 1 },
        { kode: 'C3', nama: 'Pengolahan dan Penyajian Makanan Indonesia', semester: 2 },
        { kode: 'C3', nama: 'Produksi Pastry dan Bakery', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Produksi Pengolahan Hasil Nabati', semester: 1 },
        { kode: 'C3', nama: 'Pengolahan Makanan Fungsional', semester: 1 },
        { kode: 'C3', nama: 'Proyek Kuliner', semester: 2 },
      ]
    }
  },
  {
    kode: 'KPR',
    nama: 'Keperawatan',
    bidang: 'Kesehatan dan Pekerjaan Sosial',
    icon: '🏥',
    warna: '#14B8A6',
    popular: false,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Keperawatan', semester: 1 },
        { kode: 'C2', nama: 'Anatomi dan Fisiologi', semester: 1 },
        { kode: 'C2', nama: 'Ilmu Penyakit', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Kebutuhan Dasar Manusia', semester: 1 },
        { kode: 'C3', nama: 'Keterampilan Dasar Tindakan Keperawatan', semester: 2 },
        { kode: 'C3', nama: 'Ilmu Gizi', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Keperawatan Medikal Bedah', semester: 1 },
        { kode: 'C3', nama: 'Keperawatan Maternitas dan Anak', semester: 1 },
        { kode: 'C3', nama: 'Praktik Kerja Lapangan', semester: 2 },
      ]
    }
  },
  {
    kode: 'FARMASI',
    nama: 'Farmasi Klinis dan Komunitas',
    bidang: 'Kesehatan dan Pekerjaan Sosial',
    icon: '💊',
    warna: '#7C3AED',
    popular: false,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Kefarmasian', semester: 1 },
        { kode: 'C2', nama: 'Kimia Dasar', semester: 1 },
        { kode: 'C2', nama: 'Botani Farmasi', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Pelayanan Farmasi', semester: 1 },
        { kode: 'C3', nama: 'Farmakologi', semester: 2 },
        { kode: 'C3', nama: 'Kimia Farmasi', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Farmasi Rumah Sakit', semester: 1 },
        { kode: 'C3', nama: 'Apotek', semester: 1 },
        { kode: 'C3', nama: 'Proyek Kefarmasian', semester: 2 },
      ]
    }
  },
  {
    kode: 'TBSM',
    nama: 'Teknik dan Bisnis Sepeda Motor',
    bidang: 'Teknologi dan Rekayasa',
    icon: '🏍️',
    warna: '#0EA5E9',
    popular: false,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Teknik Otomotif', semester: 1 },
        { kode: 'C2', nama: 'Gambar Teknik Otomotif', semester: 1 },
        { kode: 'C2', nama: 'Teknologi Dasar Otomotif', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Pemeliharaan Mesin Sepeda Motor', semester: 1 },
        { kode: 'C3', nama: 'Pemeliharaan Sasis Sepeda Motor', semester: 2 },
        { kode: 'C3', nama: 'Pemeliharaan Kelistrikan Sepeda Motor', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Pengelolaan Bengkel Sepeda Motor', semester: 1 },
        { kode: 'C3', nama: 'Produk Kreatif dan Kewirausahaan Otomotif', semester: 1 },
        { kode: 'C3', nama: 'Praktik Kerja Sepeda Motor', semester: 2 },
      ]
    }
  },
  {
    kode: 'ATP',
    nama: 'Agribisnis Tanaman Pangan dan Hortikultura',
    bidang: 'Agribisnis dan Agriteknologi',
    icon: '🌾',
    warna: '#16A34A',
    popular: false,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Tanaman Pangan', semester: 1 },
        { kode: 'C2', nama: 'Alat dan Mesin Pertanian', semester: 1 },
        { kode: 'C2', nama: 'Pembiakan Tanaman', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Agribisnis Tanaman Pangan', semester: 1 },
        { kode: 'C3', nama: 'Agribisnis Tanaman Sayuran', semester: 2 },
        { kode: 'C3', nama: 'Agribisnis Tanaman Buah', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Agribisnis Tanaman Hias', semester: 1 },
        { kode: 'C3', nama: 'Produksi dan Pengolahan Benih', semester: 1 },
        { kode: 'C3', nama: 'Kewirausahaan Agribisnis', semester: 2 },
      ]
    }
  }
];
void LEGACY_JURUSAN_DATA;

const JURUSAN_DATA = [...JURUSAN_CATALOG, ...GENERAL_LEARNING_TRACKS];

function getMapelList(jurusan: any, kelas: number) {
  const mapels = jurusan.mapel?.[kelas] || [];
  if (JURUSAN_CATALOG.some((item) => item.kode === jurusan.kode)) {
    return [...(SMK_COMMON_SUBJECTS_BY_GRADE[kelas as 10 | 11 | 12] || []), ...mapels];
  }
  return mapels;
}

function getBabJudul(mapel: string, bab: number, kelas: number): string {
  const judulMap: Record<string, string[]> = {
    'Administrasi Infrastruktur Jaringan': [
      'Konsep Routing dan VLAN',
      'Routing Statis pada Router Cisco/MikroTik',
      'Routing Dinamis OSPF & EIGRP',
      'Konsep Access Control List (ACL)',
      'Manajemen Bandwidth dengan Queue Tree',
      'Firewall dan Keamanan Jaringan'
    ],
    'Pemrograman Berorientasi Objek': [
      'Konsep Dasar OOP & Class Structure',
      'Enkapsulasi, Access Modifiers, dan Constructor',
      'Pewarisan (Inheritance) dan Overriding',
      'Polimorfisme dan Abstract Class',
      'Interface dan Hubungannya dengan Implementasi',
      'Exception Handling dan Koleksi Generik'
    ],
    'Dasar-Dasar Manajemen Perkantoran dan Layanan Bisnis': [
      'Hakikat Manajemen Perkantoran',
      'Organisasi dan Tata Kerja Kantor',
      'Komunikasi Efektif di Tempat Kerja',
      'Otomatisasi Peralatan Perkantoran',
      'Kesehatan & Keselamatan Kerja (K3) Perkantoran',
      'Etika Profesi Asisten Perkantoran'
    ],
    'Otomatisasi Tata Kelola Kepegawaian': [
      'Konsep Administrasi Kepegawaian',
      'Rekrutmen, Seleksi, dan Orientasi SDM',
      'Pengembangan Karir dan Penilaian Kinerja',
      'Kompensasi, Tunjangan, dan Penggajian',
      'Disiplin, Penghargaan, dan Sanksi Kerja',
      'Pemberhentian, PHK, dan Pensiun Pegawai'
    ],
    'Dasar Akuntansi': [
      'Pengantar Akuntansi dan Persamaan Akuntansi',
      'Analisis Bukti Transaksi dan Jurnal Umum',
      'Posting Buku Besar dan Neraca Saldo',
      'Penyusunan Jurnal Penyesuaian',
      'Kertas Kerja (Worksheet) Akuntansi',
      'Penyusunan Laporan Keuangan Dasar'
    ],
    'Akuntansi Perusahaan Jasa dan Dagang': [
      'Karakteristik Perusahaan Jasa dan Siklusnya',
      'Jurnal Penutup Perusahaan Jasa',
      'Karakteristik Perusahaan Dagang',
      'Pencatatan Jurnal Khusus & Buku Pembantu',
      'Metode Penilaian Persediaan Barang Dagang',
      'Laporan Keuangan Perusahaan Dagang lengkap'
    ]
  };

  const judul = judulMap[mapel];
  if (judul && judul[bab - 1]) return judul[bab - 1];

  const text = mapel.toLowerCase();
  const commonJudul: Array<{ match: string[]; titles: string[] }> = [
    {
      match: ['bahasa indonesia', 'membaca', 'menulis'],
      titles: ['Menemukan Ide Pokok dan Informasi Penting', 'Mengenali Struktur Teks', 'Menyusun Paragraf Runtut', 'Membandingkan Fakta dan Opini', 'Menyajikan Tanggapan dengan Santun'],
    },
    {
      match: ['bahasa inggris', 'english'],
      titles: ['Understanding Context and Vocabulary', 'Building Simple Sentences', 'Reading for Main Ideas', 'Speaking with Clear Purpose', 'Writing Short Functional Texts'],
    },
    {
      match: ['matematika', 'bilangan', 'aljabar', 'geometri', 'fungsi'],
      titles: ['Memahami Pola dan Representasi Bilangan', 'Menyusun Model Matematika', 'Menyelesaikan Masalah Bertahap', 'Membaca Grafik dan Data', 'Memeriksa Jawaban dengan Alasan Logis'],
    },
    {
      match: ['fisika', 'gerak', 'energi', 'listrik', 'gelombang'],
      titles: ['Besaran, Satuan, dan Pengukuran', 'Hubungan Gaya, Gerak, dan Energi', 'Membaca Grafik Fenomena Fisika', 'Merancang Percobaan Sederhana', 'Menganalisis Data dan Kesimpulan'],
    },
    {
      match: ['kimia', 'atom', 'larutan', 'stoikiometri'],
      titles: ['Materi dan Perubahannya', 'Struktur Atom dan Tabel Periodik', 'Ikatan Kimia dalam Kehidupan', 'Menghitung Reaksi Secara Bertahap', 'Keselamatan Kerja Laboratorium Kimia'],
    },
    {
      match: ['biologi', 'ipas', 'makhluk hidup', 'sel', 'jaringan'],
      titles: ['Ciri Makhluk Hidup dan Lingkungan', 'Hubungan Struktur dan Fungsi', 'Pengamatan Ilmiah Sederhana', 'Membaca Data Biologi', 'Menjaga Keseimbangan Ekosistem'],
    },
    {
      match: ['ekonomi', 'pasar', 'kelangkaan'],
      titles: ['Kebutuhan, Kelangkaan, dan Pilihan', 'Permintaan, Penawaran, dan Harga', 'Peran Pelaku Ekonomi', 'Membaca Data Ekonomi Sederhana', 'Keputusan Keuangan yang Bertanggung Jawab'],
    },
    {
      match: ['geografi', 'peta', 'litosfer', 'atmosfer'],
      titles: ['Membaca Peta dan Lokasi', 'Dinamika Bentang Alam', 'Cuaca, Iklim, dan Aktivitas Manusia', 'Kependudukan dan Ruang', 'Mitigasi Bencana di Lingkungan Sekitar'],
    },
    {
      match: ['sosiologi', 'kelompok', 'norma', 'sosial'],
      titles: ['Individu dan Kelompok Sosial', 'Norma, Nilai, dan Keteraturan', 'Interaksi Sosial Sehari-hari', 'Konflik dan Integrasi Sosial', 'Penelitian Sosial Sederhana'],
    },
    {
      match: ['sejarah'],
      titles: ['Kronologi dan Sumber Sejarah', 'Perubahan dan Keberlanjutan', 'Tokoh, Peristiwa, dan Dampaknya', 'Membaca Bukti Sejarah', 'Menghubungkan Sejarah dengan Masa Kini'],
    },
    {
      match: ['pancasila', 'kewargaan', 'ppkn'],
      titles: ['Nilai Pancasila dalam Kehidupan', 'Hak, Kewajiban, dan Tanggung Jawab', 'Musyawarah dan Keputusan Bersama', 'Keberagaman dan Persatuan', 'Proyek Warga di Lingkungan Sekolah'],
    },
    {
      match: ['pjok', 'kebugaran', 'olahraga'],
      titles: ['Gerak Dasar dan Keselamatan', 'Kebugaran Jasmani Bertahap', 'Permainan dan Kerja Sama Tim', 'Pola Hidup Sehat', 'Evaluasi Aktivitas Fisik Mandiri'],
    },
    {
      match: ['seni', 'budaya', 'prakarya'],
      titles: ['Unsur Rupa, Bunyi, dan Gerak', 'Mengamati Karya Seni', 'Membuat Karya Sederhana', 'Apresiasi dan Kritik Santun', 'Pameran Karya Kelas'],
    },
  ];

  const common = commonJudul.find((item) => item.match.some((keyword) => text.includes(keyword)));
  if (common) return common.titles[bab - 1] || common.titles[0];

  return `Konsep Inti Bagian ${bab}: ${mapel}`;
}

function getDomainProfile(jurusanKode: string, mapelNama: string) {
  const text = `${jurusanKode} ${mapelNama}`.toLowerCase();

  if (text.includes('bahasa indonesia') || text.includes('membaca') || text.includes('menulis')) {
    return {
      ruang: 'kelas literasi dan ruang diskusi',
      peran: 'pembaca kritis dan penulis muda',
      alat: 'teks bacaan, kamus, peta pikiran, catatan ide, dan rubrik penilaian',
      produk: 'teks atau tanggapan yang runtut, bernalar, dan memakai bahasa santun',
      studiKasus: 'siswa membaca teks informasi, menemukan gagasan utama, lalu menulis tanggapan yang didukung bukti dari bacaan',
      langkah: ['membaca tujuan', 'menandai kata kunci', 'menemukan gagasan utama', 'menyusun kerangka jawaban', 'merevisi bahasa dan tanda baca'],
      istilah: ['Ide Pokok', 'Fakta', 'Opini', 'Struktur Teks', 'Kohesi'],
      kesalahan: 'menulis pendapat tanpa bukti dari teks dan tanpa memeriksa urutan paragraf',
      bukti: 'catatan anotasi, kerangka tulisan, draf revisi, dan teks akhir',
    };
  }

  if (text.includes('bahasa inggris') || text.includes('english')) {
    return {
      ruang: 'kelas komunikasi bahasa Inggris',
      peran: 'komunikator pemula yang percaya diri',
      alat: 'kosakata tematik, contoh dialog, kamus, audio pendek, dan lembar latihan',
      produk: 'kalimat, dialog, atau teks pendek yang jelas sesuai konteks',
      studiKasus: 'siswa perlu memperkenalkan diri, memahami informasi sederhana, dan merespons pertanyaan dengan ungkapan yang tepat',
      langkah: ['memahami konteks', 'mengumpulkan kosakata', 'menyusun pola kalimat', 'berlatih membaca/berbicara', 'memeriksa ejaan dan makna'],
      istilah: ['Context', 'Vocabulary', 'Sentence Pattern', 'Main Idea', 'Pronunciation'],
      kesalahan: 'menerjemahkan kata per kata tanpa memperhatikan konteks dan pola kalimat',
      bukti: 'daftar kosakata, dialog pendek, rekaman latihan, dan teks revisi',
    };
  }

  if (text.includes('matematika') || text.includes('bilangan') || text.includes('aljabar') || text.includes('geometri')) {
    return {
      ruang: 'kelas numerasi dan pemecahan masalah',
      peran: 'pemecah masalah yang teliti',
      alat: 'garis bilangan, tabel, grafik, kalkulator seperlunya, dan lembar langkah penyelesaian',
      produk: 'penyelesaian matematika yang lengkap dengan alasan, satuan, dan pemeriksaan ulang',
      studiKasus: 'siswa diminta mengubah masalah sehari-hari menjadi model matematika, menghitung bertahap, dan menjelaskan alasan jawabannya',
      langkah: ['membaca informasi diketahui', 'menentukan hal yang ditanya', 'memilih rumus atau strategi', 'menghitung bertahap', 'memeriksa kembali jawaban'],
      istilah: ['Variabel', 'Model', 'Operasi', 'Grafik', 'Pembuktian'],
      kesalahan: 'langsung memakai rumus tanpa memahami satuan, kondisi soal, dan makna hasil akhir',
      bukti: 'model matematika, langkah perhitungan, grafik/tabel, dan pemeriksaan jawaban',
    };
  }

  if (text.includes('fisika') || text.includes('gerak') || text.includes('energi') || text.includes('listrik') || text.includes('gelombang')) {
    return {
      ruang: 'laboratorium sains dan observasi fenomena',
      peran: 'peneliti muda yang menguji fenomena',
      alat: 'alat ukur, tabel data, grafik, stopwatch, sensor sederhana, dan lembar pengamatan',
      produk: 'laporan percobaan yang menghubungkan konsep, data, grafik, dan kesimpulan',
      studiKasus: 'siswa mengamati gejala gerak atau energi, mengukur data, lalu menjelaskan hubungan sebab akibatnya secara ilmiah',
      langkah: ['merumuskan pertanyaan', 'menentukan variabel', 'mengukur dengan alat tepat', 'membuat tabel/grafik', 'menarik kesimpulan dari data'],
      istilah: ['Variabel', 'Gaya', 'Energi', 'Satuan SI', 'Grafik'],
      kesalahan: 'menarik kesimpulan sebelum data cukup atau mencampur satuan yang berbeda',
      bukti: 'tabel pengukuran, grafik, foto percobaan, dan kesimpulan berbasis data',
    };
  }

  if (text.includes('kimia') || text.includes('atom') || text.includes('larutan') || text.includes('stoikiometri')) {
    return {
      ruang: 'laboratorium kimia yang aman',
      peran: 'pengamat reaksi dan analis bahan',
      alat: 'tabel periodik, gelas ukur, neraca, APD, indikator, dan lembar keselamatan',
      produk: 'penjelasan reaksi atau sifat zat yang disertai data dan prosedur aman',
      studiKasus: 'siswa mengamati perubahan zat, membedakan perubahan fisika-kimia, dan menulis hasilnya dengan simbol yang benar',
      langkah: ['mengenali bahan', 'membaca prosedur keselamatan', 'mengamati sifat awal', 'mencatat perubahan', 'menjelaskan hasil dengan konsep kimia'],
      istilah: ['Atom', 'Molekul', 'Ikatan', 'Larutan', 'Reaksi'],
      kesalahan: 'mencampur bahan tanpa membaca label dan tanpa memahami risiko keselamatan',
      bukti: 'catatan pengamatan, tabel hasil, persamaan sederhana, dan refleksi keselamatan',
    };
  }

  if (text.includes('biologi') || text.includes('ipas') || text.includes('makhluk hidup') || text.includes('sel') || text.includes('jaringan')) {
    return {
      ruang: 'kelas observasi alam dan laboratorium biologi',
      peran: 'pengamat kehidupan yang teliti',
      alat: 'gambar anatomi, mikroskop sederhana, tabel klasifikasi, jurnal pengamatan, dan kamera dokumentasi',
      produk: 'penjelasan hubungan struktur, fungsi, dan lingkungan berdasarkan bukti pengamatan',
      studiKasus: 'siswa mengamati organisme atau fenomena lingkungan, mencatat ciri, lalu menjelaskan keterkaitan antar komponen ekosistem',
      langkah: ['mengamati objek', 'mencatat ciri', 'membandingkan dengan referensi', 'menyusun penjelasan', 'menarik kesimpulan dengan bukti'],
      istilah: ['Sel', 'Organisme', 'Ekosistem', 'Adaptasi', 'Klasifikasi'],
      kesalahan: 'menyimpulkan hanya dari satu contoh tanpa membandingkan ciri dan data pendukung',
      bukti: 'jurnal pengamatan, tabel klasifikasi, gambar berlabel, dan kesimpulan',
    };
  }

  if (text.includes('ekonomi') || text.includes('pasar') || text.includes('kelangkaan')) {
    return {
      ruang: 'kelas sosial ekonomi dan simulasi pasar',
      peran: 'pengambil keputusan ekonomi yang bertanggung jawab',
      alat: 'data harga, tabel kebutuhan, diagram permintaan-penawaran, dan studi kasus',
      produk: 'analisis sederhana tentang pilihan, biaya peluang, dan dampak keputusan ekonomi',
      studiKasus: 'siswa membandingkan kebutuhan dan sumber daya terbatas, lalu memilih keputusan yang paling masuk akal',
      langkah: ['mengidentifikasi kebutuhan', 'mencatat sumber daya', 'membandingkan alternatif', 'menghitung biaya peluang', 'menjelaskan dampaknya'],
      istilah: ['Kelangkaan', 'Biaya Peluang', 'Pasar', 'Permintaan', 'Penawaran'],
      kesalahan: 'mengambil keputusan hanya dari harga tanpa mempertimbangkan kebutuhan, manfaat, dan risiko',
      bukti: 'tabel pilihan, grafik sederhana, alasan keputusan, dan refleksi dampak',
    };
  }

  if (text.includes('geografi') || text.includes('peta') || text.includes('litosfer') || text.includes('atmosfer')) {
    return {
      ruang: 'kelas peta, wilayah, dan lingkungan',
      peran: 'pembaca ruang dan pengamat lingkungan',
      alat: 'peta, atlas, citra sederhana, kompas, data cuaca, dan lembar observasi wilayah',
      produk: 'analisis ruang yang menjelaskan lokasi, pola, hubungan, dan dampak lingkungan',
      studiKasus: 'siswa membaca peta wilayah sekitar, mengenali pola penggunaan lahan, dan menilai risiko lingkungan',
      langkah: ['menentukan lokasi', 'membaca simbol peta', 'mencari pola ruang', 'menghubungkan dengan aktivitas manusia', 'menyusun rekomendasi'],
      istilah: ['Lokasi', 'Skala', 'Interaksi Ruang', 'Mitigasi', 'Wilayah'],
      kesalahan: 'membaca peta tanpa memperhatikan skala, legenda, dan arah mata angin',
      bukti: 'sketsa peta, tabel pengamatan, foto lokasi, dan rekomendasi mitigasi',
    };
  }

  if (text.includes('sosiologi') || text.includes('norma') || text.includes('kelompok sosial')) {
    return {
      ruang: 'kelas diskusi sosial dan observasi masyarakat',
      peran: 'pengamat sosial yang empatik',
      alat: 'catatan observasi, panduan wawancara, diagram hubungan sosial, dan rubrik etika',
      produk: 'penjelasan sosial yang menghargai bukti, konteks, dan keberagaman',
      studiKasus: 'siswa mengamati interaksi di sekolah, menemukan norma yang berlaku, dan menjelaskan mengapa konflik atau kerja sama muncul',
      langkah: ['menentukan fenomena', 'mengamati perilaku', 'mencatat data', 'menghubungkan dengan konsep', 'menulis kesimpulan etis'],
      istilah: ['Norma', 'Nilai', 'Interaksi', 'Konflik', 'Integrasi'],
      kesalahan: 'menghakimi kelompok tanpa data dan tanpa memahami konteks sosial',
      bukti: 'catatan observasi, tabel temuan, kutipan wawancara etis, dan analisis konsep',
    };
  }

  if (text.includes('sejarah') || text.includes('pancasila') || text.includes('kewargaan') || text.includes('ppkn')) {
    return {
      ruang: 'kelas kewargaan, arsip, dan diskusi sejarah',
      peran: 'warga belajar yang kritis dan bertanggung jawab',
      alat: 'sumber sejarah, dokumen, peta waktu, teks Pancasila, dan lembar refleksi warga',
      produk: 'penjelasan yang menghubungkan peristiwa, nilai, hak, kewajiban, dan tindakan nyata',
      studiKasus: 'siswa membahas peristiwa atau masalah warga sekolah, lalu menyusun solusi dengan nilai Pancasila dan bukti sejarah/kewargaan',
      langkah: ['membaca sumber', 'membuat kronologi', 'mengidentifikasi nilai', 'mendiskusikan hak dan kewajiban', 'menyusun aksi nyata'],
      istilah: ['Kronologi', 'Sumber', 'Hak', 'Kewajiban', 'Musyawarah'],
      kesalahan: 'menghafal peristiwa atau sila tanpa menghubungkannya dengan tindakan sehari-hari',
      bukti: 'peta kronologi, kutipan sumber, hasil diskusi, dan rencana aksi warga',
    };
  }

  if (text.includes('pjok') || text.includes('kebugaran') || text.includes('olahraga')) {
    return {
      ruang: 'lapangan, aula, dan ruang refleksi kesehatan',
      peran: 'pelajar aktif yang menjaga kebugaran',
      alat: 'matras, bola, stopwatch, catatan denyut nadi, air minum, dan perlengkapan keselamatan',
      produk: 'rencana aktivitas fisik yang aman, terukur, dan sesuai kemampuan tubuh',
      studiKasus: 'siswa menyusun latihan kebugaran sederhana, memantau respons tubuh, dan mengevaluasi kebiasaan sehatnya',
      langkah: ['pemanasan', 'melakukan gerak inti', 'mengukur intensitas', 'pendinginan', 'mencatat refleksi kebugaran'],
      istilah: ['Pemanasan', 'Intensitas', 'Koordinasi', 'Kebugaran', 'Pemulihan'],
      kesalahan: 'langsung melakukan gerak berat tanpa pemanasan dan tanpa memperhatikan kondisi tubuh',
      bukti: 'log aktivitas, catatan denyut nadi, rubrik gerak, dan refleksi kesehatan',
    };
  }

  if (text.includes('jaringan') || text.includes('wan') || text.includes('server')) {
    return {
      ruang: 'laboratorium jaringan',
      peran: 'teknisi jaringan junior',
      alat: 'router, switch manageable, kabel UTP, laptop admin, dan tester kabel',
      produk: 'topologi jaringan yang terdokumentasi dan bisa diuji konektivitasnya',
      studiKasus: 'sebuah ruang praktik membutuhkan koneksi stabil antar komputer, segmentasi jaringan, dan dokumentasi alamat IP',
      langkah: ['membaca kebutuhan jaringan', 'membuat rancangan topologi', 'mengonfigurasi perangkat', 'menguji koneksi', 'mencatat hasil troubleshooting'],
      istilah: ['Topologi', 'Alamat IP', 'Subnet', 'Gateway', 'Konektivitas'],
      kesalahan: 'mengubah konfigurasi router tanpa backup dan tanpa mencatat alamat IP awal',
      bukti: 'diagram topologi, tabel IP address, hasil ping/traceroute, dan catatan konfigurasi',
    };
  }

  if (text.includes('pemrograman') || text.includes('perangkat lunak') || text.includes('basis data') || text.includes('rpl')) {
    return {
      ruang: 'laboratorium rekayasa perangkat lunak',
      peran: 'programmer junior',
      alat: 'editor kode, Git, DBMS, browser developer tools, dan task board',
      produk: 'fitur aplikasi yang berjalan, terbaca, diuji, dan terdokumentasi',
      studiKasus: 'tim membuat modul aplikasi sederhana yang harus menyimpan data, memvalidasi input, dan menampilkan error yang jelas',
      langkah: ['membaca user story', 'membuat rancangan data', 'menulis kode bertahap', 'menguji kasus normal dan error', 'mencatat perubahan di repository'],
      istilah: ['Algoritma', 'Validasi', 'Database', 'Debugging', 'Refactor'],
      kesalahan: 'menulis kode langsung tanpa memahami kebutuhan dan tanpa menguji input kosong',
      bukti: 'repository, screenshot fitur, catatan bug, dan hasil pengujian',
    };
  }

  if (text.includes('akuntansi') || text.includes('keuangan') || text.includes('pajak')) {
    return {
      ruang: 'unit administrasi keuangan',
      peran: 'staf akuntansi junior',
      alat: 'bukti transaksi, jurnal, buku besar, spreadsheet, dan aplikasi akuntansi',
      produk: 'catatan transaksi dan laporan keuangan yang seimbang serta bisa diaudit',
      studiKasus: 'perusahaan jasa menerima pembayaran dan mengeluarkan biaya operasional yang harus dicatat tanpa selisih saldo',
      langkah: ['mengidentifikasi bukti transaksi', 'menentukan akun debit-kredit', 'mencatat jurnal', 'posting ke buku besar', 'menyusun laporan ringkas'],
      istilah: ['Debit', 'Kredit', 'Jurnal', 'Buku Besar', 'Neraca Saldo'],
      kesalahan: 'mencatat transaksi tanpa bukti pendukung atau membalik posisi debit dan kredit',
      bukti: 'jurnal umum, buku besar, neraca saldo, dan rekonsiliasi sederhana',
    };
  }

  if (text.includes('perkantoran') || text.includes('korespondensi') || text.includes('kearsipan') || text.includes('kepegawaian')) {
    return {
      ruang: 'kantor layanan administrasi',
      peran: 'asisten administrasi',
      alat: 'template surat, agenda digital, arsip elektronik, scanner, dan aplikasi perkantoran',
      produk: 'dokumen administrasi yang rapi, mudah dilacak, dan sesuai tata naskah',
      studiKasus: 'kantor harus mengelola surat masuk, disposisi, dan arsip digital agar dokumen tidak hilang',
      langkah: ['menerima dokumen', 'memeriksa kelengkapan', 'memberi nomor agenda', 'mendistribusikan disposisi', 'mengarsipkan dokumen'],
      istilah: ['Agenda', 'Disposisi', 'Arsip', 'Korespondensi', 'Tata Naskah'],
      kesalahan: 'menyimpan dokumen tanpa nomor agenda dan tanpa metadata pencarian',
      bukti: 'buku agenda, folder arsip digital, lembar disposisi, dan daftar retensi',
    };
  }

  if (text.includes('pemasaran') || text.includes('bisnis') || text.includes('ritel')) {
    return {
      ruang: 'unit pemasaran dan toko online',
      peran: 'staf pemasaran digital',
      alat: 'katalog produk, marketplace, spreadsheet stok, kamera produk, dan dashboard iklan',
      produk: 'kampanye pemasaran yang punya target pasar, pesan promosi, dan metrik evaluasi',
      studiKasus: 'produk baru perlu dipasarkan di kanal daring dengan foto, deskripsi, harga, dan respons pelanggan yang konsisten',
      langkah: ['menganalisis target pelanggan', 'menyusun deskripsi produk', 'menentukan kanal promosi', 'mengunggah konten', 'membaca metrik penjualan'],
      istilah: ['Target Pasar', 'USP', 'Konversi', 'Katalog', 'Promosi'],
      kesalahan: 'membuat promosi tanpa data target pelanggan dan tanpa mengevaluasi hasil',
      bukti: 'brief kampanye, kalender konten, katalog produk, dan laporan metrik',
    };
  }

  if (text.includes('otomotif') || text.includes('kendaraan') || text.includes('sepeda motor')) {
    return {
      ruang: 'bengkel otomotif',
      peran: 'mekanik junior',
      alat: 'tool set, multimeter, scanner diagnostik, dongkrak, dan APD bengkel',
      produk: 'kendaraan yang terdiagnosis, diperbaiki, dan diuji sesuai SOP keselamatan',
      studiKasus: 'kendaraan pelanggan mengalami gejala gangguan performa sehingga perlu pemeriksaan bertahap sebelum komponen diganti',
      langkah: ['menerima keluhan pelanggan', 'memeriksa gejala awal', 'mengukur komponen terkait', 'melakukan perbaikan', 'uji jalan dan dokumentasi'],
      istilah: ['Diagnosis', 'Torsi', 'Kelistrikan', 'Sasis', 'Preventive Maintenance'],
      kesalahan: 'langsung mengganti komponen tanpa pengukuran dan tanpa konfirmasi gejala',
      bukti: 'work order, hasil pengukuran, foto komponen, dan checklist uji fungsi',
    };
  }

  if (text.includes('elektronika') || text.includes('listrik') || text.includes('mikrokontroler')) {
    return {
      ruang: 'laboratorium listrik dan elektronika',
      peran: 'teknisi elektronika/listrik junior',
      alat: 'multimeter, osiloskop, solder, breadboard, panel listrik, dan APD isolasi',
      produk: 'rangkaian atau instalasi yang aman, terukur, dan sesuai diagram kerja',
      studiKasus: 'rangkaian tidak bekerja stabil sehingga siswa harus membaca diagram, mengukur titik uji, dan menemukan penyebabnya',
      langkah: ['membaca diagram', 'memeriksa sumber daya', 'mengukur titik uji', 'memperbaiki sambungan', 'uji keamanan dan fungsi'],
      istilah: ['Tegangan', 'Arus', 'Resistansi', 'Grounding', 'Proteksi'],
      kesalahan: 'mengukur rangkaian bertegangan tanpa APD dan tanpa memahami titik ukur',
      bukti: 'diagram rangkaian, tabel pengukuran, foto wiring, dan hasil uji fungsi',
    };
  }

  if (text.includes('mesin') || text.includes('cnc') || text.includes('pemesinan') || text.includes('pengelasan')) {
    return {
      ruang: 'bengkel teknik mesin',
      peran: 'operator mesin junior',
      alat: 'jangka sorong, mesin bubut/frais, alat las, APD, dan gambar kerja',
      produk: 'benda kerja sesuai ukuran, toleransi, dan standar keselamatan bengkel',
      studiKasus: 'siswa membuat komponen sederhana berdasarkan gambar teknik dengan batas toleransi ukuran',
      langkah: ['membaca gambar kerja', 'menyiapkan alat dan APD', 'mengatur parameter mesin', 'mengerjakan benda kerja', 'mengukur hasil akhir'],
      istilah: ['Toleransi', 'Parameter Mesin', 'Benda Kerja', 'Metrologi', 'Finishing'],
      kesalahan: 'memulai pemesinan tanpa membaca ukuran toleransi dan tanpa mengunci benda kerja',
      bukti: 'gambar kerja, catatan parameter, hasil ukur, dan foto benda kerja',
    };
  }

  if (text.includes('kuliner') || text.includes('boga') || text.includes('pastry') || text.includes('bakery')) {
    return {
      ruang: 'dapur produksi',
      peran: 'commis chef junior',
      alat: 'timbangan digital, pisau, kompor, oven, termometer, dan APD dapur',
      produk: 'produk makanan yang higienis, konsisten rasa, dan sesuai standar porsi',
      studiKasus: 'dapur sekolah menerima pesanan menu sehingga siswa harus membaca resep, menimbang bahan, dan menjaga sanitasi',
      langkah: ['membaca resep standar', 'menimbang bahan', 'menyiapkan alat bersih', 'memasak sesuai urutan', 'plating dan evaluasi rasa'],
      istilah: ['Mise en Place', 'Sanitasi', 'Porsi', 'Suhu Aman', 'Plating'],
      kesalahan: 'mengubah takaran resep tanpa catatan dan mengabaikan suhu aman makanan',
      bukti: 'resep standar, foto produk, checklist sanitasi, dan evaluasi rasa',
    };
  }

  if (text.includes('busana') || text.includes('tekstil') || text.includes('pola')) {
    return {
      ruang: 'studio tata busana',
      peran: 'asisten produksi busana',
      alat: 'meteran, pola, kain, mesin jahit, gunting kain, dan dress form',
      produk: 'produk busana yang sesuai ukuran, rapi jahitan, dan nyaman dipakai',
      studiKasus: 'pelanggan membutuhkan pakaian sederhana dengan ukuran tertentu sehingga pola dan jahitan harus presisi',
      langkah: ['mengukur badan', 'membuat pola', 'memotong kain', 'menjahit bagian utama', 'fitting dan finishing'],
      istilah: ['Pola', 'Kampuh', 'Fitting', 'Tekstil', 'Finishing'],
      kesalahan: 'memotong kain sebelum pola dicek dan tanpa memperhatikan arah serat kain',
      bukti: 'lembar ukuran, pola, foto proses, dan hasil fitting',
    };
  }

  if (text.includes('hotel') || text.includes('housekeeping') || text.includes('front office') || text.includes('pariwisata') || text.includes('ticketing')) {
    return {
      ruang: 'area layanan tamu dan perjalanan',
      peran: 'staf layanan pariwisata/hotel junior',
      alat: 'reservation system, formulir tamu, itinerary, alat kebersihan, dan standar layanan',
      produk: 'layanan tamu yang ramah, akurat, dan sesuai prosedur operasional',
      studiKasus: 'tamu membutuhkan informasi reservasi/perjalanan sehingga siswa harus melayani dengan data yang tepat dan etika komunikasi',
      langkah: ['menyapa tamu', 'menggali kebutuhan', 'memeriksa data layanan', 'memberi solusi', 'mencatat tindak lanjut'],
      istilah: ['Reservasi', 'Itinerary', 'Hospitality', 'Check-in', 'Complaint Handling'],
      kesalahan: 'memberi informasi harga/jadwal tanpa memverifikasi data sumber',
      bukti: 'formulir reservasi, itinerary, log layanan, dan catatan keluhan',
    };
  }

  if (text.includes('farmasi') || text.includes('farmakologi') || text.includes('apotek')) {
    return {
      ruang: 'laboratorium farmasi dan apotek simulasi',
      peran: 'asisten tenaga kefarmasian junior',
      alat: 'resep, etiket, mortir-stamper, timbangan, rak obat, dan APD laboratorium',
      produk: 'layanan obat yang tepat, aman, beretiket jelas, dan terdokumentasi',
      studiKasus: 'pasien membawa resep yang harus dibaca, diverifikasi, disiapkan, dan diberi informasi penggunaan',
      langkah: ['membaca resep', 'memeriksa kelengkapan', 'menyiapkan obat', 'memberi etiket', 'menjelaskan aturan pakai'],
      istilah: ['Resep', 'Dosis', 'Etiket', 'Farmakologi', 'Stok Obat'],
      kesalahan: 'menyerahkan obat tanpa verifikasi resep dan tanpa instruksi penggunaan',
      bukti: 'salinan resep, etiket, kartu stok, dan catatan pelayanan',
    };
  }

  if (text.includes('keperawatan') || text.includes('anatomi') || text.includes('gizi')) {
    return {
      ruang: 'laboratorium keperawatan',
      peran: 'asisten perawat junior',
      alat: 'tensimeter, termometer, sarung tangan, lembar observasi, dan manekin praktik',
      produk: 'tindakan dasar keperawatan yang aman, empatik, dan terdokumentasi',
      studiKasus: 'pasien simulasi membutuhkan pemeriksaan tanda vital dan bantuan kebutuhan dasar sesuai etika layanan',
      langkah: ['mencuci tangan', 'menjelaskan tindakan', 'mengukur tanda vital', 'mencatat hasil', 'melapor jika ada nilai tidak normal'],
      istilah: ['Tanda Vital', 'Asepsis', 'Komunikasi Terapeutik', 'Observasi', 'Dokumentasi'],
      kesalahan: 'melakukan tindakan tanpa informed consent sederhana dan tanpa mencuci tangan',
      bukti: 'lembar observasi, catatan tanda vital, checklist tindakan, dan refleksi etika',
    };
  }

  if (text.includes('agribisnis') || text.includes('tanaman') || text.includes('benih')) {
    return {
      ruang: 'lahan praktik dan rumah tanam',
      peran: 'operator agribisnis junior',
      alat: 'media tanam, benih, alat ukur pH, sprayer, polybag, dan buku pengamatan',
      produk: 'budidaya tanaman yang sehat, terukur, dan terdokumentasi dari persiapan sampai panen',
      studiKasus: 'tanaman menunjukkan pertumbuhan tidak seragam sehingga siswa perlu mengecek media, air, cahaya, dan nutrisi',
      langkah: ['menyiapkan media', 'memilih benih', 'menanam', 'merawat dan mengamati', 'mengevaluasi hasil panen'],
      istilah: ['Media Tanam', 'pH Tanah', 'Benih', 'Nutrisi', 'Panen'],
      kesalahan: 'memberi pupuk tanpa dosis dan tanpa mencatat kondisi tanaman',
      bukti: 'jurnal pengamatan, foto pertumbuhan, data pH, dan catatan perlakuan',
    };
  }

  if (text.includes('broadcast') || text.includes('film') || text.includes('kamera') || text.includes('audio') || text.includes('editing') || text.includes('multimedia') || text.includes('desain')) {
    return {
      ruang: 'studio kreatif produksi media',
      peran: 'kreator media junior',
      alat: 'kamera, tripod, mikrofon, lighting, software editing, dan storyboard',
      produk: 'konten visual/audio yang punya tujuan komunikasi, teknis rapi, dan siap dipublikasikan',
      studiKasus: 'tim diminta membuat video pendek promosi sekolah sehingga ide, naskah, pengambilan gambar, dan editing harus terencana',
      langkah: ['menentukan pesan utama', 'membuat storyboard', 'menyiapkan alat produksi', 'mengambil gambar/audio', 'mengedit dan mereview hasil'],
      istilah: ['Storyboard', 'Komposisi', 'Lighting', 'Continuity', 'Rendering'],
      kesalahan: 'merekam tanpa storyboard dan tanpa memeriksa kualitas audio',
      bukti: 'brief kreatif, storyboard, file proyek, dan video final',
    };
  }

  return {
    ruang: 'laboratorium praktik kejuruan',
    peran: 'siswa praktik SMK',
    alat: 'lembar kerja, alat praktik, bahan ajar, dan APD',
    produk: 'hasil kerja yang sesuai instruksi, aman, dan terdokumentasi',
    studiKasus: 'siswa diminta menyelesaikan tugas praktik sesuai kebutuhan dunia kerja dan standar keselamatan',
    langkah: ['memahami instruksi', 'menyiapkan alat', 'melakukan praktik', 'memeriksa hasil', 'membuat laporan'],
    istilah: ['SOP', 'K3LH', 'Dokumentasi', 'Evaluasi', 'Refleksi'],
    kesalahan: 'memulai praktik tanpa memahami instruksi dan tanpa mencatat hasil',
    bukti: 'lembar kerja, foto hasil, catatan praktik, dan laporan refleksi',
  };
}

function getTopicBlueprint(mapelNama: string, babJudul: string, domain: any) {
  const text = `${mapelNama} ${babJudul}`.toLowerCase();
  const basePractice = [
    `Tuliskan definisi "${babJudul}" dengan bahasamu sendiri.`,
    `Buat satu contoh penerapan "${babJudul}" di rumah, sekolah, atau lingkungan sekitar.`,
    `Sebutkan bukti yang menunjukkan bahwa pemahamanmu sudah benar.`,
  ];

  if (text.includes('ide pokok') || text.includes('struktur teks') || text.includes('paragraf') || text.includes('fakta') || text.includes('opini') || text.includes('tanggapan') || text.includes('bahasa indonesia')) {
    return {
      focus: 'literasi membaca dan menulis',
      coreConcept: `Dalam ${babJudul}, siswa belajar menemukan informasi utama, membedakan informasi pendukung, lalu menyusun jawaban atau tulisan yang runtut.`,
      explanation: 'Ide pokok adalah gagasan yang menjadi pusat pembahasan. Informasi pendukung menjelaskan, memberi contoh, atau memperkuat ide pokok. Saat membaca, siswa perlu bertanya: siapa/apa yang dibahas, apa masalahnya, dan bukti apa yang dipakai penulis.',
      formulaOrRule: 'Aturan kerja: baca judul dan paragraf pertama, tandai kata yang berulang, temukan kalimat utama, cek apakah kalimat lain mendukung gagasan itu, lalu tulis ulang dengan bahasa sendiri.',
      concreteExample: 'Jika teks membahas sampah plastik di sekolah, ide pokoknya bisa berupa pentingnya mengurangi sampah plastik. Kalimat tentang botol minum, kantin, dan tempat sampah adalah rincian pendukung.',
      workedQuestion: 'Bacalah paragraf pendek tentang kantin sehat. Bagaimana cara menentukan ide pokoknya?',
      workedAnswer: 'Cari hal yang paling sering dibahas. Jika semua kalimat membahas makanan bergizi dan kebersihan kantin, ide pokoknya adalah kantin sehat membantu siswa menjaga kesehatan dan kebiasaan makan.',
      practiceQuestions: ['Tentukan ide pokok paragraf dari berita sekolah.', 'Ubah tiga kalimat acak menjadi paragraf yang runtut.', 'Tulis satu tanggapan yang memuat fakta dan pendapat.'],
      summaryPoints: ['Baca teks secara utuh sebelum menjawab.', 'Pisahkan gagasan utama dan rincian.', 'Gunakan bukti dari teks saat menulis tanggapan.'],
    };
  }

  if (text.includes('bahasa inggris') || text.includes('english') || text.includes('vocabulary') || text.includes('sentence') || text.includes('reading')) {
    return {
      focus: 'komunikasi bahasa Inggris sesuai konteks',
      coreConcept: `${babJudul} melatih siswa memahami konteks, memilih kosakata yang tepat, dan menyusun kalimat yang dapat dipahami pembaca atau lawan bicara.`,
      explanation: 'Bahasa Inggris tidak cukup diterjemahkan kata per kata. Siswa perlu mengenali situasi komunikasi, siapa pembicara, tujuan kalimat, dan pola kalimat yang digunakan.',
      formulaOrRule: 'Pola dasar: Subject + Verb + Object/Complement. Untuk teks pendek, tentukan purpose, audience, vocabulary, lalu grammar yang sesuai.',
      concreteExample: 'Kalimat “I am interested in computer networking” cocok untuk perkenalan minat belajar. Kalimat itu punya subjek, kata kerja, dan pelengkap yang jelas.',
      workedQuestion: 'Make a simple sentence to introduce your vocational interest.',
      workedAnswer: 'Example: “I study software engineering because I want to build useful applications.” Kalimat ini jelas karena menyebut jurusan dan alasan.',
      practiceQuestions: ['Write three sentences about your school activity.', 'Find five new words from a short text and write their meanings.', 'Create a short dialogue using greeting and asking information.'],
      summaryPoints: ['Pahami konteks sebelum menerjemahkan.', 'Gunakan pola kalimat sederhana dulu.', 'Latih vocabulary lewat contoh nyata.'],
    };
  }

  if (text.includes('matematika') || text.includes('bilangan') || text.includes('aljabar') || text.includes('fungsi') || text.includes('grafik') || text.includes('geometri') || text.includes('peluang')) {
    return {
      focus: 'pemecahan masalah numerasi',
      coreConcept: `${babJudul} membantu siswa mengubah masalah menjadi model matematika, menghitung dengan langkah jelas, dan memeriksa apakah jawaban masuk akal.`,
      explanation: 'Matematika dimulai dari memahami informasi yang diketahui dan yang ditanyakan. Setelah itu siswa memilih operasi, rumus, tabel, atau grafik yang sesuai. Jawaban perlu disertai satuan dan alasan.',
      formulaOrRule: 'Langkah POLYA: pahami masalah, rencanakan strategi, kerjakan, lalu periksa kembali. Untuk soal persentase: nilai akhir = nilai awal x persentase.',
      concreteExample: 'Harga alat praktik Rp80.000 mendapat diskon 15%. Diskon = 15/100 x 80.000 = 12.000, sehingga harga akhir = 68.000.',
      workedQuestion: 'Sebuah kelas memiliki 32 siswa. 75% siswa mengumpulkan tugas tepat waktu. Berapa siswa yang tepat waktu?',
      workedAnswer: '75% x 32 = 0,75 x 32 = 24. Jadi 24 siswa mengumpulkan tugas tepat waktu.',
      practiceQuestions: ['Buat model matematika dari masalah belanja sederhana.', 'Hitung persentase kenaikan nilai dari 70 ke 84.', 'Jelaskan mengapa satuan penting dalam jawaban matematika.'],
      summaryPoints: ['Baca diketahui dan ditanya.', 'Tulis langkah hitung, bukan hanya hasil.', 'Periksa hasil dengan perkiraan kasar.'],
    };
  }

  if (text.includes('fisika') || text.includes('besaran') || text.includes('gerak') || text.includes('energi') || text.includes('listrik') || text.includes('gelombang') || text.includes('fluida')) {
    return {
      focus: 'fenomena alam yang dapat diukur',
      coreConcept: `${babJudul} mengajarkan hubungan antara besaran, satuan, pengukuran, dan pola perubahan pada gejala fisika.`,
      explanation: 'Fisika menuntut siswa membedakan pengamatan dan kesimpulan. Data diukur dengan alat, ditulis memakai satuan SI, lalu dianalisis melalui tabel, grafik, atau persamaan sederhana.',
      formulaOrRule: 'Contoh aturan: kecepatan = jarak / waktu, energi tidak hilang tetapi berubah bentuk, dan arus listrik perlu rangkaian tertutup.',
      concreteExample: 'Jika siswa berjalan 20 meter dalam 10 detik, kecepatannya 2 m/s. Angka itu hanya bermakna jika jarak dan waktu diukur dengan benar.',
      workedQuestion: 'Sebuah benda menempuh jarak 60 m dalam 12 s. Berapa kecepatannya?',
      workedAnswer: 'v = s/t = 60/12 = 5 m/s. Jadi benda bergerak dengan kecepatan 5 meter per detik.',
      practiceQuestions: ['Ukur waktu tempuh teman berjalan 10 meter lalu hitung kecepatannya.', 'Buat grafik jarak terhadap waktu.', 'Sebutkan dua sumber kesalahan pengukuran.'],
      summaryPoints: ['Selalu tulis satuan.', 'Kesimpulan harus berasal dari data.', 'Grafik membantu melihat pola perubahan.'],
    };
  }

  if (text.includes('kimia') || text.includes('atom') || text.includes('ikatan') || text.includes('larutan') || text.includes('stoikiometri') || text.includes('reaksi')) {
    return {
      focus: 'zat, struktur, dan perubahan materi',
      coreConcept: `${babJudul} membantu siswa memahami partikel penyusun zat, sifat bahan, dan perubahan yang terjadi saat zat bereaksi.`,
      explanation: 'Kimia menjelaskan mengapa suatu zat memiliki sifat tertentu. Siswa perlu membaca simbol, memperhatikan keselamatan, dan membedakan perubahan fisika dengan perubahan kimia.',
      formulaOrRule: 'Aturan dasar: massa zat sebelum dan sesudah reaksi tetap dalam sistem tertutup. Pada larutan, konsentrasi dipahami sebagai banyaknya zat terlarut dalam pelarut.',
      concreteExample: 'Gula larut dalam air adalah perubahan fisika karena zat gulanya masih ada. Kertas terbakar adalah perubahan kimia karena terbentuk zat baru.',
      workedQuestion: 'Mengapa besi berkarat termasuk perubahan kimia?',
      workedAnswer: 'Karena besi bereaksi dengan oksigen dan air membentuk zat baru, yaitu karat, yang sifatnya berbeda dari besi awal.',
      practiceQuestions: ['Klasifikasikan 5 perubahan di rumah menjadi fisika/kimia.', 'Tuliskan alasan keselamatan sebelum mencampur bahan.', 'Jelaskan arti simbol pada tabel periodik sederhana.'],
      summaryPoints: ['Kimia membahas struktur dan perubahan zat.', 'Keselamatan laboratorium harus didahulukan.', 'Perubahan kimia menghasilkan zat baru.'],
    };
  }

  if (text.includes('biologi') || text.includes('ipas') || text.includes('makhluk hidup') || text.includes('sel') || text.includes('ekosistem') || text.includes('genetika')) {
    return {
      focus: 'kehidupan, struktur, fungsi, dan lingkungan',
      coreConcept: `${babJudul} menghubungkan ciri makhluk hidup, fungsi bagian tubuh/sel, dan interaksi dengan lingkungan.`,
      explanation: 'Biologi dipelajari melalui pengamatan. Siswa perlu melihat ciri, membandingkan data, lalu menjelaskan hubungan struktur dan fungsi. Pada ekosistem, perubahan satu komponen dapat memengaruhi komponen lain.',
      formulaOrRule: 'Aturan berpikir: amati ciri, kelompokkan, bandingkan dengan referensi, lalu jelaskan fungsi atau dampaknya.',
      concreteExample: 'Daun lebar membantu tumbuhan menangkap cahaya. Jika cahaya kurang, pertumbuhan dapat melambat karena fotosintesis terganggu.',
      workedQuestion: 'Mengapa tanaman membutuhkan cahaya matahari?',
      workedAnswer: 'Cahaya membantu fotosintesis, yaitu proses tumbuhan membuat makanan. Tanpa cahaya cukup, makanan yang dihasilkan lebih sedikit.',
      practiceQuestions: ['Amati satu tumbuhan dan tulis tiga cirinya.', 'Buat rantai makanan sederhana.', 'Jelaskan hubungan struktur akar dengan fungsi menyerap air.'],
      summaryPoints: ['Pengamatan adalah dasar belajar biologi.', 'Struktur berkaitan dengan fungsi.', 'Lingkungan memengaruhi makhluk hidup.'],
    };
  }

  if (text.includes('ekonomi') || text.includes('kelangkaan') || text.includes('pasar') || text.includes('pendapatan') || text.includes('akuntansi')) {
    return {
      focus: 'keputusan ekonomi berbasis data',
      coreConcept: `${babJudul} menjelaskan bagaimana manusia membuat pilihan saat kebutuhan banyak tetapi sumber daya terbatas.`,
      explanation: 'Ekonomi tidak hanya membahas uang. Ekonomi membahas pilihan, biaya peluang, pasar, produksi, konsumsi, dan dampak keputusan. Siswa perlu membaca data sederhana sebelum menyimpulkan.',
      formulaOrRule: 'Prinsip dasar: setiap pilihan memiliki biaya peluang. Pada pasar, harga dipengaruhi permintaan dan penawaran.',
      concreteExample: 'Jika uang saku dipakai membeli paket data, siswa mungkin menunda membeli alat tulis. Alat tulis yang ditunda adalah biaya peluang.',
      workedQuestion: 'Mengapa harga payung bisa naik saat musim hujan?',
      workedAnswer: 'Permintaan payung naik karena banyak orang membutuhkan. Jika stok terbatas, harga cenderung meningkat.',
      practiceQuestions: ['Tulis dua kebutuhan dan dua keinginanmu.', 'Buat contoh biaya peluang di sekolah.', 'Jelaskan hubungan permintaan dan harga dengan contoh.'],
      summaryPoints: ['Kelangkaan memaksa manusia memilih.', 'Pilihan punya biaya peluang.', 'Harga pasar dipengaruhi permintaan dan penawaran.'],
    };
  }

  if (text.includes('geografi') || text.includes('peta') || text.includes('litosfer') || text.includes('atmosfer') || text.includes('wilayah')) {
    return {
      focus: 'ruang, lokasi, dan hubungan manusia-lingkungan',
      coreConcept: `${babJudul} mengajarkan cara membaca ruang: lokasi, jarak, pola, persebaran, dan hubungan antara alam serta aktivitas manusia.`,
      explanation: 'Geografi membantu siswa memahami mengapa suatu fenomena terjadi di tempat tertentu. Peta, skala, legenda, arah mata angin, dan data wilayah menjadi alat utama.',
      formulaOrRule: 'Aturan peta: pahami judul, legenda, skala, orientasi, sumber data, lalu baca pola sebaran.',
      concreteExample: 'Daerah dekat sungai cocok untuk permukiman dan pertanian, tetapi juga perlu mitigasi banjir.',
      workedQuestion: 'Apa fungsi legenda pada peta?',
      workedAnswer: 'Legenda menjelaskan arti simbol dan warna pada peta sehingga pembaca tidak salah memahami informasi wilayah.',
      practiceQuestions: ['Baca peta sekolah dan tandai tiga lokasi penting.', 'Jelaskan risiko lingkungan di sekitar rumah.', 'Buat rekomendasi mitigasi sederhana.'],
      summaryPoints: ['Peta harus dibaca bersama legenda dan skala.', 'Lokasi memengaruhi aktivitas manusia.', 'Mitigasi membantu mengurangi risiko bencana.'],
    };
  }

  if (text.includes('sosiologi') || text.includes('norma') || text.includes('kelompok') || text.includes('interaksi') || text.includes('konflik')) {
    return {
      focus: 'hubungan sosial dan perilaku masyarakat',
      coreConcept: `${babJudul} membantu siswa memahami bagaimana individu, kelompok, nilai, norma, konflik, dan kerja sama membentuk kehidupan sosial.`,
      explanation: 'Sosiologi mengajak siswa melihat masalah sosial dengan bukti, bukan prasangka. Pengamatan harus etis: tidak merendahkan orang, menjaga privasi, dan membedakan fakta dari penilaian pribadi.',
      formulaOrRule: 'Langkah analisis sosial: amati fenomena, catat fakta, hubungkan dengan konsep, cari penyebab, lalu usulkan solusi yang adil.',
      concreteExample: 'Aturan antre di kantin adalah norma. Jika norma dilanggar, muncul konflik kecil karena siswa lain merasa tidak adil.',
      workedQuestion: 'Mengapa norma dibutuhkan di sekolah?',
      workedAnswer: 'Norma memberi pedoman perilaku agar warga sekolah merasa aman, tertib, dan diperlakukan adil.',
      practiceQuestions: ['Amati satu norma di kelas dan jelaskan fungsinya.', 'Bedakan konflik dan kerja sama dengan contoh.', 'Tulis solusi untuk masalah keterlambatan kelas.'],
      summaryPoints: ['Fenomena sosial perlu bukti.', 'Norma menjaga keteraturan.', 'Solusi sosial harus mempertimbangkan banyak pihak.'],
    };
  }

  if (text.includes('pancasila') || text.includes('kewargaan') || text.includes('ppkn') || text.includes('sejarah')) {
    return {
      focus: 'nilai, peristiwa, dan tanggung jawab warga',
      coreConcept: `${babJudul} menghubungkan nilai Pancasila, hak-kewajiban, kronologi peristiwa, dan tindakan nyata sebagai warga sekolah/masyarakat.`,
      explanation: 'Belajar Pancasila dan sejarah bukan sekadar menghafal. Siswa perlu memahami sebab-akibat, nilai yang muncul, dan bagaimana nilai itu dipraktikkan dalam keputusan sehari-hari.',
      formulaOrRule: 'Cara membaca peristiwa: susun kronologi, cari sebab, lihat dampak, hubungkan dengan nilai, lalu buat sikap yang bertanggung jawab.',
      concreteExample: 'Musyawarah kelas untuk menentukan jadwal piket menunjukkan nilai kerakyatan dan tanggung jawab bersama.',
      workedQuestion: 'Apa hubungan hak dan kewajiban dalam kehidupan sekolah?',
      workedAnswer: 'Hak memberi kesempatan memperoleh layanan dan rasa aman, sedangkan kewajiban menjaga agar hak orang lain juga terpenuhi.',
      practiceQuestions: ['Buat contoh penerapan satu sila Pancasila di kelas.', 'Susun kronologi satu peristiwa sejarah lokal.', 'Tulis solusi musyawarah untuk masalah kelas.'],
      summaryPoints: ['Nilai perlu dipraktikkan, bukan hanya dihafal.', 'Kronologi membantu memahami sebab-akibat.', 'Hak dan kewajiban harus seimbang.'],
    };
  }

  if (text.includes('jaringan') || text.includes('router') || text.includes('switch') || text.includes('wan') || text.includes('server')) {
    return {
      focus: 'konektivitas dan keamanan jaringan',
      coreConcept: `${babJudul} menjelaskan bagaimana perangkat jaringan saling terhubung, mengirim data, dan menjaga akses tetap aman serta stabil.`,
      explanation: 'Jaringan komputer dibangun dari perangkat seperti switch, router, access point, kabel, dan server. Setiap perangkat punya fungsi berbeda. Siswa perlu membaca topologi sebelum mengubah konfigurasi.',
      formulaOrRule: 'Aturan troubleshooting: cek fisik, cek IP, cek gateway, uji ping, baca log, lalu dokumentasikan perubahan.',
      concreteExample: 'Jika komputer tidak bisa internet tetapi bisa ping gateway, masalah mungkin ada di DNS atau jalur keluar router, bukan kabel LAN.',
      workedQuestion: 'Apa perbedaan fungsi switch dan router?',
      workedAnswer: 'Switch menghubungkan perangkat dalam jaringan lokal, sedangkan router menghubungkan jaringan berbeda dan mengarahkan paket ke tujuan berikutnya.',
      practiceQuestions: ['Buat tabel IP untuk 5 perangkat.', 'Gambar topologi jaringan lab sederhana.', 'Jelaskan urutan cek saat koneksi putus.'],
      summaryPoints: ['Topologi harus dipahami sebelum konfigurasi.', 'Switch dan router punya fungsi berbeda.', 'Dokumentasi mencegah salah konfigurasi berulang.'],
    };
  }

  if (text.includes('pemrograman') || text.includes('perangkat lunak') || text.includes('basis data') || text.includes('web') || text.includes('rpl')) {
    return {
      focus: 'logika program dan produk perangkat lunak',
      coreConcept: `${babJudul} mengajarkan cara mengubah kebutuhan pengguna menjadi algoritma, kode, validasi, penyimpanan data, dan pengujian.`,
      explanation: 'Pemrograman bukan hanya mengetik kode. Siswa harus memahami masalah, menentukan input-output, menulis langkah logis, lalu menguji kasus normal dan kasus error.',
      formulaOrRule: 'Alur kerja: requirement -> desain data -> algoritma -> implementasi -> testing -> perbaikan.',
      concreteExample: 'Pada fitur login, program harus menerima email dan password, memvalidasi input kosong, mengecek data server, lalu menampilkan pesan error yang jelas jika gagal.',
      workedQuestion: 'Mengapa validasi input penting?',
      workedAnswer: 'Validasi mencegah data kosong/salah masuk ke sistem, mengurangi bug, dan membantu pengguna memperbaiki kesalahan.',
      practiceQuestions: ['Tulis algoritma menghitung total belanja.', 'Buat contoh validasi input nama.', 'Jelaskan satu test case normal dan satu test case error.'],
      summaryPoints: ['Kode harus berangkat dari kebutuhan.', 'Validasi dan testing wajib dilakukan.', 'Dokumentasi membantu tim memahami perubahan.'],
    };
  }

  return {
    focus: domain.peran,
    coreConcept: `${babJudul} berfokus pada penerapan konsep ${mapelNama} dalam situasi nyata yang membutuhkan langkah kerja terukur dan bukti hasil.`,
    explanation: `Siswa perlu memahami konsep, alat, prosedur, risiko, dan kriteria keberhasilan. Pada konteks ini, ${domain.peran} harus mampu bekerja runtut di ${domain.ruang} agar menghasilkan ${domain.produk}.`,
    formulaOrRule: `Aturan kerja: ${domain.langkah.join(' -> ')}. Setiap langkah harus dicatat agar proses dapat diperiksa ulang.`,
    concreteExample: domain.studiKasus,
    workedQuestion: `Apa langkah pertama saat menghadapi kasus "${domain.studiKasus}"?`,
    workedAnswer: `Langkah pertama adalah memahami instruksi dan kondisi awal. Setelah itu siswa menyiapkan alat yang tepat, yaitu ${domain.alat}, lalu mengikuti SOP.`,
    practiceQuestions: basePractice,
    summaryPoints: [`Pahami tujuan ${babJudul}.`, `Ikuti urutan kerja dan keselamatan.`, `Kumpulkan bukti berupa ${domain.bukti}.`],
  };
}

function buildTheoryContent(jurusan: any, mapel: any, kelas: number, bab: number, babJudul: string) {
  const domain = getDomainProfile(jurusan.kode, mapel.nama);
  const references = getLearningReferences(mapel.nama);
  const topic = getTopicBlueprint(mapel.nama, babJudul, domain);
  return `# ${babJudul}

## Identitas Materi
- Jurusan: ${jurusan.nama}
- Mata pelajaran: ${mapel.nama}
- Kelas/Semester: ${kelas}/${mapel.semester}
- Fokus belajar: ${topic.focus}
- Lingkungan/konteks: ${domain.ruang}

## Tujuan Belajar
Setelah mempelajari materi ini, siswa mampu:
1. Menjelaskan konsep utama "${babJudul}" dengan bahasa sendiri.
2. Menggunakan konsep tersebut untuk membaca kasus atau soal yang sesuai mata pelajaran ${mapel.nama}.
3. Menyelesaikan contoh soal dengan langkah yang bisa diperiksa.
4. Membuat rangkuman dan bukti belajar berupa ${domain.bukti}.

## Konsep Inti
${topic.coreConcept}

${topic.explanation}

### Rumus/Aturan/Konsep Utama
${topic.formulaOrRule}

Istilah penting pada bab ini:
${domain.istilah.map((term: string) => `- **${term}**: hubungkan istilah ini dengan contoh pada "${babJudul}" agar tidak hanya dihafal.`).join('\n')}

## Penjelasan Bertahap
1. **Baca masalah/topik**: pahami kata kunci pada "${babJudul}" dan kaitannya dengan ${mapel.nama}.
2. **Tentukan konsep**: pilih konsep yang paling cocok, misalnya ${domain.istilah.slice(0, 2).join(' dan ')}.
3. **Gunakan contoh**: cocokkan konsep dengan contoh nyata agar materi tidak terasa abstrak.
4. **Buat alasan**: jelaskan mengapa jawaban atau langkahmu benar.
5. **Periksa ulang**: bandingkan jawaban dengan data, aturan, atau kriteria keberhasilan.

## Contoh Konkret
${topic.concreteExample}

## Contoh Soal dan Pembahasan
**Soal:** ${topic.workedQuestion}

**Pembahasan:** ${topic.workedAnswer}

## Cara Menganalisis Kasus
1. Tuliskan fakta yang tersedia tanpa menambah cerita baru.
2. Tandai kata kunci yang berkaitan dengan konsep bab.
3. Hubungkan fakta dengan istilah penting, bukan sekadar menebak jawaban.
4. Pilih langkah kerja paling aman dan paling mudah diperiksa ulang.
5. Buat kesimpulan singkat yang menyebutkan alasan dan bukti.

## Langkah Kerja Terarah
${domain.langkah.map((step: string, index: number) => `${index + 1}. **${step.charAt(0).toUpperCase() + step.slice(1)}**: lakukan dengan mencatat kondisi awal, data yang dipakai, dan hasil pemeriksaan.`).join('\n')}

## Kesalahan Umum Yang Harus Dihindari
Kesalahan yang sering terjadi adalah ${domain.kesalahan}. Kesalahan ini berbahaya karena membuat hasil praktik sulit diaudit dan menyulitkan proses perbaikan jika terjadi masalah.

## Latihan Pemahaman
${topic.practiceQuestions.map((question: string, index: number) => `${index + 1}. ${question}`).join('\n')}

## Rangkuman
${topic.summaryPoints.map((point: string) => `- ${point}`).join('\n')}

## Checklist Pemahaman
- Saya bisa menjelaskan konsep "${babJudul}" tanpa membaca catatan.
- Saya bisa memberi contoh konkret yang sesuai topik.
- Saya bisa mengerjakan contoh soal dan menjelaskan pembahasannya.
- Saya bisa menyebutkan satu kesalahan umum dan cara menghindarinya.
- Saya bisa membuat rangkuman singkat dari materi ini.

## Referensi Belajar
Materi ini disusun ulang dengan bahasa aplikasi dan merujuk pada sumber belajar berikut:
${references.map((reference: any) => `- [${reference.title}](${reference.url})`).join('\n')}`;
}

function buildVideoPayload(jurusan: any, mapel: any, kelas: number, bab: number, babJudul: string) {
  const domain = getDomainProfile(jurusan.kode, mapel.nama);
  const references = getLearningReferences(mapel.nama);
  const topic = getTopicBlueprint(mapel.nama, babJudul, domain);
  const youtubeUrl = buildYoutubeSearchUrl(`${mapel.nama} ${babJudul} ${jurusan.nama}`);
  return {
    title: `Video Panduan: ${babJudul}`,
    description: `Panduan belajar untuk ${mapel.nama} kelas ${kelas}. Link YouTube dibuat dari judul topik dan mata pelajaran agar siswa membuka referensi yang relevan, bukan tombol video kosong.`,
    status: 'youtube_search_reference',
    embedUrl: '',
    externalUrl: youtubeUrl,
    youtubeUrl,
    youtubeVideoId: null,
    thumbnailUrl: null,
    sourceVerified: false,
    lastCheckedAt: '2026-05-28',
    durationMinutes: 12 + bab,
    category: mapel.nama,
    transcript: [
      `Pembukaan: fokus belajar hari ini adalah ${topic.focus} pada topik "${babJudul}".`,
      `Konsep inti: ${topic.coreConcept}`,
      `Contoh konkret: ${topic.concreteExample}`,
      `Contoh soal: ${topic.workedQuestion}`,
      `Pembahasan: ${topic.workedAnswer}`,
      `Latihan mandiri: ${topic.practiceQuestions[0]}`,
      `Refleksi: hindari kesalahan utama, yaitu ${domain.kesalahan}.`,
      `Bukti akhir: kumpulkan rangkuman, jawaban latihan, dan ${domain.bukti}.`,
    ],
    references,
    unavailableReason: 'Embed video internal dan video YouTube spesifik belum diverifikasi. Tombol referensi membuka pencarian YouTube sesuai topik materi; guru dapat menggantinya dengan URL video resmi sekolah setelah dicek manual.',
  };
}

function buildModulePayload(jurusan: any, mapel: any, kelas: number, bab: number, babJudul: string) {
  const domain = getDomainProfile(jurusan.kode, mapel.nama);
  const references = getLearningReferences(mapel.nama);
  const topic = getTopicBlueprint(mapel.nama, babJudul, domain);
  return {
    title: `Modul Belajar: ${babJudul}`,
    description: `Modul lengkap ${mapel.nama} untuk memahami "${babJudul}" melalui konsep, materi utama, contoh soal, pembahasan, latihan, dan rangkuman.`,
    pdfUrl: '',
    identity: {
      jurusan: jurusan.nama,
      mapel: mapel.nama,
      kelas,
      semester: mapel.semester,
      topik: babJudul,
      kategori: String(mapel.kode).startsWith('UMUM-') ? 'Pelajaran Umum SMK' : jurusan.kode.startsWith('SMA') ? jurusan.bidang : jurusan.bidang,
    },
    objectives: [
      `Menjelaskan konsep "${babJudul}" dengan bahasa sendiri.`,
      `Menerapkan aturan/rumus/konsep utama: ${topic.formulaOrRule}`,
      `Mengerjakan contoh soal dan latihan terkait ${mapel.nama}.`,
      `Menghasilkan bukti belajar berupa rangkuman, jawaban latihan, dan ${domain.bukti}.`,
    ],
    keyConcepts: [topic.coreConcept, topic.formulaOrRule, ...domain.istilah],
    completeMaterial: `${topic.explanation}\n\n${topic.concreteExample}\n\nGunakan urutan belajar berikut: ${domain.langkah.join(' -> ')}. Setelah itu cocokkan jawabanmu dengan konsep inti dan rangkuman.`,
    workedExample: {
      question: topic.workedQuestion,
      answer: topic.workedAnswer,
    },
    chapters: [
      {
        title: 'Bagian 1 - Identitas dan Tujuan',
        summary: `Mengenali topik "${babJudul}", mata pelajaran ${mapel.nama}, kelas ${kelas}, dan tujuan yang harus dicapai siswa.`,
        topics: ['Identitas materi', 'Tujuan pembelajaran', 'Kriteria pemahaman'],
      },
      {
        title: 'Bagian 2 - Konsep Inti dan Materi Lengkap',
        summary: topic.coreConcept,
        topics: ['Konsep inti', 'Penjelasan bertahap', 'Contoh penerapan', 'Istilah penting'],
      },
      {
        title: 'Bagian 3 - Contoh Soal, Latihan, dan Refleksi',
        summary: `Mengerjakan contoh soal, memahami pembahasan, menjawab latihan, dan menghindari kesalahan seperti ${domain.kesalahan}.`,
        topics: ['Contoh soal', 'Pembahasan', 'Latihan/evaluasi', 'Checklist pemahaman'],
      },
    ],
    examples: [
      topic.concreteExample,
      `Contoh soal: ${topic.workedQuestion}`,
      `Pembahasan: ${topic.workedAnswer}`,
    ],
    evaluation: topic.practiceQuestions,
    summary: topic.summaryPoints.join(' '),
    checklist: [
      `Saya bisa menjelaskan "${babJudul}" dengan bahasa sendiri.`,
      'Saya bisa memberi contoh konkret yang sesuai topik.',
      'Saya bisa mengerjakan contoh soal dan memahami pembahasannya.',
      'Saya bisa menyebutkan referensi belajar yang digunakan.',
    ],
    topics: [
      'Identitas materi dan tujuan pembelajaran',
      topic.focus,
      ...domain.istilah,
      'Contoh soal dan pembahasan',
      'Latihan/evaluasi dan checklist pemahaman',
    ],
    references,
    content: `File PDF modul belum tersedia, tetapi isi modul lengkap dapat dibaca di halaman ini. Modul "${babJudul}" berisi identitas materi, tujuan, konsep inti, materi lengkap, contoh penerapan, contoh soal dan pembahasan, latihan/evaluasi, rangkuman, checklist, dan referensi.`,
    unavailableReason: 'File PDF modul belum tersedia. Isi modul lengkap tetap ditampilkan agar tidak ada tombol download palsu.',
  };
}

function buildSummaryContent(jurusan: any, mapel: any, kelas: number, bab: number, babJudul: string) {
  const domain = getDomainProfile(jurusan.kode, mapel.nama);
  const references = getLearningReferences(mapel.nama);
  const topic = getTopicBlueprint(mapel.nama, babJudul, domain);
  return `## Ringkasan ${babJudul}

### Identitas Materi
- Jenjang/Jurusan: ${jurusan.nama}
- Mata Pelajaran: ${mapel.nama}
- Kelas/Semester: ${kelas}/${mapel.semester}
- Topik: ${babJudul}

### Poin Penting
${topic.summaryPoints.map((point: string) => `- ${point}`).join('\n')}

### Rumus/Konsep Utama
${topic.formulaOrRule}

### Contoh Singkat
${topic.concreteExample}

### Contoh Soal dan Pembahasan
**Soal:** ${topic.workedQuestion}

**Pembahasan:** ${topic.workedAnswer}

### Rangkuman
${topic.summaryPoints.join(' ')} Hindari kesalahan utama: ${domain.kesalahan}.

### Glosarium
| Istilah | Makna Pembelajaran |
|---|---|
${domain.istilah.map((term: string) => `| ${term} | Istilah penting pada ${mapel.nama} yang harus dijelaskan dengan contoh kerja nyata. |`).join('\n')}

### Pertanyaan Refleksi
${topic.practiceQuestions.map((question: string, index: number) => `${index + 1}. ${question}`).join('\n')}

### Referensi Belajar
${references.map((reference: any) => `- [${reference.title}](${reference.url})`).join('\n')}`;
}

function buildQuestions(jurusan: any, mapel: any, kelas: number, bab: number, babJudul: string, startIndex: number) {
  const domain = getDomainProfile(jurusan.kode, mapel.nama);
  return [
    {
      id: `soal-${startIndex}`,
      pertanyaan: `Dalam materi "${babJudul}", siswa berperan sebagai ${domain.peran}. Apa langkah pertama yang paling tepat sebelum praktik dimulai?`,
      tipe: 'pilihan_ganda',
      pilihan: [
        'A. Membaca kebutuhan kerja, instruksi, dan risiko keselamatan terlebih dahulu',
        'B. Langsung mengerjakan bagian yang terlihat paling mudah',
        'C. Mengganti alat kerja sesuai kebiasaan pribadi',
        'D. Menunggu teman menyelesaikan pemeriksaan awal',
        'E. Mengabaikan catatan kondisi awal agar pekerjaan lebih cepat',
      ],
      jawabanBenar: 'A',
      pembahasan: `Langkah awal harus memahami instruksi dan risiko. Pada kasus ${domain.ruang}, keputusan teknis harus berdasarkan kebutuhan, bukan tebakan.`,
      tingkat: 'mudah',
    },
    {
      id: `soal-${startIndex + 1}`,
      pertanyaan: `Bukti kerja apa yang paling relevan untuk menunjukkan bahwa praktik "${babJudul}" sudah dilakukan dengan benar?`,
      tipe: 'pilihan_ganda',
      pilihan: [
        `A. ${domain.bukti}`,
        'B. Cerita lisan tanpa catatan hasil',
        'C. Foto acak yang tidak menunjukkan proses kerja',
        'D. Nilai akhir tanpa pembahasan proses',
        'E. Perkiraan teman satu kelompok',
      ],
      jawabanBenar: 'A',
      pembahasan: `Bukti kerja harus bisa diperiksa ulang. Karena itu ${domain.bukti} lebih kuat dibanding klaim lisan.`,
      tingkat: 'sedang',
    },
    {
      id: `soal-${startIndex + 2}`,
      pertanyaan: `Kesalahan "${domain.kesalahan}" berbahaya terutama karena...`,
      tipe: 'pilihan_ganda',
      pilihan: [
        'A. membuat proses sulit diaudit dan dapat memperbesar risiko kerusakan/keselamatan',
        'B. membuat laporan terlihat terlalu panjang',
        'C. membuat siswa terlalu cepat memahami materi',
        'D. mengurangi kebutuhan dokumentasi formal',
        'E. selalu menghasilkan nilai praktik lebih tinggi',
      ],
      jawabanBenar: 'A',
      pembahasan: 'Kesalahan prosedural membuat akar masalah sulit dilacak dan bisa menimbulkan risiko baru.',
      tingkat: 'sukar',
    },
    {
      id: `soal-${startIndex + 3}`,
      pertanyaan: `Benar atau salah: Pada "${babJudul}", siswa perlu mencatat kondisi awal dan hasil akhir agar proses kerja bisa dievaluasi.`,
      tipe: 'benar_salah',
      pilihan: null,
      jawabanBenar: 'Benar',
      pembahasan: 'Benar. Catatan kondisi awal dan hasil akhir membantu guru menilai proses, bukan hanya produk akhir.',
      tingkat: 'sedang',
    },
    {
      id: `soal-${startIndex + 4}`,
      pertanyaan: `Jelaskan urutan kerja aman untuk menyelesaikan studi kasus berikut: ${domain.studiKasus}.`,
      tipe: 'essay',
      pilihan: null,
      jawabanBenar: `Jawaban harus memuat urutan: ${domain.langkah.join(', ')}, penggunaan alat ${domain.alat}, dan bukti kerja ${domain.bukti}.`,
      pembahasan: `Jawaban essay dinilai dari kelengkapan prosedur, alasan teknis, keselamatan kerja, dan bukti hasil. Urutan yang disarankan adalah ${domain.langkah.join(' -> ')}.`,
      tingkat: 'sukar',
    },
  ];
}

function findJsonSubject(smaData: any[], smkData: any[], schoolType: string, grade: number, pathway: string, mapelNama: string) {
  const jsonCurriculum = schoolType === 'sma' ? smaData : smkData;
  return jsonCurriculum.find((sub: any) => {
    if (sub.grade !== grade) return false;
    if (schoolType === 'smk') {
      const subPathway = sub.pathway || 'Umum';
      const targetPathway = pathway === 'MPLB' ? 'OTKP' : pathway;
      if (subPathway.toUpperCase() !== targetPathway.toUpperCase()) return false;
    }
    // Check name similarity
    const normMapel = mapelNama.toLowerCase();
    const normSub = sub.title.toLowerCase();
    
    // Keyword matching
    if (normMapel.includes('pemrograman') && normSub.includes('pemrograman')) return true;
    if (normMapel.includes('jaringan') && normSub.includes('jaringan')) return true;
    if (normMapel.includes('akuntansi') && normSub.includes('akuntansi')) return true;
    if ((normMapel.includes('perkantoran') || normMapel.includes('kepegawaian') || normMapel.includes('kearsipan') || normMapel.includes('korespondensi')) && 
        (normSub.includes('perkantoran') || normSub.includes('kepegawaian') || normSub.includes('kearsipan') || normSub.includes('tata ruang'))) return true;
    if ((normMapel.includes('pemasaran') || normMapel.includes('bisnis online') || normMapel.includes('strategi pemasaran') || normMapel.includes('social media')) && 
        (normSub.includes('pemasaran') || normSub.includes('bisnis online') || normSub.includes('social media'))) return true;
    if ((normMapel.includes('desain grafis') || normMapel.includes('animasi') || normMapel.includes('multimedia') || normMapel.includes('media interaktif')) && 
        (normSub.includes('desain grafis') || normSub.includes('animasi') || normSub.includes('multimedia') || normSub.includes('vektor'))) return true;
    
    // General track (SMA) matching
    if (schoolType === 'sma') {
      if (normMapel.includes('matematika') && normSub.includes('matematika')) return true;
      if (normMapel.includes('fisika') && normSub.includes('fisika')) return true;
      if (normMapel.includes('bahasa indonesia') && normSub.includes('bahasa indonesia')) return true;
      if (normMapel.includes('informatika') && normSub.includes('informatika')) return true;
    }
    
    return false;
  });
}

async function main() {
  const smaData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/content/curriculum/sma.json'), 'utf-8'));
  const smkData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/content/curriculum/smk.json'), 'utf-8'));

  console.log('🌱 Menghapus data lama (Clean Seeding)...');
  await prisma.hasilUjian.deleteMany();
  await prisma.userJurusan.deleteMany();
  await prisma.bankSoal.deleteMany();
  await prisma.materi.deleteMany();
  await prisma.bab.deleteMany();
  await prisma.mataPelajaran.deleteMany();
  await prisma.jurusan.deleteMany();

  console.log('🌱 Mempersiapkan data baru di memori...');

  const jurusansDb: any[] = [];
  const mapelsDb: any[] = [];
  const babsDb: any[] = [];
  const materisDb: any[] = [];
  const bankSoalsDb: any[] = [];

  let mapelCounter = 1;
  let babCounter = 1;
  let materiCounter = 1;
  let soalCounter = 1;

  for (const j of JURUSAN_DATA) {
    const jId = `j-${j.kode.toLowerCase()}`;
    jurusansDb.push({
      id: jId,
      kode: j.kode,
      nama: j.nama,
      bidang: j.bidang,
      deskripsi: `Program keahlian ${j.nama} di bidang ${j.bidang} mencetak lulusan kompeten siap kerja dan wirausaha.`,
      icon: j.icon,
      warna: j.warna,
      popular: j.popular,
    });

    for (const [kelasStr] of Object.entries(j.mapel)) {
      const kelas = parseInt(kelasStr);
      const mapelList = getMapelList(j, kelas);
      for (const mapel of mapelList) {
        const mpId = `mp-${mapelCounter++}`;
        const isCommon = String(mapel.kode).startsWith('UMUM-');
        const isGeneralTrack = !JURUSAN_CATALOG.some((item) => item.kode === j.kode);
        mapelsDb.push({
          id: mpId,
          jurusanId: jId,
          kode: mapel.kode,
          nama: mapel.nama,
          kelas,
          semester: mapel.semester,
          deskripsi: `${isGeneralTrack ? j.bidang : isCommon ? 'Pelajaran umum SMK' : 'Mata pelajaran kompetensi keahlian'} ${mapel.kode} untuk siswa kelas ${kelas} semester ${mapel.semester}.`
        });

        const schoolType = j.kode.startsWith('SMA') ? 'sma' : (JURUSAN_CATALOG.some(jc => jc.kode === j.kode) ? 'smk' : 'other');
        const matchedSubject = schoolType !== 'other' 
          ? findJsonSubject(smaData, smkData, schoolType, kelas, j.kode, mapel.nama)
          : null;

        if (matchedSubject) {
          let b = 1;
          for (const mod of matchedSubject.modules) {
            const babId = `bab-${babCounter++}`;
            const estimasi = [45, 60, 90, 60, 75][b - 1] || 60;
            babsDb.push({
              id: babId,
              mataPelajaranId: mpId,
              nomor: b,
              judul: `Bab ${b}: ${mod.title}`,
              deskripsi: `Mempelajari ${mod.title} berdasarkan alur Kurikulum Merdeka kelas ${kelas} dengan penjelasan, contoh, dan latihan.`,
              estimasiMenit: estimasi
            });

            const lessons = mod.lessons && mod.lessons.length > 0 ? mod.lessons : [{
              title: mod.title,
              explanation: `Materi mendalam tentang ${mod.title}.`,
              visualExample: `Contoh terapan untuk ${mod.title}.`,
              summary: `Ringkasan konsep inti dari ${mod.title}.`,
              quizzes: []
            }];

            let lessonIndex = 0;
            for (const lesson of lessons) {
              const teksKonten = `# ${lesson.title}

## Identitas Materi
- Jurusan/Jenjang: ${j.nama}
- Mata pelajaran: ${mapel.nama}
- Kelas/Semester: ${kelas}/${mapel.semester}
- Fokus belajar: ${lesson.title}

## Capaian Pembelajaran & Tujuan
Setelah mempelajari modul ini, siswa diharapkan memiliki kompetensi:
1. Menjelaskan konsep utama "${lesson.title}" dengan bahasa sendiri.
2. Menggunakan konsep tersebut untuk membaca kasus atau soal yang sesuai mata pelajaran ${mapel.nama}.
3. Menyelesaikan contoh soal dengan langkah yang bisa diperiksa.

## Konsep Inti
${lesson.explanation || `Konsep dasar mengenai ${lesson.title}.`}

## Contoh Konkret
${lesson.visualExample || `Penerapan praktis ${lesson.title} dalam kehidupan sehari-hari.`}

## Contoh Soal dan Pembahasan
**Soal:** ${lesson.quizzes && lesson.quizzes[0] ? lesson.quizzes[0].question : `Bagaimana penerapan ${lesson.title}?`}

**Pembahasan:** ${lesson.quizzes && lesson.quizzes[0] ? lesson.quizzes[0].explanation : `Penerapan ${lesson.title} harus mengikuti langkah-langkah terstruktur dan logis.`}

## Rangkuman
${lesson.summary || `1. Topik ${lesson.title} membahas konsep secara komprehensif.\n2. Latihan soal membantu memperkuat pemahaman.`}

## Referensi Belajar
Materi ini disusun ulang dengan bahasa aplikasi dan merujuk pada sumber belajar berikut:
- [Kurikulum Merdeka Vokasi](https://kurikulum.kemdikbud.go.id/)
- [Web Belajar Center](https://github.com/javasrajagula/javas-web-belajar)
`;

              const videoTranscript = (lesson.podcastScript || []).map((line: any) => `${line.role}: ${line.text}`);
              if (videoTranscript.length < 4) {
                videoTranscript.push(
                  `Pembukaan: fokus belajar hari ini adalah pada topik "${lesson.title}".`,
                  `Konsep inti: ${lesson.summary || lesson.title}`,
                  `Latihan mandiri: mari kerjakan kuis dan pahami pembahasannya.`,
                  `Penutup: terapkan selalu SOP dan K3LH dalam setiap praktikum.`
                );
              }
              const finalTranscript = videoTranscript.slice(0, 8);
              while (finalTranscript.length < 4) {
                finalTranscript.push('Langkah tambahan: pelajari contoh soal.');
              }
              const youtubeQuery = encodeURIComponent(`${mapel.nama} ${lesson.title}`);
              
              const videoPayload = {
                title: `Video Panduan: ${lesson.title}`,
                description: `Panduan belajar untuk ${mapel.nama} kelas ${kelas} mengenai ${lesson.title}.`,
                status: 'youtube_search_reference',
                embedUrl: '',
                externalUrl: `https://www.youtube.com/results?search_query=${youtubeQuery}`,
                youtubeUrl: `https://www.youtube.com/results?search_query=${youtubeQuery}`,
                youtubeVideoId: null,
                thumbnailUrl: null,
                sourceVerified: false,
                lastCheckedAt: '2026-06-14',
                durationMinutes: 12 + b,
                category: mapel.nama,
                transcript: finalTranscript,
                references: [
                  { title: 'Kurikulum Merdeka', url: 'https://kurikulum.kemdikbud.go.id/' }
                ],
                unavailableReason: 'Embed video internal dan video YouTube spesifik belum diverifikasi. Tombol referensi membuka pencarian YouTube sesuai topik materi.',
              };

              const pdfObjectives = [
                `Menjelaskan konsep "${lesson.title}" dengan bahasa sendiri.`,
                `Mengerjakan contoh soal dan latihan terkait ${mapel.nama}.`
              ];
              const pdfEvaluation = (lesson.quizzes || []).map((q: any) => q.question);
              while (pdfEvaluation.length < 2) {
                pdfEvaluation.push(`Jelaskan konsep dasar ${lesson.title} dengan bahasa sendiri.`);
                pdfEvaluation.push(`Tuliskan satu contoh penerapan ${lesson.title} di kehidupan nyata.`);
              }
              const pdfWorkedExample = {
                question: lesson.quizzes && lesson.quizzes[0] ? lesson.quizzes[0].question : `Bagaimana penerapan ${lesson.title}?`,
                answer: lesson.quizzes && lesson.quizzes[0] ? lesson.quizzes[0].explanation : `Penerapan ${lesson.title} harus mengikuti langkah-langkah terstruktur.`
              };
              const pdfChapters = [
                {
                  title: 'Bagian 1 - Pendahuluan',
                  summary: `Mengenali topik "${lesson.title}", mata pelajaran ${mapel.nama}, kelas ${kelas}, dan tujuan yang harus dicapai siswa.`,
                  topics: ['Identitas materi', 'Tujuan pembelajaran']
                },
                {
                  title: 'Bagian 2 - Konsep Utama',
                  summary: lesson.summary || `Konsep dasar dari ${lesson.title}.`,
                  topics: ['Konsep inti', 'Penjelasan bertahap']
                },
                {
                  title: 'Bagian 3 - Soal dan Latihan',
                  summary: `Mengerjakan contoh soal, memahami pembahasan, menjawab latihan terkait ${lesson.title}.`,
                  topics: ['Contoh soal', 'Latihan']
                }
              ];
              const pdfChecklist = [
                `Saya bisa menjelaskan "${lesson.title}" dengan bahasa sendiri.`,
                'Saya bisa memberi contoh konkret yang sesuai topik.',
                'Saya bisa mengerjakan contoh soal dan memahami pembahasannya.'
              ];

              const pdfPayload = {
                title: `Modul Belajar: ${lesson.title}`,
                description: `Modul lengkap ${mapel.nama} untuk memahami "${lesson.title}".`,
                pdfUrl: '',
                identity: {
                  jurusan: j.nama,
                  mapel: mapel.nama,
                  kelas,
                  semester: mapel.semester,
                  topik: lesson.title,
                  kategori: j.kode.startsWith('SMA') ? j.bidang : 'Pelajaran Kejuruan SMK',
                },
                objectives: pdfObjectives,
                keyConcepts: [lesson.summary || lesson.title],
                completeMaterial: `${lesson.explanation || ''}\n\n${lesson.visualExample || ''}`,
                workedExample: pdfWorkedExample,
                chapters: pdfChapters,
                examples: [lesson.visualExample || ''],
                evaluation: pdfEvaluation,
                summary: lesson.summary || lesson.title,
                checklist: pdfChecklist,
                topics: ['Pendahuluan', 'Konsep Utama', 'Soal dan Latihan'],
                references: [
                  { title: 'Kurikulum Merdeka', url: 'https://kurikulum.kemdikbud.go.id/' }
                ],
                content: `File PDF modul belum tersedia. Isi modul lengkap "${lesson.title}" dapat dibaca di halaman ini.`,
                unavailableReason: 'File PDF modul belum tersedia. Isi modul lengkap tetap ditampilkan agar tidak ada tombol download palsu.',
              };

              const ringkasanKonten = `## Ringkasan ${lesson.title}

### Poin Penting
- **Konsep:** ${lesson.summary || lesson.title}

### Rumus/Aturan Utama
Penerapan konsep ${lesson.title} memerlukan pemahaman detail teori serta disiplin mengikuti Standar Operasional Prosedur (SOP) yang berlaku di industri/sekolah.

### Contoh Soal dan Pembahasan
**Soal:** ${lesson.quizzes && lesson.quizzes[0] ? lesson.quizzes[0].question : `Bagaimana penerapan ${lesson.title}?`}

**Pembahasan:** ${lesson.quizzes && lesson.quizzes[0] ? lesson.quizzes[0].explanation : `Harus diselesaikan sesuai prinsip dasar.`}

### Glosarium
| Istilah | Makna Pembelajaran |
|---|---|
| ${lesson.title} | Topik utama bahasan materi kejuruan/umum. |
| SOP | Standar Operasional Prosedur yang harus dipatuhi. |
| K3LH | Kesehatan Keselamatan Kerja dan Lingkungan Hidup. |

### Referensi Belajar
- [Kurikulum Merdeka](https://kurikulum.kemdikbud.go.id/)
- [Web Belajar Center](https://github.com/javasrajagula/javas-web-belajar)
`;

              const isTeksTitle = isCommon || isGeneralTrack ? 'Materi Utama & Contoh Pembelajaran' : 'Teori Dasar & Kompetensi Kejuruan';
              const isVideoTitle = isCommon || isGeneralTrack ? 'Video Panduan Belajar' : 'Video Panduan Praktik Kejuruan';

              materisDb.push({
                id: `materi-${materiCounter++}`,
                babId: babId,
                judul: isTeksTitle,
                tipe: 'teks',
                konten: teksKonten,
                urutan: lessonIndex * 4 + 1
              });
              materisDb.push({
                id: `materi-${materiCounter++}`,
                babId: babId,
                judul: isVideoTitle,
                tipe: 'video',
                konten: JSON.stringify(videoPayload),
                urutan: lessonIndex * 4 + 2
              });
              materisDb.push({
                id: `materi-${materiCounter++}`,
                babId: babId,
                judul: 'Buku Modul Belajar & LKS (PDF)',
                tipe: 'pdf',
                konten: JSON.stringify(pdfPayload),
                urutan: lessonIndex * 4 + 3
              });
              materisDb.push({
                id: `materi-${materiCounter++}`,
                babId: babId,
                judul: 'Ringkasan & Glosarium Penting',
                tipe: 'ringkasan',
                konten: ringkasanKonten,
                urutan: lessonIndex * 4 + 4
              });

              lessonIndex++;
            }

            const allJsonQuestions: any[] = [];
            for (const les of lessons) {
              if (les.quizzes) allJsonQuestions.push(...les.quizzes.map((q: any) => ({ ...q, tipe: 'pilihan_ganda' })));
              if (les.hotsQuestions) allJsonQuestions.push(...les.hotsQuestions.map((q: any) => ({ ...q, tipe: 'pilihan_ganda' })));
              if (les.practiceBank) allJsonQuestions.push(...les.practiceBank.map((q: any) => ({ ...q, tipe: 'essay' })));
            }

            for (let s = 1; s <= 5; s++) {
              const jsonQ = allJsonQuestions[s - 1];
              if (jsonQ) {
                const questionText = jsonQ.question.length > 50 ? jsonQ.question : `${jsonQ.question} (Pahami konsep ini dengan seksama untuk persiapan ujian kejuruan/umum)`;
                const explanationText = jsonQ.explanation && jsonQ.explanation.length > 40
                  ? jsonQ.explanation
                  : `${jsonQ.explanation || ''} Penjelasan ini disusun agar siswa memahami latar belakang jawaban yang benar secara menyeluruh.`;

                bankSoalsDb.push({
                  id: `soal-${soalCounter++}`,
                  mataPelajaranId: mpId,
                  pertanyaan: questionText,
                  tipe: jsonQ.tipe === 'pilihan_ganda' ? 'pilihan_ganda' : 'essay',
                  pilihan: jsonQ.options ? JSON.stringify(jsonQ.options) : null,
                  jawabanBenar: jsonQ.options ? String.fromCharCode(65 + jsonQ.correctOptionIndex) : (jsonQ.answer || 'Tindakan yang benar harus sesuai dengan SOP.'),
                  pembahasan: explanationText,
                  tingkat: s <= 2 ? 'mudah' : (s <= 4 ? 'sedang' : 'sukar'),
                  kelas,
                  tahunAjaran: '2025/2026',
                  sumber: `Kurikulum Resmi ${j.nama} - ${mapel.nama}`,
                  tags: [mapel.nama, j.kode, `Bab ${b}`]
                });
              } else {
                const fallbackQ = buildQuestions(j, mapel, kelas, b, mod.title, soalCounter)[s - 1] || buildQuestions(j, mapel, kelas, b, mod.title, soalCounter)[0];
                bankSoalsDb.push({
                  id: `soal-${soalCounter++}`,
                  mataPelajaranId: mpId,
                  pertanyaan: fallbackQ.pertanyaan,
                  tipe: fallbackQ.tipe,
                  pilihan: fallbackQ.pilihan ? JSON.stringify(fallbackQ.pilihan) : null,
                  jawabanBenar: fallbackQ.jawabanBenar,
                  pembahasan: fallbackQ.pembahasan,
                  tingkat: fallbackQ.tingkat,
                  kelas,
                  tahunAjaran: '2025/2026',
                  sumber: `Kurikulum Mandiri ${j.nama} - ${mapel.nama}`,
                  tags: [mapel.nama, j.kode, `Bab ${b}`]
                });
              }
            }

            b++;
          }
        } else {
          // Fallback generator (SD, SMP, other SMK majors, common subjects without JSON match)
          for (let b = 1; b <= 5; b++) {
            const babId = `bab-${babCounter++}`;
            const estimasi = [45, 60, 90, 60, 75][b - 1] || 60;
            const babJudul = getBabJudul(mapel.nama, b, kelas);

            babsDb.push({
              id: babId,
              mataPelajaranId: mpId,
              nomor: b,
              judul: `Bab ${b}: ${babJudul}`,
              deskripsi: `Mempelajari ${babJudul} berdasarkan alur Kurikulum Merdeka kelas ${kelas} dengan penjelasan, contoh, dan latihan.`,
              estimasiMenit: estimasi
            });

            const activeMateriTemplates = [
              {
                judul: isCommon || isGeneralTrack ? 'Materi Utama & Contoh Pembelajaran' : 'Teori Dasar & Kompetensi Kejuruan',
                tipe: 'teks',
                konten: buildTheoryContent(j, mapel, kelas, b, babJudul),
              },
              {
                judul: isCommon || isGeneralTrack ? 'Video Panduan Belajar' : 'Video Panduan Praktik Kejuruan',
                tipe: 'video',
                konten: JSON.stringify(buildVideoPayload(j, mapel, kelas, b, babJudul)),
              },
              {
                judul: 'Buku Modul Belajar & LKS (PDF)',
                tipe: 'pdf',
                konten: JSON.stringify(buildModulePayload(j, mapel, kelas, b, babJudul)),
              },
              {
                judul: 'Ringkasan & Glosarium Penting',
                tipe: 'ringkasan',
                konten: buildSummaryContent(j, mapel, kelas, b, babJudul),
              },
            ];

            for (let m = 0; m < activeMateriTemplates.length; m++) {
              const mat = activeMateriTemplates[m];
              materisDb.push({
                id: `materi-${materiCounter++}`,
                babId: babId,
                judul: mat.judul,
                tipe: mat.tipe,
                konten: mat.konten,
                urutan: m + 1
              });
            }

            const activeQuestions = buildQuestions(j, mapel, kelas, b, babJudul, soalCounter);
            for (let qi = 0; qi < activeQuestions.length; qi++) {
              const question = activeQuestions[qi];
              bankSoalsDb.push({
                id: question.id,
                mataPelajaranId: mpId,
                pertanyaan: question.pertanyaan,
                tipe: question.tipe,
                pilihan: question.pilihan ? JSON.stringify(question.pilihan) : null,
                jawabanBenar: question.jawabanBenar,
                pembahasan: question.pembahasan,
                tingkat: question.tingkat,
                kelas,
                tahunAjaran: '2025/2026',
                sumber: `Seed internal berbasis materi: ${mapel.nama} - ${babJudul}`,
                tags: [mapel.nama, j.kode, 'SMK', `Bab ${b}`, babJudul],
              });
              soalCounter++;
            }
          }
        }
      }
    }
  }

  console.log(`🌱 Melakukan bulk insert...`);
  console.log(`- Jurusan: ${jurusansDb.length} records`);
  await prisma.jurusan.createMany({ data: jurusansDb });

  console.log(`- Mata Pelajaran: ${mapelsDb.length} records`);
  await prisma.mataPelajaran.createMany({ data: mapelsDb });

  console.log(`- Bab: ${babsDb.length} records`);
  await prisma.bab.createMany({ data: babsDb });

  console.log(`- Materi: ${materisDb.length} records`);
  await prisma.materi.createMany({ data: materisDb });

  console.log(`- Bank Soal: ${bankSoalsDb.length} records`);
  await prisma.bankSoal.createMany({ data: bankSoalsDb });

  console.log('🌱 Menyinkronkan pengguna default...');
  
  // Student
  const demoPasswordHash = hashPassword('academy123');
  await prisma.user.upsert({
    where: { email: 'alex@academy.os' },
    update: {
      name: 'Alex Mercer',
      schoolType: 'smk',
      selectedPathway: 'TKJ',
      passwordHash: demoPasswordHash,
    },
    create: {
      name: 'Alex Mercer',
      email: 'alex@academy.os',
      passwordHash: demoPasswordHash,
      avatar: '👨‍🎓',
      role: 'student',
      schoolType: 'smk',
      grade: 11,
      selectedPathway: 'TKJ',
      goals: ['Selesaikan administrasi jaringan Cisco', 'Pelajari VLAN & routing'],
      streak: 3,
      xp: 450,
      level: 2,
      studyTimeToday: 15,
      dailyGoalMinutes: 30,
      skills: { focus: 50, logic: 60, creativity: 40, discipline: 55 }
    }
  });

  console.log('🎉 Seeding data SMK BelajarKU sukses selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
