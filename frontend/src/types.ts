export interface MonitorCheck {
  id: string;
  timestamp: string;
  timeFormatted: string;
  statusCode: number;
  statusText: string;
  responseTimeMs: number;
  region: string;
  healthy: boolean;
}

export interface MonitorItem {
  id: string;
  name: string;
  url: string;
  status: 'operational' | 'degraded' | 'down';
  uptimePercent: number;
  avgResponseMs: number;
  lastCheckSecondsAgo: number;
  checkInterval: number; // in seconds
  responseHistory: number[]; // response time history in ms
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
  ctaText: string;
}
