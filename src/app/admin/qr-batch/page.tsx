"use client";

import { useState, useEffect } from "react";
import { QrCode, Download } from "lucide-react";
import { generateQrBatch, getBatchStats } from "./actions";
import { toast } from "react-hot-toast";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function QrBatchPage() {
  const [amount, setAmount] = useState(500);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState({ total: 0, printed: 0, assigned: 0 });
  const [confirmGenerate, setConfirmGenerate] = useState(false);

  useEffect(() => {
    getBatchStats().then(setStats).catch(console.error);
  }, []);

  const executeGenerate = async () => {
    setConfirmGenerate(false);
    setIsGenerating(true);
    const result = await generateQrBatch(amount);
    if (result.success && result.codes) {
      let csvContent = "data:text/csv;charset=utf-8,ID,URL\n";
      result.codes.forEach(code => {
        csvContent += `${code},https://tennis.soerfi.com/p/${code}\n`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `qr_batch_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      getBatchStats().then(setStats);
      toast.success("Erfolgreich generiert");
    } else {
      toast.error(result.error || "Ein Fehler ist aufgetreten.");
    }
    setIsGenerating(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 p-4 pt-12">
      <ConfirmModal 
        isOpen={confirmGenerate} 
        title="QR-Codes generieren" 
        message={`${amount} neue Codes in der DB reservieren und als CSV exportieren?`} 
        onConfirm={executeGenerate} 
        onCancel={() => setConfirmGenerate(false)} 
      />
      <div>
         <h1 className="text-3xl font-black text-white flex items-center gap-3">
           <QrCode className="w-8 h-8 text-[#10b981]" /> QR-Code Generator
         </h1>
         <p className="text-gray-400 mt-2 font-medium">
           Generiere reservierte, extrem kurze `.csv` QR-Code Links für den Druckereiexport. (z.B. <span className="text-[#10b981]">tennis.soerfi.com/p/A1B2C3</span>)
         </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="bg-[#161616] border border-[#10b981]/20 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-[#10b981]">{stats.printed}</div>
            <div className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-widest">Frei (Gedruckt)</div>
         </div>
         <div className="bg-[#161616] border border-white/5 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-gray-300">{stats.assigned}</div>
            <div className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-widest">Zugewiesen</div>
         </div>
      </div>

      <div className="bg-[#161616] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#10b981]/50 to-transparent left-0"></div>
         <h2 className="text-lg font-bold text-white mb-4">Neue Charge generieren</h2>
         
         <div className="space-y-4">
           <div>
             <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Anzahl Codes</label>
             <input 
               type="number" 
               inputMode="numeric"
               value={amount} 
               onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
               className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white font-black text-xl text-center focus:outline-none focus:border-[#10b981] transition-colors"
             />
           </div>

           <button 
             onClick={() => setConfirmGenerate(true)} 
             disabled={isGenerating || amount <= 0}
             className="w-full bg-[#10b981] disabled:opacity-50 disabled:grayscale text-gray-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#059669] transition-all shadow-lg shadow-[#10b981]/20 active:scale-95"
           >
             {isGenerating ? "Wird generiert & gespeichert..." : <><Download className="w-5 h-5" /> CSV Datei Herunterladen</>}
           </button>
         </div>
      </div>
      
      <div className="text-center text-gray-500 text-xs mt-8">
        Schicke die generierte .csv an die Druckerei.<br/>Die Links leiten alle nativ auf das System weiter.
      </div>
    </div>
  );
}
