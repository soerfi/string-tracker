"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        window.location.href = '/admin';
      } else {
        setError('Falsches Kennwort');
      }
    } catch(err) {
      console.error(err);
      setError('Verbindungsfehler');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-[#161616] rounded-3xl border border-white/5 shadow-[0_0_50px_rgba(16,185,129,0.15)] flex items-center justify-center">
            <Lock className="w-10 h-10 text-[#10b981]" />
          </div>
        </div>
        
        <div className="bg-[#161616] border border-white/5 rounded-[32px] p-8 shadow-2xl">
          <h1 className="text-2xl font-black text-center mb-2 tracking-tight">Admin Login</h1>
          <p className="text-gray-400 text-sm text-center mb-8 font-medium">Geschützter Bereich. Bitte authentifizieren.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort" 
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl px-5 py-4 text-white font-medium text-center focus:outline-none focus:border-[#10b981] transition shadow-inner"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#10b981] disabled:opacity-50 text-gray-950 px-6 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#059669] active:scale-[0.98] shadow-lg transition-all"
            >
              {loading ? "Prüft..." : "Einloggen"} <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
