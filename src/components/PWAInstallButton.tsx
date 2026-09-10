import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
        title="Instal Studio Pro sebagai Web App / PWA"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instal App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition active:scale-95 border border-zinc-200"
        >
          <Download className="w-3.5 h-3.5 text-purple-600" />
          <span className="hidden sm:inline">Instal di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-zinc-100 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-zinc-900">Instal Studio Pro di iPhone / iPad</h3>
              <div className="mt-3 space-y-2 text-xs text-zinc-600 font-medium">
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-800 font-bold flex items-center justify-center text-[11px] flex-shrink-0">1</span>
                  <span>Ketuk tombol <strong className="text-zinc-900 inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 text-blue-600 inline" /> Share</strong> di toolbar Safari.</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-800 font-bold flex items-center justify-center text-[11px] flex-shrink-0">2</span>
                  <span>Gulir ke bawah dan pilih <strong className="text-zinc-900 inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-zinc-700 inline" /> Tambah ke Layar Utama (Add to Home Screen)</strong>.</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-800 font-bold flex items-center justify-center text-[11px] flex-shrink-0">3</span>
                  <span>Buka langsung seperti aplikasi native berlayar penuh!</span>
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition active:scale-95"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => {
        alert('Untuk menginstal Studio Pro:\n• Di Chrome/Edge: Klik ikon instal di bilah alamat browser.\n• Di Ponsel: Buka menu titik tiga browser dan pilih "Instal Aplikasi" atau "Tambahkan ke Layar Utama".');
      }}
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition active:scale-95 border border-purple-200"
      title="Petunjuk Instalasi PWA"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Instal App</span>
    </button>
  );
};
