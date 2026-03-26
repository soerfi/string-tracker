import { AdminReportsClient } from '@/components/AdminReportsClient';

export const dynamic = 'force-dynamic';

export default function ReportsPage() {
  return (
    <main className="min-h-[100dvh] bg-[#0a0a0a] text-white p-6 pb-32 font-sans md:ml-[280px]">
      <AdminReportsClient />
    </main>
  );
}
