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

export async function PUT(req: Request) {
  try {
    const { orderedIds } = await req.json();
    
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Execute updates sequentially to avoid locking issues in SQLite
    for (let i = 0; i < orderedIds.length; i++) {
      await prisma.tennisString.update({
        where: { id: orderedIds[i] },
        data: { sortOrder: i }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
