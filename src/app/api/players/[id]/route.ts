import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  const globalWithPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient();
  }
  prisma = globalWithPrisma.prisma;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const player = await prisma.player.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        racketBrand: body.racketBrand,
        racketModel: body.racketModel
      }
    });

    return NextResponse.json({ success: true, player });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.$transaction([
      prisma.stringJob.deleteMany({ where: { playerId: id } }),
      prisma.player.delete({ where: { id } })
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
