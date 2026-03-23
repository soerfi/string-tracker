import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create random prefix for secure unique names
    const rand = Math.random().toString(36).substring(2, 8);
    const validTitle = file.name.replace(/[^a-zA-Z0-9.]/g, '');
    const uniqueFilename = `${rand}-${validTitle}`;
    
    // Route into the persistent Docker volume
    const uploadDir = path.join(process.cwd(), 'data', 'uploads');
    
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, uniqueFilename);
    await writeFile(filePath, buffer);
    
    const fileUrl = `/api/uploads/${uniqueFilename}`;
    
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
