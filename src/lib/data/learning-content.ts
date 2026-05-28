export type LearningReference = {
  title: string;
  url: string;
};

export type LearningMapel = {
  kode: string;
  nama: string;
  semester: 1 | 2;
};

export type LearningTrack = {
  kode: string;
  nama: string;
  bidang: string;
  deskripsi: string;
  icon: string;
  warna: string;
  popular: boolean;
  mapel: Record<number, LearningMapel[]>;
};

export const SMK_COMMON_SUBJECTS_BY_GRADE: Record<10 | 11 | 12, LearningMapel[]> = {
  10: [
    { kode: 'UMUM-BIND', nama: 'Bahasa Indonesia', semester: 1 },
    { kode: 'UMUM-BING', nama: 'Bahasa Inggris', semester: 1 },
    { kode: 'UMUM-MTK', nama: 'Matematika', semester: 1 },
    { kode: 'UMUM-PPKN', nama: 'Pendidikan Pancasila', semester: 1 },
    { kode: 'UMUM-SEJ', nama: 'Sejarah', semester: 2 },
    { kode: 'UMUM-PJOK', nama: 'PJOK', semester: 2 },
  ],
  11: [
    { kode: 'UMUM-BIND', nama: 'Bahasa Indonesia Lanjut', semester: 1 },
    { kode: 'UMUM-BING', nama: 'Bahasa Inggris Lanjut', semester: 1 },
    { kode: 'UMUM-MTK', nama: 'Matematika Terapan', semester: 1 },
    { kode: 'UMUM-SENI', nama: 'Seni Budaya', semester: 2 },
    { kode: 'UMUM-PPKN', nama: 'Pendidikan Pancasila dan Kewargaan', semester: 2 },
    { kode: 'UMUM-PJOK', nama: 'PJOK dan Kesehatan Remaja', semester: 2 },
  ],
  12: [
    { kode: 'UMUM-BIND', nama: 'Bahasa Indonesia Akademik dan Profesional', semester: 1 },
    { kode: 'UMUM-BING', nama: 'Bahasa Inggris untuk Dunia Kerja', semester: 1 },
    { kode: 'UMUM-MTK', nama: 'Matematika Kontekstual', semester: 1 },
    { kode: 'UMUM-SEJ', nama: 'Sejarah Indonesia Kontemporer', semester: 2 },
    { kode: 'UMUM-PPKN', nama: 'Pendidikan Pancasila dan Proyek Warga', semester: 2 },
    { kode: 'UMUM-SENI', nama: 'Apresiasi Seni dan Produk Kreatif', semester: 2 },
  ],
};

