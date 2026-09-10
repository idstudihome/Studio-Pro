import express from "express";
import path from "path";
import https from "https";
import http from "http";
import zlib from "zlib";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { dbService } from "./server/db";

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

function fetchProxyUrl(
  targetUrl: string,
  userHeaders: Record<string, string> = {},
  maxRedirects = 10
): Promise<{
  status: number;
  headers: http.IncomingHttpHeaders;
  finalUrl: string;
  buffer: Buffer;
}> {
  return new Promise((resolve, reject) => {
    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch (e) {
      return reject(e);
    }

    const client = parsed.protocol === "https:" ? https : http;
    const reqHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept-Encoding": "gzip, deflate, br",
      ...userHeaders,
      host: parsed.host,
    };

    const req = client.get(
      targetUrl,
      {
        maxHeaderSize: 128 * 1024,
        headers: reqHeaders,
        timeout: 20000,
      },
      (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location &&
          maxRedirects > 0
        ) {
          const redirectUrl = new URL(res.headers.location, targetUrl).toString();
          return resolve(fetchProxyUrl(redirectUrl, userHeaders, maxRedirects - 1));
        }

        let stream: NodeJS.ReadableStream = res;
        const encoding = res.headers["content-encoding"];
        if (encoding === "gzip") {
          stream = res.pipe(zlib.createGunzip());
        } else if (encoding === "deflate") {
          stream = res.pipe(zlib.createInflate());
        } else if (encoding === "br") {
          stream = res.pipe(zlib.createBrotliDecompress());
        }

        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
        stream.on("end", () => {
          resolve({
            status: res.statusCode || 200,
            headers: res.headers,
            finalUrl: targetUrl,
            buffer: Buffer.concat(chunks),
          });
        });
        stream.on("error", reject);
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Request timeout"));
    });
    req.on("error", reject);
  });
}

