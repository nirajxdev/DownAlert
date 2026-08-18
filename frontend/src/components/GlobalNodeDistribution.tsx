import { Globe } from 'lucide-react';
import { motion } from 'motion/react';

export default function GlobalNodeDistribution() {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#111111]">Global Node Distribution</h3>
          <p className="text-xs text-[#6B6B6B] mt-1">Live status of your uptime probes worldwide</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
          </span>
          <span className="text-xs font-medium text-[#10B981]">All nodes operational</span>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { region: 'US East (N. Virginia)', ms: '12ms', status: 'operational' },
            { region: 'US West (Oregon)', ms: '45ms', status: 'operational' },
            { region: 'EU (Frankfurt)', ms: '82ms', status: 'operational' },
            { region: 'EU (London)', ms: '76ms', status: 'operational' },
            { region: 'Asia Pacific (Tokyo)', ms: '145ms', status: 'operational' },
            { region: 'Asia Pacific (Sydney)', ms: '168ms', status: 'operational' },
            { region: 'South America (São Paulo)', ms: '112ms', status: 'operational' },
            { region: 'Middle East (Bahrain)', ms: '135ms', status: 'operational' },
          ].map((node, i) => (
            <div key={i} className="flex flex-col p-4 bg-[#F7F7F9] rounded-lg border border-[#E5E5E5]/50 relative overflow-hidden group hover:border-[#E5E5E5] transition-colors">
              <div className="absolute top-0 right-0 mt-4 mr-4">
                 <Globe className="w-8 h-8 text-[#111111] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${node.status === 'operational' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></div>
                <span className="text-xs font-medium text-[#111111] truncate max-w-[120px]" title={node.region}>{node.region}</span>
              </div>
              <div className="text-lg font-semibold text-[#111111] font-mono">{node.ms}</div>
              <div className="text-[10px] text-[#6B6B6B] mt-1">Avg latency (last hour)</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
