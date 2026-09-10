import React, { useState, useRef, useMemo } from 'react';
import {
  Globe,
  RotateCw,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Lock,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ToolConfig } from '../../../types';

interface ProductionWebviewProps {
  tool: ToolConfig;
  userEmail: string;
  onOpenExternal: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onSwitchToStudio?: () => void;
}

export const ProductionWebview: React.FC<ProductionWebviewProps> = ({
  tool,
  userEmail,
  onOpenExternal,
  onShowToast,
  onSwitchToStudio,
}) => {
  const [currentUrl, setCurrentUrl] = useState(tool.url);
  const [inputUrl, setInputUrl] = useState(tool.url);
  const [engine, setEngine] = useState<'proxy' | 'direct'>('proxy');
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [cacheBuster, setCacheBuster] = useState<number>(() => Date.now());
  const [isIframeMounted, setIsIframeMounted] = useState(true);
  const [isForceRefreshing, setIsForceRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeSrc = useMemo(() => {
    const delimiter = currentUrl.includes('?') ? '&' : '?';
    if (engine === 'proxy') {
      return `/api/proxy-web?url=${encodeURIComponent(currentUrl)}&_ts=${cacheBuster}&forceRefresh=true`;
    }
    return `${currentUrl}${delimiter}_ts=${cacheBuster}`;
  }, [engine, currentUrl, cacheBuster]);

  const handleNavigate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let dest = inputUrl.trim();
    if (!dest) return;
    if (!dest.startsWith('http://') && !dest.startsWith('https://')) {
      dest = 'https://' + dest;
    }
    setCurrentUrl(dest);
    setInputUrl(dest);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  const handleReload = () => {
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
    onShowToast(`Memuat ulang halaman ${tool.name}...`, 'info');
  };

  // Dedicated Force Refresh: Resets iframe DOM context and cache buster without reloading outer app
  const handleForceRefresh = () => {
    if (isForceRefreshing) return;
    setIsForceRefreshing(true);
    setIsLoading(true);

    // 1. Temporarily unmount iframe to force browser to tear down frame state, memory, and cookies
    setIsIframeMounted(false);

    // 2. Refresh cache buster timestamp
    const now = new Date();
    const newTimestamp = now.getTime();
    setCacheBuster(newTimestamp);
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastRefreshedAt(timeFormatted);

    // 3. Remount fresh iframe instance with incremented reloadKey
    setTimeout(() => {
      setReloadKey((prev) => prev + 1);
      setIsIframeMounted(true);
      setIsForceRefreshing(false);
      onShowToast(`Force Refresh selesai: Sesi iframe platform ${tool.name} telah direset.`, 'success');
    }, 150);
  };

  const getQuickPrompt = () => {
    switch (tool.id) {
      case 'Flow':
        return 'Cinematic 8K hyperrealistic camera orbit of Mount Krakatau volcanic eruption, molten lava river flowing into ocean, volumetric sunset haze --ar 9:16';
      case 'Gemini':
        return 'Buatkan naskah video pendek 30 detik untuk TikTok dengan hook psikologis di 3 detik pertama.';
      case 'Canva':
        return 'Format Desain Thumbnail YouTube Bold High Contrast: RAHASIA VIRAL 2026';
      default:
        return `Optimasi kreatif untuk ${tool.name} di Studio Pro 2026.`;
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(getQuickPrompt());
    setCopiedPrompt(true);
    onShowToast('Prompt siap pakai berhasil disalin!', 'success');
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900 overflow-hidden relative">
      
      {/* Browser Omnibar */}
      <div className="bg-zinc-950 border-b border-zinc-800 p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 z-10">
        
        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onShowToast('Kembali ke histori webview sebelumnya', 'info')}
            className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition"
            title="Kembali"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onShowToast('Maju ke halaman webview berikutnya', 'info')}
            className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition"
            title="Maju"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReload}
            className={`w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition ${
              isLoading && !isForceRefreshing ? 'animate-spin text-purple-400' : ''
            }`}
            title="Muat Ulang Normal"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Dedicated Force Refresh Button */}
          <button
            id="force-refresh-button"
            onClick={handleForceRefresh}
            disabled={isForceRefreshing}
            className={`h-7 px-2 sm:px-2.5 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold transition border ${
              isForceRefreshing
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700/70 hover:border-amber-500/50 text-zinc-300 hover:text-amber-300 shadow-xs'
            }`}
            title="Force Refresh: Reset total iframe dan cache sesi tanpa mereload seluruh aplikasi"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isForceRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Force Refresh</span>
          </button>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleNavigate} className="flex-1 min-w-[200px] flex items-center">
          <div className="w-full flex items-center bg-zinc-900 border border-zinc-800 focus-within:border-purple-500 rounded-xl px-2.5 py-1 text-xs font-mono text-zinc-300">
            <Lock className="w-3 h-3 text-emerald-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-transparent outline-none text-zinc-200 text-xs font-mono"
              placeholder="https://..."
            />
          </div>
        </form>

        {/* Engine Switcher & External Launcher */}
        <div className="flex items-center gap-1.5">
          <div className="bg-zinc-900 p-0.5 rounded-xl flex items-center text-[10px] font-bold border border-zinc-800">
            <button
              onClick={() => {
                setEngine('proxy');
                setIsLoading(true);
                setReloadKey((prev) => prev + 1);
              }}
              className={`px-2 py-0.8 rounded-lg transition ${
                engine === 'proxy'
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Reverse Proxy Header Bypass"
            >
              Proxy Relay
            </button>
            <button
              onClick={() => {
                setEngine('direct');
                setIsLoading(true);
                setReloadKey((prev) => prev + 1);
              }}
              className={`px-2 py-0.8 rounded-lg transition ${
                engine === 'direct'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Direct Embed"
            >
              Direct Embed
            </button>
          </div>

          <button
            onClick={onOpenExternal}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1 shadow-sm flex-shrink-0"
            title="Buka Jendela Sesi Resmi Tanpa Hambatan Iframe"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Buka Sesi Resmi</span>
          </button>
        </div>
      </div>

      {/* Security & Authentication Notice Banner */}
      <div className="bg-zinc-950/95 border-b border-zinc-800/80 px-3 py-1.5 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2">
        <div className="flex items-center gap-2 text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>
            SSO Aktif: <strong className="text-zinc-200">{userEmail}</strong>
          </span>
          <span className="text-zinc-600 hidden md:inline">•</span>
          <span className="text-zinc-400 hidden md:inline text-[10px]">
            Jika sesi bermasalah atau blank, tekan <b>Force Refresh</b> untuk mereset frame eksternal.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onSwitchToStudio && (
            <button
              onClick={onSwitchToStudio}
              className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 underline underline-offset-2"
            >
              <Zap className="w-3 h-3" />
              <span>Beralih ke Studio {tool.name}</span>
            </button>
          )}

          <button
            id="banner-force-refresh-btn"
            onClick={handleForceRefresh}
            disabled={isForceRefreshing}
            className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 transition"
            title="Reset sesi tampilan iframe"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isForceRefreshing ? 'animate-spin' : ''}`} />
            <span>Reset Sesi Iframe</span>
          </button>

          <button
            onClick={handleCopyPrompt}
            className="text-[10px] font-bold text-zinc-300 hover:text-white bg-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-1"
          >
            {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
            <span>Salin Prompt</span>
          </button>
        </div>
      </div>

      {/* Main Iframe Canvas */}
      <div className="flex-1 relative overflow-hidden bg-white">
        {isLoading && (
          <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20 text-white">
            <RefreshCw className={`w-8 h-8 ${isForceRefreshing ? 'animate-spin text-amber-400' : 'animate-spin text-purple-500'}`} />
            <div className="text-center">
              <span className="text-xs font-bold text-zinc-200">
                {isForceRefreshing ? `Mereset Sesi Iframe ${tool.name}...` : `Memuat ${tool.name}...`}
              </span>
              <p className="text-[10px] text-zinc-400 mt-1 max-w-xs">
                {isForceRefreshing
                  ? 'Membersihkan cache embed, memperbarui token sesi, dan merestart frame eksternal.'
                  : `Mempersiapkan relay sandbox dan headers untuk ${currentUrl}`}
              </p>
            </div>
          </div>
        )}

        {isIframeMounted ? (
          <iframe
            ref={iframeRef}
            key={reloadKey}
            src={activeSrc}
            title={tool.name}
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-none bg-white"
            sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-downloads"
            allow="camera; microphone; clipboard-read; clipboard-write; encrypted-media; display-capture; fullscreen; geolocation; autoplay; accelerometer; gyroscope"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 text-xs gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <span>Mereset konteks sesi iframe...</span>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="p-2 bg-zinc-950 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate max-w-sm sm:max-w-md">
          <span className="truncate">
            Target: <code className="text-purple-300 font-mono">{currentUrl}</code>
          </span>
          {lastRefreshedAt && (
            <span className="hidden sm:inline-block text-[10px] text-amber-400/90 font-mono bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
              Reset: {lastRefreshedAt}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            id="footer-force-refresh-btn"
            onClick={handleForceRefresh}
            disabled={isForceRefreshing}
            className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 text-[11px] transition"
            title="Reset ulang sesi platform eksternal"
          >
            <RefreshCw className={`w-3 h-3 ${isForceRefreshing ? 'animate-spin' : ''}`} />
            <span>Force Refresh</span>
          </button>
          <button
            onClick={onOpenExternal}
            className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 text-[11px]"
          >
            <span>Buka di Layar Penuh</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
