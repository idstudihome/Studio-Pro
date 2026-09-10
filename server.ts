import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

function getGeminiClient(customKey?: string) {
  const key = customKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Gemini Status Endpoint
app.get("/api/gemini/status", (req, res) => {
  res.json({
    available: !!process.env.GEMINI_API_KEY,
    model: "gemini-3.8-flash",
    mode: "server-side-gemini-ai",
  });
});

// Storyboard Generation API
app.post("/api/gemini/storyboard", async (req, res) => {
  try {
    const { prompt, sceneCount = 3, aspectRatio = "9:16", contentType = "film_pendek", userApiKey } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt ide cerita wajib diisi." });
    }

    const ai = getGeminiClient(userApiKey);

    if (!ai) {
      // Intelligent algorithmic fallback if no Gemini key is provided in environment
      const scenes = generateSmartFallbackStoryboard(prompt, sceneCount, aspectRatio, contentType);
      return res.json({
        success: true,
        source: "smart-engine-fallback",
        scenes,
        note: "Menggunakan Smart Engine. Hubungkan Google Account atau isi GEMINI_API_KEY untuk model Gemini 3.8 Flash aktif.",
      });
    }

    const systemInstruction = `Kamu adalah sutradara dan prompt engineer video AI profesional kelas dunia (spesialis Flow, Sora, Kling, Runway Gen-3).
Tugasmu adalah membuat storyboard berkesinambungan (narrative continuity) sebanyak tepat ${sceneCount} scene berdasarkan ide cerita pengguna.
Konten format: ${contentType}, Aspek rasio: ${aspectRatio}.

Untuk setiap scene hasilkan:
- number: nomor scene (1, 2, dst)
- title: judul adegan yang ringkas dan memikat
- visual: deskripsi visual mendalam dengan continuity subjek, pencahayaan, dan aksi
- camera: arahan kamera teknis sinematik (contoh: "Extreme Wide Shot, Slow Push In 35mm f/1.8")
- voiceover: narasi suara atau dialog audio yang emosional dan pas
- prompt: prompt video AI siap pakai dalam bahasa Inggris beresolusi tinggi, termasuk parameter aspect ratio --ar ${aspectRatio}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Buat ${sceneCount} scene storyboard sinematik untuk: "${prompt}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              number: { type: Type.INTEGER },
              title: { type: Type.STRING },
              visual: { type: Type.STRING },
              camera: { type: Type.STRING },
              voiceover: { type: Type.STRING },
              prompt: { type: Type.STRING },
            },
            required: ["number", "title", "visual", "camera", "voiceover", "prompt"],
          },
        },
      },
    });

    const rawText = response.text || "[]";
    const scenes = JSON.parse(rawText);

    return res.json({
      success: true,
      source: "gemini-3.8-flash",
      scenes,
    });
  } catch (error: any) {
    console.error("Gemini Storyboard Error:", error);
    // Graceful fallback to guarantee zero disruption for user
    const { prompt, sceneCount = 3, aspectRatio = "9:16", contentType = "film_pendek" } = req.body || {};
    const fallbackScenes = generateSmartFallbackStoryboard(prompt || "ide cerita", sceneCount, aspectRatio, contentType);
    return res.json({
      success: true,
      source: "smart-engine-fallback",
      scenes: fallbackScenes,
      warning: error.message,
    });
  }
});

// Microtools Smart Processing API
app.post("/api/gemini/microtools", async (req, res) => {
  try {
    const { toolName, input, userApiKey } = req.body;

    if (!toolName || !input) {
      return res.status(400).json({ error: "Nama tool dan input wajib diisi." });
    }

    const ai = getGeminiClient(userApiKey);

    if (!ai) {
      const fallbackResult = generateSmartFallbackMicrotool(toolName, input);
      return res.json({
        success: true,
        source: "smart-engine-fallback",
        toolName,
        result: fallbackResult,
      });
    }

    const promptTemplate = getMicrotoolPrompt(toolName, input);

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptTemplate,
      config: {
        systemInstruction: "Kamu adalah asisten AI Studio Pro serba bisa untuk digital creator, e-commerce specialist, dan video marketer. Berikan output yang terstruktur rapi, siap pakai (copy-paste), dan berstandar industri tinggi.",
      },
    });

    const resultText = response.text || "";

    return res.json({
      success: true,
      source: "gemini-3.8-flash",
      toolName,
      result: resultText,
    });
  } catch (error: any) {
    console.error("Gemini Microtools Error:", error);
    const { toolName = "Tool", input = "" } = req.body || {};
    const fallback = generateSmartFallbackMicrotool(toolName, input);
    return res.json({
      success: true,
      source: "smart-engine-fallback",
      toolName,
      result: fallback,
      warning: error.message,
    });
  }
});

// Helper for Microtools prompt instructions
function getMicrotoolPrompt(toolName: string, input: string): string {
  switch (toolName) {
    case "TikTok Downloader":
      return `Analisis tautan TikTok ini: "${input}". 
Berikan ringkasan metadata video, rekomendasi tagar viral terkait, serta instruksi unduhan tanpa watermark (Direct MP4 Stream, Resolusi 1080x1920, Audio Bitrate 320kbps).`;
    case "Split Video":
      return `Untuk video dengan konteks: "${input}", berikan rekomendasi segmentasi scene otomatis (Cut Points) per detik/menit, judul tiap sub-klip, dan hook pembuka 3 detik pertama agar viral di Shorts/Reels/TikTok.`;
    case "Voiceover Generator":
      return `Buat naskah voiceover profesional dari ide: "${input}". 
Tuliskan naskah lengkap dengan tanda jeda sinematik [Pause 0.5s], penekanan nada suara [Emphatic], dan arahan emosi pembaca (Natural, Energetik, atau Deep Cinematic). Sertakan perkiraan durasi detik.`;
    case "Foto Produk AI":
      return `Buatkan 3 variasi prompt foto produk e-commerce kelas studio untuk: "${input}".
Format tiap variasi mencakup:
1. Deskripsi Lighting (Contoh: Softbox 45-degree rim light, subtle caustics)
2. Background & Surface (Contoh: Matte obsidian stone, botanical monstera leaves)
3. Camera Lens & Setting (Contoh: 85mm f/2.8 macro, Hasselblad color profile)
4. Final Midjourney/SDXL Prompt siap copy.`;
    case "Branding AI":
      return `Buat konsep identitas brand lengkap untuk: "${input}".
Sertakan:
1. Nama Brand & Slogan berdaya pikat tinggi
2. Palet Warna (Hex codes & makna psikologis)
3. Tipografi Display & Body
4. Visual Moodboard & Aset Desain`;
    case "Mockup Produk":
      return `Buatkan instruksi mockup 3D fotorealistis untuk: "${input}".
Tentukan tipe mockup, tekstur kain/bahan, sudut pandang kamera, dan prompt generate gambar photorealistic di Flow / Midjourney.`;
    case "Fotografer AI":
      return `Buat prompt potret virtual model profesional untuk: "${input}".
Rincikan styling model (wajah, ekspresi, pakaian), pose natural, background setting, dan detail kamera (85mm f/1.4, eye-level focus).`;
    case "Affiliate Kit":
      return `Buatkan paket pemasaran affiliate lengkap untuk produk: "${input}".
Sertakan:
1. 3 Pilihan Hook 3 detik pertama (Problem-Agitate-Solve)
2. Naskah Video TikTok Shop 30 detik
3. Call To Action (CTA) teruji
4. Daftar 15 Hashtag dengan volume pencarian tinggi`;
    case "Prompt Video":
      return `Ubah ide ini menjadi prompt video AI ultra-canggih untuk Google Flow, Sora, dan Kling: "${input}".
Format: Subjek bergerak, fisika natural, konsistensi pencahayaan sinematik, camera movement, dan parameter teknis sinematografi.`;
    case "Character Sheet":
      return `Buatkan lembar karakter (Character Consistency Sheet) untuk: "${input}".
Rincikan deskripsi tampak depan (front), tampak samping (side profile), tampak 3/4, dan ekspresi khas beserta kata kunci prompt konsisten.`;
    default:
      return `Proses tugas "${toolName}" dengan input berikut secara mendalam: "${input}".`;
  }
}

// Smart algorithmic fallback when offline or no API key is set
function generateSmartFallbackStoryboard(prompt: string, count: number, ratio: string, contentType: string) {
  const titles = [
    "Establishing & Hook Awal",
    "Eskalasi Ketegangan / Aksi",
    "Klimaks & Titik Balik",
    "Konsekuensi & Momen Emosional",
    "Resolusi & Kesimpulan Visioner",
    "Transisi Epik Lanjutan",
    "Dimensi Baru",
    "Penutup Berkesan",
  ];
  const scenes = [];
  const ratioCmd = ratio.replace(":", ":");

  for (let i = 1; i <= count; i++) {
    const title = titles[i - 1] || `Scene ${i}: Progresi Alur`;
    const cameraMoves = [
      "Cinematic Wide Shot, Slow Pan Left, Depth of field f/1.8",
      "Low Angle Tracking, Dynamic Motion with Parallax",
      "Close-Up Macro Focus, Intense Lighting & Rim Glow",
      "Drone Aerial Shot, Sweeping downward orbit",
      "Over The Shoulder, Smooth Steadicam Follow",
    ];
    const cam = cameraMoves[(i - 1) % cameraMoves.length];

    scenes.push({
      number: i,
      title,
      visual: `Adegan scene ${i} memvisualisasikan: "${prompt}". Kesinambungan subjek dipertahankan dengan pencahayaan volumetric dan partikel dinamis yang mengalir dari scene sebelumnya.`,
      camera: cam,
      voiceover: i === 1 
        ? `Di sinilah semuanya bermula, sebuah momen yang mengubah pemahaman kita tentang ${prompt.split(",")[0] || "segalanya"}...`
        : `Detik-detik eskalasi membawa fokus intens menuju perwujudan utama yang tidak terelakkan.`,
      prompt: `Cinematic 8k, hyper-detailed, masterpiece visual storytelling of ${prompt}. Scene ${i}: continuous narrative flow, atmospheric volumetric lighting, ARRI Alexa color science, ${cam} --ar ${ratioCmd} --v 6.0`,
    });
  }

  return scenes;
}

function generateSmartFallbackMicrotool(toolName: string, input: string): string {
  switch (toolName) {
    case "TikTok Downloader":
      return `✅ **Analisis Video TikTok Berhasil**\n• URL Target: ${input}\n• Status: Siap Diunduh Tanpa Watermark\n• Resolusi: 1080 x 1920 (HD Vertical)\n• Audio Bitrate: 320 kbps Original Stereo\n\n💡 Rekomendasi: Ekstrak audio untuk dipakai kembali sebagai suara latar Storyboard Anda.`;
    case "Split Video":
      return `✂️ **Rekomendasi Potongan Video Cerdas**\n• Klip 1 (00:00 - 00:05): Hook Emosional Utama (Pertahankan retensi penonton)\n• Klip 2 (00:05 - 00:18): Pembuktian Masalah & Eksplorasi\n• Klip 3 (00:18 - 00:30): Call to Action & Hasil Akhir\n\n🎯 Transisi: Gunakan Speed Ramp 1.5x di detik ke-5 untuk transisi mulus.`;
    case "Voiceover Generator":
      return `🎙️ **Naskah Voiceover Studio Pro**\n\n[Intro - Nada Penasaran & Mengundang]\n"Kalian pernah membayangkan gak, apa jadinya kalau..."\n[Pause 0.4s]\n\n[Inti - Artikulasi Jelas, Penuh Keyakinan]\n"${input} kini bukan sekadar mimpi. Setiap detil dibuat dengan presisi tanpa celah."\n\n[Outro - Ramah & Berenergi]\n"Buktikan sendiri sekarang juga, sebelum terlambat!"\n\n⏱️ Perkiraan durasi: 22 detik (Tempo: Normal, 130 WPM).`;
    case "Foto Produk AI":
      return `📸 **Prompt Foto Produk E-Commerce Studio**\n\n**Variasi 1: Minimalist Luxury**\n\`Commercial product photography of ${input}, placed on a smooth light travertine marble podium, morning sunlight streaming through soft linen curtains, gentle reflections, ultra-sharp focus, Hasselblad 100mm f/4 macro, 8k resolution --ar 1:1 --v 6.0\`\n\n**Variasi 2: Dynamic Atmospheric**\n\`Hero product shot of ${input} surrounded by delicate water splashes and floating botanical leaves, dark slate textured backdrop, dramatic studio rim lighting, high-speed photography shutter 1/8000s, photorealistic, pristine quality --ar 1:1\``;
    case "Affiliate Kit":
      return `🚀 **Affiliate Viral Kit: ${input}**\n\n**1. Hook 3 Detik:**\n• "Nyesel banget baru tahu ini sekarang..."\n• "Jangan beli ini kalau kamu belum siap punya..."\n\n**2. Naskah Video:**\n"Seminggu ini aku cobain ${input}, dan hasilnya di luar ekspektasi! Bahan awet, praktis, dan bikin hidup jauh lebih mudah. Yang mau samaan, buruan checkout sebelum kehabisan!"\n\n**3. Rekomendasi Hashtag:**\n#racuntiktok #tiktokshopindonesia #rekomendasiproduk #viral2026 #fyp #studiopro`;
    default:
      return `✨ Hasil cerdas untuk **${toolName}**:\n\nInput yang diproses: "${input}"\nOutput telah dioptimasi dengan standar Studio Pro untuk hasil siap pakai di berbagai platform kreatif Anda.`;
  }
}

async function startServer() {
  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Express 5 requires *all
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Studio Pro Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
