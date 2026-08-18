import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface SectionWrapperProps {
  children: React.ReactNode;
}

export default function SectionWrapper({ children }: SectionWrapperProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(sectionRef.current, {
      y: 50,
      skewY: 2,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 85%',
        once: true
      }
    });
  }, { scope: sectionRef });

  return (
    <div ref={sectionRef} className="will-change-transform">
      {children}
    </div>
  );
}