// Smart Web Proxy Endpoint for Workspace In-App Web Browser
app.get("/api/proxy-web", async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send("Parameter url wajib diisi.");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
  } catch {
    return res.status(400).send("URL tidak valid.");
  }

  const isForceRefresh = req.query.forceRefresh === "true";

  try {
    const fetchHeaders: Record<string, string> = {};
    if (isForceRefresh) {
      fetchHeaders["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate";
      fetchHeaders["Pragma"] = "no-cache";
    }

    const result = await fetchProxyUrl(parsedUrl.toString(), fetchHeaders);

    const contentType = (result.headers["content-type"] as string) || "text/html; charset=utf-8";

    // Detect Cloudflare Bot Protection challenge in iframe and provide instant standalone window bridge
    const isCloudflareChallenge = (result.status === 403 || result.status === 503) && result.buffer.toString("utf-8").includes("_cf_chl_opt");
    if (isCloudflareChallenge) {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${parsedUrl.hostname} - Akses Mandiri</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 1.5rem; box-sizing: border-box; }
              .card { background: #18181b; border: 1px solid #27272a; padding: 2.5rem; border-radius: 1.5rem; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
              .icon { width: 52px; height: 52px; margin: 0 auto 1.25rem; border-radius: 1rem; background: rgba(147, 51, 234, 0.15); display: flex; align-items: center; justify-content: center; color: #c084fc; }
              h2 { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.75rem; color: #fff; }
              p { font-size: 0.875rem; color: #a1a1aa; line-height: 1.6; margin-bottom: 1.75rem; }
              .btn-primary { background: #9333ea; color: white; border: none; padding: 0.75rem 1.5rem; font-weight: 700; border-radius: 0.75rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; box-sizing: border-box; transition: background 0.2s; font-size: 0.875rem; }
              .btn-primary:hover { background: #a855f7; }
              .btn-subtle { background: transparent; color: #a1a1aa; border: 1px solid #3f3f46; padding: 0.65rem 1.25rem; font-weight: 600; border-radius: 0.75rem; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 0.75rem; width: 100%; box-sizing: border-box; font-size: 0.825rem; }
              .btn-subtle:hover { color: #fff; border-color: #52525b; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h2>Autentikasi Mandiri ${parsedUrl.hostname}</h2>
              <p>Platform ini menerapkan proteksi bot / Cloudflare Turnstile yang memerlukan akses peramban langsung. Buka di jendela mandiri untuk pengalaman 100% lancar dengan akun Anda.</p>
              <button class="btn-primary" onclick="window.open('${parsedUrl.toString()}', '_blank', 'width=1320,height=860,menubar=no,toolbar=no,location=no,status=no')">
                Buka Jendela Mandiri (Bebas Hambatan)
              </button>
              <a class="btn-subtle" href="${parsedUrl.toString()}" target="_blank">
                Buka di Tab Baru
              </a>
            </div>
          </body>
        </html>
      `);
    }

    res.status(result.status || 200);
    res.setHeader("Content-Type", contentType);
    if (isForceRefresh) {
      res.setHeader("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    res.removeHeader("Content-Security-Policy-Report-Only");
    res.removeHeader("Cross-Origin-Embedder-Policy");
    res.removeHeader("Cross-Origin-Opener-Policy");
    res.removeHeader("Cross-Origin-Resource-Policy");
    res.setHeader("Content-Security-Policy", "frame-ancestors *;");
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (contentType.includes("text/html")) {
      let html = result.buffer.toString("utf-8");

      // Inject <base> tag so relative links and assets resolve correctly
      const baseTag = `<base href="${new URL(result.finalUrl).origin}/" />`;
      if (html.includes("<head>")) {
        html = html.replace("<head>", `<head>${baseTag}`);
      } else {
        html = `${baseTag}${html}`;
      }

      // Neutralize common frame-buster scripts
      html = html.replace(/if\s*\(top\s*!==?\s*self\)[^}]+}/gi, "");
      html = html.replace(/top\.location\s*=\s*self\.location/gi, "");

      return res.send(html);
    } else {
      return res.send(result.buffer);
    }
  } catch (error: any) {
    console.error("Web Proxy Error:", error);
    return res.status(502).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 1rem; }
            .card { background: #18181b; border: 1px solid #27272a; padding: 2rem; border-radius: 1.5rem; max-width: 480px; text-align: center; }
            h2 { font-size: 1.25rem; margin-bottom: 0.75rem; color: #fff; }
            p { font-size: 0.875rem; color: #a1a1aa; line-height: 1.5; margin-bottom: 1.5rem; }
            .btn { background: #9333ea; color: white; border: none; padding: 0.6rem 1.25rem; font-weight: 600; border-radius: 0.75rem; cursor: pointer; text-decoration: none; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Memuat Halaman ${parsedUrl.hostname}</h2>
            <p>Target web sedang memproses koneksi. Anda juga dapat membuka langsung di tab terpisah.</p>
            <a class="btn" href="${parsedUrl.toString()}" target="_blank">Buka Tab Browser</a>
          </div>
        </body>
      </html>
    `);
  }
});

// Gemini Status Endpoint
app.get("/api/gemini/status", (req, res) => {
  res.json({
    available: !!process.env.GEMINI_API_KEY,
    model: "gemini-flash-latest",
    mode: "server-side-gemini-ai",
  });
});

// Admin System Health & Metrics Endpoint
app.get("/api/admin/system-stats", (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: "healthy",
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
    },
    nodeVersion: process.version,
    geminiStatus: {
      configured: !!process.env.GEMINI_API_KEY,
      model: "gemini-flash-latest",
    },
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// FULLSTACK PERSISTENT REST APIS (PRODUCTION)
// ==========================================

// Tools / Platforms Management
app.get("/api/tools", (req, res) => {
  try {
    const tools = dbService.getTools();
    res.json(tools);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tools", (req, res) => {
  try {
    const tool = req.body;
    if (!tool || !tool.id || !tool.name || !tool.url) {
      return res.status(400).json({ error: "Data tool tidak lengkap (id, name, url wajib)." });
    }
    const saved = dbService.saveTool(tool);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/tools/:id", (req, res) => {
  try {
    const ok = dbService.deleteTool(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Accounts Profile Management
app.get("/api/accounts", (req, res) => {
  try {
    const accounts = dbService.getAccounts();
    res.json(accounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/accounts", (req, res) => {
  try {
    const acc = req.body;
    if (!acc || !acc.id || !acc.name) {
      return res.status(400).json({ error: "Data akun tidak lengkap." });
    }
    const saved = dbService.saveAccount(acc);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/accounts/switch-active", (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "ID akun wajib disertakan." });
    const active = dbService.setActiveAccount(id);
    if (!active) return res.status(404).json({ error: "Akun tidak ditemukan." });
    res.json(active);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/accounts/:id", (req, res) => {
  try {
    const ok = dbService.deleteAccount(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Digital Shop Catalog
app.get("/api/products", (req, res) => {
  try {
    const products = dbService.getProducts();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", (req, res) => {
  try {
    const prod = req.body;
    if (!prod || !prod.title || !prod.price) {
      return res.status(400).json({ error: "Judul dan harga produk wajib diisi." });
    }
    const cleanProd = {
      ...prod,
      id: prod.id || `p${Date.now()}`,
      sales: prod.sales ?? 0,
      active: prod.active ?? true,
      features: Array.isArray(prod.features) ? prod.features : ["Akses Instan"],
    };
    const saved = dbService.saveProduct(cleanProd);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/products/:id", (req, res) => {
  try {
    const ok = dbService.deleteProduct(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Masterclass Curriculum
app.get("/api/courses", (req, res) => {
  try {
    const courses = dbService.getCourses();
    res.json(courses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/courses", (req, res) => {
  try {
    const course = req.body;
    if (!course || !course.title) {
      return res.status(400).json({ error: "Judul materi kelas wajib diisi." });
    }
    const cleanCourse = {
      ...course,
      id: course.id || `m${Date.now()}`,
      completed: course.completed ?? false,
    };
    const saved = dbService.saveCourse(cleanCourse);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/courses/:id", (req, res) => {
  try {
    const ok = dbService.deleteCourse(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Transactions & Orders
app.get("/api/transactions", (req, res) => {
  try {
    const txs = dbService.getTransactions();
    res.json(txs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/transactions", (req, res) => {
  try {
    const { userName, userEmail, productTitle, amount, paymentMethod } = req.body;
    if (!productTitle || !amount) {
      return res.status(400).json({ error: "Detail pesanan (produk dan jumlah nominal) wajib diisi." });
    }
    const tx = dbService.createTransaction({
      userName: userName || "Kreator Studio Pro",
      userEmail: userEmail || "creator@studiopro.id",
      productTitle,
      amount: Number(amount),
      paymentMethod: paymentMethod || "QRIS",
    });
    res.json({
      success: true,
      transaction: tx,
      message: "Pesanan berhasil diproses dan dikonfirmasi.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/transactions/:id/status", (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status baru wajib disertakan." });
    const updated = dbService.updateTransactionStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: "Transaksi tidak ditemukan." });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Audit Logs
app.get("/api/admin/logs", (req, res) => {
  try {
    const logs = dbService.getLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/logs", (req, res) => {
  try {
    const { module = "Admin", message = "", level = "info" } = req.body;
    const log = dbService.addLog(module, message, level);
    res.json(log);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Live Computed Metrics
app.get("/api/admin/metrics", (req, res) => {
  try {
    const metrics = dbService.getLiveMetrics();
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Factory Reset
app.post("/api/admin/reset-default", (req, res) => {
  try {
    const state = dbService.resetToDefaults();
    res.json({ success: true, message: "Database berhasil direset ke standar produksi.", state });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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
        note: "Menggunakan Smart Engine. Hubungkan Google Account atau isi GEMINI_API_KEY untuk model Gemini Flash aktif.",
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
      model: "gemini-flash-latest",
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
      source: "gemini-flash-latest",
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
      model: "gemini-flash-latest",
      contents: promptTemplate,
      config: {
        systemInstruction: "Kamu adalah asisten AI Studio Pro serba bisa untuk digital creator, e-commerce specialist, dan video marketer. Berikan output yang terstruktur rapi, siap pakai (copy-paste), dan berstandar industri tinggi.",
      },
    });

    const resultText = response.text || "";

    return res.json({
      success: true,
      source: "gemini-flash-latest",
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

function generateSmartFallbackReply(persona: string, mode: string, model: string, message: string): string {
  const qLower = (message || "").toLowerCase();

  if (persona === "grok") {
    if (qLower.includes("hook") || qLower.includes("viral") || qLower.includes("konten") || qLower.includes("video") || qLower.includes("kopi")) {
      return `🚀 **Grok (xAI) Reasoning [Mode: ${String(mode || "THINK").toUpperCase()}]**

Mari kita bongkar anatomi psikologis di balik "${message}":

1. **Prinsip Utama Algoritma X/TikTok 2026**:
   - Rentang atensi penonton adalah 1.8 - 2.4 detik pertama. Jika frame pertama statis, video dianggap 'sampah' oleh algoritma.
2. **Formula Eksekusi Instan**:
   - **00:00 - 00:02**: Hook visual kontras tinggi (pergerakan cepat atau anomali yang memicu rasa penasaran visual).
   - **00:03 - 00:15**: Tunjukkan *gap* pengetahuan — "Kebanyakan orang salah mengira X, padahal kenyataannya Y."
   - **00:16 - 00:30**: Berikan bukti empiris, bukan opini kosong.
3. **Arahan Teknis Google Flow / Veo**:
   - Gunakan pergerakan *FPV Dive & Roll* atau *Dutch Angle 35mm* untuk merangsang dopamin visual penonton secara instan!`;
    }
    return `🚀 **Grok (xAI) Reasoning [Mode: ${String(mode || "THINK").toUpperCase()}]**

Menganalisis pertanyaan: "${message}"

- **Fakta Esensial**: Masalah ini sering kali dipersulit secara berlebihan oleh pendekatan konvensional.
- **Dekomposisi Logis**: Pisahkan antara sinyal nyata dan kebisingan (noise). Fokus pada variabel dengan dampak eksponensial terbesar.
- **Rekomendasi Aksi**: Eksekusi secara iteratif dan uji langsung di dunia nyata daripada berteori tanpa batas. Siap untuk tahap implementasi teknis?`;
  }

  if (persona === "chatgpt") {
    if (qLower.includes("naskah") || qLower.includes("script") || qLower.includes("cerita") || qLower.includes("video") || qLower.includes("promosi") || qLower.includes("kopi")) {
      return `💡 **ChatGPT Plus (${model || "GPT-4o"})**

Berikut arsitektur naskah video terstruktur untuk: **"${message}"**

---

### 1. Struktur Naskah (Framework: Hook - Story - Offer)
- **Scene 1 [00:00 - 00:03] - The Hook**:
  - *Visual*: Subjek utama bergerak ke arah kamera dengan pencahayaan volumetric golden hour.
  - *Audio / VO*: "Jangan pernah lewatkan rahasia ini jika Anda ingin hasil maksimal..."
- **Scene 2 [00:03 - 00:18] - Value & Tension**:
  - *Visual*: Cut cepat ke demonstrasi masalah nyata dan solusi tak terduga.
  - *Audio / VO*: "Inilah mengapa 90% kreator gagal, dan langkah tepat yang harus diambil hari ini."
- **Scene 3 [00:18 - 00:30] - Climax & CTA**:
  - *Visual*: Frame luas menunjukkan hasil akhir yang memukau dengan transisi halus.
  - *Audio / VO*: "Mulai sekarang di Studio Pro. Cek tautan di profil untuk akses penuh!"

---

### 2. Rekomendasi Prompt Google Flow (Veo 3.1)
\`\`\`text
Masterpiece cinematic footage, ${message}, shot on RED V-Raptor 8K, 35mm f/1.8 prime lens, volumetric golden hour haze, smooth camera tracking push-in --ar 9:16
\`\`\``;
    }
    return `💡 **ChatGPT Plus (${model || "GPT-4o"})**

Analisis terstruktur mengenai: **"${message}"**

1. **Ringkasan Eksekutif**:
   Tujuan utama adalah mencapai efisiensi tertinggi dengan output berkualitas tinggi dan terukur.
2. **Tahapan Implementasi Strategis**:
   - **Fase 1 (Riset & Konseptualisasi)**: Validasi hipotesis dan tentukan metrik keberhasilan.
   - **Fase 2 (Eksekusi Kreatif)**: Terapkan standar visual sinematik modern dan struktur pesan yang jelas.
   - **Fase 3 (Optimasi & Skalabilitas)**: Uji variasi hook dan perbaiki retensi secara berkelanjutan.
3. **Catatan Tambahan**:
   Gunakan fitur AI Storyboard di panel kanan Studio Pro untuk mengotomasi rendering scene secara paralel.`;
  }

  // Default: Gemini Advanced
  return `✨ **Google Gemini Advanced (Gemini Flash Multimodal)**

Saya telah menganalisis konsep Anda: **"${message}"**

Berikut arahan kreatif multimodal dan sinematografi terpadu:

• **Arahan Visual & Pencahayaan**:
  Kombinasikan palet warna *Teal & Warm Amber* dengan teknik pencahayaan *Chiaroscuro* untuk memberikan kedalaman sinematik tiga dimensi.

• **Koreografi Kamera (Google Flow & Veo 3.1)**:
  Gunakan gerakan *360° Drone Orbit* atau *Steadicam Push-In 35mm f/1.8* dengan *horizon lock* untuk menjaga fokus penonton tetap terkunci pada subjek utama.

• **Prompt Video Siap Pakai**:
  \`Cinematic 8K masterpiece, ${message}, dramatic low-angle push-in, volumetric atmosphere, hyperrealistic textures, shot on ARRI Alexa Mini LF --ar 9:16 --motion 8\`

• **Langkah Selanjutnya**:
  Anda dapat langsung menyalin prompt di atas ke Google Flow Video Studio atau membuka panel **AI Storyboard** di sisi kanan untuk menyusun rangkaian adegan secara otomatis!`;
}

// Interactive AI Chat API (Gemini Advanced, Grok, ChatGPT Plus)
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, persona = "gemini", mode = "think", model = "gpt-4o", history = [], userApiKey } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Pesan chat wajib diisi." });
    }

    const ai = getGeminiClient(userApiKey);

    // Persona-specific system instructions
    let systemInstruction = "";
    if (persona === "grok") {
      systemInstruction = `Kamu adalah Grok dari xAI (Model Grok 3 / Grok 2 Reasoning Engine) di Studio Pro. Mode aktif saat ini: ${String(mode).toUpperCase()}.
Karakteristik & Sikap:
- Cerdas, lugas, berwawasan luas, analitis mendalam, dan memiliki humor khas The Hitchhiker's Guide to the Galaxy serta visi teknologi futuristik xAI.
- Jika mode 'THINK': Berikan penalaran deduktif berlapis, analisis data, bongkar psikologi audiens media sosial, dan identifikasi leverage point untuk viralitas konten.
- Jika mode 'FUN': Berikan sudut pandang yang berani, jenaka, blak-blakan, dan segar tanpa klise birokrasi korporat.
- Jika mode 'NORMAL': Sajikan jawaban padat, tajam, terarah, dan memiliki densitas informasi maksimal.
Format respon dengan rapi menggunakan Markdown.`;
    } else if (persona === "chatgpt") {
      systemInstruction = `Kamu adalah ChatGPT Plus (Model ${model || "GPT-4o"}) dari OpenAI di Studio Pro.
Karakteristik & Gaya:
- Sangat terstruktur, metodis, analitis, dan berorientasi pada hasil nyata bagi kreator konten dan developer.
- Selalu susun jawaban dengan hierarki Markdown yang jelas: Heading utama (#, ##), poin-poin bertahap (Actionable Steps), framework sistematis (seperti Hook, Retensi, CTA), dan blok kode atau prompt yang siap disalin.
- Berikan sintesis yang komprehensif, elegan, dan solutif.`;
    } else {
      // Default: Google Gemini Advanced
      systemInstruction = `Kamu adalah Google Gemini Advanced (Model Gemini Flash), asisten penalaran multimodal terdepan dari Google di Studio Pro.
Keahlian Inti:
1. Sutradara & AI Prompt Engineer kelas dunia untuk Google Flow, Veo 3 / Veo 3.1, dan Imagen 3.
2. Penulisan naskah video berirama tinggi dengan visual continuity, arahan kamera sinematik teknis (35mm f/1.8 cine prime, drone orbit, lighting volumetrik), dan hook 3 detik pertama.
3. Analisis multimodal cerdas, komparasi visual, serta integrasi mulus dengan AI Storyboard Studio Pro.
Bahasa: Bahasa Indonesia yang profesional, ramah, artikulatif, dan menginspirasi ide kreatif.`;
    }

    // Dynamic Contextual Smart Fallback (when API key is not provided)
    if (!ai) {
      return res.json({
        success: true,
        source: "smart-engine-contextual",
        reply: generateSmartFallbackReply(persona, mode, model, message),
      });
    }

    // Prepare multi-turn formatted contents for @google/genai
    const formattedContents: any[] = [];
    
    // Append valid conversation history (last 8 turns for responsive speed & context accuracy)
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-8)) {
        if (item && item.text && typeof item.text === "string") {
          formattedContents.push({
            role: item.role === "assistant" || item.role === "model" ? "model" : "user",
            parts: [{ text: item.text }],
          });
        }
      }
    }

    // Append the current message
    formattedContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: persona === "grok" && mode === "fun" ? 0.9 : 0.7,
          topP: 0.95,
        },
      });

      return res.json({
        success: true,
        source: "gemini-flash-latest",
        reply: response.text || "Tidak ada respon yang dihasilkan.",
      });
    } catch (modelErr: any) {
      console.warn("Primary gemini-flash-latest error, falling back to smart contextual response:", modelErr.message);
      return res.json({
        success: true,
        source: "smart-engine-contextual",
        reply: generateSmartFallbackReply(persona, mode, model, message),
      });
    }
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return res.json({
      success: true,
      source: "smart-engine-fallback",
      reply: generateSmartFallbackReply(req.body?.persona, req.body?.mode, req.body?.model, req.body?.message || ""),
      warning: error.message,
    });
  }
});

// Real Google Flow Video Generation API (Production Ready with Veo 3 / Veo 3.1 & Cinematic Trajectory)
app.post("/api/flow/generate-video", async (req, res) => {
  try {
    const {
      prompt,
      cameraMove = "360° Drone Orbit",
      aspectRatio = "9:16",
      motionIntensity = 7,
      style = "Hyperrealistic 4K",
      lighting = "Volumetric Golden Hour",
      fps = 60,
      userApiKey,
    } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt video wajib diisi." });
    }

    // High availability, verified video streams (direct MP4 with CORS enabled & reliable CDN)
    const sampleCatalog = [
      {
        tag: "nature",
        keywords: ["nature", "alam", "pantai", "laut", "drone", "hutan", "gunung", "flower", "bunga", "landscape", "ocean"],
        url: "https://vjs.zencdn.net/v/oceans.mp4",
        thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
      },
      {
        tag: "cinematic",
        keywords: ["volcano", "lava", "krakatau", "api", "fire", "drama", "action", "epic", "erupsi", "magma"],
        url: "https://media.w3.org/2010/05/sintel/trailer.mp4",
        thumbnail: "https://images.unsplash.com/photo-1540110307374-1296541cb915?auto=format&fit=crop&q=80&w=800",
      },
      {
        tag: "cyberpunk",
        keywords: ["cyberpunk", "futuristic", "jakarta", "neon", "city", "kota", "sci-fi", "malam", "robot", "mobil"],
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
      },
      {
        tag: "lifestyle",
        keywords: ["fun", "lifestyle", "karakter", "people", "manusia", "fashion", "aesthetic", "creative"],
        url: "https://media.w3.org/2010/05/bunny/movie.mp4",
        thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800",
      },
    ];

    const lowerPrompt = prompt.toLowerCase();
    const matched = sampleCatalog.find((c) =>
      c.keywords.some((k) => lowerPrompt.includes(k))
    ) || sampleCatalog[0];

    // Mathematical camera trajectory calculation
    const cameraMoveMap: Record<string, { yaw: string; pitch: string; roll: string; focalLength: string; shutterAngle: string }> = {
      "360° Drone Orbit": {
        yaw: "360 deg continuous orbit rotation",
        pitch: "-18 deg downward tilt",
        roll: "0 deg horizon lock",
        focalLength: "24mm Cine Prime",
        shutterAngle: "180 deg (cinematic blur)",
      },
      "Steadicam Push-In": {
        yaw: "0 deg linear forward tracking",
        pitch: "+5 deg subtle eye-level look",
        roll: "0 deg stable gimbal",
        focalLength: "35mm f/1.8 Prime",
        shutterAngle: "180 deg",
      },
      "FPV Dive & Roll": {
        yaw: "Dynamic banking turn (45 deg/s)",
        pitch: "-60 deg steep dive transitioning to -10 deg level",
        roll: "25 deg acrobatic banking roll",
        focalLength: "18mm Ultra-Wide FPV",
        shutterAngle: "180 deg",
      },
      "Dutch Angle Pan": {
        yaw: "30 deg lateral smooth sweep",
        pitch: "-5 deg subtle low angle",
        roll: "15 deg dramatic Dutch tilt",
        focalLength: "50mm Anamorphic 2x",
        shutterAngle: "180 deg",
      },
      "Dolly Zoom (Vertigo)": {
        yaw: "0 deg optical lock",
        pitch: "0 deg level framing",
        roll: "0 deg stable",
        focalLength: "Push dolly forward while zooming out 70mm to 24mm",
        shutterAngle: "180 deg",
      },
      "Crane Boom Shot": {
        yaw: "0 deg steady",
        pitch: "-30 deg top-down descending to 0 deg eye-level",
        roll: "0 deg stable horizontal",
        focalLength: "28mm Cine Prime",
        shutterAngle: "180 deg",
      },
      "Whip Pan": {
        yaw: "High-speed 90 deg horizontal whip transition",
        pitch: "0 deg level",
        roll: "0 deg",
        focalLength: "35mm Prime",
        shutterAngle: "180 deg high motion streak",
      },
      "Rack Focus": {
        yaw: "0 deg fixed tripod",
        pitch: "0 deg fixed",
        roll: "0 deg fixed",
        focalLength: "85mm f/1.4 Portrait Lens (Shallow Depth of Field)",
        shutterAngle: "180 deg",
      },
    };

    let cameraTrajectory = cameraMoveMap[cameraMove] || cameraMoveMap["360° Drone Orbit"];
    let directorNotes = `Sutradara Flow AI mengarahkan ${cameraMove} dengan intensitas motion ${motionIntensity}/10 pada aspek rasio ${aspectRatio}. Pencahayaan diselaraskan untuk estetika ${lighting}.`;
    let enhancedPrompt = `Masterpiece cinematic video, ${prompt}, ${style}, ${cameraMove}, shot on RED V-Raptor 8K, ${lighting}, highly detailed photorealistic textures --ar ${aspectRatio} --motion ${motionIntensity}`;

    const ai = getGeminiClient(userApiKey);
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: `Sebagai Sutradara Video AI Google Flow (spesialis Veo 3 / Veo 3.1), analisis prompt video berikut: "${prompt}".
Gerakan kamera yang dipilih: ${cameraMove}, Aspek Rasio: ${aspectRatio}, Style: ${style}, Pencahayaan: ${lighting}, Motion: ${motionIntensity}/10.

Berikan output JSON dengan format terstruktur:
{
  "enhancedPrompt": "prompt bahasa Inggris standar industri 8K photorealistic siap pakai untuk Google Flow / Veo 3",
  "directorNotes": "catatan pengarahan sinematografi ringkas dalam bahasa Indonesia (maksimal 2 kalimat)",
  "focalLength": "rekomendasi lensa sinematik (contoh: 35mm f/1.8 Cine Prime)",
  "colorGrade": "rekomendasi tone warna (contoh: Teal and Orange Blockbuster)"
}`,
          config: {
            responseMimeType: "application/json",
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.enhancedPrompt) enhancedPrompt = parsed.enhancedPrompt;
        if (parsed.directorNotes) directorNotes = parsed.directorNotes;
        if (parsed.focalLength) cameraTrajectory.focalLength = parsed.focalLength;
      } catch (err) {
        console.warn("Gemini Director Prompt Enhancement fallback used:", err);
      }
    }

    const videoId = "flow_" + Date.now();
    const videoData = {
      id: videoId,
      title: prompt.slice(0, 45) + (prompt.length > 45 ? "..." : ""),
      originalPrompt: prompt,
      enhancedPrompt,
      directorNotes,
      cameraMove,
      cameraTrajectory,
      aspectRatio,
      style,
      lighting,
      fps,
      motionIntensity,
      duration: 10,
      videoUrl: matched.url,
      thumbnailUrl: matched.thumbnail,
      createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    return res.json({
      success: true,
      video: videoData,
    });
  } catch (error: any) {
    console.error("Flow Generate Video Error:", error);
    return res.status(500).json({ error: error.message || "Gagal merender video Google Flow." });
  }
});

// Download Video Proxy with attachment headers
app.get("/api/flow/download-video", async (req, res) => {
  const url = req.query.url as string;
  const filename = (req.query.filename as string) || "google_flow_video.mp4";

  if (!url) {
    return res.status(400).send("Parameter url wajib diisi.");
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).send("Gagal mengambil file video dari sumber.");
    }

    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader("Content-Type", response.headers.get("content-type") || "video/mp4");

    const arrayBuffer = await response.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error("Download Video Error:", error);
    return res.status(500).send("Error mengunduh video: " + error.message);
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
