import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.racketPreset.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
