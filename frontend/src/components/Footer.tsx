import React, { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Activity, Mail, ArrowRight } from 'lucide-react';

interface FooterProps {
  onOpenContent: (pageId: string) => void;
}

const FooterLink = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
  <li>
    <button onClick={onClick} className="group relative inline-block text-[13px] sm:text-sm text-[#F5F5F2]/70 hover:text-white transition-colors text-left py-1">
      <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1 block">{children}</span>
      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#4169FF] group-hover:w-full transition-all duration-300 ease-out"></span>
    </button>
  </li>
);

export default function Footer({ onOpenContent }: FooterProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<'Operational' | 'Maintenance'>('Operational');

  // Toggle status for demonstration purposes
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => prev === 'Operational' ? 'Maintenance' : 'Operational');
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useGSAP(() => {
    gsap.from('.footer-fade-up', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });
  }, { scope: containerRef });

  return (
    <footer ref={containerRef} className="bg-[#080D18] text-[#F5F5F2] pt-24 pb-0 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Middle Section (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16 footer-fade-up">
          
          {/* Col 1: Branding & Newsletter */}
          <div className="lg:col-span-4 lg:pr-8">
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2 text-white font-sans font-bold tracking-tight text-xl">
                 <Activity className="w-6 h-6 text-[#4169FF]" />
                 DownAlert
               </div>
             </div>
             
             <p className="text-[#F5F5F2]/70 text-sm mb-8 leading-relaxed">
               Mission-critical infrastructure monitoring built for the edge. We deliver sub-second resolution and zero-trust security to ensure your APIs never go dark unnoticed.
             </p>
             
             {/* Newsletter Subscription */}
             <div className="mt-8 bg-[#0D1117]/50 border border-[#F5F5F2]/10 rounded-lg p-5">
               <div className="flex items-center gap-2 mb-3">
                 <Mail className="w-4 h-4 text-[#4169FF]" />
                 <h4 className="text-sm font-sans font-semibold text-white tracking-wide">Uptime Engineering Tips</h4>
               </div>
               <p className="text-xs text-[#F5F5F2]/50 mb-4 leading-relaxed">
                 Join 12,000+ SREs receiving our weekly deep-dives on system reliability and architecture.
               </p>
               <form className="flex" onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); }}>
                 <input 
                   type="email" 
                   required
                   placeholder="Enter your work email" 
                   className="bg-[#04060A] border border-[#F5F5F2]/10 text-[#F5F5F2] px-3 py-2 text-sm rounded-l-md w-full focus:outline-none focus:border-[#4169FF] transition-colors placeholder-[#F5F5F2]/30" 
                 />
                 <button 
                   type="submit"
                   className="bg-[#4169FF] hover:bg-[#3154CC] text-white px-3 py-2 text-sm rounded-r-md transition-colors flex items-center justify-center border border-[#4169FF]"
                 >
                   <ArrowRight className="w-4 h-4" />
                 </button>
               </form>
             </div>
          </div>

          {/* Col 2: Product */}
          <div className="lg:col-span-3 lg:col-start-6">
            <h4 className="text-sm font-sans font-semibold text-white tracking-wide mb-6">Product</h4>
            <ul className="space-y-3">
              <FooterLink onClick={() => onOpenContent('edge')}>Global Edge Network</FooterLink>
              <FooterLink onClick={() => onOpenContent('probing')}>High-Frequency Probing</FooterLink>
              <FooterLink onClick={() => onOpenContent('security')}>Zero-Trust Security</FooterLink>
              <FooterLink onClick={() => onOpenContent('sales')}>Enterprise SLA</FooterLink>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-sans font-semibold text-white tracking-wide mb-6">Company</h4>
            <ul className="space-y-3">
              <FooterLink onClick={() => onOpenContent('about')}>About DownAlert</FooterLink>
              <FooterLink onClick={() => onOpenContent('customers')}>Case Studies</FooterLink>
              <FooterLink onClick={() => onOpenContent('api')}>API Documentation</FooterLink>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-sans font-semibold text-white tracking-wide mb-6">Legal</h4>
            <ul className="space-y-3">
              <FooterLink onClick={() => onOpenContent('terms')}>Terms of Service</FooterLink>
              <FooterLink onClick={() => onOpenContent('privacy')}>Privacy Policy</FooterLink>
              <FooterLink onClick={() => onOpenContent('privacy')}>Cookie Policy</FooterLink>
            </ul>
          </div>

        </div>

        {/* Subtle Divider */}
        <div className="w-full h-px bg-[#F5F5F2]/10 mb-10 footer-fade-up"></div>

        {/* Socials & Status Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 footer-fade-up">
          <div className="flex flex-wrap gap-2.5">
            {['X.COM', 'LINKEDIN', 'GITHUB', 'DISCORD', 'STATUS PAGE', 'NPM'].map((social) => (
              <a key={social} href="#" className="border border-[#F5F5F2]/30 rounded-full px-4 py-1.5 text-[10px] sm:text-xs font-sans font-medium text-[#F5F5F2] hover:bg-[#F5F5F2] hover:text-[#080D18] transition-all duration-300">
                {social}
              </a>
            ))}
          </div>
          
          {/* Dynamic Status Badge */}
          <div className="flex items-center gap-3 bg-[#0D1117] border border-[#F5F5F2]/10 px-4 py-2 rounded-full shadow-inner">
            <div className="relative flex items-center justify-center w-3 h-3">
              <div className={`absolute w-full h-full rounded-full opacity-50 ${status === 'Operational' ? 'bg-[#3FB950] animate-ping' : 'bg-[#D29922] animate-pulse'}`}></div>
              <div className={`relative w-2 h-2 rounded-full ${status === 'Operational' ? 'bg-[#3FB950]' : 'bg-[#D29922]'}`}></div>
            </div>
            <span className={`text-xs font-mono tracking-wide ${status === 'Operational' ? 'text-[#3FB950]' : 'text-[#D29922]'}`}>
              {status === 'Operational' ? 'All Systems Operational' : 'Scheduled Maintenance'}
            </span>
          </div>
        </div>

        {/* Legal Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 footer-fade-up text-xs text-[#F5F5F2]/50 font-sans">
          <p>© {new Date().getFullYear()} DownAlert Systems Inc. | All rights reserved.</p>
          <p>Lucknow, Uttar Pradesh, India</p>
        </div>
      </div>

      {/* Massive Bottom Text */}
      <div className="w-full overflow-hidden flex justify-center mt-12 pointer-events-none select-none relative h-[25vw] min-h-[150px]">
        <h1 
          className="absolute top-0 text-[24vw] leading-[0.75] font-sans font-black tracking-tighter text-center bg-clip-text text-transparent bg-gradient-to-b from-[#F5F5F2]/15 to-[#080D18]"
        >
          downalert
        </h1>
      </div>
    </footer>
  );
}
