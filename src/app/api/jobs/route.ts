import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

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
    
    let player;
    
    if (body.playerId) {
      player = await prisma.player.update({ 
        where: { id: body.playerId },
        data: {
          name: body.playerName,
          email: body.email || null,
          phone: body.phone || null,
          racketBrand: body.racketBrand || null,
          racketModel: body.racketModel || null,
        }
      });
      if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    } else {
      player = await prisma.player.create({
        data: {
          name: body.playerName,
          email: body.email || null,
          phone: body.phone || null,
          racketBrand: body.racketBrand || null,
          racketModel: body.racketModel || null,
        }
      });
    }

    const token = body.qrCodeToken || uuidv4();

    const { racketId, stringId, tensionMain, tensionCross, notes, deadline, grommetsOk, gripOk, changeOvergrip, racketBrand, racketModel, racketGrip, racketWeight } = body;

    let finalRacketId = racketId;

    if (!finalRacketId && racketBrand && racketModel) {
      const newRacket = await prisma.racket.create({
        data: {
          playerId: player.id,
          brand: racketBrand,
          model: racketModel,
          gripSize: racketGrip || "L3",
          weight: racketWeight ? parseInt(racketWeight.toString()) : 300,
          qrCodeToken: token
        }
      });
      finalRacketId = newRacket.id;
    }

    const job = await prisma.stringJob.create({
      data: {
        playerId: player.id,
        stringId,
        tensionMain: tensionMain ? parseFloat(tensionMain) : null,
        tensionCross: tensionCross ? parseFloat(tensionCross) : null,
        notes: notes || null,
        deadline: deadline ? new Date(deadline) : null,
        grommetsOk: grommetsOk ?? true,
        gripOk: gripOk ?? true,
        changeOvergrip: changeOvergrip ?? false,
        qrCodeToken: token,
        racketId: finalRacketId || null,
        racketBrand: racketBrand || null,
        racketModel: racketModel || null
      }
    });

    return NextResponse.json({ success: true, token, job });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
