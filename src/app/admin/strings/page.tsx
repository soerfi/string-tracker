import { PrismaClient } from '@prisma/client'
import { AdminStringsClient } from '@/components/AdminStringsClient'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic';

export default async function StringsPage() {
  const strings = await prisma.tennisString.findMany({
    orderBy: { brand: 'asc' }
  })
  
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4 font-sans">
      <AdminStringsClient initialStrings={strings} />
    </main>
  )
}
