"use client";

import { Scan, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();
  if (pathname === '/admin/new') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c] border-t border-white/5 h-[84px] px-10 flex items-center justify-between z-50 rounded-t-3xl">
      <Link href="/admin/customers" className="text-gray-400 hover:text-white transition-colors">
        <Users className="w-6 h-6" />
      </Link>
      
      <Link href="/admin/new" className="w-[60px] h-[60px] bg-[#10b981] rounded-[20px] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] text-gray-950 transition-transform hover:scale-105 active:scale-95">
        <Scan className="w-7 h-7" strokeWidth={2.5} />
      </Link>
      
      <Link href="/admin/settings" className="text-gray-400 hover:text-white transition-colors">
        <Settings className="w-6 h-6" />
      </Link>
    </div>
  );
}
