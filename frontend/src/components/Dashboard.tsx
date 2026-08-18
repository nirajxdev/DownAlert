import React, { useState, useEffect } from 'react';
import { 
  Activity, Search, Bell, Plus, MoreHorizontal, CheckCircle2, 
  LayoutDashboard, Server, AlertTriangle, Radio, Settings, LogOut, 
  Shield, Menu, X, ArrowUpRight, ArrowLeft, ChevronDown, Pencil, Trash2, Globe, TrendingDown, TrendingUp, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GlobalNodeDistribution from './GlobalNodeDistribution';
import PerformanceChart from './PerformanceChart';
import StatusPage from './StatusPage';
import { store, type User, type Monitor } from '../lib/store';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const QuickAddModal = ({ isOpen, onClose, onSave, user, currentMonitorsCount }: { isOpen: boolean, onClose: () => void, onSave: (monitor: Monitor) => void, user: User, currentMonitorsCount: number }) => {
  const [url, setUrl] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const maxMonitors = user.plan === 'free' ? 1 : 5;
  const limitReached = currentMonitorsCount >= maxMonitors;
  const checkInterval = user.plan === 'free' ? '5-minute' : '1-minute';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload on form submit
    
    // Guard clause: do nothing if input is empty, plan limits are hit, or already verifying
    if (!url || limitReached || isVerifying) return;
    setError(null); // Reset any previous error states

    let formattedUrl = url.trim(); // Remove whitespace
    
    // Strict Regex URL validation to ensure proper formatting
    const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    if (!urlRegex.test(formattedUrl)) {
      setError('Please enter a valid website URL (e.g., example.com)');
      return;
    }

    // Auto-prepend https if missing for valid HTTP structure
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    // Auto-extract the hostname from the URL to use as a default display name
    let name = 'Website';
    try {
      const parsedUrl = new URL(formattedUrl);
      name = parsedUrl.hostname;
    } catch (err) {
      setError('Failed to parse URL domain.');
      return;
    }

    // Enter verification state (shows loading spinner)
    setIsVerifying(true);
    
    // Simulate connection check by attempting a no-cors fetch
    // Note: Since browsers don't give status codes for opaque responses,
    // this mainly tests if the domain is resolvable (DNS) and reachable.
    try {
      const controller = new AbortController();
      // Set a strict 5-second timeout. If the server doesn't respond, it aborts.
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Perform the HEAD request
      await fetch(formattedUrl, { 
        mode: 'no-cors', 
        signal: controller.signal,
        method: 'HEAD'
      });
      clearTimeout(timeoutId); // Clear the timeout if the request succeeds
    } catch (err: any) {
      // Check if it failed due to our artificial 5-second timeout
      if (err.name === 'AbortError') {
        setError('Connection timed out. Please check if the website is online.');
      } else {
        // Generic failure (e.g., DNS resolution failed, connection refused)
        setError('Unable to reach website. Please check the URL and try again.');
      }
      setIsVerifying(false);
      return; // Stop execution; do not save monitor
    }

    // Verification succeeded
    setIsVerifying(false);

    // =====================================================================
    // TODO (API/DATABASE): CREATE MONITOR IN DATABASE
    // Send the verified URL to your backend to create the monitor record
    // and begin the background polling engine.
    // Example: 
    // const response = await api.post('/monitors', { url: formattedUrl, name, interval: checkInterval });
    // const newMonitor = response.data;
    // =====================================================================

    // Mock local creation
    const newMonitor: Monitor = {
      id: `mon-${Date.now()}`,
      userId: user.id,
      name,
      url: formattedUrl,
      type: 'Website',
      status: 'operational',
      uptime: '100%',
      response: '—', // No response time data yet
      lastCheck: 'Just now'
    };

    store.saveMonitor(newMonitor); // Save to local storage
    onSave(newMonitor); // Trigger parent callback to update React state array
    setUrl(''); // Clear the input field for the next entry
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D18]/80 backdrop-blur-sm font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#FFFFFF] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#E5E5E5]"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#111111]">Quick Add Monitor</h3>
            <button onClick={onClose} disabled={isVerifying} className="text-[#6B6B6B] hover:text-[#111111] transition-colors p-1 disabled:opacity-50">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[#6B6B6B] text-sm mb-6">
            Enter the website link below. Your <span className="font-semibold text-[#111111] capitalize">{user.plan}</span> plan includes up to {maxMonitors} monitors with {checkInterval} check intervals.
          </p>

          {limitReached ? (
            <div className="bg-[#F7F7F9] border border-[#E5E5E5] rounded-lg p-5 text-center space-y-4">
              <div className="w-12 h-12 bg-[#E5E5E5] rounded-full flex items-center justify-center mx-auto text-[#111111]">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-[#111111]">Limit Reached</h4>
                <p className="text-sm text-[#6B6B6B] mt-1">
                  You are currently monitoring {currentMonitorsCount} of {maxMonitors} websites. 
                  {user.plan === 'free' ? ' Upgrade to Pro to add more monitors and get 1-minute checks.' : ' You have reached the maximum number of monitors for the Pro plan.'}
                </p>
              </div>
              {user.plan === 'free' && (
                <button 
                  onClick={() => window.open('https://buy.stripe.com/test_12345', '_blank')}
                  className="w-full bg-[#3154FF] hover:bg-[#2546E5] text-white text-sm font-medium px-6 py-2.5 rounded-md transition-colors shadow-sm"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1.5">Website URL</label>
                <input 
                  type="text" 
                  required
                  disabled={isVerifying}
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(null); }}
                  placeholder="e.g. example.com" 
                  className={`w-full bg-[#FFFFFF] border rounded-md px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-1 transition-all shadow-sm disabled:opacity-50 ${error ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]' : 'border-[#E5E5E5] focus:border-[#3154FF] focus:ring-[#3154FF]'}`} 
                />
                {error && (
                  <p className="text-[#EF4444] text-xs mt-2 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> {error}</p>
                )}
              </div>
              <button 
                type="submit" 
                disabled={isVerifying}
                className="w-full bg-[#111111] hover:bg-[#000000] text-white text-sm font-medium px-6 py-3 rounded-md transition-colors shadow-sm flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <><Activity className="w-4 h-4 animate-spin" /> Verifying Connection...</>
                ) : (
                  <><Plus className="w-4 h-4" /> Add Website</>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const MonitorRow = ({ monitor, onEdit, onDelete }: { key?: React.Key, monitor: Monitor, onEdit: (m: Monitor) => void, onDelete: (m: Monitor) => void }) => {
  const latency = parseInt(monitor.response);
  const isOffline = monitor.status === 'down' || (monitor.response === '—' && monitor.status !== 'operational');
  
  let StatusIcon = CheckCircle2;
  let colorClass = 'text-[#10B981]';
  let bgClass = 'bg-[#10B981]/10';
  
  if (isOffline || latency >= 800) {
    StatusIcon = AlertTriangle;
    colorClass = 'text-[#EF4444]';
    bgClass = 'bg-[#EF4444]/10';
  } else if (latency >= 300) {
    StatusIcon = Activity;
    colorClass = 'text-[#F59E0B]';
    bgClass = 'bg-[#F59E0B]/10';
  }

  return (
    <tr className="hover:bg-[#F7F7F9] transition-colors group cursor-pointer" onClick={() => onEdit(monitor)}>
      <td className="px-4 py-4 sm:py-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 duration-200 ${bgClass}`}>
          <StatusIcon className={`w-4 h-4 ${colorClass}`} />
        </div>
      </td>
      <td className="px-4 py-4 sm:py-3">
        <div className="font-medium text-[#111111]">{monitor.name}</div>
        <div className="text-xs text-[#6B6B6B] font-mono mt-0.5 truncate max-w-[150px] sm:max-w-[200px] md:max-w-xs">{monitor.url}</div>
      </td>
      <td className="px-4 py-4 sm:py-3 hidden md:table-cell text-[#6B6B6B]">{monitor.type}</td>
      <td className="px-4 py-4 sm:py-3 hidden sm:table-cell font-mono text-[#111111]">{monitor.uptime}</td>
      <td className="px-4 py-4 sm:py-3 hidden lg:table-cell font-mono text-[#6B6B6B]">{monitor.response}</td>
      <td className="px-4 py-4 sm:py-3 hidden xl:table-cell text-[#6B6B6B] text-xs">{monitor.lastCheck}</td>
      <td className="px-4 py-4 sm:py-3 text-right">
        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(monitor); }} 
            className="text-[#6B6B6B] hover:text-[#3154FF] p-2 sm:p-1.5 rounded-md hover:bg-[#3154FF]/10 transition-colors" 
            title="Edit Monitor"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(monitor); }} 
            className="text-[#6B6B6B] hover:text-[#EF4444] p-2 sm:p-1.5 rounded-md hover:bg-[#EF4444]/10 transition-colors" 
            title="Delete Monitor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function Dashboard({ user, onUpdateUser, onLogout }: DashboardProps & { onUpdateUser?: (u: User) => void }) {
  const [activeRoute, setActiveRoute] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null);
  const [monitorToDelete, setMonitorToDelete] = useState<Monitor | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const [isTestingAlert, setIsTestingAlert] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  
  // Local state for Webhook History
  const [webhookLogs, setWebhookLogs] = useState<{ id: string, timestamp: string, event: string, status: 'success' | 'error', response: string, code: number }[]>([]);

  const [showOnboarding, setShowOnboarding] = useState(!user.hasCompletedOnboarding);
  const [onboardingStep, setOnboardingStep] = useState(1);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    const updatedUser = { ...user, hasCompletedOnboarding: true };
    store.saveUser(updatedUser);
  };

  // Trigger side-effects when the 'user' prop changes
  useEffect(() => {
    // =====================================================================
    // TODO (API/DATABASE): FETCH MONITORS ON MOUNT OR USER CHANGE
    // Replace store.getMonitors with an API call to fetch monitors for this user.
    // Example: 
    // const fetchMonitors = async () => {
    //   const response = await fetch(`/api/monitors?userId=${user.id}`);
    //   const data = await response.json();
    //   setMonitors(data);
    // };
    // fetchMonitors();
    // =====================================================================
    // Fetch monitors from local store for now
    setMonitors(store.getMonitors(user.role === 'admin' ? undefined : user.id));
  }, [user]);

  const handleDeleteMonitor = () => {
    if (monitorToDelete) {
      // =====================================================================
      // TODO (API/DATABASE): DELETE MONITOR FROM DATABASE
      // Send a DELETE request to your backend to remove the monitor record.
      // Example: await fetch(`/api/monitors/${monitorToDelete.id}`, { method: 'DELETE' });
      // =====================================================================
      // Local deletion logic:
      store.deleteMonitor(monitorToDelete.id); // Remove from localStorage
      setMonitors(monitors.filter(m => m.id !== monitorToDelete.id)); // Update React state to remove from UI
      setMonitorToDelete(null); // Close the confirmation modal
    }
  };

  const handleTestAlert = () => {
    // Put the test button into a loading/verifying state
    setIsTestingAlert(true);
    setTestSuccess(false);
    
    // Simulate network delay for sending a notification payload
    setTimeout(() => {
      // =====================================================================
      // TODO (API/DATABASE): TRIGGER TEST NOTIFICATION IN BACKEND
      // Send a request to your API to dispatch a real test email/webhook.
      // Example: await fetch('/api/alerts/test', { method: 'POST', body: JSON.stringify({ userId: user.id }) });
      // =====================================================================
      
      setIsTestingAlert(false); // Stop loading spinner
      setTestSuccess(true); // Show success checkmark
      
      // Append a mock successful webhook log entry to the UI table state
      const newLog = {
        id: `wh-${Date.now()}`,
        timestamp: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }).format(new Date()),
        event: 'test.notification',
        status: 'success' as const,
        response: '{success: true}',
        code: 200
      };
      // Prepend the new log to the top of the array
      setWebhookLogs(prev => [newLog, ...prev]);

      // Remove the success checkmark after 3 seconds
      setTimeout(() => setTestSuccess(false), 3000);
    }, 1500);
  };

  // Calculate stats
  const operationalCount = monitors.filter(m => m.status === 'operational').length;
  const degradedCount = monitors.filter(m => m.status === 'degraded').length;
  const downCount = monitors.filter(m => m.status === 'down').length;
  
  const totalMonitors = monitors.length;
  const isHealthy = downCount === 0 && degradedCount === 0;

  let overallUptime = '100%';
  if (totalMonitors > 0) {
    const uptimeVals = monitors.map(m => parseFloat(m.uptime.replace('%', ''))).filter(n => !isNaN(n));
    if (uptimeVals.length > 0) {
      const avg = uptimeVals.reduce((a, b) => a + b, 0) / uptimeVals.length;
      overallUptime = avg.toFixed(2) + '%';
    }
  }

  // Extract name for greeting
  const capitalizedName = user.name || user.email.split('@')[0].split('.')[0];

  const NavItem = ({ id, icon: Icon, label, badge }: { id: string, icon: any, label: string, badge?: string }) => (
    <button
      onClick={() => { setActiveRoute(id); setMobileMenuOpen(false); }}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm font-medium ${
        activeRoute === id 
          ? 'bg-[#111111] text-white' 
          : 'text-[#6B6B6B] hover:bg-[#F7F7F9] hover:text-[#111111]'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${activeRoute === id ? 'text-white' : ''}`} />
        {label}
      </div>
      {badge && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
          activeRoute === id ? 'bg-white/20 text-white' : 'bg-[#E5E5E5] text-[#111111]'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F7F7F9] text-[#111111] font-sans flex selection:bg-[#3154FF]/20 selection:text-[#111111]">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#111111]/20 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#FFFFFF] border-r border-[#E5E5E5] flex flex-col shrink-0
        transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-14 flex items-center justify-between px-5 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2 font-bold tracking-tight text-[#111111]">
            <Activity className="w-5 h-5 text-[#3154FF]" />
            DownAlert
          </div>
          <button className="md:hidden text-[#6B6B6B]" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div>
            <div className="px-3 mb-2 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Dashboard</div>
            <nav className="space-y-0.5">
              <NavItem id="overview" icon={LayoutDashboard} label="Overview" />
              <NavItem id="monitors" icon={Server} label="Monitors" badge={totalMonitors.toString()} />
              <NavItem id="incidents" icon={AlertTriangle} label="Incidents" badge={downCount > 0 ? downCount.toString() : undefined} />
              <NavItem id="status-pages" icon={Radio} label="Status Pages" />
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Configuration</div>
            <nav className="space-y-0.5">
              <NavItem id="alerts" icon={Bell} label="Alerts" />
              <NavItem id="profile" icon={Settings} label="Settings" />
            </nav>
          </div>

          {user.role === 'admin' && (
            <div>
              <div className="px-3 mb-2 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Platform</div>
              <nav className="space-y-0.5">
                <NavItem id="admin" icon={Shield} label="Admin Panel" />
              </nav>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-[#E5E5E5] hover:bg-[#F7F7F9] cursor-pointer transition-colors" onClick={() => setActiveRoute('profile')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#3154FF]/10 text-[#3154FF] flex items-center justify-center font-bold text-sm">
                  {capitalizedName.charAt(0)}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#111111] truncate max-w-[120px] leading-tight">{capitalizedName}</span>
                <div className="flex items-center gap-1.5 mt-1 relative group cursor-help">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide ${
                    user.plan === 'pro' || user.plan === 'business' 
                      ? 'bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-[#78350F] shadow-sm border border-[#F59E0B]/20' 
                      : 'bg-[#F7F7F9] border border-[#E5E5E5] text-[#6B6B6B]'
                  }`}>
                    {(user.plan || 'FREE').toUpperCase()}
                  </span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] text-[#6B6B6B] font-mono">
                      • ADMIN
                    </span>
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-0 mb-2 w-48 p-2.5 bg-[#111111] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-[#30363D]">
                    <div className="font-semibold mb-1 text-white">
                      {user.plan === 'pro' || user.plan === 'business' ? 'Pro Plan Active' : 'Free Plan Active'}
                    </div>
                    <div className="text-[#8B949E] space-y-1 mt-1.5">
                      {user.plan === 'pro' || user.plan === 'business' ? (
                        <>
                          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#10B981]" /> 1-minute check intervals</div>
                          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#10B981]" /> Up to 5 monitors</div>
                          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#10B981]" /> Multi-channel alerts</div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#6B6B6B]" /> 5-minute check intervals</div>
                          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#6B6B6B]" /> 1 monitor limit</div>
                          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#6B6B6B]" /> Email alerts only</div>
                        </>
                      )}
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-4 -mt-px border-4 border-transparent border-t-[#30363D]"></div>
                    <div className="absolute top-full left-4 -mt-[2px] border-4 border-transparent border-t-[#111111]"></div>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={onLogout} className="text-[#6B6B6B] hover:text-[#111111] transition-colors" title="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-[#FFFFFF] border-b border-[#E5E5E5] flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-[#6B6B6B]" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-medium text-sm text-[#111111] capitalize">
              {activeRoute.replace('-', ' ')}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-[#F7F7F9] border border-[#E5E5E5] rounded-md pl-9 pr-12 py-1.5 text-sm text-[#111111] focus:outline-none focus:border-[#3154FF] focus:ring-1 focus:ring-[#3154FF] w-64 transition-all placeholder-[#6B6B6B]"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <kbd className="bg-[#FFFFFF] border border-[#E5E5E5] rounded px-1.5 text-[10px] font-mono text-[#6B6B6B]">⌘</kbd>
                <kbd className="bg-[#FFFFFF] border border-[#E5E5E5] rounded px-1.5 text-[10px] font-mono text-[#6B6B6B]">K</kbd>
              </div>
            </div>
            <button className="relative text-[#6B6B6B] hover:text-[#111111] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeRoute === 'overview' ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="max-w-5xl mx-auto"
            >
              
              {/* Dashboard Header */}
              <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-[#111111] mb-2">Good morning, {capitalizedName}</h1>
                  <p className="text-[#6B6B6B] text-base">Here's what's happening with your endpoints today.</p>
                </div>
                <div className="flex items-center gap-3">
                  {user.plan === 'free' && (
                    <button 
                      onClick={() => window.open('https://buy.stripe.com/test_12345', '_blank')}
                      className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:opacity-90 text-[#78350F] text-sm font-semibold px-4 py-2 rounded-md flex items-center justify-center transition-opacity shadow-sm border border-[#F59E0B]/20"
                    >
                      UPGRADE TO PRO
                    </button>
                  )}
                  <button 
                    onClick={() => setIsQuickAddOpen(true)}
                    className="bg-[#111111] hover:bg-[#000000] text-white text-sm font-medium px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> ADD MONITOR
                  </button>
                </div>
              </motion.div>

              {/* Top Overview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Global Health Status */}
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 flex flex-col justify-between">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isHealthy ? 'bg-[#10B981]/10' : 'bg-[#EF4444]/10'}`}>
                      {isHealthy ? (
                        <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#111111] tracking-tight">
                        {isHealthy ? 'All Systems Operational' : 'Systems Degraded'}
                      </h2>
                      <p className="text-sm text-[#6B6B6B]">
                        {isHealthy ? 'No active incidents on your monitors.' : `${downCount + degradedCount} monitor(s) experiencing issues.`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-[#E5E5E5]">
                    <div className="pl-0">
                      <div className="text-[#6B6B6B] text-xs font-medium mb-1 uppercase tracking-wide">Monitors</div>
                      <div className="text-2xl font-semibold text-[#111111]">{totalMonitors}</div>
                    </div>
                    <div className="pl-4 sm:pl-6">
                      <div className="text-[#6B6B6B] text-xs font-medium mb-1 uppercase tracking-wide">Overall Uptime</div>
                      <div className="text-2xl font-semibold text-[#111111]">{overallUptime}</div>
                    </div>
                    <div className="pl-4 sm:pl-6">
                      <div className="text-[#6B6B6B] text-xs font-medium mb-1 uppercase tracking-wide truncate">Avg Response</div>
                      <div className="text-2xl font-semibold text-[#111111]">120<span className="text-sm text-[#6B6B6B] ml-1">ms</span></div>
                    </div>
                    <div className="pl-4 sm:pl-6">
                      <div className="text-[#6B6B6B] text-xs font-medium mb-1 uppercase tracking-wide truncate">Incidents</div>
                      <div className={`text-2xl font-semibold ${!isHealthy ? 'text-[#EF4444]' : 'text-[#111111]'}`}>
                        {downCount + degradedCount}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Plan Usage Summary */}
                <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 flex flex-col justify-between relative overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-[#111111]">Plan Usage</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${user.plan === 'free' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' : 'bg-[#3154FF]/10 text-[#3154FF] border-[#3154FF]/20'}`}>
                        {user.plan}
                      </span>
                    </div>
                    
                    <div className="mb-2 flex justify-between items-end">
                      <div className="text-sm font-medium text-[#111111]">Monitors Limit</div>
                      <div className="text-sm font-semibold text-[#111111]">{totalMonitors} / {user.plan === 'free' ? '1' : '5'}</div>
                    </div>
                    <div className="w-full bg-[#F7F7F9] rounded-full h-2 mb-6 border border-[#E5E5E5] overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${totalMonitors >= (user.plan === 'free' ? 1 : 5) ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`}
                        style={{ width: `${(totalMonitors / (user.plan === 'free' ? 1 : 5)) * 100}%` }}
                      ></div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6B6B6B]">Check Interval</span>
                        <span className="font-medium text-[#111111]">{user.plan === 'free' ? '5 Minutes' : '1 Minute'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6B6B6B]">Data Retention</span>
                        <span className="font-medium text-[#111111]">{user.plan === 'free' ? '7 Days' : '1 Year'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6B6B6B]">Alert Channels</span>
                        <span className="font-medium text-[#111111]">{user.plan === 'free' ? 'Email Only' : 'Multi-channel'}</span>
                      </div>
                    </div>
                  </div>

                  {user.plan === 'free' && (
                    <button 
                      onClick={() => window.open('https://buy.stripe.com/test_12345', '_blank')}
                      className="mt-6 w-full bg-[#111111] hover:bg-[#000000] text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <Zap className="w-3 h-3 text-[#F59E0B]" /> Upgrade to Pro
                    </button>
                  )}
                </motion.div>
              </div>

              {/* Pro User Insights */}
              {user.plan === 'pro' && (
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-[#FFFFFF] border border-[#3154FF]/20 rounded-xl shadow-[0_1px_2px_rgba(49,84,255,0.05)] p-5 relative overflow-hidden group hover:border-[#3154FF]/40 transition-colors">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="w-16 h-16 text-[#3154FF]" />
                     </div>
                     <div className="flex items-center justify-between mb-4 relative z-10">
                       <h3 className="text-sm font-medium text-[#111111]">Average Response Time</h3>
                       <span className="bg-[#3154FF]/10 text-[#3154FF] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-[#3154FF]/20">Pro Insight</span>
                     </div>
                     <div className="text-3xl font-semibold text-[#111111] mb-1 relative z-10">118<span className="text-lg text-[#6B6B6B] ml-1 font-normal">ms</span></div>
                     <p className="text-xs text-[#10B981] mt-2 flex items-center gap-1 relative z-10"><TrendingDown className="w-3 h-3" /> 12ms faster than last week</p>
                  </div>
                  
                  <div className="bg-[#FFFFFF] border border-[#3154FF]/20 rounded-xl shadow-[0_1px_2px_rgba(49,84,255,0.05)] p-5 relative overflow-hidden group hover:border-[#3154FF]/40 transition-colors">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Globe className="w-16 h-16 text-[#3154FF]" />
                     </div>
                     <div className="flex items-center justify-between mb-4 relative z-10">
                       <h3 className="text-sm font-medium text-[#111111]">Global Edge Reach</h3>
                       <span className="bg-[#3154FF]/10 text-[#3154FF] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-[#3154FF]/20">Pro Insight</span>
                     </div>
                     <div className="text-3xl font-semibold text-[#111111] mb-1 relative z-10">12<span className="text-lg text-[#6B6B6B] ml-1 font-normal">Regions</span></div>
                     <p className="text-xs text-[#6B6B6B] mt-2 relative z-10">Checked concurrently across the globe</p>
                  </div>
                </motion.div>
              )}

              {/* Performance Trend Chart */}
              {totalMonitors > 0 && (
                <motion.div variants={itemVariants} className="mb-8">
                  <PerformanceChart />
                </motion.div>
              )}

              {/* Monitor Health Breakdown */}
              {totalMonitors > 0 && (
                <motion.div variants={itemVariants} className="mb-6">
                  <h3 className="text-sm font-semibold text-[#111111] mb-3">Monitor Health</h3>
                  <div className="flex gap-2 h-3 rounded-full overflow-hidden bg-[#F7F7F9] border border-[#E5E5E5]">
                    <div className="bg-[#10B981] h-full" style={{ width: `${(operationalCount/totalMonitors)*100}%` }} title={`Operational (${operationalCount})`}></div>
                    <div className="bg-[#F59E0B] h-full" style={{ width: `${(degradedCount/totalMonitors)*100}%` }} title={`Degraded (${degradedCount})`}></div>
                    <div className="bg-[#EF4444] h-full" style={{ width: `${(downCount/totalMonitors)*100}%` }} title={`Down (${downCount})`}></div>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1.5 text-[#6B6B6B]"><div className="w-2 h-2 rounded-full bg-[#10B981]"></div> Operational ({operationalCount})</div>
                    <div className="flex items-center gap-1.5 text-[#6B6B6B]"><div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div> Degraded ({degradedCount})</div>
                    <div className="flex items-center gap-1.5 text-[#6B6B6B]"><div className="w-2 h-2 rounded-full bg-[#EF4444]"></div> Down ({downCount})</div>
                  </div>
                </motion.div>
              )}

              {/* Monitors Table */}
              <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-[#F7F7F9] border-b border-[#E5E5E5] text-[#6B6B6B] font-medium text-xs">
                      <tr>
                        <th className="px-4 py-3 w-8"></th>
                        <th className="px-4 py-3">Monitor</th>
                        <th className="px-4 py-3 hidden md:table-cell">Type</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Uptime</th>
                        <th className="px-4 py-3 hidden lg:table-cell">Response</th>
                        <th className="px-4 py-3 hidden xl:table-cell">Last Check</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                      {monitors.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-16">
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className="flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-5"
                            >
                              <div className="relative">
                                <div className="absolute inset-0 bg-[#3154FF]/10 blur-xl rounded-full"></div>
                                <div className="w-20 h-20 bg-white border border-[#E5E5E5] rounded-2xl shadow-sm flex items-center justify-center relative z-10 rotate-3">
                                  <Activity className="w-10 h-10 text-[#3154FF]" />
                                </div>
                                <div className="w-12 h-12 bg-white border border-[#E5E5E5] rounded-xl shadow-sm flex items-center justify-center absolute -bottom-2 -left-4 z-20 -rotate-6">
                                  <Globe className="w-6 h-6 text-[#10B981]" />
                                </div>
                                <div className="w-10 h-10 bg-white border border-[#E5E5E5] rounded-lg shadow-sm flex items-center justify-center absolute -top-2 -right-3 z-0 rotate-12">
                                  <Server className="w-5 h-5 text-[#F59E0B]" />
                                </div>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-[#111111] mb-2 tracking-tight">Nothing to monitor yet</h3>
                                <p className="text-[#6B6B6B] text-sm leading-relaxed mb-6">
                                  Start tracking your first endpoint to get real-time insights on uptime, performance, and incidents.
                                </p>
                                <button 
                                  onClick={() => setIsQuickAddOpen(true)}
                                  className="bg-[#111111] hover:bg-[#000000] text-white text-sm font-medium px-5 py-2.5 rounded-lg inline-flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                >
                                  <Plus className="w-4 h-4" /> ADD YOUR FIRST MONITOR
                                </button>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      ) : monitors.map((monitor) => (
                        <MonitorRow 
                          key={monitor.id} 
                          monitor={monitor} 
                          onEdit={(m) => { setEditingMonitor(m); setActiveRoute('monitors-edit'); }} 
                          onDelete={(m) => setMonitorToDelete(m)} 
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          ) : activeRoute === 'monitors' ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="max-w-5xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#111111] mb-1">Monitors</h2>
                  <p className="text-[#6B6B6B] text-sm">Manage and configure your uptime checks.</p>
                </div>
                <button 
                  onClick={() => setIsQuickAddOpen(true)}
                  className="bg-[#111111] hover:bg-[#000000] text-white text-sm font-medium px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Monitor
                </button>
              </div>

              {totalMonitors > 0 && (
                <div className="mb-8">
                  <PerformanceChart />
                </div>
              )}

              <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="p-4 border-b border-[#E5E5E5] bg-[#F7F7F9]">
                  <div className="relative max-w-md">
                    <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search monitors..." 
                      className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-md pl-9 pr-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#3154FF] focus:ring-1 focus:ring-[#3154FF]"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#F7F7F9] border-b border-[#E5E5E5] text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 w-8"></th>
                        <th className="px-4 py-3">Monitor</th>
                        <th className="px-4 py-3 hidden md:table-cell">Type</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Uptime</th>
                        <th className="px-4 py-3 hidden lg:table-cell">Response</th>
                        <th className="px-4 py-3 hidden xl:table-cell">Last Check</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                      {monitors.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-16 text-center text-[#6B6B6B]">
                            <p>No monitors found. Click "Add Monitor" to get started.</p>
                          </td>
                        </tr>
                      ) : monitors.map((monitor) => (
                        <MonitorRow 
                          key={monitor.id} 
                          monitor={monitor} 
                          onEdit={(m) => { setEditingMonitor(m); setActiveRoute('monitors-edit'); }} 
                          onDelete={(m) => setMonitorToDelete(m)} 
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : activeRoute === 'incidents' ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="max-w-5xl mx-auto"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-[#111111] mb-1">Incidents</h2>
                <p className="text-[#6B6B6B] text-sm">Review past outages, performance drops, and ongoing issues.</p>
              </div>

              <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                </div>
                <h3 className="text-lg font-semibold text-[#111111] mb-2">No Active Incidents</h3>
                <p className="text-[#6B6B6B] text-sm max-w-md mx-auto">
                  All systems are currently operational. Any future downtime or degraded performance events will be logged here.
                </p>
              </div>
            </motion.div>
          ) : activeRoute === 'status-pages' ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="max-w-5xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#111111] mb-1">Status Pages</h2>
                  <p className="text-[#6B6B6B] text-sm">Create public status pages to keep your customers informed.</p>
                </div>
                <button 
                  className="bg-[#111111] hover:bg-[#000000] text-white text-sm font-medium px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Create Status Page
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Example Mock Status Page Card */}
                <div 
                  onClick={() => setActiveRoute('status-page-preview')}
                  className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 hover:border-[#3154FF]/30 transition-colors group cursor-pointer flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#3154FF] to-[#2546E5] rounded-lg shadow-inner flex items-center justify-center text-white font-bold">
                        P
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#111111]">Production API</h3>
                        <p className="text-xs text-[#6B6B6B]">status.example.com</p>
                      </div>
                    </div>
                    <span className="bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Live</span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-[#E5E5E5] flex justify-between items-center text-sm">
                    <span className="text-[#6B6B6B]">3 monitors attached</span>
                    <span className="text-[#3154FF] font-medium group-hover:underline">View Page &rarr;</span>
                  </div>
                </div>

                <div className="border-2 border-dashed border-[#E5E5E5] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#3154FF]/30 hover:bg-[#F7F7F9] transition-colors cursor-pointer min-h-[160px]">
                  <Plus className="w-6 h-6 text-[#6B6B6B] mb-2" />
                  <h3 className="font-medium text-[#111111]">Add Another Page</h3>
                </div>
              </div>
            </motion.div>
          ) : activeRoute === 'status-page-preview' ? (
            <StatusPage onBack={() => setActiveRoute('status-pages')} monitors={monitors} />
          ) : activeRoute === 'alerts' ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="max-w-3xl mx-auto"
            >
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#111111] mb-1">Alerting & Notifications</h2>
                  <p className="text-[#6B6B6B] text-sm">Configure where and how you want to be notified of incidents.</p>
                </div>
                <button 
                  onClick={handleTestAlert}
                  disabled={isTestingAlert || testSuccess}
                  className="bg-[#FFFFFF] border border-[#E5E5E5] hover:bg-[#F7F7F9] text-[#111111] text-sm font-medium px-4 py-2 rounded-lg inline-flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px]"
                >
                  {testSuccess ? (
                    <><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Sent Successfully</>
                  ) : isTestingAlert ? (
                    <><Activity className="w-4 h-4 text-[#6B6B6B] animate-spin" /> Sending...</>
                  ) : (
                    <><Zap className="w-4 h-4 text-[#F59E0B]" /> Test Notification</>
                  )}
                </button>
              </div>

              <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F7F7F9] rounded-lg flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#111111]" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#111111]">Email Notifications</h3>
                      <p className="text-xs text-[#6B6B6B]">Receive alerts at {user.email}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={user.alerts?.email !== false}
                      onChange={(e) => {
                        // Construct the new user settings object
                        const updatedUser = { 
                          ...user, 
                          alerts: { ...(user.alerts || { email: true, telegram: false, webhook: false }), email: e.target.checked }
                        };
                        
                        // =====================================================================
                        // TODO (API/DATABASE): UPDATE USER PREFERENCES IN DATABASE
                        // Push this preference change to your backend so the worker stops sending emails.
                        // Example: await fetch('/api/user/preferences', { method: 'PATCH', body: JSON.stringify({ alerts: updatedUser.alerts }) });
                        // =====================================================================
                        
                        store.saveUser(updatedUser); // Save to local storage
                        onUpdateUser?.(updatedUser); // Update parent app React state
                      }}
                    />
                    <div className="w-11 h-6 bg-[#E5E5E5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                  </label>
                </div>

                <div className={`p-6 border-b border-[#E5E5E5] flex items-center justify-between ${user.plan === 'free' ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F7F7F9] rounded-lg flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#111111]" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#111111]">Telegram Integration</h3>
                      <p className="text-xs text-[#6B6B6B]">{user.plan === 'free' ? 'Requires Pro Plan' : 'Receive instant messages'}</p>
                    </div>
                  </div>
                  {user.plan === 'free' ? (
                    <button onClick={() => window.open('https://buy.stripe.com/test_12345', '_blank')} className="text-xs font-medium bg-[#F7F7F9] hover:bg-[#E5E5E5] text-[#111111] px-3 py-1.5 rounded-md border border-[#E5E5E5] transition-colors">
                      Upgrade
                    </button>
                  ) : (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={user.alerts?.telegram || false}
                        onChange={(e) => {
                          const updatedUser = { 
                            ...user, 
                            alerts: { ...(user.alerts || { email: true, telegram: false, webhook: false }), telegram: e.target.checked }
                          };
                          // =====================================================================
                          // TODO (API/DATABASE): UPDATE TELEGRAM PREFERENCES
                          // Example: await fetch('/api/user/preferences', { method: 'PATCH', body: JSON.stringify({ alerts: updatedUser.alerts }) });
                          // =====================================================================
                          store.saveUser(updatedUser);
                          onUpdateUser?.(updatedUser);
                        }}
                      />
                      <div className="w-11 h-6 bg-[#E5E5E5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  )}
                </div>
                
                <div className={`p-6 flex items-center justify-between ${user.plan === 'free' ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F7F7F9] rounded-lg flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#111111]" fill="currentColor"><path d="M2 13h20v-2H2v2zm0 4h20v-2H2v2zm0-8h20V7H2v2zm0-4v2h20V5H2z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#111111]">Webhooks</h3>
                      <p className="text-xs text-[#6B6B6B]">{user.plan === 'free' ? 'Requires Pro Plan' : 'Post to external endpoints'}</p>
                    </div>
                  </div>
                  {user.plan === 'free' ? (
                    <button onClick={() => window.open('https://buy.stripe.com/test_12345', '_blank')} className="text-xs font-medium bg-[#F7F7F9] hover:bg-[#E5E5E5] text-[#111111] px-3 py-1.5 rounded-md border border-[#E5E5E5] transition-colors">
                      Upgrade
                    </button>
                  ) : (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={user.alerts?.webhook || false}
                        onChange={(e) => {
                          const updatedUser = { 
                            ...user, 
                            alerts: { ...(user.alerts || { email: true, telegram: false, webhook: false }), webhook: e.target.checked }
                          };
                          // =====================================================================
                          // TODO (API/DATABASE): UPDATE WEBHOOK PREFERENCES
                          // Example: await fetch('/api/user/preferences', { method: 'PATCH', body: JSON.stringify({ alerts: updatedUser.alerts }) });
                          // =====================================================================
                          store.saveUser(updatedUser);
                          onUpdateUser?.(updatedUser);
                        }}
                      />
                      <div className="w-11 h-6 bg-[#E5E5E5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  )}
                </div>
              </div>

              {/* Webhook History Panel */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-[#111111] mb-4">Webhook History</h3>
                <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E5E5E5] bg-[#F7F7F9]">
                          <th className="py-3 px-4 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Timestamp</th>
                          <th className="py-3 px-4 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Event</th>
                          <th className="py-3 px-4 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Status</th>
                          <th className="py-3 px-4 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider text-right">Response</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {webhookLogs.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-[#6B6B6B] text-sm">
                              No webhooks have been triggered yet. Click "Test Notification" to send a payload.
                            </td>
                          </tr>
                        ) : (
                          webhookLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-[#F7F7F9]/50 transition-colors">
                              <td className="py-4 px-4 text-sm text-[#111111] whitespace-nowrap">{log.timestamp}</td>
                              <td className="py-4 px-4 text-sm text-[#111111] font-medium">{log.event}</td>
                              <td className="py-4 px-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${log.status === 'success' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'}`}>
                                  {log.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />} {log.code} {log.status === 'success' ? 'OK' : 'ERR'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-sm text-[#6B6B6B] text-right font-mono text-xs">{log.response}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {webhookLogs.length > 0 && (
                    <div className="p-4 border-t border-[#E5E5E5] bg-[#F7F7F9] flex justify-center">
                      <button 
                        onClick={() => setWebhookLogs([])}
                        className="text-sm font-medium text-[#6B6B6B] hover:text-[#EF4444] transition-colors"
                      >
                        Clear logs
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : activeRoute === 'profile' ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="max-w-3xl mx-auto"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-[#111111] mb-1">Profile Settings</h2>
                <p className="text-[#6B6B6B] text-sm">Manage your account details and preferences.</p>
              </div>

              <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 mb-6">
                <h3 className="text-sm font-semibold text-[#111111] mb-5">Personal Information</h3>
                
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="flex-shrink-0">
                    <div className="relative group">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border border-[#E5E5E5]" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-[#3154FF]/10 text-[#3154FF] flex items-center justify-center font-bold text-3xl border border-[#E5E5E5]">
                          {capitalizedName.charAt(0)}
                        </div>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <span className="text-xs font-medium">Upload</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const newAvatar = reader.result as string;
                                const updatedUser = { ...user, avatar: newAvatar };
                                store.saveUser(updatedUser);
                                onUpdateUser?.(updatedUser);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#111111] mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={user.name}
                        onBlur={(e) => {
                          if (e.target.value !== user.name) {
                            const updatedUser = { ...user, name: e.target.value };
                            store.saveUser(updatedUser);
                            onUpdateUser?.(updatedUser);
                          }
                        }}
                        className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-md px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#3154FF] focus:ring-1 focus:ring-[#3154FF]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#111111] mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        disabled
                        value={user.email}
                        className="w-full bg-[#F7F7F9] border border-[#E5E5E5] rounded-md px-3 py-2 text-sm text-[#6B6B6B] cursor-not-allowed" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6">
                <h3 className="text-sm font-semibold text-[#111111] mb-5">Subscription Plan</h3>
                <div className="flex items-center justify-between p-4 bg-[#F7F7F9] rounded-lg border border-[#E5E5E5]">
                  <div>
                    <div className="font-medium text-[#111111] capitalize">{user.plan} Plan</div>
                    <div className="text-xs text-[#6B6B6B] mt-0.5">
                      {user.plan === 'free' ? 'Basic monitoring with 5-minute intervals.' : 'Advanced monitoring with 1-minute intervals.'}
                    </div>
                  </div>
                  {user.plan === 'free' && (
                    <button 
                      onClick={() => window.open('https://buy.stripe.com/test_12345', '_blank')}
                      className="bg-[#111111] hover:bg-[#000000] text-white text-xs font-medium px-4 py-2 rounded-md transition-colors"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-[#E5E5E5] rounded-xl text-[#6B6B6B] max-w-5xl mx-auto">
              <div className="text-center">
                <h3 className="text-lg font-medium text-[#111111] mb-1">Coming Soon</h3>
                <p className="text-sm">The {activeRoute.replace('-', ' ')} page is currently under construction.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {monitorToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D18]/80 backdrop-blur-sm font-sans">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFFFFF] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#E5E5E5]"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-[#EF4444]/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
                </div>
                <h3 className="text-lg font-semibold text-[#111111] mb-2">Delete Monitor</h3>
                <p className="text-[#6B6B6B] text-sm">
                  Are you sure you want to delete <span className="font-semibold text-[#111111]">{monitorToDelete.name}</span>? This action cannot be undone and all associated incident history will be lost.
                </p>
                <div className="mt-6 flex gap-3 justify-end">
                  <button 
                    onClick={() => setMonitorToDelete(null)}
                    className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:bg-[#F7F7F9] rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteMonitor}
                    className="px-4 py-2 text-sm font-medium bg-[#EF4444] text-white hover:bg-[#DC2626] rounded-md transition-colors shadow-sm"
                  >
                    Delete Monitor
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#080D18]/80 backdrop-blur-sm font-sans">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#FFFFFF] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#E5E5E5]"
            >
              <div className="p-8">
                {onboardingStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="w-12 h-12 rounded-full bg-[#3154FF]/10 flex items-center justify-center mb-6">
                      <LayoutDashboard className="w-6 h-6 text-[#3154FF]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#111111] mb-3">Welcome to DownAlert</h3>
                    <p className="text-[#6B6B6B] text-sm leading-relaxed">
                      We're glad you're here. DownAlert helps you monitor your websites, APIs, and servers to ensure they are always running smoothly.
                    </p>
                  </motion.div>
                )}
                {onboardingStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="w-12 h-12 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-6">
                      <Activity className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#111111] mb-3">Add Your First Monitor</h3>
                    <p className="text-[#6B6B6B] text-sm leading-relaxed">
                      Click the <span className="inline-flex items-center gap-1 font-semibold text-[#111111] bg-[#F7F7F9] px-2 py-0.5 rounded border border-[#E5E5E5] mx-1"><Plus className="w-3 h-3" /> ADD MONITOR</span> button on your dashboard to start tracking uptime for a new endpoint.
                    </p>
                  </motion.div>
                )}
                {onboardingStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="w-12 h-12 rounded-full bg-[#F59E0B]/10 flex items-center justify-center mb-6">
                      <Bell className="w-6 h-6 text-[#F59E0B]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#111111] mb-3">Stay Alerted</h3>
                    <p className="text-[#6B6B6B] text-sm leading-relaxed">
                      Once configured, we'll keep checking your endpoints and automatically notify you if anything goes down. You're all set!
                    </p>
                  </motion.div>
                )}

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((step) => (
                      <div 
                        key={step} 
                        className={`h-1.5 rounded-full transition-all ${step === onboardingStep ? 'w-6 bg-[#3154FF]' : 'w-1.5 bg-[#E5E5E5]'}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={completeOnboarding}
                      className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#111111] transition-colors"
                    >
                      Skip
                    </button>
                    {onboardingStep < 3 ? (
                      <button 
                        onClick={() => setOnboardingStep(s => s + 1)}
                        className="px-5 py-2 text-sm font-medium bg-[#111111] text-white hover:bg-[#000000] rounded-md transition-colors shadow-sm"
                      >
                        Next
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          completeOnboarding();
                          setIsQuickAddOpen(true);
                        }}
                        className="px-5 py-2 text-sm font-medium bg-[#3154FF] text-white hover:bg-[#2546E5] rounded-md transition-colors shadow-sm"
                      >
                        Get Started
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsQuickAddOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#111111] hover:bg-[#000000] text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 z-40 group"
      >
        <Plus className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-[#111111] text-white text-xs px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Quick Add Monitor
        </span>
      </button>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {isQuickAddOpen && (
          <QuickAddModal 
            isOpen={isQuickAddOpen}
            onClose={() => setIsQuickAddOpen(false)}
            user={user}
            currentMonitorsCount={totalMonitors}
            onSave={(m) => {
              setMonitors([...monitors, m]);
              setIsQuickAddOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

