import { useState } from 'react';
import { Activity, Bell, CheckCircle2, ArrowLeft } from 'lucide-react';
import GlobalIncidentMap from './GlobalIncidentMap';

interface StatusPageMockProps {
  onBack: () => void;
}

export default function StatusPageMock({ onBack }: StatusPageMockProps) {
  const [subscribed, setSubscribed] = useState(false);

  // Generate 90 days of status (mostly operational, occasional minor outage)
  const days = Array.from({ length: 90 }, (_, i) => {
    const isOutage = Math.random() > 0.98; // 2% chance of outage day
    const isDegraded = Math.random() > 0.95; // 5% chance of degraded day
    return {
      date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: isOutage ? 'outage' : isDegraded ? 'degraded' : 'operational',
      uptime: isOutage ? 98.5 : isDegraded ? 99.2 : 100
    };
  });

  const uptimeValue = (days.reduce((acc, day) => acc + day.uptime, 0) / 90).toFixed(2);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1220] font-sans selection:bg-[#12B8A6]/20 selection:text-[#0B1220] flex flex-col">
      {/* Top Banner with back button (not part of the mocked page, just app nav) */}
      <div className="bg-[#0B1220] text-white px-6 py-2.5 flex items-center justify-between text-sm font-medium z-50 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#12B8A6] animate-pulse"></span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-gray-300">Status Page Preview Mode</span>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 hover:text-[#12B8A6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Website
        </button>
      </div>

      {/* Mocked Public Status Page */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-16">
        
        {/* Status Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white border border-[#E6E8EC] shadow-sm rounded-xl flex items-center justify-center text-[#12B8A6]">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#0B1220]">Acme Corp Status</h1>
              <a href="#" className="text-sm font-medium text-[#667085] hover:text-[#12B8A6] transition-colors">acme.com</a>
            </div>
          </div>

          <button
            onClick={() => setSubscribed(!subscribed)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              subscribed 
                ? 'bg-white border border-[#E6E8EC] text-[#667085]' 
                : 'bg-[#12B8A6] text-white hover:bg-[#0f9f8f] active:scale-[0.98]'
            }`}
          >
            {subscribed ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Subscribed</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                <span>Subscribe to Updates</span>
              </>
            )}
          </button>
        </header>

        {/* Global Status Banner */}
        <div className="bg-emerald-500 text-white rounded-2xl p-6 md:p-8 flex items-center gap-4 shadow-lg shadow-emerald-500/20 mb-10">
          <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-semibold tracking-tight">All Systems Operational</h2>
            <p className="text-emerald-50 mt-1">Last updated a few seconds ago.</p>
          </div>
        </div>

        {/* Uptime Overview */}
        <div className="bg-white border border-[#E6E8EC] rounded-2xl p-6 shadow-premium mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold">Uptime over past 90 days</h3>
            <span className="text-2xl font-mono font-bold tracking-tight text-[#0B1220]">{uptimeValue}%</span>
          </div>

          <div className="flex items-end gap-0.5 sm:gap-1 h-16 w-full group">
            {days.map((day, i) => (
              <div 
                key={i}
                className={`flex-1 rounded-sm h-full transition-all duration-300 relative hover:opacity-80
                  ${day.status === 'operational' ? 'bg-emerald-400' : 
                    day.status === 'degraded' ? 'bg-amber-400' : 'bg-red-500'}
                `}
                title={`${day.date} - ${day.uptime}% uptime`}
              >
                {/* Simplified hover tooltip could go here, but title attribute handles it easily */}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[11px] font-mono font-bold text-gray-400 uppercase">
            <span>90 days ago</span>
            <span className="w-[1px] h-3 bg-gray-200"></span>
            <span>Today</span>
          </div>
        </div>

        {/* Global Incident Map */}
        <GlobalIncidentMap />

        {/* Services List */}
        <div className="bg-white border border-[#E6E8EC] rounded-2xl shadow-premium mb-10 overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E6E8EC]">
            <h3 className="text-base font-semibold">System Metrics</h3>
          </div>
          
          <div className="divide-y divide-[#E6E8EC]">
            {/* Service 1 */}
            <div className="px-6 py-4 flex items-center justify-between hover:bg-[#F7F8FA] transition-colors">
              <span className="font-medium text-sm">REST API</span>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Operational</span>
              </div>
            </div>
            
            {/* Service 2 */}
            <div className="px-6 py-4 flex items-center justify-between hover:bg-[#F7F8FA] transition-colors">
              <span className="font-medium text-sm">Dashboard Web App</span>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Operational</span>
              </div>
            </div>

            {/* Service 3 */}
            <div className="px-6 py-4 flex items-center justify-between hover:bg-[#F7F8FA] transition-colors">
              <span className="font-medium text-sm">Webhooks Delivery</span>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Past Incidents */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-6">Past Incidents</h3>
          
          <div className="relative pl-6 border-l-2 border-[#E6E8EC] space-y-10">
            {/* Incident 1 */}
            <div className="relative">
              <div className="absolute w-3 h-3 bg-white border-2 border-amber-500 rounded-full -left-[31px] top-1.5"></div>
              <h4 className="font-semibold text-lg text-[#0B1220]">Elevated API Latency</h4>
              <p className="text-xs font-mono text-[#667085] mt-1 mb-3">Aug 10, 2026</p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Resolved</p>
                  <p className="text-sm text-[#667085]">This incident has been resolved. The root cause was identified and mitigated.</p>
                  <p className="text-xs font-mono text-gray-400 mt-1">Aug 10, 14:30 UTC</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Investigating</p>
                  <p className="text-sm text-[#667085]">We are currently investigating elevated latency affecting our core API endpoints. Our engineering team is looking into the issue.</p>
                  <p className="text-xs font-mono text-gray-400 mt-1">Aug 10, 13:45 UTC</p>
                </div>
              </div>
            </div>

            {/* Incident 2 */}
            <div className="relative">
              <div className="absolute w-3 h-3 bg-white border-2 border-[#E6E8EC] rounded-full -left-[31px] top-1.5"></div>
              <h4 className="font-semibold text-lg text-[#0B1220]">Scheduled Database Maintenance</h4>
              <p className="text-xs font-mono text-[#667085] mt-1 mb-3">Jul 28, 2026</p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Completed</p>
                  <p className="text-sm text-[#667085]">The scheduled maintenance has been completed.</p>
                  <p className="text-xs font-mono text-gray-400 mt-1">Jul 28, 04:00 UTC</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">In Progress</p>
                  <p className="text-sm text-[#667085]">Scheduled maintenance is currently in progress. We will provide updates as necessary.</p>
                  <p className="text-xs font-mono text-gray-400 mt-1">Jul 28, 02:00 UTC</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-[#E6E8EC]">
          <a href="#" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#667085] hover:text-[#12B8A6] transition-colors">
            Powered by <Activity className="w-4 h-4" /> DownAlert
          </a>
        </div>
      </main>
    </div>
  );
}
