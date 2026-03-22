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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { playerId, brand, model, qrCodeToken } = body;

    if (!playerId || !brand || !model) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const racketData: any = {
      playerId,
      brand,
      model
    };

    if (qrCodeToken) {
      racketData.qrCodeToken = qrCodeToken;
    }

    const racket = await prisma.racket.create({
      data: racketData
    });

    return NextResponse.json({ success: true, racket });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