export const GENERAL_LEARNING_TRACKS: LearningTrack[] = [
  {
    kode: 'SD',
    nama: 'Sekolah Dasar',
    bidang: 'Pelajaran Umum SD',
    deskripsi: 'Materi dasar literasi, numerasi, IPAS, Pancasila, seni, dan PJOK untuk siswa SD.',
    icon: 'SD',
    warna: '#16A34A',
    popular: true,
    mapel: {
      1: [
        { kode: 'SD-BIND', nama: 'Bahasa Indonesia Dasar', semester: 1 },
        { kode: 'SD-MTK', nama: 'Matematika Dasar', semester: 1 },
        { kode: 'SD-PPKN', nama: 'Pendidikan Pancasila Dasar', semester: 2 },
      ],
      2: [
        { kode: 'SD-BIND', nama: 'Membaca dan Menulis Permulaan', semester: 1 },
        { kode: 'SD-MTK', nama: 'Bilangan dan Pengukuran', semester: 1 },
        { kode: 'SD-SBK', nama: 'Seni Budaya dan Prakarya', semester: 2 },
      ],
      3: [
        { kode: 'SD-BIND', nama: 'Bahasa Indonesia: Teks Sederhana', semester: 1 },
        { kode: 'SD-MTK', nama: 'Pecahan dan Bangun Datar', semester: 1 },
        { kode: 'SD-IPAS', nama: 'IPAS: Lingkungan Sekitar', semester: 2 },
      ],
      4: [
        { kode: 'SD-BIND', nama: 'Bahasa Indonesia: Ide Pokok', semester: 1 },
        { kode: 'SD-MTK', nama: 'Matematika: Pecahan dan Desimal', semester: 1 },
        { kode: 'SD-IPAS', nama: 'IPAS: Makhluk Hidup dan Lingkungan', semester: 2 },
        { kode: 'SD-PPKN', nama: 'Pendidikan Pancasila: Hak dan Kewajiban', semester: 2 },
      ],
      5: [
        { kode: 'SD-BIND', nama: 'Bahasa Indonesia: Teks Eksplanasi', semester: 1 },
        { kode: 'SD-MTK', nama: 'Matematika: Perbandingan dan Data', semester: 1 },
        { kode: 'SD-IPAS', nama: 'IPAS: Sistem Tubuh dan Energi', semester: 2 },
        { kode: 'SD-PJOK', nama: 'PJOK: Kebugaran dan Permainan', semester: 2 },
      ],
      6: [
        { kode: 'SD-BIND', nama: 'Bahasa Indonesia: Teks Laporan', semester: 1 },
        { kode: 'SD-MTK', nama: 'Matematika: Rasio dan Geometri', semester: 1 },
        { kode: 'SD-IPAS', nama: 'IPAS: Bumi dan Antariksa', semester: 2 },
        { kode: 'SD-PPKN', nama: 'Pendidikan Pancasila: Musyawarah', semester: 2 },
      ],
    },
  },
  {
    kode: 'SMP',
    nama: 'Sekolah Menengah Pertama',
    bidang: 'Pelajaran Umum SMP',
    deskripsi: 'Materi umum SMP untuk menguatkan literasi, numerasi, sains, sosial, bahasa, seni, dan kebugaran.',
    icon: 'SMP',
    warna: '#0EA5E9',
    popular: true,
    mapel: {
      7: [
        { kode: 'SMP-BIND', nama: 'Bahasa Indonesia: Teks Deskripsi dan Narasi', semester: 1 },
        { kode: 'SMP-BING', nama: 'Bahasa Inggris: Self Introduction', semester: 1 },
        { kode: 'SMP-MTK', nama: 'Matematika: Bilangan dan Aljabar', semester: 1 },
        { kode: 'SMP-IPA', nama: 'IPA: Objek dan Pengukuran', semester: 2 },
        { kode: 'SMP-IPS', nama: 'IPS: Ruang dan Interaksi Sosial', semester: 2 },
      ],
      8: [
        { kode: 'SMP-BIND', nama: 'Bahasa Indonesia: Teks Eksposisi', semester: 1 },
        { kode: 'SMP-BING', nama: 'Bahasa Inggris: Descriptive Text', semester: 1 },
        { kode: 'SMP-MTK', nama: 'Matematika: Relasi, Fungsi, dan Persamaan', semester: 1 },
        { kode: 'SMP-IPA', nama: 'IPA: Sistem Organ dan Energi', semester: 2 },
        { kode: 'SMP-IPS', nama: 'IPS: Aktivitas Ekonomi dan Masyarakat', semester: 2 },
      ],
      9: [
        { kode: 'SMP-BIND', nama: 'Bahasa Indonesia: Teks Diskusi dan Tanggapan', semester: 1 },
        { kode: 'SMP-BING', nama: 'Bahasa Inggris: Procedure and Report Text', semester: 1 },
        { kode: 'SMP-MTK', nama: 'Matematika: Bangun Ruang dan Peluang', semester: 1 },
        { kode: 'SMP-IPA', nama: 'IPA: Listrik, Magnet, dan Pewarisan Sifat', semester: 2 },
        { kode: 'SMP-IPS', nama: 'IPS: Perubahan Sosial dan Globalisasi', semester: 2 },
      ],
    },
  },
  {
    kode: 'SMA-UMUM',
    nama: 'SMA - Materi Umum',
    bidang: 'Materi Umum SMA',
    deskripsi: 'Mata pelajaran umum SMA untuk literasi, numerasi, kewargaan, sejarah, bahasa, seni, dan kesehatan.',
    icon: 'SMA',
    warna: '#7C3AED',
    popular: true,
    mapel: {
      10: [
        { kode: 'SMA-BIND', nama: 'Bahasa Indonesia', semester: 1 },
        { kode: 'SMA-BING', nama: 'Bahasa Inggris', semester: 1 },
        { kode: 'SMA-MTK', nama: 'Matematika', semester: 1 },
        { kode: 'SMA-PPKN', nama: 'Pendidikan Pancasila', semester: 2 },
        { kode: 'SMA-SEJ', nama: 'Sejarah', semester: 2 },
        { kode: 'SMA-PJOK', nama: 'PJOK', semester: 2 },
      ],
      11: [
        { kode: 'SMA-BIND', nama: 'Bahasa Indonesia Lanjut', semester: 1 },
        { kode: 'SMA-BING', nama: 'Bahasa Inggris Lanjut', semester: 1 },
        { kode: 'SMA-MTK', nama: 'Matematika Lanjut', semester: 1 },
        { kode: 'SMA-SENI', nama: 'Seni Budaya', semester: 2 },
        { kode: 'SMA-SEJ', nama: 'Sejarah Indonesia dan Dunia', semester: 2 },
      ],
      12: [
        { kode: 'SMA-BIND', nama: 'Bahasa Indonesia Akademik', semester: 1 },
        { kode: 'SMA-BING', nama: 'Bahasa Inggris Akademik', semester: 1 },
        { kode: 'SMA-MTK', nama: 'Matematika Persiapan Studi Lanjut', semester: 1 },
        { kode: 'SMA-PPKN', nama: 'Pendidikan Pancasila dan Proyek Warga', semester: 2 },
        { kode: 'SMA-PJOK', nama: 'PJOK: Kebugaran Mandiri', semester: 2 },
      ],
    },
  },
  {
    kode: 'SMA-IPA',
    nama: 'SMA - Materi IPA',
    bidang: 'Materi IPA SMA',
    deskripsi: 'Materi peminatan IPA SMA untuk fisika, kimia, biologi, dan matematika sains.',
    icon: 'IPA',
    warna: '#0284C7',
    popular: true,
    mapel: {
      10: [
        { kode: 'IPA-FIS', nama: 'Fisika: Besaran, Gerak, dan Energi', semester: 1 },
        { kode: 'IPA-KIM', nama: 'Kimia: Struktur Atom dan Ikatan Kimia', semester: 1 },
        { kode: 'IPA-BIO', nama: 'Biologi: Keanekaragaman Hayati', semester: 2 },
      ],
      11: [
        { kode: 'IPA-FIS', nama: 'Fisika: Fluida, Suhu, dan Kalor', semester: 1 },
        { kode: 'IPA-KIM', nama: 'Kimia: Stoikiometri dan Larutan', semester: 1 },
        { kode: 'IPA-BIO', nama: 'Biologi: Sel, Jaringan, dan Sistem Organ', semester: 2 },
      ],
      12: [
        { kode: 'IPA-FIS', nama: 'Fisika: Listrik dan Gelombang', semester: 1 },
        { kode: 'IPA-KIM', nama: 'Kimia: Kesetimbangan dan Kimia Organik', semester: 1 },
        { kode: 'IPA-BIO', nama: 'Biologi: Genetika dan Evolusi', semester: 2 },
      ],
    },
  },
  {
    kode: 'SMA-IPS',
    nama: 'SMA - Materi IPS',
    bidang: 'Materi IPS SMA',
    deskripsi: 'Materi peminatan IPS SMA untuk ekonomi, geografi, sosiologi, dan sejarah sosial.',
    icon: 'IPS',
    warna: '#DC2626',
    popular: true,
    mapel: {
      10: [
        { kode: 'IPS-EKO', nama: 'Ekonomi: Kebutuhan, Kelangkaan, dan Pasar', semester: 1 },
        { kode: 'IPS-GEO', nama: 'Geografi: Peta, Litosfer, dan Atmosfer', semester: 1 },
        { kode: 'IPS-SOS', nama: 'Sosiologi: Individu, Kelompok, dan Norma', semester: 2 },
      ],
      11: [
        { kode: 'IPS-EKO', nama: 'Ekonomi: Pendapatan Nasional dan Kebijakan Fiskal', semester: 1 },
        { kode: 'IPS-GEO', nama: 'Geografi: Dinamika Kependudukan', semester: 1 },
        { kode: 'IPS-SOS', nama: 'Sosiologi: Konflik dan Integrasi Sosial', semester: 2 },
      ],
      12: [
        { kode: 'IPS-EKO', nama: 'Ekonomi: Akuntansi Dasar dan Perdagangan Internasional', semester: 1 },
        { kode: 'IPS-GEO', nama: 'Geografi: Wilayah dan Tata Ruang', semester: 1 },
        { kode: 'IPS-SOS', nama: 'Sosiologi: Perubahan Sosial dan Penelitian', semester: 2 },
      ],
    },
  },
];

