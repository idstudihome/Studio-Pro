import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ExternalLink, Maximize2, RotateCw, ShieldCheck } from 'lucide-react';
import { ToolConfig } from '../../../types';

const LOAD_TIMEOUT_MS = 6000;

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

interface ProductionWebviewProps {
  tool: ToolConfig;
  userEmail?: string;
  onOpenExternal: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onSwitchToStudio?: () => void;
}

function parseExternalUrl(rawUrl: string): URL | null {
  try {
    const url = new URL(rawUrl.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (typeof window !== 'undefined' && url.origin === window.location.origin) return null;
    return url;
  } catch {
    return null;
  }
}

function preferStandalone(url: URL | null): boolean {
  return Boolean(url && STANDALONE_HOST_PATTERNS.some((pattern) => pattern.test(url.hostname)));
}

function popupFeatures(): string {
  const width = Math.min(1440, Math.max(980, Math.round(window.screen.availWidth * 0.86)));
  const height = Math.min(960, Math.max(720, Math.round(window.screen.availHeight * 0.86)));
  const left = Math.max(0, Math.round((window.screen.availWidth - width) / 2));
  const top = Math.max(0, Math.round((window.screen.availHeight - height) / 2));
  return `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,location=yes,toolbar=yes,menubar=no,status=yes`;
}

export const ProductionWebview: React.FC<ProductionWebviewProps> = ({
  tool,
  onOpenExternal,
  onShowToast,
}) => {
  const target = useMemo(() => parseExternalUrl(tool.url), [tool.url]);
  const standalone = useMemo(() => preferStandalone(target), [target]);
  const [viewMode, setViewMode] = useState<'embed' | 'standalone'>(standalone ? 'standalone' : 'embed');
  const [loading, setLoading] = useState(Boolean(target) && !standalone);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);
  const timerRef = useRef<number | null>(null);
  const timedOutRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const reset = () => {
    clearTimer();
    timedOutRef.current = false;
    setError(false);
    setViewMode(standalone ? 'standalone' : 'embed');
    setLoading(Boolean(target) && !standalone);
    setKey((value) => value + 1);
  };

  useEffect(() => {
    clearTimer();
    timedOutRef.current = false;
    setError(false);
    setViewMode(standalone ? 'standalone' : 'embed');
    setLoading(Boolean(target) && !standalone);
    setKey((value) => value + 1);
    return clearTimer;
    // Reset whenever platform URL or account-backed parent view changes.
  }, [tool.id, tool.url, standalone, target]);

  useEffect(() => clearTimer, []);

  useEffect(() => {
    if (!target || standalone || viewMode !== 'embed') return;
    timerRef.current = window.setTimeout(() => {
      timedOutRef.current = true;
      setLoading(false);
      setError(true);
    }, LOAD_TIMEOUT_MS);
    return clearTimer;
  }, [key, viewMode, standalone, target]);

  const openRealWeb = () => {
    if (!target) {
      onShowToast('URL platform tidak valid.', 'error');
      return;
    }
    const popup = window.open(target.href, `StudioPro_${tool.id}`, popupFeatures());
    if (!popup) {
      window.open(target.href, '_blank', 'noopener,noreferrer');
      onShowToast('Pop-up diblokir browser. Platform dibuka di tab baru.', 'info');
      return;
    }
    popup.opener = null;
    popup.focus();
    setViewMode('standalone');
    setLoading(false);
    onShowToast(`${tool.name} dibuka di web resmi platform.`, 'success');
  };

  if (!target) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-zinc-50 p-6">
        <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-7 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-3 h-7 w-7 text-amber-600" />
          <h2 className="text-sm font-extrabold text-zinc-900">URL platform tidak valid</h2>
          <p className="mt-2 text-xs text-zinc-500">WebView tidak membuat halaman pengganti. Hanya URL platform eksternal yang valid yang dapat dimuat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      <div className="flex h-11 flex-shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-3">
        <div className="flex min-w-0 items-center gap-2">
          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <div className="truncate text-xs font-extrabold text-zinc-900">{tool.name}</div>
            <div className="truncate text-[10px] font-mono text-zinc-500">{target.hostname}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!standalone && (
            <button type="button" onClick={() => { setError(false); setLoading(true); setViewMode('embed'); setKey((value) => value + 1); }} className="hidden rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-zinc-600 hover:bg-zinc-100 md:block">
              Workspace Web
            </button>
          )}
          <button type="button" onClick={openRealWeb} className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-purple-500">
            <Maximize2 className="h-3 w-3" />
            Web Resmi
          </button>
          <button type="button" onClick={reset} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" title="Muat ulang web resmi">
            <RotateCw className="h-3.5 w-3.5" />
          </button>
          <a href={target.href} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" aria-label={`Buka ${tool.name} di tab baru`}>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <main className="relative min-h-0 flex-1 overflow-hidden bg-white">
        {viewMode === 'standalone' ? (
          <div className="flex h-full items-center justify-center bg-zinc-50 p-6 text-center">
            <div className="max-w-lg rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
              <Maximize2 className="mx-auto mb-4 h-7 w-7 text-purple-600" />
              <h2 className="text-sm font-extrabold text-zinc-900">Web resmi {tool.name}</h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">Platform ini memerlukan browser top-level untuk autentikasi atau interaksi tertentu. Studio Pro tidak mensimulasikan platform tersebut.</p>
              <button type="button" onClick={openRealWeb} className="mt-5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-500">Buka Web Resmi</button>
            </div>
          </div>
        ) : (
          <>
            {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white"><div className="text-center"><RotateCw className="mx-auto mb-2 h-6 w-6 animate-spin text-purple-600" /><div className="text-xs font-bold text-zinc-800">Memuat web {tool.name}…</div><div className="mt-1 text-[11px] text-zinc-400">Maks. 6 detik</div></div></div>}
            {error && <div className="absolute inset-0 z-20 flex items-center justify-center bg-white p-6 text-center"><div className="max-w-lg"><AlertTriangle className="mx-auto mb-4 h-7 w-7 text-amber-600" /><h2 className="text-sm font-extrabold text-zinc-900">Platform menolak penyematan</h2><p className="mt-2 text-xs leading-relaxed text-zinc-500">CSP, X-Frame-Options, atau login pihak ketiga dapat mencegah web asli tampil di iframe. Studio Pro menghentikan frame dan menggunakan web resmi sebagai jalur yang benar.</p><div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row"><button type="button" onClick={openRealWeb} className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-500">Buka Web Resmi</button><button type="button" onClick={() => { setError(false); setLoading(true); setKey((value) => value + 1); }} className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50">Coba Lagi</button></div></div></div>}
            <iframe key={key} src={target.href} title={`${tool.name} — web resmi`} onLoad={() => { if (!timedOutRef.current) { clearTimer(); setLoading(false); setError(false); } }} onError={() => { clearTimer(); setLoading(false); setError(true); }} referrerPolicy="strict-origin-when-cross-origin" allow="camera; microphone; clipboard-read; clipboard-write; encrypted-media; display-capture; fullscreen; geolocation; autoplay; accelerometer; gyroscope" className="block h-full w-full border-0 bg-white" />
          </>
        )}
      </main>
    </div>
  );
};
