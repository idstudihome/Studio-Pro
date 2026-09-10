import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  Copy,
  Check,
  Dice5,
  Loader2,
  Download,
  Scissors,
  Clapperboard,
  Mic,
  Camera,
  Palette,
  Shirt,
  UserCheck,
  Megaphone,
  Video,
  Layers,
  Search,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { StoryboardScene, MicrotoolAction, User } from '../types';
import { generateStoryboardAPI } from '../services/gemini';
import confetti from 'canvas-confetti';

interface AIStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onOpenMicrotool: (tool: MicrotoolAction) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onOpenAuth: () => void;
}

const MICROTOOLS_LIST: MicrotoolAction[] = [
  {
    name: 'TikTok Downloader',
    label: 'URL Video TikTok',
    placeholder: 'https://vt.tiktok.com/...',
    desc: 'Ekstrak video HD tanpa watermark, pisahkan track audio, dan kumpulkan metadata tagar viral.',
    inputType: 'text',
    category: 'Media',
  },
  {
    name: 'Split Video',
    label: 'Konteks / URL Video',
    placeholder: 'Contoh: Klip podcast 10 menit tentang AI dan masa depan kreator...',
    desc: 'Deteksi transisi adegan secara otomatis dan berikan timestamp potongan 15-60 detik untuk Reels & TikTok.',
    inputType: 'text',
    category: 'Video',
  },
  {
    name: 'Voiceover Generator',
    label: 'Ide / Naskah Pokok',
    placeholder: 'Ketik ide cerita atau produk yang ingin dinarasikan...',
    desc: 'Hasilkan naskah voiceover siap baca dengan instruksi jeda sinematik, intonasi, dan estimasi durasi.',
    inputType: 'textarea',
    category: 'Audio',
  },
  {
    name: 'Foto Produk AI',
    label: 'Deskripsi Produk',
    placeholder: 'Botol parfum kristal di atas batu alam dengan pencahayaan golden hour...',
    desc: 'Generate 3 variasi prompt foto komersial e-commerce kelas studio untuk Flow / Midjourney.',
    inputType: 'text',
    category: 'Visual',
  },
  {
    name: 'Branding AI',
    label: 'Karakter & Visi Brand',
    placeholder: 'Brand skincare organik dengan target wanita karir usia 25-35 tahun...',
    desc: 'Rancang palet warna, tipografi, slogan, konsep logo, dan visual moodboard menyeluruh.',
    inputType: 'textarea',
    category: 'Design',
  },
  {
    name: 'Mockup Produk',
    label: 'Tipe Apparel / Kemasan',
    placeholder: 'Hoodie oversized hitam dengan sablon minimalis di bagian dada...',
    desc: 'Buat arahan mockup 3D fotorealistis dengan detail tekstur kain, pencahayaan, dan sudut kamera.',
    inputType: 'text',
    category: 'Design',
  },
  {
    name: 'Fotografer AI',
    label: 'Karakter & Pose Model',
    placeholder: 'Model pria Asia gaya street fashion di pusat kota Tokyo malam hari...',
    desc: 'Hasilkan prompt pemotretan model virtual dengan spesifikasi lensa (85mm f/1.4) dan pose natural.',
    inputType: 'textarea',
    category: 'Visual',
  },
  {
    name: 'Affiliate Kit',
    label: 'Nama Produk & Keunggulan',
    placeholder: 'Timbangan digital pintar bluetooth dengan pengukur lemak tubuh...',
    desc: 'Susun hook 3 detik anti-skip, naskah promosi 30 detik, Call To Action, dan 15 hashtag relevan.',
    inputType: 'text',
    category: 'Marketing',
  },
  {
    name: 'Prompt Video',
    label: 'Ide Alur Animasi',
    placeholder: 'Drone terbang melintasi candi Borobudur saat kabut pagi menyingsing...',
    desc: 'Optimasi konsep mentah menjadi prompt sinematik level tinggi untuk Google Flow, Sora, dan Kling.',
    inputType: 'textarea',
    category: 'Video',
  },
  {
    name: 'Character Sheet',
    label: 'Ciri-Ciri Karakter',
    placeholder: 'Gadis muda penjelajah waktu dengan jaket kulit cokelat dan kacamata aviator...',
    desc: 'Buat lembar konsistensi karakter multi-sudut (tampak depan, samping, 3/4) untuk konsistensi video AI.',
    inputType: 'textarea',
    category: 'Video',
  },
];

