import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  DollarSign,
  ShieldCheck,
  Star,
} from 'lucide-react';

interface RisetProdukWorkspaceProps {
  onOpenStudio: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface ProductItem {
  id: string;
  name: string;
  category: string;
  cogs: number;
  price: number;
  sales: number;
  rating: number;
  image: string;
  trend: string;
}

export const RisetProdukWorkspace: React.FC<RisetProdukWorkspaceProps> = ({
  onOpenStudio,
  onShowToast,
}) => {
  const [category, setCategory] = useState('Semua');
  const [search, setSearch] = useState('');

  const [products] = useState<ProductItem[]>([
    {
      id: 'p1',
      name: 'Lampu Meja RGB Sunset Minimalist Aesthetic',
      category: 'Rumah Tangga',
      cogs: 35000,
      price: 119000,
      sales: 14200,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=400',
      trend: '+340% Minggu Ini',
    },
    {
      id: 'p2',
      name: 'Tripod Auto-Face Tracking 360 AI Sensor',
      category: 'Gadget',
      cogs: 85000,
      price: 249000,
      sales: 8900,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&q=80&w=400',
      trend: '+280% Minggu Ini',
    },
    {
      id: 'p3',
      name: 'Serum Wajah Niacinamide Glowing Retinol 30ml',
      category: 'Kecantikan',
      cogs: 22000,
      price: 89000,
      sales: 32000,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
      trend: '+410% Minggu Ini',
    },
    {
      id: 'p4',
      name: 'Tas Ransel Anti-Air Minimalis Kompartemen Laptop',
      category: 'Fashion',
      cogs: 65000,
      price: 185000,
      sales: 6400,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400',
      trend: '+190% Minggu Ini',
    },
  ]);

  const filtered = products.filter((p) => {
    const matchCat = category === 'Semua' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-zinc-900 text-lg sm:text-xl tracking-tight">
                Riset Produk & E-Commerce Viral
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800">
                Data Penjualan Live
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              Temukan produk margin tinggi & potensi omset ratusan juta untuk konten affiliate TikTok & Shopee.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenStudio}
          className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Buat Hook Video AI</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama produk pemenang..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:border-emerald-600 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {['Semua', 'Gadget', 'Kecantikan', 'Rumah Tangga', 'Fashion'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
                category === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((prod) => {
          const profitPerItem = prod.price - prod.cogs;
          const marginPercent = Math.round((profitPerItem / prod.price) * 100);
          const estimatedRevenue = prod.price * prod.sales;

          return (
            <div
              key={prod.id}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs hover:shadow-md transition space-y-3"
            >
              <div className="flex gap-3">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-zinc-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                    {prod.category}
                  </span>
                  <h3 className="font-extrabold text-xs sm:text-sm text-zinc-900 mt-1 leading-snug line-clamp-2">
                    {prod.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1 font-medium">
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-current mr-0.5" /> {prod.rating}
                    </span>
                    <span>•</span>
                    <span>{prod.sales.toLocaleString('id-ID')} Terjual</span>
                  </div>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-zinc-50 rounded-2xl p-3 text-center border border-zinc-100">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block">Modal (COGS)</span>
                  <span className="text-xs font-bold text-zinc-700">{formatRupiah(prod.cogs)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block">Harga Jual</span>
                  <span className="text-xs font-bold text-zinc-900">{formatRupiah(prod.price)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 block">Margin Bersih</span>
                  <span className="text-xs font-extrabold text-emerald-600 font-mono">
                    +{marginPercent}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] font-bold text-zinc-500">
                  Omset: <strong className="text-zinc-900">{formatRupiah(estimatedRevenue)}</strong>
                </span>

                <button
                  onClick={() => {
                    onShowToast(`Menyiapkan analisis AI untuk "${prod.name}"`, 'info');
                    onOpenStudio();
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3 h-3" /> Buat Naskah Iklan
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
