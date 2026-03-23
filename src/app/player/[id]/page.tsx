import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import { PlayerDashboard } from '@/components/PlayerDashboard'

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

export const dynamic = 'force-dynamic';

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // 1. Try to find a permanent Racket by QR Token
  const racket = await prisma.racket.findUnique({
    where: { qrCodeToken: id },
    include: {
      player: true,
      jobs: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { string: true }
      }
    }
  });

  if (racket) {
    if (racket.jobs.length === 0) {
      return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 flex items-center justify-center text-center">
          <div>
            <h1 className="text-3xl font-black mb-2 text-[#10b981]">{racket.brand} {racket.model}</h1>
            <p className="text-gray-400 font-medium">Bespannungs-Daten noch nicht verknüpft.</p>
          </div>
        </main>
      );
    }
    
    const job = racket.jobs[0];
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white p-4">
        <PlayerDashboard 
          stringDate={job.stringDate.toISOString()}
          baseLifeHours={job.string.baseLifeHours}
          skillMultiplier={racket.player.skillMultiplier}
          initialWeeklyFrequency={racket.player.weeklyFrequency}
          stringBrand={job.string.brand}
          stringModel={job.string.model}
          stringGauge={job.string.gauge}
          stringType={job.string.type}
          stringBenefits={JSON.parse(job.string.benefits)}
          descriptionDe={job.string.descriptionDe}
          tensionMain={job.tensionMain}
          tensionCross={job.tensionCross}
          qrCodeToken={id}
          notes={job.notes}
          playerName={racket.player.name}
          racketBrand={racket.brand}
          racketModel={racket.model}
          stringImageUrl={job.string.imageUrl}
        />
      </main>
    );
  }

  // 2. Fallback to Legacy StringJob Token
  const job = await prisma.stringJob.findUnique({
    where: { qrCodeToken: id },
    include: {
      player: true,
      string: true
    }
  });

  if (!job) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4">
      <PlayerDashboard 
        stringDate={job.stringDate.toISOString()}
        baseLifeHours={job.string.baseLifeHours}
        skillMultiplier={job.player.skillMultiplier}
        initialWeeklyFrequency={job.player.weeklyFrequency}
        stringBrand={job.string.brand}
        stringModel={job.string.model}
        stringGauge={job.string.gauge}
        stringType={job.string.type}
        stringBenefits={JSON.parse(job.string.benefits)}
        descriptionDe={job.string.descriptionDe}
        tensionMain={job.tensionMain}
        tensionCross={job.tensionCross}
        qrCodeToken={id}
        notes={job.notes}
        playerName={job.player.name}
        racketBrand={job.racketBrand || job.player.racketBrand}
        racketModel={job.racketModel || job.player.racketModel}
        stringImageUrl={job.string.imageUrl}
      />
    </main>
  );
}
