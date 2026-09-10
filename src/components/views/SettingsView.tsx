import React, { useEffect, useState } from 'react';
import {
  Download,
  Key,
  Shield,
  Sparkles,
  Database,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { User, MainView } from '../../types';
import { isSupabaseConfigured, STORAGE_KEYS } from '../../lib/supabase';
import { checkGeminiServerStatus } from '../../services/gemini';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface SettingsViewProps {
  currentUser: User;
  onOpenAuth: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onSelectView?: (view: MainView) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onOpenAuth,
  onShowToast,
  onSelectView,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [geminiStatus, setGeminiStatus] = useState<{ available: boolean; model: string }>({
    available: true,
    model: 'gemini-flash-latest',
  });

  useEffect(() => {
    checkGeminiServerStatus().then((status) => {
      setGeminiStatus(status);
    });
  }, []);

  const handleClearCache = () => {
    if (confirm('Apakah Anda yakin ingin membersihkan riwayat cache lokal?')) {
      localStorage.removeItem(STORAGE_KEYS.STORYBOARDS);
      onShowToast('Riwayat storyboard lokal telah dibersihkan.', 'info');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50/60 p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-28 md:pb-8">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
          Pengaturan & Integrasi Sistem
        </h1>
        <p className="text-xs md:text-sm text-zinc-500 font-medium mt-1">
          Konfigurasi PWA, integrasi Supabase, Vercel, dan manajemen akun Google AI Studio.
        </p>
      </div>

      {/* Admin Dashboard Entry Card */}
      {onSelectView && (
        <div className="bg-gradient-to-r from-zinc-900 via-purple-950 to-zinc-900 text-white border border-purple-800/60 rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 flex-shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Dashboard Admin Studio Pro</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-800/80 text-purple-200 border border-purple-600">
                  ADMIN AKTIF
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                Kelola URL platform, akun PRO bersama, katalog produk digital, kurikulum kelas, dan log audit sistem.
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectView('admin')}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 flex-shrink-0 active:scale-95"
          >
            <span>Buka Dashboard Admin</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Card 1: PWA Status & Installation */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-zinc-900">
              Progressive Web App (PWA)
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              Aplikasi dapat diinstal di Android, iOS, Windows, dan macOS dengan dukungan offline.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
            <span className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>Status Instalasi: {isInstalled ? 'Telah Terinstal (Standalone)' : 'Berjalan di Browser'}</span>
          </div>

          {isInstallable && !isInstalled && (
            <button
              onClick={install}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Instal Sekarang
            </button>
          )}
        </div>
      </div>

      {/* Card 2: User Account & Automatic Gemini Activation */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-zinc-900">
              Autentikasi Akun Pengguna
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              Masuk dengan akun Google untuk mengaktifkan Gemini 3.8 Flash secara otomatis.
            </p>
          </div>
        </div>

        <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-purple-950 block">
              {currentUser.isLoggedIn ? currentUser.name : 'Belum Masuk Akun'}
            </span>
            <span className="text-[11px] text-purple-700 font-mono">
              {currentUser.isLoggedIn ? currentUser.email : 'idstudihome@gmail.com (Default Akun Kreator)'}
            </span>
          </div>

          <button
            onClick={onOpenAuth}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
          >
            {currentUser.isLoggedIn ? 'Kelola Profil & Kunci' : 'Masuk dengan Akun Google'}
          </button>
        </div>
      </div>

      {/* Card 3: Gemini AI Model Status */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-zinc-900">
              Koneksi Mesin AI Gemini
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              Status backend server dan model multimodal Google AI Studio.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
            <span className="text-zinc-500 font-medium block text-[10px]">Model Aktif</span>
            <span className="font-extrabold text-purple-700 font-mono">{geminiStatus.model}</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
            <span className="text-zinc-500 font-medium block text-[10px]">Ketersediaan Server</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Siap & Optimal
            </span>
          </div>
        </div>
      </div>

      {/* Card 4: Supabase & Vercel Readiness */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-zinc-900">
              Supabase Cloud & Vercel
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              Arsitektur aplikasi telah dikonfigurasi penuh untuk deploy instan di Vercel & Supabase.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 font-medium">Supabase Database:</span>
            <span className={`font-bold ${isSupabaseConfigured ? 'text-emerald-600' : 'text-zinc-500'}`}>
              {isSupabaseConfigured ? 'Terhubung' : 'Local Fast Fallback (Siap Masukkan URL & Key)'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 font-medium">Vercel Build Target:</span>
            <span className="font-mono font-bold text-zinc-900">Vite SPA + Node.js API Functions</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleClearCache}
            className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5" /> Bersihkan Cache Lokal
          </button>
        </div>
      </div>
    </div>
  );
};
