"use client";

import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface Option {
  value: string;
  label: string;
}

interface NativeWheelSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

// Dies nutzt das native <select> Element.
// Auf iOS Safari öffnet sich dieses Element 100% nativ als das klassische Apple "Zahlenrad" (Spinner/Picker am unteren Bildschirmrand).
export function NativeWheelSelect({ value, onChange, options, placeholder, className }: NativeWheelSelectProps) {
  return (
    <div className={clsx("relative w-full font-sans", className)}>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full bg-[#161616] border border-white/5 hover:border-white/10 rounded-[20px] px-5 py-5 pr-12 text-white font-medium cursor-pointer transition-all shadow-lg focus:outline-none focus:border-[#10b981]"
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
