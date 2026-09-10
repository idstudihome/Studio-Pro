import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Play,
  Pause,
  Plus,
  Sparkles,
  Sliders,
  RotateCw,
  Video,
  CheckCircle2,
  Layers,
  Camera,
  Download,
  Volume2,
  VolumeX,
  Maximize,
  Clock,
  Compass,
  Zap,
  ExternalLink,
  Trash2,
  Share2,
  Eye,
} from 'lucide-react';
import { AccountProfile } from '../../../types';

interface GoogleFlowWorkspaceProps {
  activeAccount: AccountProfile | undefined;
  userEmail: string;
  onOpenAddAccount: () => void;
  onOpenStudio: () => void;
  onOpenVideoPlayer: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export interface FlowVideoItem {
  id: string;
  title: string;
  originalPrompt: string;
  enhancedPrompt: string;
  directorNotes: string;
  cameraMove: string;
  cameraTrajectory: {
    yaw: string;
    pitch: string;
    roll: string;
    focalLength: string;
    shutterAngle: string;
  };
  aspectRatio: '9:16' | '16:9' | '1:1';
  style: string;
  lighting: string;
  fps: number;
  motionIntensity: number;
  duration: number;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: string;
}

const DEFAULT_FLOW_VIDEOS: FlowVideoItem[] = [
  {
    id: 'flow_krakatau_01',
    title: 'Erupsi Sinematik Gunung Krakatau 8K',
    originalPrompt: 'Cinematic volcanic eruption of Mount Krakatau, molten lava river flowing down into misty sea, 360 degree drone orbit',
    enhancedPrompt: 'Masterpiece cinematic video, Mount Krakatau eruption, molten lava river cascading into steaming ocean, 360 degree drone orbit, volumetric sunset haze, shot on RED V-Raptor 8K --ar 9:16',
    directorNotes: 'Kamera mengorbit 360 derajat dengan horizon lock. Pencahayaan magma berpendar di laut berkabut senja.',
    cameraMove: '360° Drone Orbit',
    cameraTrajectory: {
      yaw: '360 deg continuous orbit',
      pitch: '-18 deg downward',
      roll: '0 deg horizon lock',
      focalLength: '35mm Cine Prime',
      shutterAngle: '180 deg',
    },
    aspectRatio: '9:16',
    style: 'Hyperrealistic 4K',
    lighting: 'Volumetric Golden Hour',
    fps: 60,
    motionIntensity: 8,
    duration: 10,
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540110307374-1296541cb915?auto=format&fit=crop&q=80&w=800',
    createdAt: 'Baru saja',
  },
  {
    id: 'flow_jakarta_2050',
    title: 'Cyberpunk Jakarta Megacity 2050',
    originalPrompt: 'Futuristic Cyberpunk Jakarta 2050, neon skyscrapers, flying electric vehicles, wet asphalt reflections, Steadicam Push-In',
    enhancedPrompt: 'Cyberpunk mega-metropolis Jakarta 2050, high density neon holograms, flying transport lanes, wet asphalt reflections, Steadicam Push-In, 8K hyperdetailed --ar 9:16',
    directorNotes: 'Gerakan dorong kamera mendekat dengan sudut rendah untuk menegaskan skala gedung pencakar langit.',
    cameraMove: 'Steadicam Push-In',
    cameraTrajectory: {
      yaw: '0 deg linear track',
      pitch: '+12 deg upward look',
      roll: '0 deg stable',
      focalLength: '24mm Ultra Wide',
      shutterAngle: '180 deg',
    },
    aspectRatio: '9:16',
    style: 'Cyberpunk Neon',
    lighting: 'Neon Night',
    fps: 60,
    motionIntensity: 7,
    duration: 10,
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    createdAt: '12 menit lalu',
  },
  {
    id: 'flow_nature_rajaampat',
    title: 'Drone Flight Laut Raja Ampat',
    originalPrompt: 'Pristine turquoise lagoons of Raja Ampat, coral reefs visible under crystal water, lush karst islands, FPV Dive',
    enhancedPrompt: 'Hyperrealistic aerial footage of Raja Ampat turquoise lagoons, crystal clear reefs, dramatic karst limestone towers, FPV Dive & Glide, natural sunlight --ar 16:9',
    directorNotes: 'FPV menukik dari ketinggian 100m ke permukaan air jernih dengan akselerasi halus.',
    cameraMove: 'FPV Dive & Roll',
    cameraTrajectory: {
      yaw: 'Smooth banking turn',
      pitch: '-45 deg dive to -5 deg level',
      roll: '15 deg dynamic bank',
      focalLength: '18mm FPV Cine',
      shutterAngle: '180 deg',
    },
    aspectRatio: '16:9',
    style: 'Nature Documentary',
    lighting: 'Volumetric Golden Hour',
    fps: 60,
    motionIntensity: 9,
    duration: 10,
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
    createdAt: 'Kemarin',
  },
];

export const GoogleFlowWorkspace: React.FC<GoogleFlowWorkspaceProps> = ({
  userEmail,
  onShowToast,
}) => {
  // Video Generator Form State
  const [prompt, setPrompt] = useState(
    'Cinematic volcanic eruption of Mount Krakatau, molten lava river flowing into misty sea, 360 degree drone orbit, 8K photorealistic'
  );
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [cameraMove, setCameraMove] = useState('360° Drone Orbit');
  const [motionIntensity, setMotionIntensity] = useState(8);
  const [style, setStyle] = useState('Hyperrealistic 4K');
  const [lighting, setLighting] = useState('Volumetric Golden Hour');
  const [fps, setFps] = useState<24 | 30 | 60>(60);
  const [isGenerating, setIsGenerating] = useState(false);

  // Video Library State (persisted in localStorage)
  const [videos, setVideos] = useState<FlowVideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('GOOGLE_FLOW_VIDEOS_STORAGE_V1');
      return saved ? JSON.parse(saved) : DEFAULT_FLOW_VIDEOS;
    } catch {
      return DEFAULT_FLOW_VIDEOS;
    }
  });

  // Active Video in Monitor Player
  const [activeVideo, setActiveVideo] = useState<FlowVideoItem>(videos[0] || DEFAULT_FLOW_VIDEOS[0]);

  // Video Player Controls State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(true);
  const [ambientSound, setAmbientSound] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  // Save videos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('GOOGLE_FLOW_VIDEOS_STORAGE_V1', JSON.stringify(videos));
    } catch (e) {
      console.warn('Failed to save flow videos to localStorage', e);
    }
  }, [videos]);

  // Audio synthesizer for cinematic ambient drone
  const startAmbientSound = () => {
    try {
      if (!ambientSound) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!oscRef.current) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, ctx.currentTime); // Low cinematic sub-bass (A1)
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
      }
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  const stopAmbientSound = () => {
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
    } catch {}
  };

  // Video player event listeners
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      startAmbientSound();
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      stopAmbientSound();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 10);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
    onShowToast(`Kecepatan render: ${nextSpeed}x`, 'info');
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Real Video Generation using /api/flow/generate-video
  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      onShowToast('Silakan masukkan prompt instruksi video terlebih dahulu.', 'error');
      return;
    }

    setIsGenerating(true);
    onShowToast('Mengirim instruksi render ke Google Flow Server Cluster...', 'info');

    try {
      const savedCustomKey = localStorage.getItem('CUSTOM_GEMINI_API_KEY') || undefined;
      const response = await fetch('/api/flow/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          cameraMove,
          aspectRatio,
          motionIntensity,
          style,
          lighting,
          fps,
          userApiKey: savedCustomKey,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghasilkan video');
      }

      const newVideo: FlowVideoItem = data.video;
      setVideos((prev) => [newVideo, ...prev]);
      setActiveVideo(newVideo);
      setIsGenerating(false);

      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }

      onShowToast('Video Google Flow 4K berhasil dirender dan siap diputar!', 'success');
    } catch (err: any) {
      setIsGenerating(false);
      onShowToast(`Error: ${err.message}`, 'error');
    }
  };

  // Real File Download
  const handleDownloadVideo = (video: FlowVideoItem) => {
    const filename = `${video.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_flow.mp4`;
    const downloadUrl = `/api/flow/download-video?url=${encodeURIComponent(video.videoUrl)}&filename=${encodeURIComponent(filename)}`;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast(`Mengunduh file MP4: ${filename}`, 'success');
  };

  const handleDeleteVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    if (activeVideo.id === id && updated.length > 0) {
      setActiveVideo(updated[0]);
    }
    onShowToast('Video dihapus dari galeri', 'info');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-5 max-w-7xl mx-auto w-full gap-5">
      
      {/* Ecosystem Google Single Sign-On Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-zinc-950 text-white p-4 sm:p-5 rounded-3xl border border-blue-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-inner flex-shrink-0">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Google Flow Video AI Studio
              </h2>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                Production Active
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Akun Terhubung: <strong>{userEmail}</strong> • Kuota Komputasi: <strong>Tak Terbatas (Enterprise GPU Cluster)</strong>
            </p>
          </div>
        </div>

        {/* Sync Button with labs.google/fx/tools/flow */}
        <button
          onClick={() => {
            window.open('https://labs.google/fx/tools/flow', 'GoogleFlowOfficial', 'width=1240,height=820');
            onShowToast('Membuka Google Flow Cloud Studio terautentikasi', 'info');
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md flex-shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Buka labs.google/flow</span>
        </button>
      </div>

      {/* Main Studio Grid: Controls on Left, Monitor Player on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Prompt & Camera Parameters (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-3xl border border-zinc-200/90 p-5 shadow-xs flex flex-col gap-4">
            
            {/* Prompt Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                  Prompt Video Sinematik
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Flow v2.4 Engine</span>
            </div>

            {/* Prompt Textarea */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Deskripsikan adegan video yang ingin digenerate..."
              rows={3}
              className="w-full text-xs font-medium text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-2xl p-3 focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none transition resize-none leading-relaxed"
            />

            {/* Quick Inspiration Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'Gunung Krakatau Lava Flow',
                'Cyberpunk Jakarta 2050',
                'Raja Ampat Drone FPV',
                'Cosmic Supernova 8K',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setPrompt(`Cinematic 8K shot of ${chip}, dynamic motion, volumetric lighting, photorealistic`)}
                  className="px-2.5 py-1 bg-zinc-100 hover:bg-purple-50 hover:text-purple-700 text-zinc-600 text-[10px] font-bold rounded-lg border border-zinc-200/70 transition"
                >
                  + {chip}
                </button>
              ))}
            </div>

            {/* Camera Movement Selector */}
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>Gerakan Kamera 3D</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  '360° Drone Orbit',
                  'FPV Dive & Roll',
                  'Steadicam Push-In',
                  'Vertigo Dolly Zoom',
                  'Crane Down',
                  'Static Lock-On',
                ].map((move) => (
                  <button
                    key={move}
                    onClick={() => setCameraMove(move)}
                    className={`py-2 px-2 text-[10px] font-bold rounded-xl border text-center transition truncate ${
                      cameraMove === move
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    {move}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio & FPS */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Aspek Rasio
                </label>
                <div className="flex gap-1">
                  {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl border transition ${
                        aspectRatio === ratio
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                  Frame Rate
                </label>
                <div className="flex gap-1">
                  {([24, 30, 60] as const).map((frameRate) => (
                    <button
                      key={frameRate}
                      onClick={() => setFps(frameRate)}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl border transition ${
                        fps === frameRate
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {frameRate} fps
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Motion Intensity Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-600" />
                  <span>Intensitas Motion</span>
                </label>
                <span className="text-xs font-mono font-bold text-purple-700">
                  Level {motionIntensity}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={motionIntensity}
                onChange={(e) => setMotionIntensity(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Style & Lighting */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
                  Visual Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-zinc-800 outline-none"
                >
                  <option value="Hyperrealistic 4K">Hyperrealistic 4K</option>
                  <option value="Cyberpunk Neon">Cyberpunk Neon</option>
                  <option value="Cinematic Film 35mm">Cinematic Film 35mm</option>
                  <option value="Nature Documentary">Nature Documentary</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">
                  Lighting
                </label>
                <select
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value)}
                  className="w-full text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-zinc-800 outline-none"
                >
                  <option value="Volumetric Golden Hour">Golden Hour</option>
                  <option value="Moody Low-Key Noir">Low-Key Noir</option>
                  <option value="Neon Night">Neon Night</option>
                  <option value="Studio Clean">Studio Clean</option>
                </select>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateVideo}
              disabled={isGenerating}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-white" />
                  <span>Merender Video AI di Google Flow...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Render Video Google Flow (4K Ultra HD)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Real HTML5 Video Player & Monitor (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-zinc-950 text-white rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col">
            
            {/* Monitor Header */}
            <div className="p-3.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-zinc-200 truncate max-w-xs sm:max-w-md">
                  {activeVideo.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md border border-zinc-700">
                  {activeVideo.aspectRatio} • {activeVideo.fps} FPS
                </span>
                <button
                  onClick={() => handleDownloadVideo(activeVideo)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh MP4</span>
                </button>
              </div>
            </div>

            {/* REAL HTML5 VIDEO PLAYER CANVAS */}
            <div className="relative bg-black flex items-center justify-center overflow-hidden min-h-[360px] sm:min-h-[420px] max-h-[500px]">
              <video
                ref={videoRef}
                key={activeVideo.id}
                src={activeVideo.videoUrl}
                poster={activeVideo.thumbnailUrl}
                playsInline
                loop={isLooping}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                className="w-full h-full object-contain max-h-[480px] cursor-pointer"
              />

              {/* Big Play Overlay (when paused) */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center cursor-pointer group transition"
                >
                  <div className="w-16 h-16 rounded-full bg-purple-600/90 group-hover:scale-110 group-hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl transition">
                    <Play className="w-7 h-7 ml-1 fill-white" />
                  </div>
                </div>
              )}

              {/* Live Camera Trajectory Overlay Badge */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-[10px] font-mono text-zinc-300 flex items-center gap-2 pointer-events-none">
                <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
                <span>{activeVideo.cameraMove} • {activeVideo.cameraTrajectory.focalLength}</span>
              </div>
            </div>

            {/* REAL VIDEO PLAYER SCRUBBER & CONTROLS */}
            <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex flex-col gap-2">
              
              {/* Timeline Progress Bar */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400 w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 10}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 accent-purple-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono text-zinc-400 w-10">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Playback Controls Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white transition"
                    title={isPlaying ? 'Jeda' : 'Putar'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 transition"
                    title={isMuted ? 'Buka Suara' : 'Bisukan'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setAmbientSound(!ambientSound)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                      ambientSound
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                    title="Efek Suara Atmosfer Sinematik"
                  >
                    Synth Soundscape
                  </button>

                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                      isLooping
                        ? 'bg-blue-950 text-blue-300 border-blue-800'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                    title="Ulangi Otomatis"
                  >
                    Loop
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSpeedChange}
                    className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px] transition"
                    title="Kecepatan Putar"
                  >
                    {playbackSpeed}x
                  </button>

                  <button
                    onClick={handleFullscreen}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 transition"
                    title="Layar Penuh"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Director Notes & Telemetry Box */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800/80 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Catatan Sutradara & Telemetri Kamera
                </span>
                <span className="text-[10px] font-mono text-purple-400">
                  {activeVideo.cameraTrajectory.yaw} • {activeVideo.cameraTrajectory.pitch}
                </span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                {activeVideo.directorNotes}
              </p>
              <div className="mt-2.5 p-2 bg-zinc-900 rounded-xl border border-zinc-800 font-mono text-[10px] text-zinc-400 truncate">
                <strong className="text-zinc-300">Prompt RED 8K:</strong> {activeVideo.enhancedPrompt}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Gallery of Rendered Google Flow Videos */}
      <div className="bg-white rounded-3xl border border-zinc-200/90 p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
              Galeri Render Video Google Flow ({videos.length} Video)
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500">Tersimpan otomatis di penyimpanan lokal</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {videos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => {
                setActiveVideo(vid);
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play().catch(() => {});
                  setIsPlaying(true);
                }
              }}
              className={`group relative rounded-2xl border overflow-hidden p-2 flex flex-col gap-2 cursor-pointer transition ${
                activeVideo.id === vid.id
                  ? 'border-purple-600 bg-purple-50/50 shadow-md ring-2 ring-purple-200'
                  : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50'
              }`}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                <img
                  src={vid.thumbnailUrl}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur flex items-center justify-center text-white group-hover:scale-110 transition">
                    <Play className="w-3.5 h-3.5 ml-0.5 fill-white" />
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 bg-black/70 text-white font-mono text-[9px] px-1.5 py-0.2 rounded">
                  {vid.aspectRatio}
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <span className="text-xs font-bold text-zinc-900 line-clamp-1">
                  {vid.title}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  {vid.cameraMove} • {vid.createdAt}
                </span>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadVideo(vid);
                  }}
                  className="text-[10px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Unduh MP4</span>
                </button>

                {videos.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteVideo(vid.id, e)}
                    className="text-zinc-400 hover:text-red-500 p-1"
                    title="Hapus Video"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
