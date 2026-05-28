import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { resolveJurusanKode } from '@/lib/data/jurusan';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await req.json();
    const { jurusanKode, kelas } = body;

    if (!jurusanKode || !kelas) {
      return NextResponse.json({ error: 'Data jurusanKode dan kelas diperlukan' }, { status: 400 });
    }

    const normalizedKode = resolveJurusanKode(jurusanKode);

    // Find the jurusan
    const jurusan = await prisma.jurusan.findUnique({
      where: { kode: normalizedKode },
    });

    if (!jurusan) {
      return NextResponse.json({ error: 'Jurusan tidak ditemukan' }, { status: 404 });
    }

    // Deactivate previous UserJurusan records for this user
    await prisma.userJurusan.updateMany({
      where: { userId },
      data: { aktif: false },
    });

    // Upsert UserJurusan record
    await prisma.userJurusan.upsert({
      where: {
        userId_jurusanId: {
          userId,
          jurusanId: jurusan.id,
        },
      },
      update: {
        kelas: parseInt(kelas),
        aktif: true,
      },
      create: {
        userId,
        jurusanId: jurusan.id,
        kelas: parseInt(kelas),
        aktif: true,
      },
    });

    // Update main User profile fields
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        grade: parseInt(kelas),
        selectedPathway: normalizedKode,
        schoolType: 'smk',
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user jurusan:', error);
    return NextResponse.json({ error: 'Gagal memperbarui jurusan pengguna' }, { status: 500 });
  }
}
