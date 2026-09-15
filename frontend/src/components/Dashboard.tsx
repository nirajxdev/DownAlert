import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity, Search, Bell, Plus, MoreHorizontal, CheckCircle2,
  LayoutDashboard, Server, AlertTriangle, Radio, Settings, LogOut,
  Shield, Menu, X, ArrowUpRight, ArrowLeft, ChevronDown, Pencil, Trash2, Globe, TrendingDown, TrendingUp, Zap,
  RefreshCw, Clock, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GlobalNodeDistribution from './GlobalNodeDistribution';
import PerformanceChart from './PerformanceChart';
import StatusPage from './StatusPage';
import {
  listMonitors,
  createMonitor,
  updateMonitor,
  deleteMonitor,
  runCheck,
  listChecks,
  listAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  sendTestAlert,
  hydrateMonitor,
  displayName,
  isPaid,
  maxMonitors,
  defaultInterval,
  intervalLabel,
  friendlyApiError,
  ApiError,
  type User,
  type Monitor,
  type ApiAlert,
  type ApiCheck,
} from '../lib/api';

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

  const monitorLimit = maxMonitors(user.plan);
  const limitReached = currentMonitorsCount >= monitorLimit;
  const checkInterval = intervalLabel(user.plan);

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

    // Lightweight reachability pre-check (opaque response only proves DNS+TCP).
    // The authoritative result comes from the backend probe below.
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch(formattedUrl, {
        mode: 'no-cors',
        signal: controller.signal,
        method: 'HEAD'
      });
      clearTimeout(timeoutId);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Connection timed out. Please check if the website is online.');
      } else {
        setError('Unable to reach website. Please check the URL and try again.');
      }
      setIsVerifying(false);
      return;
    }

    // Create the monitor on the backend — this starts real scheduled checks.
    try {
      const newMonitor = await createMonitor({
        name,
        url: formattedUrl,
        check_interval_seconds: defaultInterval(user.plan),
      });
      onSave(newMonitor);
      setUrl('');
    } catch (err) {
      setError(friendlyApiError(err));
    } finally {
      setIsVerifying(false);
    }
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
            Enter the website link below. Your <span className="font-semibold text-[#111111] capitalize">{user.plan}</span> plan includes up to {monitorLimit} monitors with {checkInterval} check intervals.
          </p>

          {limitReached ? (
            <div className="bg-[#F7F7F9] border border-[#E5E5E5] rounded-lg p-5 text-center space-y-4">
              <div className="w-12 h-12 bg-[#E5E5E5] rounded-full flex items-center justify-center mx-auto text-[#111111]">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-[#111111]">Limit Reached</h4>
                <p className="text-sm text-[#6B6B6B] mt-1">
                  You are currently monitoring {currentMonitorsCount} of {monitorLimit} websites. 
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

const EditMonitorModal = ({ monitor, user, onClose, onSave }: { monitor: Monitor, user: User, onClose: () => void, onSave: (m: Monitor) => void }) => {
  const [name, setName] = useState(monitor.name);
  const [url, setUrl] = useState(monitor.url);
  const [interval, setInterval] = useState(String(monitor.checkInterval));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paid = isPaid(user.plan);
  const minSecs = paid ? 60 : 300;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const patch: { name?: string; url?: string; check_interval_seconds?: number } = {};
    if (name.trim() && name.trim() !== monitor.name) patch.name = name.trim();
    if (url.trim() && url.trim() !== monitor.url) patch.url = url.trim();
    const secs = parseInt(interval);
    if (!Number.isNaN(secs) && secs !== monitor.checkInterval) {
      if (secs < minSecs || secs > 86400) {
        setError(`Check interval must be between ${minSecs} and 86400 seconds on your plan.`);
        return;
      }
      patch.check_interval_seconds = secs;
    }
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      const updated = await updateMonitor(monitor.id, patch);
      onSave(updated);
      onClose();
    } catch (err) {
      setError(friendlyApiError(err));
    } finally {
      setSaving(false);
    }
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
            <h3 className="text-lg font-semibold text-[#111111]">Edit Monitor</h3>
            <button onClick={onClose} disabled={saving} className="text-[#6B6B6B] hover:text-[#111111] transition-colors p-1 disabled:opacity-50">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1.5">Name</label>
              <input
                type="text"
                required
                disabled={saving}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-md px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#3154FF] focus:ring-1 focus:ring-[#3154FF] shadow-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1.5">Website URL</label>
              <input
                type="text"
                required
                disabled={saving}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-md px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#3154FF] focus:ring-1 focus:ring-[#3154FF] shadow-sm disabled:opacity-50"
              />
              <p className="text-xs text-[#A3A3A3] mt-1.5">Changing the URL resets status to pending and re-checks immediately.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1.5">Check interval (seconds)</label>
              <input
                type="number"
                disabled={saving}
                value={interval}
                min={minSecs}
                max={86400}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-md px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#3154FF] focus:ring-1 focus:ring-[#3154FF] shadow-sm disabled:opacity-50"
              />
              <p className="text-xs text-[#A3A3A3] mt-1.5">Minimum {minSecs}s on your plan.</p>
            </div>
            {error && (
              <p className="text-[#EF4444] text-xs flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> {error}</p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#111111] hover:bg-[#000000] text-white text-sm font-medium px-6 py-3 rounded-md transition-colors shadow-sm flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <><Activity className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const RuleToggle = ({ checked, onChange, disabled, label }: { checked: boolean, onChange: (v: boolean) => void, disabled?: boolean, label: string }) => (
  <label className="relative inline-flex items-center cursor-pointer" title={label}>
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
    />
    <div className="w-11 h-6 bg-[#E5E5E5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981] peer-disabled:opacity-50"></div>
  </label>
);

const MonitorRow = ({ monitor, onEdit, onDelete, onCheck, checking }: { key?: React.Key, monitor: Monitor, onEdit: (m: Monitor) => void, onDelete: (m: Monitor) => void, onCheck: (m: Monitor) => void, checking: boolean }) => {
  const latency = parseInt(monitor.response);
  const isPending = monitor.status === 'pending';
  const isOffline = monitor.status === 'down';

  let StatusIcon = CheckCircle2;
  let colorClass = 'text-[#10B981]';
  let bgClass = 'bg-[#10B981]/10';

  if (isPending) {
    StatusIcon = Clock;
    colorClass = 'text-[#6B6B6B]';
    bgClass = 'bg-[#6B6B6B]/10';
  } else if (isOffline || latency >= 800) {
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
            onClick={(e) => { e.stopPropagation(); onCheck(monitor); }}
            disabled={checking}
            className="text-[#6B6B6B] hover:text-[#10B981] p-2 sm:p-1.5 rounded-md hover:bg-[#10B981]/10 transition-colors disabled:opacity-50"
            title="Run check now"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          </button>
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

export interface Incident {
  id: string;
  monitorId: string;
  monitorName: string;
  startedAt: string;
  endedAt: string | null;
  checkCount: number;
}

const ONBOARD_KEY = (userId: string) => `downalert_onboarded_${userId}`;

const deriveIncidents = (monitors: Monitor[], checksById: Record<string, ApiCheck[]>): Incident[] => {
  const incidents: Incident[] = [];
  for (const m of monitors) {
    const checks = [...(checksById[m.id] ?? [])].sort(
      (a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime()
    );
    let runStart: ApiCheck | null = null;
    let runCount = 0;
    const flush = (end: ApiCheck | null) => {
      if (runStart) {
        incidents.push({
          id: `${m.id}-${runStart.id}`,
          monitorId: m.id,
          monitorName: m.name,
          startedAt: runStart.checked_at,
          endedAt: end && end.success ? end.checked_at : null,
          checkCount: runCount,
        });
      }
      runStart = null;
      runCount = 0;
    };
    for (const c of checks) {
      if (!c.success) {
        if (!runStart) runStart = c;
        runCount += 1;
      } else {
        flush(c);
      }
    }
    flush(null);
  }
  return incidents.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
};

export default function Dashboard({ user, onLogout }: DashboardProps & { onUpdateUser?: (u: User) => void }) {
  const [activeRoute, setActiveRoute] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [checksByMonitor, setChecksByMonitor] = useState<Record<string, ApiCheck[]>>({});
  const [alerts, setAlerts] = useState<ApiAlert[]>([]);
  const [loadingMonitors, setLoadingMonitors] = useState(true);
  const [monitorsError, setMonitorsError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Monitor | null>(null);
  const [monitorToDelete, setMonitorToDelete] = useState<Monitor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [checkingIds, setCheckingIds] = useState<string[]>([]);

  const [isTestingAlert, setIsTestingAlert] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [alertFormTarget, setAlertFormTarget] = useState<{ [monitorId: string]: string }>({});
  const [savingAlertId, setSavingAlertId] = useState<string | null>(null);

  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem(ONBOARD_KEY(user.id));
    } catch {
      return true;
    }
  });
  const [onboardingStep, setOnboardingStep] = useState(1);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    try {
      localStorage.setItem(ONBOARD_KEY(user.id), '1');
    } catch {
      /* onboarding flag is best-effort */
    }
  };

  const handleAuthError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 401) {
      onLogout();
      return true;
    }
    return false;
  };

  const refreshChecksFor = async (monitorId: string, base: Monitor): Promise<Monitor> => {
    const checks = await listChecks(monitorId, 50);
    setChecksByMonitor(prev => ({ ...prev, [monitorId]: checks }));
    return hydrateMonitor(base, checks);
  };

  const fetchAll = async () => {
    setLoadingMonitors(true);
    setMonitorsError(null);
    try {
      const [fetchedMonitors, fetchedAlerts] = await Promise.all([listMonitors(), listAlerts()]);
      const hydrated = await Promise.all(
        fetchedMonitors.map(async (m) => {
          try {
            const checks = await listChecks(m.id, 50);
            setChecksByMonitor(prev => ({ ...prev, [m.id]: checks }));
            return hydrateMonitor(m, checks);
          } catch {
            return m;
          }
        })
      );
      setMonitors(hydrated);
      setAlerts(fetchedAlerts);
    } catch (err) {
      if (!handleAuthError(err)) {
        setMonitorsError(friendlyApiError(err));
      }
    } finally {
      setLoadingMonitors(false);
    }
  };

  // Fetch monitors + alerts + check history when the user changes.
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const handleDeleteMonitor = async () => {
    if (!monitorToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteMonitor(monitorToDelete.id);
      setMonitors(monitors.filter(m => m.id !== monitorToDelete.id));
      setAlerts(alerts.filter(a => a.monitor_id !== monitorToDelete.id));
      setMonitorToDelete(null);
      setNotice(`Monitor "${monitorToDelete.name}" deleted.`);
    } catch (err) {
      if (!handleAuthError(err)) {
        setNotice(friendlyApiError(err));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRunCheck = async (monitor: Monitor) => {
    if (checkingIds.includes(monitor.id)) return;
    setCheckingIds(prev => [...prev, monitor.id]);
    try {
      const updated = await runCheck(monitor.id);
      const hydrated = await refreshChecksFor(monitor.id, updated);
      setMonitors(prev => prev.map(m => (m.id === monitor.id ? hydrated : m)));
      setNotice(`Check completed for "${monitor.name}".`);
    } catch (err) {
      if (!handleAuthError(err)) {
        setNotice(friendlyApiError(err));
      }
    } finally {
      setCheckingIds(prev => prev.filter(id => id !== monitor.id));
    }
  };

  const handleTestAlert = async () => {
    if (isTestingAlert) return;
    setIsTestingAlert(true);
    setTestSuccess(false);
    setTestError(null);
    try {
      await sendTestAlert(user.email);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 4000);
    } catch (err) {
      if (!handleAuthError(err)) {
        setTestError(friendlyApiError(err));
      }
    } finally {
      setIsTestingAlert(false);
    }
  };

  const handleCreateAlert = async (monitorId: string) => {
    const target = (alertFormTarget[monitorId] ?? user.email).trim();
    if (!target) return;
    setSavingAlertId(monitorId);
    try {
      const alert = await createAlert({ monitor_id: monitorId, target });
      setAlerts(prev => [alert, ...prev]);
      setNotice(`Alert created for ${target}.`);
    } catch (err) {
      if (!handleAuthError(err)) {
        setNotice(friendlyApiError(err));
      }
    } finally {
      setSavingAlertId(null);
    }
  };

  const handleToggleAlert = async (alert: ApiAlert, patch: { is_enabled?: boolean; on_down?: boolean; on_recovery?: boolean }) => {
    setSavingAlertId(alert.id);
    try {
      const updated = await updateAlert(alert.id, patch);
      setAlerts(prev => prev.map(a => (a.id === alert.id ? updated : a)));
    } catch (err) {
      if (!handleAuthError(err)) {
        setNotice(friendlyApiError(err));
      }
    } finally {
      setSavingAlertId(null);
    }
  };

  const handleDeleteAlert = async (alert: ApiAlert) => {
    setSavingAlertId(alert.id);
    try {
      await deleteAlert(alert.id);
      setAlerts(prev => prev.filter(a => a.id !== alert.id));
      setNotice('Alert rule deleted.');
    } catch (err) {
      if (!handleAuthError(err)) {
        setNotice(friendlyApiError(err));
      }
    } finally {
      setSavingAlertId(null);
    }
  };

  // Calculate stats
  const operationalCount = monitors.filter(m => m.status === 'operational').length;
  const pendingCount = monitors.filter(m => m.status === 'pending').length;
  const downCount = monitors.filter(m => m.status === 'down').length;

  const totalMonitors = monitors.length;
  const isHealthy = downCount === 0;

  let overallUptime = '—';
  if (totalMonitors > 0) {
    const uptimeVals = monitors.map(m => parseFloat(m.uptime.replace('%', ''))).filter(n => !isNaN(n));
    if (uptimeVals.length > 0) {
      const avg = uptimeVals.reduce((a, b) => a + b, 0) / uptimeVals.length;
      overallUptime = avg.toFixed(2) + '%';
    }
  }

  let avgResponse: string = '—';
  {
    const latencies = monitors
      .map(m => parseInt(m.response))
      .filter(n => !isNaN(n));
    if (latencies.length > 0) {
      avgResponse = `${Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)}ms`;
    }
  }

  const incidents = useMemo(
    () => deriveIncidents(monitors, checksByMonitor),
    [monitors, checksByMonitor]
  );
  const activeIncidents = incidents.filter(i => i.endedAt === null);

  const chartPoints = useMemo(() => {
    const all: ApiCheck[] = (Object.values(checksByMonitor) as ApiCheck[][]).reduce(
      (acc, arr) => acc.concat(arr),
      []
    );
    return all
      .filter(c => c.response_time_ms !== null)
      .sort((a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime())
      .slice(-24)
      .map(c => ({
        time: new Date(c.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latency: c.response_time_ms as number,
      }));
  }, [checksByMonitor]);

  // Display name is derived from the email address (backend stores no name).
  const capitalizedName = displayName(user.email);
  const paidPlan = isPaid(user.plan);
  const planLimit = maxMonitors(user.plan);
  const planIntervalLabel = intervalLabel(user.plan);

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

        </div>
        
        <div className="p-4 border-t border-[#E5E5E5] hover:bg-[#F7F7F9] cursor-pointer transition-colors" onClick={() => setActiveRoute('profile')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#3154FF]/10 text-[#3154FF] flex items-center justify-center font-bold text-sm">
                {capitalizedName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#111111] truncate max-w-[120px] leading-tight">{capitalizedName}</span>
                <div className="flex items-center gap-1.5 mt-1 relative group cursor-help">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide ${
                    paidPlan
                      ? 'bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-[#78350F] shadow-sm border border-[#F59E0B]/20'
                      : 'bg-[#F7F7F9] border border-[#E5E5E5] text-[#6B6B6B]'
                  }`}>
                    {paidPlan ? 'PRO' : 'FREE'}
                  </span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-0 mb-2 w-48 p-2.5 bg-[#111111] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-[#30363D]">
                    <div className="font-semibold mb-1 text-white">
                      {paidPlan ? 'Pro Plan Active' : 'Free Plan Active'}
                    </div>
                    <div className="text-[#8B949E] space-y-1 mt-1.5">
                      {paidPlan ? (
                        <>
                          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#10B981]" /> 1-minute check intervals</div>
                          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#10B981]" /> Up to 5 monitors</div>
                          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#10B981]" /> Email alerts</div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#6B6B6B]" /> 5-minute check intervals</div>
                          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#6B6B6B]" /> 1 monitor limit</div>
                          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#6B6B6B]" /> Email alerts</div>
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
          {notice && (
            <div className="max-w-5xl mx-auto mb-4 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#111111] flex items-center justify-between gap-3 shadow-sm">
              <span>{notice}</span>
              <button onClick={() => setNotice(null)} className="text-[#6B6B6B] hover:text-[#111111] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {monitorsError && (
            <div className="max-w-5xl mx-auto mb-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg px-4 py-3 text-sm text-[#EF4444] flex items-center justify-between gap-3">
              <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {monitorsError}</span>
              <button onClick={fetchAll} className="font-medium hover:underline shrink-0">Retry</button>
            </div>
          )}
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
                        {isHealthy ? 'No active incidents on your monitors.' : `${downCount} monitor(s) experiencing issues.`}
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
                      <div className="text-2xl font-semibold text-[#111111]">{avgResponse}</div>
                    </div>
                    <div className="pl-4 sm:pl-6">
                      <div className="text-[#6B6B6B] text-xs font-medium mb-1 uppercase tracking-wide truncate">Incidents</div>
                      <div className={`text-2xl font-semibold ${!isHealthy ? 'text-[#EF4444]' : 'text-[#111111]'}`}>
                        {activeIncidents.length}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Plan Usage Summary */}
                <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 flex flex-col justify-between relative overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-[#111111]">Plan Usage</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${!paidPlan ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' : 'bg-[#3154FF]/10 text-[#3154FF] border-[#3154FF]/20'}`}>
                        {paidPlan ? 'pro' : 'free'}
                      </span>
                    </div>

                    <div className="mb-2 flex justify-between items-end">
                      <div className="text-sm font-medium text-[#111111]">Monitors Limit</div>
                      <div className="text-sm font-semibold text-[#111111]">{totalMonitors} / {planLimit}</div>
                    </div>
                    <div className="w-full bg-[#F7F7F9] rounded-full h-2 mb-6 border border-[#E5E5E5] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${totalMonitors >= planLimit ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`}
                        style={{ width: `${Math.min(100, (totalMonitors / planLimit) * 100)}%` }}
                      ></div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6B6B6B]">Check Interval</span>
                        <span className="font-medium text-[#111111]">{paidPlan ? '1 Minute' : '5 Minutes'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6B6B6B]">Data Retention</span>
                        <span className="font-medium text-[#111111]">{paidPlan ? '1 Year' : '7 Days'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6B6B6B]">Alert Channels</span>
                        <span className="font-medium text-[#111111]">Email</span>
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

              {/* Response insight (real check data) */}
              {chartPoints.length > 0 && (
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <h3 className="text-sm font-medium text-[#111111]">Average Response Time</h3>
                      <span className="bg-[#F7F7F9] text-[#6B6B6B] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-[#E5E5E5]">Recent checks</span>
                    </div>
                    <div className="text-3xl font-semibold text-[#111111] mb-1 relative z-10">{avgResponse}</div>
                    <p className="text-xs text-[#6B6B6B] mt-2 relative z-10">Across the last {chartPoints.length} recorded checks</p>
                  </div>

                  <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <h3 className="text-sm font-medium text-[#111111]">Recorded Incidents</h3>
                      <span className="bg-[#F7F7F9] text-[#6B6B6B] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-[#E5E5E5]">Check history</span>
                    </div>
                    <div className="text-3xl font-semibold text-[#111111] mb-1 relative z-10">{incidents.length}</div>
                    <p className="text-xs text-[#6B6B6B] mt-2 relative z-10">{activeIncidents.length} active right now</p>
                  </div>
                </motion.div>
              )}

              {/* Performance Trend Chart */}
              {chartPoints.length > 0 ? (
                <motion.div variants={itemVariants} className="mb-8">
                  <PerformanceChart points={chartPoints} />
                </motion.div>
              ) : totalMonitors > 0 ? (
                <motion.div variants={itemVariants} className="mb-8 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 text-center text-sm text-[#6B6B6B]">
                  No check data yet — checks run every {planIntervalLabel}. Use the refresh button on a monitor to probe it right now.
                </motion.div>
              ) : null}

              {/* Monitor Health Breakdown */}
              {totalMonitors > 0 && (
                <motion.div variants={itemVariants} className="mb-6">
                  <h3 className="text-sm font-semibold text-[#111111] mb-3">Monitor Health</h3>
                  <div className="flex gap-2 h-3 rounded-full overflow-hidden bg-[#F7F7F9] border border-[#E5E5E5]">
                    <div className="bg-[#10B981] h-full" style={{ width: `${(operationalCount/totalMonitors)*100}%` }} title={`Operational (${operationalCount})`}></div>
                    <div className="bg-[#A3A3A3] h-full" style={{ width: `${(pendingCount/totalMonitors)*100}%` }} title={`Pending (${pendingCount})`}></div>
                    <div className="bg-[#EF4444] h-full" style={{ width: `${(downCount/totalMonitors)*100}%` }} title={`Down (${downCount})`}></div>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1.5 text-[#6B6B6B]"><div className="w-2 h-2 rounded-full bg-[#10B981]"></div> Operational ({operationalCount})</div>
                    <div className="flex items-center gap-1.5 text-[#6B6B6B]"><div className="w-2 h-2 rounded-full bg-[#A3A3A3]"></div> Pending ({pendingCount})</div>
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
                      {loadingMonitors ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-16 text-center text-[#6B6B6B]">
                            <p className="flex items-center justify-center gap-2 text-sm"><Activity className="w-4 h-4 animate-spin" /> Loading monitors...</p>
                          </td>
                        </tr>
                      ) : monitors.length === 0 ? (
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
                          onEdit={(m) => setEditTarget(m)}
                          onDelete={(m) => setMonitorToDelete(m)}
                          onCheck={handleRunCheck}
                          checking={checkingIds.includes(monitor.id)}
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

              {totalMonitors > 0 && chartPoints.length > 0 && (
                <div className="mb-8">
                  <PerformanceChart points={chartPoints} />
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
                      {loadingMonitors ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-16 text-center text-[#6B6B6B]">
                            <p className="flex items-center justify-center gap-2 text-sm"><Activity className="w-4 h-4 animate-spin" /> Loading monitors...</p>
                          </td>
                        </tr>
                      ) : monitors.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-16 text-center text-[#6B6B6B]">
                            <p>No monitors found. Click "Add Monitor" to get started.</p>
                          </td>
                        </tr>
                      ) : monitors.map((monitor) => (
                        <MonitorRow
                          key={monitor.id}
                          monitor={monitor}
                          onEdit={(m) => setEditTarget(m)}
                          onDelete={(m) => setMonitorToDelete(m)}
                          onCheck={handleRunCheck}
                          checking={checkingIds.includes(monitor.id)}
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
                <p className="text-[#6B6B6B] text-sm">Downtime windows derived from recorded check history.</p>
              </div>

              {incidents.length === 0 ? (
                <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#111111] mb-2">No Incidents Recorded</h3>
                  <p className="text-[#6B6B6B] text-sm max-w-md mx-auto">
                    {totalMonitors === 0
                      ? 'Add a monitor to start recording checks. Any downtime will be logged here.'
                      : 'No failed checks in recorded history. Any future downtime will be logged here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${incident.endedAt === null ? 'bg-[#EF4444]/10' : 'bg-[#10B981]/10'}`}>
                        {incident.endedAt === null ? (
                          <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[#111111]">{incident.monitorName}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${incident.endedAt === null ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20' : 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'}`}>
                            {incident.endedAt === null ? 'Active' : 'Resolved'}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B6B6B] mt-1">
                          Started {new Date(incident.startedAt).toLocaleString()}
                          {incident.endedAt ? ` · Resolved ${new Date(incident.endedAt).toLocaleString()}` : ' · Ongoing'}
                          {` · ${incident.checkCount} failed check${incident.checkCount === 1 ? '' : 's'}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            <StatusPage onBack={() => setActiveRoute('status-pages')} monitors={monitors} points={chartPoints} />
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
                  <p className="text-[#6B6B6B] text-sm">Email rules per monitor. Test sends a real email to {user.email}.</p>
                </div>
                <button
                  onClick={handleTestAlert}
                  disabled={isTestingAlert}
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
              {testError && (
                <p className="text-[#EF4444] text-sm mb-4 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> {testError}</p>
              )}

              <div className="space-y-4">
                {monitors.length === 0 ? (
                  <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-8 text-center text-sm text-[#6B6B6B]">
                    Add a monitor first — then return here to configure who gets emailed when it goes down.
                  </div>
                ) : (
                  monitors.map((m) => {
                    const rule = alerts.find((a) => a.monitor_id === m.id);
                    const saving = savingAlertId === (rule ? rule.id : m.id);
                    return (
                      <div key={m.id} className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${m.status === 'down' ? 'bg-[#EF4444]' : m.status === 'pending' ? 'bg-[#A3A3A3]' : 'bg-[#10B981]'}`}></span>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-[#111111] truncate">{m.name}</h3>
                              <p className="text-xs text-[#6B6B6B] font-mono truncate">{m.url}</p>
                            </div>
                          </div>
                          {rule && (
                            <button
                              onClick={() => handleDeleteAlert(rule)}
                              disabled={saving}
                              className="text-[#6B6B6B] hover:text-[#EF4444] p-1.5 rounded-md hover:bg-[#EF4444]/10 transition-colors disabled:opacity-50 shrink-0"
                              title="Delete alert rule"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {rule ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="text-[#6B6B6B]">Notify <span className="font-medium text-[#111111]">{rule.target}</span></span>
                              <RuleToggle
                                checked={rule.is_enabled}
                                disabled={saving}
                                onChange={(v) => handleToggleAlert(rule, { is_enabled: v })}
                                label="Enabled"
                              />
                            </div>
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="text-[#6B6B6B]">On downtime</span>
                              <RuleToggle
                                checked={rule.on_down}
                                disabled={saving}
                                onChange={(v) => handleToggleAlert(rule, { on_down: v })}
                                label="Down alerts"
                              />
                            </div>
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="text-[#6B6B6B]">On recovery</span>
                              <RuleToggle
                                checked={rule.on_recovery}
                                disabled={saving}
                                onChange={(v) => handleToggleAlert(rule, { on_recovery: v })}
                                label="Recovery alerts"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="email"
                              value={alertFormTarget[m.id] ?? user.email}
                              onChange={(e) => setAlertFormTarget((prev) => ({ ...prev, [m.id]: e.target.value }))}
                              placeholder="you@example.com"
                              className="flex-1 bg-[#FFFFFF] border border-[#E5E5E5] rounded-md px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#3154FF] focus:ring-1 focus:ring-[#3154FF]"
                            />
                            <button
                              onClick={() => handleCreateAlert(m.id)}
                              disabled={saving}
                              className="bg-[#111111] hover:bg-[#000000] text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              <Send className="w-3.5 h-3.5" /> Add email alert
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Email is the only channel the API supports today. */}
                


              {/* How email alerts work */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-[#111111] mb-4">How email alerts work</h3>
                <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 text-sm text-[#6B6B6B] space-y-2">
                  <p>When a monitor transitions from UP to DOWN, every enabled rule for that monitor receives an email. When it recovers, recovery emails go out to rules with recovery enabled.</p>
                  <p>Emails are sent from <span className="font-medium text-[#111111]">alerts@downalert.in</span>. New monitors get an email rule for your account address automatically — edit the target above to change it.</p>
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
                    <div className="w-24 h-24 rounded-full bg-[#3154FF]/10 text-[#3154FF] flex items-center justify-center font-bold text-3xl border border-[#E5E5E5]">
                      {capitalizedName.charAt(0)}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#111111] mb-1.5">Display Name</label>
                      <input
                        type="text"
                        disabled
                        value={capitalizedName}
                        className="w-full bg-[#F7F7F9] border border-[#E5E5E5] rounded-md px-3 py-2 text-sm text-[#6B6B6B] cursor-not-allowed"
                      />
                      <p className="text-xs text-[#A3A3A3] mt-1.5">Derived from your email address.</p>
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
                    <div>
                      <label className="block text-xs font-medium text-[#111111] mb-1.5">Member Since</label>
                      <input
                        type="text"
                        disabled
                        value={new Date(user.createdAt).toLocaleDateString()}
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
                    <div className="font-medium text-[#111111] capitalize">{paidPlan ? 'Pro' : 'Free'} Plan</div>
                    <div className="text-xs text-[#6B6B6B] mt-0.5">
                      {paidPlan ? 'Advanced monitoring with 1-minute intervals.' : 'Basic monitoring with 5-minute intervals.'}
                    </div>
                  </div>
                  {!paidPlan && (
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
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm font-medium bg-[#EF4444] text-white hover:bg-[#DC2626] rounded-md transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Monitor'}
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
              // New monitors get an email rule for the account address automatically
              // so downtime actually notifies. Best-effort: rules can be edited later.
              createAlert({ monitor_id: m.id, target: user.email })
                .then((alert) => setAlerts((prev) => [alert, ...prev]))
                .catch(() => setNotice(`Monitor "${m.name}" added. Open Alerts to configure email notifications.`));
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Monitor Modal */}
      <AnimatePresence>
        {editTarget && (
          <EditMonitorModal
            monitor={editTarget}
            user={user}
            onClose={() => setEditTarget(null)}
            onSave={async (updated) => {
              setMonitors((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
              try {
                const hydrated = await refreshChecksFor(updated.id, updated);
                setMonitors((prev) => prev.map((x) => (x.id === updated.id ? hydrated : x)));
              } catch {
                /* checks refresh is best-effort */
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

