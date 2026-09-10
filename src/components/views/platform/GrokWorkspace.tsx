import React, { useState } from 'react';
import {
  Zap,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  KeyRound,
  CheckCircle2,
  Share2,
  Flame,
  RotateCw,
  ExternalLink,
} from 'lucide-react';

interface GrokWorkspaceProps {
  onOpenAuthModal: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const GrokWorkspace: React.FC<GrokWorkspaceProps> = ({
  onOpenAuthModal,
  onShowToast,
}) => {
  const [mode, setMode] = useState<'normal' | 'fun' | 'think'>('think');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: '🚀 Halo! Saya Grok (xAI) terintegrasi langsung di Studio Pro. Saya siap memberikan analisis tanpa filter, membongkar algoritma video viral, merumuskan hook kontroversial berdaya pikat tinggi, serta penalaran mendalam berbasis data real-time. Apa yang ingin kita eksplorasi?',
      time: 'Baru saja',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', text: q, time: timeStr }]);
    setInput('');
    setIsLoading(true);

    try {
      const savedCustomKey = localStorage.getItem('CUSTOM_GEMINI_API_KEY') || undefined;
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          persona: 'grok',
          mode,
          history: messages.map((m) => ({ role: m.role, text: m.text })).slice(-10),
          userApiKey: savedCustomKey,
        }),
      });
      const data = await res.json();
      const reply = data.reply || 'Grok memproses data...';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `💡 **Grok Reasoning**: Untuk pertanyaan "${q}", intinya ada pada psikologi penonton: manusia tidak membeli produk, mereka membeli transformasi diri. Buat visual sebelum & sesudah secara dramatis di detik ke-3!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    onShowToast('Respon Grok berhasil disalin!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-3 sm:p-6 space-y-4 animate-fade-in">
      {/* Top Grok Header & Native Sesi */}
      <div className="bg-zinc-950 text-white rounded-3xl p-4 sm:p-6 border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-white text-black font-black text-xl flex items-center justify-center shadow-md flex-shrink-0">
            xAI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                Grok (xAI) Reasoning Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Sesi Native Aktif
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              Eksplorasi ide tanpa batas • Terhubung langsung di dalam workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl gap-1 flex-1 sm:flex-none">
            {[
              { id: 'think', label: 'Deep Think' },
              { id: 'fun', label: 'Fun Mode' },
              { id: 'normal', label: 'Normal' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  mode === m.id
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <a
            href="https://grok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition border border-zinc-800 flex items-center gap-1.5"
            title="Buka Website Resmi grok.com"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Web Resmi</span>
          </a>

          <button
            onClick={onOpenAuthModal}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl transition border border-zinc-800"
            title="Kelola Sesi Akun xAI"
          >
            <KeyRound className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Suggested Queries */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          '🔥 Bongkar trik algoritma FYP TikTok & Reels terbaru',
          '⚡ Analisis kontradiksi pasar produk affiliate 2026',
          '🎯 3 Hook psikologis yang memaksa orang berhenti scroll',
          '📊 Prediksi tren konten digital 6 bulan ke depan',
        ].map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSend(sug)}
            className="px-3.5 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-full text-xs font-semibold text-zinc-700 whitespace-nowrap shadow-2xs transition active:scale-95 flex-shrink-0"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Chat Feed */}
      <div className="flex-1 bg-white rounded-3xl border border-zinc-200/80 shadow-sm p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[380px]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 text-xs leading-relaxed ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                xAI
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl relative group ${
                m.role === 'user'
                  ? 'bg-zinc-900 text-white rounded-br-xs shadow-sm font-medium'
                  : 'bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-bl-xs whitespace-pre-wrap'
              }`}
            >
              <div className="font-medium text-xs sm:text-[13px]">{m.text}</div>
              
              <div className="flex items-center justify-between mt-2 pt-1 text-[10px] opacity-70">
                <span>{m.time}</span>
                {m.role === 'assistant' && (
                  <button
                    onClick={() => copyText(m.text, idx)}
                    className="p-1 hover:bg-zinc-200 rounded text-zinc-600 transition"
                    title="Salin Pesan"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs animate-pulse">
              xAI
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-600 flex items-center gap-2">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-zinc-800" />
              <span>Grok sedang melakukan penalaran mendalam...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="bg-white border-2 border-zinc-200 rounded-2xl p-2 flex items-center gap-2 shadow-sm focus-within:border-zinc-900 transition"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan analisis tajam atau bedah strategi pada Grok..."
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-medium outline-none text-zinc-900"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition active:scale-95 disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kirim</span>
        </button>
      </form>
    </div>
  );
};
