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

    const updateData: Record<string, any> = {};
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.gauge !== undefined) updateData.gauge = body.gauge;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.baseLifeHours !== undefined) updateData.baseLifeHours = parseFloat(body.baseLifeHours);
    if (body.descriptionDe !== undefined) updateData.descriptionDe = body.descriptionDe;
    if (body.benefits !== undefined) updateData.benefits = JSON.stringify(body.benefits);

    const updated = await prisma.tennisString.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, string: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.tennisString.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
