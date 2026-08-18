import React, { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface FinalCTAProps {
  onStartFree: () => void;
}

export default function FinalCTA({ onStartFree }: FinalCTAProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const premiumEase = "cubic-bezier(0.16, 1, 0.3, 1)";
    
    gsap.from('.cta-content > *', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 75%",
      },
      y: 50,
      opacity: 0,
      duration: 1.4,
      stagger: 0.15,
      ease: premiumEase
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-[#080D18] pt-32 pb-16 px-6 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-20 pointer-events-none" />

      <div className="cta-content max-w-4xl mx-auto relative z-10 text-center">
        <h2 className="font-serif text-6xl md:text-8xl text-[#F5F5F2] leading-[0.95] tracking-tight mb-8">
          The network <br />
          <span className="italic text-[#687386]">is waiting.</span>
        </h2>
        
        <p className="font-sans text-lg md:text-xl text-[#687386] max-w-lg mx-auto mb-12">
          Cease relying on customer complaints as your primary alerting mechanism. Deploy a globally distributed probing cluster in under 60 seconds.
        </p>

        <button
          onClick={onStartFree}
          className="bg-[#4169FF] text-white px-8 py-4 font-mono text-sm tracking-wide hover:bg-white hover:text-[#080D18] transition-colors inline-flex items-center justify-center gap-3 group"
        >
          INITIALIZE SETUP
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}
