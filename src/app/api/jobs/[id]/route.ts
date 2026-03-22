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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.stringJob.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updateData: Record<string, any> = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.price !== undefined && body.price !== null) updateData.price = parseFloat(body.price);
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.isPaid !== undefined) updateData.isPaid = body.isPaid;
    if (body.tensionMain !== undefined && body.tensionMain !== null) updateData.tensionMain = parseFloat(body.tensionMain);
    if (body.tensionCross !== undefined && body.tensionCross !== null) updateData.tensionCross = parseFloat(body.tensionCross);
    if (body.grommetsOk !== undefined) updateData.grommetsOk = body.grommetsOk;
    if (body.gripOk !== undefined) updateData.gripOk = body.gripOk;
    if (body.changeOvergrip !== undefined) updateData.changeOvergrip = body.changeOvergrip;

    const job = await prisma.stringJob.update({
      where: { id },
      data: updateData
    });
    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
