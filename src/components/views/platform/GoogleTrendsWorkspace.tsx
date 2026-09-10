import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Globe,
  CheckCircle2,
  Share2,
  Sparkles,
  ArrowUpRight,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface GoogleTrendsWorkspaceProps {
  userEmail: string;
  onOpenStudio: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SAMPLE_TREND_DATA: Record<string, Array<{ month: string; interest: number }>> = {
  'video ai': [
    { month: 'Okt', interest: 32 },
    { month: 'Nov', interest: 45 },
    { month: 'Des', interest: 58 },
    { month: 'Jan', interest: 72 },
    { month: 'Feb', interest: 88 },
    { month: 'Mar', interest: 100 },
  ],
  'google flow': [
    { month: 'Okt', interest: 15 },
    { month: 'Nov', interest: 28 },
    { month: 'Des', interest: 40 },
    { month: 'Jan', interest: 65 },
    { month: 'Feb', interest: 85 },
    { month: 'Mar', interest: 98 },
  ],
  'affiliate tiktok': [
    { month: 'Okt', interest: 60 },
    { month: 'Nov', interest: 70 },
    { month: 'Des', interest: 85 },
    { month: 'Jan', interest: 78 },
    { month: 'Feb', interest: 92 },
    { month: 'Mar', interest: 96 },
  ],
};

export const GoogleTrendsWorkspace: React.FC<GoogleTrendsWorkspaceProps> = ({
  userEmail,
  onOpenStudio,
  onShowToast,
}) => {
  const [keyword, setKeyword] = useState('video ai');
  const [searchInput, setSearchInput] = useState('video ai');
  const [region, setRegion] = useState('ID');

  const chartData = SAMPLE_TREND_DATA[keyword.toLowerCase()] || [
    { month: 'Okt', interest: 25 },
    { month: 'Nov', interest: 38 },
    { month: 'Des', interest: 55 },
    { month: 'Jan', interest: 70 },
    { month: 'Feb', interest: 84 },
    { month: 'Mar', interest: 95 },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setKeyword(searchInput.trim());
    onShowToast(`Menampilkan grafik minat Google Trends untuk "${searchInput}"`, 'info');
  };

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header Google Trends */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-zinc-900 text-lg sm:text-xl tracking-tight">
                Google Trends Monitor
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Google SSO Aktif
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              Data minat pencarian real-time disinkronkan dengan akun Google: <strong className="text-zinc-800">{userEmail}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenStudio}
          className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Buat Naskah Berdasarkan Tren</span>
        </button>
      </div>

      {/* Search & Region Filter Bar */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl p-3 border border-zinc-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ketik topik pencarian (contoh: video ai, google flow, tiktok shop)..."
            className="w-full pl-10 pr-3 py-2 text-xs font-semibold text-zinc-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
          >
            <option value="ID">🇮🇩 Indonesia (Nasional)</option>
            <option value="GLOBAL">🌍 Global (Seluruh Dunia)</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition active:scale-95"
          >
            Analisis
          </button>
        </div>
      </form>

      {/* Main Chart Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                Minat Sepanjang Waktu: "{keyword}"
              </h3>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Nilai 100 menunjukkan puncak popularitas topik di Google Search.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            Lonjakan Tren +240%
          </span>
        </div>

        {/* Recharts Line Chart */}
        <div className="h-64 sm:h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: 'none',
                  padding: '8px 12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="interest"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5, fill: '#2563eb' }}
                activeDot={{ r: 8, stroke: '#93c5fd', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakout Trending Topics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-3">
          <h4 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            Topik Terkait yang Sedang Melesat
          </h4>
          <div className="space-y-2">
            {[
              { topic: 'Google Flow AI Video Generator', surge: '+450%' },
              { topic: 'Prompt Sinematik Kamera 35mm', surge: '+310%' },
              { topic: 'Affiliate Produk Tanpa Wajah', surge: '+260%' },
              { topic: 'Gemini 3.8 Flash Naskah Konten', surge: '+190%' },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSearchInput(item.topic);
                  setKeyword(item.topic);
                }}
                className="p-3 bg-zinc-50 hover:bg-blue-50 border border-zinc-200/80 hover:border-blue-200 rounded-2xl flex items-center justify-between cursor-pointer transition"
              >
                <span className="text-xs font-bold text-zinc-800">{item.topic}</span>
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> {item.surge}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-3">
          <h4 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-600" />
            Wilayah Minat Tertinggi di Indonesia
          </h4>
          <div className="space-y-2">
            {[
              { region: 'DKI Jakarta', score: 100 },
              { region: 'Jawa Barat', score: 88 },
              { region: 'Jawa Timur', score: 79 },
              { region: 'DI Yogyakarta', score: 74 },
            ].map((r, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-zinc-700">
                  <span>{r.region}</span>
                  <span className="text-blue-600">{r.score} / 100</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${r.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
