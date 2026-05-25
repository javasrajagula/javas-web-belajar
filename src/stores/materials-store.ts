import { create } from 'zustand';
import { Material } from '@/types';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { generateAIPipeline } from '@/lib/ai-mock';

const INDONESIAN_CURRICULUM_MATERIALS: Material[] = [
  // --- KELAS 10 ---
  {
    id: 'm-mat-10',
    title: 'Eksponen dan Logaritma (Matematika Kelas 10 - Fase E)',
    fileName: 'matematika_10_eksponen_logaritma.pdf',
    fileType: 'pdf',
    fileSize: '1.4 MB',
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    content: 'Materi eksponen membahas perkalian berulang suatu bilangan. Persamaan eksponen berbentuk a^f(x) = a^g(x) diselesaikan dengan menyamakan basis. Logaritma adalah kebalikan dari eksponen, ditulis a_log b = c jika dan hanya jika a^c = b. Sifat-sifat logaritma digunakan untuk menyederhanakan hitungan rumit.',
    summary: `# Eksponen dan Logaritma — Matematika Kelas 10 (Fase E)

Bab ini membahas sifat-sifat eksponen (bilangan berpangkat) dan logaritma sebagai landasan aljabar dalam Kurikulum Merdeka.

## Konsep Utama
1. **Sifat-Sifat Eksponen**: Perkalian pangkat ($a^m \\times a^n = a^{m+n}$), pembagian pangkat ($a^m / a^n = a^{m-n}$), dan pangkat negatif ($a^{-n} = 1/a^n$).
2. **Persamaan Eksponen**: Menyelesaikan nilai variabel pada pangkat dengan menyamakan basis kiri dan kanan.
3. **Konsep Logaritma**: Operasi invers dari eksponen. Menyelesaikan persamaan \${^a}\\log(b) = c$ yang setara dengan $a^c = b$.

## Aplikasi Praktis
- Menghitung pertumbuhan bakteri (eksponensial).
- Mengukur tingkat keasaman (pH) dalam Kimia menggunakan rumus logaritma negatif.
- Skala Richter untuk mengukur kekuatan gempa bumi.`,
    mindmap: [
      { id: '1', label: 'Eksponen & Logaritma', position: { x: 250, y: 50 } },
      { id: '2', label: 'Eksponen', position: { x: 120, y: 150 } },
      { id: '3', label: 'Logaritma', position: { x: 380, y: 150 } },
      { id: '2a', label: 'Pertumbuhan', position: { x: 50, y: 250 } },
      { id: '3a', label: 'Skala pH', position: { x: 450, y: 250 } }
    ],
    timeline: [
      { id: 'mt10-1', date: 'Konsep Awal', title: 'Pemahaman Pangkat', description: 'Menguasai perkalian berulang bilangan bulat sebelum masuk ke bentuk akar.' },
      { id: 'mt10-2', date: 'Evaluasi 1', title: 'Grafik Fungsi Eksponen', description: 'Menggambar grafik pertumbuhan dan peluruhan eksponensial di koordinat Kartesius.' },
      { id: 'mt10-3', date: 'Evaluasi 2', title: 'Aplikasi Logaritma', description: 'Menyederhanakan perhitungan perkalian besar menjadi penjumlahan menggunakan sifat logaritma.' }
    ],
    quizzes: [
      {
        id: 'q-mat10-1',
        question: 'Berapakah nilai dari ${^2}\\log(32)?$',
        options: ['3', '4', '5', '6'],
        correctOptionIndex: 2,
        explanation: 'Karena 2 pangkat 5 adalah 32 (2^5 = 32), maka ${^2}\\log(32) = 5.'
      }
    ],
    flashcards: [
      { id: 'fc-mat10-1', front: 'Rumus dasar logaritma: ${^a}\\log(b) = c$', back: 'Sama dengan a^c = b dengan syarat a > 0, a != 1, b > 0.', mastered: false }
    ]
  },
  {
    id: 'm-fis-10',
    title: 'Kimia Hijau dalam Pembangunan Berkelanjutan (IPA Kelas 10)',
    fileName: 'ipa_10_kimia_hijau.docx',
    fileType: 'docx',
    fileSize: '890 KB',
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    content: 'Kimia Hijau (Green Chemistry) adalah pendekatan untuk merancang produk dan proses kimia yang mengurangi atau menghilangkan penggunaan dan pembuatan zat berbahaya. Prinsip kimia hijau mencakup pencegahan limbah, ekonomi atom, sintesis kimia yang kurang berbahaya, dan penggunaan bahan baku terbarukan.',
    summary: `# Kimia Hijau dalam Pembangunan Berkelanjutan (Kelas 10)

Materi IPA terpadu Kurikulum Merdeka yang membahas pentingnya menjaga kelestarian lingkungan melalui kimia ramah lingkungan.

## 12 Prinsip Kimia Hijau
1. **Mencegah Limbah**: Lebih baik mencegah terbentuknya limbah daripada mengolahnya setelah terbentuk.
2. **Ekonomi Atom**: Memaksimalkan proporsi bahan baku menjadi produk akhir yang berguna.
3. **Penggunaan Pelarut Aman**: Memilih pelarut yang tidak berbahaya bagi kesehatan dan lingkungan.
4. **Bahan Baku Terbarukan**: Mengutamakan bahan baku dari sumber daya alam hayati yang dapat diperbarui.

## Relevansi Pembangunan
Kimia hijau berperan penting dalam mencapai tujuan SDG (Sustainable Development Goals), terutama dalam penanganan perubahan iklim dan konsumsi energi ramah lingkungan.`,
    mindmap: [
      { id: '1', label: 'Kimia Hijau', position: { x: 250, y: 50 } },
      { id: '2', label: 'Prinsip Pencegahan', position: { x: 120, y: 150 } },
      { id: '3', label: 'SDGs PBB', position: { x: 380, y: 150 } }
    ],
    timeline: [
      { id: 'ft10-1', date: 'Minggu 1', title: 'Pengenalan Polusi', description: 'Menganalisis dampak industri konvensional terhadap lingkungan sekitar sekolah.' },
      { id: 'ft10-2', date: 'Minggu 2', title: '12 Prinsip Inti', description: 'Membedah prinsip dasar kimia hijau beserta contoh penerapannya di rumah.' }
    ],
    quizzes: [
      {
        id: 'q-fis10-1',
        question: 'Prinsip kimia hijau yang menekankan minimalisasi sisa bahan kimia yang tidak terpakai menjadi limbah disebut...',
        options: ['Ekonomi Atom', 'Pencegahan Limbah', 'Sintesis Kurang Berbahaya', 'Katalisis'],
        correctOptionIndex: 1,
        explanation: 'Pencegahan limbah berfokus pada meminimalkan terbentuknya limbah sejak awal proses produksi.'
      }
    ],
    flashcards: [
      { id: 'fc-fis10-1', front: 'Apa definisi Ekonomi Atom?', back: 'Metode evaluasi efisiensi konversi bahan baku di mana seluruh atom bahan awal diusahakan masuk ke produk akhir.', mastered: false }
    ]
  },

  // --- KELAS 11 ---
  {
    id: 'm-mat-11',
    title: 'Fungsi Komposisi dan Invers (Matematika Kelas 11 - Fase F)',
    fileName: 'matematika_11_fungsi_invers.pdf',
    fileType: 'pdf',
    fileSize: '1.6 MB',
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    content: 'Fungsi komposisi menggabungkan dua fungsi atau lebih secara berurutan, ditulis (f o g)(x) = f(g(x)). Fungsi invers adalah fungsi kebalikan dari fungsi asal, ditulis f^-1(x). Syarat suatu fungsi memiliki invers adalah fungsi tersebut harus berupa korespondensi satu-satu.',
    summary: `# Fungsi Komposisi dan Invers — Matematika Kelas 11

Pembahasan mendalam tentang operasi aljabar fungsi gabungan dan kebalikan fungsi matematika.

## Poin Penting
- **Komposisi Fungsi $(f \\circ g)(x)$**: Memasukkan output fungsi $g(x)$ ke dalam input fungsi $f(x)$. Operasi ini umumnya tidak komutatif ($f \\circ g \\neq g \\circ f$).
- **Fungsi Invers $f^{-1}(x)$**: Membalik arah relasi fungsi. Jika $f(x) = y$, maka $f^{-1}(y) = x$.
- **Syarat Invers**: Fungsi harus bersifat bijektif (satu-satu dan pada).

## Alur Penyelesaian Invers
1. Ubah persamaan fungsi menjadi $y = f(x)$.
2. Selesaikan persamaan hingga diperoleh $x$ sebagai fungsi dari $y$ ($x = g(y)$).
3. Ganti variabel $x$ dengan $f^{-1}(x)$ dan variabel $y$ dengan $x$.`,
    mindmap: [
      { id: '1', label: 'Operasi Fungsi', position: { x: 250, y: 50 } },
      { id: '2', label: 'Komposisi (f o g)', position: { x: 120, y: 150 } },
      { id: '3', label: 'Invers (f^-1)', position: { x: 380, y: 150 } }
    ],
    timeline: [
      { id: 'mt11-1', date: 'Sesi Awal', title: 'Domain & Kodomain', description: 'Memahami batasan nilai input dan output yang diizinkan untuk suatu fungsi.' },
      { id: 'mt11-2', date: 'Sesi Latihan', title: 'Komposisi 3 Fungsi', description: 'Memecahkan nilai dari gabungan tiga fungsi berurutan (f o g o h)(x).' }
    ],
    quizzes: [
      {
        id: 'q-mat11-1',
        question: 'Jika f(x) = 2x + 3, berapakah fungsi invers f^-1(x)?',
        options: ['(x - 3) / 2', '(x + 3) / 2', '2x - 3', '3x - 2'],
        correctOptionIndex: 0,
        explanation: 'y = 2x + 3 -> y - 3 = 2x -> x = (y - 3)/2. Maka f^-1(x) = (x - 3)/2.'
      }
    ],
    flashcards: [
      { id: 'fc-mat11-1', front: 'Apakah (f o g)(x) sama dengan (g o f)(x)?', back: 'Tidak, komposisi fungsi bersifat non-komutatif (urutannya penting).', mastered: false }
    ]
  },
  {
    id: 'm-smk-rpl',
    title: 'Pemrograman Berorientasi Objek / OOP (SMK RPL Kelas 11)',
    fileName: 'smk_rpl_oop_dasar.pdf',
    fileType: 'pdf',
    fileSize: '2.1 MB',
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    content: 'Pemrograman Berorientasi Objek (Object-Oriented Programming) adalah paradigma pemrograman berdasarkan konsep objek. Konsep utama OOP meliputi Class, Object, Encapsulation, Inheritance, Polymorphism, dan Abstraction. OOP mempermudah pengelolaan kode berskala besar.',
    summary: `# Pemrograman Berorientasi Objek (OOP) — SMK RPL Kelas 11

Materi produktif Rekayasa Perangkat Lunak yang membahas teknik pembuatan kode modular menggunakan objek.

## 4 Pilar Utama OOP
1. **Encapsulation (Pembungkusan)**: Membatasi akses langsung ke data dengan membuat properti \`private\` dan menyediakan metode \`getter\` dan \`setter\`.
2. **Inheritance (Pewarisan)**: Mewariskan atribut dan metode dari kelas induk (Parent Class) ke kelas anak (Child Class) untuk mencegah duplikasi kode.
3. **Polymorphism (Banyak Bentuk)**: Kemampuan objek memiliki metode dengan nama yang sama tetapi perilaku berbeda (melalui Overriding atau Overloading).
4. **Abstraction (Abstraksi)**: Menyembunyikan detail implementasi internal dan hanya menampilkan fungsi penting kepada pengguna.

## Contoh Kode (Java/C#)
\`\`\`java
// Contoh pewarisan class
class Hewan {
    void bersuara() { System.out.println("Hewan bersuara"); }
}
class Kucing extends Hewan {
    @Override
    void bersuara() { System.out.println("Meow!"); }
}
\`\`\``,
    mindmap: [
      { id: '1', label: 'Paradigma OOP', position: { x: 250, y: 50 } },
      { id: '2', label: 'Class & Object', position: { x: 100, y: 150 } },
      { id: '3', label: '4 Pilar OOP', position: { x: 400, y: 150 } },
      { id: '3a', label: 'Encapsulation', position: { x: 300, y: 250 } },
      { id: '3b', label: 'Inheritance', position: { x: 380, y: 250 } },
      { id: '3c', label: 'Polymorphism', position: { x: 460, y: 250 } },
      { id: '3d', label: 'Abstraction', position: { x: 540, y: 250 } }
    ],
    timeline: [
      { id: 'smk-1', date: 'Modul 1', title: 'Kelas & Objek', description: 'Belajar membuat cetakan biru (Class) dan turunannya (Object) dalam memori.' },
      { id: 'smk-2', date: 'Modul 2', title: 'Implementasi Pewarisan', description: 'Membuat program sistem perpustakaan dengan superclass Buku dan subclass Novel/Komik.' }
    ],
    quizzes: [
      {
        id: 'q-smk-1',
        question: 'Pilar OOP yang berfungsi menyembunyikan detail pengerjaan internal dan hanya menampilkan fitur luar saja adalah...',
        options: ['Inheritance', 'Encapsulation', 'Polymorphism', 'Abstraction'],
        correctOptionIndex: 3,
        explanation: 'Abstraction menyembunyikan pengerjaan internal menggunakan abstrak kelas atau interface.'
      }
    ],
    flashcards: [
      { id: 'fc-smk-1', front: 'Apa itu Overriding?', back: 'Menulis ulang metode kelas induk di dalam kelas anak untuk menyesuaikan fungsinya.', mastered: false }
    ]
  },

  // --- KELAS 12 ---
  {
    id: 'm-mat-12',
    title: 'Turunan Fungsi Aljabar (Matematika Kelas 12 - Fase F)',
    fileName: 'matematika_12_turunan_aljabar.pdf',
    fileType: 'pdf',
    fileSize: '1.8 MB',
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    content: 'Turunan fungsi aljabar f\'(x) didefinisikan sebagai limit h mendekati 0 dari [f(x+h) - f(x)] / h. Aturan turunan meliputi f(x) = ax^n -> f\'(x) = anx^(n-1). Turunan digunakan untuk menentukan kemiringan garis singgung, titik stasioner, dan laju perubahan nilai.',
    summary: `# Turunan Fungsi Aljabar — Matematika Kelas 12

Topik kalkulus penting mengenai laju perubahan instan dari suatu fungsi aljabar kontinu.

## Rumus Dasar Turunan
- **Fungsi Pangkat**: Jika $f(x) = ax^n$, maka $f'(x) = anx^{n-1}$.
- **Aturan Perkalian**: Jika $y = u \\cdot v$, maka $y' = u'v + uv'$.
- **Aturan Pembagian**: Jika $y = u / v$, maka $y' = (u'v - uv') / v^2$.
- **Aturan Rantai**: Untuk komposisi fungsi $y = f(g(x))$, turunan bernilai $y' = f'(g(x)) \\cdot g'(x)$.

## Aplikasi Turunan
1. **Gradien Garis Singgung ($m$)**: Nilai turunan di titik singgung ($m = f'(x_1)$).
2. **Titik Stasioner**: Terjadi saat laju perubahan bernilai nol ($f'(x) = 0$). Digunakan untuk mencari nilai maksimum dan minimum fungsi.
3. **Kecepatan & Percepatan**: Turunan pertama posisi terhadap waktu adalah kecepatan; turunan keduanya adalah percepatan.`,
    mindmap: [
      { id: '1', label: 'Turunan Kalkulus', position: { x: 250, y: 50 } },
      { id: '2', label: 'Aturan Rumus', position: { x: 120, y: 150 } },
      { id: '3', label: 'Aplikasi Praktis', position: { x: 380, y: 150 } }
    ],
    timeline: [
      { id: 'mt12-1', date: 'Pertemuan 1', title: 'Limit Definisi Turunan', description: 'Membuktikan rumus pangkat menggunakan limit diferensial h mendekati 0.' },
      { id: 'mt12-2', date: 'Pertemuan 2', title: 'Stasioner & Nilai Ekstrim', description: 'Menggunakan turunan pertama untuk mencari titik puncak bukit dan lembah grafik fungsi.' }
    ],
    quizzes: [
      {
        id: 'q-mat12-1',
        question: 'Berapakah turunan pertama dari f(x) = 3x^2 + 5x - 7?',
        options: ['f\'(x) = 6x + 5', 'f\'(x) = 3x + 5', 'f\'(x) = 6x^2 + 5', 'f\'(x) = 6x - 7'],
        correctOptionIndex: 0,
        explanation: 'Menggunakan rumus pangkat: d/dx(3x^2) = 6x, d/dx(5x) = 5, d/dx(-7) = 0. Jadi f\'(x) = 6x + 5.'
      }
    ],
    flashcards: [
      { id: 'fc-mat12-1', front: 'Kapan suatu grafik fungsi dikatakan naik?', back: 'Saat nilai turunan pertamanya lebih besar dari nol, yaitu f\'(x) > 0.', mastered: false }
    ]
  },
  {
    id: 'm-kim-12',
    title: 'Sel Volta dan Elektrokimia (Kimia Kelas 12 - Fase F)',
    fileName: 'kimia_12_sel_volta.pdf',
    fileType: 'pdf',
    fileSize: '1.9 MB',
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    content: 'Elektrokimia mempelajari hubungan antara reaksi kimia dengan arus listrik. Sel Volta (Sel Galvani) adalah sel elektrokimia yang mengubah reaksi kimia spontan menjadi energi listrik. Katode bermuatan positif (tempat reduksi) dan Anode bermuatan negatif (tempat oksidasi).',
    summary: `# Sel Volta dan Elektrokimia — Kimia Kelas 12

Pembelajaran mengenai konversi energi kimia hasil reaksi redoks spontan menjadi daya energi listrik searah.

## Struktur Sel Volta
- **Anode (-)**: Elektrode tempat terjadinya reaksi **oksidasi** (pelepasan elektron).
- **Katode (+)**: Elektrode tempat terjadinya reaksi **reduksi** (penangkapan elektron).
- **Jembatan Garam**: Menjaga kenetralan muatan listrik dengan menyalurkan kation/anion ke masing-masing wadah sel setengah reaksi.
- **Arah Aliran Elektron**: Mengalir secara spontan dari Anode (-) menuju Katode (+).

## Potensial Sel Standar ($E^0_{sel}$)
Diukur menggunakan rumus:
$$E^0_{sel} = E^0_{reduksi} - E^0_{oksidasi}$$
$$E^0_{sel} = E^0_{katode} - E^0_{anode}$$
Reaksi redoks dinyatakan spontan jika nilai $E^0_{sel}$ bernilai positif ($> 0$).`,
    mindmap: [
      { id: '1', label: 'Elektrokimia', position: { x: 250, y: 50 } },
      { id: '2', label: 'Katode (Reduksi)', position: { x: 100, y: 150 } },
      { id: '3', label: 'Anode (Oksidasi)', position: { x: 400, y: 150 } }
    ],
    timeline: [
      { id: 'kt12-1', date: 'Praktikum 1', title: 'Sel Baterai Buah', description: 'Membuat baterai sederhana menggunakan lemon, paku besi (anode), dan koin tembaga (katode).' },
      { id: 'kt12-2', date: 'Teori 1', title: 'Tabel Deret Volta', description: 'Menghafalkan posisi logam pada deret Volta untuk menentukan kekuatan reduktor/oksidator.' }
    ],
    quizzes: [
      {
        id: 'q-kim12-1',
        question: 'Pada Sel Volta, elektrode tempat terjadinya reaksi reduksi (penangkapan elektron) disebut...',
        options: ['Anode', 'Katode', 'Jembatan Garam', 'Larutan Elektrolit'],
        correctOptionIndex: 1,
        explanation: 'Reduksi selalu terjadi di Katode. Oksidasi terjadi di Anode. Singkatan mudah: KARET (Katode Reduksi) dan ANOS (Anode Oksidasi).'
      }
    ],
    flashcards: [
      { id: 'fc-kim12-1', front: 'Apa fungsi jembatan garam dalam Sel Volta?', back: 'Menyetarakan kelebihan kation/anion di dalam larutan setengah sel agar aliran listrik terus mengalir.', mastered: false }
    ]
  }
];

