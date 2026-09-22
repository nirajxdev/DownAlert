import React, { useState, useRef } from 'react';
import { ArrowRight, Server, Activity, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface HowItWorksProps {
  onAddMonitorClick: (url: string) => void;
}

export default function HowItWorks({ onAddMonitorClick }: HowItWorksProps) {
  const [url, setUrl] = useState('');
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const premiumEase = "cubic-bezier(0.16, 1, 0.3, 1)";

    // Header animation
    gsap.from('.hiw-header > *', {
      scrollTrigger: {
        trigger: '.hiw-header',
        start: "top 80%",
      },
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: premiumEase
    });

    // Timeline line (draws as you scroll)
    gsap.from('.hiw-line', {
      scrollTrigger: {
        trigger: '.hiw-line-container',
        start: "top 70%",
        end: "bottom 40%",
        scrub: 1.5,
      },
      scaleY: 0,
      transformOrigin: "top",
      ease: "none"
    });

    // Individual steps
    const steps = gsap.utils.toArray('.hiw-step');
    steps.forEach((step: any, i) => {
      const num = step.querySelector('.hiw-num');
      const content = step.querySelector('.hiw-content');
      const icon = step.querySelector('.hiw-icon');
      const terminal = step.querySelector('.hiw-terminal');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: step,
          start: "top 75%",
        }
      });

      tl.from(icon, { scale: 0, opacity: 0, duration: 0.8, ease: "back.out(1.5)" })
        .from(num, { x: i % 2 === 0 ? 40 : -40, opacity: 0, duration: 1.2, ease: premiumEase }, "-=0.6")
        .from(content, { y: 30, opacity: 0, duration: 1.2, ease: premiumEase }, "-=1")
        .from(terminal, { x: i % 2 === 0 ? -40 : 40, opacity: 0, duration: 1.2, ease: premiumEase }, "-=1");
    });
    
    // CTA form
    gsap.from('.hiw-cta', {
      scrollTrigger: {
        trigger: '.hiw-cta',
        start: "top 85%",
      },
      y: 40,
      opacity: 0,
      duration: 1.2,
      ease: premiumEase
    });

    // Parallax background
    gsap.to('.hiw-parallax-bg', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      },
      y: 200,
      ease: "none"
    });

  }, { scope: containerRef });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      // No fake probe here — signup creates your account, then the
      // dashboard runs a real check against the backend.
      onAddMonitorClick(url.trim());
      setUrl('');
    }
  };

  return (
    <section id="how-it-works" ref={containerRef} className="py-32 px-6 bg-[#080D18] text-[#F5F5F2] relative overflow-hidden">
      {/* Dark background grid */}
      <div className="absolute -inset-[200px] bg-grid-pattern-dark opacity-30 pointer-events-none hiw-parallax-bg"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Editorial Section Header */}
        <div className="hiw-header flex flex-col md:flex-row justify-between items-end mb-32 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F5F2]/10 font-mono text-[10px] tracking-widest mb-6">
              <span className="w-1.5 h-1.5 bg-[#4169FF]"></span>
              HOW IT WORKS
            </div>
            <h2 className="font-serif text-5xl md:text-6xl leading-[1.1] tracking-tight">
              Your site goes down. <br />
              <span className="italic text-[#687386]">You know first.</span>
            </h2>
          </div>
          <p className="font-sans text-[#687386] max-w-sm text-lg">
            Add a URL, we check it on a schedule, and email you on every status change. No SDK, no DevOps setup.
          </p>
        </div>

        {/* Continuous Timeline */}
        <div className="hiw-line-container relative">
          {/* Timeline Line */}
          <div className="absolute left-[27px] md:left-[50%] top-0 bottom-0 w-px bg-[#F5F5F2]/5 md:-translate-x-1/2"></div>
          <div className="hiw-line absolute left-[27px] md:left-[50%] top-0 bottom-0 w-px bg-[#4169FF] md:-translate-x-1/2 z-0"></div>
          
          <div className="space-y-32">
            
            {/* Step 1 */}
            <div className="hiw-step relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group">
              <div className="hiw-content md:w-1/2 md:pr-16 md:text-right flex flex-col md:items-end z-20">
                <span className="hiw-num font-mono text-[120px] leading-none text-[#F5F5F2]/5 font-bold absolute -top-16 md:right-12 pointer-events-none">01</span>
                <h3 className="font-mono text-xl tracking-wide mb-3 relative z-10">ADD YOUR URL</h3>
                <p className="text-[#687386] font-sans relative z-10 max-w-sm">
                  Paste your website or API endpoint. We validate it and start
                  scheduled checks within minutes — one monitor on Free, up to five on Pro.
                </p>
              </div>
              
              <div className="hiw-icon absolute left-0 md:left-1/2 w-14 h-14 bg-[#080D18] border border-[#F5F5F2]/20 flex items-center justify-center z-20 md:-translate-x-1/2 group-hover:border-[#4169FF] transition-colors shadow-[0_0_20px_rgba(8,13,24,1)]">
                <Activity className="w-5 h-5 text-[#F5F5F2]" />
              </div>
              
              <div className="hiw-terminal md:w-1/2 md:pl-16 pl-20 z-20">
                <div className="p-6 bg-[#F5F5F2]/5 border border-[#F5F5F2]/10 font-mono text-sm text-[#19B98A] backdrop-blur-sm">
                  &gt; URL VALIDATED ... OK<br/>
                  &gt; FIRST CHECK SCHEDULED ... 5-MIN<br/>
                  &gt; DASHBOARD ... LIVE
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="hiw-step relative flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-8 group">
              <div className="hiw-content md:w-1/2 md:pl-16 flex flex-col z-20">
                <span className="hiw-num font-mono text-[120px] leading-none text-[#F5F5F2]/5 font-bold absolute -top-16 md:left-12 pointer-events-none">02</span>
                <h3 className="font-mono text-xl tracking-wide mb-3 relative z-10">WE CHECK ON SCHEDULE</h3>
                <p className="text-[#687386] font-sans relative z-10 max-w-sm">
                  Every 5 minutes on Free, every minute on Pro. A check counts as
                  UP when your site answers with a status under 400 — response time and history are saved to your dashboard.
                </p>
              </div>
              
              <div className="hiw-icon absolute left-0 md:left-1/2 w-14 h-14 bg-[#080D18] border border-[#F5F5F2]/20 flex items-center justify-center z-20 md:-translate-x-1/2 group-hover:border-[#EF5757] transition-colors shadow-[0_0_20px_rgba(8,13,24,1)]">
                <Server className="w-5 h-5 text-[#F5F5F2]" />
              </div>
              
              <div className="hiw-terminal md:w-1/2 md:pr-16 pl-20 md:pl-0 z-20">
                <div className="p-6 bg-[#F5F5F2]/5 border border-[#F5F5F2]/10 font-mono text-sm backdrop-blur-sm">
                  <div className="flex justify-between text-[#19B98A] mb-2">
                    <span>LAST CHECK</span><span>200 OK · 182MS</span>
                  </div>
                  <div className="flex justify-between text-[#F5F5F2]/80 mb-2">
                    <span>INTERVAL</span><span>5-MIN (FREE)</span>
                  </div>
                  <div className="flex justify-between text-[#F5F5F2]/80">
                    <span>UPTIME (50 CHECKS)</span><span>100.00%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="hiw-step relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group">
              <div className="hiw-content md:w-1/2 md:pr-16 md:text-right flex flex-col md:items-end z-20">
                <span className="hiw-num font-mono text-[120px] leading-none text-[#F5F5F2]/5 font-bold absolute -top-16 md:right-12 pointer-events-none">03</span>
                <h3 className="font-mono text-xl tracking-wide mb-3 relative z-10">EMAIL WHEN IT'S DOWN</h3>
                <p className="text-[#687386] font-sans relative z-10 max-w-sm">
                  After 2 consecutive failed checks we send a plain-language DOWN
                  email — and another one when your site recovers. No noise, no jargon.
                </p>
              </div>
              
              <div className="hiw-icon absolute left-0 md:left-1/2 w-14 h-14 bg-[#080D18] border border-[#F5F5F2]/20 flex items-center justify-center z-20 md:-translate-x-1/2 group-hover:border-[#19B98A] transition-colors shadow-[0_0_20px_rgba(8,13,24,1)]">
                <AlertTriangle className="w-5 h-5 text-[#F5F5F2]" />
              </div>
              
              <div className="hiw-terminal md:w-1/2 md:pl-16 pl-20 z-20">
                <div className="p-6 bg-[#F5F5F2]/5 border border-[#F5F5F2]/10 flex flex-col gap-3 backdrop-blur-sm">
                  <div className="bg-[#EF5757]/10 text-[#EF5757] border border-[#EF5757]/20 p-3 font-mono text-xs flex justify-between">
                    <span>YOUR-SITE IS DOWN</span>
                    <span>EMAIL SENT</span>
                  </div>
                  <div className="bg-[#19B98A]/10 text-[#19B98A] border border-[#19B98A]/20 p-3 font-mono text-xs flex justify-between">
                    <span>YOUR-SITE RECOVERED</span>
                    <span>EMAIL SENT</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Interactive Interactive CTA */}
        <div className="hiw-cta mt-40 p-px bg-gradient-to-br from-[#4169FF]/50 via-[#DDE1E7]/10 to-[#687386]/20 max-w-2xl mx-auto shadow-2xl">
          <div className="bg-[#080D18] p-8 md:p-12 text-center">
            <h3 className="font-serif text-3xl mb-4">Add your first monitor — free.</h3>
            <p className="text-[#687386] mb-8 font-sans">Enter your URL. We'll take you to signup, then run a real check right away.</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input 
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com"
                  className="w-full bg-[#F5F5F2]/5 border border-[#F5F5F2]/20 px-4 py-3 pr-10 font-mono text-sm text-[#F5F5F2] placeholder-[#687386] focus:outline-none focus:border-[#4169FF] transition-colors disabled:opacity-50"
                />
              </div>
              <button 
                type="submit"
                className="bg-[#F5F5F2] text-[#080D18] px-6 py-3 font-mono text-sm tracking-wide hover:bg-[#4169FF] hover:text-white transition-colors flex items-center justify-center gap-2 min-w-[140px]"
              >
                GET STARTED
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>
  );
}
