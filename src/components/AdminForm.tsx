"use client";

import { useState, useRef, useEffect } from 'react';
import { Camera, ChevronRight, X, CheckCircle2 } from 'lucide-react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRScanner } from './QRScanner';

export function AdminForm({ 
  strings, 
  players 
}: { 
  strings: { id: string, brand: string, model: string, gauge: string }[],
  players: { 
    id: string, 
    name: string, 
    email: string|null, 
    phone: string|null, 
    racketBrand: string|null, 
    racketModel: string|null,
    rackets: { id: string, brand: string, model: string, qrCodeToken: string }[] 
  }[] 
}) {
  const router = useRouter();
  
  // Scannning
  const [isScanning, setIsScanning] = useState(false);
  
  // Customer & Racket selection
  const [customerId, setCustomerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [racketId, setRacketId] = useState("");
  const [racketBrand, setRacketBrand] = useState("");
  const [racketModel, setRacketModel] = useState("");
  
  const selectedPlayerRackets = players.find(p => p.id === customerId)?.rackets || [];

  const handleCustomerChange = (val: string) => {
    setCustomerId(val);
    setRacketId(""); // reset racket
    if (val !== "new" && val !== "") {
      const p = players.find(x => x.id === val);
      if (p) {
        setPlayerName(p.name);
        setEmail(p.email || "");
        setPhone(p.phone || "");
        // If they have existing rackets, auto-select the first one nicely
        if (p.rackets && p.rackets.length > 0) {
          setRacketId(p.rackets[0].id);
          setRacketBrand(p.rackets[0].brand);
          setRacketModel(p.rackets[0].model);
        } else {
          setRacketId("new");
          setRacketBrand("");
          setRacketModel("");
        }
      }
    } else {
      setPlayerName("");
      setEmail("");
      setPhone("");
      setRacketBrand("");
      setRacketModel("");
    }
  }

  const handleRacketChange = (val: string) => {
    setRacketId(val);
    if (val === "new") {
      setRacketBrand("");
      setRacketModel("");
    } else {
      const r = selectedPlayerRackets.find(x => x.id === val);
      if (r) {
        setRacketBrand(r.brand);
        setRacketModel(r.model);
      }
    }
  }

  const handleScan = (decodedText: string) => {
    const token = decodedText.split('/').pop() || decodedText;
    
    let found = false;
    for (const p of players) {
      const matchedRacket = p.rackets?.find(r => r.qrCodeToken === token);
      if (matchedRacket) {
        setCustomerId(p.id);
        setPlayerName(p.name);
        setEmail(p.email || "");
        setPhone(p.phone || "");
        
        setRacketId(matchedRacket.id);
        setRacketBrand(matchedRacket.brand);
        setRacketModel(matchedRacket.model);
        
        found = true;
        break;
      }
    }
    
    setIsScanning(false);
    
    if (!found) alert("Dieser QR Code ist leider nicht im System als Racket registriert.");
  };

  // String details
  const [stringId, setStringId] = useState("");
  const [tensionMain, setTensionMain] = useState("25.0");
  const [tensionCross, setTensionCross] = useState("24.0");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");

  const dateInputRef = useRef<HTMLInputElement>(null);

  // Inspection
  const [grommetsOk, setGrommetsOk] = useState(true);
  const [gripOk, setGripOk] = useState(true);
  const [changeOvergrip, setChangeOvergrip] = useState(false);
  
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToken, setSuccessToken] = useState<string | null>(null);
  const controls = useAnimation();

  const handleSlideEnd = async (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 200) {
      await controls.start({ x: 250 });
      handleSubmit();
    } else {
      controls.start({ x: 0 });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if ((!customerId && !playerName) || !stringId) {
        alert("Bitte wählen Sie einen Kunden und eine Saite aus.");
        controls.start({ x: 0 });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        playerId: customerId === "new" ? null : customerId,
        playerName,
        email,
        phone,
        racketId: racketId === "new" ? null : racketId,
        racketBrand,
        racketModel,
        stringId,
        tensionMain: tensionMain ? parseFloat(tensionMain) : null,
        tensionCross: tensionCross ? parseFloat(tensionCross) : null,
        notes,
        deadline,
        grommetsOk,
        gripOk,
        changeOvergrip
      };

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.token) {
        setSuccessToken(data.token);
      } else {
        alert(data.error || "Fehler beim Erstellen des Auftrags.");
        controls.start({ x: 0 });
      }
    } catch (e) {
      console.error(e);
      controls.start({ x: 0 });
    }
    setIsSubmitting(false);
  };

  if (successToken) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="w-24 h-24 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-[#10b981]" />
        </div>
        <h1 className="text-3xl font-black mb-2">Auftrag erstellt!</h1>
        <p className="text-gray-400 mb-8">
          Der Auftrag wurde im System gespeichert und ist bereit zur Besaitung.
        </p>
        
        <div className="flex flex-col gap-3 w-full">
          <Link href={`/player/${successToken}`} className="w-full bg-[#10b981] text-gray-950 font-bold py-4 rounded-2xl flex items-center justify-center">
            Kundenansicht öffnen
          </Link>
          <button onClick={() => router.push('/admin')} className="w-full bg-[#161616] text-white border border-white/5 font-bold py-4 rounded-2xl flex items-center justify-center">
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 pb-28 px-2 font-sans relative">
      {isScanning && (
        <QRScanner 
          onScan={handleScan} 
          onClose={() => setIsScanning(false)} 
          title="Racket QR scannen" 
        />
      )}

      <header className="flex items-center gap-4 mt-8 mb-2">
        <button onClick={() => router.back()} className="w-10 h-10 bg-[#161616] border border-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-black tracking-tight">Neuer Auftrag</h1>
      </header>

      {/* Floating Scan UI */}
      {!customerId && (
        <button onClick={() => setIsScanning(!isScanning)} className="relative overflow-hidden w-full bg-[#161616] border border-[#10b981]/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-[#10b981] shadow-[0_0_40px_rgba(16,185,129,0.05)] group">
          <div className="absolute inset-0 bg-[#10b981]/5 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300" />
          <Camera className="w-8 h-8" strokeWidth={2.5} />
          <span className="font-bold tracking-widest text-[11px] uppercase">Racket QR scannen</span>
        </button>
      )}

      {/* Customer Selection */}
      <section className="bg-[#161616] border border-white/5 rounded-3xl p-6 space-y-5 shadow-lg">
        <h2 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Kunde & Racket</h2>
        
        <div className="space-y-3">
          <select 
            value={customerId} 
            onChange={(e) => handleCustomerChange(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-5 py-4 text-white font-medium appearance-none focus:outline-none focus:border-[#10b981] transition"
          >
            <option value="" disabled>Kunde auswählen</option>
            <option value="new">+ Neuer Kunde</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {customerId && customerId !== 'new' && (
            <select 
              value={racketId} 
              onChange={(e) => handleRacketChange(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-4 text-white font-medium appearance-none focus:outline-none focus:border-[#10b981] transition"
            >
              <option value="" disabled>Schläger auswählen</option>
              {selectedPlayerRackets.map(r => (
                <option key={r.id} value={r.id}>{r.brand} {r.model}</option>
              ))}
              <option value="new" className="text-[#10b981] font-bold">+ Neues Racket erfassen</option>
            </select>
          )}
        </div>

        {customerId !== '' && (
          <div className="space-y-4 pt-4 border-t border-white/5 mt-4">
            {customerId === "new" && (
              <>
                <input 
                  type="text" 
                  value={playerName} 
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:border-[#10b981] transition"
                  placeholder="Name (z.B. Roger F.)"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:border-[#10b981] transition" placeholder="E-Mail" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:border-[#10b981] transition" placeholder="Telefon" />
                </div>
              </>
            )}

            {(racketId === "new" || customerId === "new") && (
              <div className="grid grid-cols-2 gap-4 bg-[#111] p-3 rounded-[20px] border border-white/5">
                <input type="text" value={racketBrand} onChange={(e) => setRacketBrand(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981] transition" placeholder="Marke (Head)" />
                <input type="text" value={racketModel} onChange={(e) => setRacketModel(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981] transition" placeholder="Modell (Speed Pro)" />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Job Details */}
      <section className="bg-[#161616] border border-white/5 rounded-3xl p-6 space-y-5 shadow-lg">
        <h2 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Besaitungsauftrag</h2>
        
        <div className="space-y-1">
          <select 
            value={stringId} 
            onChange={(e) => setStringId(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-5 py-4 text-white font-medium appearance-none focus:outline-none focus:border-[#10b981] transition"
          >
            <option value="" disabled>Saite auswählen</option>
            {strings.map(s => (
              <option key={s.id} value={s.id}>{s.brand} {s.model} - {s.gauge}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase text-center ml-1">Längs (kg)</label>
            <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/5 rounded-[20px] p-1.5 shadow-inner">
              <button onClick={(e) => { e.preventDefault(); setTensionMain((parseFloat(tensionMain || "25") - 0.5).toFixed(1)) }} className="w-12 h-12 flex items-center justify-center bg-[#161616] rounded-[16px] text-white hover:text-[#10b981] active:scale-[0.9] border border-white/5"><span className="text-3xl font-light leading-none -mt-1">-</span></button>
              <div className="flex-1 text-center font-black text-xl text-white tracking-tight">{parseFloat(tensionMain || "25").toFixed(1)}</div>
              <button onClick={(e) => { e.preventDefault(); setTensionMain((parseFloat(tensionMain || "25") + 0.5).toFixed(1)) }} className="w-12 h-12 flex items-center justify-center bg-[#161616] rounded-[16px] text-white hover:text-[#10b981] active:scale-[0.9] border border-white/5"><span className="text-3xl font-light leading-none -mt-0.5">+</span></button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase text-center ml-1">Quer (kg)</label>
            <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/5 rounded-[20px] p-1.5 shadow-inner">
              <button onClick={(e) => { e.preventDefault(); setTensionCross((parseFloat(tensionCross || "24") - 0.5).toFixed(1)) }} className="w-12 h-12 flex items-center justify-center bg-[#161616] rounded-[16px] text-white hover:text-[#10b981] active:scale-[0.9] border border-white/5"><span className="text-3xl font-light leading-none -mt-1">-</span></button>
              <div className="flex-1 text-center font-black text-xl text-white tracking-tight">{parseFloat(tensionCross || "24").toFixed(1)}</div>
              <button onClick={(e) => { e.preventDefault(); setTensionCross((parseFloat(tensionCross || "24") + 0.5).toFixed(1)) }} className="w-12 h-12 flex items-center justify-center bg-[#161616] rounded-[16px] text-white hover:text-[#10b981] active:scale-[0.9] border border-white/5"><span className="text-3xl font-light leading-none -mt-0.5">+</span></button>
            </div>
          </div>
        </div>

        <div className="space-y-1 pt-2" onClick={() => {
          if (dateInputRef.current && 'showPicker' in dateInputRef.current) {
            (dateInputRef.current as HTMLInputElement).showPicker();
          }
        }}>
          <label className="text-xs text-gray-500 font-medium ml-1">Fertig bis (optional)</label>
          <input 
            ref={dateInputRef}
            type="date" 
            value={deadline} 
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:border-[#10b981] transition cursor-pointer"
          />
        </div>

        <div className="space-y-1 pt-2">
          <label className="text-xs text-gray-500 font-medium ml-1">Bemerkungen</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:border-[#10b981] transition resize-none h-24" placeholder="Spezielle Wünsche..." />
        </div>
      </section>

      {/* Condition Report */}
      <section className="bg-[#161616] border border-white/5 rounded-3xl p-6 space-y-2 shadow-lg mb-4">
        <h2 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4">Zustand & Service</h2>
        <div className="flex items-center justify-between py-3 border-b border-white/5"><span className="text-gray-300 font-medium">Ösen intakt</span><button onClick={() => setGrommetsOk(!grommetsOk)} className={`w-14 h-8 rounded-full transition-colors relative ${grommetsOk ? 'bg-[#10b981]' : 'bg-[#eab308]'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${grommetsOk ? 'left-7' : 'left-1'}`} /></button></div>
        <div className="flex items-center justify-between py-3 border-b border-white/5"><span className="text-gray-300 font-medium">Basisband intakt</span><button onClick={() => setGripOk(!gripOk)} className={`w-14 h-8 rounded-full transition-colors relative ${gripOk ? 'bg-[#10b981]' : 'bg-[#eab308]'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${gripOk ? 'left-7' : 'left-1'}`} /></button></div>
        <div className="flex items-center justify-between py-3"><span className="text-gray-300 font-bold">Overgrip ersetzen</span><button onClick={() => setChangeOvergrip(!changeOvergrip)} className={`w-14 h-8 rounded-full transition-colors relative ${changeOvergrip ? 'bg-[#10b981]' : 'bg-[#333]'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${changeOvergrip ? 'left-7' : 'left-1'}`} /></button></div>
      </section>

      {/* Notify Slide Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#0a0a0a]/90 backdrop-blur-md border-t border-white/5 flex justify-center z-50 rounded-t-3xl">
        <div className="w-full max-w-md relative h-[68px] bg-[#161616] rounded-[24px] border border-white/5 overflow-hidden flex items-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pl-12"><span className="text-gray-400 font-bold tracking-widest text-[11px] uppercase">{isSubmitting ? 'Wird gespeichert...' : 'Zum Speichern wischen'}</span></div>
          <motion.div drag="x" dragConstraints={{ left: 0, right: 290 }} dragElastic={0.05} onDragEnd={handleSlideEnd} animate={controls} className="absolute left-[6px] w-[56px] h-[56px] bg-[#10b981] rounded-[18px] flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_0_20px_rgba(16,185,129,0.3)] z-10"><ChevronRight className="text-[#0a0a0a] w-6 h-6" strokeWidth={3} /></motion.div>
        </div>
      </div>
    </div>
  );
}
