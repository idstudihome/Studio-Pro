import React from 'react';
import { Menu, Sparkles, Layers, RotateCw, Sliders } from 'lucide-react';
import { MainView, User } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleStudio: () => void;
  isStudioOpen: boolean;
  activeView: MainView;
  onSelectView: (view: MainView) => void;
  currentUser: User;
  onOpenAuth: () => void;
  onForceRefresh?: () => void;
  activeToolName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onToggleStudio,
  isStudioOpen,
  activeView,
  onSelectView,
  currentUser,
  onOpenAuth,
  onForceRefresh,
  activeToolName,
}) => {
  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 flex items-center justify-between flex-shrink-0 z-40 relative shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition active:scale-95 bg-zinc-50 border border-zinc-200"
          title="Buka Menu Tools"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Brand Identity */}
        <div
          onClick={() => onSelectView('app')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-[17px] tracking-tight text-zinc-900 hidden sm:block">
            Studio <span className="text-purple-600">Pro</span>
          </span>
        </div>

        {/* Active Tool Indicator in Workspace */}
        {activeView === 'app' && activeToolName && (
          <div className="hidden lg:flex items-center gap-2 ml-2 pl-3 border-l border-zinc-200">
            <span className="text-xs font-bold text-zinc-700">{activeToolName}</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
              Live Web
            </span>
          </div>
        )}
      </div>

      {/* Desktop Navigation Pills */}
      <nav className="hidden md:flex items-center gap-1 p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/60">
        <button
          onClick={() => onSelectView('app')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeView === 'app'
              ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60'
              : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50'
          }`}
        >
          Workspace
        </button>
        <button
          onClick={() => onSelectView('kelas')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeView === 'kelas'
              ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60'
              : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50'
          }`}
        >
          Kelas Kreator
        </button>
        <button
          onClick={() => onSelectView('shop')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeView === 'shop'
              ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60'
              : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50'
          }`}
        >
          Digital Shop
        </button>
        <button
          onClick={() => onSelectView('settings')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeView === 'settings'
              ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60'
              : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50'
          }`}
        >
          Pengaturan
        </button>
        <button
          onClick={() => onSelectView('admin')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeView === 'admin'
              ? 'bg-zinc-900 text-purple-300 shadow-sm border border-zinc-800'
              : 'text-purple-700 hover:text-purple-900 hover:bg-purple-100/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-purple-500" />
          <span>Admin</span>
        </button>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Force Refresh Button for Workspace Web */}
        {activeView === 'app' && onForceRefresh && (
          <button
            onClick={onForceRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 transition active:scale-95 shadow-xs"
            title="Force Refresh Website Asli (Segarkan sesi web)"
          >
            <RotateCw className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden sm:inline text-[11px]">Segarkan Web</span>
          </button>
        )}

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* AI Studio Desktop Toggle */}
        <button
          onClick={onToggleStudio}
          className={`hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 border ${
            isStudioOpen
              ? 'bg-purple-600 text-white border-purple-700 shadow-md'
              : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 shadow-sm'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isStudioOpen ? 'Tutup Studio' : 'Buka Studio'}</span>
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={onOpenAuth}
          className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100 border-2 border-white shadow-sm flex items-center justify-center hover:border-purple-400 transition overflow-hidden"
          title={currentUser.isLoggedIn ? `Masuk sebagai ${currentUser.email}` : 'Masuk dengan Akun Google / Email'}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-full h-full object-cover"
          />
          {currentUser.isLoggedIn && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
          )}
        </button>
      </div>
    </header>
  );
};
