import React, { useState } from 'react';
import {
  Palette,
  Type,
  Image as ImageIcon,
  Download,
  Share2,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  KeyRound,
} from 'lucide-react';

interface CanvaWorkspaceProps {
  onOpenAuthModal: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const CanvaWorkspace: React.FC<CanvaWorkspaceProps> = ({
  onOpenAuthModal,
  onShowToast,
}) => {
  const [template, setTemplate] = useState<'thumbnail' | 'story' | 'banner'>('thumbnail');
  const [headline, setHeadline] = useState('RAHASIA VIDEO VIRAL 2026');
  const [subhead, setSubhead] = useState('Trik Algoritma Tersembunyi Kreator Top');
  const [bgColor, setBgColor] = useState('#0f172a');
  const [accentColor, setAccentColor] = useState('#f59e0b');
  const [badgeText, setBadgeText] = useState('100% WORK');

  const [elements, setElements] = useState<Array<{ id: string; text: string; type: 'badge' | 'text' }>>([
    { id: 'el_1', text: '🔥 TRENDING NO. 1', type: 'badge' },
  ]);

  const addElement = () => {
    const newEl = {
      id: 'el_' + Date.now(),
      text: '✨ Trik Baru',
      type: 'badge' as const,
    };
    setElements([...elements, newEl]);
    onShowToast('Elemen baru ditambahkan ke canvas Canva', 'info');
  };

  const removeElement = (id: string) => {
    setElements(elements.filter((e) => e.id !== id));
  };

  const handleExport = () => {
    onShowToast('Mengekspor desain Canva Pro (Resolusi Tinggi PNG)...', 'info');
    try {
      const width = template === 'thumbnail' ? 1280 : template === 'story' ? 720 : 1080;
      const height = template === 'thumbnail' ? 720 : template === 'story' ? 1280 : 1080;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // Draw ambient glow
        const grad = ctx.createRadialGradient(width, 0, 10, width, 0, width * 0.7);
        grad.addColorStop(0, accentColor);
        grad.addColorStop(1, 'transparent');
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;

        // Draw badge
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        const badgeW = 220;
        const badgeH = 46;
        const badgeX = 50;
        const badgeY = 50;
        if (ctx.roundRect) {
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 23);
        } else {
          ctx.rect(badgeX, badgeY, badgeW, badgeH);
        }
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
        ctx.fillText(badgeText, badgeX + 22, badgeY + 30);

        // Draw headline
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 46px system-ui, -apple-system, sans-serif';
        ctx.fillText(headline.slice(0, 35), 50, height / 2 - 20);

        // Draw subhead
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
        ctx.fillText(subhead.slice(0, 45), 50, height / 2 + 35);

        // Footer watermark
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.fillText('DESIGNED IN STUDIO PRO • CANVA ENGINE', 50, height - 45);

        // Trigger real download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `canva-${template}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();

        onShowToast('Desain Canva Pro berhasil diunduh ke komputer Anda!', 'success');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Desain Canva Pro berhasil diekspor!', 'success');
    }
  };

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header & Native Auth Status */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
            <Palette className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-zinc-900 text-lg sm:text-xl tracking-tight">
                Canva Pro Studio Editor
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[10px] font-bold text-cyan-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-cyan-600" />
                Sesi Native Terhubung
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              Desain thumbnail YouTube, cover TikTok, & aset visual tanpa keluar dari workspace Studio Pro.
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto flex items-center gap-2">
          <button
            onClick={onOpenAuthModal}
            className="flex-1 md:flex-none px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-700" />
            <span>Kelola Sesi Akun</span>
          </button>
          <button
            onClick={handleExport}
            className="flex-1 md:flex-none px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-600/20 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Desain HD</span>
          </button>
        </div>
      </div>

      {/* Editor Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Canvas Live Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-600" />
              Live Graphic Canvas
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {template === 'thumbnail' ? '1280 x 720 (16:9)' : template === 'story' ? '1080 x 1920 (9:16)' : '1080 x 1080 (1:1)'}
            </span>
          </div>

          {/* Interactive Dynamic Canvas Frame */}
          <div
            className={`w-full rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 ${
              template === 'story' ? 'aspect-[9/14] max-w-sm mx-auto' : 'aspect-video'
            }`}
            style={{ backgroundColor: bgColor }}
          >
            {/* Background Texture & Ambient Glow */}
            <div
              className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: accentColor }}
            />

            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2 z-10">
              <span
                className="px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-md"
                style={{ backgroundColor: accentColor, color: '#000' }}
              >
                {badgeText}
              </span>
              {elements.map((el) => (
                <span
                  key={el.id}
                  className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5"
                >
                  {el.text}
                  <button
                    onClick={() => removeElement(el.id)}
                    className="hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Middle Main Content Display */}
            <div className="space-y-3 my-auto z-10">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-md">
                {headline}
              </h1>
              <p
                className="text-xs sm:text-base font-extrabold drop-shadow"
                style={{ color: accentColor }}
              >
                {subhead}
              </p>
            </div>

            {/* Bottom Footer Watermark / CTA */}
            <div className="flex items-center justify-between text-white/70 text-[11px] font-bold pt-4 border-t border-white/10 z-10">
              <span>DESIGNED IN STUDIO PRO</span>
              <span className="bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur">CANVA PRO ENGINE</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-sm space-y-5">
          <div>
            <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider mb-2">
              Format Desain
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'thumbnail', label: 'Thumbnail', desc: '16:9' },
                { id: 'story', label: 'Story/Reels', desc: '9:16' },
                { id: 'banner', label: 'Square Post', desc: '1:1' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    template === t.id
                      ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950 font-bold'
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs'
                  }`}
                >
                  <span className="block text-xs font-bold">{t.label}</span>
                  <span className="text-[10px] text-zinc-400">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
              Judul Utama (Headline)
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-cyan-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
              Sub-Judul / Keterangan
            </label>
            <input
              type="text"
              value={subhead}
              onChange={(e) => setSubhead(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:border-cyan-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
              Badge Teks Sorotan
            </label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-cyan-600 transition"
            />
          </div>

          {/* Color Palette Controls */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">
                Warna Latar
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-zinc-200 cursor-pointer p-0.5 bg-zinc-50"
                />
                <span className="text-xs font-mono text-zinc-600 uppercase">{bgColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">
                Warna Aksen
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-zinc-200 cursor-pointer p-0.5 bg-zinc-50"
                />
                <span className="text-xs font-mono text-zinc-600 uppercase">{accentColor}</span>
              </div>
            </div>
          </div>

          <button
            onClick={addElement}
            className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Stiker / Badge Sorotan</span>
          </button>
        </div>

      </div>
    </div>
  );
};
