"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, QrCode, Save, Clock, CircleDollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function JobEditClient({ job }: { job: {
  id: string;
  price: number | null;
  notes: string | null;
  status: string;
  qrCodeToken: string;
  racketBrand: string | null;
  racketModel: string | null;
  tensionMain: number | null;
  tensionCross: number | null;
  grommetsOk: boolean;
  gripOk: boolean;
  changeOvergrip: boolean;
  isPaid: boolean;
  paymentMethod: string | null;
  player: { name: string; racketBrand: string | null; racketModel: string | null };
  string: { brand: string; model: string };
} }) {
  const router = useRouter();
  const [price, setPrice] = useState(job.price?.toString() || "50");
  const [notes, setNotes] = useState(job.notes || "");
  const [tensionMain, setTensionMain] = useState(job.tensionMain?.toString() || "");
  const [tensionCross, setTensionCross] = useState(job.tensionCross?.toString() || "");
  const [grommetsOk, setGrommetsOk] = useState(job.grommetsOk);
  const [gripOk, setGripOk] = useState(job.gripOk);
  const [changeOvergrip, setChangeOvergrip] = useState(job.changeOvergrip);
  const [isPaid, setIsPaid] = useState(job.isPaid);
  const [paymentMethod, setPaymentMethod] = useState(job.paymentMethod);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(job.status || "PENDING");

  const handleSave = async (updatedStatus = status, updatedIsPaid = isPaid, updatedPaymentMethod = paymentMethod) => {
    setIsSaving(true);
    let success = false;
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: parseFloat(price),
          notes,
          status: updatedStatus,
          isPaid: updatedIsPaid,
          paymentMethod: updatedPaymentMethod,
          tensionMain: tensionMain ? parseFloat(tensionMain) : null,
          tensionCross: tensionCross ? parseFloat(tensionCross) : null,
          grommetsOk,
          gripOk,
          changeOvergrip
        })
      });
      if (res.ok) {
        setStatus(updatedStatus);
        setIsPaid(updatedIsPaid);
        setPaymentMethod(updatedPaymentMethod);
        toast.success("Gespeichert");
        success = true;
      } else {
        toast.error("Fehler beim Speichern");
      }
    } catch(err) {
      console.error(err);
      toast.error("Fehler beim Speichern");
    }
    setIsSaving(false);
    return success;
  };

  const toggleStatusAndSave = async () => {
    const newStatus = status === 'DONE' ? 'PENDING' : 'DONE';
    const success = await handleSave(newStatus, isPaid, paymentMethod);
    if (success && newStatus === 'DONE') {
      router.refresh();
      router.push('/admin');
    }
  };

  const selectPaymentAndSave = async (method: string | null) => {
    setShowPaymentSelector(false);
    let success = false;
    if (method) {
      success = await handleSave(status, true, method);
    } else {
      success = await handleSave(status, false, null);
    }
    if (success) {
      router.refresh();
      router.push('/admin');
    }
  };

  return (
    <div className="pb-32 select-none">
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md p-6 border-b border-white/5 flex items-center gap-4">
        <button onClick={() => router.push('/admin')} className="w-10 h-10 bg-[#161616] rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5">
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight leading-tight">Auftrag bearbeiten</h1>
          <p className="text-xs text-gray-400 font-medium">#{job.id.substring(0, 8)}</p>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-lg mx-auto mt-4">
        
        {/* Customer & Racket Card */}
        <div className="bg-[#161616] border border-white/5 rounded-3xl p-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-[11px] font-bold tracking-widest text-[#10b981] uppercase mb-1">Kunde</div>
              <div className="font-black text-xl">{job.player.name}</div>
            </div>
            <a href={`/p/${job.qrCodeToken}`} target="_blank" className="flex items-center gap-1.5 bg-[#10b981]/10 text-[#10b981] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#10b981]/20 transition-colors">
              <QrCode className="w-3.5 h-3.5" /> Dashboard
            </a>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5">
            <div>
              <div className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Schläger</div>
              <div className="font-medium text-white">{job.racketBrand || job.player.racketBrand || "Tennis"} {job.racketModel || job.player.racketModel || "Racket"}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Saite</div>
              <div className="font-medium text-[#10b981]">{job.string.brand} {job.string.model}</div>
            </div>
          </div>
        </div>

        {/* Mutable Fields Container */}
        <div className="space-y-4">
          
          <div className="bg-[#161616] border border-white/5 rounded-3xl p-5 shadow-inner">
            <h3 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4 ml-1">Technische Parameter</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Längs (kg)</label>
                <input type="number" value={tensionMain} onChange={e => setTensionMain(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-[#10b981] outline-none select-text" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Quer (kg)</label>
                <input type="number" value={tensionCross} onChange={e => setTensionCross(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-[#10b981] outline-none select-text" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-white/5 rounded-xl cursor-pointer hover:border-[#10b981]/50 transition-colors">
                <span className="font-bold text-sm text-gray-300">Ösen intakt</span>
                <input type="checkbox" checked={grommetsOk} onChange={e => setGrommetsOk(e.target.checked)} className="w-5 h-5 accent-[#10b981]" />
              </label>
              <label className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-white/5 rounded-xl cursor-pointer hover:border-[#10b981]/50 transition-colors">
                <span className="font-bold text-sm text-gray-300">Griff intakt</span>
                <input type="checkbox" checked={gripOk} onChange={e => setGripOk(e.target.checked)} className="w-5 h-5 accent-[#10b981]" />
              </label>
              <label className="flex items-center justify-between p-3 bg-[#0a0a0a] border ${changeOvergrip ? 'border-[#10b981]/50 bg-[#10b981]/5' : 'border-white/5'} rounded-xl cursor-pointer hover:border-[#10b981]/50 transition-colors">
                <span className={`font-bold text-sm ${changeOvergrip ? 'text-[#10b981]' : 'text-gray-300'}`}>Overgrip ersetzen</span>
                <input type="checkbox" checked={changeOvergrip} onChange={e => setChangeOvergrip(e.target.checked)} className="w-5 h-5 accent-[#10b981]" />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase ml-1">Bemerkung</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-[#161616] border border-white/5 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:border-[#10b981] transition shadow-inner resize-none select-text"
              placeholder="Zusätzliche Notizen zum Auftrag..."
            />
          </div>

          <div className="bg-[#161616] border border-white/5 rounded-3xl p-5 shadow-inner space-y-4">
            <h3 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase ml-1">Auftrag & Finanzen</h3>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase ml-1 block mb-1">Preis (CHF)</label>
                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-white font-black text-lg focus:outline-none focus:border-[#10b981] transition shadow-inner select-text"
                  placeholder="50"
                />
              </div>
            </div>

            {showPaymentSelector ? (
              <div className="flex flex-col gap-2 p-4 bg-[#161616] border border-white/10 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
                <div className="text-xs font-bold text-gray-400 uppercase mb-2 text-center tracking-widest">Wie wurde bezahlt?</div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => selectPaymentAndSave('Bar')} className="py-3 px-2 bg-white/5 hover:bg-[#10b981]/10 hover:text-[#10b981] border border-white/10 hover:border-[#10b981]/50 rounded-lg text-sm font-black transition-colors rounded-xl flex items-center justify-center">Bar</button>
                  <button onClick={() => selectPaymentAndSave('Twint')} className="py-3 px-2 bg-white/5 hover:bg-[#10b981]/10 hover:text-[#10b981] border border-white/10 hover:border-[#10b981]/50 rounded-lg text-sm font-black transition-colors rounded-xl flex items-center justify-center">Twint</button>
                  <button onClick={() => selectPaymentAndSave('Andere')} className="py-3 px-2 bg-white/5 hover:bg-[#10b981]/10 hover:text-[#10b981] border border-white/10 hover:border-[#10b981]/50 rounded-lg text-sm font-black transition-colors rounded-xl flex items-center justify-center">Andere</button>
                </div>
                <button onClick={() => selectPaymentAndSave(null)} className="w-full mt-2 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg text-xs font-black transition-colors rounded-xl">Rechnung ist OFFEN</button>
              </div>
            ) : (
              <label onClick={(e) => { e.preventDefault(); setShowPaymentSelector(true); }} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${isPaid ? 'bg-gradient-to-r from-[#10b981]/20 to-transparent border-[#10b981]/40 text-[#10b981]' : 'bg-[#0a0a0a] border-white/5 text-gray-300 hover:border-[#10b981]/50'}`}>
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="font-black">Rechnung {isPaid ? 'bezahlt' : 'offen'}</span>
                    {isPaid && paymentMethod && <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">mit {paymentMethod}</span>}
                  </div>
                </div>
                <input type="checkbox" checked={isPaid} readOnly className="w-6 h-6 accent-[#10b981] pointer-events-none" />
              </label>
            )}
          </div>

          {/* Status Toggle (MOVED TO BOTTOM) */}
          <div className="pt-4">
            <button 
              onClick={toggleStatusAndSave}
              disabled={isSaving}
              className={`w-full py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all ${status === 'DONE' ? 'bg-[#10b981]/10 text-[#10b981] border-2 border-[#10b981]/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
            >
              {status === 'DONE' ? (
                <><CheckCircle2 className="w-7 h-7" /> Auftrag Erledigt</>
              ) : (
                <><Clock className="w-7 h-7 text-gray-400" /> Als Erledigt markieren</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[env(safe-area-inset-bottom,2rem)] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pointer-events-none z-50 flex justify-center">
        <div className="w-full max-w-lg mx-auto pointer-events-auto">
          <button 
            onClick={async () => {
              const success = await handleSave(status, isPaid, paymentMethod);
              if (success && status === 'DONE') {
                router.refresh();
                router.push('/admin');
              }
            }}
            disabled={isSaving}
            className="w-full pointer-events-auto bg-[#10b981] text-gray-950 px-6 py-4 rounded-[20px] font-black text-lg flex items-center justify-center gap-2 hover:bg-[#059669] active:scale-[0.98] shadow-2xl transition-all border border-[#10b981]"
          >
            <Save className="w-5 h-5" />
            {isSaving ? "Speichert..." : "Änderungen speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}
