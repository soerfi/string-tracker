"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface Option {
  value: string;
  label: string;
  isSpecial?: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = "Auswählen..." }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative w-full font-sans" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full bg-[#161616] border rounded-[20px] px-5 py-5 text-white font-medium flex items-center justify-between cursor-pointer transition-all shadow-lg",
          isOpen ? "border-[#10b981]" : "border-white/5 hover:border-white/10"
        )}
      >
        <span className={clsx(!selectedOption && "text-gray-500", selectedOption?.isSpecial && "text-[#10b981] font-bold")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={clsx("w-5 h-5 text-gray-400 transition-transform duration-300", isOpen && "rotate-180 text-[#10b981]")} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-[#161616] border border-white/10 p-2 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-1"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "px-4 py-3.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors",
                    isSelected ? "bg-[#10b981]/10 text-[#10b981] font-bold" : "hover:bg-white/5 text-gray-200",
                    opt.isSpecial && !isSelected && "text-[#10b981] font-bold hover:bg-[#10b981]/10"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#10b981]" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
