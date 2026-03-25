"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Edit2, Trash2, QrCode, Plus, Camera, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { QRScanner } from '@/components/QRScanner';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

export function CustomerDetailClient({ initialCustomer }: { initialCustomer: any }) {
  const router = useRouter();
  const [customer, setCustomer] = useState(initialCustomer);
  const [activeTab, setActiveTab] = useState<'DATEN' | 'RACKETS' | 'HISTORIE'>('DATEN');
  
  // Edit Customer
  const [form, setForm] = useState({ name: customer.name || '', email: customer.email || '', phone: customer.phone || '' });
  const [isSaving, setIsSaving] = useState(false);

  // Rackets
  const [editingRacketId, setEditingRacketId] = useState<string|null>(null);
  const [racketForm, setRacketForm] = useState({ brand: '', model: '', qrCodeToken: '' });
  const [isAddingRacket, setIsAddingRacket] = useState(false);
  const [newRacket, setNewRacket] = useState({ brand: '', model: '' });
  const [isScanning, setIsScanning] = useState(false);
  const [scannedToken, setScannedToken] = useState("");

  const saveEdit = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/players/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const { player } = await res.json();
        setCustomer({ ...customer, ...player });
        toast.success("Daten gespeichert");
      }
    } catch(e) { console.error(e); }
    setIsSaving(false);
  };

  const deleteCustomer = () => {
    toast((t) => (
      <div className="flex flex-col gap-3 font-sans w-full min-w-[200px]">
        <div className="font-bold text-sm text-balance">Kunde & Aufträge löschen?</div>
        <div className="flex gap-2 w-full">
          <button className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold" onClick={async () => {
            toast.dismiss(t.id);
            try {
              const res = await fetch(`/api/players/${customer.id}`, { method: 'DELETE' });
              if (res.ok) {
                 toast.success("Gelöscht");
                 router.push('/admin/customers');
              }
            } catch(err) { console.error(err); }
          }}>Löschen</button>
          <button className="flex-1 bg-[#161616] border border-white/10 px-3 py-2 rounded-lg text-xs font-bold" onClick={() => toast.dismiss(t.id)}>Abbrechen</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleScan = (decodedText: string) => {
    const token = decodedText.split('/').pop() || decodedText;
    setScannedToken(token);
    setIsScanning(false);
  };

  const handleAddRacket = async () => {
    if (!newRacket.brand || !newRacket.model) return toast.error("Marke & Modell benötigt");
    setIsAddingRacket(true);
    try {
      const res = await fetch(`/api/rackets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: customer.id, brand: newRacket.brand, model: newRacket.model, qrCodeToken: scannedToken || undefined })
      });
      if (res.ok) {
        const { racket } = await res.json();
        setCustomer({ ...customer, rackets: [racket, ...customer.rackets] });
        setNewRacket({ brand: '', model: '' });
        setScannedToken("");
        toast.success("Racket hinzugefügt");
      }
    } catch(e) { console.error(e); }
    setIsAddingRacket(false);
  };

  const saveRacketEdit = async (racketId: string) => {
    try {
      const res = await fetch(`/api/rackets/${racketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(racketForm)
      });
      if (res.ok) {
        const { racket } = await res.json();
        setCustomer({ ...customer, rackets: customer.rackets.map((r: any) => r.id === racketId ? { ...r, ...racket } : r) });
        setEditingRacketId(null);
        toast.success("Gespeichert");
      }
    } catch(err) { console.error(err); }
  };

  const deleteRacket = (racketId: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3 font-sans w-full min-w-[200px]">
        <div className="font-bold text-sm text-balance">Racket wirklich löschen? Historie bleibt.</div>
        <div className="flex gap-2 w-full">
          <button className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold" onClick={async () => {
            toast.dismiss(t.id);
            try {
              const res = await fetch(`/api/rackets/${racketId}`, { method: 'DELETE' });
              if (res.ok) {
                setCustomer({ ...customer, rackets: customer.rackets.filter((r: any) => r.id !== racketId) });
                toast.success("Racket entfernt");
              }
            } catch(err) { console.error(err); }
          }}>Löschen</button>
          <button className="flex-1 bg-[#161616] border border-white/10 px-3 py-2 rounded-lg text-xs font-bold" onClick={() => toast.dismiss(t.id)}>Abbrechen</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const tabClass = (tabId: string) => clsx(
    "flex-1 py-3 text-center text-[11px] font-black uppercase tracking-widest transition-all rounded-xl relative z-10",
    activeTab === tabId ? "text-gray-950" : "text-gray-500 hover:text-white"
  );

  return (
    <div className="max-w-2xl mx-auto pb-24 font-sans">
      <div className="flex items-center gap-4 mb-8 pt-4">
        <button onClick={() => router.push('/admin/customers')} className="w-10 h-10 bg-[#161616] rounded-xl flex items-center justify-center border border-white/5 active:scale-95 transition-all text-gray-400 hover:text-white hover:bg-white/5"><ChevronLeft className="w-6 h-6" /></button>
        <div>
           <h1 className="text-2xl font-black tracking-tight leading-none">{customer.name}</h1>
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Kunden Profil</p>
        </div>
      </div>

      <div className="bg-[#161616] p-1.5 rounded-2xl border border-white/5 flex shadow-lg relative mb-6">
        <div 
          className={clsx(
            "absolute top-1.5 bottom-1.5 w-[calc(33.333%-4px)] bg-[#10b981] rounded-xl transition-all duration-300 ease-out shadow-[0_0_20px_rgba(16,185,129,0.3)]",
            activeTab === 'DATEN' ? "left-1.5" : activeTab === 'RACKETS' ? "left-[calc(33.333%+2px)]" : "left-[calc(66.666%+2.5px)]"
          )}
        />
        <button onClick={() => setActiveTab('DATEN')} className={tabClass('DATEN')}>Daten</button>
        <button onClick={() => setActiveTab('RACKETS')} className={tabClass('RACKETS')}>Rackets</button>
        <button onClick={() => setActiveTab('HISTORIE')} className={tabClass('HISTORIE')}>Historie</button>
      </div>

      <div className="space-y-6">
        {activeTab === 'DATEN' && (
          <div className="bg-[#161616] p-5 rounded-[24px] border border-white/5 shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-4">
             <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-4 text-white font-medium focus:outline-none focus:border-[#10b981]" placeholder="Name" />
             <div className="grid grid-cols-2 gap-4">
               <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-4 text-white font-medium focus:outline-none focus:border-[#10b981]" placeholder="E-Mail" />
               <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-4 text-white font-medium focus:outline-none focus:border-[#10b981]" placeholder="Telefon" />
             </div>
             <button onClick={saveEdit} disabled={isSaving} className="w-full bg-[#10b981] text-gray-950 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex justify-center hover:bg-[#059669] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] mt-2">
               {isSaving ? "Speichert..." : "Speichern"}
             </button>
             
             <div className="pt-6 mt-6 border-t border-white/5 border-dashed">
                <button onClick={deleteCustomer} className="w-full bg-red-500/10 text-red-500 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex justify-center hover:bg-red-500 hover:text-white active:scale-[0.98] transition-all">
                  Kunde löschen
                </button>
             </div>
          </div>
        )}

        {activeTab === 'RACKETS' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
             {customer.rackets.map((racket: any) => (
               <div key={racket.id} className="bg-[#161616] border border-white/5 rounded-[24px] p-5 shadow-lg relative overflow-hidden flex flex-col sm:flex-row gap-4">
                 
                 {editingRacketId === racket.id ? (
                   <div className="flex-1 space-y-3 w-full">
                     <input type="text" value={racketForm.brand} onChange={e => setRacketForm({...racketForm, brand: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#10b981]" placeholder="Marke" />
                     <input type="text" value={racketForm.model} onChange={e => setRacketForm({...racketForm, model: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#10b981]" placeholder="Modell" />
                     <input type="text" value={racketForm.qrCodeToken} onChange={e => setRacketForm({...racketForm, qrCodeToken: e.target.value})} className="w-full bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl px-4 py-3 text-[#10b981] font-mono text-sm focus:outline-none" placeholder="QR Code Token" />
                     <div className="flex gap-2 pt-2">
                       <button onClick={() => saveRacketEdit(racket.id)} className="flex-1 bg-[#10b981] text-gray-950 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#059669]">Speichern</button>
                       <button onClick={() => setEditingRacketId(null)} className="flex-1 bg-white/5 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10">Abbrechen</button>
                     </div>
                   </div>
                 ) : (
                   <>
                     <div className="flex-1">
                       <div className="flex items-center gap-2 mb-1">
                         <div className="font-bold text-xl text-white tracking-tight">{racket.brand} {racket.model}</div>
                         <button onClick={() => { setEditingRacketId(racket.id); setRacketForm({ brand: racket.brand, model: racket.model, qrCodeToken: racket.qrCodeToken }); }} className="text-gray-500 hover:text-[#10b981] p-1"><Edit2 className="w-4 h-4" /></button>
                       </div>
                       <div className="text-[10px] uppercase font-black tracking-widest text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded inline-block border border-[#10b981]/20">ID: {racket.qrCodeToken}</div>
                     </div>
                     <div className="flex flex-col sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                         <a href={`/p/${racket.qrCodeToken}`} target="_blank" className="w-full sm:w-auto bg-[#10b981]/10 text-[#10b981] px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#10b981]/20 transition-colors border border-[#10b981]/20">
                           <QrCode className="w-4 h-4" /> Ansicht
                         </a>
                         <button onClick={() => deleteRacket(racket.id)} className="w-full sm:w-auto text-gray-400 hover:text-red-500 text-xs font-bold flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-red-500/10 transition">
                           <Trash2 className="w-4 h-4" /> Löschen
                         </button>
                     </div>
                   </>
                 )}
               </div>
             ))}

             <div className="bg-[#161616] p-5 rounded-[24px] border border-white/5 border-dashed mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Neuen Schläger einrichten</div>
                  {scannedToken && <div className="bg-[#10b981]/20 text-[#10b981] px-2 py-1 rounded text-[10px] font-black border border-[#10b981]/30">QR GELADEN</div>}
                </div>
                {isScanning && <QRScanner onScan={handleScan} onClose={() => setIsScanning(false)} title="Sticker scannen" />}
                {!isScanning && (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button onClick={() => setIsScanning(true)} className={`p-4 rounded-xl border transition-colors shrink-0 flex items-center justify-center ${scannedToken ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]' : 'bg-[#0a0a0a] border-white/5 text-gray-400 hover:text-white hover:bg-white/5'}`}>
                         <Camera className="w-6 h-6" />
                      </button>
                      <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <input type="text" value={newRacket.brand} onChange={e => setNewRacket({...newRacket, brand: e.target.value})} className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-4 text-sm text-white font-medium focus:outline-none focus:border-[#10b981]" placeholder="Marke (Head)" />
                        <input type="text" value={newRacket.model} onChange={e => setNewRacket({...newRacket, model: e.target.value})} className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-4 text-sm text-white font-medium focus:outline-none focus:border-[#10b981]" placeholder="Modell (Speed)" />
                      </div>
                    </div>
                    <button onClick={handleAddRacket} disabled={isAddingRacket || !newRacket.brand || !newRacket.model} className="w-full bg-[#10b981] disabled:opacity-50 text-gray-950 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#059669] transition-all flex justify-center items-center gap-2">
                       {isAddingRacket ? "..." : <><Plus className="w-4 h-4 -ml-1" /> Speichern</>}
                    </button>
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'HISTORIE' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
             {customer.jobs.length === 0 ? (
                <div className="text-gray-500 font-bold p-8 text-center bg-[#161616] rounded-3xl border border-white/5 shadow-lg">Noch keine Aufträge.</div>
             ) : (
                customer.jobs.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between bg-[#161616] border border-white/5 rounded-[20px] p-5 shadow-sm group hover:border-white/10 transition-colors">
                    <div>
                      <div className="font-bold text-base text-white mb-1">
                        {job.racketBrand || "Unbekannt"} {job.racketModel || ""}
                      </div>
                      <div className="text-sm font-bold text-[#10b981] mb-2">{job.string?.brand} {job.string?.model}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">{new Date(job.createdAt).toLocaleDateString('de-CH')}</span>
                        {job.status === 'DONE' ? (
                           <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded border tracking-widest ${job.isPaid ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                             {job.isPaid ? "Bezahlt" : "Offen"}
                           </span>
                        ) : (
                           <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-gray-300 tracking-widest">In Arbeit</span>
                        )}
                      </div>
                    </div>
                    <a href={`/admin/jobs/${job.id}`} className="w-10 h-10 bg-[#0a0a0a] rounded-full flex items-center justify-center text-gray-500 hover:text-[#10b981] hover:bg-[#10b981]/10 transition-colors border border-white/5 shadow-inner">
                      <ChevronRight className="w-5 h-5 ml-0.5" />
                    </a>
                  </div>
                ))
             )}
          </div>
        )}
      </div>
    </div>
  );
}
