import React from 'react';
import { LayoutGrid, GraduationCap, Sparkles, ShoppingBag, Settings } from 'lucide-react';
import { MainView } from '../types';

interface BottomNavProps {
  activeView: MainView;
  onSelectView: (view: MainView) => void;
  onOpenStudio: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onSelectView,
  onOpenStudio,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-zinc-200/80 z-[65] shadow-lg pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        <button
          onClick={() => onSelectView('app')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
            activeView === 'app' ? 'text-purple-600 font-bold' : 'text-zinc-400 hover:text-zinc-600 font-medium'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px]">Workspace</span>
        </button>

        <button
          onClick={() => onSelectView('kelas')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
            activeView === 'kelas' ? 'text-purple-600 font-bold' : 'text-zinc-400 hover:text-zinc-600 font-medium'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="text-[10px]">Kelas</span>
        </button>

        {/* Center Floating Studio Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenStudio}
            className="w-13 h-13 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-xl shadow-purple-900/20 transition active:scale-90 border-[3px] border-zinc-50 hover:bg-black"
            title="Buka AI Studio Pro"
          >
            <Sparkles className="w-6 h-6 text-purple-400" />
          </button>
        </div>

        <button
          onClick={() => onSelectView('shop')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
            activeView === 'shop' ? 'text-purple-600 font-bold' : 'text-zinc-400 hover:text-zinc-600 font-medium'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px]">Shop</span>
        </button>

        <button
          onClick={() => onSelectView('settings')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
            activeView === 'settings' ? 'text-purple-600 font-bold' : 'text-zinc-400 hover:text-zinc-600 font-medium'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Setelan</span>
        </button>
      </div>
    </nav>
  );
};
