"use client";

import { useState } from 'react';
import { AdminJobsClient } from './AdminJobsClient';
import { Scissors, Wallet, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export function AdminJobsTabsClient({ initialJobs }: { initialJobs: any[] }) {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'DONE' | 'PAID'>('PENDING');

  const pending = initialJobs.filter(j => j.status === 'PENDING');
  const doneUnpaid = initialJobs.filter(j => j.status === 'DONE' && !j.isPaid);
  const paid = initialJobs.filter(j => j.status === 'DONE' && j.isPaid);

  const tabClass = (tabId: string) => clsx(
    "flex-1 py-3 text-center text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all rounded-xl relative z-10 flex flex-col items-center gap-1.5 justify-center",
    activeTab === tabId ? "text-gray-950" : "text-gray-500 hover:text-white"
  );

  return (
    <div className="space-y-6">
      <div className="bg-[#161616] p-1.5 rounded-2xl border border-white/5 flex shadow-lg relative max-w-xl mx-auto w-full">
        <div 
          className={clsx(
            "absolute top-1.5 bottom-1.5 w-[calc(33.333%-4px)] bg-[#10b981] rounded-xl transition-all duration-300 ease-out shadow-[0_0_20px_rgba(16,185,129,0.3)]",
            activeTab === 'PENDING' ? "left-1.5" : activeTab === 'DONE' ? "left-[calc(33.333%+2px)]" : "left-[calc(66.666%+2.5px)]"
          )}
        />
        
        <button onClick={() => setActiveTab('PENDING')} className={tabClass('PENDING')}>
           <Scissors className={clsx("w-5 h-5", activeTab === 'PENDING' ? "text-gray-950" : "text-[#10b981]")} /> Offen ({pending.length})
        </button>
        <button onClick={() => setActiveTab('DONE')} className={tabClass('DONE')}>
           <div className="relative">
             <Wallet className={clsx("w-5 h-5", activeTab === 'DONE' ? "text-gray-950" : "text-red-500")} />
             {doneUnpaid.length > 0 && activeTab !== 'DONE' && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />}
           </div>
           Fertig ({doneUnpaid.length})
        </button>
        <button onClick={() => setActiveTab('PAID')} className={tabClass('PAID')}>
           <CheckCircle2 className={clsx("w-5 h-5", activeTab === 'PAID' ? "text-gray-950" : "text-gray-600")} /> Archiv ({paid.length})
        </button>
      </div>

      <div className="flex flex-col gap-3">
         {activeTab === 'PENDING' && (
           pending.length > 0 ? <AdminJobsClient initialJobs={pending} statusType="PENDING" /> : <div className="text-gray-500 font-bold p-8 text-center bg-[#161616] rounded-3xl border border-white/5 shadow-lg">Nichts mehr zu tun!</div>
         )}
         {activeTab === 'DONE' && (
           doneUnpaid.length > 0 ? <AdminJobsClient initialJobs={doneUnpaid} statusType="UNPAID" /> : <div className="text-gray-500 font-bold p-8 text-center bg-[#161616] rounded-3xl border border-white/5 shadow-lg">Keine offenen Zahlungen.</div>
         )}
         {activeTab === 'PAID' && (
           paid.length > 0 ? <AdminJobsClient initialJobs={paid} hideActions={true} /> : <div className="text-gray-500 font-bold p-8 text-center bg-[#161616] rounded-3xl border border-white/5 shadow-lg">Archiv ist leer.</div>
         )}
      </div>
    </div>
  );
}
