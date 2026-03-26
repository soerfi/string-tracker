import { PrismaClient } from '@prisma/client'
import { TopBar } from '@/components/TopBar'
import { AdminJobsTabsClient } from '@/components/AdminJobsTabsClient'

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

export default async function AdminJobsPage() {
  const jobs = await prisma.stringJob.findMany({
    orderBy: { deadline: 'asc' },
    include: {
      player: true,
      string: true
    }
  });

  return (
    <main className="min-h-[100dvh] bg-[#0a0a0a] text-white p-6 pb-32 font-sans md:ml-[280px]">
      <TopBar />

      <header className="mb-6 pt-4">
        <h1 className="text-3xl font-black tracking-tight leading-tight">Aufträge</h1>
        <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-1">Alle Aufträge</p>
      </header>

      <AdminJobsTabsClient initialJobs={jobs} />
    </main>
  );
}
