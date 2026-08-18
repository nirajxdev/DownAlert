import React from 'react';

interface SeparatorProps {
  label?: string;
  theme?: 'light' | 'dark';
}

export default function Separator({ label = 'SYS_ACTIVE', theme = 'light' }: SeparatorProps) {
  const isDark = theme === 'dark';
  
  return (
    <div className={`w-full flex items-center justify-center py-16 px-6 ${isDark ? 'bg-[#080D18]' : 'bg-[#F5F5F2]'}`}>
      <div className="w-full max-w-7xl flex items-center opacity-70">
        <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-current to-current ${isDark ? 'text-[#F5F5F2]/20' : 'text-[#080D18]/10'}`}></div>
        <div className={`px-4 flex items-center gap-2 font-mono text-[10px] tracking-widest ${isDark ? 'text-[#F5F5F2]/60' : 'text-[#080D18]/60'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#19B98A] animate-pulse"></span>
          {label}
        </div>
        <div className={`flex-1 h-px bg-gradient-to-l from-transparent via-current to-current ${isDark ? 'text-[#F5F5F2]/20' : 'text-[#080D18]/10'}`}></div>
      </div>
    </div>
  );
}
