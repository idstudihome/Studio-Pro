import React from 'react';
import {
  X,
  Plus,
  Crown,
  Zap,
  Sparkles,
  Bot,
  Palette,
  Scissors,
  StickyNote,
  Share2,
  TrendingUp,
  LineChart,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { AccountProfile, ToolConfig } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeToolId: string;
  onSelectTool: (toolId: string) => void;
  accounts: AccountProfile[];
  activeAccountId: string;
  onSelectAccount: (accountId: string) => void;
  onOpenAddAccount: () => void;
  toolsConfig?: Record<string, ToolConfig>;
}

export const TOOLS_CONFIG: Record<string, ToolConfig> = {
  Flow: {
    id: 'Flow',
    name: 'Google Flow',
    category: 'video',
    url: 'https://labs.google/fx/tools/flow',
    template: 'flow',
    title: 'Google Flow Video Studio',
    desc: 'Generasi video sinematik berbasis prompt dengan konsistensi frame & camera moves.',
    color: 'blue',
  },
  Gemini: {
    id: 'Gemini',
    name: 'Gemini Advanced',
    category: 'assistant',
    url: 'https://gemini.google.com',
    template: 'generic',
    title: 'Gemini Advanced Workspace',
    desc: 'Model penalaran multimodal terkini dengan integrasi Gemini di Studio Pro.',
    color: 'purple',
  },
  Grok: {
    id: 'Grok',
    name: 'Grok (xAI)',
    category: 'assistant',
    url: 'https://grok.com',
    template: 'grok',
    title: 'Grok Reasoning Engine',
    desc: 'Eksplorasi ide analitis bebas dan penalaran komprehensif dari xAI.',
    color: 'zinc',
  },
  ChatGPT: {
    id: 'ChatGPT',
    name: 'ChatGPT Plus',
    category: 'assistant',
    url: 'https://chatgpt.com',
    template: 'generic',
    title: 'ChatGPT Plus Assistant',
    desc: 'Asisten percakapan dan perumusan naskah kreatif interaktif.',
    color: 'emerald',
  },
  Canva: {
    id: 'Canva',
    name: 'Canva Pro',
    category: 'assistant',
    url: 'https://www.canva.com',
    template: 'generic',
    title: 'Canva Pro Editor',
    desc: 'Desain grafis, thumbnail YouTube, dan konten media sosial terintegrasi.',
    color: 'cyan',
  },
  CapCut: {
    id: 'CapCut',
    name: 'CapCut Editor',
    category: 'assistant',
    url: 'https://www.capcut.com/editor',
    template: 'capcut',
    title: 'CapCut Studio Editor',
    desc: 'Editor video multi-track dengan timeline, transisi, dan efek sinematik.',
    color: 'zinc',
  },
  GoogleNotes: {
    id: 'GoogleNotes',
    name: 'Google Notes',
    category: 'assistant',
    url: 'https://keep.google.com',
    template: 'generic',
    title: 'Catatan & Memo Kreatif',
    desc: 'Simpan ide instan, naskah kasar, dan to-do list produksi.',
    color: 'amber',
  },
  TikTok: {
    id: 'TikTok',
    name: 'TikTok Creator',
    category: 'social',
    url: 'https://www.tiktok.com',
    template: 'generic',
    title: 'TikTok Creator Center',
    desc: 'Publikasi video pendek, analisis penonton, dan tren musik FYP.',
    color: 'zinc',
  },
  YouTube: {
    id: 'YouTube',
    name: 'YouTube Studio',
    category: 'social',
    url: 'https://studio.youtube.com',
    template: 'generic',
    title: 'YouTube Studio Dashboard',
    desc: 'Manajemen channel, monetisasi video, dan metrik penonton YouTube.',
    color: 'red',
  },
  Instagram: {
    id: 'Instagram',
    name: 'Instagram Creator',
    category: 'social',
    url: 'https://www.instagram.com',
    template: 'generic',
    title: 'Instagram Creator Hub',
    desc: 'Feed visual, Stories, dan Reels publishing terkoordinasi.',
    color: 'pink',
  },
  X: {
    id: 'X',
    name: 'X (Twitter)',
    category: 'social',
    url: 'https://x.com',
    template: 'generic',
    title: 'X Platform Dispatch',
    desc: 'Distribusi thread viral dan keterlibatan komunitas real-time.',
    color: 'zinc',
  },
  RisetProduk: {
    id: 'RisetProduk',
    name: 'Riset Produk',
    category: 'riset',
    url: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/pc/en',
    template: 'generic',
    title: 'Riset Produk & Tren Viral',
    desc: 'Temukan produk laris, peluang tren FYP, dan hashtag viral real-time.',
    color: 'emerald',
  },
  GoogleTrends: {
    id: 'GoogleTrends',
    name: 'Google Trends',
    category: 'riset',
    url: 'https://trends.google.com',
    template: 'generic',
    title: 'Google Trends Monitor',
    desc: 'Pantau grafik ketertarikan kata kunci dan lonjakan topik hangat.',
    color: 'blue',
  },
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeToolId,
  onSelectTool,
  accounts,
  activeAccountId,
  onSelectAccount,
  onOpenAddAccount,
  toolsConfig,
}) => {
  const currentTools = toolsConfig || TOOLS_CONFIG;
  const builtInKeys = new Set([
    'Flow', 'Gemini', 'Grok', 'ChatGPT', 'Canva', 'CapCut', 'GoogleNotes',
    'TikTok', 'YouTube', 'Instagram', 'X', 'RisetProduk', 'GoogleTrends'
  ]);
  const customTools = Object.values(currentTools).filter((t) => !builtInKeys.has(t.id));
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[65] transition-opacity animate-in fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-[70] md:z-10 w-[280px] md:w-64 bg-white md:bg-zinc-50/70 border-r border-zinc-200 flex flex-col flex-shrink-0 transition-transform duration-300 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0 shadow-none'
        }`}
      >
        {/* Mobile Header in Sidebar */}
        <div className="md:hidden h-14 px-4 flex items-center justify-between border-b border-zinc-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-zinc-900">
              Studio Pro
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-zinc-100 hover:bg-zinc-200 rounded-lg flex items-center justify-center text-zinc-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Tool Categories */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 pb-24 md:pb-4">
          
          {/* Section 1: Video & Flow */}
          <div>
            <h3 className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
              Video & Flow Workspace
            </h3>
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-1.5 shadow-sm space-y-1">
              <button
                onClick={() => onSelectTool('Flow')}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                  activeToolId === 'Flow'
                    ? 'bg-purple-50 text-purple-900 border border-purple-200 font-bold shadow-sm'
                    : 'hover:bg-zinc-50 text-zinc-700 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs">Google Flow</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </button>

              {/* Accounts list */}
              <div className="space-y-0.5 px-1 pt-1 border-t border-zinc-100">
                {accounts.map((acc) => {
                  const isSelected = acc.id === activeAccountId;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => onSelectAccount(acc.id)}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition text-[11px] ${
                        isSelected
                          ? 'bg-zinc-100 font-bold text-zinc-900'
                          : 'hover:bg-zinc-50 text-zinc-600 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-purple-600 flex-shrink-0" />}
                        <span className="truncate">{acc.name}</span>
                      </div>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                          acc.tier === 'PRO'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-zinc-200 text-zinc-600'
                        }`}
                      >
                        {acc.credit} cr
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={onOpenAddAccount}
                className="w-full mt-1 py-1.5 px-2.5 bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-300 text-zinc-500 hover:text-zinc-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-3 h-3" /> Hubungkan Akun
              </button>
            </div>
          </div>

          {/* Section 2: AI Assistants & Design */}
          <div>
            <h3 className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
              AI Assistants & Design
            </h3>
            <div className="space-y-1">
              {[
                { id: 'Gemini', name: 'Gemini Advanced', icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" />, bg: 'bg-purple-50' },
                { id: 'Grok', name: 'Grok (xAI)', icon: <Bot className="w-3.5 h-3.5 text-zinc-800" />, bg: 'bg-zinc-100' },
                { id: 'ChatGPT', name: 'ChatGPT Plus', icon: <Sparkles className="w-3.5 h-3.5 text-emerald-600" />, bg: 'bg-emerald-50' },
                { id: 'Canva', name: 'Canva Pro', icon: <Palette className="w-3.5 h-3.5 text-cyan-600" />, bg: 'bg-cyan-50' },
                { id: 'CapCut', name: 'CapCut Editor', icon: <Scissors className="w-3.5 h-3.5 text-zinc-700" />, bg: 'bg-zinc-100' },
                { id: 'GoogleNotes', name: 'Google Notes', icon: <StickyNote className="w-3.5 h-3.5 text-amber-600" />, bg: 'bg-amber-50' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectTool(item.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                    activeToolId === item.id
                      ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900 font-bold'
                      : 'hover:bg-white/80 border border-transparent text-zinc-600 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center`}>
                      {item.icon}
                    </div>
                    <span className="text-xs">{item.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Publishing Hub */}
          <div>
            <h3 className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
              Publishing Hub
            </h3>
            <div className="space-y-1">
              {[
                { id: 'TikTok', name: 'TikTok Creator', icon: <Share2 className="w-3.5 h-3.5 text-zinc-900" />, bg: 'bg-zinc-100' },
                { id: 'YouTube', name: 'YouTube Studio', icon: <Share2 className="w-3.5 h-3.5 text-red-600" />, bg: 'bg-red-50' },
                { id: 'Instagram', name: 'Instagram', icon: <Share2 className="w-3.5 h-3.5 text-pink-600" />, bg: 'bg-pink-50' },
                { id: 'X', name: 'X (Twitter)', icon: <Share2 className="w-3.5 h-3.5 text-zinc-800" />, bg: 'bg-zinc-100' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectTool(item.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                    activeToolId === item.id
                      ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900 font-bold'
                      : 'hover:bg-white/80 border border-transparent text-zinc-600 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center`}>
                      {item.icon}
                    </div>
                    <span className="text-xs">{item.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Riset & Analisis */}
          <div>
            <h3 className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
              Riset & Tren Pasar
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => onSelectTool('RisetProduk')}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                  activeToolId === 'RisetProduk'
                    ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900 font-bold'
                    : 'hover:bg-white/80 border border-transparent text-zinc-600 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <LineChart className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs">Riset Produk</span>
                </div>
              </button>
              <button
                onClick={() => onSelectTool('GoogleTrends')}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                  activeToolId === 'GoogleTrends'
                    ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900 font-bold'
                    : 'hover:bg-white/80 border border-transparent text-zinc-600 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs">Google Trends</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 5: Platform Kustom dari Admin (Jika ada) */}
          {customTools.length > 0 && (
            <div>
              <h3 className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Platform Kustom Admin
              </h3>
              <div className="space-y-1">
                {customTools.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectTool(item.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                      activeToolId === item.id
                        ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900 font-bold'
                        : 'hover:bg-white/80 border border-transparent text-zinc-600 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-black text-[10px] flex items-center justify-center uppercase">
                        {item.name.slice(0, 2)}
                      </div>
                      <span className="text-xs truncate">{item.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Status Card */}
        <div className="p-3 border-t border-zinc-200/80 bg-zinc-50/90">
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 flex items-start gap-2.5 shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-purple-950">Studio Pro Aktif</h4>
              <p className="text-[10px] text-purple-800 mt-0.5 font-medium leading-relaxed">
                Workspace multi-akun & Gemini 3.8 Flash terhubung.
              </p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
