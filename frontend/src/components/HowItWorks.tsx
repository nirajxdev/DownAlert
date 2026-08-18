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
  const [isVerifying, setIsVerifying] = useState(false);
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
    if (url && !isVerifying) {
      setIsVerifying(true);
      
      // Simulate network connection/validation check
      setTimeout(() => {
        setIsVerifying(false);
        onAddMonitorClick(url);
        setUrl('');
      }, 1500);
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
              ARCHITECTURE
            </div>
            <h2 className="font-serif text-5xl md:text-6xl leading-[1.1] tracking-tight">
              From failure to <br />
              <span className="italic text-[#687386]">resolution.</span>
            </h2>
          </div>
          <p className="font-sans text-[#687386] max-w-sm text-lg">
            A deterministic routing pipeline ensuring you never miss a critical incident, architected from the ground up with zero single points of failure.
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
                <h3 className="font-mono text-xl tracking-wide mb-3 relative z-10">EDGE-NATIVE PROBING</h3>
                <p className="text-[#687386] font-sans relative z-10 max-w-sm">
                  Every 30 seconds, 142 edge nodes simultaneously ping your endpoints. 
                  We measure DNS resolution, TCP connection latency, TLS handshakes, and TTFB with sub-millisecond precision.
                </p>
              </div>
              
              <div className="hiw-icon absolute left-0 md:left-1/2 w-14 h-14 bg-[#080D18] border border-[#F5F5F2]/20 flex items-center justify-center z-20 md:-translate-x-1/2 group-hover:border-[#4169FF] transition-colors shadow-[0_0_20px_rgba(8,13,24,1)]">
                <Activity className="w-5 h-5 text-[#F5F5F2]" />
              </div>
              
              <div className="hiw-terminal md:w-1/2 md:pl-16 pl-20 z-20">
                <div className="p-6 bg-[#F5F5F2]/5 border border-[#F5F5F2]/10 font-mono text-sm text-[#19B98A] backdrop-blur-sm">
                  &gt; TCP CONNECTION ... OK (12ms)<br/>
                  &gt; TLS HANDSHAKE ... OK (24ms)<br/>
                  &gt; HTTP GET /api/v1/health ... 200 OK
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="hiw-step relative flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-8 group">
              <div className="hiw-content md:w-1/2 md:pl-16 flex flex-col z-20">
                <span className="hiw-num font-mono text-[120px] leading-none text-[#F5F5F2]/5 font-bold absolute -top-16 md:left-12 pointer-events-none">02</span>
                <h3 className="font-mono text-xl tracking-wide mb-3 relative z-10">CONSENSUS ENGINE</h3>
                <p className="text-[#687386] font-sans relative z-10 max-w-sm">
                  A localized routing failure isn't an outage. Our Byzantine fault-tolerant consensus engine requires 3+ geographically distributed nodes to mathematically confirm failure before triggering an alert.
                </p>
              </div>
              
              <div className="hiw-icon absolute left-0 md:left-1/2 w-14 h-14 bg-[#080D18] border border-[#F5F5F2]/20 flex items-center justify-center z-20 md:-translate-x-1/2 group-hover:border-[#EF5757] transition-colors shadow-[0_0_20px_rgba(8,13,24,1)]">
                <Server className="w-5 h-5 text-[#F5F5F2]" />
              </div>
              
              <div className="hiw-terminal md:w-1/2 md:pr-16 pl-20 md:pl-0 z-20">
                <div className="p-6 bg-[#F5F5F2]/5 border border-[#F5F5F2]/10 font-mono text-sm backdrop-blur-sm">
                  <div className="flex justify-between text-[#EF5757] mb-2">
                    <span>NODE: US-EAST-1</span><span>ERR_TIMEOUT</span>
                  </div>
                  <div className="flex justify-between text-[#EF5757] mb-2">
                    <span>NODE: EU-WEST-1</span><span>ERR_TIMEOUT</span>
                  </div>
                  <div className="flex justify-between text-[#EF5757]">
                    <span>NODE: AP-SOUTH-1</span><span>ERR_TIMEOUT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="hiw-step relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group">
              <div className="hiw-content md:w-1/2 md:pr-16 md:text-right flex flex-col md:items-end z-20">
                <span className="hiw-num font-mono text-[120px] leading-none text-[#F5F5F2]/5 font-bold absolute -top-16 md:right-12 pointer-events-none">03</span>
                <h3 className="font-mono text-xl tracking-wide mb-3 relative z-10">INCIDENT ESCALATION</h3>
                <p className="text-[#687386] font-sans relative z-10 max-w-sm">
                  Instantaneous multi-channel routing. We map the affected service to your on-call 
                  schedules and dispatch alerts via SMS, Slack, PagerDuty, and custom Webhooks.
                </p>
              </div>
              
              <div className="hiw-icon absolute left-0 md:left-1/2 w-14 h-14 bg-[#080D18] border border-[#F5F5F2]/20 flex items-center justify-center z-20 md:-translate-x-1/2 group-hover:border-[#19B98A] transition-colors shadow-[0_0_20px_rgba(8,13,24,1)]">
                <AlertTriangle className="w-5 h-5 text-[#F5F5F2]" />
              </div>
              
              <div className="hiw-terminal md:w-1/2 md:pl-16 pl-20 z-20">
                <div className="p-6 bg-[#F5F5F2]/5 border border-[#F5F5F2]/10 flex flex-col gap-3 backdrop-blur-sm">
                  <div className="bg-[#EF5757]/10 text-[#EF5757] border border-[#EF5757]/20 p-3 font-mono text-xs flex justify-between">
                    <span>SEV-1 OUTAGE</span>
                    <span>PAGERDUTY DISPATCHED</span>
                  </div>
                  <div className="bg-[#4169FF]/10 text-[#4169FF] border border-[#4169FF]/20 p-3 font-mono text-xs flex justify-between">
                    <span>SLACK #ALERTS</span>
                    <span>MESSAGE SENT</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Interactive Interactive CTA */}
        <div className="hiw-cta mt-40 p-px bg-gradient-to-br from-[#4169FF]/50 via-[#DDE1E7]/10 to-[#687386]/20 max-w-2xl mx-auto shadow-2xl">
          <div className="bg-[#080D18] p-8 md:p-12 text-center">
            <h3 className="font-serif text-3xl mb-4">Initialize a test probe.</h3>
            <p className="text-[#687386] mb-8 font-sans">Enter an endpoint. We'll run a diagnostic check right now.</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input 
                  type="url"
                  required
                  disabled={isVerifying}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.yourcompany.com"
                  className="w-full bg-[#F5F5F2]/5 border border-[#F5F5F2]/20 px-4 py-3 pr-10 font-mono text-sm text-[#F5F5F2] placeholder-[#687386] focus:outline-none focus:border-[#4169FF] transition-colors disabled:opacity-50"
                />
                {isVerifying && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Activity className="w-4 h-4 text-[#4169FF] animate-spin" />
                  </div>
                )}
              </div>
              <button 
                type="submit"
                disabled={isVerifying}
                className="bg-[#F5F5F2] text-[#080D18] px-6 py-3 font-mono text-sm tracking-wide hover:bg-[#4169FF] hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
              >
                {isVerifying ? 'TESTING' : 'TEST'}
                {!isVerifying && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>
  );
}
