"use client";

import { useState, useRef, useEffect } from 'react';
import { Camera, ChevronRight, ChevronLeft, X, CheckCircle2 } from 'lucide-react';
import { motion, useAnimation, PanInfo, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRScanner } from './QRScanner';
import { CustomSelect } from './CustomSelect';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

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
  
  // Workflow Step
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Scannning
  const [isScanning, setIsScanning] = useState(false);
  
  // Data State
  const [customerId, setCustomerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [racketId, setRacketId] = useState("");
  const [racketBrand, setRacketBrand] = useState("");
  const [racketModel, setRacketModel] = useState("");
  
  const [localPlayers, setLocalPlayers] = useState(players);
  const selectedPlayerRackets = localPlayers.find(p => p.id === customerId)?.rackets || [];

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
  
  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToken, setSuccessToken] = useState<string | null>(null);
  const controls = useAnimation();

  const handleCustomerChange = (val: string) => {
    setCustomerId(val);
    setRacketId(""); 
    if (val !== "new" && val !== "") {
      const p = localPlayers.find(x => x.id === val);
      if (p) {
        setPlayerName(p.name);
        setEmail(p.email || "");
        setPhone(p.phone || "");
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

  const handleScan = async (decodedText: string) => {
    const token = decodedText.split('/').pop() || decodedText;
    setIsScanning(false);
    
    let found = false;
    for (const p of localPlayers) {
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
        setStep(3); // Jump straight to stringing!
        break;
      }
    }
    
    if (!found) {
      try {
        const res = await fetch(`/api/rackets/by-token?token=${token}`);
        if (res.ok) {
          const { racket } = await res.json();
          if (racket && racket.player) {
            setLocalPlayers(prev => {
              const existingPlayer = prev.find(p => p.id === racket.playerId);
              if (existingPlayer) {
                if (!existingPlayer.rackets.some(r => r.id === racket.id)) {
                  return prev.map(p => p.id === racket.playerId ? { ...p, rackets: [...p.rackets, racket] } : p);
                }
                return prev;
              } else {
                const newPlayer = { ...racket.player, rackets: [racket] };
                return [...prev, newPlayer];
              }
            });
            setCustomerId(racket.playerId);
            setPlayerName(racket.player.name);
            setEmail(racket.player.email || "");
            setPhone(racket.player.phone || "");
            setRacketId(racket.id);
            setRacketBrand(racket.brand);
            setRacketModel(racket.model);
            setStep(3); // Jump straight to stringing!
            return;
          }
        }
      } catch (err) {
        console.error("Live lookup failed", err);
      }
      toast.error("QR Code leider nicht im System als Racket registriert.");
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!customerId && !playerName) return toast.error("Bitte wähle einen Kunden aus.");
      setStep(2);
    } else if (step === 2) {
      if (!racketId && !racketBrand) return toast.error("Bitte wähle einen Schläger aus.");
      setStep(3);
    }
  };

  const prevStep = () => setStep(step - 1);

  const handleSlideEnd = async (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 200) {
      await controls.start({ x: 250 });
      handleSubmit();
    } else {
      controls.start({ x: 0 });
    }
  };

  const handleSubmit = async () => {
    if (!stringId) {
      toast.error("Bitte wählen Sie eine Saite aus.");
      controls.start({ x: 0 });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        playerId: customerId === "new" ? null : customerId,
        playerName, email, phone,
        racketId: racketId === "new" ? null : racketId,
        racketBrand, racketModel,
        stringId,
        tensionMain: tensionMain ? parseFloat(tensionMain) : null,
        tensionCross: tensionCross ? parseFloat(tensionCross) : null,
        notes, deadline, grommetsOk, gripOk, changeOvergrip
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
        toast.error(data.error || "Fehler beim Erstellen des Auftrags.");
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
        <div className="w-24 h-24 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-12 h-12 text-[#10b981]" />
        </div>
        <h1 className="text-3xl font-black mb-2 tracking-tight">Erfolgreich!</h1>
        <p className="text-gray-400 font-medium mb-10">Der Racket-Auftrag ist im System registriert.</p>
        <div className="flex flex-col gap-3 w-full">
          <Link href={`/p/${successToken}`} className="w-full bg-[#10b981] text-gray-950 font-black py-4 rounded-2xl flex items-center justify-center hover:bg-[#059669] transition shadow-lg hover:scale-[1.02] active:scale-95">
            Kundenansicht öffnen
          </Link>
          <button onClick={() => router.push('/admin')} className="w-full bg-[#161616] text-white border border-white/5 font-bold py-4 rounded-2xl flex items-center justify-center hover:bg-white/5 transition hover:scale-[1.02] active:scale-95">
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto flex flex-col h-[100dvh] bg-[#0a0a0a] font-sans relative">
      {isScanning && (
        <QRScanner onScan={handleScan} onClose={() => setIsScanning(false)} title="Racket scannen" />
      )}

      {/* Modern Header & Progress */}
      <header className="px-6 pt-6 pb-4 bg-[#0a0a0a] z-10 sticky top-0">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => step > 1 ? prevStep() : router.back()} className="w-10 h-10 bg-[#161616] border border-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition active:scale-95">
            {step > 1 ? <ChevronLeft className="w-6 h-6" /> : <X className="w-6 h-6" />}
          </button>
          <button onClick={() => setIsScanning(true)} className="flex items-center gap-2 bg-[#10b981]/10 text-[#10b981] px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#10b981]/20 transition active:scale-95">
            <Camera className="w-4 h-4" /> Scan
          </button>
        </div>
        
        <h1 className="text-3xl font-black tracking-tight mb-4">
          {step === 1 ? 'Kunde suchen' : step === 2 ? 'Racket wählen' : 'Besaitungs-Job'}
        </h1>

        {/* Minimal Progress Bar */}
        <div className="flex gap-2 w-full h-1.5 rounded-full overflow-hidden bg-[#161616]">
           <div className={clsx("h-full transition-all duration-300", step >= 1 ? "bg-[#10b981] w-1/3" : "w-0")} />
           <div className={clsx("h-full transition-all duration-300", step >= 2 ? "bg-[#10b981] w-1/3" : "w-0")} />
           <div className={clsx("h-full transition-all duration-300", step === 3 ? "bg-[#10b981] w-1/3" : "w-0")} />
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="py-4 space-y-6"
          >
            {/* STEP 1: CUSTOMER */}
            {step === 1 && (
              <section className="space-y-4">
                <CustomSelect
                  value={customerId}
                  onChange={handleCustomerChange}
                  placeholder="Stammkunde auswählen..."
                  options={[
                    { value: "new", label: "+ Neuer Kunde erfassen", isSpecial: true },
                    ...localPlayers.map(p => ({ value: p.id, label: p.name }))
                  ]}
                />

                {customerId === "new" && (
                  <div className="bg-[#161616] border border-white/5 p-4 rounded-[20px] space-y-4 shadow-lg">
                    <input 
                      type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-4 text-white font-medium focus:outline-none focus:border-[#10b981] transition"
                      placeholder="Vorname & Nachname" autoFocus
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input 
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-4 text-white font-medium focus:outline-none focus:border-[#10b981] transition" 
                        placeholder="E-Mail (optional)"
                      />
                      <input 
                        type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-4 text-white font-medium focus:outline-none focus:border-[#10b981] transition" 
                        placeholder="Telefon (optional)"
                      />
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* STEP 2: RACKET */}
            {step === 2 && (
              <section className="space-y-4">
                <CustomSelect
                  value={racketId}
                  onChange={handleRacketChange}
                  placeholder="Racket auswählen..."
                  options={[
                    ...selectedPlayerRackets.map(r => ({ value: r.id, label: `${r.brand} ${r.model}` })),
                    { value: "new", label: "+ Neues Racket erfassen", isSpecial: true }
                  ]}
                />

                {(racketId === "new" || customerId === "new") && (
                  <div className="bg-[#161616] border border-white/5 p-4 rounded-[20px] space-y-4 shadow-lg">
                    <input type="text" value={racketBrand} onChange={(e) => setRacketBrand(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-4 text-white font-medium focus:outline-none focus:border-[#10b981] transition" placeholder="Marke (z.B. Head, Wilson)" autoFocus />
                    <input type="text" value={racketModel} onChange={(e) => setRacketModel(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-4 text-white font-medium focus:outline-none focus:border-[#10b981] transition" placeholder="Modell (z.B. Speed Pro, Clash)" />
                  </div>
                )}
              </section>
            )}

            {/* STEP 3: JOB DETAILS */}
            {step === 3 && (
              <section className="space-y-6">
                <div className="bg-[#161616] p-5 rounded-[20px] border border-white/5 shadow-lg space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-[#10b981] uppercase ml-1">Gewählte Saite</label>
                    <CustomSelect
                      value={stringId}
                      onChange={setStringId}
                      placeholder="Saite auswählen..."
                      options={strings.map(s => ({ value: s.id, label: `${s.brand} ${s.model} - ${s.gauge}` }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase text-center ml-1">Längs (kg)</label>
                      <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/5 rounded-[16px] p-1.5 shadow-inner">
                        <button onClick={(e) => { e.preventDefault(); setTensionMain((parseFloat(tensionMain || "25") - 0.5).toFixed(1)) }} className="w-10 h-10 flex items-center justify-center bg-[#161616] rounded-[10px] text-white hover:text-[#10b981] active:scale-90 transition"><span className="text-2xl font-light leading-none -mt-1">-</span></button>
                        <div className="flex-1 text-center font-black text-lg text-white">{parseFloat(tensionMain || "25").toFixed(1)}</div>
                        <button onClick={(e) => { e.preventDefault(); setTensionMain((parseFloat(tensionMain || "25") + 0.5).toFixed(1)) }} className="w-10 h-10 flex items-center justify-center bg-[#161616] rounded-[10px] text-white hover:text-[#10b981] active:scale-90 transition"><span className="text-2xl font-light leading-none -mt-0.5">+</span></button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase text-center ml-1">Quer (kg)</label>
                      <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/5 rounded-[16px] p-1.5 shadow-inner">
                        <button onClick={(e) => { e.preventDefault(); setTensionCross((parseFloat(tensionCross || "24") - 0.5).toFixed(1)) }} className="w-10 h-10 flex items-center justify-center bg-[#161616] rounded-[10px] text-white hover:text-[#10b981] active:scale-90 transition"><span className="text-2xl font-light leading-none -mt-1">-</span></button>
                        <div className="flex-1 text-center font-black text-lg text-white">{parseFloat(tensionCross || "24").toFixed(1)}</div>
                        <button onClick={(e) => { e.preventDefault(); setTensionCross((parseFloat(tensionCross || "24") + 0.5).toFixed(1)) }} className="w-10 h-10 flex items-center justify-center bg-[#161616] rounded-[10px] text-white hover:text-[#10b981] active:scale-90 transition"><span className="text-2xl font-light leading-none -mt-0.5">+</span></button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-[#10b981] uppercase ml-1">Fertigstellen bis</label>
                    <input 
                      type="date" 
                      value={deadline} 
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-4 text-white font-medium focus:outline-none focus:border-[#10b981] transition [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="bg-[#161616] p-4 rounded-[20px] border border-white/5 shadow-lg space-y-2">
                  <div className="flex items-center justify-between py-2 border-b border-white/5"><span className="text-sm font-bold text-gray-300">Ösen intakt</span><button onClick={() => setGrommetsOk(!grommetsOk)} className={`w-12 h-7 rounded-full transition-colors relative ${grommetsOk ? 'bg-[#10b981]' : 'bg-[#eab308]'}`}><div className={`absolute top-1 bottom-1 w-5 h-5 bg-white rounded-full transition-transform ${grommetsOk ? 'left-6' : 'left-1'}`} /></button></div>
                  <div className="flex items-center justify-between py-2 border-b border-white/5"><span className="text-sm font-bold text-gray-300">Basisband intakt</span><button onClick={() => setGripOk(!gripOk)} className={`w-12 h-7 rounded-full transition-colors relative ${gripOk ? 'bg-[#10b981]' : 'bg-[#eab308]'}`}><div className={`absolute top-1 bottom-1 w-5 h-5 bg-white rounded-full transition-transform ${gripOk ? 'left-6' : 'left-1'}`} /></button></div>
                  <div className="flex items-center justify-between py-2"><span className="text-sm font-black text-white">Overgrip ersetzen + Fr. 5.-</span><button onClick={() => setChangeOvergrip(!changeOvergrip)} className={`w-12 h-7 rounded-full transition-colors relative ${changeOvergrip ? 'bg-[#10b981]' : 'bg-[#333]'}`}><div className={`absolute top-1 bottom-1 w-5 h-5 bg-white rounded-full transition-transform ${changeOvergrip ? 'left-6' : 'left-1'}`} /></button></div>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Action Area */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 flex justify-center z-50">
        <div className="w-full max-w-md">
          {step < 3 ? (
            <button onClick={nextStep} className="w-full bg-[#10b981] text-gray-950 px-6 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#059669] active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all">
              Weiter zum {step === 1 ? 'Schläger' : 'Auftrag'} <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-full relative h-[68px] bg-[#161616] rounded-[24px] border border-white/5 overflow-hidden flex items-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pl-12"><span className="text-gray-400 font-bold tracking-widest text-[11px] uppercase">{isSubmitting ? 'Wird gespeichert...' : 'Zum Speichern wischen'}</span></div>
              <motion.div drag="x" dragConstraints={{ left: 0, right: typeof window !== 'undefined' ? window.innerWidth > 450 ? 330 : window.innerWidth - 120 : 250 }} dragElastic={0.05} onDragEnd={handleSlideEnd} animate={controls} className="absolute left-[6px] w-[56px] h-[56px] bg-[#10b981] rounded-[18px] flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_0_20px_rgba(16,185,129,0.3)] z-10">
                <ChevronRight className="text-gray-950 w-6 h-6" strokeWidth={3} />
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
