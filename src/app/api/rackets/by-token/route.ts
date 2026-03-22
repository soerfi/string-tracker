import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const racket = await prisma.racket.findUnique({
      where: { qrCodeToken: token },
      include: {
        player: true
      }
    });

    if (!racket) {
      return NextResponse.json({ error: 'Racket not found' }, { status: 404 });
    }

    return NextResponse.json({ racket });
  } catch (error) {
    console.error('Error fetching racket by token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
