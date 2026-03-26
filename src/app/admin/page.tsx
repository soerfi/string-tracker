import { PrismaClient } from '@prisma/client'
import { AdminJobsClient } from '@/components/AdminJobsClient'
import { Scan, Scissors, Wallet, CheckCircle } from 'lucide-react'
import Link from 'next/link'

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

export default async function AdminDashboard() {
  const pendingJobs = await prisma.stringJob.findMany({
    where: { status: 'PENDING' },
    orderBy: { deadline: 'asc' },
    include: { player: true, string: true }
  });

  const unpaidJobs = await prisma.stringJob.findMany({
    where: { status: 'DONE', isPaid: false },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    include: { player: true, string: true }
  });

  return (
    <main className="min-h-[100dvh] bg-[#0a0a0a] text-white p-6 pb-32 font-sans md:ml-[280px]">
      <div className="flex items-center justify-between mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">Hub</h1>
          <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-1">Workshop Übersicht</p>
        </div>
        <Link href="/admin/new" className="hidden md:flex items-center gap-2 bg-[#10b981] text-gray-950 font-black px-4 py-3 rounded-2xl hover:bg-[#059669] transition shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Scan className="w-5 h-5" /> Racket Scannen
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#161616] p-5 rounded-[24px] border border-white/5 relative overflow-hidden shadow-xl shadow-black group">
          <div className="absolute top-0 right-0 p-4 opacity-10 bg-[#10b981] rounded-bl-full w-24 h-24 -mr-8 -mt-8" />
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="p-2.5 bg-[#10b981] rounded-[14px] shadow-[0_0_15px_rgba(16,185,129,0.3)]"><Scissors className="w-5 h-5 text-gray-950" strokeWidth={2.5} /></div>
            <span className="text-[10px] font-black tracking-widest text-[#10b981] uppercase">Zu Besaiten</span>
          </div>
          <div className="text-4xl font-black text-white relative z-10 mt-3">{pendingJobs.length}</div>
        </div>
        
        <div className="bg-[#161616] p-5 rounded-[24px] border border-white/5 relative overflow-hidden shadow-xl shadow-black group">
          <div className="absolute top-0 right-0 p-4 opacity-10 bg-red-500 rounded-bl-full w-24 h-24 -mr-8 -mt-8" />
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="p-2.5 bg-red-500 rounded-[14px] shadow-[0_0_15px_rgba(239,68,68,0.3)]"><Wallet className="w-5 h-5 text-white" strokeWidth={2.5} /></div>
            <span className="text-[10px] font-black tracking-widest text-red-500 uppercase">Abholbereit</span>
          </div>
          <div className="text-4xl font-black text-white relative z-10 mt-3">{unpaidJobs.length}</div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-[11px] font-black tracking-widest text-gray-500 uppercase mb-4 flex items-center gap-2">
          <Scissors className="w-4 h-4 text-[#10b981]" /> Warteschlange
        </h2>
        {pendingJobs.length > 0 ? (
          <div className="flex flex-col gap-3">
             <AdminJobsClient initialJobs={pendingJobs} statusType="PENDING" />
          </div>
        ) : (
          <div className="bg-[#161616] border border-white/5 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-[#10b981]" />
             </div>
             <div className="text-xl font-black text-white mb-2">Alles erledigt!</div>
             <div className="text-sm font-medium text-gray-400">Keine Rackets in der Warteschlange.</div>
          </div>
        )}
      </section>

      {unpaidJobs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[11px] font-black tracking-widest text-gray-500 uppercase mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-red-400" /> Offene Zahlungen ({unpaidJobs.length})
          </h2>
          <div className="flex flex-col gap-3">
             <AdminJobsClient initialJobs={unpaidJobs} statusType="UNPAID" />
          </div>
        </section>
      )}
    </main>
  )
}
