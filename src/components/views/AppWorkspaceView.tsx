import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCw,
  ExternalLink,
  Maximize2,
  ShieldCheck,
  Globe,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { AccountProfile, ToolConfig } from '../../types';

interface AppWorkspaceViewProps {
  tool: ToolConfig;
  activeAccount?: AccountProfile;
  userEmail?: string;
  refreshKey?: number;
  onForceRefresh?: () => void;
  onOpenAddAccount?: () => void;
  onOpenStudio?: () => void;
  onOpenVideoPlayer?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AppWorkspaceView: React.FC<AppWorkspaceViewProps> = ({
  tool,
  refreshKey = 0,
  onForceRefresh,
  onShowToast,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(() => Date.now());
  const [viewMode, setViewMode] = useState<'embed' | 'window'>('embed');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const popupWindowRef = useRef<Window | null>(null);

  // Parse hostname for the SSL badge
  let hostname = 'web-platform';
  try {
    hostname = new URL(tool.url).hostname;
  } catch {
    hostname = tool.url;
  }

  // Handle opening in a dedicated, distraction-free app window
  const handleOpenStandaloneWindow = () => {
    const width = 1320;
    const height = 860;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);

    const win = window.open(
      tool.url,
      `StudioPro_${tool.id}`,
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );

    if (win) {
      popupWindowRef.current = win;
      win.focus();
      onShowToast?.(`Membuka ${tool.name} di jendela aplikasi mandiri.`, 'success');
    } else {
      window.open(tool.url, '_blank');
      onShowToast?.(`Pop-up diblokir peramban. Membuka di tab baru.`, 'info');
    }
  };

  // Open directly in standard new browser tab
  const handleOpenNewTab = () => {
    window.open(tool.url, '_blank');
    onShowToast?.(`Membuka ${tool.name} di tab baru.`, 'info');
  };

  // Trigger Force Refresh
  const handleTriggerRefresh = () => {
    setIsRefreshing(true);
    setIsLoading(true);
    setHasTimedOut(false);
    setCacheBuster(Date.now());
    onForceRefresh?.();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Reset states on tool or refreshKey change
  useEffect(() => {
    setIsLoading(true);
    setHasTimedOut(false);
    setCacheBuster(Date.now());

    // 10s timeout detector for platforms with strict anti-framing or Cloudflare challenge
    const timer = setTimeout(() => {
      setHasTimedOut(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [tool.id, tool.url, refreshKey]);

  // High-performance reverse proxy that strips X-Frame-Options and restrictive CSP headers
  const targetSrc = `/api/proxy-web?url=${encodeURIComponent(tool.url)}&_ts=${cacheBuster}&forceRefresh=${refreshKey > 0}`;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-zinc-950 select-text">
      {/* Sleek Companion Toolbar (Industry Best Practice) */}
      <div className="h-10 bg-zinc-900 border-b border-zinc-800 px-3 flex items-center justify-between flex-shrink-0 z-30 select-none text-zinc-300 text-xs">
        {/* Left: SSL Badge & Domain */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/90 rounded-lg border border-zinc-700/60 font-mono text-[11px] text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold text-white tracking-tight truncate max-w-[200px] sm:max-w-[320px]">
              {hostname}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400/90 px-2 py-0.5 bg-emerald-950/40 border border-emerald-800/40 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Web Resmi Aktif</span>
          </div>
        </div>

        {/* Center: View Mode Toggle */}
        <div className="hidden md:flex items-center gap-1 p-0.5 bg-zinc-950 rounded-lg border border-zinc-800">
          <button
            onClick={() => setViewMode('embed')}
            className={`px-3 py-1 rounded-md text-[11px] font-bold transition ${
              viewMode === 'embed'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tampilan Frame
          </button>
          <button
            onClick={() => {
              setViewMode('window');
              handleOpenStandaloneWindow();
            }}
            className={`px-3 py-1 rounded-md text-[11px] font-bold transition ${
              viewMode === 'window'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Jendela Mandiri (Bebas Hambatan)
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Force Refresh */}
          <button
            onClick={handleTriggerRefresh}
            className={`p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg transition active:scale-95 border border-transparent hover:border-zinc-700 ${
              isRefreshing ? 'animate-spin text-purple-400' : ''
            }`}
            title="Force Refresh (Segarkan Sesi Website)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Standalone Window Button */}
          <button
            onClick={handleOpenStandaloneWindow}
            className="flex items-center gap-1 px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg border border-purple-500/30 transition active:scale-95 font-medium text-[11px]"
            title="Buka di jendela aplikasi mandiri untuk akses 100% login Google / OpenAI langsung"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Jendela Mandiri</span>
          </button>

          {/* Open in New Tab */}
          <button
            onClick={handleOpenNewTab}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg transition active:scale-95 border border-transparent hover:border-zinc-700"
            title="Buka di tab browser baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Workspace Frame Area */}
      <div className="w-full flex-1 relative overflow-hidden bg-white">
        {viewMode === 'embed' ? (
          <>
            {/* Minimalist Loader */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10 text-zinc-600 transition-opacity">
                <RotateCw className="w-6 h-6 animate-spin text-purple-600" />
                <div className="text-center">
                  <span className="text-xs font-bold text-zinc-800">Menghubungkan ke {tool.name}...</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Memuat antarmuka resmi {hostname}</p>
                </div>
              </div>
            )}

            {/* Smart Access Assistance Banner (Triggered if strict anti-framing or login challenge occurs) */}
            {isLoading && hasTimedOut && (
              <div className="absolute inset-x-4 top-4 z-20 mx-auto max-w-lg bg-zinc-950/95 text-white p-4 rounded-2xl shadow-2xl border border-purple-500/40 backdrop-blur flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Rekomendasi Akses Terbaik</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                      Situs <strong>{tool.name}</strong> membatasi iframe karena proteksi login Google/OpenAI. Gunakan <strong>Jendela Mandiri</strong> untuk akses bebas hambatan dengan sesi Anda.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
                  <button
                    onClick={handleOpenStandaloneWindow}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                  >
                    <span>Buka Jendela Mandiri</span>
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* 100% Authentic Website Frame */}
            <iframe
              ref={iframeRef}
              key={`${tool.id}-${refreshKey}-${cacheBuster}`}
              src={targetSrc}
              title={tool.name}
              onLoad={() => {
                setIsLoading(false);
                setHasTimedOut(false);
              }}
              className="w-full h-full border-none bg-white block"
              sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-downloads"
              allow="camera; microphone; clipboard-read; clipboard-write; encrypted-media; display-capture; fullscreen; geolocation; autoplay; accelerometer; gyroscope"
            />
          </>
        ) : (
          /* Standalone Launchpad View */
          <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-300">
            <div className="max-w-md bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 mb-4">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-white mb-1">
                {tool.name} Sedang Aktif di Jendela Mandiri
              </h3>
              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                Mode jendela mandiri memberikan performa 100% native tanpa batasan sandbox, sinkronisasi penuh dengan akun Google/OpenAI Anda, dan akselerasi grafis WebGPU.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                <button
                  onClick={handleOpenStandaloneWindow}
                  className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-purple-600/30"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Fokuskan Jendela</span>
                </button>
                <button
                  onClick={() => setViewMode('embed')}
                  className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition border border-zinc-700"
                >
                  Kembali ke Frame
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
