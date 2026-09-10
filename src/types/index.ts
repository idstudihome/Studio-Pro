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

export type MainView = 'app' | 'kelas' | 'shop' | 'settings';
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
}

export interface MicrotoolAction {
  name: string;
  label: string;
  placeholder: string;
  desc: string;
  inputType: 'text' | 'textarea';
  category: string;
}
