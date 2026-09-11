import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Maximize2,
  RotateCw,
  ShieldCheck,
} from 'lucide-react';
import { AccountProfile, ToolConfig } from '../../types';

const IFRAME_LOAD_TIMEOUT_MS = 6000;

/**
 * Full web apps frequently reject iframe embedding through CSP/X-Frame-Options
 * or require browser-level authentication/cookie behavior. These hosts should
 * therefore start in the native browser window so users get the real product,
 * not a simulated Studio Pro surface.
 */
const STANDALONE_HOST_PATTERNS = [
  /^([a-z0-9-]+\.)*chatgpt\.com$/i,
  /^([a-z0-9-]+\.)*canva\.com$/i,
  /^([a-z0-9-]+\.)*capcut\.com$/i,
  /^([a-z0-9-]+\.)*tiktok\.com$/i,
  /^([a-z0-9-]+\.)*instagram\.com$/i,
  /^([a-z0-9-]+\.)*x\.com$/i,
  /^([a-z0-9-]+\.)*labs\.google$/i,
  /^([a-z0-9-]+\.)*google\.com$/i,
];

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

function validateExternalTarget(rawUrl?: string): URL | null {
  if (!rawUrl || typeof window === 'undefined') return null;

  try {
    const url = new URL(rawUrl.trim());

    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.origin === window.location.origin) return null;
    if (url.href === window.location.href) return null;

    return url;
  } catch {
    return null;
  }
}

function shouldPreferStandalone(url: URL | null): boolean {
  return Boolean(url && STANDALONE_HOST_PATTERNS.some((pattern) => pattern.test(url.hostname)));
}

function buildPopupFeatures(): string {
  const width = Math.min(1440, Math.max(980, Math.round(window.screen.availWidth * 0.86)));
  const height = Math.min(960, Math.max(720, Math.round(window.screen.availHeight * 0.86)));
  const left = Math.max(0, Math.round((window.screen.availWidth - width) / 2));
  const top = Math.max(0, Math.round((window.screen.availHeight - height) / 2));
  return `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,location=yes,toolbar=yes,menubar=no,status=yes`;
}

