"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, CheckCircle } from 'lucide-react';

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
}

export function AdminJobsClient({ initialJobs, hideActions = false }: { initialJobs: JobType[], hideActions?: boolean }) {
  const [jobs, setJobs] = useState(initialJobs);

  const deleteJob = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Auftrag wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) setJobs(jobs.filter(j => j.id !== id));
    } catch(err) {
      console.error(err);
    }
  };

  const markDone = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DONE' })
      });
      if (res.ok) setJobs(jobs.filter(j => j.id !== id));
    } catch(err) {
       console.error(err);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="bg-[#161616] p-6 rounded-3xl border border-white/5 text-center text-gray-500 font-medium tracking-wide">
        Keine anstehenden Aufträge.
      </div>
    );
  }

  return (
    <>
      {jobs.map(job => (
        <Link href={`/admin/jobs/${job.id}`} key={job.id} className="bg-[#161616] p-5 rounded-3xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors active:scale-[0.98] group relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10 w-full pr-8">
            <div className="w-12 h-12 rounded-2xl bg-[#0a0a0a] border border-white/5 flex shrink-0 items-center justify-center text-[#10b981] font-bold text-lg">
              {job.player.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-lg leading-tight mb-0.5 truncate">{job.player.name}</div>
              {(job.racketBrand || job.player.racketBrand) && (
                <div className="text-[11px] font-medium text-gray-400 truncate mb-0.5">
                  Schläger: {job.racketBrand || job.player.racketBrand} {job.racketModel || job.player.racketModel}
                </div>
              )}
              <div className="text-xs font-medium text-[#10b981] truncate">Saite: {job.string.brand} {job.string.model}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <div className="text-right flex flex-col items-end gap-1">
              <div className="font-black text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-lg text-sm">
                {job.deadline ? new Date(job.deadline).toLocaleDateString('de-CH') : 'Keine Frist'}
              </div>
              <div className="text-xs font-bold text-gray-500 tracking-wider hidden sm:block">
                {job.tensionMain}/{job.tensionCross} kg
              </div>
              {job.status === 'DONE' && (
                <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border mt-1 shadow-sm ${job.isPaid ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                  {job.isPaid ? "Bezahlt" : "Offen"}
                </div>
              )}
            </div>
            {/* Actions */}
            {!hideActions && (
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                <button title="Erledigt" onClick={(e) => markDone(job.id, e)} className="p-1.5 bg-[#10b981]/10 text-[#10b981] rounded-lg hover:bg-[#10b981]/20">
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button title="Löschen" onClick={(e) => deleteJob(job.id, e)} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20">
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