interface MaterialsState {
  materials: Material[];
  isProcessing: boolean;
  addMaterial: (title: string, content: string, fileType: 'pdf' | 'docx' | 'image' | 'text', fileName: string, fileSize: string) => Promise<string>;
  deleteMaterial: (id: string) => void;
  updateFlashcardStatus: (materialId: string, flashcardId: string, mastered: boolean) => void;
}

export const useMaterialsStore = create<MaterialsState>((set, get) => {
  const initialMaterials = getStorageItem<Material[]>('academy_os_materials', INDONESIAN_CURRICULUM_MATERIALS);

  return {
    materials: initialMaterials,
    isProcessing: false,

    addMaterial: async (title, content, fileType, fileName, fileSize) => {
      set({ isProcessing: true });
      try {
        const pipelineResult = await generateAIPipeline(title, content);
        const newId = `m-${Date.now()}`;
        const newMaterial: Material = {
          id: newId,
          title,
          fileName,
          fileType,
          fileSize,
          uploadedAt: new Date().toISOString(),
          content,
          ...pipelineResult
        };

        const updated = [newMaterial, ...get().materials];
        set({ materials: updated, isProcessing: false });
        setStorageItem('academy_os_materials', updated);
        return newId;
      } catch (error) {
        set({ isProcessing: false });
        console.error('Error generating material items:', error);
        throw error;
      }
    },

    deleteMaterial: (id) => set((state) => {
      const updated = state.materials.filter((m) => m.id !== id);
      setStorageItem('academy_os_materials', updated);
      return { materials: updated };
    }),

    updateFlashcardStatus: (materialId, flashcardId, mastered) => set((state) => {
      const updated = state.materials.map((m) => {
        if (m.id === materialId) {
          const updatedFlashcards = m.flashcards.map((fc: any) => 
            fc.id === flashcardId ? { ...fc, mastered } : fc
          );
          return { ...m, flashcards: updatedFlashcards };
        }
        return m;
      });
      setStorageItem('academy_os_materials', updated);
      return { materials: updated };
    })
  };
});