const TRENDING_IDEAS = [
  'Animasi clay stop-motion, erupsi anak gunung krakatau, awal gejolak sampai dampak ke pesisir',
  'Perjalanan astronot tersesat di dimensi cermin luar angkasa dengan visual neon cyberpunk dan partikel prisma',
  'Cinematic unboxing jam tangan mekanik mewah di atas meja kayu ek saat golden hour dengan macro focus',
  'Kucing jalanan yang menemukan portal ajaib ke dunia kue raksasa bergaya anime Studio Ghibli',
  'Dokumenter mini pandai besi tradisional menempa pedang katana dengan percikan api dan uap air',
  'Music video konsep lofi hip-hop: seseorang bersantai di balkon apartemen saat hujan rintik membasahi kota',
  'Hook video TikTok: tips rahasia merawat sneakers putih agar selalu baru tanpa dicuci basah',
];

export const AIStudioDrawer: React.FC<AIStudioDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenMicrotool,
  onShowToast,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'storyboard'>('storyboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Storyboard state
  const [sbPrompt, setSbPrompt] = useState(
    'Animasi clay stop-motion, erupsi anak gunung krakatau, awal gejolak sampai dampak ke pesisir'
  );
  const [contentType, setContentType] = useState('film_pendek');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [sceneCount, setSceneCount] = useState(3);
  const [scenes, setScenes] = useState<StoryboardScene[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSceneIndex, setCopiedSceneIndex] = useState<number | null>(null);

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'TikTok Downloader': return <Download className="w-4 h-4 text-purple-600" />;
      case 'Split Video': return <Scissors className="w-4 h-4 text-purple-600" />;
      case 'Voiceover Generator': return <Mic className="w-4 h-4 text-purple-600" />;
      case 'Foto Produk AI': return <Camera className="w-4 h-4 text-purple-600" />;
      case 'Branding AI': return <Palette className="w-4 h-4 text-purple-600" />;
      case 'Mockup Produk': return <Shirt className="w-4 h-4 text-purple-600" />;
      case 'Fotografer AI': return <UserCheck className="w-4 h-4 text-purple-600" />;
      case 'Affiliate Kit': return <Megaphone className="w-4 h-4 text-purple-600" />;
      case 'Prompt Video': return <Video className="w-4 h-4 text-purple-600" />;
      case 'Character Sheet': return <Layers className="w-4 h-4 text-purple-600" />;
      default: return <Sparkles className="w-4 h-4 text-purple-600" />;
    }
  };

  const handleRandomizeIdea = () => {
    const random = TRENDING_IDEAS[Math.floor(Math.random() * TRENDING_IDEAS.length)];
    setSbPrompt(random);
    onShowToast('Ide tren baru berhasil dimuat!', 'info');
  };

  const handleGenerateStoryboard = async () => {
    if (!sbPrompt.trim()) {
      onShowToast('Ide cerita tidak boleh kosong!', 'error');
      return;
    }

    setIsGenerating(true);
    setScenes([]);

    try {
      const customApiKey = localStorage.getItem('studio_pro_gemini_key') || undefined;
      const res = await generateStoryboardAPI({
        prompt: sbPrompt.trim(),
        sceneCount,
        aspectRatio,
        contentType,
        userApiKey: customApiKey,
      });

      if (res.scenes && res.scenes.length > 0) {
        setScenes(res.scenes);
        onShowToast(`Berhasil menyusun ${res.scenes.length} scene dengan Gemini AI!`, 'success');
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } else {
        throw new Error('Tidak ada scene yang dihasilkan.');
      }
    } catch (err: any) {
      onShowToast(`Gagal: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyScene = (scene: StoryboardScene, idx: number) => {
    const text = `🎬 [SCENE ${scene.number}] ${scene.title}\n🎥 Camera: ${scene.camera}\n🎙️ Voiceover: "${scene.voiceover}"\n✨ Prompt Video AI: ${scene.prompt}`;
    navigator.clipboard.writeText(text);
    setCopiedSceneIndex(idx);
    onShowToast(`Scene ${scene.number} disalin!`, 'success');
    setTimeout(() => setCopiedSceneIndex(null), 1500);
  };

  const handleCopyAll = () => {
    if (scenes.length === 0) return;
    const allText = scenes
      .map(
        (s) =>
          `==============================\n🎬 SCENE ${s.number}: ${s.title}\n==============================\n👁️ Visual: ${s.visual}\n🎥 Kamera: ${s.camera}\n🎙️ Audio/VO: "${s.voiceover}"\n✨ Prompt AI: ${s.prompt}\n`
      )
      .join('\n');
    navigator.clipboard.writeText(allText);
    onShowToast('Seluruh rangkaian storyboard berhasil disalin!', 'success');
  };

  const filteredTools = MICROTOOLS_LIST.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[75] transition-opacity animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Slide-over AI Studio Drawer */}
      <aside
        className={`fixed md:relative inset-y-0 right-0 z-[80] md:z-10 bg-white border-l border-zinc-200 flex flex-col flex-shrink-0 transition-all duration-300 ${
          isOpen ? 'translate-x-0 w-full md:w-[410px]' : 'translate-x-full md:translate-x-0 md:w-0 overflow-hidden'
        } shadow-2xl md:shadow-none`}
      >
        <div className="w-full md:w-[410px] h-full flex flex-col pb-20 md:pb-0 overflow-hidden">
          
          {/* Studio Header */}
          <div className="h-14 px-4 bg-white border-b border-zinc-100 flex items-center justify-between flex-shrink-0 relative z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-600 flex items-center justify-center transition active:scale-95"
                title="Tutup AI Studio"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 font-extrabold text-sm text-zinc-900 tracking-tight">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>AI Studio Pro</span>
              </div>
            </div>

            {/* Toggle Tabs */}
            <div className="flex bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/50">
              <button
                onClick={() => setActiveTab('storyboard')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'storyboard'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Storyboard
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'tools'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Microtools
              </button>
            </div>
          </div>

          {/* User Status / Gemini Status Pill */}
          <div className="px-4 py-2 bg-purple-50/70 border-b border-purple-100/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-purple-900">
                {currentUser.isLoggedIn ? (
                  <>Akun: <strong className="font-extrabold">{currentUser.email.split('@')[0]}</strong></>
                ) : (
                  'Tamu (Klik masuk dengan Gmail)'
                )}
              </span>
            </div>
            <button
              onClick={onOpenAuth}
              className="text-[11px] font-extrabold text-purple-700 hover:text-purple-800 underline flex items-center gap-1"
            >
              {currentUser.isLoggedIn ? 'Kelola Akun' : 'Masuk Gmail'}
            </button>
          </div>

          {/* Studio Body Content */}
          <div className="flex-1 overflow-y-auto bg-zinc-50/50 p-4 space-y-4">
            
            {/* TAB: STORYBOARD */}
            {activeTab === 'storyboard' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-white border border-zinc-200 rounded-3xl p-4 shadow-sm space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        Ide Cerita / Konsep
                      </label>
                      <button
                        onClick={handleRandomizeIdea}
                        className="p-1 px-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center gap-1 transition active:scale-95 border border-purple-100"
                        title="Acak ide viral"
                      >
                        <Dice5 className="w-3.5 h-3.5" />
                        <span>Acak Ide</span>
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={sbPrompt}
                      onChange={(e) => setSbPrompt(e.target.value)}
                      placeholder="Ceritakan ide singkat naskah atau video Anda..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3 text-xs font-medium text-zinc-900 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Format Konten
                      </label>
                      <div className="relative">
                        <select
                          value={contentType}
                          onChange={(e) => setContentType(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-semibold text-zinc-800 outline-none appearance-none cursor-pointer pr-8"
                        >
                          <option value="film_pendek">Cinematic Short Film (Fiksi/Narasi)</option>
                          <option value="konten_produk">Komersial Produk (Iklan Pro)</option>
                          <option value="ugc">TikTok UGC / Affiliate Hook Viral</option>
                          <option value="edukasi">Educational Explainer (Dokumenter)</option>
                          <option value="music_video">Music Video Concept (Visual Art)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Aspek Rasio
                      </label>
                      <div className="relative">
                        <select
                          value={aspectRatio}
                          onChange={(e) => setAspectRatio(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-semibold text-zinc-800 outline-none appearance-none cursor-pointer pr-8"
                        >
                          <option value="9:16">9:16 (TikTok/Reels/Shorts)</option>
                          <option value="16:9">16:9 (Landscape YouTube)</option>
                          <option value="1:1">1:1 (Square Instagram)</option>
                          <option value="21:9">21:9 (Cinema Ultrawide)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Jumlah Scene
                      </label>
                      <div className="relative">
                        <select
                          value={sceneCount}
                          onChange={(e) => setSceneCount(Number(e.target.value))}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-semibold text-zinc-800 outline-none appearance-none cursor-pointer pr-8"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((num) => (
                            <option key={num} value={num}>
                              {num} Scene
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateStoryboard}
                    disabled={isGenerating}
                    className="w-full py-3 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-95 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        <span>Gemini 3.8 Flash Merancang...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 text-purple-400" />
                        <span>Generate Storyboard Cerdas</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Storyboard Output */}
                {scenes.length > 0 && (
                  <div className="space-y-3 pt-2 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-zinc-900 tracking-tight">
                          HASIL RANCANGAN SCENE
                        </span>
                        <span className="block text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                          {scenes.length} Scene • Rasio {aspectRatio}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyAll}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-purple-200 active:scale-95 shadow-sm"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Semua</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {scenes.map((scene, idx) => (
                        <div
                          key={scene.number || idx}
                          className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-purple-300 transition"
                        >
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600 rounded-l-2xl" />
                          <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-2.5 ml-2">
                            <span className="text-[11px] font-extrabold text-purple-700 tracking-wider uppercase">
                              SCENE {scene.number}
                            </span>
                            <button
                              onClick={() => handleCopyScene(scene, idx)}
                              className="px-2.5 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-600 text-[10px] font-bold flex items-center gap-1 transition active:scale-95"
                            >
                              {copiedSceneIndex === idx ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedSceneIndex === idx ? 'Tersalin' : 'Copy'}</span>
                            </button>
                          </div>

                          <div className="ml-2 space-y-2.5">
                            <div>
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">
                                Judul Scene
                              </span>
                              <h5 className="text-xs font-bold text-zinc-900 leading-snug">
                                {scene.title}
                              </h5>
                            </div>

                            <div>
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">
                                Visual & Continuity
                              </span>
                              <p className="text-[11px] text-zinc-600 leading-relaxed font-medium">
                                {scene.visual}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 text-[10px]">
                              <div>
                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider block">
                                  Kamera
                                </span>
                                <p className="font-semibold text-zinc-800">{scene.camera}</p>
                              </div>
                              <div>
                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider block">
                                  Voiceover
                                </span>
                                <p className="italic text-zinc-700">"{scene.voiceover}"</p>
                              </div>
                            </div>

                            <div className="bg-purple-50/60 p-2.5 rounded-xl border border-purple-100">
                              <span className="text-[9px] font-bold text-purple-700 uppercase tracking-wider block mb-1">
                                Prompt Video AI (Flow / Kling / Sora)
                              </span>
                              <p className="font-mono text-[10px] text-purple-900 break-words font-medium leading-relaxed">
                                {scene.prompt}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: MICROTOOLS */}
            {activeTab === 'tools' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari alat (TikTok, Split, Foto, Voiceover)..."
                    className="w-full bg-white border border-zinc-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-zinc-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {filteredTools.map((tool) => (
                    <button
                      key={tool.name}
                      onClick={() => onOpenMicrotool(tool)}
                      className="p-3 bg-white border border-zinc-200 rounded-2xl text-left hover:border-purple-300 hover:shadow-md transition active:scale-95 group flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center mb-2 transition">
                          {getToolIcon(tool.name)}
                        </div>
                        <h4 className="font-bold text-zinc-900 text-xs mb-0.5 group-hover:text-purple-700 transition">
                          {tool.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-medium line-clamp-2">
                          {tool.desc}
                        </p>
                      </div>
                      <span className="mt-2 text-[9px] font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-1.5 py-0.5 rounded w-max">
                        {tool.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </aside>
    </>
  );
};
