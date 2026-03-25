import { PrismaClient } from '@prisma/client'
import { AdminStringsClient } from '@/components/AdminStringsClient'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic';

export default async function StringsPage() {
  const strings = await prisma.tennisString.findMany({
    orderBy: { brand: 'asc' }
  })
  
  return (
    <main className="min-h-[100dvh] bg-[#0a0a0a] text-white p-6 pb-32 font-sans md:ml-[280px]">
      <AdminStringsClient initialStrings={strings} />
    </main>
  )
}
