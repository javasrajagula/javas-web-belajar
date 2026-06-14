import { QuizQuestion, Flashcard, MindMapNode, TimelineEvent } from '@/types';

// Mock AI Engine for Web Belajar (Indonesian Localization)

interface AIPipelineResult {
  summary: string;
  quizzes: QuizQuestion[];
  flashcards: Flashcard[];
  mindmap: MindMapNode[];
  timeline: TimelineEvent[];
}

export const generateAIPipeline = async (
  title: string,
  content: string
): Promise<AIPipelineResult> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('sejarah') || lowerTitle.includes('perang') || lowerTitle.includes('revolusi') || lowerTitle.includes('history')) {
    return getHistoryPipeline(title);
  } else if (lowerTitle.includes('sains') || lowerTitle.includes('biologi') || lowerTitle.includes('sel') || lowerTitle.includes('genetika') || lowerTitle.includes('science')) {
    return getBiologyPipeline(title);
  } else if (lowerTitle.includes('matematika') || lowerTitle.includes('kalkulus') || lowerTitle.includes('aljabar') || lowerTitle.includes('persamaan') || lowerTitle.includes('math')) {
    return getMathPipeline(title);
  } else {
    return getDefaultPipeline(title);
  }
};

const getHistoryPipeline = (title: string): AIPipelineResult => ({
  summary: `# Ringkasan: ${title}

Analisis historis ini memeriksa peristiwa utama, penyebab struktural, dan konsekuensi sosio-politik jangka panjang.

## Pilar Utama Pembelajaran
1. **Katalis Utama**: Kesenjangan ekonomi yang berkepanjangan, ketimpangan sosial, dan pembusukan institusi yang perlahan-lahan merusak kerangka pemerintahan.
2. **Titik Pemicu**: Percikan langsung yang menyulut perlawanan aktif atau keruntuhan struktural.
3. **Dampak Global**: Bagaimana aliansi internasional bergeser dan bagaimana keseimbangan kekuasaan mengubah lanskap geopolitik.

## Wawasan Penting
- Transisi kekuasaan ditandai dengan perubahan cepat dalam kebijakan, mobilisasi militer, dan pergeseran ideologis.
- Pertempuran ideologis terlembagakan, menetapkan preseden bagi sistem tata kelola modern.
- Hasil akhirnya membentuk kembali batas-batas wilayah dan membentuk kerangka hubungan internasional yang baru.`,
  quizzes: [
    {
      id: 'h1',
      question: 'Katalis mendasar mana yang paling langsung memicu peristiwa utama yang dibahas dalam studi ini?',
      options: [
        'Perubahan mendadak dalam rute perdagangan internasional',
        'Ketidakstabilan ekonomi ditambah dengan pembusukan institusi',
        'Perjanjian diplomatik yang ditandatangani di bawah paksaan',
        'Munculnya kelas pedagang baru yang dominan'
      ],
      correctOptionIndex: 1,
      explanation: 'Meskipun rute perdagangan dan perjanjian memiliki pengaruh, kegagalan struktural mendasar berasal dari ketidakstabilan ekonomi dan pembusukan institusi.'
    },
    {
      id: 'h2',
      question: 'Bagaimana aliansi geopolitik bergeser setelah konflik selesai?',
      options: [
        'Aliansi bubar sepenuhnya menjadi isolasionisme total',
        'Hegemoni unipolar yang kaku didirikan oleh pemenang',
        'Munculnya blok kekuatan bipolar yang membentuk hubungan internasional di masa depan',
        'Aliansi tetap sama sekali tidak berubah'
      ],
      correctOptionIndex: 2,
      explanation: 'Konflik tersebut menghasilkan pembentukan blok kekuatan yang saling bersaing, menetapkan fondasi bagi diplomasi bipolar atau multipolar modern.'
    }
  ],
  flashcards: [
    { id: 'hf1', front: 'Apa yang dimaksud dengan "Teori Percikan" dalam konflik ini?', back: 'Konsep bahwa keluhan sistemik yang mendalam (seperti kayu bakar) memerlukan katalis langsung (percikan) untuk beralih ke mobilisasi skala penuh.', mastered: false },
    { id: 'hf2', front: 'Sebutkan perjanjian diplomatik utama yang disepakati setelah peristiwa ini.', back: 'Perjanjian Batas Kedaulatan, yang mendefinisikan kembali pemerintahan regional.', mastered: false }
  ],
  mindmap: [
    { id: '1', label: title, position: { x: 250, y: 50 } },
    { id: '2', label: 'Katalis', position: { x: 100, y: 150 } },
    { id: '3', label: 'Titik Pemicu', position: { x: 250, y: 150 } },
    { id: '4', label: 'Dampak Akhir', position: { x: 400, y: 150 } },
    { id: '2a', label: 'Utang Sistemik', position: { x: 50, y: 250 } },
    { id: '2b', label: 'Ketimpangan', position: { x: 120, y: 250 } },
    { id: '3a', label: 'Pemberontakan', position: { x: 250, y: 250 } },
    { id: '4a', label: 'Pakta Baru', position: { x: 380, y: 250 } },
    { id: '4b', label: 'Reorganisasi Global', position: { x: 480, y: 250 } }
  ],
  timeline: [
    { id: 'ht1', date: 'Fase I (Persiapan)', title: 'Kerapuhan Ekonomi Meningkat', description: 'Ketidakseimbangan sistemik memicu protes regional dan penolakan legislatif awal.' },
    { id: 'ht2', date: 'Fase II (Pemicu)', title: 'Deklarasi Terbuka', description: 'Keruntuhan komunikasi diplomatik formal menyebabkan konfrontasi langsung.' },
    { id: 'ht3', date: 'Fase III (Resolusi)', title: 'Penandatanganan Perjanjian', description: 'Penandatanganan kesepakatan damai dan pelaksanaan reformasi konstitusi besar.' }
  ]
});

