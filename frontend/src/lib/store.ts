export type UserRole = 'user' | 'admin';
export type PlanType = 'free' | 'pro' | 'business';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  plan: PlanType;
  hasCompletedOnboarding?: boolean;
  avatar?: string;
  alerts?: {
    email: boolean;
    telegram: boolean;
    webhook: boolean;
  };
}

export interface Monitor {
  id: string;
  userId: string;
  name: string;
  url: string;
  type: string;
  status: 'operational' | 'degraded' | 'down' | 'paused';
  uptime: string;
  response: string;
  lastCheck: string;
}

export interface Incident {
  id: string;
  monitorId: string;
  title: string;
  status: 'active' | 'resolved';
  startedAt: string;
  resolvedAt?: string;
  duration?: string;
}

const STORAGE_KEY_USERS = 'downalert_users';
const STORAGE_KEY_MONITORS = 'downalert_monitors';
const STORAGE_KEY_INCIDENTS = 'downalert_incidents';

// Initialize with some demo data if empty
const initializeStore = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(STORAGE_KEY_USERS)) {
    const defaultAdmin: User = {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@downalert.com',
      password: 'admin',
      role: 'admin',
      plan: 'business'
    };
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([defaultAdmin]));
  }
  
  if (!localStorage.getItem(STORAGE_KEY_MONITORS)) {
    localStorage.setItem(STORAGE_KEY_MONITORS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEY_INCIDENTS)) {
    localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify([]));
  }
};

export const store = {
  init: initializeStore,
  
  // Users
  getUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
  },
  getUserByEmail: (email: string): User | undefined => {
    return store.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  saveUser: (user: User) => {
    const users = store.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  },
  
  // Monitors
  getMonitors: (userId?: string): Monitor[] => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_MONITORS) || '[]');
    if (userId) return all.filter((m: Monitor) => m.userId === userId);
    return all;
  },
  saveMonitor: (monitor: Monitor) => {
    const monitors = store.getMonitors();
    const index = monitors.findIndex(m => m.id === monitor.id);
    if (index >= 0) {
      monitors[index] = monitor;
    } else {
      monitors.push(monitor);
    }
    localStorage.setItem(STORAGE_KEY_MONITORS, JSON.stringify(monitors));
  },
  deleteMonitor: (id: string) => {
    const monitors = store.getMonitors().filter((m: Monitor) => m.id !== id);
    localStorage.setItem(STORAGE_KEY_MONITORS, JSON.stringify(monitors));
  },
  
  // Incidents
  getIncidents: (): Incident[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_INCIDENTS) || '[]');
  }
};

// Run initialization
if (typeof window !== 'undefined') {
  store.init();
}