export const AppWorkspaceView: React.FC<AppWorkspaceViewProps> = ({
  tool,
  activeAccountId,
  refreshKey = 0,
  onForceRefresh,
  onShowToast,
}) => {
  const targetUrl = useMemo(() => validateExternalTarget(tool.url), [tool.url]);
  const standalonePreferred = useMemo(() => shouldPreferStandalone(targetUrl), [targetUrl]);

  const [mode, setMode] = useState<'embed' | 'standalone'>(standalonePreferred ? 'standalone' : 'embed');
  const [isLoading, setIsLoading] = useState(Boolean(targetUrl) && !standalonePreferred);
  const [loadError, setLoadError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const timedOutRef = useRef(false);

  const hostname = targetUrl?.hostname || 'URL tidak valid';

  const clearLoadTimer = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const resetWorkspaceState = () => {
    clearLoadTimer();
    timedOutRef.current = false;
    setLoadError(false);
    setMode(standalonePreferred ? 'standalone' : 'embed');
    setIsLoading(Boolean(targetUrl) && !standalonePreferred);
    setIframeKey((value) => value + 1);
  };

  useEffect(() => {
    clearLoadTimer();
    timedOutRef.current = false;
    setLoadError(false);
    setMode(standalonePreferred ? 'standalone' : 'embed');
    setIsLoading(Boolean(targetUrl) && !standalonePreferred);
    setIframeKey((value) => value + 1);

    return clearLoadTimer;
    // Changing account is intentionally part of the lifecycle reset: account
    // sessions must never inherit stale iframe state from another account.
  }, [tool.id, tool.url, activeAccountId, refreshKey, standalonePreferred, targetUrl]);

  useEffect(() => clearLoadTimer, []);

  useEffect(() => {
    if (!targetUrl || standalonePreferred || mode !== 'embed') return;

    timeoutRef.current = window.setTimeout(() => {
      timedOutRef.current = true;
      setIsLoading(false);
      setLoadError(true);
    }, IFRAME_LOAD_TIMEOUT_MS);

    return clearLoadTimer;
  }, [iframeKey, mode, standalonePreferred, targetUrl]);

  const openStandalone = () => {
    if (!targetUrl) {
      onShowToast?.('Platform tidak memiliki URL eksternal yang valid.', 'error');
      return;
    }

    const popup = window.open(targetUrl.href, `StudioPro_${tool.id}`, buildPopupFeatures());

    if (!popup) {
      window.open(targetUrl.href, '_blank', 'noopener,noreferrer');
      onShowToast?.('Jendela baru diblokir browser. Platform dibuka di tab baru.', 'info');
      return;
    }

    popup.opener = null;
    popup.focus();
    setMode('standalone');
    setIsLoading(false);
    onShowToast?.(`${tool.name} dibuka menggunakan web resmi platform.`, 'success');
  };

  const handleEmbedLoad = () => {
    if (timedOutRef.current) return;
    clearLoadTimer();
    setIsLoading(false);
    setLoadError(false);
  };

  const handleEmbedError = () => {
    clearLoadTimer();
    setIsLoading(false);
    setLoadError(true);
  };

  const retryEmbed = () => {
    clearLoadTimer();
    timedOutRef.current = false;
    setLoadError(false);
    setIsLoading(true);
    setIframeKey((value) => value + 1);
  };

  const refresh = () => {
    resetWorkspaceState();
    onForceRefresh?.();
  };

  if (!targetUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-50 p-6">
        <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-sm font-extrabold text-zinc-900">URL platform tidak valid</h2>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Workspace hanya dapat memuat alamat web eksternal yang valid. Tidak ada iframe atau halaman pengganti yang dibuat oleh Studio Pro.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      <header className="flex h-11 flex-shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-3">
        <div className="flex min-w-0 items-center gap-2">
          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <div className="truncate text-xs font-extrabold text-zinc-900">{tool.name}</div>
            <div className="truncate text-[10px] font-mono text-zinc-500">{hostname}</div>
          </div>
          {standalonePreferred && (
            <span className="hidden rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 sm:inline-flex">
              Web native disarankan
            </span>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          {!standalonePreferred && (
            <button
              type="button"
              onClick={() => {
                setMode('embed');
                setLoadError(false);
                setIsLoading(true);
                setIframeKey((value) => value + 1);
              }}
              className={`hidden rounded-lg px-2.5 py-1.5 text-[10px] font-bold md:block ${mode === 'embed' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              Workspace Web
            </button>
          )}
          <button
            type="button"
            onClick={openStandalone}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${
              mode === 'standalone' || standalonePreferred
                ? 'bg-purple-600 text-white hover:bg-purple-500'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
            }`}
            title="Buka web resmi platform"
          >
            <Maximize2 className="h-3 w-3" />
            <span className="hidden sm:inline">Web Resmi</span>
          </button>
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            title="Muat ulang web platform"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
          <a
            href={targetUrl.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            title="Buka platform di tab baru"
            aria-label={`Buka ${tool.name} di tab baru`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <main className="relative min-h-0 flex-1 overflow-hidden bg-white">
        {mode === 'standalone' ? (
          <div className="flex h-full w-full items-center justify-center bg-zinc-50 p-6 text-center">
            <div className="max-w-lg rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Maximize2 className="h-6 w-6" />
              </div>
              <h2 className="text-sm font-extrabold text-zinc-900">Gunakan web resmi {tool.name}</h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                Browser memerlukan konteks web asli untuk login, cookie, keamanan, dan navigasi platform. Studio Pro tidak mengganti halaman platform dengan simulasi.
              </p>
              <button
                type="button"
                onClick={openStandalone}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-500"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Buka Web Resmi
              </button>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-2 text-center">
                  <RotateCw className="h-6 w-6 animate-spin text-purple-600" />
                  <div className="text-xs font-bold text-zinc-800">Memuat web {tool.name}…</div>
                  <div className="text-[11px] text-zinc-400">Menunggu halaman resmi (maks. 6 detik)</div>
                </div>
              </div>
            )}

            {loadError && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white p-6 text-center">
                <div className="max-w-lg">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h2 className="text-sm font-extrabold text-zinc-900">Web resmi tidak dapat disematkan</h2>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                    {tool.name} kemungkinan menggunakan CSP/X-Frame-Options atau mekanisme login yang membutuhkan top-level browser context. Studio Pro menghentikan iframe dan tidak mencoba bypass keamanan platform.
                  </p>
                  <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={openStandalone}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-500"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      Buka Web Resmi
                    </button>
                    <button
                      type="button"
                      onClick={retryEmbed}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={targetUrl.href}
              title={`${tool.name} — web resmi`}
              onLoad={handleEmbedLoad}
              onError={handleEmbedError}
              referrerPolicy="strict-origin-when-cross-origin"
              allow="camera; microphone; clipboard-read; clipboard-write; encrypted-media; display-capture; fullscreen; geolocation; autoplay; accelerometer; gyroscope"
              className="block h-full w-full border-0 bg-white"
            />
          </>
        )}
      </main>
    </div>
  );
};
