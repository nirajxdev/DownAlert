import React, { useRef } from 'react';
import { Check } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface PricingProps {
  onSelectFree: () => void;
  onSelectPro: () => void;
}

export default function Pricing({ onSelectFree, onSelectPro }: PricingProps) {
  const containerRef = useRef<HTMLElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const scanTween = useRef<gsap.core.Tween | null>(null);

  useGSAP(() => {
    const premiumEase = "cubic-bezier(0.16, 1, 0.3, 1)";
    
    gsap.from('.pricing-header > *', {
      scrollTrigger: {
        trigger: '.pricing-header',
        start: "top 80%",
      },
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: premiumEase
    });

    gsap.from('.pricing-tier', {
      scrollTrigger: {
        trigger: '.pricing-grid',
        start: "top 80%",
      },
      y: 60,
      opacity: 0,
      duration: 1.4,
      stagger: 0.2,
      ease: premiumEase
    });

    if (scanRef.current) {
      scanTween.current = gsap.to(scanRef.current, {
        rotation: 360,
        duration: 4,
        repeat: -1,
        ease: "none"
      });
    }

    // Heartbeat pulse for Free plan status indicator
    gsap.to('.heartbeat-dot', {
      scale: 2.2,
      opacity: 0,
      duration: 1.5,
      repeat: -1,
      ease: "power2.out"
    });
  }, { scope: containerRef });

  const handleProHover = () => {
    if (scanTween.current) {
      gsap.to(scanTween.current, { timeScale: 4, duration: 0.4, ease: "power2.inOut" });
    }
  };

  const handleProLeave = () => {
    if (scanTween.current) {
      gsap.to(scanTween.current, { timeScale: 1, duration: 0.8, ease: "power2.out" });
    }
  };

  return (
    <section id="pricing" ref={containerRef} className="py-20 md:py-32 px-4 sm:px-6 bg-[#F5F5F2]">
      <div className="max-w-7xl mx-auto">
        <div className="pricing-header text-center mb-16 md:mb-24">
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#080D18] leading-[1.1] tracking-tight mb-4 md:mb-6">
            Priced for scale.<br />
            <span className="italic text-[#687386]">Built for certainty.</span>
          </h2>
          <p className="font-sans text-[#687386] text-base sm:text-lg max-w-xl mx-auto px-4">
            Predictable infrastructure overhead. Zero hidden capacity limits.
          </p>
        </div>

        <div className="pricing-grid grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          
          {/* Hobby Tier */}
          <div className="pricing-tier bg-[#FFFFFF] border border-[#DDE1E7] p-6 sm:p-8 md:p-10 flex flex-col hover:shadow-premium transition-shadow duration-500">
            <div className="mb-6 md:mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#19B98A] relative z-10"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#19B98A] absolute inset-0 heartbeat-dot opacity-80"></div>
                </div>
                <h3 className="font-mono text-base md:text-lg text-[#080D18] tracking-wide">DEVELOPER</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-serif text-[#080D18]">$0</span>
                <span className="text-[#687386] font-mono text-xs md:text-sm">/mo</span>
              </div>
              <p className="text-[#687386] mt-3 md:mt-4 font-sans text-xs md:text-sm">
                For independent operators requiring baseline telemetry.
              </p>
            </div>
            
            <div className="flex-1 space-y-3 md:space-y-4 mb-8 md:mb-10">
              {['1 Monitor', '5-minute check intervals', 'Email alerts', '7-day data retention', 'Standard support'].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-[#19B98A] shrink-0 mt-0.5" />
                  <span className="font-sans text-sm md:text-base text-[#080D18]">{feature}</span>
                </div>
              ))}
            </div>
            
            <button 
              onClick={onSelectFree}
              className="w-full py-3 md:py-4 border border-[#080D18] text-[#080D18] font-mono text-sm md:text-base tracking-wide hover:bg-[#080D18] hover:text-[#F5F5F2] transition-colors"
            >
              START FREE
            </button>
          </div>

          {/* Production Tier */}
          <div 
            className="pricing-tier relative bg-[#191C24] flex flex-col shadow-premium group overflow-hidden p-[1px]"
            onMouseEnter={handleProHover}
            onMouseLeave={handleProLeave}
          >
            
            {/* GSAP Animated Scan Border */}
            <div 
              ref={scanRef}
              className="absolute w-[250%] h-[250%] top-[-75%] left-[-75%] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0%, transparent 75%, rgba(65, 105, 255, 0.4) 90%, rgba(255, 255, 255, 0.9) 100%)'
              }}
            ></div>
            
            {/* Inner Content Wrapper */}
            <div className="relative z-10 bg-[#080D18] p-6 sm:p-8 md:p-10 flex flex-col flex-1 h-full overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern-dark opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-1000"></div>
              
              <div className="relative z-10 mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-3 md:mb-2">
                  <h3 className="font-mono text-base md:text-lg text-[#F5F5F2] tracking-wide">PRODUCTION</h3>
                  <span className="bg-[#4169FF] text-white px-2 py-1 md:px-3 font-mono text-[9px] md:text-[10px] tracking-widest inline-block">RECOMMENDED</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-serif text-[#F5F5F2]">$29</span>
                  <span className="text-[#687386] font-mono text-xs md:text-sm">/mo</span>
                </div>
                <p className="text-[#687386] mt-3 md:mt-4 font-sans text-xs md:text-sm">
                  Mission-critical infrastructure monitoring for high-velocity teams.
                </p>
              </div>
              
              <div className="relative z-10 flex-1 space-y-3 md:space-y-4 mb-8 md:mb-10">
                {['5 Monitors', '1-minute check intervals', 'Email alerts', 'Custom Status Pages (soon)', '1-year data retention', 'Priority support'].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 md:w-5 md:h-5 text-[#19B98A] shrink-0 mt-0.5" />
                    <span className="font-sans text-sm md:text-base text-[#F5F5F2]">{feature}</span>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={onSelectPro}
                className="relative z-10 w-full py-3 md:py-4 bg-[#4169FF] text-white font-mono text-sm md:text-base tracking-wide hover:bg-white hover:text-[#080D18] transition-colors"
              >
                UPGRADE TO PRO
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
