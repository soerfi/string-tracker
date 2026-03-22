"use client";

import { useState } from 'react';
import { calculateDeadDate, calculateHealthPercentage } from '@/lib/decay';
import { Droplet, Calendar, CheckCircle2, Activity } from 'lucide-react';

export function PlayerDashboard({
  stringDate,
  baseLifeHours,
  skillMultiplier,
  initialWeeklyFrequency,
  stringBrand,
  stringModel,
  stringGauge,
  stringType,
  stringBenefits,
  descriptionDe,
  tensionMain,
  tensionCross,
  qrCodeToken,
  playerName,
  racketBrand,
  racketModel,
  playerRacketBrand,
  playerRacketModel
}: {
  stringDate: string;
  baseLifeHours: number;
  skillMultiplier: number;
  initialWeeklyFrequency: number;
  stringBrand: string;
  stringModel: string;
  stringGauge: string;
  stringType: string;
  stringBenefits: string[];
  descriptionDe: string;
  notes: string | null;
  tensionMain: number | null;
  tensionCross: number | null;
  qrCodeToken: string;
  playerName: string;
  racketBrand?: string | null;
  racketModel?: string | null;
  playerRacketBrand?: string | null;
  playerRacketModel?: string | null;
}) {
  const [freq, setFreq] = useState(initialWeeklyFrequency);
  
  const sDate = new Date(stringDate);
  const deadDate = calculateDeadDate(sDate, baseLifeHours, skillMultiplier, freq);
  const health = calculateHealthPercentage(sDate, deadDate);
  
  // Calculate days remaining by stripping the time to get exact calendar days
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDeadDate = new Date(deadDate.getFullYear(), deadDate.getMonth(), deadDate.getDate());
  
  const diffTime = startOfDeadDate.getTime() - startOfToday.getTime();
  const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 pb-24 font-sans px-2">
      <header className="mt-8 text-center relative">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-white rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)] inline-block">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://acetrace.tcg-grueze.ch/player/${qrCodeToken}`)}`} 
              alt="Racket QR" 
              className="w-24 h-24"
            />
          </div>
        </div>
        <h1 className="text-2xl font-black tracking-tight relative z-10 text-[#10b981]">
          {racketBrand || playerRacketBrand || "Tennis"} {racketModel || playerRacketModel || "Schläger"}
        </h1>
        <p className="text-gray-400 text-sm mt-1 relative z-10">Besitzer: {playerName}</p>
      </header>

      {/* HUGE String & Tension Display */}
      <div className="bg-[#10b981] text-gray-950 rounded-3xl p-6 text-center shadow-[0_0_40px_rgba(16,185,129,0.2)] mx-2 mt-2 border border-[#10b981]/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
        <div className="text-[10px] font-black tracking-widest uppercase opacity-70 mb-1">Montierte Saite</div>
        <div className="text-3xl font-black leading-tight tracking-tight mb-4">{stringBrand} <br/> {stringModel}</div>
        
        <div className="flex items-center justify-center gap-4">
          <div className="bg-gray-950/10 px-5 py-3 rounded-2xl flex-1 backdrop-blur-sm">
            <div className="text-[10px] font-black tracking-widest uppercase opacity-70 mb-0.5">Längs</div>
            <div className="text-2xl font-black">{tensionMain ? tensionMain : '24'} <span className="text-sm">kg</span></div>
          </div>
          <div className="bg-gray-950/10 px-5 py-3 rounded-2xl flex-1 backdrop-blur-sm">
            <div className="text-[10px] font-black tracking-widest uppercase opacity-70 mb-0.5">Quer</div>
            <div className="text-2xl font-black">{tensionCross ? tensionCross : '23'} <span className="text-sm">kg</span></div>
          </div>
        </div>

        {daysLeft <= 0 && (
          <div className="mt-4 bg-red-500 text-white p-3 rounded-xl border border-red-400 font-black tracking-wide uppercase text-sm shadow-lg animate-pulse">
            🚨 SAITE ERSETZEN!
          </div>
        )}
      </div>

      {/* Big Gauge */}
      <div className="flex justify-center mt-4">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#161616" strokeWidth="10" />
            <circle 
              cx="50" cy="50" r="45" fill="none" 
              stroke="#10b981" 
              strokeWidth="10" 
              strokeDasharray="283" 
              strokeDashoffset={283 - (283 * health) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white">{Math.round(health)}%</span>
            <span className="text-[11px] text-gray-400 font-bold tracking-widest uppercase absolute -bottom-5">Tot</span> {/* Translated Freshness to Tot */}
          </div>
        </div>
      </div>

      {/* Dates row */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-[#161616] rounded-2xl p-5 border border-white/5 shadow-lg">
            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">Besaiten in</div>
            <div className="text-3xl font-black text-[#10b981]">{Math.max(0, daysLeft)} <span className="text-xl text-gray-400">Tage</span></div>
        </div>
        <div className="bg-[#161616] rounded-2xl p-5 border border-white/5 shadow-lg flex flex-col justify-center">
          <div className="text-[#10b981] font-bold text-sm tracking-tight leading-snug mb-2">
            Dein optimales Spielfenster endet am:
          </div>
          <div className="text-xl font-black text-white">{deadDate.toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric'})}</div>
        </div>
      </div>

      {/* Play Frequency */}
      <section className="mt-4">
        <h2 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4 px-1">Spielhäufigkeit</h2> {/* Translated Play Frequency */}
        <div className="bg-[#161616] border border-white/5 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <span className="font-bold text-[15px]">{freq} Stunden / Woche</span> {/* Translated Hours / Week */}
            <Activity className="text-[#10b981] w-5 h-5" />
          </div>
          <input 
            type="range" 
            min="0" max="20" step="1" 
            value={freq} 
            onChange={(e) => setFreq(parseInt(e.target.value))}
            className="w-full h-2 bg-[#202020] rounded-full appearance-none cursor-pointer accent-[#10b981]"
          />
        </div>
      </section>

      {/* String Specs */}
      <section className="mt-2">
        <h2 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4 px-1">String Specs</h2>
        <div className="bg-[#161616] border border-white/5 rounded-3xl p-6 shadow-lg">
          <div className="flex gap-4 mb-6">
            <div className="w-12 h-12 bg-[#0c2a1e] rounded-xl flex items-center justify-center shrink-0">
              <Droplet className="w-5 h-5 text-[#10b981]" />
            </div>
            <div>
              <div className="font-bold text-[16px]">{stringBrand} {stringModel}</div>
              <div className="text-[12px] text-gray-400 mt-1">{stringType} • {stringGauge}</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {stringBenefits.map((b, i) => (
              <span key={i} className="px-3 py-1.5 bg-[#0c2a1e] text-[#10b981] text-[11px] font-bold rounded-lg whitespace-nowrap border border-[#10b981]/20">
                {b}
              </span>
            ))}
          </div>

          <p className="text-sm text-gray-300 italic leading-relaxed">
            {descriptionDe || `Diese Saite bietet eine hervorragende Balance aus Power und Kontrolle. Konzipiert für Spieler mit hohem Spin-Bedarf.`}
          </p>
        </div>
      </section>

      {/* Last Service */}
      <section className="mt-2 mb-10">
        <h2 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4 px-1">Last Service</h2>
        <div className="bg-[#161616] border border-white/5 rounded-3xl p-6 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <div className="font-bold text-[15px]">{sDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}</div>
              <div className="text-[12px] text-gray-500 mt-0.5">{tensionMain ? tensionMain : '24'}/{tensionCross ? tensionCross : '23'} kg</div>
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
        </div>
      </section>
    </div>
  );
}
