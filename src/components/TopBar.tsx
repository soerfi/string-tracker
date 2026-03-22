"use client";

import { useState } from 'react';
import { Menu, X, Activity, Users, Settings, Plus, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TopBar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="flex items-center justify-between mb-8 relative z-50">
        <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded bg-[#10b981] flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#0a0a0a]" strokeWidth={3} />
          </div>
          <span className="text-xl font-bold tracking-tight">AceTrace</span>
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 -mr-2 text-gray-300 hover:text-white transition">
          {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </header>

      {/* Slide-out Menu */}
      <div className={`fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl z-40 transition-all duration-300 ease-in-out px-6 pt-32 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <nav className="flex flex-col gap-6 text-xl font-bold">
          <Link href="/admin" onClick={() => setIsOpen(false)} className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${pathname === '/admin' ? 'bg-[#10b981] text-gray-950' : 'bg-[#161616] text-white hover:bg-[#202020]'}`}>
            <Home className="w-6 h-6" /> Übersicht
          </Link>
          <Link href="/admin/new" onClick={() => setIsOpen(false)} className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${pathname === '/admin/new' ? 'bg-[#10b981] text-gray-950' : 'bg-[#161616] text-white hover:bg-[#202020]'}`}>
            <Plus className="w-6 h-6" /> Neuer Auftrag
          </Link>
          <Link href="/admin/customers" onClick={() => setIsOpen(false)} className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${pathname === '/admin/customers' ? 'bg-[#10b981] text-gray-950' : 'bg-[#161616] text-white hover:bg-[#202020]'}`}>
            <Users className="w-6 h-6" /> Kunden
          </Link>
          <Link href="/admin/settings" onClick={() => setIsOpen(false)} className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${pathname === '/admin/settings' ? 'bg-[#10b981] text-gray-950' : 'bg-[#161616] text-white hover:bg-[#202020]'}`}>
            <Settings className="w-6 h-6" /> Einstellungen
          </Link>
        </nav>
      </div>
    </>
  );
}