const referenceCatalog: Array<{ keywords: string[]; references: LearningReference[] }> = [
  {
    keywords: ['bahasa indonesia', 'membaca', 'menulis', 'teks'],
    references: [
      { title: 'Ruang GTK - CP & ATP Kurikulum Merdeka', url: 'https://pusatinformasi.rumahpendidikan.kemendikdasmen.go.id/hc/id/categories/44586577246105-Ruang-GTK' },
      { title: 'SIBI/Pusat Perbukuan - Buku Bahasa Indonesia SMA/SMK', url: 'https://buku.kemdikbud.go.id/' },
    ],
  },
  {
    keywords: ['bahasa inggris', 'english'],
    references: [
      { title: 'British Council LearnEnglish', url: 'https://learnenglish.britishcouncil.org/' },
      { title: 'Ruang GTK - CP & ATP Kurikulum Merdeka', url: 'https://pusatinformasi.rumahpendidikan.kemendikdasmen.go.id/hc/id/categories/44586577246105-Ruang-GTK' },
    ],
  },
  {
    keywords: ['matematika', 'bilangan', 'aljabar', 'geometri', 'fungsi', 'peluang'],
    references: [
      { title: 'Khan Academy - Math', url: 'https://www.khanacademy.org/math' },
      { title: 'OpenStax - Math textbooks', url: 'https://openstax.org/subjects/math' },
    ],
  },
  {
    keywords: ['fisika', 'gerak', 'energi', 'listrik', 'gelombang', 'fluida'],
    references: [
      { title: 'OpenStax - Physics textbooks', url: 'https://openstax.org/subjects/science' },
      { title: 'Khan Academy - Physics', url: 'https://www.khanacademy.org/science/physics' },
    ],
  },
  {
    keywords: ['kimia', 'atom', 'larutan', 'stoikiometri', 'organik'],
    references: [
      { title: 'OpenStax - Chemistry', url: 'https://openstax.org/subjects/science' },
      { title: 'Khan Academy - Chemistry', url: 'https://www.khanacademy.org/science/chemistry' },
    ],
  },
  {
    keywords: ['biologi', 'sel', 'jaringan', 'genetika', 'makhluk hidup', 'ipas'],
    references: [
      { title: 'OpenStax - Biology', url: 'https://openstax.org/subjects/science' },
      { title: 'Khan Academy - Biology', url: 'https://www.khanacademy.org/science/biology' },
    ],
  },
  {
    keywords: ['ekonomi', 'pasar', 'kelangkaan', 'akuntansi', 'pendapatan nasional'],
    references: [
      { title: 'OpenStax - Economics', url: 'https://openstax.org/subjects/social-sciences' },
      { title: 'Khan Academy - Economics', url: 'https://www.khanacademy.org/economics-finance-domain' },
    ],
  },
  {
    keywords: ['geografi', 'litosfer', 'atmosfer', 'wilayah', 'peta'],
    references: [
      { title: 'National Geographic Education', url: 'https://education.nationalgeographic.org/' },
      { title: 'OpenStax - Science resources', url: 'https://openstax.org/subjects/science' },
    ],
  },
  {
    keywords: ['sosiologi', 'individu', 'kelompok', 'norma', 'sosial'],
    references: [
      { title: 'OpenStax - Introduction to Sociology', url: 'https://openstax.org/details/books/introduction-sociology-3e' },
      { title: 'Ruang GTK - CP & ATP Kurikulum Merdeka', url: 'https://pusatinformasi.rumahpendidikan.kemendikdasmen.go.id/hc/id/categories/44586577246105-Ruang-GTK' },
    ],
  },
  {
    keywords: ['sejarah', 'pancasila', 'kewargaan', 'ppkn'],
    references: [
      { title: 'Ruang GTK - Pendidikan Pancasila dan CP', url: 'https://pusatinformasi.rumahpendidikan.kemendikdasmen.go.id/hc/id/categories/44586577246105-Ruang-GTK' },
      { title: 'SIBI/Pusat Perbukuan - Buku Teks Utama', url: 'https://buku.kemdikbud.go.id/' },
    ],
  },
  {
    keywords: ['pjok', 'kebugaran', 'kesehatan', 'olahraga'],
    references: [
      { title: 'WHO - Physical activity', url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity' },
      { title: 'Ruang GTK - CP & ATP Kurikulum Merdeka', url: 'https://pusatinformasi.rumahpendidikan.kemendikdasmen.go.id/hc/id/categories/44586577246105-Ruang-GTK' },
    ],
  },
  {
    keywords: ['pemrograman', 'perangkat lunak', 'html', 'css', 'javascript', 'basis data'],
    references: [
      { title: 'MDN Web Docs - Learn web development', url: 'https://developer.mozilla.org/en-US/docs/Learn' },
      { title: 'MDN Web Docs - HTML reference', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
    ],
  },
  {
    keywords: ['jaringan', 'router', 'switch', 'wan', 'server'],
    references: [
      { title: 'Cisco - Networking basics', url: 'https://www.cisco.com/site/us/en/learn/topics/small-business/networking-basics.html' },
      { title: 'Cisco - What is computer networking?', url: 'https://www.cisco.com/c/en/us/solutions/enterprise-networks/what-is-computer-networking.html' },
    ],
  },
];

export function getLearningReferences(mapelNama: string): LearningReference[] {
  const text = mapelNama.toLowerCase();
  const matches = referenceCatalog.find((item) => item.keywords.some((keyword) => text.includes(keyword)));
  return matches?.references || [
    { title: 'Ruang GTK - CP & ATP Kurikulum Merdeka', url: 'https://pusatinformasi.rumahpendidikan.kemendikdasmen.go.id/hc/id/categories/44586577246105-Ruang-GTK' },
    { title: 'Khan Academy - Learning resources', url: 'https://www.khanacademy.org/' },
  ];
}

export function buildYoutubeSearchUrl(topic: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topic} pembelajaran`)}`;
}
