"use client";

import { useState } from 'react';
import { AdminJobsClient } from './AdminJobsClient';
import { Scissors, Wallet, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export function AdminJobsTabsClient({ initialJobs }: { initialJobs: any[] }) {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'READY' | 'COMPLETED'>('PENDING');

  const pending = initialJobs.filter(j => j.status === 'PENDING');
  const ready = initialJobs.filter(j => j.status === 'READY');
  const completed = initialJobs.filter(j => j.status === 'COMPLETED').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const groupedArchive = completed.reduce((acc, job) => {
    const d = new Date(job.createdAt);
    const key = d.toLocaleString('de-CH', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(job);
    return acc;
  }, {} as Record<string, any[]>);

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
            activeTab === 'PENDING' ? "left-1.5" : activeTab === 'READY' ? "left-[calc(33.333%+2px)]" : "left-[calc(66.666%+2.5px)]"
          )}
        />
        
        <button onClick={() => setActiveTab('PENDING')} className={tabClass('PENDING')}>
           <Scissors className={clsx("w-5 h-5", activeTab === 'PENDING' ? "text-gray-950" : "text-[#10b981]")} /> Zu besaiten ({pending.length})
        </button>
        <button onClick={() => setActiveTab('READY')} className={tabClass('READY')}>
           <div className="relative">
             <Wallet className={clsx("w-5 h-5", activeTab === 'READY' ? "text-gray-950" : "text-red-500")} />
             {ready.length > 0 && activeTab !== 'READY' && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />}
           </div>
           Abholbereit ({ready.length})
        </button>
        <button onClick={() => setActiveTab('COMPLETED')} className={tabClass('COMPLETED')}>
           <CheckCircle2 className={clsx("w-5 h-5", activeTab === 'COMPLETED' ? "text-gray-950" : "text-gray-600")} /> Archiv ({completed.length})
        </button>
      </div>

      <div className="flex flex-col gap-3">
         {activeTab === 'PENDING' && (
           pending.length > 0 ? <AdminJobsClient initialJobs={pending} statusType="PENDING" /> : <div className="text-gray-500 font-bold p-8 text-center bg-[#161616] rounded-3xl border border-white/5 shadow-lg">Nichts mehr zu tun!</div>
         )}
         {activeTab === 'READY' && (
           ready.length > 0 ? <AdminJobsClient initialJobs={ready} statusType="READY" /> : <div className="text-gray-500 font-bold p-8 text-center bg-[#161616] rounded-3xl border border-white/5 shadow-lg">Keine offenen Zahlungen.</div>
         )}
         {activeTab === 'COMPLETED' && (
           completed.length > 0 ? (
             <div className="space-y-8 mt-2">
                {Object.entries(groupedArchive).map(([monthYear, monthJobs]) => (
                  <div key={monthYear}>
                    <h3 className="sticky top-[84px] z-10 bg-[#0a0a0a]/90 backdrop-blur-md py-3 text-[11px] font-black tracking-widest text-[#10b981] uppercase mb-4 border-b border-[#10b981]/10 flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4" /> {monthYear}
                    </h3>
                    <div className="flex flex-col gap-3">
                      {/* @ts-ignore */}
                      <AdminJobsClient initialJobs={monthJobs} hideActions={true} statusType="COMPLETED" />
                    </div>
                  </div>
                ))}
             </div>
           ) : <div className="text-gray-500 font-bold p-8 text-center bg-[#161616] rounded-3xl border border-white/5 shadow-lg">Archiv ist leer.</div>
         )}
      </div>
    </div>
  );
}
