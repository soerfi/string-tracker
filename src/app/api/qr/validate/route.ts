import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    // Ensure token is not already a racket
    const existingRacket = await prisma.racket.findUnique({
      where: { qrCodeToken: token }
    });
    
    if (existingRacket) {
      return NextResponse.json({ error: 'Schon als Racket registriert' }, { status: 409 });
    }

    // Must be in our PrePrintedCodes batch
    const printedCode = await prisma.prePrintedCode.findUnique({
      where: { shortCode: token }
    });

    if (!printedCode) {
       return NextResponse.json({ error: 'Nicht im System registriert' }, { status: 404 });
    }

    return NextResponse.json({ success: true, code: printedCode });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
