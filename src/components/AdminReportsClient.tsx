"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, Download, Calendar, Activity, DollarSign, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, format, parseISO } from 'date-fns';

type DateFilterType = 'currentMonth' | 'lastMonth' | 'year' | 'custom';

export function AdminReportsClient() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<DateFilterType>('currentMonth');
  
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (filterType !== 'custom') {
      const now = new Date();
      if (filterType === 'currentMonth') {
        setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
      } else if (filterType === 'lastMonth') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
      } else if (filterType === 'year') {
        setStartDate(format(startOfYear(now), 'yyyy-MM-dd'));
        setEndDate(format(endOfYear(now), 'yyyy-MM-dd'));
      }
    }
  }, [filterType]);

  useEffect(() => {
    async function fetchJobs() {
      if (!startDate || !endDate) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/reports?start=${startDate}T00:00:00.000Z&end=${endDate}T23:59:59.999Z`);
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    }
    fetchJobs();
  }, [startDate, endDate]);

  const totalRevenue = jobs.reduce((sum, job) => sum + (job.price || 0), 0);
  const totalPaid = jobs.filter(j => j.isPaid).reduce((sum, job) => sum + (job.price || 0), 0);
  const totalUnpaid = totalRevenue - totalPaid;

  const handleExportCSV = () => {
    const headers = ['Datum', 'Spieler', 'Racket', 'Saite', 'Spannung', 'Preis', 'Bezahlt', 'Zahlungsart'];
    const rows = jobs.map(job => [
      format(parseISO(job.createdAt), 'dd.MM.yyyy'),
      job.player?.name || '-',
      job.racket ? `${job.racket.brand} ${job.racket.model}` : '-',
      job.string ? `${job.string.brand} ${job.string.model}` : '-',
      `${job.tensionM}kg / ${job.tensionC}kg`,
      job.price || 0,
      job.isPaid ? 'Ja' : 'Nein',
      job.paymentMethod || '-'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auswertung_${startDate}_bis_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 font-sans px-2">
      <header className="flex items-center gap-4 mb-8 pt-6">
        <button onClick={() => router.push('/admin')} className="w-10 h-10 bg-[#161616] rounded-xl flex items-center justify-center border border-white/5 active:scale-95 transition-all text-gray-400 hover:text-white hover:bg-white/5">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
           <h1 className="text-2xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Auswertungen</h1>
           <p className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest mt-1">Reports & Export</p>
        </div>
      </header>

      {/* Date Filter Selection */}
      <div className="bg-[#161616] p-5 rounded-[24px] border border-white/5 shadow-xl mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setFilterType('currentMonth')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterType === 'currentMonth' ? 'bg-[#10b981] text-gray-950' : 'bg-[#0a0a0a] border border-white/5 text-gray-400 hover:text-white'}`}>Dieser Monat</button>
          <button onClick={() => setFilterType('lastMonth')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterType === 'lastMonth' ? 'bg-[#10b981] text-gray-950' : 'bg-[#0a0a0a] border border-white/5 text-gray-400 hover:text-white'}`}>Letzter Monat</button>
          <button onClick={() => setFilterType('year')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterType === 'year' ? 'bg-[#10b981] text-gray-950' : 'bg-[#0a0a0a] border border-white/5 text-gray-400 hover:text-white'}`}>Dieses Jahr</button>
          <button onClick={() => setFilterType('custom')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterType === 'custom' ? 'bg-[#10b981] text-gray-950' : 'bg-[#0a0a0a] border border-white/5 text-gray-400 hover:text-white'}`}>Eigene</button>
        </div>
        
        {filterType === 'custom' && (
          <div className="flex gap-4 items-center mb-2 animate-in fade-in slide-in-from-top-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10b981] [color-scheme:dark]" />
            <span className="text-gray-500 font-bold">bis</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10b981] [color-scheme:dark]" />
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#161616] p-5 rounded-[24px] border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-[#10b981]/10 rounded-lg"><Activity className="w-5 h-5 text-[#10b981]" /></div>
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Aufträge</span>
          </div>
          <div className="text-3xl font-black text-white">{jobs.length}</div>
        </div>

        <div className="bg-[#161616] p-5 rounded-[24px] border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-[#10b981]/10 rounded-lg"><DollarSign className="w-5 h-5 text-[#10b981]" /></div>
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Umsatz Total</span>
          </div>
          <div className="text-3xl font-black text-[#10b981]">CHF {totalRevenue}</div>
        </div>
      </div>

      <div className="bg-[#161616] p-5 rounded-[24px] border border-white/5 mb-8 flex justify-between items-center">
         <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-red-400" />
              <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Offene Zahlungen</span>
            </div>
            <div className="text-2xl font-black text-white">CHF {totalUnpaid}</div>
         </div>
         <div className="text-right">
            <div className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-1">Bezahlt</div>
            <div className="text-xl font-black text-gray-300">CHF {totalPaid}</div>
         </div>
      </div>

      <button 
        onClick={handleExportCSV} 
        disabled={jobs.length === 0}
        className="w-full bg-white text-gray-950 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
      >
        <Download className="w-5 h-5" /> CSV Exportieren
      </button>

      {isLoading && <div className="text-center mt-8 text-sm font-bold text-gray-500">Lade Daten...</div>}
    </div>
  );
}
