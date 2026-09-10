import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Star,
  Zap,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  CreditCard,
  Download,
  Copy,
  Check,
  X,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdminProduct, AdminTransaction } from '../../types';

interface ShopViewProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ onShowToast }) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Checkout Modal State
  const [activeProductForCheckout, setActiveProductForCheckout] = useState<AdminProduct | null>(null);
  const [buyerName, setBuyerName] = useState('Kreator Studio Pro');
  const [buyerEmail, setBuyerEmail] = useState('kreator@studiopro.id');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'GOPAY' | 'BCA_VA'>('QRIS');
  const [isProcessing, setIsProcessing] = useState(false);

  // Success Confirmation State
  const [completedTx, setCompletedTx] = useState<AdminTransaction | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Fetch real products from server REST API
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.warn('Gagal memuat produk dari server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (!p.active) return false;
    if (selectedCategory === 'Semua') return true;
    return p.category === selectedCategory;
  });

  const categories = ['Semua', 'Prompt Kit', 'Akun & Kredit', 'Template Video', 'Membership'];

  // Handle Checkout submission
  const handleProceedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProductForCheckout) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: buyerName.trim() || 'Kreator Studio Pro',
          userEmail: buyerEmail.trim() || 'kreator@studiopro.id',
          productTitle: activeProductForCheckout.title,
          amount: activeProductForCheckout.price,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok && data.transaction) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
        setCompletedTx(data.transaction);
        setActiveProductForCheckout(null);
        onShowToast(`Pembayaran Rp ${activeProductForCheckout.price.toLocaleString('id-ID')} diverifikasi!`, 'success');
        // Refresh product list to show updated sales count
        loadProducts();
      } else {
        throw new Error(data.error || 'Gagal memproses transaksi');
      }
    } catch (err: any) {
      onShowToast(err.message || 'Terjadi kesalahan sistem pembayaran', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate downloadable digital asset receipt
  const handleDownloadAsset = () => {
    if (!completedTx) return;
    const content = `=====================================================
STUDIO PRO - LISENSI RESMI ASET DIGITAL & AKSES KREATOR
=====================================================
ID Transaksi : ${completedTx.id}
Tanggal      : ${new Date(completedTx.date).toLocaleString('id-ID')}
Pembeli      : ${completedTx.userName} (${completedTx.userEmail})
Produk       : ${completedTx.productTitle}
Nominal      : Rp ${completedTx.amount.toLocaleString('id-ID')}
Metode Bayar : ${completedTx.paymentMethod}
Status       : TERVERIFIKASI RESMI (SUCCESS)
=====================================================
KODE AKSES TOKEN:
TOKEN-${completedTx.id.replace('TX-', '')}-AI-PRO-STUDIO-VERIFIED
=====================================================
Panduan Aktivasi:
1. Simpan berkas lisensi ini untuk klaim garansi re-link.
2. Buka panel AI Storyboard atau Flow Video Studio di Studio Pro.
3. Tempelkan token lisensi Anda pada dialog otorisasi.
Selamat berkarya dengan konten sinematik kelas dunia!`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudioPro_Lisensi_${completedTx.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Berkas lisensi digital berhasil diunduh.', 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50/60 p-4 md:p-8 max-w-6xl mx-auto space-y-6 pb-28 md:pb-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-extrabold text-xs tracking-wider uppercase mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Katalog Resmi Studio Pro</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">
            Digital Creator Shop
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 font-medium mt-1">
            Aset digital, paket kredit rendering, template CapCut, dan prompt sinematik teruji dengan aktivasi instan.
          </p>
        </div>

        <button
          onClick={loadProducts}
          className="self-start md:self-auto px-3.5 py-2 bg-white border border-zinc-200 hover:border-purple-300 rounded-xl text-xs font-bold text-zinc-700 hover:text-purple-700 transition shadow-sm flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          <span>Segarkan Katalog</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      {loading && products.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-zinc-200 rounded w-1/3" />
              <div className="h-6 bg-zinc-200 rounded w-3/4" />
              <div className="h-16 bg-zinc-100 rounded" />
              <div className="h-10 bg-zinc-200 rounded" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto" />
          <h3 className="text-base font-bold text-zinc-800">Tidak ada produk dalam kategori ini</h3>
          <p className="text-xs text-zinc-500">Pilih kategori lain atau tambahkan produk baru di Dashboard Admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-purple-300 transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-purple-700 uppercase bg-purple-50 px-2.5 py-1 rounded-lg">
                    {prod.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>4.9</span>
                    <span className="text-zinc-400 text-[10px]">({prod.sales} terjual)</span>
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-zinc-900 group-hover:text-purple-700 transition leading-snug">
                  {prod.title}
                </h3>

                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  {prod.desc}
                </p>

                <div className="pt-2 space-y-1.5 border-t border-zinc-100">
                  {prod.features && prod.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-600 font-medium">
                      <Zap className="w-3 h-3 text-purple-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase">Harga Resmi</span>
                  <span className="text-base font-extrabold text-zinc-900">
                    {prod.priceFormatted || `Rp ${prod.price.toLocaleString('id-ID')}`}
                  </span>
                </div>
                <button
                  onClick={() => setActiveProductForCheckout(prod)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Beli Sekarang</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CHECKOUT & PAYMENT GATEWAY */}
      {/* ======================================================== */}
      {activeProductForCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  Checkout Instan
                </span>
                <h3 className="text-lg font-black text-zinc-900 mt-1">Pembayaran Aset Digital</h3>
              </div>
              <button
                onClick={() => setActiveProductForCheckout(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary Box */}
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-2">
              <span className="text-xs font-bold text-zinc-800 block">{activeProductForCheckout.title}</span>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-200">
                <span className="text-zinc-500 font-medium">Subtotal Produk</span>
                <span className="font-extrabold text-zinc-900">
                  {activeProductForCheckout.priceFormatted || `Rp ${activeProductForCheckout.price.toLocaleString('id-ID')}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium">Biaya Gateway (0%)</span>
                <span className="font-bold text-emerald-600">GRATIS</span>
              </div>
              <div className="flex items-center justify-between text-sm font-black pt-1 text-purple-900">
                <span>Total Pembayaran</span>
                <span>{activeProductForCheckout.priceFormatted || `Rp ${activeProductForCheckout.price.toLocaleString('id-ID')}`}</span>
              </div>
            </div>

            {/* Form Details */}
            <form onSubmit={handleProceedPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Nama Lengkap Anda</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nama Lengkap"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Email / WhatsApp Pengiriman Lisensi</label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="email@domain.com"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Pilih Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('QRIS')}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      paymentMethod === 'QRIS'
                        ? 'border-purple-600 bg-purple-50/80 text-purple-900 font-bold'
                        : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-purple-600" />
                    <span className="text-[11px]">QRIS Realtime</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('GOPAY')}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      paymentMethod === 'GOPAY'
                        ? 'border-purple-600 bg-purple-50/80 text-purple-900 font-bold'
                        : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-[11px]">GoPay / OVO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BCA_VA')}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      paymentMethod === 'BCA_VA'
                        ? 'border-purple-600 bg-purple-50/80 text-purple-900 font-bold'
                        : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span className="text-[11px]">Virtual Account</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveProductForCheckout(null)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Konfirmasi & Bayar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: SUCCESS & INSTANT DELIVERY TOKEN */}
      {/* ======================================================== */}
      {completedTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Status: TERVERIFIKASI
              </span>
              <h3 className="text-xl font-black text-zinc-900 mt-1">Pembayaran Berhasil!</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Terima kasih, <strong>{completedTx.userName}</strong>. Pesanan Anda telah tercatat resmi di database server.
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">ID Pesanan:</span>
                <span className="font-bold text-zinc-900 font-mono">{completedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Produk:</span>
                <span className="font-bold text-zinc-900 truncate max-w-[200px]">{completedTx.productTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Nominal:</span>
                <span className="font-bold text-zinc-900">Rp {completedTx.amount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Metode:</span>
                <span className="font-bold text-purple-700">{completedTx.paymentMethod}</span>
              </div>
            </div>

            {/* Token Copy Box */}
            <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-purple-900 truncate">
                TOKEN-{completedTx.id.replace('TX-', '')}-PRO-VERIFIED
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`TOKEN-${completedTx.id.replace('TX-', '')}-PRO-VERIFIED`);
                  setCopiedToken(true);
                  setTimeout(() => setCopiedToken(false), 2000);
                  onShowToast('Token aktivasi disalin ke clipboard.', 'info');
                }}
                className="p-1 text-purple-700 hover:text-purple-900 transition ml-2"
                title="Salin Token"
              >
                {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleDownloadAsset}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-extrabold shadow-md transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas Lisensi Resmi (.txt)</span>
              </button>

              <button
                onClick={() => setCompletedTx(null)}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition"
              >
                Tutup & Kembali Belanja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
