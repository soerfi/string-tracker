import { redirect } from 'next/navigation';

export default async function Home() {
  return (
    <main className="min-h-[100dvh] bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center text-white relative">
      <div className="w-full max-w-xs animate-in slide-in-from-bottom-4 fade-in duration-500">
        <h1 className="text-4xl font-black mb-2 tracking-tighter text-[#10b981]">TRACKER</h1>
        <p className="text-gray-400 font-medium mb-10">Finde deine Racket-Statistiken.</p>
        
        <form action={async (formData) => {
          "use server"
          const code = formData.get('code') as string;
          if (code) {
             redirect(`/p/${code.trim()}`);
          }
        }} className="flex flex-col gap-4">
          <input 
            type="text" 
            name="code" 
            placeholder="CODE (Z.B. A1B2C)" 
            className="w-full bg-[#161616] border border-white/5 rounded-2xl px-5 py-4 text-center text-xl font-black uppercase tracking-widest text-[#10b981] focus:outline-none focus:border-[#10b981] transition-colors placeholder:text-gray-600 placeholder:font-bold"
            required
            maxLength={10}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <button type="submit" className="w-full bg-[#10b981] text-gray-950 font-black py-4 rounded-2xl text-lg hover:bg-[#059669] transition-all shadow-lg shadow-[#10b981]/10 active:scale-95">
            Racket abrufen
          </button>
        </form>
      </div>

      <a href="/admin" className="absolute bottom-6 text-[10px] font-bold tracking-widest uppercase text-gray-800 hover:text-gray-500 transition-colors">
        Admin Login
      </a>
    </main>
  );
}
