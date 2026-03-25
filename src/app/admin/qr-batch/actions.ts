"use server";

import { PrismaClient } from '@prisma/client';

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

export async function generateQrBatch(amount: number) {
  const generatedCodes: string[] = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 1, 0, clear capital alphanumeric
  
  for (let i = 0; i < amount; i++) {
    let code = '';
    for (let j = 0; j < 6; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    generatedCodes.push(code);
  }

  // Insert to DB
  try {
    const data = generatedCodes.map(code => ({ shortCode: code }));
    await prisma.prePrintedCode.createMany({
      data
    });
    return { success: true, codes: generatedCodes };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Fehler beim Einfügen in die Datenbank." };
  }
}

export async function getBatchStats() {
    const total = await prisma.prePrintedCode.count();
    const printed = await prisma.prePrintedCode.count({ where: { status: 'PRINTED' }});
    const assigned = await prisma.prePrintedCode.count({ where: { status: 'ASSIGNED' }});
    return { total, printed, assigned };
}
