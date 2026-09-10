import React, { useEffect, useRef, useState } from 'react';
import { X, Play, Pause } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  title = 'Simulasi Animasi Clay Krakatau - Studio Pro',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let localProgress = 0;
    const particles = Array.from({ length: 45 }).map(() => ({
      x: 180,
      y: 380,
      vx: (Math.random() - 0.5) * 5,
      vy: -Math.random() * 7 - 3,
      size: Math.random() * 4 + 2,
    }));

    const render = () => {
      if (isPlaying) {
        localProgress = (localProgress + 0.003) % 1;
        setProgress(localProgress);
      }

      // Background Sky (Night Clay Theme)
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, 360, 640);

      // Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 30; i++) {
        const sx = (i * 47) % 360;
        const sy = (i * 31) % 240;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Smoke clouds
      ctx.fillStyle = 'rgba(75, 85, 99, 0.3)';
      ctx.beginPath();
      ctx.arc(180, 260 + Math.sin(localProgress * 10) * 8, 70, 0, Math.PI * 2);
      ctx.arc(140, 230 + Math.cos(localProgress * 10) * 8, 55, 0, Math.PI * 2);
      ctx.arc(220, 220, 60, 0, Math.PI * 2);
      ctx.fill();

      // Mountain Base (Clay texture)
      ctx.fillStyle = '#3f3f46';
      ctx.beginPath();
      ctx.moveTo(30, 560);
      ctx.lineTo(150, 380);
      ctx.lineTo(210, 380);
      ctx.lineTo(330, 560);
      ctx.fill();

      // Lava Crater Pool
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.ellipse(180, 380, 30, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eruption Particles
      if (isPlaying) {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.16;
          if (p.y > 540) {
            p.x = 180;
            p.y = 380;
            p.vy = -Math.random() * 8 - 3;
          }
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Foreground Ocean Water
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 540, 360, 100);

      // Lava reflection on water
      ctx.fillStyle = 'rgba(249, 115, 22, 0.3)';
      ctx.beginPath();
      ctx.ellipse(180, 560, 50, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-[#09090b] rounded-3xl w-full max-w-sm md:max-w-md overflow-hidden shadow-2xl border border-zinc-800 relative animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-black/90 transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="aspect-[9/16] relative flex items-center justify-center overflow-hidden w-full bg-black">
          <canvas
            ref={canvasRef}
            width={360}
            height={640}
            className="w-full h-full object-cover"
          />

          {/* Player controls */}
          <div className="absolute bottom-6 left-4 right-4 bg-black/50 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition active:scale-90 flex-shrink-0 hover:bg-zinc-200"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all duration-75"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <span className="text-[10px] text-white/80 font-mono font-bold tracking-wider">1080P AI</span>
          </div>
        </div>

        <div className="p-4 bg-zinc-950 border-t border-zinc-900">
          <h4 className="text-xs font-bold text-white truncate">{title}</h4>
          <p className="text-[10px] text-zinc-400 mt-0.5">Prompt: Clay stop-motion eruption sequence with temporal consistency</p>
        </div>
      </div>
    </div>
  );
};
