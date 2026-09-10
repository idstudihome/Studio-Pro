import React, { useState } from 'react';
import {
  Share2,
  TrendingUp,
  Users,
  Eye,
  Calendar,
  Sparkles,
  Plus,
  CheckCircle2,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { ToolConfig } from '../../../types';

interface SocialCreatorWorkspaceProps {
  tool: ToolConfig;
  userEmail: string;
  onOpenAuthModal: () => void;
  onOpenStudio: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SocialCreatorWorkspace: React.FC<SocialCreatorWorkspaceProps> = ({
  tool,
  userEmail,
  onOpenAuthModal,
  onOpenStudio,
  onShowToast,
}) => {
  const isYouTube = tool.id === 'YouTube';
  const [scheduledPosts, setScheduledPosts] = useState([
    {
      id: 'p1',
      title: 'Trik Video Kontinuitas Google Flow + Sora',
      date: 'Besok, 19:00 WIB',
      status: 'Ready to Publish',
    },
    {
      id: 'p2',
      title: 'Review 3 Gadget Meja Kerja Aesthetic Murah',
      date: 'Jumat, 20:30 WIB',
      status: 'Draft Storyboard',
    },
  ]);

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg flex-shrink-0">
            <Share2 className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-zinc-900 text-lg sm:text-xl tracking-tight">
                {tool.title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {isYouTube ? 'Google SSO Terhubung' : 'Sesi Native Aktif'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              {isYouTube
                ? `Akun Google: ${userEmail}`
                : `Konsol kreator ${tool.name} langsung di dalam Studio Pro`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenAuthModal}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-600" />
            <span>Sesi Akun</span>
          </button>
          <button
            onClick={onOpenStudio}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Storyboard</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Tayangan (Views)', value: '1.24M', change: '+24.5%', icon: Eye, color: 'text-blue-600' },
          { label: 'Pertumbuhan Pengikut', value: '48.2K', change: '+12.8%', icon: Users, color: 'text-purple-600' },
          { label: 'Tingkat Keterlibatan', value: '8.7%', change: '+3.2%', icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Jadwal Publikasi', value: '4 Video', change: 'Minggu ini', icon: Calendar, color: 'text-amber-600' },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {m.label}
                </span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className="text-xl font-black text-zinc-900 tracking-tight">{m.value}</div>
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                {m.change}
              </span>
            </div>
          );
        })}
      </div>

      {/* Content Publishing Planner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            Antrean Konten & Jadwal Publikasi
          </h3>
          <button
            onClick={() => {
              onShowToast('Jadwal baru ditambahkan dari Storyboard', 'success');
            }}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Jadwal
          </button>
        </div>

        <div className="space-y-3">
          {scheduledPosts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div>
                <h4 className="text-xs font-extrabold text-zinc-900">{post.title}</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">{post.date}</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-100 text-purple-800">
                  {post.status}
                </span>
                <button
                  onClick={onOpenStudio}
                  className="px-3 py-1 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg text-xs font-bold text-zinc-800 transition"
                >
                  Edit Naskah
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
