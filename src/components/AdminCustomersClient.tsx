"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Activity, Edit2, Trash2, QrCode, ChevronRight, X, Plus, Camera } from 'lucide-react';
import { QRScanner } from './QRScanner';

interface PlayerType {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  racketBrand: string | null;
  racketModel: string | null;
  rackets: {
    id: string;
    brand: string;
    model: string;
    qrCodeToken: string;
    color: string | null;
    notes: string | null;
    createdAt: string | Date;
  }[];
  jobs: { 
    id: string;
    racketBrand: string | null;
    racketModel: string | null;
    qrCodeToken: string;
    createdAt: string | Date;
    status: string;
    isPaid: boolean;
  }[];
}

export function AdminCustomersClient({ initialPlayers }: { initialPlayers: PlayerType[] }) {
  const [players, setPlayers] = useState(initialPlayers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({ 
    name: '', email: '', phone: '', racketBrand: '', racketModel: '' 
  });

  const [newRacket, setNewRacket] = useState({ brand: '', model: '' });
  const [isAddingRacket, setIsAddingRacket] = useState(false);
  
  const router = useRouter();
  
  // Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [scannedToken, setScannedToken] = useState("");
  
  // Edit Racket State
  const [editingRacketId, setEditingRacketId] = useState<string|null>(null);
  const [racketForm, setRacketForm] = useState({ brand: '', model: '', qrCodeToken: '' });

  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  const [isAddingCustomerSave, setIsAddingCustomerSave] = useState(false);

  const handleScan = (decodedText: string) => {
    const token = decodedText.split('/').pop() || decodedText;
    setScannedToken(token);
    setIsScanning(false);
  };

  const startEdit = (player: PlayerType) => {
    setEditingId(player.id);
    setForm({
      name: player.name || '',
      email: player.email || '',
      phone: player.phone || '',
      racketBrand: player.racketBrand || '',
      racketModel: player.racketModel || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/players/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const { player } = await res.json();
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...player } : p));
        setEditingId(null);
      } else {
        alert("Fehler beim Speichern");
      }
    } catch(e) {
      console.error(e);
      alert("Fehler beim Speichern");
    }
    setIsSaving(false);
  };

  const deletePlayer = async (id: string) => {
    if (!confirm("Kunde und alle seine Aufträge wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPlayers(prev => prev.filter(p => p.id !== id));
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleAddRacket = async (playerId: string) => {
    if (!newRacket.brand || !newRacket.model) return alert("Marke und Modell benötigt");
    setIsAddingRacket(true);
    try {
      const res = await fetch(`/api/rackets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, brand: newRacket.brand, model: newRacket.model, qrCodeToken: scannedToken || undefined })
      });
      if (res.ok) {
        const { racket } = await res.json();
        setPlayers(prev => prev.map(p => {
          if (p.id === playerId) {
            return { ...p, rackets: [...p.rackets, racket] };
          }
          return p;
        }));
        setNewRacket({ brand: '', model: '' });
        setScannedToken("");
        router.refresh();
      } else {
        alert("Fehler beim Hinzufügen des Rackets");
      }
    } catch(e) {
      console.error(e);
      alert("Verbindungsfehler");
    }
    setIsAddingRacket(false);
  };

  const saveRacketEdit = async (playerId: string, racketId: string) => {
    try {
      const res = await fetch(`/api/rackets/${racketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(racketForm)
      });
      if (res.ok) {
        const { racket } = await res.json();
        setPlayers(prev => prev.map(p => {
          if (p.id === playerId) {
            return { ...p, rackets: p.rackets.map(r => r.id === racketId ? { ...r, ...racket } : r) };
          }
          return p;
        }));
        setEditingRacketId(null);
        router.refresh();
      } else {
        alert("Fehler beim Speichern");
      }
    } catch(err) {
      console.error(err);
    }
  };

  const deleteRacket = async (playerId: string, racketId: string) => {
    if (!confirm("Schläger wirklich löschen? Die Historie der Bespannungen bleibt bestehen.")) return;
    try {
      const res = await fetch(`/api/rackets/${racketId}`, { method: 'DELETE' });
      if (res.ok) {
        setPlayers(prev => prev.map(p => {
          if (p.id === playerId) {
            return { ...p, rackets: p.rackets.filter(r => r.id !== racketId) };
          }
          return p;
        }));
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name) return alert("Name zwingend");
    setIsAddingCustomerSave(true);
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });
      if (res.ok) {
        const { player } = await res.json();
        const fullPlayer = { ...player, rackets: player.rackets || [], jobs: player.jobs || [] };
        setPlayers([fullPlayer, ...players]);
        setNewCustomer({ name: '', email: '', phone: '' });
        setIsAddingCustomer(false);
      } else {
        const errText = await res.text();
        alert("Server Fehler beim Speichern: " + errText);
      }
    } catch(e) {
      console.error(e);
      alert("Netzwerkfehler beim Erstellen.");
    }
    setIsAddingCustomerSave(false);
  };

  if (players.length === 0 && !isAddingCustomer) {
    return (
      <div className="bg-[#161616] p-6 rounded-3xl border border-white/5 text-center flex flex-col items-center">
        <div className="text-gray-500 font-medium mb-4">Noch keine Kunden.</div>
        <button onClick={() => setIsAddingCustomer(true)} className="bg-[#10b981] text-gray-950 px-5 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#059669] transition active:scale-[0.98]">
           <Plus className="w-5 h-5" /> Neuen Kunden anlegen
        </button>
      </div>
    );
  }

  // Active player for the modal
  const activePlayer = players.find(p => p.id === editingId);

  return (
    <div className="space-y-4">
      
      {!isAddingCustomer ? (
        <button onClick={() => setIsAddingCustomer(true)} className="w-full bg-[#10b981] text-gray-950 px-5 py-4 rounded-3xl font-black flex items-center justify-center gap-2 hover:bg-[#059669] transition active:scale-[0.98] shadow-lg shadow-[#10b981]/10">
          <Plus className="w-6 h-6" />
          Neuen Kunden anlegen
        </button>
      ) : (
        <div className="bg-[#161616] p-5 rounded-3xl border-2 border-[#10b981]/50 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative mb-6 slide-in-from-top-4 animate-in">
          <button onClick={() => setIsAddingCustomer(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          <div className="text-sm font-black text-[#10b981] uppercase tracking-widest mb-4">Kunde erfassen</div>
          <div className="space-y-3">
             <input type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981]" placeholder="Vorname Nachname" />
             <div className="grid grid-cols-2 gap-3">
               <input type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981]" placeholder="E-Mail (optional)" />
               <input type="tel" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981]" placeholder="Telefon (optional)" />
             </div>
             <button onClick={handleCreateCustomer} disabled={isAddingCustomerSave || !newCustomer.name} className="w-full bg-[#10b981] disabled:opacity-50 text-gray-950 font-black py-4 rounded-xl mt-2 hover:bg-[#059669] transition-all">
               {isAddingCustomerSave ? 'Speichern...' : 'Kunde anlegen'}
             </button>
          </div>
        </div>
      )}

      {/* List of Players */}
      {players.map(player => (
        <div key={player.id} className="bg-[#161616] border border-white/5 rounded-3xl p-5 shadow-lg group cursor-pointer hover:border-white/10 transition-colors" onClick={() => startEdit(player)}>
          <div className="flex justify-between items-start mb-4">
            <div className="font-bold text-lg text-white group-hover:text-[#10b981] transition-colors">{player.name}</div>
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); deletePlayer(player.id); }} className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-[#202020] px-2.5 py-1 rounded-lg border border-white/5">
                <Activity className="w-3.5 h-3.5" />
                {player.rackets?.length || 0} Rackets, {player.jobs?.length || 0} Aufträge
              </div>
              {player.jobs?.some(j => j.status === 'DONE' && !j.isPaid) && (
                <div className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 uppercase tracking-widest mt-1">
                  Offene Rechnung
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-400">
            {player.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" /> {player.email}
              </div>
            )}
            {player.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" /> {player.phone}
              </div>
            )}
            {!player.email && !player.phone && (
              <div className="italic text-gray-600">Klicken, um Kunden zu administrieren.</div>
            )}
          </div>
        </div>
      ))}

      {/* Administration Modal */}
      {editingId && activePlayer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-[#111] w-full max-w-2xl h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0 bg-[#0a0a0a]">
              <div>
                <h2 className="text-xl font-black text-white">{activePlayer.name}</h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-400 font-medium">Kunden-Verwaltung</p>
                  {activePlayer.jobs?.some(j => j.status === 'DONE' && !j.isPaid) && (
                     <span className="text-[10px] font-black tracking-widest uppercase bg-red-500/10 text-red-500 border border-red-500/20 rounded px-1.5 py-0.5">Offene Rechnungen</span>
                  )}
                </div>
              </div>
              <button onClick={cancelEdit} className="w-10 h-10 bg-[#1a1a1a] rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              
              {/* Stammdaten */}
              <section>
                <h3 className="text-[11px] font-bold tracking-widest text-[#10b981] uppercase mb-4">Stammdaten</h3>
                <div className="space-y-3 bg-[#161616] p-5 rounded-3xl border border-white/5">
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981]" placeholder="Name" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981]" placeholder="E-Mail" />
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981]" placeholder="Telefon" />
                  </div>
                  <button onClick={() => saveEdit(activePlayer.id)} disabled={isSaving} className="w-full mt-2 bg-white/5 text-white py-3 rounded-xl font-bold flex justify-center hover:bg-white/10 active:scale-[0.98] transition-all">
                    {isSaving ? "Speichern..." : "Stammdaten speichern"}
                  </button>
                </div>
              </section>

              {/* Rackets Management */}
              <section>
                <h3 className="text-[11px] font-bold tracking-widest text-[#10b981] uppercase mb-4">Erfasste Schläger (Rackets)</h3>
                
                <div className="space-y-3">
                  {(!activePlayer.rackets || activePlayer.rackets.length === 0) && (
                    <div className="text-sm text-gray-500 italic p-4 text-center bg-[#161616] rounded-2xl border border-white/5">
                      Noch keine permanten Schläger für diesen Kunden angelegt.
                    </div>
                  )}

                  {activePlayer.rackets && activePlayer.rackets.map(racket => (
                    <div key={racket.id} className="flex flex-col gap-3 bg-[#161616] border border-[#10b981]/20 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                      <div className="flex items-start gap-4 justify-between relative z-10 w-full">
                        {editingRacketId === racket.id ? (
                          <div className="flex-1 space-y-2 pr-4">
                            <input type="text" value={racketForm.brand} onChange={e => setRacketForm({...racketForm, brand: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-3 py-2 text-white text-sm" placeholder="Marke" />
                            <input type="text" value={racketForm.model} onChange={e => setRacketForm({...racketForm, model: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-3 py-2 text-white text-sm" placeholder="Modell" />
                            <input type="text" value={racketForm.qrCodeToken} onChange={e => setRacketForm({...racketForm, qrCodeToken: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#10b981]/50 rounded-xl px-3 py-2 text-white text-sm" placeholder="QR Code Token (z.B. RKT-1000)" />
                            <div className="flex gap-2 pt-1">
                              <button onClick={() => saveRacketEdit(activePlayer.id, racket.id)} className="bg-[#10b981] text-black px-3 py-1.5 rounded-lg text-xs font-bold w-full hover:bg-[#059669]">Speichern</button>
                              <button onClick={() => setEditingRacketId(null)} className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold w-full hover:bg-white/20">Abbrechen</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-xl text-white tracking-tight">{racket.brand} {racket.model}</div>
                              <button onClick={() => { setEditingRacketId(racket.id); setRacketForm({ brand: racket.brand, model: racket.model, qrCodeToken: racket.qrCodeToken }); }} className="text-gray-500 hover:text-[#10b981]"><Edit2 className="w-4 h-4" /></button>
                            </div>
                            {racket.color && <div className="text-sm text-[#10b981] font-bold mt-0.5">{racket.color}</div>}
                            <div className="text-xs text-gray-500 mt-1 font-mono">Code: {racket.qrCodeToken}</div>
                            {racket.notes && <div className="text-sm text-gray-400 mt-1 line-clamp-2">{racket.notes}</div>}
                            <div className="text-xs text-gray-500 mt-2">Hinzugefügt: {new Date(racket.createdAt).toLocaleDateString('de-CH')}</div>
                          </div>
                        )}
                        {editingRacketId !== racket.id && (
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin + "/player/" + racket.qrCodeToken : "")}&margin=1`}
                            alt="QR Code"
                            className="w-20 h-20 rounded-xl bg-white border border-[#10b981]/30 p-1 shrink-0" 
                          />
                        )}
                      </div>
                      
                      <div className="relative z-10 flex gap-2 mt-2">
                        <a href={`/player/${racket.qrCodeToken}`} target="_blank" className="bg-[#10b981] text-gray-950 px-4 py-2.5 w-full rounded-xl text-sm font-black shadow-lg flex items-center justify-center gap-2 hover:bg-[#059669] transition-colors">
                          <QrCode className="w-4 h-4" /> Tracker öffnen 
                        </a>
                        <button onClick={() => deleteRacket(activePlayer.id, racket.id)} title="Schläger löschen" className="shrink-0 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 p-2.5 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Racket Inline Form */}
                  <div className="bg-[#161616] p-4 rounded-2xl border border-white/5 border-dashed mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Neuen Schläger anlegen</div>
                      {scannedToken && (
                        <div className="bg-[#10b981]/20 text-[#10b981] px-2 py-1 rounded text-[10px] font-bold border border-[#10b981]/30 flex items-center gap-1">
                          <QrCode className="w-3 h-3" /> QR GELADEN
                        </div>
                      )}
                    </div>

                    {isScanning && (
                      <QRScanner 
                        onScan={handleScan}
                        onClose={() => setIsScanning(false)}
                        title="QR Aufkleber scannen"
                      />
                    )}

                    {!isScanning && (
                      <div className="flex gap-2">
                        <button onClick={() => setIsScanning(true)} className={`p-2.5 rounded-xl border transition-colors shrink-0 ${scannedToken ? 'bg-[#10b981]/10 border-[#10b981] text-[#10b981]' : 'bg-[#0a0a0a] border-white/5 text-gray-400 hover:text-white'}`}>
                           <Camera className="w-5 h-5" />
                        </button>
                        <input type="text" value={newRacket.brand} onChange={e => setNewRacket({...newRacket, brand: e.target.value})} className="flex-1 min-w-[60px] bg-[#0a0a0a] border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#10b981]" placeholder="Head" />
                        <input type="text" value={newRacket.model} onChange={e => setNewRacket({...newRacket, model: e.target.value})} className="flex-1 min-w-[60px] bg-[#0a0a0a] border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#10b981]" placeholder="Speed" />
                        <button onClick={() => handleAddRacket(activePlayer.id)} disabled={isAddingRacket || !newRacket.brand || !newRacket.model} className="bg-[#10b981] disabled:opacity-50 text-gray-950 px-4 rounded-xl font-bold flex items-center justify-center hover:bg-[#059669] transition-all shrink-0">
                          {isAddingRacket ? "..." : <Plus className="w-5 h-5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Besaitungs-Historie (Jobs Tracker) */}
              <section className="pb-8">
                <h3 className="text-[11px] font-bold tracking-widest text-[#10b981] uppercase mb-4">Bespannungs-Historie</h3>
                <div className="space-y-2">
                  {(!activePlayer.jobs || activePlayer.jobs.length === 0) && (
                     <div className="text-sm text-gray-500 italic p-4 text-center bg-[#161616] rounded-2xl border border-white/5">
                       Noch keine Bespannungen durchgeführt.
                     </div>
                  )}
                  {activePlayer.jobs && activePlayer.jobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl p-4">
                      <div>
                        <div className="font-bold text-sm text-white">
                          {job.racketBrand || activePlayer.racketBrand || "Unbekanntes Racket"} {job.racketModel || activePlayer.racketModel || ""}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{new Date(job.createdAt).toLocaleDateString('de-CH')}</span>
                          {job.status === 'DONE' && (
                             <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded border ${job.isPaid ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                               {job.isPaid ? "Bezahlt" : "Offen"}
                             </span>
                          )}
                        </div>
                      </div>
                      <a href={`/admin/jobs/${job.id}`} target="_blank" className="flex items-center gap-1.5 bg-white/5 text-gray-300 px-3 py-2 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">
                        Auftrag <ChevronRight className="w-3 h-3 -ml-0.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
