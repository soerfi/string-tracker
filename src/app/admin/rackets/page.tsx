import { AdminRacketsClient } from './AdminRacketsClient';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function RacketsPage() {
  const presets = await prisma.racketPreset.findMany({
    orderBy: [
      { brand: 'asc' },
      { model: 'asc' }
    ]
  });

  return <AdminRacketsClient initialPresets={presets} />;
}
