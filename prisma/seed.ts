import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// JURUSAN DATA — 12 popular SMK majors in Indonesia
const JURUSAN_DATA = [
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
  return `Konsep Dasar Bagian ${bab} — ${mapel}`;
}

async function main() {
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

    for (const [kelasStr, mapelList] of Object.entries(j.mapel)) {
      const kelas = parseInt(kelasStr);
      for (const mapel of mapelList) {
        const mpId = `mp-${mapelCounter++}`;
        mapelsDb.push({
          id: mpId,
          jurusanId: jId,
          kode: mapel.kode,
          nama: mapel.nama,
          kelas,
          semester: mapel.semester,
          deskripsi: `Mata pelajaran kompetensi keahlian ${mapel.kode} untuk siswa kelas ${kelas} semester ${mapel.semester}.`
        });

        // Generate 5 Bab
        for (let b = 1; b <= 5; b++) {
          const babId = `bab-${babCounter++}`;
          const estimasi = [45, 60, 90, 60, 75][b - 1] || 60;
          const babJudul = getBabJudul(mapel.nama, b, kelas);

          babsDb.push({
            id: babId,
            mataPelajaranId: mpId,
            nomor: b,
            judul: `Bab ${b}: ${babJudul}`,
            deskripsi: `Mempelajari kompetensi keahlian ${babJudul} kurikulum merdeka kelas ${kelas}.`,
            estimasiMenit: estimasi
          });

          // Generate 4 Materi
          const materiTemplates = [
            {
              judul: 'Teori Dasar & Kompetensi Kejuruan',
              tipe: 'teks',
              konten: `# Teori Dasar ${mapel.nama} — Bab ${b}

## Capaian Pembelajaran & Tujuan
Setelah mempelajari modul ini, siswa diharapkan memiliki kompetensi:
1. Menjelaskan prinsip dan fondasi teoritis utama terkait topik.
2. Melakukan analisis dan pemecahan masalah sederhana di bidangnya.
3. Menerapkan Standar Operasional Prosedur (SOP) industri kejuruan yang relevan.

## Materi Utama
Materi kejuruan ini dirancang untuk mempersiapkan siswa SMK menguasai kompetensi industri praktis sesuai standar kurikulum nasional terbaru. Penjelasan detail teori mencakup aspek fungsionalitas, pemodelan kasus, dan studi alur kerja operasional.

### Kompetensi Kerja Terkait:
- Penggunaan perkakas dan alat standar industri.
- Penerapan K3LH (Kesehatan Keselamatan Kerja dan Lingkungan Hidup).
- Kemampuan analisis diagnostik masalah di lapangan.

> **Catatan Industri:** Topik bab ${b} ini sering kali diujikan dalam Uji Kompetensi Keahlian (UKK) nasional.`
            },
            {
              judul: 'Video Panduan Praktik Kejuruan',
              tipe: 'video',
              konten: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            },
            {
              judul: 'Buku Modul Belajar & LKS (PDF)',
              tipe: 'pdf',
              konten: `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`
            },
            {
              judul: 'Ringkasan & Glosarium Penting',
              tipe: 'ringkasan',
              konten: `## Ringkasan Bab ${b}

- **Poin Kunci 1:** Konsep utama yang wajib diingat siswa sebelum uji kompetensi.
- **Poin Kunci 2:** Alur kerja (workflow) praktis standar industri.
- **Poin Kunci 3:** Analisis troubleshoot dasar yang sering terjadi di lapangan.

## Istilah Kejuruan Penting (Glosarium)
| Istilah | Penjelasan Singkat (Definisi) |
|---------|--------------------------------|
| Standar Industri | Ketetapan baku yang diakui secara luas di ekosistem kerja. |
| Troubleshoot | Proses pencarian sumber masalah dan perbaikannya. |
| Uji Kompetensi | Evaluasi akhir keahlian siswa yang divalidasi oleh industri. |`
            }
          ];

          for (let m = 0; m < materiTemplates.length; m++) {
            const mat = materiTemplates[m];
            materisDb.push({
              id: `materi-${materiCounter++}`,
              babId: babId,
              judul: mat.judul,
              tipe: mat.tipe,
              konten: mat.konten,
              urutan: m + 1
            });
          }

          // Generate 5 BankSoal
          const tingkats = ['mudah', 'sedang', 'sukar'];
          for (let s = 1; s <= 5; s++) {
            const isPilihanGanda = s <= 3;
            bankSoalsDb.push({
              id: `soal-${soalCounter++}`,
              mataPelajaranId: mpId,
              pertanyaan: `Soal Latihan Kejuruan ${s} (${mapel.nama} Kelas ${kelas} Bab ${b}): Manakah di bawah ini yang merupakan tindakan paling tepat dan sesuai dengan SOP industri terkait topik ini?`,
              tipe: isPilihanGanda ? 'pilihan_ganda' : (s === 4 ? 'benar_salah' : 'essay'),
              pilihan: isPilihanGanda
                ? JSON.stringify([
                    `A. Mengikuti prosedur K3LH standar industri secara penuh`,
                    `B. Melakukan perbaikan cepat tanpa menggunakan alat pelindung`,
                    `C. Mengabaikan instruksi kerja demi mengejar waktu penyelesaian`,
                    `D. Melaporkan kesalahan setelah proyek selesai sepenuhnya`,
                    `E. Menggunakan perkakas yang tidak terkalibrasi demi kenyamanan`
                  ])
                : null,
              jawabanBenar: isPilihanGanda ? 'A' : (s === 4 ? 'Benar' : 'Tindakan yang benar harus sesuai dengan SOP industri dan mengutamakan K3LH.'),
              pembahasan: `Pembahasan Soal ${s}: Tindakan wajib bagi setiap praktisi di industri adalah mengedepankan Standar Operasional Prosedur (SOP) serta keselamatan kerja (K3LH) untuk mencegah cedera atau kerusakan aset perusahaan.`,
              tingkat: tingkats[s % 3] || 'sedang',
              kelas,
              tahunAjaran: '2025/2026',
              sumber: 'Soal Ujian Kompetensi Kejuruan (UKK)',
              tags: [mapel.nama, 'SMK', `Bab ${b}`]
            });
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
  await prisma.user.upsert({
    where: { email: 'alex@academy.os' },
    update: {
      name: 'Alex Mercer',
      schoolType: 'smk',
      selectedPathway: 'TKJ',
    },
    create: {
      name: 'Alex Mercer',
      email: 'alex@academy.os',
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
