import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, Loader2, ArrowRight } from 'lucide-react';
import { MicrotoolAction } from '../types';
import { executeMicrotoolAPI } from '../services/gemini';
import confetti from 'canvas-confetti';

interface MicrotoolsModalProps {
  tool: MicrotoolAction | null;
  isOpen: boolean;
  onClose: () => void;
  userApiKey?: string;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const MicrotoolsModal: React.FC<MicrotoolsModalProps> = ({
  tool,
  isOpen,
  onClose,
  userApiKey,
  onShowToast,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !tool) return null;

  const handleExecute = async () => {
    if (!inputVal.trim()) {
      onShowToast('Parameter tidak boleh kosong!', 'error');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const res = await executeMicrotoolAPI(tool.name, inputVal.trim(), userApiKey);
      setResult(res.result);
      setIsLoading(false);
      onShowToast(`Berhasil mengeksekusi ${tool.name}!`, 'success');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      setIsLoading(false);
      onShowToast(`Gagal: ${err.message}`, 'error');
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    onShowToast('Hasil berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900">{tool.name}</h3>
              <p className="text-[10px] text-zinc-500 font-medium">Powered by Gemini 3.8 Flash AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              {tool.label}
            </label>
            {tool.inputType === 'textarea' ? (
              <textarea
                rows={4}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={tool.placeholder}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-medium text-zinc-900 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition resize-none"
              />
            ) : (
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={tool.placeholder}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-medium text-zinc-900 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition"
              />
            )}
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl text-[11px] text-purple-800 leading-relaxed font-medium">
            {tool.desc}
          </div>

          {result && (
            <div className="space-y-2 pt-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-zinc-700 uppercase tracking-wider">
                  Hasil Pemrosesan AI
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg transition border border-purple-200 active:scale-95"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Tersalin' : 'Salin Hasil'}</span>
                </button>
              </div>

              <div className="bg-zinc-900 text-zinc-100 rounded-2xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border border-zinc-800 shadow-inner selection:bg-purple-600">
                {result}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-xl text-xs hover:bg-zinc-100 transition"
          >
            Tutup
          </button>
          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <span>Jalankan AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
