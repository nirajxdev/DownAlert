import React, { useEffect, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string | null;
}

const contentData: Record<string, { title: string; subtitle: string; content: React.ReactNode }> = {
  edge: {
    title: 'Global Edge Network',
    subtitle: 'INFRASTRUCTURE TOPOLOGY',
    content: (
      <div className="space-y-8">
        <p className="text-base text-[#080D18] font-medium leading-relaxed">
          DownAlert operates on a proprietary, bare-metal edge network spanning 142 discrete global data centers.
        </p>
        
        <div>
          <h4 className="font-mono text-sm tracking-wide text-[#080D18] mb-3">ELIMINATING ROUTING BIAS</h4>
          <p className="text-sm leading-relaxed">Most monitoring tools run on public clouds (AWS, GCP). When a regional cloud outage occurs, the monitoring tool goes down with it. By operating on independent bare-metal servers, our telemetry bypasses localized public cloud failures, ensuring you receive alerts even when entire availability zones vanish.</p>
        </div>
        
        <div>
          <h4 className="font-mono text-sm tracking-wide text-[#080D18] mb-3">MULTI-REGION CONSENSUS</h4>
          <p className="text-sm leading-relaxed">A single node failing to reach your API does not constitute an outage. Before dispatching a PagerDuty alert, our network requires cryptographic consensus from at least 3 geographically isolated edge nodes, entirely eliminating false positives caused by transient BGP flapping.</p>
        </div>
      </div>
    )
  },
  probing: {
    title: 'High-Frequency Analytics',
    subtitle: 'DETERMINISTIC TELEMETRY',
    content: (
      <div className="space-y-8">
        <p className="text-base text-[#080D18] font-medium leading-relaxed">
          Minute-level resolution is unacceptable for mission-critical APIs. We probe at the limits of physical network latency.
        </p>
        
        <div>
          <h4 className="font-mono text-sm tracking-wide text-[#080D18] mb-3">SUB-SECOND RESOLUTION</h4>
          <p className="text-sm leading-relaxed">Our enterprise tier allows for probing frequencies down to 100 milliseconds. We capture precise DNS resolution, TLS handshake, TTFB (Time to First Byte), and complete payload transfer latencies on every single request.</p>
        </div>
        
        <div>
          <h4 className="font-mono text-sm tracking-wide text-[#080D18] mb-3">LATENCY DEGRADATION ALERTS</h4>
          <p className="text-sm leading-relaxed">Outages are rarely binary. More often, APIs suffer from latency degradation before complete failure. Our anomaly detection engines establish baseline latency curves and alert you the moment your p99 response times drift out of acceptable bounds.</p>
        </div>
      </div>
    )
  },
  api: {
    title: 'API Documentation',
    subtitle: 'PROGRAMMATIC CONTROL',
    content: (
      <div className="space-y-8">
        <p className="text-base text-[#080D18] font-medium leading-relaxed">
          DownAlert is built API-first. Everything you can do in the dashboard can be executed programmatically via our REST API.
        </p>
        
        <div className="p-4 bg-[#080D18] text-[#F5F5F2] font-mono text-xs rounded-sm overflow-x-auto">
          <pre>{`curl -X POST https://api.downalert.com/v1/monitors \\
  -H "Authorization: Bearer sk_test_123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Checkout API",
    "url": "https://api.example.com/checkout",
    "method": "POST",
    "frequency": 1000,
    "assertions": [
      { "source": "status", "operator": "==", "target": 200 }
    ]
  }'`}</pre>
        </div>
        
        <p className="text-sm">For full SDK documentation and OpenAPI specifications, enterprise customers can access the developer portal through their assigned Technical Account Manager.</p>
      </div>
    )
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'MASTER SERVICES AGREEMENT',
    content: (
      <div className="space-y-10">
        <div className="pb-6 border-b border-[#DDE1E7]">
          <p className="text-base text-[#080D18] font-medium leading-relaxed">
            This Master Services Agreement ("Agreement") governs your acquisition and use of the DownAlert infrastructure monitoring services. By accepting this Agreement, you agree to these terms.
          </p>
          <p className="text-sm mt-4">Last Updated: August 15, 2026</p>
        </div>
        
        <div>
          <h4 className="font-mono text-sm tracking-wide text-[#080D18] mb-3 flex items-center gap-3">
            <span className="text-[#4169FF]">01.</span> PROVISION OF PURCHASED SERVICES
          </h4>
          <p className="text-sm leading-relaxed mb-4">We will (a) make the Services and Content available to You pursuant to this Agreement and the applicable Order Forms, (b) provide standard support for the Services to You at no additional charge, and/or upgraded support if purchased, (c) use commercially reasonable efforts to make the online Services available 24 hours a day, 7 days a week, except for:</p>
          <ul className="list-disc pl-5 text-sm space-y-2">
            <li>Planned downtime (of which We shall give advance electronic notice).</li>
            <li>Any unavailability caused by circumstances beyond Our reasonable control, including, for example, an act of God, act of government, flood, fire, earthquake, civil unrest, act of terror, strike or other labor problem.</li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-sm tracking-wide text-[#080D18] mb-3 flex items-center gap-3">
            <span className="text-[#4169FF]">02.</span> USE OF SERVICES AND CONTENT
          </h4>
          <p className="text-sm leading-relaxed">You will not (a) make any Service or Content available to anyone other than User(s), (b) sell, resell, license, sublicense, distribute, make available, rent or lease any Service or Content, (c) use a Service to store or transmit infringing, libelous, or otherwise unlawful or tortious material, (d) use a Service to store or transmit Malicious Code, or (e) interfere with or disrupt the integrity or performance of any Service or third-party data contained therein.</p>
        </div>

        <div>
          <h4 className="font-mono text-sm tracking-wide text-[#080D18] mb-3 flex items-center gap-3">
            <span className="text-[#4169FF]">03.</span> SLA GUARANTEES & CREDITS
          </h4>
          <p className="text-sm leading-relaxed mb-4">Production tier subscriptions are backed by a deterministic 99.999% Service Level Agreement. In the event of missed SLAs caused by unmitigated core network failures, service credits will be programmatically issued according to the following matrix:</p>
          <div className="bg-[#F5F5F2] border border-[#DDE1E7] p-4 text-sm font-mono overflow-x-auto">
            <div className="flex border-b border-[#DDE1E7] pb-2 mb-2 font-bold text-[#080D18]">
              <span className="w-1/2">Monthly Uptime Percentage</span>
              <span className="w-1/2">Service Credit Percentage</span>
            </div>
            <div className="flex py-1">
              <span className="w-1/2">&lt; 99.999% but &ge; 99.99%</span>
              <span className="w-1/2">10% of monthly fee</span>
            </div>
            <div className="flex py-1">
              <span className="w-1/2">&lt; 99.99% but &ge; 99.0%</span>
              <span className="w-1/2">25% of monthly fee</span>
            </div>
            <div className="flex py-1">
              <span className="w-1/2">&lt; 99.0%</span>
              <span className="w-1/2">100% of monthly fee</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-mono text-sm tracking-wide text-[#080D18] mb-3 flex items-center gap-3">
            <span className="text-[#4169FF]">04.</span> LIMITATION OF LIABILITY
          </h4>
          <p className="text-sm leading-relaxed">IN NO EVENT SHALL THE AGGREGATE LIABILITY OF EACH PARTY TOGETHER WITH ALL OF ITS AFFILIATES ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED THE TOTAL AMOUNT PAID BY YOU AND YOUR AFFILIATES HEREUNDER FOR THE SERVICES GIVING RISE TO THE LIABILITY IN THE TWELVE MONTHS PRECEDING THE FIRST INCIDENT OUT OF WHICH THE LIABILITY AROSE.</p>
        </div>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'DATA HANDLING & COMPLIANCE',
    content: (
      <div className="space-y-10">
        <div className="pb-6 border-b border-[#DDE1E7]">
          <p className="text-base text-[#080D18] font-medium leading-relaxed">
            We believe telemetry should be secure by default. Our architecture is designed to minimize data collection. We only retain the metadata strictly necessary to execute global probing, analyze latency curves, and route escalation alerts.
          </p>
          <p className="text-sm mt-4">Last Updated: August 15, 2026</p>
        </div>
        
        <div>
          <h4 className="font-mono text-sm tracking-wide text-[#080D18] mb-3 flex items-center gap-3">
            <span className="text-[#4169FF]">01.</span> DATA COLLECTION
          </h4>
          <p className="text-sm leading-relaxed">When you configure a monitor, we collect the target endpoint (URL/IP), expected response signatures, and designated escalation channels. We do not inspect packet payloads beyond the explicitly configured assertions. Account information such as email, billing details, and API keys are stored securely using industry-standard encryption.</p>
        </div>

        <div>
          <h4 className="font-mono text-sm tracking-wide text-[#080D18] mb-3 flex items-center gap-3">
            <span className="text-[#4169FF]">02.</span> DATA RETENTION
          </h4>
          <p className="text-sm leading-relaxed mb-4">Time-series data lifecycle and retention parameters are rigidly enforced across all infrastructure clusters:</p>
          <ul className="list-disc pl-5 text-sm space-y-2">
            <li><strong>Developer Tier:</strong> Ping history and network latency metadata are retained for exactly 7 days.</li>
            <li><strong>Production Tier:</strong> Telemetry is retained for up to 365 days, aggregated by hour after the first 30 days.</li>
            <li><strong>Data Wiping:</strong> At the expiration of the retention period, time-series data is cryptographically wiped and rendered unrecoverable.</li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-sm tracking-wide text-[#080D18] mb-3 flex items-center gap-3">
            <span className="text-[#4169FF]">03.</span> THIRD-PARTY SUBPROCESSORS
          </h4>
          <p className="text-sm leading-relaxed">We do not sell monitoring data or incident histories. Data is exclusively shared with configured integration partners solely to facilitate authorized alert escalation. Our current critical subprocessors include:</p>
          <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
            <li>Stripe (Payment Processing)</li>
            <li>Twilio (SMS Escalations)</li>
            <li>PagerDuty (Incident Routing)</li>
            <li>Postmark (Transactional Email)</li>
          </ul>
        </div>
      </div>
    )
  },
  security: {
    title: 'Security Architecture',
    subtitle: 'INFRASTRUCTURE HARDENING',
    content: (
      <div className="space-y-10">
        <div className="pb-6 border-b border-[#DDE1E7]">
          <p className="text-base text-[#080D18] font-medium leading-relaxed">
            Security is the foundational primitive of our global edge network. We treat your infrastructure topology and incident metadata as highly classified operational intelligence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-[#DDE1E7] bg-[#F5F5F2] hover:border-[#080D18] transition-colors">
            <h4 className="font-mono text-sm tracking-widest text-[#080D18] mb-3">01. COMPLIANCE</h4>
            <p className="text-sm text-[#687386] leading-relaxed">SOC 2 Type II Certified. We undergo annual independent audits by certified third-party firms. Audit reports and penetration test summaries are available to Enterprise customers under NDA.</p>
          </div>
          <div className="p-6 border border-[#DDE1E7] bg-[#F5F5F2] hover:border-[#080D18] transition-colors">
            <h4 className="font-mono text-sm tracking-widest text-[#080D18] mb-3">02. ENCRYPTION</h4>
            <p className="text-sm text-[#687386] leading-relaxed">AES-256-GCM encryption is enforced for all data at rest. TLS 1.3 is mandated for all data in transit. We maintain perfect forward secrecy and strict HSTS policies.</p>
          </div>
          <div className="p-6 border border-[#DDE1E7] bg-[#F5F5F2] hover:border-[#080D18] transition-colors">
            <h4 className="font-mono text-sm tracking-widest text-[#080D18] mb-3">03. ACCESS CONTROL</h4>
            <p className="text-sm text-[#687386] leading-relaxed">Our internal architecture operates on a zero-trust model. Hardware-backed MFA (YubiKey) is strictly enforced for all staff accessing production environments or customer metadata.</p>
          </div>
          <div className="p-6 border border-[#DDE1E7] bg-[#F5F5F2] hover:border-[#080D18] transition-colors">
            <h4 className="font-mono text-sm tracking-widest text-[#080D18] mb-3">04. PENETRATION TESTING</h4>
            <p className="text-sm text-[#687386] leading-relaxed">We conduct bi-annual grey-box penetration testing by independent security research firms. We also maintain a continuous, public bug bounty program via HackerOne.</p>
          </div>
        </div>
        
        <div className="bg-[#080D18] text-[#F5F5F2] p-6 rounded-sm">
          <h4 className="font-mono text-sm tracking-wide mb-3">ENTERPRISE DATA ROOM</h4>
          <p className="text-sm text-[#F5F5F2]/80 leading-relaxed mb-4">For detailed security whitepapers, architecture diagrams, or comprehensive compliance questionnaires, please provision a secure data room via our enterprise support desk.</p>
          <button className="text-sm font-mono tracking-tight text-[#4169FF] hover:text-white transition-colors flex items-center gap-2">
            REQUEST COMPLIANCE PACK <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  },
  about: {
    title: 'About Us',
    subtitle: 'MISSION & VISION',
    content: (
      <div className="space-y-8">
        <p className="text-base text-[#080D18] font-medium leading-relaxed">
          Founded by two graduates, Nitin and Niraj, DownAlert was engineered out of frustration with noisy, false-positive-heavy legacy monitoring tools.
        </p>
        
        <div>
          <h4 className="font-mono text-sm tracking-wide text-[#080D18] mb-3 flex items-center gap-3">
            <span className="text-[#4169FF]">01.</span> THE PHILOSOPHY
          </h4>
          <p className="text-sm leading-relaxed">We believe telemetry should be deterministic, blindingly fast, and beautifully designed. We eliminated the noise and focused purely on providing the exact data you need when seconds matter. A monitoring tool shouldn't require a monitoring tool.</p>
        </div>
        
        <div>
          <h4 className="font-mono text-sm tracking-wide text-[#080D18] mb-3 flex items-center gap-3">
            <span className="text-[#4169FF]">02.</span> THE ARCHITECTURE
          </h4>
          <p className="text-sm leading-relaxed">By controlling our own bare-metal edge nodes across 142 global data centers, we bypassed the unreliability of public cloud routing. This allows us to offer true sub-millisecond precision and completely eliminate localized routing anomalies masquerading as downtime.</p>
        </div>
      </div>
    )
  }
};

export default function InfoModal({ isOpen, onClose, pageId }: InfoModalProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen && pageId) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
      
      setTimeout(() => {
        gsap.to('.info-overlay', { opacity: 1, duration: 0.4, ease: 'power2.out' });
        gsap.fromTo('.info-panel', 
          { x: '100%' },
          { x: '0%', duration: 0.6, ease: 'power4.out' }
        );
        gsap.fromTo('.info-content > *',
          { x: 30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.2, ease: 'power3.out' }
        );
      }, 10);
    } else if (shouldRender) {
      document.body.style.overflow = 'auto';
      
      gsap.to('.info-overlay', { opacity: 0, duration: 0.3, ease: 'power2.in' });
      gsap.to('.info-panel', { x: '100%', duration: 0.4, ease: 'power3.in', onComplete: () => setShouldRender(false) });
    }
    
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, pageId]);

  if (!shouldRender || !pageId) return null;

  const data = contentData[pageId] || contentData['about'];

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div 
        className="info-overlay absolute inset-0 bg-[#080D18]/30 backdrop-blur-sm opacity-0"
        onClick={onClose}
      />
      
      {/* Side Drawer Panel */}
      <div className="info-panel relative w-full max-w-2xl bg-[#FFFFFF] shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col h-full border-l border-[#DDE1E7] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-10 border-b border-[#DDE1E7] bg-[#F5F5F2]">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#080D18] mb-2 tracking-tight">{data.title}</h2>
            <p className="font-mono text-[10px] text-[#687386] tracking-widest">{data.subtitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white border border-[#DDE1E7] hover:border-[#080D18] hover:bg-[#080D18] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="info-content flex-1 overflow-y-auto p-6 md:p-10 font-sans text-[#687386] leading-relaxed">
          {data.content}
        </div>
        
      </div>
    </div>
  );
}
