import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Globe } from 'lucide-react';

const initialMockData = Array.from({ length: 48 }).map((_, i) => {
  const isDowntime = i === 12 || i === 13 || i === 30;
  return {
    time: `${i}:00`,
    latency: isDowntime ? 0 : 40 + Math.random() * 20,
    status: isDowntime ? 'down' : 'up'
  };
});

export default function HeroMonitor() {
  const [isPolling, setIsPolling] = useState(false);
  const [latency, setLatency] = useState(42);
  const [data, setData] = useState(initialMockData);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPolling(true);
      
      // Slight jitter for the P95 latency to make it feel live
      setLatency(prev => {
        const jitter = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return 42 + jitter;
      });

      setTimeout(() => setIsPolling(false), 800);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#080D18] text-[#F5F5F2] p-6 border border-[#DDE1E7]/20 shadow-premium w-full h-full flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-20 pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative flex items-center justify-center">
              <div className={`absolute w-4 h-4 rounded-full bg-[#19B98A] transition-opacity duration-700 ${isPolling ? 'opacity-40 scale-150 animate-ping' : 'opacity-0 scale-100'}`}></div>
              <div className={`w-2 h-2 rounded-full z-10 transition-colors duration-300 ${isPolling ? 'bg-[#F5F5F2]' : 'bg-[#19B98A]'}`}></div>
            </div>
            <h3 className="font-mono text-sm tracking-wider text-[#F5F5F2]">API_PRODUCTION</h3>
          </div>
          <p className="font-mono text-xs text-[#687386]">api.production.example.com</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="font-mono text-[10px] text-[#687386] mb-1">UPTIME 30D</p>
            <p className="font-mono text-lg text-[#19B98A]">99.98%</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] text-[#687386] mb-1">LATENCY P95</p>
            <p className={`font-mono text-lg transition-colors duration-300 ${isPolling ? 'text-[#4169FF]' : 'text-[#F5F5F2]'}`}>
              {latency}ms
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[160px] relative z-10 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4169FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4169FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ backgroundColor: '#080D18', border: '1px solid #333', borderRadius: '0' }}
              itemStyle={{ color: '#F5F5F2', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
              labelStyle={{ color: '#687386', fontFamily: 'JetBrains Mono', fontSize: '10px' }}
            />
            <Area 
              type="monotone" 
              dataKey="latency" 
              stroke="#4169FF" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#latencyGradient)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Nodes */}
      <div className="mt-6 pt-4 border-t border-[#DDE1E7]/10 flex justify-between relative z-10">
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#687386]">
          <Globe className="w-3 h-3" />
          <span>GLOBAL EDGE ROUTING</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#687386]">
          <Clock className="w-3 h-3" />
          <span>CHECK INTERVAL: 30s</span>
        </div>
        <div className={`flex items-center gap-2 font-mono text-[10px] transition-colors duration-300 ${isPolling ? 'text-[#F5F5F2]' : 'text-[#687386]'}`}>
          <Activity className={`w-3 h-3 ${isPolling ? 'text-[#4169FF] animate-bounce' : ''}`} />
          <span>{isPolling ? 'PROBE: FETCHING...' : 'PROBE: ACTIVE'}</span>
        </div>
      </div>
    </div>
  );
}
