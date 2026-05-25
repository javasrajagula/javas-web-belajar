import { create } from 'zustand';
import { Material } from '@/types';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { generateAIPipeline } from '@/lib/ai-mock';

const DEFAULT_MATERIALS: Material[] = [
  {
    id: 'm-default-1',
    title: 'Pengantar Keadaan Kuantum',
    fileName: 'pengantar_keadaan_kuantum.pdf',
    fileType: 'pdf',
    fileSize: '1.2 MB',
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    content: 'Keadaan kuantum adalah entitas matematis yang memberikan distribusi probabilitas untuk hasil dari setiap pengukuran yang mungkin pada suatu sistem. Keadaan sistem mekanika kuantum dapat direpresentasikan sebagai vektor dalam ruang Hilbert...',
    summary: `# Pengantar Keadaan Kuantum

Keadaan kuantum merepresentasikan keadaan sistem fisik kuantum dalam istilah matematis.

## Elemen Inti
1. **Representasi Ruang Hilbert**: Keadaan kuantum dirumuskan sebagai vektor dalam ruang Hilbert yang kompleks.
2. **Prinsip Superposisi**: Sistem dapat menempati beberapa keadaan secara bersamaan sebelum pengukuran dilakukan.
3. **Fungsi Gelombang Probabilitas**: Nilai fungsi gelombang menunjukkan kemungkinan hasil pengukuran, bukan kepastian deterministik.`,
    mindmap: [
      { id: '1', label: 'Keadaan Kuantum', position: { x: 250, y: 50 } },
      { id: '2', label: 'Fungsi Gelombang', position: { x: 100, y: 150 } },
      { id: '3', label: 'Superposisi', position: { x: 250, y: 150 } },
      { id: '4', label: 'Pengukuran', position: { x: 400, y: 150 } }
    ],
    timeline: [
      { id: 't1', date: '1900', title: 'Postulat Planck', description: 'Max Planck mengusulkan bahwa energi diradiasikan dalam paket diskrit (kuanta).' },
      { id: 't2', date: '1925', title: 'Mekanika Matriks', description: 'Werner Heisenberg mengembangkan formulasi matriks dari mekanika kuantum.' },
      { id: 't3', date: '1926', title: 'Persamaan Schrödinger', description: 'Erwin Schrödinger mempublikasikan persamaan gelombang yang menggambarkan evolusi kuantum.' }
    ],
    quizzes: [
      {
        id: 'q-q1',
        question: 'Entitas matematis apa yang merepresentasikan suatu keadaan kuantum?',
        options: ['Nilai medan skalar', 'Vektor dalam ruang Hilbert', 'Garis bilangan real kontinu', 'Batas matriks statis'],
        correctOptionIndex: 1,
        explanation: 'Keadaan kuantum dirumuskan sebagai vektor keadaan dalam ruang Hilbert yang kompleks.'
      }
    ],
    flashcards: [
      { id: 'fc-1', front: 'Apa itu notasi Bra-Ket?', back: 'Notasi matematika standar untuk menggambarkan keadaan kuantum, diperkenalkan oleh Paul Dirac.', mastered: false }
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
  const initialMaterials = getStorageItem<Material[]>('academy_os_materials', DEFAULT_MATERIALS);

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
          const updatedFlashcards = m.flashcards.map((fc) => 
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
