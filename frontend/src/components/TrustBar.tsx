import { CheckCircle, ShieldCheck, Zap, Bell, Sparkles } from 'lucide-react';

export default function TrustBar() {
  const items = [
    {
      icon: <span className="w-2 h-2 rounded-full bg-[#16A67A] animate-pulse" />,
      text: 'Monitoring active',
      highlight: true,
    },
    {
      icon: <Zap className="w-3.5 h-3.5 text-[#12B8A6]" />,
      text: 'No SDK required',
    },
    {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#12B8A6]" />,
      text: 'No DevOps setup',
    },
    {
      icon: <Bell className="w-3.5 h-3.5 text-[#12B8A6]" />,
      text: 'Instant email alerts',
    },
    {
      icon: <CheckCircle className="w-3.5 h-3.5 text-[#12B8A6]" />,
      text: 'Commercial use included',
    },
  ];

  return (
    <div id="hero-trust-bar" className="w-full max-w-6xl mx-auto px-4 mt-12 sm:mt-16">
      <div className="bg-white/80 backdrop-blur-sm border border-[#E6E8EC] rounded-2xl py-3.5 px-6 shadow-sm flex flex-wrap items-center justify-between gap-y-3 gap-x-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs font-mono text-[#0B1220]">
            {item.icon}
            <span className={item.highlight ? 'font-semibold text-[#16A67A]' : 'text-[#667085]'}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
