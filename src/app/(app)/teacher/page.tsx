'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users as UsersIcon, 
  GraduationCap, 
  BookOpen, 
  Search, 
  Check, 
  X, 
  ExternalLink,
  Award,
  Zap,
  FolderKanban,
  FileCheck,
  Star,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';
import { 
  getStudentsList, 
  gradePortfolioProject, 
  approveInternshipEntry 
} from '@/lib/actions/teacher';
import { 
  getDocumentsList, 
  uploadDocument, 
  deleteDocument, 
  searchSimilarChunks 
} from '@/lib/actions/rag';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function TeacherPortal() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchoolType, setSelectedSchoolType] = useState<'all' | 'sma' | 'smk'>('all');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  // Grading & Approval states
  const [gradeInput, setGradeInput] = useState<Record<string, number>>({});
  const [submittingIds, setSubmittingIds] = useState<Record<string, boolean>>({});

  // Tab State
  const [activeTab, setActiveTab] = useState<'students' | 'analytics' | 'rag'>('students');

  // Recharts Mount State
  const [isMounted, setIsMounted] = useState(false);

  // RAG management states
  const [documents, setDocuments] = useState<any[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [ragQuery, setRagQuery] = useState('');
  const [ragResults, setRagResults] = useState<any[]>([]);
  const [searchingRag, setSearchingRag] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const list = await getStudentsList();
      setStudents(list);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const list = await getDocumentsList();
      setDocuments(list);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchStudents();
    fetchDocuments();
  }, []);

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;
    setUploadingDoc(true);
    try {
      await uploadDocument(docTitle, docContent);
      setDocTitle('');
      setDocContent('');
      await fetchDocuments();
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus materi ini?')) return;
    try {
      await deleteDocument(id);
      await fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchRag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;
    setSearchingRag(true);
    try {
      const results = await searchSimilarChunks(ragQuery, 3);
      setRagResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingRag(false);
    }
  };

  // Recharts Data Calculations
  const levelCounts: Record<number, number> = {};
  students.forEach(s => {
    levelCounts[s.level] = (levelCounts[s.level] || 0) + 1;
  });
  const levelData = Object.keys(levelCounts).map(lvl => ({
    level: `Lvl ${lvl}`,
    'Jumlah Siswa': levelCounts[Number(lvl)]
  })).sort((a, b) => a.level.localeCompare(b.level));

  const smaProgress = students.filter(s => s.schoolType === 'sma');
  const smkProgress = students.filter(s => s.schoolType === 'smk');
  const avgSma = smaProgress.length > 0 ? smaProgress.reduce((sum, s) => sum + s.progress.length, 0) / smaProgress.length : 0;
  const avgSmk = smkProgress.length > 0 ? smkProgress.reduce((sum, s) => sum + s.progress.length, 0) / smkProgress.length : 0;
  const progressData = [
    { name: 'SMA', 'Rerata Pelajaran': Number(avgSma.toFixed(1)) },
    { name: 'SMK Kejuruan', 'Rerata Pelajaran': Number(avgSmk.toFixed(1)) }
  ];

  const pathwayCounts: Record<string, number> = {};
  students.forEach(s => {
    const p = s.selectedPathway || 'Umum';
    pathwayCounts[p] = (pathwayCounts[p] || 0) + 1;
  });
  const pathwayData = Object.keys(pathwayCounts).map(name => ({
    name,
    value: pathwayCounts[name]
  }));
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00c49f', '#0088fe'];

  const handleGradeProject = async (projectId: string) => {
    const score = gradeInput[projectId];
    if (score === undefined || score < 0 || score > 100) return;

    setSubmittingIds(prev => ({ ...prev, [projectId]: true }));
    try {
      await gradePortfolioProject(projectId, score);
      // Update local state
      setStudents(prev => prev.map(s => {
        return {
          ...s,
          portfolios: s.portfolios.map((p: any) => p.id === projectId ? { ...p, gradeScore: score } : p)
        };
      }));
      // Update selected student modal view
      if (selectedStudent) {
        setSelectedStudent((prev: any) => ({
          ...prev,
          portfolios: prev.portfolios.map((p: any) => p.id === projectId ? { ...p, gradeScore: score } : p)
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingIds(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleApprovePkl = async (pklId: string, approve: boolean) => {
    setSubmittingIds(prev => ({ ...prev, [pklId]: true }));
    try {
      await approveInternshipEntry(pklId, approve);
      // Update local state
      setStudents(prev => prev.map(s => {
        return {
          ...s,
          pklLog: s.pklLog.map((i: any) => i.id === pklId ? { ...i, approved: approve } : i)
        };
      }));
      // Update selected student modal view
      if (selectedStudent) {
        setSelectedStudent((prev: any) => ({
          ...prev,
          pklLog: prev.pklLog.map((i: any) => i.id === pklId ? { ...i, approved: approve } : i)
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingIds(prev => ({ ...prev, [pklId]: false }));
    }
  };

  // Filter students based on search and school type
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSchool = selectedSchoolType === 'all' || s.schoolType === selectedSchoolType;
    return matchesSearch && matchesSchool;
  });

  // Calculate statistics
  const totalStudents = students.length;
  const smaCount = students.filter(s => s.schoolType === 'sma').length;
  const smkCount = students.filter(s => s.schoolType === 'smk').length;
  const averageLevel = totalStudents > 0 
    ? Math.round(students.reduce((acc, curr) => acc + curr.level, 0) / totalStudents) 
    : 0;
  const totalCompletedLessons = students.reduce((acc, curr) => acc + curr.progress.length, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 flex-1">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-text-secondary">Memuat data siswa dan progress belajar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex-1 flex flex-col pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary border border-border p-5 rounded-lg">
        <div>
          <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest block">ADMINISTRATOR CONTROL PANEL</span>
          <h1 className="text-xl font-extrabold text-text-primary mt-1 flex items-center gap-2">
            <GraduationCap className="text-primary" /> Panel Guru & Evaluator
          </h1>
          <p className="text-xs text-text-secondary mt-1">Kelola penilaian portofolio, verifikasi PKL, dan pantau CP siswa SMKN 2 Purworejo.</p>
        </div>
        <Button onClick={fetchStudents} size="sm" variant="secondary">Refresh Data</Button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Siswa Aktif', value: totalStudents, sub: `${smaCount} SMA / ${smkCount} SMK`, icon: UsersIcon, color: 'text-primary' },
          { title: 'Rerata Level', value: `Lv. ${averageLevel}`, sub: 'Kemajuan Belajar', icon: Award, color: 'text-accent' },
          { title: 'Total Modul Selesai', value: totalCompletedLessons, sub: 'Capaian Pembelajaran', icon: BookOpen, color: 'text-secondary' },
          { title: 'Portofolio Terunggah', value: students.reduce((acc, curr) => acc + curr.portfolios.length, 0), sub: 'Karya Siswa', icon: FolderKanban, color: 'text-indigo-400' }
        ].map((stat, i) => (
          <Card key={i} className="p-4 flex items-center justify-between border border-border bg-bg-secondary">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-text-tertiary block uppercase font-bold">{stat.title}</span>
              <p className="text-lg font-bold text-text-primary">{stat.value}</p>
              <span className="text-[9px] text-text-secondary">{stat.sub}</span>
            </div>
            <div className={`p-2 bg-bg-tertiary rounded-lg ${stat.color}`}>
              <stat.icon size={20} />
            </div>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 p-1 rounded-lg bg-bg-secondary border border-border w-fit">
        {[
          { id: 'students', label: 'Daftar Siswa', icon: UsersIcon },
          { id: 'analytics', label: 'Analisis Statistik', icon: Award },
          { id: 'rag', label: 'Materi & RAG', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'students' && (
        <Card className="p-6 border border-border bg-bg-secondary flex-1 flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 text-text-tertiary" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa berdasarkan nama atau email..."
                className="w-full h-10 pl-10 pr-4 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* School type filter */}
            <div className="flex gap-1.5 bg-bg-tertiary/60 p-1 rounded border border-border self-start">
              {[
                { id: 'all', label: 'Semua Jalur' },
                { id: 'sma', label: 'SMA' },
                { id: 'smk', label: 'SMK Kejuruan' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedSchoolType(tab.id as any)}
                  className={`px-3 py-1.5 text-[10px] font-semibold rounded cursor-pointer transition-all duration-150 ${
                    selectedSchoolType === tab.id
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border text-[10px] font-mono text-text-tertiary uppercase">
                  <th className="pb-3 font-bold">Nama Siswa</th>
                  <th className="pb-3 font-bold">Tingkat / Jalur</th>
                  <th className="pb-3 font-bold">Level / XP</th>
                  <th className="pb-3 font-bold">Modul Selesai</th>
                  <th className="pb-3 font-bold">Karya & PKL</th>
                  <th className="pb-3 font-bold text-right">Aksi Evaluasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-bg-tertiary/20 transition-colors">
                      <td className="py-3 flex items-center gap-3">
                        <Image 
                          src={student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                          alt={student.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full border border-border"
                          unoptimized
                        />
                        <div>
                          <p className="font-semibold text-text-primary">{student.name}</p>
                          <p className="text-[10px] text-text-tertiary font-mono">{student.email}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant={student.schoolType === 'sma' ? 'secondary' : 'primary'}>
                          {student.schoolType.toUpperCase()} Kelas {student.grade}
                        </Badge>
                        <p className="text-[10px] text-text-secondary mt-0.5">{student.selectedPathway}</p>
                      </td>
                      <td className="py-3 font-mono">
                        <p className="font-semibold text-text-primary">Lvl {student.level}</p>
                        <p className="text-[10px] text-accent font-bold flex items-center gap-0.5"><Zap size={10} /> {student.xp} XP</p>
                      </td>
                      <td className="py-3">
                        <span className="font-mono font-bold text-text-primary">{student.progress.length}</span> Pelajaran
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-[9.5px]">
                            {student.portfolios.length} Portofolio
                          </Badge>
                          {student.schoolType === 'smk' && (
                            <Badge variant={student.pklLog.some((i: any) => !i.approved) ? 'warning' : 'success'} className="text-[9.5px]">
                              {student.pklLog.length} Jurnal PKL
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Button 
                          onClick={() => setSelectedStudent(student)} 
                          size="sm" 
                          variant="secondary"
                        >
                          Detail Evaluasi
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-text-secondary text-xs">
                      Tidak ada data siswa ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {!isMounted ? (
            <div className="py-20 text-center text-xs text-text-secondary">Memuat grafik analitik...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Level Distribution */}
              <Card className="p-5 border border-border bg-bg-secondary space-y-4">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">Distribusi Level Siswa</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={levelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                      <XAxis dataKey="level" stroke="#A0AEC0" fontSize={10} />
                      <YAxis stroke="#A0AEC0" fontSize={10} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', fontSize: 11 }} />
                      <Bar dataKey="Jumlah Siswa" fill="#3182ce" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Average Progress */}
              <Card className="p-5 border border-border bg-bg-secondary space-y-4">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">Kemajuan Modul (SMA vs SMK)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                      <XAxis dataKey="name" stroke="#A0AEC0" fontSize={10} />
                      <YAxis stroke="#A0AEC0" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', fontSize: 11 }} />
                      <Bar dataKey="Rerata Pelajaran" fill="#38a169" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Pathway Pie Chart */}
              <Card className="p-5 border border-border bg-bg-secondary space-y-4 md:col-span-2">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">Penyebaran Jalur Konsentrasi</h3>
                <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                  <div className="h-56 w-56 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pathwayData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pathwayData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {pathwayData.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-text-secondary">{item.name}:</span>
                        <span className="font-bold text-text-primary">{item.value} siswa</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rag' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Form & Search */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-5 border border-border bg-bg-secondary space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Plus size={14} className="text-primary" /> Tambah Materi Ajar
                </h3>
                <p className="text-[10px] text-text-secondary">Unggah dokumen baru untuk diindeks dan dijadikan context RAG oleh AI Tutor.</p>
              </div>
              <form onSubmit={handleUploadDoc} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-text-tertiary uppercase block">Judul Dokumen</label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Contoh: Modul PKL Jaringan SMK"
                    className="w-full h-9 px-3 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-text-tertiary uppercase block">Isi Konten Materi</label>
                  <textarea
                    required
                    rows={6}
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    placeholder="Tulis atau paste teks materi pelajaran di sini..."
                    className="w-full p-3 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>
                <Button type="submit" disabled={uploadingDoc} className="w-full h-9 text-xs">
                  {uploadingDoc ? 'Memproses Index...' : 'Unggah & Indeks'}
                </Button>
              </form>
            </Card>

            <Card className="p-5 border border-border bg-bg-secondary space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Search size={14} className="text-accent" /> Tes Pencarian Semantik
                </h3>
                <p className="text-[10px] text-text-secondary">Uji kemiripan kosinus embedding RAG lokal dari teks kueri.</p>
              </div>
              <form onSubmit={handleSearchRag} className="space-y-3">
                <input
                  type="text"
                  required
                  value={ragQuery}
                  onChange={(e) => setRagQuery(e.target.value)}
                  placeholder="Ketik kueri..."
                  className="w-full h-9 px-3 bg-bg-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
                <Button type="submit" disabled={searchingRag} variant="secondary" className="w-full h-9 text-xs">
                  {searchingRag ? 'Mencari...' : 'Uji Kemiripan'}
                </Button>
              </form>

              {ragResults.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <span className="text-[9px] font-mono text-text-tertiary uppercase block">Hasil Pencarian Terdekat:</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {ragResults.map((res, idx) => (
                      <div key={idx} className="p-2 rounded bg-bg-tertiary/60 border border-border/40 text-[10px]">
                        <div className="flex justify-between font-bold text-text-primary">
                          <span className="truncate">{res.documentTitle}</span>
                          <span className="text-accent">{(res.similarity * 100).toFixed(1)}% match</span>
                        </div>
                        <p className="text-text-secondary mt-1 leading-normal italic">&ldquo;{res.content}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Panel: List */}
          <div className="lg:col-span-2">
            <Card className="p-5 border border-border bg-bg-secondary space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">Daftar Dokumen RAG Terunggah</h3>
                <p className="text-[10px] text-text-secondary">Kumpulan modul dan referensi sekolah yang dibaca oleh AI Tutor.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-[9px] font-mono text-text-tertiary uppercase pb-2">
                      <th className="pb-2">Judul Dokumen</th>
                      <th className="pb-2">Jumlah Chunk</th>
                      <th className="pb-2">Tanggal Unggah</th>
                      <th className="pb-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {documents.length > 0 ? (
                      documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-bg-tertiary/20">
                          <td className="py-2.5 font-semibold text-text-primary">{doc.title}</td>
                          <td className="py-2.5 font-mono text-text-secondary">{doc._count.chunks} chunks</td>
                          <td className="py-2.5 text-text-tertiary">{new Date(doc.createdAt).toLocaleDateString()}</td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-text-secondary">Belum ada dokumen terunggah.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Selected Student Evaluation Panel (Side Drawer / Modal Overlay) */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex justify-end z-50 animate-fade-in select-none">
          <div className="bg-bg-secondary w-full max-w-2xl border-l border-border h-full flex flex-col p-6 overflow-y-auto animate-slide-left shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-border pb-4 mb-5">
              <div className="flex items-center gap-3">
                <Image 
                  src={selectedStudent.avatar} 
                  alt={selectedStudent.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full border-2 border-primary"
                  unoptimized
                />
                <div>
                  <h2 className="text-base font-bold text-text-primary">{selectedStudent.name}</h2>
                  <p className="text-xs text-text-tertiary font-mono">{selectedStudent.email} • Lvl {selectedStudent.level}</p>
                </div>
              </div>
              <Button 
                onClick={() => setSelectedStudent(null)} 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Profile Path Details */}
            <div className="grid grid-cols-3 gap-3 mb-6 bg-bg-tertiary p-3 rounded border border-border">
              <div>
                <span className="text-[9px] font-mono text-text-tertiary uppercase block">Sekolah</span>
                <span className="text-xs font-semibold text-text-primary">{selectedStudent.schoolType.toUpperCase()} Kelas {selectedStudent.grade}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-text-tertiary uppercase block">Jalur Konsentrasi</span>
                <span className="text-xs font-semibold text-text-primary">{selectedStudent.selectedPathway}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-text-tertiary uppercase block">Streak Belajar</span>
                <span className="text-xs font-semibold text-accent flex items-center gap-0.5"><Zap size={10} /> {selectedStudent.streak} Hari Beruntun</span>
              </div>
            </div>

            {/* Sub-sections tabs */}
            <div className="space-y-6">
              
              {/* Capaian Pembelajaran (CP) Progress */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <BookOpen size={14} className="text-secondary" /> Capaian Pembelajaran (CP) Siswa
                </h3>
                <Card className="p-4 border border-border bg-bg-tertiary/30 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-text-secondary">
                    <span>Progres Belajar Terdaftar</span>
                    <span>{selectedStudent.progress.length} Pelajaran Selesai</span>
                  </div>
                  <Progress value={Math.min(100, (selectedStudent.progress.length / 10) * 100)} className="h-2 bg-bg-tertiary" />
                  
                  {selectedStudent.progress.length > 0 ? (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pt-2 border-t border-border/40 scrollbar-none">
                      {selectedStudent.progress.map((p: any) => (
                        <div key={p.id} className="flex justify-between items-center text-[10px] bg-bg-tertiary/60 p-2 rounded">
                          <div>
                            <span className="font-semibold text-text-primary block">{p.lessonTitle}</span>
                            <span className="text-text-tertiary">{p.subjectTitle}</span>
                          </div>
                          {p.scorePercentage !== undefined && (
                            <Badge variant={p.scorePercentage >= 75 ? 'success' : 'secondary'}>
                              Kuis: {p.scorePercentage}%
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-text-tertiary text-center py-2">Siswa belum menyelesaikan materi belajar apa pun.</p>
                  )}
                </Card>
              </div>

              {/* Portofolio Proyek (Grading Panel) */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <FolderKanban size={14} className="text-indigo-400" /> Proyek Portofolio Mandiri
                </h3>
                {selectedStudent.portfolios.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStudent.portfolios.map((p: any) => (
                      <Card key={p.id} className="p-4 border border-border bg-bg-tertiary/20 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-text-primary">{p.title}</h4>
                            <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">{p.description}</p>
                          </div>
                          {p.gradeScore !== undefined ? (
                            <Badge variant="success" className="flex items-center gap-1 font-mono text-[9px]">
                              <Star size={10} /> Nilai: {p.gradeScore}/100
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[9px]">Belum Dinilai</Badge>
                          )}
                        </div>

                        {/* Skills used */}
                        <div className="flex flex-wrap gap-1">
                          {p.skillsUsed.map((s: string, idx: number) => (
                            <span key={idx} className="text-[8.5px] font-mono bg-bg-tertiary text-text-secondary px-1.5 py-0.5 rounded border border-border">
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* URLs */}
                        <div className="flex gap-3 text-[10px] font-mono text-primary font-bold">
                          {p.projectUrl && (
                            <a href={p.projectUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                              Live Demo <ExternalLink size={10} />
                            </a>
                          )}
                          {p.repositoryUrl && (
                            <a href={p.repositoryUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-text-secondary">
                              Code Repo <ExternalLink size={10} />
                            </a>
                          )}
                        </div>

                        {/* Grading form */}
                        <div className="pt-2 border-t border-border/40 flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Nilai (0-100)"
                            value={gradeInput[p.id] !== undefined ? gradeInput[p.id] : ''}
                            onChange={(e) => setGradeInput(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                            className="w-24 h-8 bg-bg-tertiary border border-border rounded text-[10px] px-2 text-text-primary focus:outline-none focus:border-primary"
                          />
                          <Button 
                            onClick={() => handleGradeProject(p.id)}
                            disabled={gradeInput[p.id] === undefined || submittingIds[p.id]}
                            size="sm"
                            className="h-8"
                          >
                            {submittingIds[p.id] ? 'Menyimpan...' : 'Submit Nilai'}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-text-tertiary bg-bg-tertiary/20 border border-border border-dashed p-4 rounded text-center">
                    Siswa belum mengunggah proyek portofolio.
                  </p>
                )}
              </div>

              {/* Jurnal PKL (SMK Verification Panel) */}
              {selectedStudent.schoolType === 'smk' && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <FileCheck size={14} className="text-accent" /> Jurnal Mingguan Praktik Kerja Lapangan (PKL)
                  </h3>
                  {selectedStudent.pklLog.length > 0 ? (
                    <div className="space-y-3">
                      {selectedStudent.pklLog.map((i: any) => (
                        <Card key={i.id} className="p-4 border border-border bg-bg-tertiary/20 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-text-primary">{i.companyName}</h4>
                              <p className="text-[9.5px] text-text-secondary mt-0.5 font-mono">Pembimbing Industri: {i.mentorName}</p>
                              <span className="text-[8.5px] text-text-tertiary block mt-1 font-mono">{i.date} • {i.hoursWorked || 8} Jam Kerja</span>
                            </div>
                            <Badge variant={i.approved ? 'success' : 'warning'}>
                              {i.approved ? 'Terverifikasi' : 'Butuh Peninjauan'}
                            </Badge>
                          </div>

                          <p className="text-[10px] text-text-primary italic leading-relaxed bg-bg-tertiary/50 p-2.5 rounded border border-border/40">
                            &ldquo;{i.activityDescription || 'Siswa tidak memasukkan rincian laporan harian.'}&rdquo;
                          </p>

                          {/* Approval toggles */}
                          <div className="flex gap-2 justify-end">
                            {!i.approved ? (
                              <Button 
                                onClick={() => handleApprovePkl(i.id, true)}
                                disabled={submittingIds[i.id]}
                                size="sm"
                                className="bg-success hover:bg-success/80 h-7 text-[9px] flex items-center gap-1"
                              >
                                <Check size={10} /> Setujui Laporan
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => handleApprovePkl(i.id, false)}
                                disabled={submittingIds[i.id]}
                                size="sm"
                                variant="outline"
                                className="border-danger text-danger hover:bg-danger-subtle/10 h-7 text-[9px] flex items-center gap-1"
                              >
                                <X size={10} /> Batalkan Persetujuan
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-text-tertiary bg-bg-tertiary/20 border border-border border-dashed p-4 rounded text-center">
                      Siswa belum memiliki entri jurnal PKL terdaftar.
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
