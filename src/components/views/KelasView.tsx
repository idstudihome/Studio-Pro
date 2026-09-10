import React, { useState, useEffect } from 'react';
import {
  PlayCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
  Award,
  Video,
  ChevronRight,
  RefreshCw,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdminCourse } from '../../types';

interface KelasViewProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const KelasView: React.FC<KelasViewProps> = ({ onShowToast }) => {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<AdminCourse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load real courses from backend REST API
  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data: AdminCourse[] = await res.json();
        setCourses(data);
        if (data.length > 0 && !activeLesson) {
          setActiveLesson(data[0]);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat kurikulum kelas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Toggle module completion status with server persistence
  const handleToggleComplete = async (course: AdminCourse) => {
    const updatedStatus = !course.completed;
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...course,
          completed: updatedStatus,
        }),
      });

      if (res.ok) {
        setCourses((prev) =>
          prev.map((c) => (c.id === course.id ? { ...c, completed: updatedStatus } : c))
        );
        if (activeLesson?.id === course.id) {
          setActiveLesson({ ...activeLesson, completed: updatedStatus });
        }

        if (updatedStatus) {
          confetti({ particleCount: 35, spread: 60 });
          onShowToast(`Selamat! Modul "${course.title}" selesai dipelajari.`, 'success');
        } else {
          onShowToast(`Status modul diperbarui ke belum selesai.`, 'info');
        }
      }
    } catch {
      onShowToast('Gagal memperbarui status belajar di server.', 'error');
    }
  };

  const completedCount = courses.filter((c) => c.completed).length;
  const progressPercent = courses.length > 0 ? Math.round((completedCount / courses.length) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50/60 p-4 md:p-8 max-w-6xl mx-auto space-y-6 pb-28 md:pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-zinc-900 to-purple-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-purple-800/40">
        <div className="max-w-xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-[11px] font-bold text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3 h-3 text-purple-300" />
              Kurikulum Resmi Studio Pro 2026
            </span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
              {progressPercent}% Terselesaikan
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Masterclass Video Kreator AI
          </h1>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-medium">
            Tingkatkan kemampuan produksi konten berbasis kecerdasan buatan dari perumusan ide, generasi visual tingkat lanjut, hingga monetisasi affiliate.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-300">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-400" /> {courses.length} Modul Lengkap
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-400" /> Total 3.5 Jam Materi
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Award className="w-4 h-4" /> Sertifikasi Kompetensi
            </div>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80">
          <div className="flex justify-between text-xs text-zinc-400 mb-1.5 font-bold">
            <span>Progres Kelulusan Anda</span>
            <span>{completedCount} dari {courses.length} Modul Selesai</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Course List & Interactive Studio Player */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Sidebar */}
        <div className="space-y-3 lg:col-span-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Daftar Modul Belajar
            </h3>
            <button
              onClick={loadCourses}
              className="text-zinc-400 hover:text-purple-600 transition"
              title="Segarkan Modul"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-2">
            {courses.map((course, idx) => {
              const isSelected = activeLesson?.id === course.id;
              return (
                <div
                  key={course.id}
                  onClick={() => setActiveLesson(course)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-100'
                      : 'bg-white/80 border-zinc-200/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      Modul {idx + 1} • {course.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(course);
                      }}
                      title={course.completed ? 'Modul Selesai' : 'Tandai Selesai'}
                      className={`p-1 rounded-full transition ${
                        course.completed
                          ? 'text-emerald-600 hover:text-emerald-700'
                          : 'text-zinc-300 hover:text-zinc-500'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <h4 className="text-xs font-extrabold text-zinc-900 mt-2 line-clamp-2">
                    {course.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium mt-2 pt-2 border-t border-zinc-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.duration}
                    </span>
                    <span className="text-purple-700 font-bold flex items-center gap-0.5">
                      Buka Materi <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Player & Syllabus Details */}
        <div className="lg:col-span-2 space-y-4">
          {activeLesson ? (
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-6">
              {/* Video Player Simulation Card */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center group shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
                
                {isPlaying ? (
                  <div className="text-center text-white z-20 space-y-2 p-6 animate-pulse">
                    <Video className="w-12 h-12 mx-auto text-purple-400" />
                    <h4 className="text-sm font-bold">Sedang Memutar Sesi Praktek Video AI...</h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Simulasi pemutaran materi video interaktif "{activeLesson.title}".
                    </p>
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="mt-3 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-lg text-white"
                    >
                      Jeda Video
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="z-20 w-16 h-16 rounded-2xl bg-purple-600/90 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-2xl shadow-purple-500/50"
                  >
                    <PlayCircle className="w-10 h-10" />
                  </button>
                )}

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold">{activeLesson.category}</span>
                  </div>
                  <span className="font-medium bg-black/50 px-2 py-0.5 rounded backdrop-blur">
                    {activeLesson.duration}
                  </span>
                </div>
              </div>

              {/* Lesson Description & Actions */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-zinc-900">{activeLesson.title}</h2>
                    <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">
                      {activeLesson.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleComplete(activeLesson)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 flex-shrink-0 ${
                      activeLesson.completed
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-purple-700 hover:bg-purple-800 text-white shadow-md shadow-purple-600/30'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{activeLesson.completed ? 'Selesai Dipelajari' : 'Tandai Selesai'}</span>
                  </button>
                </div>

                {/* Syllabus Checklist */}
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-zinc-800">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Silabus & Poin Pembelajaran:</span>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-600">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                      <span>Pemahaman anatomi prompt sinematik: Lighting, Focal Length (35mm-85mm), dan Camera Movement.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                      <span>Eksplorasi teknik konsistensi karakter tanpa perubahan wajah atau distorsi anatomi.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                      <span>Alur kerja ekspor timeline dan integrasi langsung dengan AI Storyboard Studio Pro.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center text-zinc-400">
              Pilih modul di sebelah kiri untuk mulai belajar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
