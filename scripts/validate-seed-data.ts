import { PrismaClient } from '@prisma/client';
import { JURUSAN_CATALOG } from '../src/lib/data/jurusan';
import { GENERAL_LEARNING_TRACKS } from '../src/lib/data/learning-content';

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function parseJson(value: string, label: string) {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} bukan JSON valid`);
  }
}

async function main() {
  const [jurusan, mapel, bab, materi, soal] = await Promise.all([
    prisma.jurusan.findMany({ select: { id: true, kode: true } }),
    prisma.mataPelajaran.findMany({ select: { id: true, jurusanId: true } }),
    prisma.bab.findMany({ select: { id: true, mataPelajaranId: true } }),
    prisma.materi.findMany({ select: { id: true, babId: true, judul: true, tipe: true, konten: true } }),
    prisma.bankSoal.findMany({ select: { id: true, mataPelajaranId: true, pertanyaan: true, tipe: true, pilihan: true, jawabanBenar: true, pembahasan: true, sumber: true } }),
  ]);

  const jurusanKode = new Set(jurusan.map((item) => item.kode));
  const jurusanIds = new Set(jurusan.map((item) => item.id));
  const mapelIds = new Set(mapel.map((item) => item.id));
  const babIds = new Set(bab.map((item) => item.id));

  const expectedTracks = [...JURUSAN_CATALOG, ...GENERAL_LEARNING_TRACKS];
  assert(jurusan.length === expectedTracks.length, `Jumlah jalur belajar salah: ${jurusan.length}`);
  for (const item of expectedTracks) {
    assert(jurusanKode.has(item.kode), `Jurusan ${item.kode} tidak ada di database`);
  }

  for (const item of mapel) {
    assert(jurusanIds.has(item.jurusanId), `Mapel ${item.id} punya jurusanId tidak valid`);
  }

  for (const item of bab) {
    assert(mapelIds.has(item.mataPelajaranId), `Bab ${item.id} punya mataPelajaranId tidak valid`);
  }

  assert(materi.length > 0, 'Materi kosong');
  for (const item of materi) {
    assert(babIds.has(item.babId), `Materi ${item.id} punya babId tidak valid`);
    assert(item.konten.trim().length > 120, `Materi ${item.id} terlalu pendek`);
    assert(!item.konten.includes('Materi kejuruan ini dirancang'), `Materi ${item.id} masih memakai template generik lama`);
    if (item.tipe === 'teks') {
      assert(item.konten.includes('## Contoh Soal dan Pembahasan'), `Materi teks ${item.id} belum punya contoh soal dan pembahasan`);
      assert(item.konten.includes('## Rangkuman'), `Materi teks ${item.id} belum punya rangkuman`);
      assert(item.konten.includes('## Referensi Belajar'), `Materi teks ${item.id} belum punya referensi`);
    }
    if (item.tipe === 'video') {
      const payload = parseJson(item.konten, `Video ${item.id}`);
      assert(Array.isArray(payload.transcript) && payload.transcript.length >= 4, `Video ${item.id} tidak punya naskah panduan jelas`);
      assert(payload.externalUrl || payload.embedUrl, `Video ${item.id} tidak punya link video/referensi yang bisa dibuka`);
      assert(payload.unavailableReason, `Video ${item.id} harus punya fallback jujur jika URL kosong`);
      if (payload.status === 'youtube_search_reference') {
        assert(payload.youtubeUrl?.startsWith('https://www.youtube.com/results?search_query='), `Video ${item.id} harus memakai URL pencarian YouTube yang valid`);
        assert(payload.sourceVerified === false, `Video ${item.id} pencarian YouTube tidak boleh ditandai terverifikasi`);
        assert(!payload.youtubeVideoId, `Video ${item.id} tidak boleh punya youtubeVideoId jika belum diverifikasi`);
      }
      if (payload.sourceVerified) {
        assert(Boolean(payload.youtubeVideoId || payload.embedUrl), `Video ${item.id} terverifikasi harus punya videoId atau embedUrl`);
      }
    }
    if (item.tipe === 'pdf') {
      const payload = parseJson(item.konten, `Modul ${item.id}`);
      assert(Array.isArray(payload.chapters) && payload.chapters.length >= 3, `Modul ${item.id} tidak punya bab terstruktur`);
      assert(Array.isArray(payload.objectives) && payload.objectives.length >= 2, `Modul ${item.id} tidak punya tujuan pembelajaran`);
      assert(Array.isArray(payload.evaluation) && payload.evaluation.length >= 2, `Modul ${item.id} tidak punya evaluasi`);
      assert(payload.identity && payload.identity.mapel && payload.identity.topik, `Modul ${item.id} tidak punya identitas materi`);
      assert(payload.workedExample?.question && payload.workedExample?.answer, `Modul ${item.id} tidak punya contoh soal dan pembahasan`);
      assert(Array.isArray(payload.checklist) && payload.checklist.length >= 3, `Modul ${item.id} tidak punya checklist pemahaman`);
      assert(payload.unavailableReason, `Modul ${item.id} harus menjelaskan status file PDF`);
    }
  }

  assert(soal.length > 0, 'Bank soal kosong');
  for (const item of soal) {
    assert(mapelIds.has(item.mataPelajaranId), `Soal ${item.id} punya mataPelajaranId tidak valid`);
    assert(item.pertanyaan.trim().length > 50, `Soal ${item.id} terlalu pendek`);
    assert(!item.pertanyaan.includes('Soal Latihan Kejuruan'), `Soal ${item.id} masih memakai template generik lama`);
    assert(item.jawabanBenar.trim().length > 0, `Soal ${item.id} tidak punya kunci jawaban`);
    assert(item.pembahasan.trim().length > 40, `Soal ${item.id} tidak punya pembahasan jelas`);
    assert(String(item.sumber || '').trim().length > 0, `Soal ${item.id} belum punya sumber/asal data`);
    if (item.tipe === 'pilihan_ganda') {
      assert(item.pilihan, `Soal PG ${item.id} tidak punya pilihan`);
      const pilihan = parseJson(String(item.pilihan), `Pilihan ${item.id}`);
      assert(Array.isArray(pilihan) && pilihan.length >= 4, `Soal PG ${item.id} pilihan kurang dari 4`);
    }
  }

  console.log(`Validasi data lulus: ${jurusan.length} jurusan, ${materi.length} materi, ${soal.length} soal.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
