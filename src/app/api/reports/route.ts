import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    let whereClause: any = {};
    if (start && end) {
      whereClause.createdAt = {
        gte: new Date(start),
        lte: new Date(end)
      };
    }

    const jobs = await prisma.stringJob.findMany({
      where: whereClause,
      include: {
        player: true,
        string: true,
        racket: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
