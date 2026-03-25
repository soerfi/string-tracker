import { PrismaClient } from '@prisma/client'
import { Users } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { AdminCustomersClient } from '@/components/AdminCustomersClient'

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient()

export default async function CustomersPage() {
  const players = await prisma.player.findMany({
    include: { 
      jobs: true,
      rackets: true
    },
    orderBy: { name: 'asc' }
  });

  return (
    <main className="min-h-[100dvh] bg-[#0a0a0a] text-white p-6 pb-32 font-sans md:ml-[280px]">
      <TopBar />
      
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">Kunden</h1>
          <p className="text-sm text-gray-400 font-medium">Kundendatenbank</p>
        </div>
        <div className="w-12 h-12 bg-[#161616] rounded-2xl flex items-center justify-center border border-white/5 shadow-lg">
          <Users className="w-6 h-6 text-[#10b981]" />
        </div>
      </header>

      <AdminCustomersClient initialPlayers={players} />
    </main>
  );
}
