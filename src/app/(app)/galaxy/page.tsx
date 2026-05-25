'use client';

import React, { useState, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useUserStore } from '@/stores/user-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';

// Custom Node component inside flow
const CustomTopicNode = ({ data }: any) => {
  const isMastered = data.mastery >= 80;
  const isStruggling = data.mastery < 60;
  
  return (
    <div className={`px-4 py-2.5 rounded-lg border shadow-md bg-bg-secondary min-w-[160px] transition-all duration-150 ${
      isMastered 
        ? 'border-success/40 hover:border-success' 
        : isStruggling 
          ? 'border-danger/40 hover:border-danger' 
          : 'border-accent/40 hover:border-accent'
    }`}>
      <div className="flex justify-between items-center text-[8px] font-mono text-text-secondary">
        <span>{data.grade}</span>
        <Badge variant={isMastered ? 'success' : isStruggling ? 'danger' : 'primary'} className="text-[7px]">
          {data.mastery}%
        </Badge>
      </div>
      <h4 className="text-[11px] font-bold text-text-primary mt-1.5 truncate">{data.label}</h4>
      <p className="text-[8px] text-text-tertiary mt-0.5 font-mono">{data.category}</p>
    </div>
  );
};

export default function KnowledgeGalaxyPage() {
  const [search, setSearch] = useState('');
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Expanded nodes mapping Indonesian curriculum subjects across grades
  const rawNodes = [
    // --- KELAS 10 ---
    { id: 'n-mat-10', label: 'Eksponen dan Logaritma', x: 100, y: 50, mastery: 88, category: 'Matematika', grade: 'KELAS 10 SMA', desc: 'Sifat-sifat eksponen berpangkat pecahan/akar, persamaan eksponensial, dan invers operasi berupa logaritma beserta aplikasinya.' },
    { id: 'n-fis-10', label: 'Kimia Hijau', x: 400, y: 50, mastery: 92, category: 'IPA Terpadu', grade: 'KELAS 10 SMA', desc: '12 Prinsip Kimia Hijau (Green Chemistry) untuk meminimalisasi limbah industri dan mendukung kelestarian alam SDGs.' },

    // --- KELAS 11 ---
    { id: 'n-mat-11', label: 'Fungsi Komposisi & Invers', x: 100, y: 200, mastery: 58, category: 'Matematika', grade: 'KELAS 11 SMA', desc: 'Operasi gabungan dua fungsi atau lebih (f o g)(x) dan pencarian nilai kebalikan fungsi bijektif f^-1(x).' },
    { id: 'n-smk-rpl', label: 'Object-Oriented Programming', x: 400, y: 200, mastery: 75, category: 'Produktif RPL', grade: 'KELAS 11 SMK', desc: 'Paradigma pemrograman berbasis kelas dan objek meliputi pilar Enkapsulasi, Pewarisan, Polimorfisme, dan Abstraksi.' },

    // --- KELAS 12 ---
    { id: 'n-mat-12', label: 'Turunan Fungsi Aljabar', x: 100, y: 350, mastery: 42, category: 'Matematika', grade: 'KELAS 12 SMA', desc: 'Diferensial laju perubahan fungsi aljabar menggunakan rumus pangkat, aturan rantai, dan penentuan titik stasioner puncak.' },
    { id: 'n-kim-12', label: 'Sel Volta & Elektrokimia', x: 400, y: 350, mastery: 65, category: 'Kimia', grade: 'KELAS 12 SMA', desc: 'Konversi reaksi oksidasi-reduksi kimia spontan menjadi energi listrik searah (baterai) dengan anode (-) dan katode (+).' }
  ];

  const nodeTypes = useMemo(() => ({
    topicNode: CustomTopicNode
  }), []);

  const nodes: Node[] = useMemo(() => {
    return rawNodes.map((n) => ({
      id: n.id,
      type: 'topicNode',
      position: { x: n.x, y: n.y },
      data: { label: n.label, mastery: n.mastery, category: n.category, grade: n.grade },
      style: { opacity: search && !n.label.toLowerCase().includes(search.toLowerCase()) && !n.grade.toLowerCase().includes(search.toLowerCase()) ? 0.35 : 1 }
    }));
  }, [search]);

  // Edges mapping prerequisites and curriculum pathways
  const edges: Edge[] = [
    // Alur Matematika (Kelas 10 -> Kelas 11 -> Kelas 12)
    { id: 'e-mat-10-11', source: 'n-mat-10', target: 'n-mat-11', markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }, style: { stroke: '#6366f1', strokeWidth: 1.5 } },
    { id: 'e-mat-11-12', source: 'n-mat-11', target: 'n-mat-12', markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }, style: { stroke: '#6366f1', strokeWidth: 1.5 } },
    
    // Hubungan lintas ilmu (Kimia Hijau 10 -> Sel Volta 12)
    { id: 'e-kim-10-12', source: 'n-fis-10', target: 'n-kim-12', style: { stroke: '#27272a', strokeDasharray: '4 4' } },
    
    // Hubungan logika matematika 11 ke coding OOP 11
    { id: 'e-logic-code', source: 'n-mat-11', target: 'n-smk-rpl', style: { stroke: '#27272a', strokeDasharray: '4 4' } }
  ];

  const handleNodeClick = (_: any, node: Node) => {
    const raw = rawNodes.find((rn) => rn.id === node.id);
    setSelectedNode(raw || null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow min-h-[calc(100vh-8rem)]">
      {/* Galaxy canvas flow */}
      <div className="lg:col-span-3 h-full min-h-[500px] border border-border bg-bg-secondary rounded-lg relative overflow-hidden flex flex-col justify-between">
        {/* Top search overlay */}
        <div className="absolute top-4 left-4 z-10 w-64 bg-bg-secondary/90 border border-border p-1.5 rounded-md flex items-center gap-2 shadow-md">
          <Search size={14} className="text-text-tertiary ml-2" />
          <input
            type="text"
            placeholder="Cari subjek atau kelas (e.g. Kelas 10)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-text-primary focus:outline-none placeholder-text-tertiary"
          />
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          className="flex-grow w-full"
        >
          <Background color="#27272a" gap={16} size={1} />
          <Controls />
          <MiniMap nodeStrokeColor="#6366f1" nodeColor="#131316" maskColor="rgba(9,9,11,0.7)" />
        </ReactFlow>
      </div>

      {/* Galaxy sidebar controls */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="p-4 space-y-4 h-full flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary">Galaksi Kurikulum Merdeka</h3>
              <p className="text-[11px] text-text-secondary">Peta jalur kognitif SMA & SMK Kelas 10, 11, dan 12. Garis panah menunjukkan prasyarat materi.</p>
            </div>

            {selectedNode ? (
              <div className="p-3.5 rounded border border-border bg-bg-tertiary/20 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-text-primary block">{selectedNode.label}</span>
                    <span className="text-[8px] font-mono text-accent block mt-0.5">{selectedNode.grade}</span>
                  </div>
                  <Badge variant={selectedNode.mastery >= 80 ? 'success' : selectedNode.mastery >= 60 ? 'warning' : 'danger'}>
                    {selectedNode.mastery}% Penguasaan
                  </Badge>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">{selectedNode.desc}</p>
                <div className="text-[10px] text-text-tertiary font-mono">Bidang Studi: {selectedNode.category}</div>
                <div className="pt-2 border-t border-border/30 flex gap-2">
                  <Link href={`/brain`} className="flex-grow">
                    <Button size="sm" className="w-full h-8 text-[10px] flex items-center justify-center gap-1">
                      <BookOpen size={10} /> Buka Ruang Otak Kedua
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-text-secondary border border-dashed border-border rounded-lg">
                Klik salah satu node subjek pada peta untuk melihat silabus Kurikulum Merdeka dan tingkat pemahaman Anda.
              </div>
            )}
          </div>

          <div className="bg-bg-tertiary/40 border border-border p-3 rounded-lg text-xs space-y-1.5">
            <span className="font-bold text-text-primary flex items-center gap-1"><Sparkles size={12} className="text-accent" /> Keterangan Galaksi</span>
            <div className="flex items-center gap-2 text-[10px] text-text-secondary mt-1">
              <span className="w-2.5 h-2.5 rounded bg-success/20 border border-success/40" /> Dikuasai Tinggi (&gt;=80%)
            </div>
            <div className="flex items-center gap-2 text-[10px] text-text-secondary">
              <span className="w-2.5 h-2.5 rounded bg-accent/20 border border-accent/40" /> Pemahaman Sedang (60%-79%)
            </div>
            <div className="flex items-center gap-2 text-[10px] text-text-secondary">
              <span className="w-2.5 h-2.5 rounded bg-danger/20 border border-danger/40" /> Perlu Peningkatan (&lt;60%)
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
