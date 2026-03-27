"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Wallet } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface JobType {
  id: string;
  deadline: Date | null;
  qrCodeToken: string;
  tensionMain: number | null;
  tensionCross: number | null;
  racketBrand: string | null;
  racketModel: string | null;
  status: string;
  isPaid: boolean;
  player: { name: string; racketBrand: string | null; racketModel: string | null; };
  string: { brand: string; model: string };
  createdAt: string | Date;
}

export function AdminJobsClient({ initialJobs, hideActions = false, statusType = "ALL" }: { initialJobs: JobType[], hideActions?: boolean, statusType?: "PENDING" | "READY" | "COMPLETED" | "ALL" }) {
  const [jobs, setJobs] = useState(initialJobs);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const confirmDeleteJob = async () => {
    if(!jobToDelete) return;
    try {
      const res = await fetch(`/api/jobs/${jobToDelete}`, { method: 'DELETE' });
      if (res.ok) setJobs(jobs.filter(j => j.id !== jobToDelete));
    } catch(err) { console.error(err); }
    setJobToDelete(null);
  };

  const deleteJob = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setJobToDelete(id);
  };



  const markPaid = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: true, status: 'COMPLETED' })
      });
      if (res.ok) setJobs(jobs.filter(j => j.id !== id));
    } catch(err) { console.error(err); }
  };

  if (jobs.length === 0) return null;

  return (
    <>
      <ConfirmModal 
        isOpen={!!jobToDelete} 
        title="Auftrag löschen" 
        message="Möchtest du diesen Auftrag wirklich Unwiderruflich löschen?" 
        onConfirm={confirmDeleteJob} 
        onCancel={() => setJobToDelete(null)} 
      />
      {jobs.map(job => (
        <Link href={`/admin/jobs/${job.id}`} key={job.id} className="bg-[#161616] p-4 rounded-[24px] border border-white/5 flex flex-col gap-3 hover:border-white/10 transition-colors active:scale-[0.98] group relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between relative z-10 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-[#0a0a0a] border border-white/5 flex shrink-0 items-center justify-center text-[#10b981] font-black text-lg">
                {job.player?.name?.charAt(0) || '?'}
              </div>
              <div>
                <div className="font-bold text-base leading-tight text-white truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs">{job.player?.name || 'Unbekannt'}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5 truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs">
                  {job.racketBrand || job.player?.racketBrand} {job.racketModel || job.player?.racketModel}
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end shrink-0">
              {job.deadline && statusType === 'PENDING' && (
                <div className="font-black text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-2 py-1 rounded text-[10px] uppercase tracking-wider mb-1">
                  Bis {new Date(job.deadline).toLocaleDateString('de-CH').slice(0, 5)}
                </div>
              )}
              <div className="text-xs font-bold text-white tracking-widest bg-white/5 px-2 py-1 rounded flex gap-1">
                 <span className="text-gray-500">#</span> {job.tensionMain}/{job.tensionCross} <span className="text-gray-500">kg</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
            <div className="text-xs font-bold text-[#10b981] truncate pl-1 pr-2">
               {job.string?.brand} {job.string?.model}
            </div>
            
            {!hideActions && (
              <div className="flex gap-2 relative z-20 shrink-0 border-l border-white/5 pl-3">
                {statusType === 'READY' && (
                  <button onClick={(e) => markPaid(job.id, e)} className="px-4 py-2 bg-red-500 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-widest rounded-xl hover:bg-red-600 transition shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" /> Bezahlt
                  </button>
                )}
                <button title="Löschen" onClick={(e) => deleteJob(job.id, e)} className="p-2 bg-white/5 text-gray-400 rounded-xl hover:bg-red-500/20 hover:text-red-500 transition border border-transparent hover:border-red-500/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </Link>
      ))}
    </>
  );
}
