import React, { useRef } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import NetworkGraphic from './NetworkGraphic';
import HeroMonitor from './HeroMonitor';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onStartFree: () => void;
  onSeeHowItWorks: () => void;
}

export default function Hero({ onStartFree, onSeeHowItWorks }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const premiumEase = "cubic-bezier(0.16, 1, 0.3, 1)";

    // Typography and buttons stagger
    gsap.from('.hero-stagger', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
      },
      y: 60,
      opacity: 0,
      duration: 1.6,
      stagger: 0.15,
      ease: premiumEase,
      clearProps: 'all'
    });

    // Monitor interface reveal
    gsap.from('.hero-monitor-wrap', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
      },
      y: 100,
      opacity: 0,
      scale: 0.96,
      duration: 2,
      ease: premiumEase,
      delay: 0.2,
      clearProps: 'all'
    });

    // Architectural grid lines
    gsap.from('.arch-line-v', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
      },
      scaleY: 0,
      transformOrigin: 'top',
      duration: 2.5,
      ease: premiumEase,
      stagger: 0.2,
      delay: 0.4
    });

    gsap.from('.arch-line-h', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
      },
      scaleX: 0,
      transformOrigin: 'left',
      duration: 2.5,
      ease: premiumEase,
      stagger: 0.2,
      delay: 0.6
    });
    // Parallax background
    gsap.to('.hero-parallax-bg', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      y: 200,
      ease: "none"
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative min-h-[95vh] pt-32 pb-20 px-6 flex flex-col justify-center overflow-hidden bg-[#F5F5F2]">
      {/* Background radial grid */}
      <div className="absolute -inset-[200px] grid-bg opacity-40 pointer-events-none hero-parallax-bg"></div>

      {/* Decorative Architectural Lines */}
      <div className="absolute left-12 top-0 bottom-0 w-px bg-[#DDE1E7] arch-line-v opacity-60 hidden xl:block"></div>
      <div className="absolute right-12 top-0 bottom-0 w-px bg-[#DDE1E7] arch-line-v opacity-60 hidden xl:block"></div>
      <div className="absolute left-0 right-0 top-32 h-px bg-[#DDE1E7] arch-line-h opacity-60 hidden xl:block"></div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center relative z-10">
        
        {/* Left Column - Editorial Typography */}
        <div className="lg:col-span-6 flex flex-col items-start relative z-20">
          <div className="hero-stagger inline-flex items-center gap-2 px-3 py-1.5 border border-[#DDE1E7] bg-white shadow-sm font-mono text-[10px] tracking-widest text-[#080D18] mb-10">
            <span className="w-1.5 h-1.5 bg-[#19B98A] animate-pulse"></span>
            DOWNTIME ALERTS FOR SOLO BUILDERS
          </div>
          
          <h1 className="hero-stagger font-serif text-6xl md:text-8xl lg:text-[100px] text-[#080D18] leading-[0.9] tracking-tight mb-8">
            Know before <br />
            <span className="text-[#687386] italic font-light">they do.</span>
          </h1>
          
          <p className="hero-stagger font-sans text-lg md:text-xl text-[#687386] leading-relaxed max-w-md mb-12">
            Add your URL. DownAlert checks it around the clock and emails you
            the moment it goes down — and when it's back.
          </p>
          
          <div className="hero-stagger flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={onStartFree}
              className="w-full sm:w-auto bg-[#080D18] text-[#F5F5F2] px-8 py-4.5 font-mono text-sm tracking-wide hover:bg-[#4169FF] transition-colors duration-300 flex items-center justify-center gap-3 group"
            >
              START MONITORING FREE
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onSeeHowItWorks}
              className="w-full sm:w-auto px-8 py-4.5 font-mono text-sm tracking-wide text-[#080D18] bg-white border border-[#DDE1E7] hover:border-[#080D18] transition-colors duration-300 shadow-sm flex items-center justify-center gap-3"
            >
              SEE HOW IT WORKS
            </button>
          </div>
        </div>

        {/* Right Column - Purpose-built Monitor UI */}
        <div className="hero-monitor-wrap lg:col-span-6 h-[420px] lg:h-[540px] w-full relative z-20">
          <NetworkGraphic />
          
          {/* Architectural Framing around Monitor */}
          <div className="absolute -left-6 -right-6 top-16 h-px bg-[#DDE1E7] arch-line-h hidden md:block z-0"></div>
          <div className="absolute left-16 -top-6 -bottom-6 w-px bg-[#DDE1E7] arch-line-v hidden md:block z-0"></div>
          
          {/* Monitor Container */}
          <div className="absolute inset-0 bg-white p-2 border border-[#DDE1E7] shadow-[0_32px_64px_-16px_rgba(8,13,24,0.1)] z-10 group">
            <div className="w-full h-full relative overflow-hidden bg-[#080D18]">
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#4169FF]/10 blur-[60px] rounded-full pointer-events-none transition-opacity duration-1000 group-hover:bg-[#4169FF]/20"></div>
              
              <HeroMonitor />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={onSeeHowItWorks}>
        <span className="font-mono text-[10px] tracking-widest text-[#687386]">SCROLL</span>
        <ChevronDown className="w-4 h-4 text-[#687386] animate-bounce" />
      </div>
    </section>
  );
}