const getBiologyPipeline = (title: string): AIPipelineResult => ({
  summary: `# Ringkasan: ${title}

Tinjauan biologis dan fisiologis yang menganalisis proses seluler, jalur metabolisme, dan mekanisme struktural.

## Konsep Utama
1. **Organisasi Struktural**: Hierarki spasial dari komponen molekuler hingga arsitektur jaringan yang kompleks.
2. **Transduksi Energi**: Jalur di mana energi dipanen, diubah, dan digunakan untuk mempertahankan fungsi seluler.
3. **Transmisi Sinyal**: Loop umpan balik, reseptor seluler, dan mekanisme respons biologis.

## Prinsip Dasar Biologi
- **Homeostasis**: Bagaimana sistem terus mengatur diri sendiri secara otomatis untuk mempertahankan kondisi internal yang stabil di tengah gangguan eksternal.
- **Bentuk Mengikuti Fungsi**: Bentuk struktural suatu organel atau sel berkolerasi langsung dengan kapasitas biologisnya.`,
  quizzes: [
    {
      id: 'b1',
      question: 'Struktur seluler mana yang paling bertanggung jawab untuk mengoordinasikan jalur transduksi sinyal yang dijelaskan?',
      options: [
        'Membran Lisosom',
        'Protein reseptor transmembran',
        'Loop kromatin nukleolus',
        'Selubung mitokondria luar'
      ],
      correctOptionIndex: 1,
      explanation: 'Protein reseptor transmembran mengikat ligan eksternal untuk meluncurkan kaskade sinyal intraseluler.'
    },
    {
      id: 'b2',
      question: 'Apa peran utama loop umpan balik homeostatis dalam sistem biologis ini?',
      options: [
        'Untuk mempercepat siklus pembelahan sel secara tanpa batas',
        'Untuk mempertahankan keseimbangan internal meskipun terjadi volatilitas eksternal',
        'Untuk mengkatalisis katabolisme eksternal dari protein struktural',
        'Memicu apoptosis terprogram di bawah kondisi normal'
      ],
      correctOptionIndex: 1,
      explanation: 'Homeostasis bekerja secara khusus untuk menyetel secara mandiri dan menstabilkan keadaan internal sel terhadap pergeseran lingkungan luar.'
    }
  ],
  flashcards: [
    { id: 'bf1', front: 'Apa ciri khas dari situs alosterik?', back: 'Situs pengikatan yang berbeda dari situs aktif, di mana pengikatan ligan mengubah konformasi dan aktivitas enzim.', mastered: false },
    { id: 'bf2', front: 'Definisikan tekanan osmotik dalam konteks fisiologis ini.', back: 'Tekanan yang diperlukan untuk mencegah aliran air ke dalam sel melalui membran semipermeabel.', mastered: false }
  ],
  mindmap: [
    { id: '1', label: title, position: { x: 250, y: 50 } },
    { id: '2', label: 'Struktur Sel', position: { x: 100, y: 150 } },
    { id: '3', label: 'Metabolisme', position: { x: 250, y: 150 } },
    { id: '4', label: 'Regulasi Sel', position: { x: 400, y: 150 } },
    { id: '2a', label: 'Terikat Membran', position: { x: 50, y: 250 } },
    { id: '2b', label: 'Organel', position: { x: 120, y: 250 } },
    { id: '3a', label: 'Sintesis ATP', position: { x: 250, y: 250 } },
    { id: '4a', label: 'Umpan Balik', position: { x: 380, y: 250 } },
    { id: '4b', label: 'Sinyal Hormonal', position: { x: 480, y: 250 } }
  ],
  timeline: [
    { id: 'bt1', date: 'Detik 0', title: 'Peristiwa Pengikatan Ligan', description: 'Hormon menempel pada domain ekstraseluler dari reseptor transmembran.' },
    { id: 'bt2', date: 'Detik 5', title: 'Aktivasi Pembawa Pesan Kedua', description: 'Perubahan konformasi memicu pelepasan cAMP di dalam sitoplasma.' },
    { id: 'bt3', date: 'Menit 1', title: 'Respons Transkripsional', description: 'Faktor transkripsi yang ditranslokasikan mengikat promotor, memulai ekspresi gen.' }
  ]
});

