import { TopBar } from '@/components/TopBar'
import { Settings, LogOut } from 'lucide-react'

export default function SettingsPage() {
  return (
    <main className="min-h-[100dvh] bg-[#0a0a0a] text-white p-6 pb-32 font-sans md:ml-[280px]">
      <TopBar />
      
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">Einstellungen</h1>
          <p className="text-sm text-gray-400 font-medium">App Konfiguration</p>
        </div>
        <div className="w-12 h-12 bg-[#161616] rounded-2xl flex items-center justify-center border border-white/5 shadow-lg">
          <Settings className="w-6 h-6 text-[#10b981]" />
        </div>
      </header>

      <div className="space-y-4">
        <a href="/admin/qr-batch" className="block bg-[#161616] border border-[#10b981]/20 rounded-3xl p-6 shadow-lg hover:border-[#10b981] transition-all group">
          <h2 className="text-[11px] font-bold tracking-widest text-[#10b981] uppercase mb-2">Tools</h2>
          <div className="text-lg font-bold text-white group-hover:text-[#10b981] transition-colors flex items-center gap-2">
            QR-Code Generator & Export &rarr;
          </div>
          <div className="text-sm text-gray-500 mt-1">Generiere reservierte QR-Batch Dateien für den Druck.</div>
        </a>

        <div className="bg-[#161616] border border-white/5 rounded-3xl p-6 shadow-lg">
          <h2 className="text-[11px] font-bold tracking-widest text-[#10b981] uppercase mb-4">Konto</h2>
          <div className="text-lg font-bold">Admin</div>
          <div className="text-sm text-gray-500 mb-6">admin@stringtracker.com</div>
          
          <button className="flex items-center gap-3 text-red-400 hover:text-red-300 transition font-bold text-sm bg-red-400/10 px-4 py-3 rounded-xl w-full justify-center">
            <LogOut className="w-5 h-5" /> Abmelden
          </button>
        </div>
        
        <div className="bg-[#161616] border border-white/5 rounded-3xl p-6 shadow-lg">
          <h2 className="text-[11px] font-bold tracking-widest text-[#10b981] uppercase mb-4">Darstellung</h2>
          <div className="text-gray-400 text-sm">Der Dark Mode ist permanent aktiviert, um den Kontrast zu gewährleisten.</div>
        </div>
      </div>
    </main>
  );
}
