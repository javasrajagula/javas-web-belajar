import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string; id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id: mapelId } = resolvedParams;

    const { searchParams } = new URL(req.url);
    const tingkat = searchParams.get('tingkat');
    const tipe = searchParams.get('tipe');
    const kelasStr = searchParams.get('kelas');
    const includeAnswers = searchParams.get('includeAnswers') === 'true';

    const filter: any = {
      mataPelajaranId: mapelId,
    };

    if (tingkat && tingkat !== 'Semua') {
      filter.tingkat = tingkat;
    }
    if (tipe && tipe !== 'Semua') {
      filter.tipe = tipe;
    }
    if (kelasStr) {
      filter.kelas = parseInt(kelasStr);
    }

    const bankSoal = await prisma.bankSoal.findMany({
      where: filter,
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Parse pilihan from string if stored as stringified JSON (SQLite/PostgreSQL fallback)
    const formattedBankSoal = bankSoal.map((soal) => {
      let options = [];
      if (soal.pilihan) {
        try {
          options = typeof soal.pilihan === 'string' 
            ? JSON.parse(soal.pilihan) 
            : (soal.pilihan as any);
        } catch (e) {
          options = [];
        }
      }
      return {
        ...soal,
        pilihan: options,
        ...(includeAnswers
          ? {}
          : {
              jawabanBenar: undefined,
              pembahasan: undefined,
            }),
      };
    });

    return NextResponse.json(formattedBankSoal);
  } catch (error) {
    console.error('Failed to fetch bank soal:', error);
    return NextResponse.json({ error: 'Gagal memuat bank soal' }, { status: 500 });
  }
}