const getMathPipeline = (title: string): AIPipelineResult => ({
  summary: `# Ringkasan: ${title}

Analisis matematika ini mencakup teorema dasar, derivasi rumus, dan teknik aplikasi.

## Landasan Teoretis
1. **Aksioma Utama**: Asumsi dan definisi dasar yang membentuk fondasi sistem ini.
2. **Mekanisme Pembuktian**: Progresi logis yang ketat yang digunakan untuk membuktikan teorema.
3. **Kerangka Komputasi**: Bagaimana model matematika dirumuskan dan dipecahkan secara numerik.

## Wawasan Vital
- Derivasi menunjukkan bahwa sifat lokal berskala untuk menentukan geometri global.
- Batasan dan kondisi batas harus ditetapkan sebelum melakukan integrasi.`,
  quizzes: [
    {
      id: 'm1',
      question: 'Kondisi mana yang sangat diperlukan untuk menjamin konvergensi dalam sistem ini?',
      options: [
        'Domain harus tidak terbatas',
        'Fungsi harus kontinu secara ketat dan terbatas pada interval tertutup',
        'Turunannya harus bernilai positif di semua titik',
        'Variabel harus mendekati tak terhingga'
      ],
      correctOptionIndex: 1,
      explanation: 'Di bawah Teorema Nilai Ekstrim, kontinuitas pada interval tertutup yang terbatas diperlukan untuk menjamin konvergensi.'
    },
    {
      id: 'm2',
      question: 'Apa arti kondisi batas dalam model matematika ini?',
      options: [
        'Titik di mana teorema tersebut gagal',
        'Singularitas yang membatalkan semua perhitungan',
        'Batasan kendala yang mendefinisikan ruang solusi',
        'Konstanta acak yang tidak berarti'
      ],
      correctOptionIndex: 2,
      explanation: 'Kondisi batas berfungsi sebagai batasan spesifik yang diperlukan untuk mengisolasi solusi unik dari sekumpulan fungsi umum.'
    }
  ],
  flashcards: [
    { id: 'mf1', front: 'Sebutkan Teorema Dasar Kalkulus (Bagian 1).', back: 'Jika F(x) adalah integral dari f(t) dari a ke x, maka F\'(x) = f(x).', mastered: false },
    { id: 'mf2', front: 'Apa definisi limit dari sebuah turunan?', back: 'f\'(x) = lim(h->0) [f(x+h) - f(x)] / h.', mastered: false }
  ],
  mindmap: [
    { id: '1', label: title, position: { x: 250, y: 50 } },
    { id: '2', label: 'Aksioma', position: { x: 100, y: 150 } },
    { id: '3', label: 'Derivasi', position: { x: 250, y: 150 } },
    { id: '4', label: 'Penerapan', position: { x: 400, y: 150 } },
    { id: '2a', label: 'Kontinuitas', position: { x: 50, y: 250 } },
    { id: '2b', label: 'Batas Nilai', position: { x: 120, y: 250 } },
    { id: '3a', label: 'Integrasi', position: { x: 250, y: 250 } },
    { id: '4a', label: 'Optimasi', position: { x: 380, y: 250 } },
    { id: '4b', label: 'Simulasi', position: { x: 480, y: 250 } }
  ],
  timeline: [
    { id: 'mt1', date: 'Langkah 1', title: 'Tentukan Fungsi', description: 'Tetapkan kontinuitas dan tentukan batas-batas interval domain.' },
    { id: 'mt2', date: 'Langkah 2', title: 'Terapkan Teorema Nilai Rata-rata', description: 'Tunjukkan bahwa ada titik c di mana turunan sama dengan laju perubahan rata-rata.' },
    { id: 'mt3', date: 'Langkah 3', title: 'Evaluasi Batas Limit', description: 'Ambil limit saat interval mendekati nol untuk menyelesaikan bukti.' }
  ]
});

