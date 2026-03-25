"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, Activity, Search, Plus, X, ChevronRight } from 'lucide-react';

import { toast } from 'react-hot-toast';

interface PlayerType {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  racketBrand: string | null;
  racketModel: string | null;
  rackets: any[];
  jobs: { status: string; isPaid: boolean; }[];
}

export function AdminCustomersClient({ initialPlayers }: { initialPlayers: PlayerType[] }) {
  const [players, setPlayers] = useState(initialPlayers);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  const [isAddingCustomerSave, setIsAddingCustomerSave] = useState(false);

  const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCreateCustomer = async () => {
    if (!newCustomer.name) return toast.error("Name zwingend");
    setIsAddingCustomerSave(true);
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });
      if (res.ok) {
        const { player } = await res.json();
        const fullPlayer = { ...player, rackets: [], jobs: [] };
        setPlayers([fullPlayer, ...players]);
        setNewCustomer({ name: '', email: '', phone: '' });
        setIsAddingCustomer(false);
        toast.success("Kunde erfasst");
      } else {
        toast.error("Server Fehler beim Speichern");
      }
    } catch(e) {
      toast.error("Netzwerkfehler beim Erstellen.");
    }
    setIsAddingCustomerSave(false);
  };

  return (
    <div className="space-y-6">
      
      {!isAddingCustomer ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Kunde suchen..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#161616] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#10b981] shadow-lg transition-colors"
            />
          </div>
          <button onClick={() => setIsAddingCustomer(true)} className="sm:w-auto w-full shrink-0 bg-[#10b981] text-gray-950 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#059669] transition active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Plus className="w-5 h-5" /> Neuer Kunde
          </button>
        </div>
      ) : (
        <div className="bg-[#161616] p-5 rounded-[24px] border border-[#10b981]/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative">
          <button onClick={() => setIsAddingCustomer(false)} className="absolute top-4 right-4 w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
          <div className="text-[10px] font-black tracking-widest text-[#10b981] uppercase mb-4">Kunde erfassen</div>
          <div className="space-y-3">
             <input type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3.5 text-white font-medium focus:outline-none focus:border-[#10b981]" placeholder="Vorname & Nachname" autoFocus />
             <div className="grid grid-cols-2 gap-3">
               <input type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3.5 text-white font-medium focus:outline-none focus:border-[#10b981]" placeholder="E-Mail (optional)" />
               <input type="tel" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3.5 text-white font-medium focus:outline-none focus:border-[#10b981]" placeholder="Telefon (optional)" />
             </div>
             <button onClick={handleCreateCustomer} disabled={isAddingCustomerSave || !newCustomer.name} className="w-full bg-[#10b981] disabled:opacity-50 text-gray-950 font-black py-4 rounded-xl mt-2 hover:bg-[#059669] transition-all shadow-lg active:scale-95">
               {isAddingCustomerSave ? 'Speichern...' : 'Kunde anlegen'}
             </button>
          </div>
        </div>
      )}

      {/* List of Players */}
      <div className="flex flex-col gap-3">
        {filteredPlayers.length === 0 ? (
          <div className="text-gray-500 font-bold p-8 text-center bg-[#161616] rounded-3xl border border-white/5 shadow-lg">Keine Treffer.</div>
        ) : (
          filteredPlayers.map(player => (
            <Link href={`/admin/customers/${player.id}`} key={player.id} className="bg-[#161616] border border-white/5 rounded-[24px] p-5 shadow-lg group hover:border-[#10b981]/30 transition-all active:scale-[0.98] relative overflow-hidden flex items-center justify-between">
              <div>
                <div className="font-bold text-lg text-white group-hover:text-[#10b981] transition-colors mb-1">{player.name}</div>
                <div className="flex gap-2 items-center mb-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#10b981] bg-[#10b981]/10 px-2.5 py-1 rounded-md border border-[#10b981]/20">
                    <Activity className="w-3.5 h-3.5" />
                    {player.rackets?.length || 0} Rackets, {player.jobs?.length || 0} Aufträge
                  </div>
                  {player.jobs?.some(j => j.status === 'DONE' && !j.isPaid) && (
                    <div className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 uppercase tracking-widest">
                      Offene Rechnung
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                  {player.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {player.email}</span>}
                  {player.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {player.phone}</span>}
                </div>
              </div>
              <div className="w-10 h-10 bg-[#0a0a0a] rounded-full flex items-center justify-center text-gray-500 group-hover:bg-[#10b981] group-hover:text-gray-950 transition-colors shrink-0 shadow-inner">
                <ChevronRight className="w-5 h-5 ml-0.5" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
