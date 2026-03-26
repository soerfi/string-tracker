"use client";

import { useState } from 'react';
import { Menu, X, Activity, User, Briefcase, Settings, ArrowRight, Layers, Trophy, Home, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TopBar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="flex items-center mb-8 relative z-50">
        <Link href="/admin" className="flex items-center gap-3 active:scale-95 transition-transform group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#10b981] to-[#047857] flex items-center justify-center shadow-lg shadow-[#10b981]/20 group-hover:shadow-[#10b981]/40 transition-shadow">
             <Trophy className="w-5 h-5 text-gray-950" />
          </div>
          <div>
            <div className="font-black text-xl tracking-tight text-white group-hover:text-[#10b981] transition-colors">
              String Tracker
            </div>
          </div>
        </Link>
      </header>
    </>
  );
}
