import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  Film,
  RotateCw,
  CheckCircle2,
  Share2,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';

interface GeminiWorkspaceProps {
  userEmail: string;
  onOpenStudio: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const GeminiWorkspace: React.FC<GeminiWorkspaceProps> = ({
  userEmail,
  onOpenStudio,
  onShowToast,
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: 'Halo! Saya Google Gemini Advanced terintegrasi di Studio Pro (Model Gemini 3.8 Flash). Saya siap membantu merancang alur cerita video sinematik, analisis psikologi penonton, narasi voiceover, hingga prompt video teknis untuk Google Flow, Sora, dan Kling. Apa proyek kreatif yang ingin kita kembangkan hari ini?',
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
    const newMsg = { role: 'user' as const, text: q, time: timeStr };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const savedCustomKey = localStorage.getItem('CUSTOM_GEMINI_API_KEY') || undefined;
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          persona: 'gemini',
          history: messages.map((m) => ({ role: m.role, text: m.text })).slice(-10),
          userApiKey: savedCustomKey,
        }),
      });
      const data = await res.json();
      const reply = data.reply || 'Maaf, saya tidak dapat memproses permintaan saat ini.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: '✨ Rekomendasi Gemini:\nUntuk memaksimalkan dampak visual, kombinasikan hook visual dramatis dengan pergerakan kamera dinamis (contoh: Low-angle tracking push in). Buka AI Storyboard untuk merender adegan secara terstruktur!',
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
    onShowToast('Teks berhasil disalin!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-3 sm:p-6 space-y-4 animate-fade-in">
      {/* Ecosystem Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-zinc-900 text-base sm:text-lg tracking-tight">
                Gemini Advanced Workspace
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Google SSO Aktif
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              Terhubung otomatis via <strong className="text-zinc-800">{userEmail}</strong> • Engine Gemini 3.8 Flash
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href="https://gemini.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            title="Buka Gemini Asli di Google"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Web Resmi</span>
          </a>
          <button
            onClick={onOpenStudio}
            className="w-full sm:w-auto px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Buka AI Storyboard</span>
          </button>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          '🎬 Susun alur naskah video misteri 3 scene',
          '🔥 Rekomendasi 5 hook video TikTok viral 2026',
          '💡 Arahan kamera sinematik 35mm untuk produk mewah',
          '🎙️ Tulis voiceover emosional durasi 20 detik',
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

      {/* Chat Messages Flow */}
      <div className="flex-1 bg-white rounded-3xl border border-zinc-200/80 shadow-sm p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[380px]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 text-xs leading-relaxed ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl relative group ${
                m.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-xs shadow-sm font-medium'
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
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-600 flex items-center gap-2">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
              <span>Gemini 3.8 Flash sedang merumuskan ide...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="bg-white border-2 border-zinc-200 rounded-2xl p-2 flex items-center gap-2 shadow-sm focus-within:border-purple-600 transition"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan analisis naskah, prompt sinematik, atau riset pada Gemini..."
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-medium outline-none text-zinc-900"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl transition active:scale-95 disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kirim</span>
        </button>
      </form>
    </div>
  );
};
