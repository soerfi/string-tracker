"use client";

import { Scan, Settings, Users, Home, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export function BottomNav() {
  const pathname = usePathname();
  
  if (pathname === '/admin/new') return null;

  const navItemClass = (path: string) => clsx(
    "flex flex-col items-center justify-center w-16 h-full transition-colors",
    pathname === path ? "text-[#10b981]" : "text-gray-500 hover:text-gray-300"
  );

  return (
    <>
      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 h-[84px] px-6 flex items-center justify-between z-50 pb-safe">
        <Link href="/admin" className={navItemClass('/admin')}>
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Hub</span>
        </Link>

        <Link href="/admin/jobs" className={navItemClass('/admin/jobs')}>
          <ClipboardList className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Jobs</span>
        </Link>
        
        <div className="w-[72px] h-full flex justify-center -mt-8 relative z-10">
          <Link href="/admin/new" className="w-[64px] h-[64px] bg-[#10b981] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(16,185,129,0.3)] text-gray-950 transition-transform active:scale-95 hover:-translate-y-1">
            <Scan className="w-7 h-7" strokeWidth={2.5} />
          </Link>
        </div>
        
        <Link href="/admin/customers" className={navItemClass('/admin/customers')}>
          <Users className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Kunden</span>
        </Link>

        <Link href="/admin/settings" className={navItemClass('/admin/settings')}>
          <Settings className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Menü</span>
        </Link>
      </div>

      {/* DESKTOP SIDE NAV */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-[280px] bg-[#0a0a0a] border-r border-white/5 flex-col p-6 z-50">
         <div className="text-2xl font-black text-white mb-12 tracking-tighter">STRING<span className="text-[#10b981]">TRACKER</span></div>
         <div className="space-y-3 flex-1">
            <Link href="/admin" className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-colors ${pathname === '/admin' ? 'bg-[#10b981]/10 text-[#10b981]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Home className="w-5 h-5" /> Dashboard Hub
            </Link>
            <Link href="/admin/jobs" className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-colors ${pathname === '/admin/jobs' ? 'bg-[#10b981]/10 text-[#10b981]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <ClipboardList className="w-5 h-5" /> Warteschlange
            </Link>
            <Link href="/admin/customers" className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-colors ${pathname === '/admin/customers' ? 'bg-[#10b981]/10 text-[#10b981]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Users className="w-5 h-5" /> Kundenkartei
            </Link>
         </div>
         <div className="mt-auto space-y-4">
            <Link href="/admin/new" className="flex items-center justify-center gap-2 w-full bg-[#10b981] text-gray-950 font-black px-4 py-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-[#059669] transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Scan className="w-5 h-5" /> Neuer Auftrag / Scan
            </Link>
            <Link href="/admin/settings" className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-colors ${pathname === '/admin/settings' ? 'bg-[#10b981]/10 text-[#10b981]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Settings className="w-5 h-5" /> Einstellungen
            </Link>
         </div>
      </div>
    </>
  );
}
