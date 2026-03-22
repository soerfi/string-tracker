"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Trash2, Edit2, PackageOpen, ChevronLeft, Droplet, HelpCircle, Save } from 'lucide-react';

interface TennisString {
  id: string;
  brand: string;
  model: string;
  gauge: string;
  type: string;
  baseLifeHours: number;
  descriptionDe: string;
  benefits: string; // JSON
}

export function AdminStringsClient({ initialStrings }: { initialStrings: TennisString[] }) {
  const router = useRouter();
  const [strings, setStrings] = useState(initialStrings);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState(""); // Let's use it to store string type label
  const [gauge, setGauge] = useState(1.25);
  const [descriptionDe, setDescriptionDe] = useState("");
  const [benefitsStr, setBenefitsStr] = useState(""); 
  
  // Physics Calculator State
  const [materialBase, setMaterialBase] = useState(12);
  const [isProfiled, setIsProfiled] = useState(false);
  const [calculatedHours, setCalculatedHours] = useState(10.5);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const base = materialBase;
    const surfaceMult = isProfiled ? 0.85 : 1.0;
    const gaugeMult = gauge / 1.25;
    setCalculatedHours(parseFloat((base * surfaceMult * gaugeMult).toFixed(1)));
  }, [materialBase, isProfiled, gauge]);

  const resetForm = () => {
    setBrand("");
    setModel("");
    setGauge(1.25);
    setType("");
    setDescriptionDe("");
    setBenefitsStr("");
    setMaterialBase(12);
    setIsProfiled(false);
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (s: TennisString) => {
    setEditingId(s.id);
    setBrand(s.brand);
    setModel(s.model);
    setGauge(parseFloat(s.gauge.replace('mm', '')) || 1.25);
    setType(s.type);
    
    // Reverse engineer physics for edit view
    // Default to Poly and simple inference
    setMaterialBase(s.baseLifeHours > 16 ? 20 : 12);
    setIsProfiled(false);
    
    setDescriptionDe(s.descriptionDe);
    let ben = [];
    try { ben = JSON.parse(s.benefits); } catch(e) { /* ignore */ }
    setBenefitsStr(ben.join(", "));
    setIsAdding(false);
  };

  const setMaterialPreset = (name: string, hours: number) => {
    setType(name);
    setMaterialBase(hours);
  };

  const handleSave = async () => {
    if (!brand || !model) return alert("Marke und Modell benötigt.");
    setIsSaving(true);
    
    const payload = {
      brand,
      model,
      gauge: `${gauge.toFixed(2)}mm`,
      type: type || "Standard Saite",
      baseLifeHours: calculatedHours,
      descriptionDe,
      benefits: benefitsStr.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/strings/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const { string } = await res.json();
          setStrings(prev => prev.map(s => s.id === editingId ? string : s));
          resetForm();
        }
      } else {
        const res = await fetch(`/api/strings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const { string } = await res.json();
          setStrings(prev => [...prev, string]);
          resetForm();
        }
      }
    } catch(e) {
      console.error(e);
      alert("Fehler beim Speichern");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Saite "${name}" wirklich löschen?`)) return;
    try {
      const res = await fetch(`/api/strings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStrings(prev => prev.filter(s => s.id !== id));
      }
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-32">
      <header className="flex items-center gap-4 mt-6 px-2">
        <button onClick={() => router.push('/admin')} className="w-10 h-10 bg-[#161616] border border-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight leading-none text-white">Saiten-Verwaltung</h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">Inventar & Eigenschaften</p>
        </div>
      </header>

      {/* List View */}
      {!isAdding && !editingId && (
        <div className="px-2">
          <button 
            onClick={() => setIsAdding(true)} 
            className="w-full bg-[#10b981] text-gray-950 px-5 py-5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#059669] transition active:scale-[0.98] shadow-lg shadow-[#10b981]/10 text-lg"
          >
            <Plus className="w-6 h-6" />
            Neue Saite erfassen
          </button>

          <div className="grid gap-3 mt-6">
            {strings.map((s) => (
              <div key={s.id} className="bg-[#161616] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 relative group hover:border-[#10b981]/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-lg text-white leading-tight">{s.brand} {s.model}</div>
                    <div className="text-sm font-bold text-[#10b981] mt-0.5">{s.gauge} • {s.type}</div>
                  </div>
                  <div className="flex gap-1 bg-black/50 p-1 rounded-xl">
                    <button onClick={() => startEdit(s)} className="p-2 text-gray-400 hover:text-white rounded-lg transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id, s.brand + ' ' + s.model)} className="p-2 text-red-500/80 hover:text-red-500 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2 items-center bg-[#0a0a0a] p-3 rounded-xl border border-white/5 w-max">
                  <PackageOpen className="w-4 h-4 text-[#10b981]" />
                  <span className="text-xs text-gray-300 font-black">{s.baseLifeHours} Std. Basis-Haltbarkeit</span>
                </div>
              </div>
            ))}
            
            {strings.length === 0 && (
              <div className="text-center text-gray-500 font-medium py-10 bg-[#161616] rounded-2xl border border-white/5">
                Keine Saiten im Inventar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Physics Calculator & Editor Modal */}
      {(isAdding || editingId) && (
        <div className="bg-[#0a0a0a] border border-[#10b981]/30 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 relative">
          
          <div className="p-6 bg-[#161616] border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-black text-white">{isAdding ? 'Neue Saite definieren' : 'Saite bearbeiten'}</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-white bg-[#0a0a0a] p-2.5 rounded-xl transition border border-white/5">
               <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Meta Data */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={brand} onChange={e => setBrand(e.target.value)} className="w-full bg-[#161616] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-[#10b981] outline-none transition" placeholder="Marke (Babolat)" />
                <input type="text" value={model} onChange={e => setModel(e.target.value)} className="w-full bg-[#161616] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-[#10b981] outline-none transition" placeholder="Modell (RPM Blast)" />
              </div>
            </div>

            {/* Step 1: Material */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-[11px] font-black tracking-widest text-[#10b981] uppercase">1. Material-Basis</h3>
                <HelpCircle className="w-3 h-3 text-gray-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setMaterialPreset("Polyester", 12)} className={`p-4 rounded-xl text-sm font-bold transition-all border ${materialBase === 12 ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]' : 'bg-[#161616] border-white/5 text-gray-400 hover:bg-[#202020]'}`}>
                  Polyester
                </button>
                <button onClick={() => setMaterialPreset("Co-Poly Premium", 15)} className={`p-4 rounded-xl text-sm font-bold transition-all border ${materialBase === 15 ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]' : 'bg-[#161616] border-white/5 text-gray-400 hover:bg-[#202020]'}`}>
                  Co-Poly Premium
                </button>
                <button onClick={() => setMaterialPreset("Multifilament", 20)} className={`p-4 rounded-xl text-sm font-bold transition-all border ${materialBase === 20 ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]' : 'bg-[#161616] border-white/5 text-gray-400 hover:bg-[#202020]'}`}>
                  Multifilament
                </button>
                <button onClick={() => setMaterialPreset("Naturdarm", 25)} className={`p-4 rounded-xl text-sm font-bold transition-all border ${materialBase === 25 ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]' : 'bg-[#161616] border-white/5 text-gray-400 hover:bg-[#202020]'}`}>
                  Naturdarm
                </button>
              </div>
            </div>

            {/* Step 2: Surface */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-[11px] font-black tracking-widest text-[#10b981] uppercase">2. Oberflächen-Check</h3>
                <HelpCircle className="w-3 h-3 text-gray-500" />
              </div>
              <div className="flex bg-[#161616] p-1 rounded-2xl border border-white/5 relative">
                <button onClick={() => setIsProfiled(false)} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl font-bold text-sm transition-all z-10 ${!isProfiled ? 'bg-[#202020] text-white shadow-md' : 'text-gray-500'}`}>
                  <span>Glatt / Beschichtet</span>
                  <span className="text-[10px] text-gray-500 mt-1">Faktor 1.0</span>
                </button>
                <button onClick={() => setIsProfiled(true)} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl font-bold text-sm transition-all z-10 ${isProfiled ? 'bg-[#202020] text-white shadow-md' : 'text-gray-500'}`}>
                  <span>Profiliert / Eckig</span>
                  <span className="text-[10px] text-gray-500 mt-1">Faktor 0.85</span>
                </button>
              </div>
            </div>

            {/* Step 3: Gauge Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-[11px] font-black tracking-widest text-[#10b981] uppercase">3. Durchmesser</h3>
                </div>
                <div className="text-2xl font-black text-white">{gauge.toFixed(2)}<span className="text-sm text-gray-500 ml-1">mm</span></div>
              </div>
              <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 mt-2">
                <input 
                  type="range" 
                  min="1.10" max="1.40" step="0.01" 
                  value={gauge} 
                  onChange={(e) => setGauge(parseFloat(e.target.value))}
                  className="w-full h-3 bg-[#202020] rounded-full appearance-none cursor-pointer accent-[#10b981]"
                />
                <div className="flex justify-between text-[11px] font-bold text-gray-500 mt-3 px-1">
                  <span>1.10</span>
                  <span>1.20</span>
                  <span>1.30</span>
                  <span>1.40</span>
                </div>
              </div>
            </div>

            {/* Step 4: Descriptions */}
            <div className="pt-2 border-t border-white/5 space-y-4">
              <input type="text" value={benefitsStr} onChange={e => setBenefitsStr(e.target.value)} className="w-full bg-[#161616] border border-white/5 rounded-xl px-5 py-4 text-sm font-medium focus:border-[#10b981] outline-none" placeholder="Vorteile (Kommaintervall: Spin, Kontrolle)" />
              <textarea value={descriptionDe} onChange={e => setDescriptionDe(e.target.value)} className="w-full h-24 bg-[#161616] border border-white/5 rounded-xl px-5 py-4 text-sm resize-none focus:border-[#10b981] outline-none font-medium" placeholder="Eigene Beschreibung... (Angezeigt für den Spieler)" />
            </div>

          </div>

          {/* Dynamic Result Footer */}
          <div className="p-6 bg-[#161616] border-t border-white/5 mt-2 rounded-b-[32px]">
            <div className="flex flex-col items-center mb-6">
              <div className="text-[11px] font-black tracking-widest text-gray-500 uppercase mb-2">Berechnete Basis-Lebensdauer</div>
              <div className="text-5xl font-black text-[#10b981] drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-end gap-2">
                {calculatedHours} <span className="text-xl text-gray-400 mb-1">Stunden</span>
              </div>
              <div className="text-xs text-gray-500 font-medium mt-3 text-center px-6">Dieser Wert dient als Grundlage für die dynamische Spieler-Decay-Berechnung.</div>
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full bg-[#10b981] text-gray-950 py-5 rounded-2xl font-black text-lg hover:bg-[#059669] transition active:scale-[0.98] shadow-lg flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              {isSaving ? 'Wird gespeichert...' : 'In Bibliothek speichern'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
