import React, { useState } from 'react';
import { PlayCircle, CheckCircle, Clock, BookOpen, Sparkles, Award } from 'lucide-react';

interface ModuleLesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  desc: string;
  category: string;
}

const COURSES: ModuleLesson[] = [
  {
    id: 'm1',
    title: 'Penguasaan Google Flow & Prompt Sinematik 8K',
    duration: '45 Menit',
    completed: true,
    desc: 'Pelajari sintaks prompt camera movement (orbit, crane, tracking shot), konsistensi pencahayaan rim light, dan rasio aspek multiplatform.',
    category: 'Video AI',
  },
  {
    id: 'm2',
    title: 'Teknik Clay Animation & Stop-Motion Krakatau',
    duration: '60 Menit',
    completed: true,
    desc: 'Eksplorasi gaya plastisin/claymation dengan konsistensi temporal antar frame serta transisi dramatis tanpa deformasi karakter.',
    category: 'Animasi',
  },
  {
    id: 'm3',
    title: 'Otomasi Storyboard dengan Gemini 3.8 Flash',
    duration: '50 Menit',
    completed: false,
    desc: 'Integrasi API langsung, pembagian scene berurutan, visual continuity, hingga pembuatan naskah voiceover siap pakai.',
    category: 'AI Engineering',
  },
  {
    id: 'm4',
    title: 'Formula Hook 3 Detik & Affiliate Viral FYP TikTok',
    duration: '40 Menit',
    completed: false,
    desc: 'Strategi psikologi audiens, kurasi kata kunci trending, dan pengemasan CTA konversi tinggi untuk konten affiliate.',
    category: 'Marketing',
  },
];

export const KelasView: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  const [activeLesson, setActiveLesson] = useState<ModuleLesson | null>(COURSES[0]);

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50/60 p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-28 md:pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-xl space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-purple-200 border border-white/10">
            <Sparkles className="w-3 h-3 text-purple-300" />
            Kurikulum Kreator Pro 2026
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Kelas Masterclass Studio Pro
          </h1>
          <p className="text-xs md:text-sm text-purple-200 leading-relaxed font-medium">
            Tingkatkan kemampuan produksi konten berbasis kecerdasan buatan dari perumusan ide, generasi visual tingkat lanjut, hingga monetisasi affiliate.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-purple-200">
              <BookOpen className="w-4 h-4 text-purple-300" /> 4 Modul Lengkap
            </div>
            <div className="flex items-center gap-1.5 text-purple-200">
              <Clock className="w-4 h-4 text-purple-300" /> Total 3.5 Jam Materi
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Award className="w-4 h-4" /> Sertifikasi CBT
            </div>
          </div>
        </div>
      </div>

      {/* Course List & Interactive Player */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module Sidebar */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">
            Daftar Modul Belajar
          </h3>
          <div className="space-y-2">
            {COURSES.map((course, idx) => {
              const isSelected = activeLesson?.id === course.id;
              return (
                <div
                  key={course.id}
                  onClick={() => setActiveLesson(course)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-white border-purple-300 shadow-md ring-2 ring-purple-100'
                      : 'bg-white/80 border-zinc-200/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                      Modul 0{idx + 1}
                    </span>
                    {course.completed ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle className="w-3 h-3" /> Selesai
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-400">
                        {course.duration}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 leading-snug">
                    {course.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lesson Detail / Player Simulator */}
        <div className="md:col-span-2 space-y-4">
          {activeLesson ? (
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="aspect-video w-full bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-white relative overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"
                  alt="Lesson Thumbnail"
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition duration-500"
                />
                <button
                  onClick={() => onShowToast(`Memulai video: ${activeLesson.title}`, 'success')}
                  className="absolute w-14 h-14 rounded-full bg-white/90 backdrop-blur text-purple-700 flex items-center justify-center shadow-2xl transition hover:scale-110 active:scale-90"
                >
                  <PlayCircle className="w-8 h-8 ml-0.5" />
                </button>
                <span className="absolute bottom-3 right-3 text-[10px] font-mono bg-black/70 backdrop-blur px-2.5 py-1 rounded text-white font-bold">
                  {activeLesson.duration}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block mb-1">
                  {activeLesson.category}
                </span>
                <h2 className="text-lg font-extrabold text-zinc-900 tracking-tight">
                  {activeLesson.title}
                </h2>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium mt-2">
                  {activeLesson.desc}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => onShowToast('Status modul diperbarui ke Selesai', 'success')}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Tandai Selesai
                </button>
                <button
                  onClick={() => onShowToast('Materi PDF & Prompt Cheatsheet diunduh', 'info')}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition"
                >
                  Download Cheatsheet Prompt
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