const getDefaultPipeline = (title: string): AIPipelineResult => ({
  summary: `# Ringkasan: ${title}

Sintesis intelektual dari poin-poin penting, metodologi, dan hasil yang diuraikan dalam dokumen ini.

## Konsep Penting
1. **Mekanisme Struktural Inti**: Fondasi utama yang menjadi dasar topik ini.
2. **Metodologi dan Penerapan**: Bagaimana kerangka kerja ini dioperasikan dalam praktik.
3. **Implikasi**: Dampak jangka panjang yang lebih luas pada disiplin ilmu yang berdekatan.

## Poin Penting
- Subjek ini memerlukan pendekatan multi-aspek, menyeimbangkan konstruksi teoretis dan penerapan praktis.
- Siklus tinjauan berulang direkomendasikan untuk mencapai penguasaan optimal.`,
  quizzes: [
    {
      id: 'd1',
      question: 'Metodologi utama apa yang dianjurkan dalam ulasan ini?',
      options: [
        'Kontemplasi teoretis murni tanpa pengujian di dunia nyata',
        'Siklus umpan balik berulang yang menyeimbangkan kerja konseptual dan praktis',
        'Penyalinan langsung kerangka kerja lama tanpa perubahan',
        'Eksperimen uji coba acak'
      ],
      correctOptionIndex: 1,
      explanation: 'Sistem menyoroti bahwa menggabungkan fondasi konseptual yang kuat dengan eksekusi aktif menghasilkan retensi ingatan tertinggi.'
    },
    {
      id: 'd2',
      question: 'Faktor mana yang paling kritis untuk memahami implikasi dari studi ini?',
      options: [
        'Bagaimana studi ini menantang batas-batas pemikiran konvensional',
        'Kecepatan implementasi awal program',
        'Biaya finansial dari penelitian',
        'Panjang laporan akhir'
      ],
      correctOptionIndex: 0,
      explanation: 'Nilainya terletak pada dampak jangka panjang dari model konseptualnya dan bagaimana mereka membentuk kembali praktik di sekitarnya.'
    }
  ],
  flashcards: [
    { id: 'df1', front: 'Apa itu Active Recall?', back: 'Teknik pengujian di mana Anda secara aktif memanggil kembali informasi dari ingatan, alih-alih membaca ulang secara pasif.', mastered: false },
    { id: 'df2', front: 'Apa itu Spaced Repetition?', back: 'Teknik belajar berbasis bukti dengan flashcard di mana interval peninjauan tumbuh semakin besar seiring waktu.', mastered: false }
  ],
  mindmap: [
    { id: '1', label: title, position: { x: 250, y: 50 } },
    { id: '2', label: 'Landasan', position: { x: 100, y: 150 } },
    { id: '3', label: 'Metode', position: { x: 250, y: 150 } },
    { id: '4', label: 'Dampak', position: { x: 400, y: 150 } },
    { id: '2a', label: 'Aksioma Inti', position: { x: 50, y: 250 } },
    { id: '2b', label: 'Batas Ruang', position: { x: 120, y: 250 } },
    { id: '3a', label: 'Praktik Aktif', position: { x: 250, y: 250 } },
    { id: '4a', label: 'Pergeseran Konseptap', position: { x: 380, y: 250 } },
    { id: '4b', label: 'Riset Masa Depan', position: { x: 480, y: 250 } }
  ],
  timeline: [
    { id: 'dt1', date: 'Tahap Awal', title: 'Setup Konseptual', description: 'Mengidentifikasi istilah-istilah kunci, premis dasar, dan preseden historis.' },
    { id: 'dt2', date: 'Tahap Menengah', title: 'Pengujian Aktif', description: 'Mengerjakan pertanyaan latihan dan memetakan koneksi antar topik.' },
    { id: 'dt3', date: 'Tahap Lanjutan', title: 'Sintesis Sistem', description: 'Mengintegrasikan wawasan ke dalam model mental yang lengkap.' }
  ]
});

