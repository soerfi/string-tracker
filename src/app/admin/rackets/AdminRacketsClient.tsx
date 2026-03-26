"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function AdminRacketsClient({ initialPresets }: { initialPresets: { id: string, brand: string, model: string }[] }) {
  const router = useRouter();
  const [presets, setPresets] = useState<{ id: string, brand: string, model: string }[]>(initialPresets);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Group by brand
  const grouped = presets.reduce((acc, curr) => {
    if (!acc[curr.brand]) acc[curr.brand] = [];
    acc[curr.brand].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim()) return toast.error("Marke und Modell erforderlich");
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/rackets/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: brand.trim(), model: model.trim() })
      });
      if (res.ok) {
        const newPreset = await res.json();
        setPresets([...presets, newPreset].sort((a,b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)));
        setModel("");
        toast.success("Racket hinzugefügt");
      } else {
        const err = await res.json();
        toast.error(err.error || "Fehler beim Speichern");
      }
    } catch(err) {
      toast.error("Ein Fehler ist aufgetreten");
    }
    setIsSaving(false);
  };

  const handleDelete = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3 font-sans w-full min-w-[200px]">
        <div className="font-bold text-sm">Preset wirklich löschen?</div>
        <div className="flex gap-2">
          <button className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold" onClick={async () => {
            toast.dismiss(t.id);
            try {
              const res = await fetch(`/api/rackets/presets/${id}`, { method: 'DELETE' });
              if (res.ok) {
                setPresets(presets.filter(p => p.id !== id));
                toast.success("Preset gelöscht");
              }
            } catch(e) { }
          }}>Löschen</button>
          <button className="flex-1 bg-[#161616] border border-white/10 px-3 py-2 rounded-lg text-xs font-bold" onClick={() => toast.dismiss(t.id)}>Abbrechen</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 font-sans px-6">
      <div className="flex items-center gap-4 mb-8 pt-6">
        <button onClick={() => router.push('/admin/settings')} className="w-10 h-10 bg-[#161616] rounded-xl flex items-center justify-center border border-white/5 active:scale-95 transition-all text-gray-400 hover:text-white hover:bg-white/5"><ChevronLeft className="w-6 h-6" /></button>
        <div>
           <h1 className="text-2xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Racket Presets</h1>
           <p className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest mt-1">Inventar Verwaltung</p>
        </div>
      </div>

      <div className="bg-[#161616] border border-white/5 rounded-[24px] p-6 shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><ShieldCheck className="w-24 h-24" /></div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4">Neues Modell anlegen</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 relative z-10">
          <input 
            type="text" value={brand} onChange={e => setBrand(e.target.value)} 
            className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-[#10b981] transition"
            placeholder="Marke (z.B. Head)" required
          />
          <input 
            type="text" value={model} onChange={e => setModel(e.target.value)} 
            className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-[#10b981] transition"
            placeholder="Modell (z.B. Speed Pro)" required
          />
          <button disabled={isSaving} type="submit" className="bg-[#10b981] text-gray-950 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#059669] transition flex items-center justify-center gap-2">
            {isSaving ? "..." : <><Plus className="w-4 h-4 ml-[-4px]" /> Speichern</>}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {Object.keys(grouped).sort().map(b => (
          <div key={b} className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2 border-b border-white/5 pb-2">{b}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {grouped[b].map(p => (
                <div key={p.id} className="flex items-center justify-between bg-[#0a0a0a] border border-white/5 rounded-xl p-3 shadow-sm group hover:border-[#10b981]/30 transition">
                  <span className="text-sm font-bold text-gray-200">{p.model}</span>
                  <button onClick={() => handleDelete(p.id)} className="text-gray-500 hover:text-red-500 focus:outline-none p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
