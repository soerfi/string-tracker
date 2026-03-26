import { PrismaClient } from '@prisma/client'
import { AdminForm } from '@/components/AdminForm'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic';

export default async function NewJobPage() {
  const strings = await prisma.tennisString.findMany({
    orderBy: { sortOrder: 'asc' }
  })
  
  const players = await prisma.player.findMany({
    orderBy: { name: 'asc' },
    include: { rackets: true }
  })

  const racketPresets = await prisma.racketPreset.findMany({
    orderBy: [ { brand: 'asc' }, { model: 'asc' } ]
  })
  
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4">
      <AdminForm strings={strings} players={players} racketPresets={racketPresets} />
    </main>
  )
}