// Interactive AI Tutor Mock Chat Replies in Indonesian
export const generateTutorReply = async (
  mode: string,
  userMessage: string,
  chatHistory: { sender: string; content: string }[]
): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const msg = userMessage.toLowerCase();

  switch (mode) {
    case 'simple':
      if (msg.includes('kuantum') || msg.includes('quantum') || msg.includes('fisika')) {
        return `Fisika kuantum adalah ilmu tentang hal-hal yang sangat kecil. Bayangkan atom seperti balok bangunan kecil. Berbeda dengan balok biasa, balok kuantum bisa berada di dua tempat sekaligus (superposisi) atau berbicara secara instan satu sama lain melintasi ruang (keterikatan/entanglement). Kita menggunakannya untuk membuat komputer super cepat!`;
      }
      return `Berikut adalah penjelasan yang disederhanakan. Mari kita bagi menjadi satu poin mendasar: ambil konsep utama, hilangkan istilah rumit, dan hubungkan dengan analogi sederhana. Bayangkan seperti rantai: setiap mata rantai bergantung pada mata rantai sebelumnya agar seluruh struktur tetap kokoh. Apakah visualisasi ini masuk akal?`;

    case 'teacher':
      return `Mari kita bahas ini langkah-demi-langkah.
      
### 1. Konsep Inti
Bayangkan topik ini seperti pohon. Akar mewakili aturan dasar, batang adalah teori utama, dan cabang-cabangnya adalah aplikasi spesifik.

### 2. Contoh Praktis
Jika Anda merancang tata letak situs web, struktur CSS adalah tulang punggungnya. Jika aturan dasarnya berantakan, semuanya akan bergeser secara tidak terduga.

### 3. Kuis Singkat
Mengapa menurut Anda sistem akan rusak jika elemen root tidak diatur dengan benar? Coba tebak!`;

    case 'professor':
      return `Untuk mengevaluasi fenomena ini secara menyeluruh, kita harus merujuk pada kerangka kerja teoretis utama berikut:
      
$$\\psi(x, t) = \\sum_{n} c_n \\phi_n(x) e^{-i E_n t / \\hbar}$$

Secara historis, hal ini dianalisis melalui lensa struktural-fungsionalisme. Sistem eksis dalam keadaan keseimbangan dinamis. Mari kita analisis tiga aksioma dasar:
1. **Ortogonalitas Jalur Keadaan**: Setiap variabel bersifat independen sebelum ada kopling silang yang diperkenalkan.
2. **Kendala Batas**: Kondisi batas harus ditentukan di ujung domain untuk mencegah terjadinya divergensi.
3. **Disipasi Entropi**: Seiring waktu, efisiensi sistem akan menurun kecuali ada suplai energi eksternal (input) yang diberikan.

Bagaimana pendapat Anda tentang bagaimana model ini berperilaku ketika kondisi batas bersifat dinamis?`;

    case 'exam':
      return `Berikut adalah pertanyaan latihan untuk menguji pemahaman Anda tentang topik ini:

**Pertanyaan:** Dalam sistem yang mengalami adaptasi umpan balik cepat, apa konsekuensi utama dari memperkenalkan penundaan waktu (time delay) pada jalur umpan balik negatif?

* A) Sistem langsung stabil secara instan.
* B) Sistem menunjukkan perilaku osilasi dan potensi ketidakstabilan.
* C) Sistem mati sepenuhnya untuk mencegah beban berlebih.
* D) Efisiensi energi dioptimalkan secara otomatis.

Balas dengan pilihan huruf Anda dan jelaskan alasan logis Anda!`;

    case 'debate':
      return `Saya paham maksud Anda, tapi mari kita lihat dari sudut pandang sebaliknya.
      
Jika kita menerima bahwa pendorong utamanya adalah murni faktor struktural, maka pilihan individu menjadi tidak relevan. Namun, studi empiris menunjukkan bahwa pilihan lokal kecil dapat berakumulasi untuk mengubah seluruh sistem makro.

Bagaimana Anda mendamaikan ketegangan ini? Jika sistem makro mendikte segalanya, di mana letak kebebasan memilih dari individu?`;

    default:
      return `Saya di sini untuk membimbing studi Anda. Ajukan pertanyaan apa pun, atau pilih salah satu mode khusus seperti Profesor atau Ujian untuk memulai sesi!`;
  }
};
