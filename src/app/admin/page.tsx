import { PrismaClient } from '@prisma/client'
import { TopBar } from '@/components/TopBar'
import { AdminJobsClient } from '@/components/AdminJobsClient'

const prisma = new PrismaClient()

export default async function AdminDashboard() {
  const playersCount = await prisma.player.count();
  const stringsCount = await prisma.tennisString.count();
  
  // Fetch pending jobs ordered by deadline
  const recentJobs = await prisma.stringJob.findMany({
    where: { status: 'PENDING' },
    orderBy: { deadline: 'asc' },
    include: {
      player: true,
      string: true
    }
  });

  // Fetch completed BUT UNPAID jobs
  const unpaidJobs = await prisma.stringJob.findMany({
    where: { status: 'DONE', isPaid: false },
    orderBy: { updatedAt: 'desc' },
    include: {
      player: true,
      string: true
    }
  });

  // Fetch completely finished and PAID jobs
  const paidJobs = await prisma.stringJob.findMany({
    where: { status: 'DONE', isPaid: true },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    include: {
      player: true,
      string: true
    }
  });

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans">
      {/* Top Bar */}
      <TopBar />

      {/* Title Area */}
      <div className="flex items-start justify-end mb-8">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/5">
          <div className="w-full h-full bg-gradient-to-tr from-[#10b981] to-[#047857] flex items-center justify-center font-bold text-gray-950">A</div>
        </div>
      </div>

      {/* Insights Grid */}
      <section className="mb-10">
        <h2 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4">Statistik</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#161616] p-5 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-[#10b981]/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 bg-white rounded-bl-full w-24 h-24 -mr-8 -mt-8" />
            <div className="text-4xl font-black mb-1">{playersCount}</div>
            <div className="text-sm font-medium text-gray-400">Total Kunden</div>
          </div>
          <div className="bg-[#161616] p-5 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-[#10b981]/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 bg-[#10b981] rounded-bl-full w-24 h-24 -mr-8 -mt-8" />
            <div className="text-4xl font-black mb-1">{stringsCount}</div>
            <div className="text-sm font-medium text-gray-400">Total Saiten</div>
          </div>
        </div>
      </section>

      {/* Management Links */}
      <section className="mb-10 grid grid-cols-2 gap-4">
        <a href="/admin/customers" className="bg-[#10b981]/10 text-[#10b981] p-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-[#10b981]/20 hover:bg-[#10b981]/20 transition-colors shadow-lg">
          Kunden & Rackets
        </a>
        <a href="/admin/strings" className="bg-white/5 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 transition-colors shadow-lg">
          Saiten Inventar
        </a>
      </section>

      {/* Recent Rackets List */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Anstehende Aufträge</h2>
        </div>
        
        <div className="flex flex-col gap-3">
          <AdminJobsClient initialJobs={recentJobs} />
        </div>
      </section>

      {/* Unpaid Completed Jobs List */}
      {unpaidJobs.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-bold text-red-500 uppercase flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> 
              Noch nicht bezahlt
            </h2>
          </div>
          
          <div className="flex flex-col gap-3">
            <AdminJobsClient initialJobs={unpaidJobs} hideActions={true} />
          </div>
        </section>
      )}

      {/* Completed Paid Jobs List */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Archiv (Komplett abgeschlossen)</h2>
        </div>
        
        <div className="flex flex-col gap-3 opacity-40 hover:opacity-100 transition-opacity">
          <AdminJobsClient initialJobs={paidJobs} hideActions={true} />
        </div>
      </section>
    </main>
  )
}
