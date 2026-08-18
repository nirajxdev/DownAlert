import React, { useState, useEffect } from 'react';
import { ArrowRight, LogIn } from 'lucide-react';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenDocs: () => void;
  onOpenEnterprise: () => void;
}

export default function Navbar({ onOpenLogin, onOpenSignup, onOpenDocs, onOpenEnterprise }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#F5F5F2]/80 backdrop-blur-md border-b border-[#DDE1E7] py-0 h-16' 
          : 'bg-transparent border-b border-transparent py-2 h-20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-[#080D18] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#19B98A] animate-pulse"></div>
          </div>
          <span className="font-serif text-2xl tracking-wide font-medium text-[#080D18] translate-y-px">
            DownAlert
          </span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-mono tracking-tight text-[#687386] hover:text-[#080D18] transition-colors"
          >
            01. FEATURES
          </button>
          <button 
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-mono tracking-tight text-[#687386] hover:text-[#080D18] transition-colors"
          >
            02. ARCHITECTURE
          </button>
          <button 
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-mono tracking-tight text-[#687386] hover:text-[#080D18] transition-colors"
          >
            03. PRICING
          </button>
          <button 
            onClick={onOpenEnterprise}
            className="text-sm font-mono tracking-tight text-[#687386] hover:text-[#080D18] transition-colors"
          >
            04. ENTERPRISE
          </button>
        </div>

        {/* Auth CTA */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenLogin}
            className="hidden sm:flex text-sm font-mono tracking-tight text-[#080D18] hover:opacity-70 transition-opacity items-center gap-2"
          >
            <LogIn className="w-4 h-4" /> LOGIN
          </button>
          <button 
            onClick={onOpenSignup}
            className="bg-[#080D18] text-[#F5F5F2] px-5 py-2.5 text-sm font-mono tracking-wide hover:bg-[#4169FF] transition-colors flex items-center gap-2 group"
          >
            START FREE
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </nav>
  );
}
