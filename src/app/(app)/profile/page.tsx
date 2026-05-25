'use client';

import React, { useState } from 'react';
import { useUserStore } from '@/stores/user-store';
import { useCurriculumStore } from '@/stores/curriculum-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Award, 
  Zap, 
  Trash2, 
  Plus, 
  Briefcase, 
  FolderPlus, 
  FileText,
  Bookmark,
  Calendar,
  Lock
} from 'lucide-react';

export default function ProfilePage() {
  const { profile } = useUserStore();
  const { portfolios, addPortfolio, deletePortfolio, pklLogs, addPklEntry, deletePklEntry } = useCurriculumStore();

  // Local states for inputs
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projUrl, setProjUrl] = useState('');
  const [projRepo, setProjRepo] = useState('');
  const [projSkills, setProjSkills] = useState('');

  const [showPklForm, setShowPklForm] = useState(false);
  const [pklDate, setPklDate] = useState('');
  const [pklCompany, setPklCompany] = useState('');
  const [pklMentor, setPklMentor] = useState('');
  const [pklActivity, setPklActivity] = useState('');
  const [pklHours, setPklHours] = useState(8);

  const handleAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle || !projDesc) return;
    
    addPortfolio({
      title: projTitle,
      description: projDesc,
      projectUrl: projUrl || undefined,
      repositoryUrl: projRepo || undefined,
      skillsUsed: projSkills.split(',').map(s => s.trim()).filter(Boolean)
    });

    // Reset
    setProjTitle('');
    setProjDesc('');
    setProjUrl('');
    setProjRepo('');
    setProjSkills('');
    setShowPortfolioForm(false);
  };

  const handleAddPkl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pklDate || !pklCompany || !pklActivity) return;

    addPklEntry({
      date: pklDate,
      companyName: pklCompany,
      mentorName: pklMentor,
      activityDescription: pklActivity,
      hoursWorked: pklHours
    });

    // Reset
    setPklDate('');
    setPklCompany('');
    setPklMentor('');
    setPklActivity('');
    setPklHours(8);
    setShowPklForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center text-center relative overflow-hidden bg-bg-secondary border border-border">
          <div className="absolute top-2 right-2">
            <Badge variant="primary" className="font-mono text-[9px] uppercase">
              {profile.schoolType} {profile.selectedPathway}
            </Badge>
          </div>

          <div className="relative mt-4">
            <img src={profile.avatar} alt={profile.name} className="w-16 h-16 rounded-full border-2 border-primary" />
            <div className="absolute -bottom-2 -right-2 bg-primary text-white font-mono font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-bg-secondary">
              {profile.level}
            </div>
          </div>

          <h2 className="text-sm font-bold text-text-primary mt-4">{profile.name}</h2>
          <p className="text-[10px] text-secondary font-mono font-semibold tracking-wider uppercase mt-1">
            Kelas {profile.grade} ({profile.schoolType === 'sma' ? 'SMA' : 'SMK Kejuruan'})
          </p>

          <div className="w-full mt-6 space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-text-secondary">
              <span>Kemajuan Tingkat Berikutnya</span>
              <span>{profile.xp} / {profile.level * 500} XP</span>
            </div>
            <Progress value={(profile.xp / (profile.level * 500)) * 100} color="primary" className="h-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-6 border-t border-border/40 text-center">
            <div>
              <span className="text-[10px] text-text-tertiary uppercase font-mono block">Beruntun Belajar</span>
              <span className="text-sm font-bold text-accent font-mono">{profile.streak} Hari</span>
            </div>
            <div>
              <span className="text-[10px] text-text-tertiary uppercase font-mono block">Durasi Sesi</span>
              <span className="text-sm font-bold text-secondary font-mono">{profile.studyTimeToday}m Hari Ini</span>
            </div>
          </div>
        </Card>

        {/* Learning Skill Tree */}
        <Card className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <Award size={14} className="text-accent" /> Matriks Keterampilan Siswa
          </h3>
          <p className="text-[11px] text-text-secondary">
            Nilai status di bawah ini diperoleh secara dinamis berdasarkan pengerjaan kuis, flashcard, dan kepatuhan perencana harian.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              { label: 'Fokus Kognitif', score: profile.skills.focus, desc: 'Sesi Pomodoro lancar.' },
              { label: 'Logika Pemecahan', score: profile.skills.logic, desc: 'Akurasi pengerjaan kuis.' },
              { label: 'Kreativitas Asosiatif', score: profile.skills.creativity, desc: 'Eksplorasi Galaksi Pengetahuan.' },
              { label: 'Disiplin Rutin', score: profile.skills.discipline, desc: 'Ketepatan target planner.' }
            ].map((skill, i) => (
              <div key={i} className="p-3.5 rounded-lg border border-border bg-bg-tertiary/20 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-text-primary">{skill.label}</span>
                  <span className="font-mono text-primary font-bold">{skill.score}%</span>
                </div>
                <Progress value={skill.score} color="primary" className="h-1" />
                <span className="text-[9px] text-text-secondary block font-mono">{skill.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* SMK Specific Features: Portfolio & PKL Logs */}
      {profile.schoolType === 'smk' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Portfolio Management */}
          <Card className="space-y-4">
            <div className="flex justify-between items-center border-b border-border/40 pb-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <FolderPlus size={14} className="text-primary" /> Portofolio Proyek Kejuruan
              </h3>
              <Button onClick={() => setShowPortfolioForm(!showPortfolioForm)} size="sm" className="h-7 text-[10px] px-2.5">
                {showPortfolioForm ? 'Tutup' : 'Tambah Proyek'}
              </Button>
            </div>

            {showPortfolioForm && (
              <form onSubmit={handleAddPortfolio} className="space-y-3 p-4 rounded bg-bg-tertiary/40 border border-border animate-slide-up">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-secondary uppercase">Nama Proyek</label>
                  <input
                    type="text" required placeholder="Contoh: Aplikasi Kasir Java Swing"
                    value={projTitle} onChange={e => setProjTitle(e.target.value)}
                    className="w-full h-8 px-2 bg-bg-secondary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-secondary uppercase">Deskripsi</label>
                  <textarea
                    rows={2} required placeholder="Jelaskan fitur aplikasi dan arsitekturnya..."
                    value={projDesc} onChange={e => setProjDesc(e.target.value)}
                    className="w-full p-2 bg-bg-secondary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-primary resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-text-secondary uppercase">Link Demo</label>
                    <input
                      type="url" placeholder="https://kasir.vercel.app"
                      value={projUrl} onChange={e => setProjUrl(e.target.value)}
                      className="w-full h-8 px-2 bg-bg-secondary border border-border rounded text-xs text-text-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-text-secondary uppercase">Repo GitHub</label>
                    <input
                      type="url" placeholder="https://github.com/user/kasir"
                      value={projRepo} onChange={e => setProjRepo(e.target.value)}
                      className="w-full h-8 px-2 bg-bg-secondary border border-border rounded text-xs text-text-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-secondary uppercase">Teknologi (pisahkan dengan koma)</label>
                  <input
                    type="text" placeholder="Java, MySQL, Swing"
                    value={projSkills} onChange={e => setProjSkills(e.target.value)}
                    className="w-full h-8 px-2 bg-bg-secondary border border-border rounded text-xs text-text-primary focus:outline-none"
                  />
                </div>
                <Button type="submit" className="w-full h-8 text-xs">Simpan Portofolio</Button>
              </form>
            )}

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {portfolios.length > 0 ? (
                portfolios.map(p => (
                  <div key={p.id} className="p-3 border border-border bg-bg-tertiary/10 rounded flex justify-between items-start group">
                    <div className="space-y-1.5 min-w-0 flex-1 pr-3">
                      <h4 className="text-xs font-bold text-text-primary truncate">{p.title}</h4>
                      <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed">{p.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {p.skillsUsed.map((sk, i) => (
                          <Badge key={i} variant="secondary" className="text-[8px] px-1.5 py-0">
                            {sk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => deletePortfolio(p.id)} className="text-text-tertiary hover:text-danger p-1 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-text-secondary border border-dashed border-border rounded">
                  Belum ada proyek portofolio yang terdaftar.
                </div>
              )}
            </div>
          </Card>

          {/* PKL Internship Jurnal Logs */}
          <Card className="space-y-4">
            <div className="flex justify-between items-center border-b border-border/40 pb-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Briefcase size={14} className="text-secondary" /> Jurnal Kegiatan PKL / Magang
              </h3>
              <Button onClick={() => setShowPklForm(!showPklForm)} size="sm" className="h-7 text-[10px] px-2.5">
                {showPklForm ? 'Tutup' : 'Isi Jurnal'}
              </Button>
            </div>

            {showPklForm && (
              <form onSubmit={handleAddPkl} className="space-y-3 p-4 rounded bg-bg-tertiary/40 border border-border animate-slide-up">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-text-secondary uppercase">Tanggal Kerja</label>
                    <input
                      type="date" required
                      value={pklDate} onChange={e => setPklDate(e.target.value)}
                      className="w-full h-8 px-2 bg-bg-secondary border border-border rounded text-xs text-text-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-text-secondary uppercase">Durasi Kerja (Jam)</label>
                    <input
                      type="number" required min="1" max="12"
                      value={pklHours} onChange={e => setPklHours(Number(e.target.value))}
                      className="w-full h-8 px-2 bg-bg-secondary border border-border rounded text-xs text-text-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-text-secondary uppercase">Nama Instansi/Industri</label>
                    <input
                      type="text" required placeholder="PT Telkom Indonesia"
                      value={pklCompany} onChange={e => setPklCompany(e.target.value)}
                      className="w-full h-8 px-2 bg-bg-secondary border border-border rounded text-xs text-text-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-text-secondary uppercase">Pembimbing Industri</label>
                    <input
                      type="text" placeholder="Pak Hermawan"
                      value={pklMentor} onChange={e => setPklMentor(e.target.value)}
                      className="w-full h-8 px-2 bg-bg-secondary border border-border rounded text-xs text-text-primary"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-secondary uppercase">Uraian Pekerjaan/Aktivitas</label>
                  <textarea
                    rows={2} required placeholder="Melakukan instalasi router Mikrotik RB951 dan konfigurasi DHCP Server..."
                    value={pklActivity} onChange={e => setPklActivity(e.target.value)}
                    className="w-full p-2 bg-bg-secondary border border-border rounded text-xs text-text-primary resize-none"
                  />
                </div>
                <Button type="submit" className="w-full h-8 text-xs">Simpan Log PKL</Button>
              </form>
            )}

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {pklLogs.length > 0 ? (
                pklLogs.map(l => (
                  <div key={l.id} className="p-3 border border-border bg-bg-tertiary/10 rounded flex justify-between items-start group">
                    <div className="space-y-1 min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-text-primary font-mono">{l.date}</span>
                        <Badge variant="secondary" className="text-[8px] font-mono">
                          {l.hoursWorked} Jam Kerja
                        </Badge>
                      </div>
                      <span className="text-[9px] text-text-secondary block font-bold">{l.companyName} ({l.mentorName ? `Mentor: ${l.mentorName}` : ''})</span>
                      <p className="text-[10px] text-text-secondary leading-relaxed mt-1 italic">&ldquo;{l.activityDescription}&rdquo;</p>
                    </div>
                    <button onClick={() => deletePklEntry(l.id)} className="text-text-tertiary hover:text-danger p-1 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-text-secondary border border-dashed border-border rounded">
                  Belum ada log kegiatan PKL terdaftar.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* SMA Highlight/Goals Card (renders for both, but showcases SMA goals specifically) */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
          <Bookmark size={14} className="text-primary" /> Target & Rencana Belajar Mandiri
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {profile.goals.map((g, i) => (
            <div key={i} className="p-3 rounded border border-border bg-bg-tertiary/20 text-xs text-text-secondary leading-relaxed">
              {g}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
