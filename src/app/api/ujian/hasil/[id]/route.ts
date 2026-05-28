import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const hasil = await prisma.hasilUjian.findUnique({
      where: { id },
    });

    if (!hasil) {
      return NextResponse.json({ error: 'Hasil ujian tidak ditemukan' }, { status: 404 });
    }

    // Verify ownership
    if (hasil.userId !== userId) {
      return NextResponse.json({ error: 'Tidak memiliki otorisasi' }, { status: 403 });
    }

    // Fetch associated subject information
    const mapel = await prisma.mataPelajaran.findUnique({
      where: { id: hasil.mataPelajaranId },
      include: {
        jurusan: true,
        bankSoal: {
          select: {
            id: true,
            pertanyaan: true,
            tipe: true,
            pilihan: true,
            jawabanBenar: true,
            pembahasan: true,
            tingkat: true,
            tags: true,
          }
        }
      }
    });

    return NextResponse.json({
      hasil,
      mapel: mapel ? {
        id: mapel.id,
        nama: mapel.nama,
        kode: mapel.kode,
        kelas: mapel.kelas,
        semester: mapel.semester,
        jurusan: mapel.jurusan,
      } : null,
      questions: mapel ? mapel.bankSoal : [],
    });
  } catch (error) {
    console.error('Failed to get exam results:', error);
    return NextResponse.json({ error: 'Gagal memuat hasil ujian' }, { status: 500 });
  }
}
