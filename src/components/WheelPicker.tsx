"use client";

import { useRef, useEffect, useState } from "react";
import clsx from "clsx";

interface Option {
  value: string;
  label: string;
}

interface WheelPickerProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  className?: string; // Optional wrapper class
}

export function WheelPicker({ value, onChange, options, className }: WheelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const ITEM_HEIGHT = 48; // px
  const VISIBLE_ITEMS = 3;
  const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

  useEffect(() => {
    // Scroll automatically to selected value on mount
    if (containerRef.current) {
      const idx = options.findIndex((o) => o.value === value);
      if (idx !== -1) {
        containerRef.current.scrollTop = idx * ITEM_HEIGHT;
      }
    }
  }, []); // Run only once

  const handleScroll = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    
    // Smooth, debounced tracking of the central item based on scroll position
    scrollTimeout.current = setTimeout(() => {
      if (containerRef.current) {
        const y = containerRef.current.scrollTop;
        const index = Math.round(y / ITEM_HEIGHT);
        
        // Safety bound checks
        if (index >= 0 && index < options.length) {
          if (options[index].value !== value) {
            onChange(options[index].value);
          }
        }
      }
    }, 150);
  };

  return (
    <div className={clsx("relative w-full bg-[#161616] border border-white/5 hover:border-white/10 rounded-[20px] overflow-hidden shadow-inner", className)}>
      
      {/* The green central selection highlight box */}
      <div 
        className="absolute w-full pointer-events-none border-y border-[#10b981]/30 bg-[#10b981]/5 z-10"
        style={{ height: ITEM_HEIGHT, top: "50%", transform: "translateY(-50%)" }}
      />
      
      {/* Scrollable list via CSS Snapping */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-y-scroll snap-y snap-mandatory relative w-full scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ height: CONTAINER_HEIGHT }}
      >
        {/* Dynamic Empty Pad to ensure first item can reach the exact center */}
        <div style={{ height: ITEM_HEIGHT }} />
        
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <div 
              key={opt.value} 
              className={clsx(
                "flex items-center justify-center font-bold transition-all duration-300 snap-center select-none",
                isSelected ? "text-[#10b981] text-xl" : "text-gray-500 text-sm"
              )}
              style={{ height: ITEM_HEIGHT }}
              onClick={() => {
                // Allow tapping an item to instantly snap to it
                const idx = options.findIndex((o) => o.value === opt.value);
                if (containerRef.current && idx !== -1) {
                  containerRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
                }
              }}
            >
              {opt.label}
            </div>
          );
        })}
        
        {/* Dynamic Empty Pad to ensure last item can reach the exact center */}
        <div style={{ height: ITEM_HEIGHT }} />
      </div>

      {/* Fade overlay for 3D effect */}
      <div className="absolute top-0 left-0 w-full h-[40px] bg-gradient-to-b from-[#161616] to-transparent pointer-events-none z-20" />
      <div className="absolute bottom-0 left-0 w-full h-[40px] bg-gradient-to-t from-[#161616] to-transparent pointer-events-none z-20" />
    </div>
  );
}
