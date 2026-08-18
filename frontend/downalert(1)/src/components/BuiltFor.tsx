import React, { useRef } from 'react';
import { User, Code2, Briefcase } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion } from 'motion/react';

export default function BuiltFor() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const premiumEase = "cubic-bezier(0.16, 1, 0.3, 1)";
    
    gsap.from('.feature-header > *', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
      },
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: premiumEase
    });

    gsap.from('.persona-card', {
      scrollTrigger: {
        trigger: '.feature-grid',
        start: "top 85%",
      },
      y: 60,
      opacity: 0,
      duration: 1.4,
      stagger: 0.2,
      ease: premiumEase
    });
  }, { scope: containerRef });

  return (
    <section id="features" ref={containerRef} className="py-20 md:py-32 px-4 sm:px-6 bg-[#FFFFFF] relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 lg:gap-12 items-start">
          
          {/* Left - Sticky Editorial Context */}
          <div className="feature-header lg:col-span-4 lg:sticky top-32">
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#080D18] leading-[1.1] tracking-tight mb-4 md:mb-6">
              Engineered for<br className="hidden lg:block" />
              <span className="italic text-[#687386]">builders.</span>
            </h2>
            <p className="font-sans text-base sm:text-lg text-[#687386] leading-relaxed max-w-sm mb-6 md:mb-8">
              We discarded the bloat of enterprise tools to craft a surgically precise observability platform. Built specifically for independent creators who demand absolute reliability.
            </p>
            <div className="h-px w-full max-w-xs bg-[#DDE1E7] hidden md:block"></div>
          </div>

          {/* Right - Asymmetric Persona Grid */}
          <div className="feature-grid lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            
            {/* Persona 1: Solo Developers (Wide, Landscape) */}
            <motion.div 
              initial="idle"
              whileHover="hover"
              variants={{
                idle: { scale: 1 },
                hover: { scale: 1.02, transition: { duration: 0.4, ease: "easeOut" } }
              }}
              className="persona-card md:col-span-8 bg-[#F5F5F2] p-6 sm:p-8 md:p-10 border border-[#DDE1E7] hover:border-[#080D18] transition-colors group flex flex-col justify-between min-h-[280px] md:min-h-[320px] origin-center"
            >
              <div className="flex justify-between items-start mb-8 md:mb-12">
                <motion.div 
                  variants={{
                    idle: { boxShadow: "0px 10px 20px rgba(8,13,24,0.1)", scale: 1 },
                    hover: { scale: 1.1, boxShadow: "0px 0px 30px rgba(65, 105, 255, 0.4)" }
                  }}
                  className="w-10 h-10 md:w-12 md:h-12 bg-[#080D18] flex items-center justify-center transition-colors duration-500"
                >
                  <User className="w-4 h-4 md:w-5 md:h-5 text-[#F5F5F2]" />
                </motion.div>
                <span className="font-mono text-[10px] md:text-xs tracking-widest text-[#687386] uppercase">01</span>
              </div>
              <div>
                <h3 className="font-serif text-2xl md:text-3xl text-[#080D18] mb-3 md:mb-4">Solo Developers</h3>
                <p className="font-sans text-[#687386] leading-relaxed text-sm sm:text-base md:text-lg max-w-lg">
                  Deploy with absolute confidence. When you are the entire engineering team, our automated anomaly detection acts as your sleepless DevOps counterpart, monitoring infrastructure while you sleep.
                </p>
              </div>
            </motion.div>

            {/* Persona 2: Indie Hackers (Tall, Portrait) */}
            <motion.div 
              initial="idle"
              whileHover="hover"
              variants={{
                idle: { scale: 1 },
                hover: { scale: 1.02, transition: { duration: 0.4, ease: "easeOut" } }
              }}
              className="persona-card md:col-span-4 bg-[#080D18] p-6 sm:p-8 md:p-10 border border-[#080D18] group flex flex-col justify-between min-h-[280px] md:min-h-[320px] origin-center"
            >
              <div className="flex justify-between items-start mb-8 md:mb-12">
                <motion.div 
                  variants={{
                    idle: { boxShadow: "0px 10px 20px rgba(255,255,255,0.05)", scale: 1 },
                    hover: { scale: 1.1, boxShadow: "0px 0px 30px rgba(65, 105, 255, 0.6)" }
                  }}
                  className="w-10 h-10 md:w-12 md:h-12 bg-[#FFFFFF] flex items-center justify-center transition-colors duration-500"
                >
                  <Code2 className="w-4 h-4 md:w-5 md:h-5 text-[#080D18]" />
                </motion.div>
                <span className="font-mono text-[10px] md:text-xs tracking-widest text-[#687386] uppercase">02</span>
              </div>
              <div>
                <h3 className="font-serif text-2xl md:text-3xl text-[#FFFFFF] mb-3 md:mb-4">Indie Hackers</h3>
                <p className="font-sans text-[#F5F5F2]/70 leading-relaxed text-sm md:text-base">
                  Protect your revenue streams. Sub-second incident routing ensures you know about downtime before your paying customers take to Twitter.
                </p>
              </div>
            </motion.div>

            {/* Persona 3: Freelancers (Panoramic, Full Width) */}
            <motion.div 
              initial="idle"
              whileHover="hover"
              variants={{
                idle: { scale: 1 },
                hover: { scale: 1.02, transition: { duration: 0.4, ease: "easeOut" } }
              }}
              className="persona-card md:col-span-12 bg-[#FFFFFF] p-6 sm:p-8 md:p-12 border border-[#DDE1E7] hover:border-[#080D18] transition-colors group flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-end justify-between min-h-[220px] md:min-h-[240px] origin-center"
            >
              <div className="flex-1 max-w-2xl">
                <motion.div 
                  variants={{
                    idle: { boxShadow: "0px 10px 20px rgba(65,105,255,0.2)", scale: 1 },
                    hover: { scale: 1.1, boxShadow: "0px 0px 30px rgba(65, 105, 255, 0.8)" }
                  }}
                  className="w-10 h-10 md:w-12 md:h-12 bg-[#4169FF] flex items-center justify-center transition-colors duration-500 mb-6 md:mb-12"
                >
                  <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-[#FFFFFF]" />
                </motion.div>
                <h3 className="font-serif text-2xl md:text-3xl text-[#080D18] mb-3 md:mb-4">Freelance Engineers</h3>
                <p className="font-sans text-[#687386] leading-relaxed text-sm sm:text-base md:text-lg">
                  Offer unprecedented SLAs to your clients. Hand over beautiful, white-labeled status pages that prove your systems maintain 99.999% uptime, elevating your perceived value.
                </p>
              </div>
              <div className="font-mono text-[10px] md:text-xs tracking-widest text-[#687386] uppercase hidden sm:block">
                03
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
