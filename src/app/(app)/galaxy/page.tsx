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
import { useCurriculumStore } from '@/stores/curriculum-store';
import { getCurriculumData } from '@/lib/curriculum-data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Custom Node component inside flow
const CustomTopicNode = ({ data }: any) => {
  const isCompleted = data.completed;
  return (
    <div className={`px-4 py-2.5 rounded-lg border shadow-md bg-bg-secondary min-w-[160px] transition-all duration-150 ${
      isCompleted 
        ? 'border-success/60 hover:border-success bg-success-subtle/5' 
        : 'border-primary/40 hover:border-primary'
    }`}>
      <div className="flex justify-between items-center text-[7px] font-mono text-text-secondary">
        <span>{data.grade}</span>
        <Badge variant={isCompleted ? 'success' : 'primary'} className="text-[6px] px-1 py-0">
          {isCompleted ? 'SELESAI' : 'AKTIF'}
        </Badge>
      </div>
      <h4 className="text-[10px] font-bold text-text-primary mt-1.5 truncate">{data.label}</h4>
      <p className="text-[8px] text-text-tertiary mt-0.5 font-mono">{data.category}</p>
    </div>
  );
};

export default function KnowledgeGalaxyPage() {
  const { profile } = useUserStore();
  const { completedLessons } = useCurriculumStore();
  const [search, setSearch] = useState('');
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Load dynamically from stores & curriculum content
  const subjects = getCurriculumData(profile.schoolType);

  // Map subjects and lessons to React Flow nodes
  const rawNodes = useMemo(() => {
    const list: any[] = [];
    let subjectIndex = 0;
    
    subjects.forEach((sub) => {
      let lessonIndex = 0;
      sub.modules.forEach((mod) => {
        mod.lessons.forEach((les) => {
          // Dynamic coordinates calculation
          const x = 50 + (subjectIndex * 350) + (lessonIndex * 40);
          const y = 80 + (lessonIndex * 150);
          
          list.push({
            id: les.id,
            label: les.title,
            x,
            y,
            completed: !!completedLessons[les.id],
            category: sub.title,
            grade: `KELAS ${sub.grade} - FASE ${sub.phase}`,
            desc: les.summary,
            subjectId: sub.id
          });
          lessonIndex++;
        });
      });
      subjectIndex++;
    });

    return list;
  }, [subjects, completedLessons]);

  const nodeTypes = useMemo(() => ({
    topicNode: CustomTopicNode
  }), []);

  const nodes: Node[] = useMemo(() => {
    return rawNodes.map((n) => ({
      id: n.id,
      type: 'topicNode',
      position: { x: n.x, y: n.y },
      data: { label: n.label, completed: n.completed, category: n.category, grade: n.grade },
      style: { opacity: search && !n.label.toLowerCase().includes(search.toLowerCase()) && !n.grade.toLowerCase().includes(search.toLowerCase()) ? 0.35 : 1 }
    }));
  }, [rawNodes, search]);

  // Connect sequential lessons as prerequisite pathways
  const edges: Edge[] = useMemo(() => {
    const list: Edge[] = [];
    
    // Group raw nodes by subject
    const bySubject: Record<string, any[]> = {};
    rawNodes.forEach(n => {
      if (!bySubject[n.subjectId]) {
        bySubject[n.subjectId] = [];
      }
      bySubject[n.subjectId].push(n);
    });

    // Draw straight arrow lines between sequential lessons in the same subject
    Object.keys(bySubject).forEach(subId => {
      const subjectNodes = bySubject[subId];
      for (let i = 0; i < subjectNodes.length - 1; i++) {
        const source = subjectNodes[i].id;
        const target = subjectNodes[i+1].id;
        list.push({
          id: `e-${source}-${target}`,
          source,
          target,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#4F46E5' },
          style: { stroke: '#4F46E5', strokeWidth: 1.5 }
        });
      }
    });

    return list;
  }, [rawNodes]);

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
            placeholder="Cari bab pelajaran..."
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
          <MiniMap nodeStrokeColor="#4F46E5" nodeColor="#131316" maskColor="rgba(9,9,11,0.7)" />
        </ReactFlow>
      </div>

      {/* Galaxy sidebar controls */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="p-4 space-y-4 h-full flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary">Galaksi Kompetensi</h3>
              <p className="text-[11px] text-text-secondary">Peta bintang pelajaran aktif untuk jalur **{profile.schoolType === 'sma' ? 'SMA' : 'SMK'}**. Garis panah menandai alur tujuan pembelajaran (ATP).</p>
            </div>

            {selectedNode ? (
              <div className="p-3.5 rounded border border-border bg-bg-tertiary/20 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-text-primary block leading-tight">{selectedNode.label}</span>
                    <span className="text-[8px] font-mono text-primary block mt-1">{selectedNode.grade}</span>
                  </div>
                  <Badge variant={selectedNode.completed ? 'success' : 'primary'}>
                    {selectedNode.completed ? 'Selesai' : 'Aktif'}
                  </Badge>
                </div>
                <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-3">{selectedNode.desc}</p>
                <div className="text-[9px] text-text-tertiary font-mono">Mata Pelajaran: {selectedNode.category}</div>
                <div className="pt-2 border-t border-border/30">
                  <Link href={`/lessons/${selectedNode.id}`} className="w-full">
                    <Button size="sm" className="w-full h-8 text-[10px] flex items-center justify-center gap-1">
                      <BookOpen size={10} /> Buka Lembar Pelajaran <ChevronRight size={10} />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-text-secondary border border-dashed border-border rounded-lg">
                Klik salah satu node bab pada peta bintang untuk melihat silabus kognitif detail.
              </div>
            )}
          </div>

          <div className="bg-bg-tertiary/40 border border-border p-3 rounded-lg text-xs space-y-1.5">
            <span className="font-bold text-text-primary flex items-center gap-1"><Sparkles size={12} className="text-primary animate-pulse" /> Keterangan Galaksi</span>
            <div className="flex items-center gap-2 text-[10px] text-text-secondary mt-1">
              <span className="w-2.5 h-2.5 rounded bg-success/20 border border-success/40" /> Pelajaran Telah Dikuasai
            </div>
            <div className="flex items-center gap-2 text-[10px] text-text-secondary">
              <span className="w-2.5 h-2.5 rounded bg-primary/20 border border-primary/40" /> Pelajaran Belum Selesai
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
