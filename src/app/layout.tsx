import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { BottomNav } from '@/components/BottomNav';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'String Tracker',
  description: 'Smart String Inventory',
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0a0a] text-white antialiased pb-28 selection:bg-emerald-500/30`}>
        {children}
        <BottomNav />
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: {
              background: '#161616',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#161616' }
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#161616' }
            }
          }}
        />
      </body>
    </html>
  );
}
