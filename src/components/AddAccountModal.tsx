import React, { useState } from 'react';
import { X, Plus, Key, Shield } from 'lucide-react';
import { AccountProfile } from '../types';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: AccountProfile) => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onAddAccount,
}) => {
  const [name, setName] = useState('');
  const [tier, setTier] = useState<'PRO' | 'FREE'>('PRO');
  const [credit, setCredit] = useState<number>(500);
  const [token, setToken] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddAccount({
      id: 'acc_' + Date.now(),
      name: name.trim(),
      tier,
      credit: Number(credit) || 0,
      token: token.trim() || undefined,
      active: true,
    });

    setName('');
    setToken('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-zinc-900">Hubungkan Akun Sesi</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Nama Akun / Workspace
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Flow Pro 12, dracin, dsb."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Tier Akun
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as 'PRO' | 'FREE')}
                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none cursor-pointer"
              >
                <option value="PRO">PRO</option>
                <option value="FREE">FREE</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Kredit Sisa
              </label>
              <input
                type="number"
                value={credit}
                onChange={(e) => setCredit(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Token Sesi / Cookie (Opsional)
            </label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Cookie session token..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-900 outline-none"
              />
            </div>
          </div>

          <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2 text-[11px] text-blue-700 font-medium">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Kredensial disimpan dalam sandbox terisolasi dan tidak pernah dibagikan ke server pihak ketiga.</span>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
            >
              Simpan Akun
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
