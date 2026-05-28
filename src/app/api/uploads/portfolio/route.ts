import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { auth } from '@/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function safeFileName(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  const base = path
    .basename(fileName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return `${base || 'portfolio'}${ext}`;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Ukuran file maksimal 10 MB' }, { status: 413 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'portfolio');
    await mkdir(uploadDir, { recursive: true });

    const storedName = `${userId}-${Date.now()}-${safeFileName(file.name)}`;
    const destination = path.join(uploadDir, storedName);
    await writeFile(destination, bytes);

    return NextResponse.json({
      fileName: file.name,
      url: `/uploads/portfolio/${storedName}`,
      size: file.size,
      type: file.type || 'application/octet-stream',
    });
  } catch (error) {
    console.error('Portfolio upload failed:', error);
    return NextResponse.json({ error: 'Gagal mengunggah file' }, { status: 500 });
  }
}
