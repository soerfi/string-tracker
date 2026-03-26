import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  const presets = await prisma.racketPreset.findMany({
    orderBy: [ { brand: 'asc' }, { model: 'asc' } ]
  });
  return NextResponse.json(presets);
}

export async function POST(request: Request) {
  try {
    const { brand, model } = await request.json();
    if (!brand || !model) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    
    const preset = await prisma.racketPreset.create({
      data: { brand, model }
    });
    return NextResponse.json(preset);
  } catch(e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
