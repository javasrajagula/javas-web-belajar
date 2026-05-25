'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMaterialsStore } from '@/stores/materials-store';
import { useUserStore } from '@/stores/user-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileUp, 
  Search, 
  Trash2, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';

export default function SecondBrainPage() {
  const { materials, isProcessing, addMaterial, deleteMaterial } = useMaterialsStore();
  const { updateQuestProgress } = useUserStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');

  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsUploading(true);
    try {
      const sizeStr = `${(content.length / 1024).toFixed(1)} KB`;
      await addMaterial(
        title,
        content,
        'text',
        fileName || 'temp_paste.txt',
        sizeStr
      );
      updateQuestProgress('planner', 1); // target upload quest
      setTitle('');
      setContent('');
      setFileName('');
      setIsUploading(false);
    } catch (err) {
      setIsUploading(false);
      console.error(err);
    }
  };

  const filteredMaterials = materials.filter(
    (mat) =>
      mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary border border-border p-4 rounded-lg">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 text-text-tertiary" size={16} />
          <input
            type="text"
            placeholder="Cari materi, ringkasan, atau potongan isi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-10 pr-4 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="text-xs font-mono text-text-secondary">
          Ukuran Indeks: <span className="text-accent font-semibold">{materials.length} berkas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary">Proses Bahan Belajar</h3>
              <p className="text-[11px] text-text-secondary">Impor dokumen teks atau catatan baru. AI akan membagi materi, merangkum, dan menghasilkan kuis serta kartu belajar.</p>
            </div>

            <form onSubmit={handleManualUpload} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Judul Materi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Mekanisme Replikasi DNA"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 px-3 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Nama File Sumber (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: kuliah_dna_4.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full h-9 px-3 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase">Salin Isi Materi Belajar</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Tempel catatan kuliah, kutipan buku, atau transkrip pelajaran di sini..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <Button type="submit" disabled={isUploading || isProcessing} className="w-full h-10 text-xs flex items-center gap-1.5 justify-center">
                <FileUp size={14} /> {isUploading || isProcessing ? 'AI sedang merangkum materi...' : 'Suntikkan ke Otak Kedua'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Columns: Grid */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary">Perpustakaan Otak Kedua</h3>

            {isProcessing && (
              <div className="space-y-3 p-4 border border-border rounded-lg bg-bg-tertiary/20">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1 text-accent font-semibold">
                    <Sparkles size={12} className="animate-pulse" /> AI Sedang Mengekstrak Konsep Utama...
                  </span>
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            )}

            {filteredMaterials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-4 border border-border rounded-lg bg-bg-tertiary/20 hover:bg-bg-tertiary/40 transition-all duration-150 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Badge variant="primary" className="text-[9px]">
                          {mat.fileType}
                        </Badge>
                        <button
                          onClick={() => deleteMaterial(mat.id)}
                          title="Hapus berkas"
                          className="text-text-tertiary hover:text-danger p-1 hover:bg-danger-subtle/10 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-text-primary mt-2.5 truncate">
                        {mat.title}
                      </h4>
                      <p className="text-[10px] text-text-secondary mt-1 truncate">
                        {mat.fileName} • {mat.fileSize}
                      </p>
                      <p className="text-[11px] text-text-tertiary mt-2 line-clamp-3 leading-relaxed">
                        {mat.content}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                      <span className="text-[9px] font-mono text-text-tertiary">
                        {new Date(mat.uploadedAt).toLocaleDateString()}
                      </span>
                      <Link href={`/brain/${mat.id}`}>
                        <Button size="sm" className="h-7 text-[10px] px-2.5 flex items-center gap-1">
                          Buka Catatan <ArrowRight size={10} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !isProcessing && (
                <div className="text-center py-12 text-xs text-text-secondary border border-dashed border-border rounded-lg">
                  Tidak ada bahan belajar yang cocok dengan pencarian Anda.
                </div>
              )
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
