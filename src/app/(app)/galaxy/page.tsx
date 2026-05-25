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
    <div className={`px-4 py-2.5 rounded-lg border shadow-md bg-bg-secondary min-w-[150px] transition-all duration-150 ${
      isMastered 
        ? 'border-success/40 hover:border-success' 
        : isStruggling 
          ? 'border-danger/40 hover:border-danger' 
          : 'border-accent/40 hover:border-accent'
    }`}>
      <div className="flex justify-between items-center text-[9px] font-mono text-text-secondary">
        <span>SUBJEK</span>
        <Badge variant={isMastered ? 'success' : isStruggling ? 'danger' : 'primary'} className="text-[8px]">
          {data.mastery}%
        </Badge>
      </div>
      <h4 className="text-xs font-bold text-text-primary mt-1.5 truncate">{data.label}</h4>
      <p className="text-[9px] text-text-tertiary mt-0.5 font-mono">{data.category}</p>
    </div>
  );
};

export default function KnowledgeGalaxyPage() {
  const { profile } = useUserStore();
  const [search, setSearch] = useState('');
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Nodes definition in Indonesian
  const rawNodes = [
    { id: 'n1', label: 'Keadaan Kuantum', x: 250, y: 50, mastery: 42, category: 'Fisika', desc: 'Fungsi gelombang, vektor keadaan ruang Hilbert, amplitudo probabilitas, dan superposisi keadaan dasar.' },
    { id: 'n2', label: 'Superposisi', x: 100, y: 150, mastery: 85, category: 'Fisika', desc: 'Prinsip dasar mekanika kuantum di mana sistem fisik dapat berada dalam beberapa kondisi secara simultan.' },
    { id: 'n3', label: 'Keterikatan Kuantum', x: 400, y: 150, mastery: 72, category: 'Fisika', desc: 'Fenomena fisika kuantum di mana sepasang partikel saling berkolerasi instan tanpa terpengaruh jarak fisik.' },
    { id: 'n4', label: 'Integrasi Kalkulus', x: 250, y: 250, mastery: 58, category: 'Matematika', desc: 'Menghitung luas daerah di bawah kurva, integral tak tentu, dan teknik substitusi geometri.' },
    { id: 'n5', label: 'Kata Kerja Prancis', x: 50, y: 350, mastery: 65, category: 'Bahasa', desc: 'Sistem konjugasi kata kerja bahasa Prancis berdasarkan kala waktu (present, passé composé, futur).' }
  ];

  const nodeTypes = useMemo(() => ({
    topicNode: CustomTopicNode
  }), []);

  const nodes: Node[] = useMemo(() => {
    return rawNodes.map((n) => ({
      id: n.id,
      type: 'topicNode',
      position: { x: n.x, y: n.y },
      data: { label: n.label, mastery: n.mastery, category: n.category },
      style: { opacity: search && !n.label.toLowerCase().includes(search.toLowerCase()) ? 0.35 : 1 }
    }));
  }, [search]);

  const edges: Edge[] = [
    { id: 'e1-2', source: 'n1', target: 'n2', markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }, style: { stroke: '#27272a' } },
    { id: 'e1-3', source: 'n1', target: 'n3', markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }, style: { stroke: '#27272a' } },
    { id: 'e2-4', source: 'n2', target: 'n4', style: { stroke: '#27272a', strokeDasharray: '4 4' } },
    { id: 'e4-5', source: 'n4', target: 'n5', style: { stroke: '#27272a', strokeDasharray: '4 4' } },
  ];

  const handleNodeClick = (_: any, node: Node) => {
    const raw = rawNodes.find((rn) => rn.id === node.id);
    setSelectedNode(raw || null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow min-h-[calc(100vh-8rem)]">
      {/* Galaxy canvas flow */}
      <div className="lg:col-span-3 h-full min-h-[480px] border border-border bg-bg-secondary rounded-lg relative overflow-hidden flex flex-col justify-between">
        {/* Top search overlay */}
        <div className="absolute top-4 left-4 z-10 w-64 bg-bg-secondary/90 border border-border p-1.5 rounded-md flex items-center gap-2 shadow-md">
          <Search size={14} className="text-text-tertiary ml-2" />
          <input
            type="text"
            placeholder="Fokuskan galaksi pada topik..."
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
              <h3 className="text-sm font-bold text-text-primary">Galaksi Pengetahuan</h3>
              <p className="text-[11px] text-text-secondary">Peta interaktif berbasis node yang memvisualisasikan hubungan antar subjek belajar Anda.</p>
            </div>

            {selectedNode ? (
              <div className="p-3.5 rounded border border-border bg-bg-tertiary/20 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-text-primary">{selectedNode.label}</span>
                  <Badge variant={selectedNode.mastery >= 80 ? 'success' : selectedNode.mastery >= 60 ? 'warning' : 'danger'}>
                    {selectedNode.mastery}% Penguasaan
                  </Badge>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">{selectedNode.desc}</p>
                <div className="text-[10px] text-text-tertiary font-mono">Kategori: {selectedNode.category}</div>
                <div className="pt-2 border-t border-border/30 flex gap-2">
                  <Link href="/brain" className="flex-grow">
                    <Button size="sm" className="w-full h-8 text-[10px] flex items-center justify-center gap-1">
                      <BookOpen size={10} /> Buka Catatan
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-text-secondary border border-dashed border-border rounded-lg">
                Klik salah satu node subjek pada peta di sebelah kiri untuk memeriksa deskripsi materi dan tingkat penguasaan.
              </div>
            )}
          </div>

          <div className="bg-bg-tertiary/40 border border-border p-3 rounded-lg text-xs space-y-1.5">
            <span className="font-bold text-text-primary flex items-center gap-1"><Sparkles size={12} className="text-accent" /> Legenda Galaksi</span>
            <div className="flex items-center gap-2 text-[10px] text-text-secondary mt-1">
              <span className="w-2.5 h-2.5 rounded bg-success/20 border border-success/40" /> Topik Dikuasai (&gt;=80%)
            </div>
            <div className="flex items-center gap-2 text-[10px] text-text-secondary">
              <span className="w-2.5 h-2.5 rounded bg-accent/20 border border-accent/40" /> Topik Dipelajari (60%-79%)
            </div>
            <div className="flex items-center gap-2 text-[10px] text-text-secondary">
              <span className="w-2.5 h-2.5 rounded bg-danger/20 border border-danger/40" /> Topik Butuh Ulasan (&lt;60%)
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
