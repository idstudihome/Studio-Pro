import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound, CheckCircle2, Lock, Sparkles, UserCheck } from 'lucide-react';
import { ToolConfig } from '../types';

interface InAppPlatformAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: ToolConfig;
  userEmail: string;
  onAuthSuccess: (toolId: string, accountName: string) => void;
}

export const InAppPlatformAuthModal: React.FC<InAppPlatformAuthModalProps> = ({
  isOpen,
  onClose,
  tool,
  userEmail,
  onAuthSuccess,
}) => {
  const isGoogleTool = ['Flow', 'Gemini', 'GoogleNotes', 'YouTube', 'GoogleTrends'].includes(tool.id);
  const [accountName, setAccountName] = useState(() => {
    return isGoogleTool ? userEmail : `${tool.name} Pro Creator`;
  });
  const [sessionToken, setSessionToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      // Save session to localStorage
      try {
        const key = `SESSION_AUTH_${tool.id}`;
        localStorage.setItem(
          key,
          JSON.stringify({
            toolId: tool.id,
            accountName: accountName || `${tool.name} User`,
            connectedAt: new Date().toISOString(),
            status: 'ACTIVE_PRO',
            isGoogleEcosystem: isGoogleTool,
          })
        );
      } catch (err) {
        console.error(err);
      }

      onAuthSuccess(tool.id, accountName || `${tool.name} User`);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 relative overflow-hidden">
        {/* Top Gradient Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-md">
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-zinc-900 text-base">
                Autentikasi {tool.name}
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium">
                Sesi Native Terenkapsulasi di Workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isGoogleTool ? (
          /* Google Ecosystem Auto-Auth View */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-blue-950 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-blue-900">
                  Ekosistem Google Terdeteksi
                </p>
                <p className="text-blue-700 mt-1 leading-relaxed">
                  Platform <strong>{tool.name}</strong> secara otomatis terhubung dengan akun Google Anda:
                </p>
                <div className="mt-2 py-1.5 px-3 bg-white/90 border border-blue-200 rounded-xl font-mono text-blue-900 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{userEmail}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-[11px] text-zinc-600 space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Single Sign-On (SSO) Google Workspace Aktif</span>
              </div>
              <p className="text-zinc-500 pl-5">
                Semua proyek, kredit, dan sesi disimpan langsung dalam ekosistem akun Google Anda tanpa perlu login ulang.
              </p>
            </div>

            <button
              onClick={() => {
                onAuthSuccess(tool.id, userEmail);
                onClose();
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Gunakan Akun Google Ini</span>
            </button>
          </div>
        ) : (
          /* 3rd Party Platform Native Auth (Canva, Grok, ChatGPT, CapCut, TikTok, X, etc.) */
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="p-3.5 bg-purple-50/70 border border-purple-200/70 rounded-2xl text-xs text-purple-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">In-Workspace Native Authentication</p>
                <p className="text-[11px] text-purple-700 mt-0.5 leading-relaxed">
                  Hubungkan akun <strong>{tool.name}</strong> Anda langsung di dalam workspace tanpa membuka tab baru di luar aplikasi.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                Nama Akun / Profil Sesi
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder={`Contoh: ${tool.name} Pro Tim`}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5 flex justify-between">
                <span>Token Sesi / Cookie Kredensial</span>
                <span className="text-[10px] text-zinc-400 font-normal">Opsional</span>
              </label>
              <input
                type="password"
                value={sessionToken}
                onChange={(e) => setSessionToken(e.target.value)}
                placeholder="Masukkan token sesi atau biarkan kosong untuk sesi simulasi PRO"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Kredensial disimpan secara terenkapsulasi di browser sandbox Anda.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 py-2.5 px-4 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Menghubungkan...</span>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Aktifkan Sesi Native</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
