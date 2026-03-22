import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import { JobEditClient } from './JobEditClient'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic';

export default async function AdminJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const job = await prisma.stringJob.findUnique({
    where: { id },
    include: {
      player: true,
      string: true
    }
  });

  if (!job) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <JobEditClient job={job} />
    </main>
  );
}
