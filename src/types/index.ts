export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider?: string;
  isLoggedIn: boolean;
}

export interface AccountProfile {
  id: string;
  name: string;
  tier: 'PRO' | 'FREE';
  credit: number;
  token?: string;
  active?: boolean;
}

export interface StoryboardScene {
  number: number;
  title: string;
  visual: string;
  camera: string;
  voiceover: string;
  prompt: string;
}

export type MainView = 'app' | 'kelas' | 'shop' | 'settings' | 'admin';
export type StudioTab = 'tools' | 'storyboard' | 'history';

export interface ToolConfig {
  id: string;
  name: string;
  category: 'video' | 'assistant' | 'social' | 'riset';
  url: string;
  template: 'flow' | 'grok' | 'capcut' | 'generic';
  title: string;
  desc: string;
  color: string;
  status?: 'active' | 'maintenance' | 'hidden';
}

export interface AdminMetricSummary {
  totalUsers: number;
  activeAccounts: number;
  totalTransactions: number;
  totalRevenue: number;
  totalRenderedVideos: number;
  apiSuccessRate: number;
}

export interface AdminProduct {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  category: string;
  sales: number;
  active: boolean;
  desc: string;
  features: string[];
}

export interface AdminCourse {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  category: string;
  desc: string;
  studentCount?: number;
}

export interface AdminTransaction {
  id: string;
  userName: string;
  userEmail: string;
  productTitle: string;
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'CANCELLED';
  date: string;
  paymentMethod: string;
}

export interface AdminSystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'success' | 'error';
  module: string;
  message: string;
}

export interface MicrotoolAction {
  name: string;
  label: string;
  placeholder: string;
  desc: string;
  inputType: 'text' | 'textarea';
  category: string;
}
