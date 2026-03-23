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
    const { brand, model, gauge, type, baseLifeHours, descriptionDe, benefits, imageUrl } = body;

    const newString = await prisma.tennisString.create({
      data: {
        brand,
        model,
        gauge,
        type,
        baseLifeHours: parseFloat(baseLifeHours || "0"),
        descriptionDe,
        benefits: JSON.stringify(benefits || []),
        imageUrl: imageUrl || null
      }
    });

    return NextResponse.json({ success: true, string: newString });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
