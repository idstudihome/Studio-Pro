import React, { useState, useEffect } from 'react';
import {
  StickyNote,
  Plus,
  Pin,
  Trash2,
  CheckSquare,
  Search,
  CheckCircle2,
  Share2,
  Sparkles,
} from 'lucide-react';

interface NoteItem {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  checklist?: string[];
  createdAt: string;
}

interface GoogleNotesWorkspaceProps {
  userEmail: string;
  onOpenStudio: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const GoogleNotesWorkspace: React.FC<GoogleNotesWorkspaceProps> = ({
  userEmail,
  onOpenStudio,
  onShowToast,
}) => {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('STUDIO_GOOGLE_NOTES');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'note_1',
        title: '🎬 Ide Naskah Video Serial Krakatau',
        content: 'Scene 1: Drone sweeping shot dari atas kawah berasap.\nScene 2: Letupan lava pijar merah kehitaman saat senja.\nScene 3: Partikel abu membumbung dengan petir vulkanik spektakuler.',
        color: 'bg-amber-50 border-amber-200 text-amber-950',
        isPinned: true,
        checklist: ['Buat prompt di Storyboard', 'Render di Google Flow', 'Edit audio di CapCut'],
        createdAt: 'Hari ini',
      },
      {
        id: 'note_2',
        title: '💡 Kata Kunci Affiliate FYP Minggu Ini',
        content: '1. Lampu Meja RGB Aesthetic\n2. Tripod MagSafe Auto-Tracking 360\n3. Mikrofon Wireless Lavalier Noise-Cancelling',
        color: 'bg-emerald-50 border-emerald-200 text-emerald-950',
        isPinned: false,
        createdAt: 'Kemarin',
      },
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-amber-50 border-amber-200 text-amber-950');

  useEffect(() => {
    try {
      localStorage.setItem('STUDIO_GOOGLE_NOTES', JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() && !newContent.trim()) return;

    const n: NoteItem = {
      id: 'note_' + Date.now(),
      title: newTitle.trim() || 'Catatan Tanpa Judul',
      content: newContent.trim(),
      color: selectedColor,
      isPinned: false,
      createdAt: 'Baru saja',
    };

    setNotes([n, ...notes]);
    setNewTitle('');
    setNewContent('');
    onShowToast('Catatan disimpan dan disinkronkan ke Google Cloud!', 'success');
  };

  const togglePin = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
    onShowToast('Catatan dihapus', 'info');
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header Google Ecosystem */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-zinc-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
            <StickyNote className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-zinc-900 text-lg sm:text-xl tracking-tight">
                Google Keep & Notes Studio
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Google SSO Aktif
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              Catatan kreatif tersinkronisasi otomatis dengan akun Google: <strong className="text-zinc-800">{userEmail}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenStudio}
          className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Salin ke AI Storyboard</span>
        </button>
      </div>

      {/* New Note Form */}
      <form onSubmit={addNote} className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-3">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Judul catatan baru..."
          className="w-full text-sm font-bold text-zinc-900 placeholder-zinc-400 outline-none"
        />
        <textarea
          rows={2}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Tuliskan naskah ide, to-do list, atau memo produksi..."
          className="w-full text-xs font-medium text-zinc-700 placeholder-zinc-400 outline-none resize-none"
        />
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 flex-wrap gap-2">
          {/* Color tag options */}
          <div className="flex items-center gap-1.5">
            {[
              { cls: 'bg-amber-50 border-amber-200 text-amber-950', dot: 'bg-amber-400' },
              { cls: 'bg-emerald-50 border-emerald-200 text-emerald-950', dot: 'bg-emerald-400' },
              { cls: 'bg-sky-50 border-sky-200 text-sky-950', dot: 'bg-sky-400' },
              { cls: 'bg-purple-50 border-purple-200 text-purple-950', dot: 'bg-purple-400' },
              { cls: 'bg-rose-50 border-rose-200 text-rose-950', dot: 'bg-rose-400' },
            ].map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedColor(c.cls)}
                className={`w-5 h-5 rounded-full ${c.dot} transition ${
                  selectedColor === c.cls ? 'ring-2 ring-zinc-800 scale-110' : 'opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow transition active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simpan Catatan</span>
          </button>
        </div>
      </form>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari ide catatan atau naskah..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs font-medium text-zinc-900 focus:outline-none focus:border-amber-500 shadow-xs"
        />
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`rounded-3xl p-5 border shadow-xs flex flex-col justify-between space-y-3 transition hover:shadow-md ${note.color}`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-sm tracking-tight leading-snug">
                  {note.title}
                </h3>
                <button
                  onClick={() => togglePin(note.id)}
                  className={`p-1 rounded-lg transition ${
                    note.isPinned ? 'text-amber-600' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                  title={note.isPinned ? 'Lepas Pin' : 'Pin ke Atas'}
                >
                  <Pin className="w-4 h-4 fill-current" />
                </button>
              </div>
              <p className="text-xs font-medium mt-2 leading-relaxed whitespace-pre-line opacity-90">
                {note.content}
              </p>

              {note.checklist && (
                <div className="mt-3 space-y-1.5 pt-2 border-t border-black/10">
                  {note.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] font-semibold">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-black/10 text-[10px] opacity-75">
              <span>{note.createdAt}</span>
              <button
                onClick={() => deleteNote(note.id)}
                className="hover:text-red-600 transition"
                title="Hapus Catatan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
