import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { CustomerDetailClient } from './CustomerDetailClient';
import { TopBar } from '@/components/TopBar';

let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  const globalWithPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
  if (!globalWithPrisma.prisma) globalWithPrisma.prisma = new PrismaClient();
  prisma = globalWithPrisma.prisma;
}

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const result = await params;
  if (!result || !result.id) return notFound();
  
  const customer = await prisma.player.findUnique({
    where: { id: result.id },
    include: {
      rackets: { orderBy: { createdAt: 'desc' } },
      jobs: { orderBy: { createdAt: 'desc' }, include: { string: true } }
    }
  });

  if (!customer) return notFound();

  const racketPresets = await prisma.racketPreset.findMany({
    orderBy: [ { brand: 'asc' }, { model: 'asc' } ]
  });

  return (
    <main className="min-h-[100dvh] bg-[#0a0a0a] text-white p-6 pb-32 font-sans md:ml-[280px]">
      <TopBar />
      <CustomerDetailClient initialCustomer={customer} initialPresets={racketPresets} />
    </main>
  );
}
