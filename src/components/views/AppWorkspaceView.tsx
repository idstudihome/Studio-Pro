import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Lock,
  Play,
  Plus,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Film,
  Send,
  Sliders,
  Scissors,
  Trash2,
  Upload,
} from 'lucide-react';
import { AccountProfile, ToolConfig } from '../../types';

interface AppWorkspaceViewProps {
  tool: ToolConfig;
  activeAccount: AccountProfile | undefined;
  onOpenAddAccount: () => void;
  onOpenStudio: () => void;
  onOpenVideoPlayer: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AppWorkspaceView: React.FC<AppWorkspaceViewProps> = ({
  tool,
  activeAccount,
  onOpenAddAccount,
  onOpenStudio,
  onOpenVideoPlayer,
  onShowToast,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [grokQuery, setGrokQuery] = useState('');
  const [grokMessages, setGrokMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onShowToast(`Sesi ${tool.name} berhasil dimuat ulang`, 'info');
    }, 600);
  };

  const handleGrokSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!grokQuery.trim()) return;
    const query = grokQuery.trim();
    setGrokMessages((prev) => [
      ...prev,
      { role: 'user', text: query },
      {
        role: 'assistant',
        text: `💡 **Grok Reasoning**: Untuk "${query}", strategi paling efektif adalah mengombinasikan visual continuity dengan hook naratif kuat di 3 detik pertama. Gunakan Gemini AI Studio untuk menyusun prompt frame secara detail!`,
      },
    ]);
    setGrokQuery('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white md:m-2 md:rounded-3xl shadow-sm md:border md:border-zinc-200/80 relative">
      
      {/* Webview Browser Bar */}
      <div className="h-12 bg-zinc-50/90 backdrop-blur-md border-b border-zinc-200/80 px-3 sm:px-4 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-1">
          <button
            className="w-8 h-8 rounded-lg hover:bg-zinc-200/80 flex items-center justify-center text-zinc-400 transition"
            title="Kembali"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 rounded-lg hover:bg-zinc-200/80 flex items-center justify-center text-zinc-400 transition"
            title="Maju"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className={`w-8 h-8 rounded-lg hover:bg-zinc-200/80 flex items-center justify-center text-zinc-600 transition ${
              isRefreshing ? 'animate-spin text-purple-600' : 'active:scale-95'
            }`}
            title="Muat Ulang Sesi"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* URL Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6">
          <div className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 flex items-center justify-center gap-2 shadow-xs">
            <Lock className="w-3 h-3 text-emerald-500 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-600 truncate font-mono">
              {tool.url}
            </span>
          </div>
        </div>

        {/* Status Indicators & New Tab Launcher */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Terisolasi</span>
          </div>

          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition"
            title="Buka Langsung di Tab Baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Canvas Body (Dynamic Workspace Template) */}
      <div className="flex-1 overflow-y-auto bg-zinc-50/60 relative pb-28 md:pb-6">
        
        {/* TEMPLATE: FLOW */}
        {tool.template === 'flow' && (
          <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            
            {/* Account Banner */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-zinc-900 text-base sm:text-lg tracking-tight">
                    Google Flow Video Studio
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5 flex items-center gap-1.5">
                    <span>Akun Aktif: <strong>{activeAccount?.name || 'Default'}</strong></span>
                    <span className="text-[10px] font-extrabold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                      {activeAccount?.credit ?? 163} Kredit
                    </span>
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto flex gap-2">
                <button
                  onClick={onOpenAddAccount}
                  className="flex-1 sm:flex-none px-4 py-2 bg-zinc-900 hover:bg-black rounded-xl text-xs font-bold text-white shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Ganti / Tambah Akun
                </button>
              </div>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Card 1: Sample Volcano Clay Video */}
              <div
                onClick={onOpenVideoPlayer}
                className="aspect-[9/14] w-full bg-zinc-950 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden relative group cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1540110307374-1296541cb915?auto=format&fit=crop&q=80&w=600"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                  alt="Clay Krakatau Preview"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-center">
                  <div className="w-10 h-10 rounded-full bg-white/95 backdrop-blur text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <Play className="w-4 h-4 ml-0.5 fill-black" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg border border-white/10 block">
                      Animasi Clay • 10s
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Slot frame kosong */}
              <div
                onClick={onOpenStudio}
                className="aspect-[9/14] w-full bg-white rounded-3xl border-2 border-zinc-200 border-dashed flex flex-col items-center justify-center text-zinc-400 gap-3 hover:bg-purple-50/50 hover:border-purple-300 transition cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 group-hover:bg-purple-100 group-hover:text-purple-600 flex items-center justify-center text-zinc-500 transition">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-zinc-700 block">Slot Frame Baru</span>
                  <span className="text-[10px] text-zinc-400">Rancang di AI Storyboard</span>
                </div>
              </div>
            </div>

            {/* Sticky Prompt Bar */}
            <div className="sticky bottom-4 mx-auto max-w-2xl bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-2xl p-2.5 shadow-xl flex items-center gap-2.5 z-30">
              <button
                onClick={onOpenStudio}
                className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex flex-shrink-0 items-center justify-center text-zinc-600 transition active:scale-95"
                title="Buka Menu Studio"
              >
                <Plus className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="What video do you want to create?..."
                className="flex-1 bg-transparent border-none text-xs sm:text-sm text-zinc-900 focus:outline-none px-2 font-medium placeholder-zinc-400"
              />

              <button
                onClick={onOpenStudio}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 shadow-sm active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                <span>Rancang AI</span>
              </button>
            </div>

          </div>
        )}

        {/* TEMPLATE: GROK */}
        {tool.template === 'grok' && (
          <div className="h-full min-h-[500px] flex flex-col bg-white p-4 md:p-8 max-w-3xl mx-auto">
            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-xl mx-auto shadow-md">
                xAI
              </div>
              <h3 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                What should we explore?
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                Grok AI Reasoning Workspace terintegrasi dengan Studio Pro.
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {[
                'Analisis tren konten video viral 2026',
                'Rumuskan hook naskah storytelling emosional',
                'Strategi affiliate produk tanpa wajah',
              ].map((sug) => (
                <button
                  key={sug}
                  onClick={() => {
                    setGrokQuery(sug);
                  }}
                  className="px-3.5 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-full text-xs font-semibold text-zinc-700 transition"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 mb-6 max-h-[380px] overflow-y-auto">
              {grokMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-purple-50 text-purple-900 ml-8 border border-purple-100'
                      : 'bg-zinc-50 text-zinc-800 mr-8 border border-zinc-200 whitespace-pre-wrap'
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            {/* Grok Input Form */}
            <form onSubmit={handleGrokSend} className="bg-white border-2 border-zinc-200 rounded-2xl p-2 flex items-center gap-2 focus-within:border-zinc-900 transition">
              <input
                type="text"
                value={grokQuery}
                onChange={(e) => setGrokQuery(e.target.value)}
                placeholder="Tanyakan analisis atau ide pada Grok..."
                className="flex-1 bg-transparent px-3 py-2 text-xs font-medium outline-none text-zinc-900"
              />
              <button
                type="submit"
                className="w-9 h-9 bg-zinc-900 hover:bg-black text-white rounded-xl flex items-center justify-center transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* TEMPLATE: CAPCUT */}
        {tool.template === 'capcut' && (
          <div className="h-full min-h-[550px] flex flex-col bg-[#121212] text-zinc-300 rounded-2xl overflow-hidden m-2">
            <div className="flex-1 flex flex-col md:flex-row">
              {/* Media Pool */}
              <div className="w-full md:w-60 border-r border-zinc-800 bg-[#181818] p-4 flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                  Media Aset
                </span>
                <div
                  onClick={() => onShowToast('File uploader simulator siap menerima aset MP4/WAV', 'info')}
                  className="flex-1 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center p-6 text-zinc-500 gap-2 cursor-pointer hover:border-zinc-600 hover:text-zinc-300 transition"
                >
                  <Upload className="w-6 h-6 text-purple-400" />
                  <span className="text-[11px] font-bold">Tarik Video Ke Sini</span>
                  <span className="text-[9px] text-zinc-600">MP4, MOV, PNG</span>
                </div>
              </div>

              {/* Preview Monitor */}
              <div className="flex-1 flex flex-col items-center justify-center p-4 bg-black relative">
                <div
                  onClick={onOpenVideoPlayer}
                  className="aspect-[9/16] h-full max-h-[45vh] bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center shadow-2xl relative overflow-hidden cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1540110307374-1296541cb915?auto=format&fit=crop&q=80&w=400"
                    alt="CapCut Monitor"
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition"
                  />
                  <div className="absolute w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white group-hover:scale-110 transition">
                    <Play className="w-5 h-5 ml-0.5 fill-white" />
                  </div>
                  <span className="absolute bottom-2 font-mono text-[10px] text-zinc-400">
                    Preview Monitor 1080P
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="h-44 border-t border-zinc-800 bg-[#1a1a1a] p-3 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => onShowToast('Scene Split AI diaktifkan', 'info')}
                    className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300"
                    title="Split"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onShowToast('Track dikosongkan', 'info')}
                    className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => onShowToast('Merender video akhir...', 'success')}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Export MP4
                </button>
              </div>

              <div className="flex-1 space-y-1.5 font-mono text-[10px]">
                <div className="h-8 bg-zinc-800/80 rounded border border-blue-500/30 flex items-center px-3 relative overflow-hidden">
                  <span className="text-zinc-400 font-bold z-10 w-20">V1 Video</span>
                  <div className="absolute left-24 right-8 top-1 bottom-1 bg-blue-500/30 rounded" />
                </div>
                <div className="h-8 bg-zinc-800/80 rounded border border-emerald-500/30 flex items-center px-3 relative overflow-hidden">
                  <span className="text-zinc-400 font-bold z-10 w-20">A1 Voiceover</span>
                  <div className="absolute left-28 right-16 top-1 bottom-1 bg-emerald-500/30 rounded" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TEMPLATE: GENERIC (Canva, Gemini, ChatGPT, TikTok, dll) */}
        {tool.template === 'generic' && (
          <div className="p-6 md:p-12 max-w-xl mx-auto text-center space-y-5">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-zinc-200 flex items-center justify-center mx-auto text-purple-600">
              <Sliders className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                {tool.title}
              </h2>
              <p className="text-xs text-zinc-500 mt-2 font-medium leading-relaxed">
                {tool.desc}
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-left flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-900">Sandbox Isolasi Sesi Aktif</h4>
                <p className="text-[11px] text-emerald-700 mt-0.5 font-medium leading-relaxed">
                  Platform ini terlindungi dalam runtime mandiri. Cookie dan token kredensial terenkapsulasi secara aman.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Buka di Tab Baru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onOpenStudio}
                className="flex-1 py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buka AI Studio Assistant</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
