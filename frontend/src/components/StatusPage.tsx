import React from 'react';
import { CheckCircle2, ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
import PerformanceChart from './PerformanceChart';
import { type Monitor } from '../lib/store';
import { motion } from 'motion/react';

interface StatusPageProps {
  onBack: () => void;
  monitors: Monitor[];
}

export default function StatusPage({ onBack, monitors }: StatusPageProps) {
  // Mock data for the 90-day uptime bar
  const generateUptimeDays = () => {
    return Array.from({ length: 90 }).map((_, i) => {
      const rand = Math.random();
      let status = 'operational';
      if (rand > 0.98) status = 'down';
      else if (rand > 0.95) status = 'degraded';
      return { 
        id: i,
        date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(), 
        status 
      };
    });
  };

  const services = monitors.length > 0 ? monitors : [
    { id: '1', name: 'API Gateway', status: 'operational', uptime: '99.99%' },
    { id: '2', name: 'Authentication Service', status: 'operational', uptime: '100%' },
    { id: '3', name: 'Database Cluster', status: 'operational', uptime: '99.95%' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#111111] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Status Pages
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#3154FF] to-[#2546E5] rounded-xl shadow-inner flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Production API</h1>
            <div className="text-sm text-[#6B6B6B] mt-0.5">status.example.com</div>
          </div>
        </div>
        <button className="bg-[#F7F7F9] hover:bg-[#E5E5E5] text-[#111111] border border-[#E5E5E5] text-sm font-medium px-4 py-2 rounded-md transition-colors">
          Subscribe to Updates
        </button>
      </div>

      {/* Global Status Banner */}
      <div className="bg-[#10B981] text-white p-6 rounded-xl shadow-sm flex items-center gap-4">
        <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
        <div>
          <h2 className="text-xl font-semibold">All Systems Operational</h2>
          <p className="text-white/80 text-sm mt-1">Last updated a few seconds ago</p>
        </div>
      </div>

      {/* Services List with Uptime Bars */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 border-b border-[#E5E5E5]">
          <h3 className="font-semibold text-[#111111]">Uptime</h3>
        </div>
        <div className="divide-y divide-[#E5E5E5]">
          {services.map((service, idx) => {
            const days = generateUptimeDays();
            return (
              <div key={service.id || idx} className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium text-[#111111]">{service.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B6B6B] font-mono">{service.uptime || '99.9%'}</span>
                    <span className="text-[#10B981] text-sm font-medium">Operational</span>
                  </div>
                </div>
                {/* 90 Day Bar */}
                <div className="flex items-center gap-[2px] h-8 w-full group">
                  {days.map(day => (
                    <div 
                      key={day.id}
                      className={`flex-1 rounded-sm h-full hover:opacity-80 transition-opacity cursor-pointer ${
                        day.status === 'operational' ? 'bg-[#10B981]' : 
                        day.status === 'degraded' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                      }`}
                      title={`${day.date} - ${day.status}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2 text-[10px] text-[#6B6B6B] uppercase font-semibold tracking-wider">
                  <span>90 days ago</span>
                  <span>100% uptime</span>
                  <span>Today</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-[#111111] mb-4">System Metrics</h3>
        <PerformanceChart />
      </div>

      {/* Past Incidents */}
      <div>
        <h3 className="text-lg font-semibold text-[#111111] mb-4">Past Incidents</h3>
        <div className="space-y-6">
          <div className="relative pl-6 border-l-2 border-[#E5E5E5] pb-6">
            <div className="absolute w-3 h-3 bg-[#E5E5E5] rounded-full -left-[7px] top-1.5 ring-4 ring-[#F7F7F9]"></div>
            <div className="text-sm font-semibold text-[#6B6B6B] mb-2">Aug 12, 2026</div>
            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5">
              <h4 className="font-semibold text-[#111111] text-lg">Degraded Performance in API Gateway</h4>
              <div className="mt-4 space-y-4 text-sm text-[#555C67]">
                <div>
                  <span className="font-semibold text-[#111111]">Resolved</span> - The issue has been identified and a fix has been deployed. System metrics have returned to normal.
                  <div className="text-xs text-[#6B6B6B] mt-1">Aug 12, 14:30 UTC</div>
                </div>
                <div>
                  <span className="font-semibold text-[#111111]">Investigating</span> - We are currently investigating elevated response times in our primary API gateway cluster in the US-East region.
                  <div className="text-xs text-[#6B6B6B] mt-1">Aug 12, 14:05 UTC</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative pl-6 border-l-2 border-[#E5E5E5]">
            <div className="absolute w-3 h-3 bg-[#E5E5E5] rounded-full -left-[7px] top-1.5 ring-4 ring-[#F7F7F9]"></div>
            <div className="text-sm font-semibold text-[#6B6B6B] mb-2">Aug 05, 2026</div>
            <div className="text-[#555C67] text-sm p-2">
              No incidents reported today.
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}
