import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Globe,
  Maximize2,
  RotateCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AccountProfile, ToolConfig } from '../../types';

const IFRAME_LOAD_TIMEOUT_MS = 6000;

// These providers are known to be poor candidates for iframe embedding because
// authentication/CSP/X-Frame-Options can prevent a useful embedded session.
// Keep this list explicit and conservative; it is not a substitute for the
// browser's actual framing policy.
const STANDALONE_PREFERRED_HOSTS = new Set(['labs.google']);

interface AppWorkspaceViewProps {
  tool: ToolConfig;
  activeAccount?: AccountProfile;
  activeAccountId?: string;
  userEmail?: string;
  refreshKey?: number;
  onForceRefresh?: () => void;
  onOpenAddAccount?: () => void;
  onOpenStudio?: () => void;
  onOpenVideoPlayer?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

function validateExternalTarget(rawUrl: string | undefined): URL | null {
  if (!rawUrl || typeof window === 'undefined') return null;

  try {
    const url = new URL(rawUrl.trim());

    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

    // An iframe must never point back to Studio Pro itself. This prevents a
    // recursive iframe loop when a missing/bad target falls back to the app URL.
    if (url.origin === window.location.origin) return null;
    if (url.href === window.location.href) return null;

    return url;
  } catch {
    return null;
  }
}

function shouldPreferStandalone(url: URL | null): boolean {
  if (!url) return false;
  return STANDALONE_PREFERRED_HOSTS.has(url.hostname);
}

export const AppWorkspaceView: React.FC<AppWorkspaceViewProps> = ({
  tool,
  activeAccountId,
  refreshKey = 0,
  onForceRefresh,
  onShowToast,
}) => {
  const targetUrl = useMemo(() => validateExternalTarget(tool.url), [tool.url]);
  const standalonePreferred = useMemo(
    () => shouldPreferStandalone(targetUrl),
    [targetUrl],
  );

  const [isLoading, setIsLoading] = useState(Boolean(targetUrl));
  const [hasLoadError, setHasLoadError] = useState(false);
  const [viewMode, setViewMode] = useState<'embed' | 'window'>(
    standalonePreferred ? 'window' : 'embed',
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const popupWindowRef = useRef<Window | null>(null);

  const hostname = targetUrl?.hostname || 'target eksternal tidak valid';

  const resetLoadState = () => {
    setHasLoadError(false);
    setIsLoading(Boolean(targetUrl));
    setViewMode(standalonePreferred ? 'window' : 'embed');
  };

  // Reset iframe lifecycle whenever the selected platform, account session, or
  // explicit refresh changes. Main-menu navigation unmounts this component;
  // account changes are included explicitly so stale loading state cannot leak.
  useEffect(() => {
    resetLoadState();
    setLoadAttempt(0);

    if (!targetUrl || standalonePreferred) return;

    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
      setHasLoadError(true);
    }, IFRAME_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [
    tool.id,
    tool.url,
    activeAccountId,
    refreshKey,
    targetUrl,
    standalonePreferred,
  ]);

  // Close the tracked popup reference when the component is unmounted only if
  // it has already been closed by the user. Never force-close a user's window.
  useEffect(() => {
    return () => {
      popupWindowRef.current = null;
    };
  }, []);

  const handleOpenStandaloneWindow = () => {
    if (!targetUrl) {
      onShowToast?.('URL platform tidak valid, jadi jendela mandiri tidak dapat dibuka.', 'error');
      return;
    }

    const width = 1320;
    const height = 860;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);

    const win = window.open(
      targetUrl.href,
      `StudioPro_${tool.id}`,
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes`,
    );

    if (win) {
      popupWindowRef.current = win;
      win.focus();
      onShowToast?.(`Membuka ${tool.name} di jendela mandiri.`, 'success');
    } else {
      window.open(targetUrl.href, '_blank', 'noopener,noreferrer');
      onShowToast?.('Pop-up diblokir browser. Target dibuka di tab baru.', 'info');
    }
  };

  const handleOpenNewTab = () => {
    if (!targetUrl) {
      onShowToast?.('URL platform tidak valid.', 'error');
      return;
    }

    window.open(targetUrl.href, '_blank', 'noopener,noreferrer');
    onShowToast?.(`Membuka ${tool.name} di tab browser.`, 'info');
  };

  const handleTriggerRefresh = () => {
    setIsRefreshing(true);
    setHasLoadError(false);
    setIsLoading(Boolean(targetUrl) && !standalonePreferred);
    setLoadAttempt((value) => value + 1);
    onForceRefresh?.();
    window.setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasLoadError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasLoadError(true);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-zinc-950 select-text">
      <div className="h-10 bg-zinc-900 border-b border-zinc-800 px-3 flex items-center justify-between flex-shrink-0 z-30 select-none text-zinc-300 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 rounded-lg border border-zinc-700 font-mono text-[11px] text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold text-white tracking-tight truncate max-w-[200px] sm:max-w-[320px]">
              {hostname}
            </span>
          </div>

          {standalonePreferred && targetUrl && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-amber-300 px-2 py-0.5 bg-amber-950 border border-amber-800 rounded-md">
              <Sparkles className="w-3 h-3" />
              <span>Jendela Mandiri Disarankan</span>
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-1 p-0.5 bg-zinc-950 rounded-lg border border-zinc-800">
          <button
            onClick={() => targetUrl && setViewMode('embed')}
            disabled={!targetUrl || standalonePreferred}
            className={`px-3 py-1 rounded-md text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              viewMode === 'embed'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tampilan Frame
          </button>
          <button
            onClick={() => {
              if (!targetUrl) return;
              setViewMode('window');
              handleOpenStandaloneWindow();
            }}
            disabled={!targetUrl}
            className={`px-3 py-1 rounded-md text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              viewMode === 'window'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Jendela Mandiri
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleTriggerRefresh}
            disabled={!targetUrl}
            className={`p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg transition active:scale-95 border border-transparent hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed ${
              isRefreshing ? 'animate-spin text-purple-400' : ''
            }`}
            title="Segarkan sesi platform"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleOpenStandaloneWindow}
            disabled={!targetUrl}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition active:scale-95 font-medium text-[11px] disabled:opacity-40 disabled:cursor-not-allowed ${
              standalonePreferred
                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-sm'
                : 'bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border-purple-500/30'
            }`}
            title="Buka platform langsung di jendela mandiri"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Jendela Mandiri</span>
          </button>

          <button
            onClick={handleOpenNewTab}
            disabled={!targetUrl}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg transition active:scale-95 border border-transparent hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Buka di tab browser baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="w-full flex-1 relative overflow-hidden bg-white">
        {!targetUrl ? (
          <div className="w-full h-full flex items-center justify-center p-6 bg-zinc-50 text-center">
            <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-zinc-900">Platform belum memiliki URL yang valid</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                Studio Pro tidak memuat iframe karena target kosong, URL tidak valid, atau URL mengarah kembali ke aplikasi ini. Periksa konfigurasi platform sebelum mencoba lagi.
              </p>
            </div>
          </div>
        ) : viewMode === 'window' ? (
          <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-300">
            <div className="max-w-md bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-700 flex items-center justify-center text-white mb-4">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-white mb-1">{tool.name} menggunakan Jendela Mandiri</h3>
              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                Platform ini dapat membatasi iframe melalui CSP/X-Frame-Options atau alur login pihak ketiga. Jendela mandiri adalah jalur yang direkomendasikan agar sesi dan navigasi berjalan secara native.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                <button
                  onClick={handleOpenStandaloneWindow}
                  className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Buka Jendela Mandiri</span>
                </button>
                {!standalonePreferred && (
                  <button
                    onClick={() => {
                      resetLoadState();
                      setViewMode('embed');
                    }}
                    className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition border border-zinc-700"
                  >
                    Coba Frame
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-white flex flex-col items-center justify-center gap-3 z-10 text-zinc-600">
                <RotateCw className="w-6 h-6 animate-spin text-purple-600" />
                <div className="text-center">
                  <span className="text-xs font-bold text-zinc-800">Menghubungkan ke {tool.name}...</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Menunggu respons dari {hostname} (maks. 6 detik)</p>
                </div>
              </div>
            )}

            {hasLoadError && (
              <div className="absolute inset-0 z-20 bg-white flex items-center justify-center p-6 text-center">
                <div className="max-w-lg">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-extrabold text-zinc-900">Browser menolak penyematan platform</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                    {tool.name} tidak memberikan halaman yang dapat disematkan di iframe. Ini biasanya terjadi karena kebijakan CSP/X-Frame-Options atau batasan autentikasi pihak ketiga. Studio Pro menghentikan loading agar tidak terjadi loop atau spinner tanpa akhir.
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row justify-center gap-2.5">
                    <button
                      onClick={handleOpenStandaloneWindow}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      Buka di Jendela Mandiri
                    </button>
                    <button
                      onClick={() => {
                        setHasLoadError(false);
                        setIsLoading(true);
                        setLoadAttempt((value) => value + 1);
                      }}
                      className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              key={`${tool.id}-${activeAccountId || 'default'}-${refreshKey}-${loadAttempt}`}
              src={targetUrl.href}
              title={tool.name}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              className={`w-full h-full border-none bg-white block ${
                isLoading || hasLoadError ? 'invisible' : 'visible'
              }`}
              allow="camera; microphone; clipboard-read; clipboard-write; encrypted-media; display-capture; fullscreen; geolocation; autoplay; accelerometer; gyroscope"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </>
        )}
      </div>
    </div>
  );
};
