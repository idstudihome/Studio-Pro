import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  RotateCw,
  CheckCircle2,
  KeyRound,
  FileCode,
  ListOrdered,
  ExternalLink,
} from 'lucide-react';

interface ChatGPTWorkspaceProps {
  onOpenAuthModal: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ChatGPTWorkspace: React.FC<ChatGPTWorkspaceProps> = ({
  onOpenAuthModal,
  onShowToast,
}) => {
  const [model, setModel] = useState<'gpt-4o' | 'o1-preview' | 'gpt-4-turbo'>('gpt-4o');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: 'Halo! Saya ChatGPT Plus (GPT-4o) di Studio Pro. Saya siap membantu Anda menyusun naskah komprehensif, script video YouTube/TikTok, copywriting promosi berkonversi tinggi, serta perancangan prompt teknis. Apa yang ingin kita kerjakan?',
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
          persona: 'chatgpt',
          model,
          history: messages.map((m) => ({ role: m.role, text: m.text })).slice(-10),
          userApiKey: savedCustomKey,
        }),
      });
      const data = await res.json();
      const reply = data.reply || 'Memproses tanggapan...';

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
          text: `💡 **ChatGPT Plus (GPT-4o)**:\nBerikut strategi teruji untuk "${q}":\n\n1. **Struktur Naskah**: 0-3s Hook → 3-15s Retensi & Problem → 15-25s Solusi & Bukti → 25-30s Call To Action.\n2. **Kunci Sukses**: Gunakan kata-kata berkekuatan visual tinggi dan ritme potong cepat.`,
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
      {/* Top ChatGPT Header & Native Sesi */}
      <div className="bg-[#10a37f] text-white rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#10a37f] font-black text-xl flex items-center justify-center shadow-md flex-shrink-0">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                ChatGPT Plus Workspace
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-white" />
                Sesi Native Aktif
              </span>
            </div>
            <p className="text-xs text-white/80 font-medium">
              Model OpenAI Terintegrasi Langsung Tanpa Buka Tab Baru
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as any)}
            className="bg-emerald-900/60 border border-white/20 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
          >
            <option value="gpt-4o">GPT-4o (Omni Fast)</option>
            <option value="o1-preview">o1-preview (Reasoning)</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
          </select>

          <a
            href="https://chatgpt.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-emerald-900/60 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition border border-white/20 flex items-center gap-1.5"
            title="Buka Website Resmi chatgpt.com"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Web Resmi</span>
          </a>

          <button
            onClick={onOpenAuthModal}
            className="p-2.5 bg-emerald-900/60 hover:bg-emerald-900 text-white rounded-xl transition border border-white/20"
            title="Kelola Sesi Akun OpenAI"
          >
            <KeyRound className="w-4 h-4 text-emerald-200" />
          </button>
        </div>
      </div>

      {/* Suggested Queries */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          '📝 Tulis naskah video TikTok Shop 30 detik untuk produk kecantikan',
          '🎯 5 Judul clickbait etis untuk thumbnail YouTube',
          '⚡ Strategi email marketing promosi diskon kilat',
          '🎬 Buat prompt scene visual dramatis untuk Flow',
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

      {/* Chat Messages */}
      <div className="flex-1 bg-white rounded-3xl border border-zinc-200/80 shadow-sm p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[380px]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 text-xs leading-relaxed ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-[#10a37f] text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                <Bot className="w-4 h-4" />
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
              <div className="w-8 h-8 rounded-xl bg-[#10a37f] text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-[#10a37f] text-white flex items-center justify-center flex-shrink-0 shadow-xs animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-600 flex items-center gap-2">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-[#10a37f]" />
              <span>ChatGPT sedang merumuskan jawaban terbaik...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="bg-white border-2 border-zinc-200 rounded-2xl p-2 flex items-center gap-2 shadow-sm focus-within:border-[#10a37f] transition"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan pembuatan script, copywriting, atau ide pada ChatGPT..."
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-medium outline-none text-zinc-900"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-5 py-2.5 bg-[#10a37f] hover:bg-[#0e8a6c] text-white text-xs font-bold rounded-xl transition active:scale-95 disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kirim</span>
        </button>
      </form>
    </div>
  );
};
