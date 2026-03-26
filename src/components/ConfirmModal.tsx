import { ReactNode } from 'react';

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: { isOpen: boolean, title: string, message: string | ReactNode, onConfirm: () => void, onCancel: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="bg-[#161616] border border-white/10 rounded-[32px] p-6 max-w-sm w-full shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <span className="text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></span>
        </div>
        <h3 className="text-2xl font-black text-white mb-2">{title}</h3>
        <p className="text-gray-400 font-medium mb-8 text-sm">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-4 px-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition active:scale-95">Zurück</button>
          <button onClick={onConfirm} className="flex-1 py-4 px-4 bg-red-500 text-white rounded-2xl font-black shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-600 transition active:scale-95">Löschen</button>
        </div>
      </div>
    </div>
  );
}
