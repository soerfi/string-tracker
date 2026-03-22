"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
  title?: string;
}

export function QRScanner({ onScan, onClose, title = "QR Code scannen" }: QRScannerProps) {
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isComponentMounted = true;

    const startScanner = async () => {
      try {
        // Initialize headless scanner
        html5QrCode = new Html5Qrcode("pro-max-scanner-container", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false
        } as any);

        // Config optimized for responsive mobile scanning
        const config = {
          fps: 10
        };

        await html5QrCode.start(
          { facingMode: "environment" }, // Automatically use rear camera
          config,
          (decodedText) => {
            if (isComponentMounted) {
              // Pause scanning immediately to prevent duplicate scans
              if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.pause();
              }
              onScan(decodedText);
            }
          },
          () => {
             // Ignore frame errors since it will fire constantly until code is found
          }
        );

        if (isComponentMounted) {
          setIsReady(true);
        }
      } catch (err: any) {
        if (isComponentMounted) {
          console.error("Camera Error:", err);
          setErrorStatus("Kamera konnte nicht gestartet werden. Bitte erlaube den Zugriff.");
        }
      }
    };

    startScanner();

    return () => {
      isComponentMounted = false;
      if (html5QrCode && html5QrCode.isScanning) {
        // Stop scanning when unmounting
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [onScan]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <div className="text-white font-black tracking-tight flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#10b981]" />
          {title}
        </div>
        <button 
          onClick={onClose} 
          className="w-12 h-12 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-full flex items-center justify-center text-white backdrop-blur-md border border-white/5"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera Viewport */}
      <div className="relative w-full max-w-sm aspect-square rounded-[40px] overflow-hidden bg-[#0c0c0c] border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        
        {/* Loading / Error State Wrapper */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0">
          {errorStatus ? (
            <div className="text-red-400 font-medium">
              <p className="mb-4">{errorStatus}</p>
              <button onClick={() => window.location.reload()} className="bg-red-500/20 text-red-500 font-bold px-6 py-3 rounded-2xl flex items-center gap-2 mx-auto hover:bg-red-500/30 transition">
                <RefreshCw className="w-4 h-4" /> Neuladen
              </button>
            </div>
          ) : !isReady ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#10b981] border-t-transparent animate-spin" />
              <p className="text-gray-400 font-bold tracking-widest text-[11px] uppercase animate-pulse">Kamera wird gestartet...</p>
            </div>
          ) : null}
        </div>

        {/* The actual video stream will be injected here by Html5Qrcode. Must be perfectly styled. */}
        <div 
          id="pro-max-scanner-container" 
          className="w-full h-full object-cover relative z-10 mix-blend-lighten [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>canvas]:hidden"
        ></div>

        {/* UI Overlay Frame (Only visible when ready) */}
        {isReady && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
             <div className="w-[250px] h-[250px] border-2 border-[#10b981]/50 rounded-3xl relative">
                {/* 4 Corner brackets */}
                <div className="absolute -top-[2px] -left-[2px] w-8 h-8 border-t-4 border-l-4 border-[#10b981] rounded-tl-3xl" />
                <div className="absolute -top-[2px] -right-[2px] w-8 h-8 border-t-4 border-r-4 border-[#10b981] rounded-tr-3xl" />
                <div className="absolute -bottom-[2px] -left-[2px] w-8 h-8 border-b-4 border-l-4 border-[#10b981] rounded-bl-3xl" />
                <div className="absolute -bottom-[2px] -right-[2px] w-8 h-8 border-b-4 border-r-4 border-[#10b981] rounded-br-3xl" />
                {/* Scanning line animation */}
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[#10b981] shadow-[0_0_10px_#10b981] motion-safe:animate-[scan_2s_ease-in-out_infinite]" style={{ animation: "scan 2s ease-in-out infinite alternate" }} />
             </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm font-medium px-8">
        Zentriere das Racket-QR im grünen Rahmen. Der Scan erfolgt automatisch.
      </div>
      
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes scan {
          0% { transform: translateY(-110px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110px); opacity: 0; }
        }
        /* Hide the annoying default html5-qrcode UI elements that get injected */
        #pro-max-scanner-container a { display: none !important; }
        #pro-max-scanner-container img { display: none !important; }
      `}} />
    </div>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}
