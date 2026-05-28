export type JurusanKode =
  | 'TKJ'
  | 'RPL'
  | 'DKV'
  | 'MM'
  | 'AKL'
  | 'MPLB'
  | 'BDP'
  | 'TKR'
  | 'TBSM'
  | 'TE'
  | 'TM'
  | 'TITL'
  | 'KULINER'
  | 'TB'
  | 'PHT'
  | 'ULP'
  | 'FARMASI'
  | 'KPR'
  | 'AGRI'
  | 'BCF';

export type KelasSmk = 10 | 11 | 12;

export interface MapelCatalogItem {
  kode: string;
  nama: string;
  semester: 1 | 2;
}

export interface JurusanCatalogItem {
  kode: JurusanKode;
  nama: string;
  bidang: string;
  deskripsi: string;
  icon: string;
  warna: string;
  popular: boolean;
  aliases?: string[];
  mapel: Record<KelasSmk, MapelCatalogItem[]>;
}

const commonMapel = {
  kewirausahaan: { kode: 'C3', nama: 'Proyek Kreatif dan Kewirausahaan', semester: 2 as const },
};

export const JURUSAN_CATALOG: JurusanCatalogItem[] = [
  {
    kode: 'TKJ',
    nama: 'Teknik Komputer dan Jaringan',
    bidang: 'Teknologi Informasi dan Komunikasi',
    deskripsi: 'Administrasi jaringan, server, perangkat jaringan, keamanan, dan layanan internet.',
    icon: 'TKJ',
    warna: '#2563EB',
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
        { kode: 'C3', nama: 'Keamanan Jaringan', semester: 1 },
        { kode: 'C3', nama: 'Perencanaan dan Pengalamatan Jaringan', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'RPL',
    nama: 'Rekayasa Perangkat Lunak',
    bidang: 'Teknologi Informasi dan Komunikasi',
    deskripsi: 'Pengembangan aplikasi, web, mobile, basis data, pengujian, dan manajemen proyek perangkat lunak.',
    icon: 'RPL',
    warna: '#7C3AED',
    popular: true,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Pengembangan Perangkat Lunak dan Gim', semester: 1 },
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
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'DKV',
    nama: 'Desain Komunikasi Visual',
    bidang: 'Seni dan Ekonomi Kreatif',
    deskripsi: 'Desain grafis, ilustrasi, branding, fotografi, UI visual, dan produksi media kreatif.',
    icon: 'DKV',
    warna: '#DB2777',
    popular: true,
    aliases: ['DESAIN KOMUNIKASI VISUAL'],
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Desain Komunikasi Visual', semester: 1 },
        { kode: 'C2', nama: 'Sketsa dan Ilustrasi Digital', semester: 1 },
        { kode: 'C2', nama: 'Fotografi Dasar', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Desain Grafis Percetakan', semester: 1 },
        { kode: 'C3', nama: 'Branding dan Identitas Visual', semester: 2 },
        { kode: 'C3', nama: 'Desain Media Interaktif', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Produksi Kampanye Visual', semester: 1 },
        { kode: 'C3', nama: 'Portofolio Desain Profesional', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'MM',
    nama: 'Multimedia',
    bidang: 'Seni dan Ekonomi Kreatif',
    deskripsi: 'Produksi konten digital, animasi, video, audio, desain interaktif, dan media promosi.',
    icon: 'MM',
    warna: '#EC4899',
    popular: false,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Kreatif Multimedia', semester: 1 },
        { kode: 'C2', nama: 'Desain Grafis', semester: 1 },
        { kode: 'C2', nama: 'Fotografi dan Videografi Dasar', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Animasi 2D dan 3D', semester: 1 },
        { kode: 'C3', nama: 'Produksi Video', semester: 2 },
        { kode: 'C3', nama: 'Teknik Pengolahan Audio', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Desain Media Interaktif', semester: 1 },
        { kode: 'C3', nama: 'Proyek Multimedia', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'AKL',
    nama: 'Akuntansi dan Keuangan Lembaga',
    bidang: 'Bisnis dan Manajemen',
    deskripsi: 'Pencatatan transaksi, laporan keuangan, pajak, audit dasar, dan aplikasi komputer akuntansi.',
    icon: 'AKL',
    warna: '#059669',
    popular: true,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Akuntansi dan Keuangan Lembaga', semester: 1 },
        { kode: 'C2', nama: 'Dasar Akuntansi', semester: 1 },
        { kode: 'C2', nama: 'Aplikasi Pengolah Angka', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Akuntansi Perusahaan Jasa dan Dagang', semester: 1 },
        { kode: 'C3', nama: 'Akuntansi Keuangan', semester: 2 },
        { kode: 'C3', nama: 'Administrasi Pajak', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Komputer Akuntansi', semester: 1 },
        { kode: 'C3', nama: 'Akuntansi Perusahaan Manufaktur', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'MPLB',
    nama: 'Manajemen Perkantoran',
    bidang: 'Bisnis dan Manajemen',
    deskripsi: 'Administrasi kantor, kearsipan digital, layanan bisnis, korespondensi, dan manajemen dokumen.',
    icon: 'MPLB',
    warna: '#D97706',
    popular: true,
    aliases: ['OTKP', 'MP', 'MANAJEMEN PERKANTORAN DAN LAYANAN BISNIS'],
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Manajemen Perkantoran dan Layanan Bisnis', semester: 1 },
        { kode: 'C2', nama: 'Teknologi Perkantoran', semester: 1 },
        { kode: 'C2', nama: 'Korespondensi', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Administrasi Kepegawaian', semester: 1 },
        { kode: 'C3', nama: 'Administrasi Keuangan Kantor', semester: 2 },
        { kode: 'C3', nama: 'Kearsipan Digital', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Humas dan Keprotokolan', semester: 1 },
        { kode: 'C3', nama: 'Administrasi Sistem Informasi Manajemen', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'BDP',
    nama: 'Bisnis Daring dan Pemasaran',
    bidang: 'Bisnis dan Manajemen',
    deskripsi: 'Pemasaran digital, bisnis online, komunikasi bisnis, pengelolaan produk, dan transaksi.',
    icon: 'BDP',
    warna: '#EA580C',
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
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'TKR',
    nama: 'Teknik Kendaraan Ringan',
    bidang: 'Teknologi dan Rekayasa',
    deskripsi: 'Perawatan mesin mobil, chassis, kelistrikan otomotif, diagnosis kerusakan, dan bengkel.',
    icon: 'TKR',
    warna: '#0F766E',
    popular: true,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Teknik Otomotif', semester: 1 },
        { kode: 'C2', nama: 'Gambar Teknik Otomotif', semester: 1 },
        { kode: 'C2', nama: 'Teknologi Dasar Otomotif', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Pemeliharaan Mesin Kendaraan Ringan', semester: 1 },
        { kode: 'C3', nama: 'Pemeliharaan Chassis Kendaraan Ringan', semester: 2 },
        { kode: 'C3', nama: 'Kelistrikan Kendaraan Ringan', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Diagnosis Kerusakan Kendaraan Ringan', semester: 1 },
        { kode: 'C3', nama: 'Pengelolaan Bengkel Otomotif', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'TBSM',
    nama: 'Teknik Sepeda Motor',
    bidang: 'Teknologi dan Rekayasa',
    deskripsi: 'Perawatan mesin sepeda motor, sasis, kelistrikan, injeksi, diagnosis, dan pengelolaan bengkel.',
    icon: 'TSM',
    warna: '#0284C7',
    popular: false,
    aliases: ['TSM', 'TEKNIK DAN BISNIS SEPEDA MOTOR'],
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Teknik Otomotif Sepeda Motor', semester: 1 },
        { kode: 'C2', nama: 'Gambar Teknik Otomotif', semester: 1 },
        { kode: 'C2', nama: 'Teknologi Dasar Sepeda Motor', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Pemeliharaan Mesin Sepeda Motor', semester: 1 },
        { kode: 'C3', nama: 'Pemeliharaan Sasis Sepeda Motor', semester: 2 },
        { kode: 'C3', nama: 'Pemeliharaan Kelistrikan Sepeda Motor', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Sistem Injeksi Sepeda Motor', semester: 1 },
        { kode: 'C3', nama: 'Pengelolaan Bengkel Sepeda Motor', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'TE',
    nama: 'Teknik Elektronika',
    bidang: 'Teknologi dan Rekayasa',
    deskripsi: 'Rangkaian elektronika, mikrokontroler, sensor, aktuator, perakitan, dan troubleshooting perangkat.',
    icon: 'TE',
    warna: '#0891B2',
    popular: false,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Teknik Elektronika', semester: 1 },
        { kode: 'C2', nama: 'Rangkaian Listrik dan Elektronika', semester: 1 },
        { kode: 'C2', nama: 'Gambar Teknik Elektronika', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Mikrokontroler dan Sistem Embedded', semester: 1 },
        { kode: 'C3', nama: 'Sensor dan Aktuator', semester: 2 },
        { kode: 'C3', nama: 'Perawatan Peralatan Elektronika', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Sistem Kendali Elektronika', semester: 1 },
        { kode: 'C3', nama: 'Proyek Elektronika Terapan', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'TM',
    nama: 'Teknik Mesin',
    bidang: 'Teknologi dan Rekayasa',
    deskripsi: 'Gambar mesin, pemesinan, pengelasan, CNC, metrologi, perawatan, dan keselamatan kerja bengkel.',
    icon: 'TM',
    warna: '#475569',
    popular: false,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Teknik Mesin', semester: 1 },
        { kode: 'C2', nama: 'Gambar Teknik Mesin', semester: 1 },
        { kode: 'C2', nama: 'Keselamatan Kerja Bengkel Mesin', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Teknik Pemesinan Bubut dan Frais', semester: 1 },
        { kode: 'C3', nama: 'Teknik Pengelasan Dasar', semester: 2 },
        { kode: 'C3', nama: 'Metrologi Industri', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Pemesinan CNC', semester: 1 },
        { kode: 'C3', nama: 'Perawatan Mesin Industri', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'TITL',
    nama: 'Teknik Instalasi Tenaga Listrik',
    bidang: 'Teknologi dan Rekayasa',
    deskripsi: 'Instalasi listrik bangunan, panel, motor listrik, proteksi, pengukuran, dan keselamatan ketenagalistrikan.',
    icon: 'TITL',
    warna: '#CA8A04',
    popular: false,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Ketenagalistrikan', semester: 1 },
        { kode: 'C2', nama: 'Gambar Teknik Listrik', semester: 1 },
        { kode: 'C2', nama: 'Pengukuran Listrik', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Instalasi Penerangan Listrik', semester: 1 },
        { kode: 'C3', nama: 'Instalasi Tenaga Listrik', semester: 2 },
        { kode: 'C3', nama: 'Motor Listrik dan Kendali', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Panel Distribusi dan Proteksi', semester: 1 },
        { kode: 'C3', nama: 'Perawatan Instalasi Listrik', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'KULINER',
    nama: 'Tata Boga',
    bidang: 'Pariwisata',
    deskripsi: 'Pengolahan makanan, pastry, bakery, keamanan pangan, menu, pelayanan, dan produksi kuliner.',
    icon: 'BOGA',
    warna: '#DC2626',
    popular: false,
    aliases: ['TATA BOGA'],
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Kuliner', semester: 1 },
        { kode: 'C2', nama: 'Keamanan Pangan', semester: 1 },
        { kode: 'C2', nama: 'Pengetahuan Bahan Makanan', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Pengolahan Makanan Indonesia', semester: 1 },
        { kode: 'C3', nama: 'Pengolahan Makanan Kontinental', semester: 2 },
        { kode: 'C3', nama: 'Produksi Pastry dan Bakery', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Pengelolaan Usaha Kuliner', semester: 1 },
        { kode: 'C3', nama: 'Perencanaan Menu dan Biaya', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'TB',
    nama: 'Tata Busana',
    bidang: 'Pariwisata',
    deskripsi: 'Desain busana, pola, menjahit, tekstil, produksi pakaian, quality control, dan wirausaha fashion.',
    icon: 'BUS',
    warna: '#BE185D',
    popular: false,
    aliases: ['TATA BUSANA'],
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Busana', semester: 1 },
        { kode: 'C2', nama: 'Tekstil dan Desain Busana', semester: 1 },
        { kode: 'C2', nama: 'Pembuatan Pola Dasar', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Pembuatan Busana Industri', semester: 1 },
        { kode: 'C3', nama: 'Teknik Menjahit Lanjut', semester: 2 },
        { kode: 'C3', nama: 'Hiasan Busana', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Desain Koleksi Busana', semester: 1 },
        { kode: 'C3', nama: 'Quality Control Produk Fashion', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'PHT',
    nama: 'Perhotelan',
    bidang: 'Pariwisata',
    deskripsi: 'Front office, housekeeping, tata hidang, layanan tamu, reservasi, laundry, dan operasional hotel.',
    icon: 'HOTEL',
    warna: '#06B6D4',
    popular: false,
    aliases: ['PERHOTELAN'],
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
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'ULP',
    nama: 'Usaha Layanan Pariwisata',
    bidang: 'Pariwisata',
    deskripsi: 'Perencanaan perjalanan, ticketing, guiding, reservasi, paket wisata, dan pelayanan pelanggan.',
    icon: 'ULP',
    warna: '#0D9488',
    popular: false,
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Usaha Layanan Pariwisata', semester: 1 },
        { kode: 'C2', nama: 'Geografi Pariwisata', semester: 1 },
        { kode: 'C2', nama: 'Komunikasi Pelayanan Wisata', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Perencanaan Perjalanan Wisata', semester: 1 },
        { kode: 'C3', nama: 'Ticketing dan Reservasi', semester: 2 },
        { kode: 'C3', nama: 'Pemanduan Wisata', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Pengelolaan Paket Wisata', semester: 1 },
        { kode: 'C3', nama: 'MICE dan Event Pariwisata', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'FARMASI',
    nama: 'Farmasi',
    bidang: 'Kesehatan dan Pekerjaan Sosial',
    deskripsi: 'Pelayanan farmasi, farmakologi, resep, sediaan obat, apotek, dan keselamatan layanan kefarmasian.',
    icon: 'FAR',
    warna: '#6D28D9',
    popular: false,
    aliases: ['FARMASI KLINIS', 'FARMASI KLINIS DAN KOMUNITAS'],
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Kefarmasian', semester: 1 },
        { kode: 'C2', nama: 'Kimia Dasar Farmasi', semester: 1 },
        { kode: 'C2', nama: 'Botani Farmasi', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Pelayanan Farmasi', semester: 1 },
        { kode: 'C3', nama: 'Farmakologi', semester: 2 },
        { kode: 'C3', nama: 'Kimia Farmasi', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Farmasi Rumah Sakit', semester: 1 },
        { kode: 'C3', nama: 'Manajemen Apotek', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'KPR',
    nama: 'Keperawatan',
    bidang: 'Kesehatan dan Pekerjaan Sosial',
    deskripsi: 'Asuhan keperawatan dasar, anatomi, fisiologi, kebutuhan dasar manusia, gizi, dan praktik klinik.',
    icon: 'KPR',
    warna: '#14B8A6',
    popular: false,
    aliases: ['KEPERAWATAN'],
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
        { kode: 'C3', nama: 'Praktik Kerja Lapangan Keperawatan', semester: 2 },
      ],
    },
  },
  {
    kode: 'AGRI',
    nama: 'Agribisnis',
    bidang: 'Agribisnis dan Agriteknologi',
    deskripsi: 'Budidaya tanaman, alat mesin pertanian, pembenihan, pengolahan hasil, dan wirausaha agribisnis.',
    icon: 'AGRI',
    warna: '#16A34A',
    popular: false,
    aliases: ['ATP', 'AGRIBISNIS TANAMAN PANGAN DAN HORTIKULTURA'],
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Agribisnis', semester: 1 },
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
        commonMapel.kewirausahaan,
      ],
    },
  },
  {
    kode: 'BCF',
    nama: 'Broadcasting dan Perfilman',
    bidang: 'Seni dan Ekonomi Kreatif',
    deskripsi: 'Produksi siaran, kamera, audio, editing, naskah, penyutradaraan, dan manajemen produksi film.',
    icon: 'BCF',
    warna: '#111827',
    popular: false,
    aliases: ['BROADCASTING', 'PERFILMAN'],
    mapel: {
      10: [
        { kode: 'C1', nama: 'Dasar-Dasar Broadcasting dan Perfilman', semester: 1 },
        { kode: 'C2', nama: 'Teknik Kamera dan Audio', semester: 1 },
        { kode: 'C2', nama: 'Penulisan Naskah Audio Visual', semester: 2 },
      ],
      11: [
        { kode: 'C3', nama: 'Produksi Program Siaran', semester: 1 },
        { kode: 'C3', nama: 'Editing Video dan Tata Suara', semester: 2 },
        { kode: 'C3', nama: 'Penyutradaraan Dasar', semester: 2 },
      ],
      12: [
        { kode: 'C3', nama: 'Produksi Film Pendek', semester: 1 },
        { kode: 'C3', nama: 'Manajemen Produksi Media', semester: 1 },
        commonMapel.kewirausahaan,
      ],
    },
  },
];

const aliasMap = new Map<string, JurusanKode>();
for (const item of JURUSAN_CATALOG) {
  aliasMap.set(item.kode, item.kode);
  aliasMap.set(item.nama.toUpperCase(), item.kode);
  item.aliases?.forEach((alias) => aliasMap.set(alias.toUpperCase(), item.kode));
}

export const JURUSAN_CODES = JURUSAN_CATALOG.map((item) => item.kode);

export function normalizeJurusanKode(input?: string | null): JurusanKode | null {
  const value = input?.trim().toUpperCase();
  if (!value || value === 'UMUM') return null;
  return aliasMap.get(value) || null;
}

export function resolveJurusanKode(input?: string | null, fallback: JurusanKode = 'TKJ'): JurusanKode {
  return normalizeJurusanKode(input) || fallback;
}

export function isKnownJurusan(input?: string | null) {
  return normalizeJurusanKode(input) !== null;
}

export function getJurusanByKode(input?: string | null) {
  const kode = normalizeJurusanKode(input);
  return kode ? JURUSAN_CATALOG.find((item) => item.kode === kode) || null : null;
}

export function getJurusanLabel(input?: string | null) {
  return getJurusanByKode(input)?.nama || input || 'Teknik Komputer dan Jaringan';
}

export function getJurusanOptions() {
  return JURUSAN_CATALOG.map(({ kode, nama, bidang }) => ({ kode, nama, bidang }));
}
