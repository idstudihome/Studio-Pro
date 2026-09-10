import React from 'react';
import { ShoppingBag, Star, Zap, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProductItem {
  id: string;
  title: string;
  price: string;
  category: string;
  rating: number;
  sales: number;
  desc: string;
  features: string[];
}

const PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    title: '500+ Master Prompt Sinematik Google Flow & Sora',
    price: 'Rp 99.000',
    category: 'Prompt Kit',
    rating: 4.9,
    sales: 1240,
    desc: 'Koleksi prompt visual level bioskop dengan konsistensi karakter, sudut kamera 35mm-85mm, dan preset lighting dramatis.',
    features: ['Stop-Motion Clay Preset', 'Cyberpunk & Sci-Fi Universe', 'Prompt Konsistensi Karakter'],
  },
  {
    id: 'p2',
    title: 'Top Up Sesi Flow Pro 500 Kredit (Aktif Instan)',
    price: 'Rp 149.000',
    category: 'Akun & Kredit',
    rating: 5.0,
    sales: 2850,
    desc: 'Isi ulang kredit instan untuk akun Google Flow Anda. Render video tanpa antrean dan akses model resolusi 1080P/4K.',
    features: ['500 Kredit Siap Pakai', 'Masa Aktif 30 Hari', 'Garansi Re-Link Token'],
  },
  {
    id: 'p3',
    title: 'Mega Bundle Template CapCut & Voiceover Audio FX',
    price: 'Rp 79.000',
    category: 'Template Video',
    rating: 4.8,
    sales: 980,
    desc: 'Paket lengkap transisi siap pakai, sound effect cinematic whoosh, dan musik background bebas copyright untuk konten TikTok.',
    features: ['30+ Template Timeline', '200+ Sound FX Bebas Royalti', 'LUT Grading Sinematik'],
  },
];

export const ShopView: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  const handleBuy = (item: ProductItem) => {
    confetti({ particleCount: 35, spread: 60 });
    onShowToast(`Pesanan untuk "${item.title}" diproses! Aset digital siap diakses.`, 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50/60 p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-28 md:pb-8">
      <div>
        <div className="flex items-center gap-2 text-purple-700 font-extrabold text-xs tracking-wider uppercase mb-1">
          <ShoppingBag className="w-4 h-4" />
          <span>Katalog Produk Kreator</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">
          Digital Shop Studio Pro
        </h1>
        <p className="text-xs md:text-sm text-zinc-500 font-medium mt-1">
          Aset digital, paket kredit, dan alat akselerasi produksi video AI dengan garansi aktivasi instan.
        </p>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRODUCTS.map((prod) => (
          <div
            key={prod.id}
            className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-purple-200 transition group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-purple-700 uppercase bg-purple-50 px-2.5 py-1 rounded-lg">
                  {prod.category}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{prod.rating}</span>
                  <span className="text-zinc-400 text-[10px]">({prod.sales})</span>
                </div>
              </div>

              <h3 className="text-sm font-extrabold text-zinc-900 group-hover:text-purple-700 transition leading-snug">
                {prod.title}
              </h3>

              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                {prod.desc}
              </p>

              <div className="pt-2 space-y-1.5 border-t border-zinc-100">
                {prod.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-600 font-medium">
                    <Zap className="w-3 h-3 text-purple-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-zinc-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase">Harga Spesial</span>
                <span className="text-base font-extrabold text-zinc-900">{prod.price}</span>
              </div>
              <button
                onClick={() => handleBuy(prod)}
                className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Beli Instan</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
