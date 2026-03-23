import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    
    const filePath = path.join(process.cwd(), 'data', 'uploads', filename);
    const fileBuffer = await readFile(filePath);
    
    const ext = filename.split('.').pop()?.toLowerCase();
    let contentType = 'image/webp';
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
