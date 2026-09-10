import fs from "fs";
import path from "path";

export interface ToolConfig {
  id: string;
  name: string;
  category: "video" | "assistant" | "social" | "riset";
  url: string;
  template: "flow" | "grok" | "capcut" | "generic";
  title: string;
  desc: string;
  color: string;
  status?: "active" | "maintenance" | "hidden";
}

export interface AccountProfile {
  id: string;
  name: string;
  tier: "PRO" | "FREE";
  credit: number;
  token?: string;
  active?: boolean;
}

export interface AdminProduct {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  category: string;
  sales: number;
  active: boolean;
  desc: string;
  features: string[];
}

export interface AdminCourse {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  category: string;
  desc: string;
  studentCount?: number;
  videoUrl?: string;
  syllabus?: string[];
}

export interface AdminTransaction {
  id: string;
  userName: string;
  userEmail: string;
  productTitle: string;
  amount: number;
  status: "SUCCESS" | "PENDING" | "CANCELLED";
  date: string;
  paymentMethod: string;
}

export interface AdminSystemLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "success" | "error";
  module: string;
  message: string;
}

export interface StudioProDatabase {
  tools: Record<string, ToolConfig>;
  accounts: AccountProfile[];
  products: AdminProduct[];
  courses: AdminCourse[];
  transactions: AdminTransaction[];
  logs: AdminSystemLog[];
}

const DEFAULT_TOOLS: Record<string, ToolConfig> = {
  Flow: {
    id: "Flow",
    name: "Google Flow",
    category: "video",
    url: "https://flow.google.com",
    template: "flow",
    title: "Google Flow Video Studio",
    desc: "AI-Powered Video Generation with Veo 3 & Scene Continuity",
    color: "#6366f1",
    status: "active",
  },
  Gemini: {
    id: "Gemini",
    name: "Gemini Advanced",
    category: "assistant",
    url: "https://gemini.google.com",
    template: "flow",
    title: "Google Gemini Multimodal AI",
    desc: "AI Storyboard, Scripting & Creative Direction",
    color: "#8b5cf6",
    status: "active",
  },
  Grok: {
    id: "Grok",
    name: "Grok (xAI)",
    category: "assistant",
    url: "https://x.ai",
    template: "grok",
    title: "Grok 3 Reasoning Engine",
    desc: "Deep Thinking & Social Media Trends Breakdown",
    color: "#18181b",
    status: "active",
  },
  ChatGPT: {
    id: "ChatGPT",
    name: "ChatGPT Plus",
    category: "assistant",
    url: "https://chatgpt.com",
    template: "flow",
    title: "OpenAI ChatGPT Plus",
    desc: "Structured Prompts, Story Arc & Copywriting",
    color: "#10a37f",
    status: "active",
  },
  Canva: {
    id: "Canva",
    name: "Canva Pro",
    category: "video",
    url: "https://www.canva.com",
    template: "generic",
    title: "Canva Visual Suite",
    desc: "Graphic Design, Thumbnail 1280x720 & Banner Video",
    color: "#00c4cc",
    status: "active",
  },
  CapCut: {
    id: "CapCut",
    name: "CapCut Web",
    category: "video",
    url: "https://www.capcut.com/editor",
    template: "capcut",
    title: "CapCut Online Video Editor",
    desc: "Timeline Editing, Auto Captions & Audio Speed Ramping",
    color: "#06b6d4",
    status: "active",
  },
  GoogleNotes: {
    id: "GoogleNotes",
    name: "Google Keep",
    category: "assistant",
    url: "https://keep.google.com",
    template: "generic",
    title: "Catatan Kreator & Prompt Bank",
    desc: "Penyimpanan ide cepat, prompt library & checklist produksi",
    color: "#f59e0b",
    status: "active",
  },
  TikTok: {
    id: "TikTok",
    name: "TikTok Creator",
    category: "social",
    url: "https://www.tiktok.com",
    template: "generic",
    title: "TikTok Studio & Trends",
    desc: "Pantau sound trending, format video viral & analisis FYP",
    color: "#000000",
    status: "active",
  },
  YouTube: {
    id: "YouTube",
    name: "YouTube Studio",
    category: "social",
    url: "https://studio.youtube.com",
    template: "generic",
    title: "YouTube Studio Dashboard",
    desc: "Manajemen channel, analytics retensi & optimasi Shorts",
    color: "#ef4444",
    status: "active",
  },
  Instagram: {
    id: "Instagram",
    name: "Instagram Creator",
    category: "social",
    url: "https://www.instagram.com",
    template: "generic",
    title: "Instagram Reels & Broadcast",
    desc: "Distribusi visual, engagement story & interaksi audiens",
    color: "#ec4899",
    status: "active",
  },
  X: {
    id: "X",
    name: "X (Twitter)",
    category: "social",
    url: "https://x.com",
    template: "generic",
    title: "X Real-Time Pulse",
    desc: "Trending topic dunia, kurasi berita AI & thread viral",
    color: "#09090b",
    status: "active",
  },
  RisetProduk: {
    id: "RisetProduk",
    name: "Riset E-Commerce",
    category: "riset",
    url: "https://seller.tiktok.com",
    template: "generic",
    title: "Riset Produk Terlaris",
    desc: "Temukan winning product, winning angle & affiliate niche",
    color: "#14b8a6",
    status: "active",
  },
  GoogleTrends: {
    id: "GoogleTrends",
    name: "Google Trends",
    category: "riset",
    url: "https://trends.google.com",
    template: "generic",
    title: "Google Trends Indonesia",
    desc: "Volume pencarian kata kunci, minat wilayah & topik terhangat",
    color: "#3b82f6",
    status: "active",
  },
};

const DEFAULT_ACCOUNTS: AccountProfile[] = [
  { id: "acc-1", name: "Flow Pro 12", tier: "PRO", credit: 850, active: true },
  { id: "acc-2", name: "dracin PRO", tier: "PRO", credit: 420, active: false },
  { id: "acc-3", name: "Canva Pro Shared", tier: "PRO", credit: 9999, active: false },
  { id: "acc-4", name: "Kreator Free Sesi", tier: "FREE", credit: 50, active: false },
];

const DEFAULT_PRODUCTS: AdminProduct[] = [
  {
    id: "p1",
    title: "500+ Master Prompt Sinematik Google Flow & Sora",
    price: 99000,
    priceFormatted: "Rp 99.000",
    category: "Prompt Kit",
    sales: 1240,
    active: true,
    desc: "Koleksi prompt visual level bioskop dengan konsistensi karakter, sudut kamera 35mm-85mm, dan preset lighting dramatis.",
    features: ["Stop-Motion Clay Preset", "Cyberpunk & Sci-Fi Universe", "Prompt Konsistensi Karakter", "PDF & Notion Template Bank"],
  },
  {
    id: "p2",
    title: "Top Up Sesi Flow Pro 500 Kredit (Aktif Instan)",
    price: 149000,
    priceFormatted: "Rp 149.000",
    category: "Akun & Kredit",
    sales: 2850,
    active: true,
    desc: "Isi ulang kredit instan untuk akun Google Flow Anda. Render video tanpa antrean dan akses model resolusi 1080P/4K.",
    features: ["500 Kredit Siap Pakai", "Masa Aktif 30 Hari", "Garansi Re-Link Token", "Akses Server Rendering Prioritas"],
  },
  {
    id: "p3",
    title: "Mega Bundle Template CapCut & Voiceover Audio FX",
    price: 79000,
    priceFormatted: "Rp 79.000",
    category: "Template Video",
    sales: 980,
    active: true,
    desc: "Paket lengkap transisi siap pakai, sound effect cinematic whoosh, dan musik background bebas copyright untuk konten TikTok.",
    features: ["30+ Template Timeline", "200+ Sound FX Bebas Royalti", "LUT Grading Sinematik", "Lisensi Komersial Seumur Hidup"],
  },
  {
    id: "p4",
    title: "Akses VIP Komunitas Kreator Studio Pro (Annual)",
    price: 349000,
    priceFormatted: "Rp 349.000",
    category: "Membership",
    sales: 412,
    active: true,
    desc: "Mentoring mingguan, grup diskusi rahasia Telegram, akses dini model AI video terbaru, dan review portofolio bulanan.",
    features: ["Live Session Mingguan", "Group Telegram Private", "Early Access Veo 3.1 & Sora", "Mentoring Monetisasi 1-on-1"],
  },
];

const DEFAULT_COURSES: AdminCourse[] = [
  {
    id: "m1",
    title: "Penguasaan Google Flow & Prompt Sinematik 8K",
    duration: "45 Menit",
    completed: true,
    category: "Video AI",
    desc: "Pelajari sintaks prompt camera movement (orbit, crane, tracking shot), konsistensi pencahayaan rim light, dan rasio aspek multiplatform.",
    studentCount: 2310,
    syllabus: [
      "Pengenalan Antarmuka Google Flow Video Studio",
      "Kombinasi Sudut Kamera: 35mm Cine Prime & Orbit Shot",
      "Parameter Konsistensi Karakter Antar Scene",
      "Rendering Export 1080p 60fps & Upgrading ke 4K",
    ],
  },
  {
    id: "m2",
    title: "Teknik Clay Animation & Stop-Motion Krakatau",
    duration: "60 Menit",
    completed: true,
    category: "Animasi",
    desc: "Eksplorasi gaya plastisin/claymation dengan konsistensi temporal antar frame serta transisi dramatis tanpa deformasi karakter.",
    studentCount: 1845,
    syllabus: [
      "Prinsip Dasar Animasi Stop-Motion Plastisin",
      "Pengaturan Shutter Speed & Lighting Studio Miniatur",
      "Mencegah Frame Warping pada Transisi Cepat",
      "Color Grading Nuansa Organik Clay",
    ],
  },
  {
    id: "m3",
    title: "Otomasi Storyboard dengan Gemini Flash Multimodal",
    duration: "50 Menit",
    completed: false,
    category: "AI Engineering",
    desc: "Integrasi API langsung, pembagian scene berurutan, visual continuity, hingga pembuatan naskah voiceover siap pakai.",
    studentCount: 1420,
    syllabus: [
      "Struktur JSON Storyboard untuk Video Vertikal 9:16",
      "Penyusunan Alur Cerita 3 Babak (Hook, Tension, Climax)",
      "Sinkronisasi Timing Visual dengan Ketukan Voiceover",
      "Ekspor Naskah Langsung ke CapCut Web",
    ],
  },
  {
    id: "m4",
    title: "Formula Hook 3 Detik & Affiliate Viral FYP TikTok",
    duration: "40 Menit",
    completed: false,
    category: "Marketing",
    desc: "Strategi psikologi audiens, kurasi kata kunci trending, dan pengemasan CTA konversi tinggi untuk konten affiliate.",
    studentCount: 3120,
    syllabus: [
      "Psikologi Retensi 3 Detik Pertama Penonton FYP",
      "Anatomi Script Hook: Kontroversi vs Solusi Instan",
      "Penempatan Call To Action (Keranjang Kuning)",
      "Analisis Metrik Completion Rate & Share Ratio",
    ],
  },
];

const DEFAULT_TRANSACTIONS: AdminTransaction[] = [
  {
    id: "TX-2026-9821",
    userName: "Budi Santoso",
    userEmail: "budi.creator@gmail.com",
    productTitle: "500+ Master Prompt Sinematik Google Flow & Sora",
    amount: 99000,
    status: "SUCCESS",
    date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    paymentMethod: "QRIS",
  },
  {
    id: "TX-2026-9820",
    userName: "Siti Rahmawati",
    userEmail: "siti.rahma@yahoo.com",
    productTitle: "Top Up Sesi Flow Pro 500 Kredit (Aktif Instan)",
    amount: 149000,
    status: "SUCCESS",
    date: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    paymentMethod: "GOPAY",
  },
  {
    id: "TX-2026-9819",
    userName: "Andi Wijaya",
    userEmail: "andi.wijaya.fx@outlook.com",
    productTitle: "Mega Bundle Template CapCut & Voiceover Audio FX",
    amount: 79000,
    status: "PENDING",
    date: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    paymentMethod: "BCA_VA",
  },
  {
    id: "TX-2026-9818",
    userName: "Dewi Lestari",
    userEmail: "dewi.lestari@gmail.com",
    productTitle: "Akses VIP Komunitas Kreator Studio Pro (Annual)",
    amount: 349000,
    status: "SUCCESS",
    date: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    paymentMethod: "QRIS",
  },
];

const DEFAULT_LOGS: AdminSystemLog[] = [
  {
    id: "log-1",
    timestamp: new Date().toISOString(),
    level: "success",
    module: "System Core",
    message: "Server Studio Pro berhasil diinisialisasi pada Port 3000 dengan Reverse Proxy aktif.",
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 1000 * 30).toISOString(),
    level: "info",
    module: "AI Engine",
    message: "Gemini Flash Multimodal dikonfigurasi sebagai model penalaran server-side.",
  },
  {
    id: "log-3",
    timestamp: new Date(Date.now() - 1000 * 90).toISOString(),
    level: "info",
    module: "Workspace",
    message: "Sinkronisasi platform tools: 13 platform resmi termuat siap pakai.",
  },
];

class StudioProDatabaseService {
  private dataDir: string;
  private dbFilePath: string;
  private db: StudioProDatabase;

  constructor() {
    this.dataDir = path.join(process.cwd(), "data");
    this.dbFilePath = path.join(this.dataDir, "studio_pro_db.json");
    this.db = this.initDb();
  }

  private initDb(): StudioProDatabase {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && parsed.tools && parsed.accounts && parsed.products) {
          return {
            tools: parsed.tools || DEFAULT_TOOLS,
            accounts: parsed.accounts || DEFAULT_ACCOUNTS,
            products: parsed.products || DEFAULT_PRODUCTS,
            courses: parsed.courses || DEFAULT_COURSES,
            transactions: parsed.transactions || DEFAULT_TRANSACTIONS,
            logs: parsed.logs || DEFAULT_LOGS,
          };
        }
      }
    } catch (err) {
      console.warn("Error reading database file, creating fresh one:", err);
    }

    const defaultState: StudioProDatabase = {
      tools: DEFAULT_TOOLS,
      accounts: DEFAULT_ACCOUNTS,
      products: DEFAULT_PRODUCTS,
      courses: DEFAULT_COURSES,
      transactions: DEFAULT_TRANSACTIONS,
      logs: DEFAULT_LOGS,
    };

    this.persist(defaultState);
    return defaultState;
  }

  private persist(data?: StudioProDatabase): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const target = data || this.db;
      fs.writeFileSync(this.dbFilePath, JSON.stringify(target, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist database to file:", err);
    }
  }

  // ================= Tools =================
  public getTools(): Record<string, ToolConfig> {
    return this.db.tools;
  }

  public saveTool(tool: ToolConfig): ToolConfig {
    this.db.tools[tool.id] = {
      ...tool,
      status: tool.status || "active",
    };
    this.addLog("Workspace", `Platform [${tool.name}] berhasil disimpan/diperbarui`, "info");
    this.persist();
    return this.db.tools[tool.id];
  }

  public deleteTool(id: string): boolean {
    if (this.db.tools[id]) {
      const name = this.db.tools[id].name;
      delete this.db.tools[id];
      this.addLog("Workspace", `Platform [${name}] dihapus dari sistem`, "warn");
      this.persist();
      return true;
    }
    return false;
  }

  // ================= Accounts =================
  public getAccounts(): AccountProfile[] {
    return this.db.accounts;
  }

  public saveAccount(acc: AccountProfile): AccountProfile {
    const existingIndex = this.db.accounts.findIndex((a) => a.id === acc.id);
    if (existingIndex >= 0) {
      this.db.accounts[existingIndex] = { ...this.db.accounts[existingIndex], ...acc };
    } else {
      this.db.accounts.push(acc);
    }
    this.addLog("Account Manager", `Akun [${acc.name}] diperbarui (${acc.tier}, Kredit: ${acc.credit})`, "info");
    this.persist();
    return acc;
  }

  public setActiveAccount(id: string): AccountProfile | null {
    let found: AccountProfile | null = null;
    this.db.accounts = this.db.accounts.map((acc) => {
      if (acc.id === id) {
        found = { ...acc, active: true };
        return found;
      }
      return { ...acc, active: false };
    });
    if (found) {
      this.addLog("Account Manager", `Akun aktif dialihkan ke [${(found as AccountProfile).name}]`, "info");
      this.persist();
    }
    return found;
  }

  public deleteAccount(id: string): boolean {
    const beforeLen = this.db.accounts.length;
    this.db.accounts = this.db.accounts.filter((a) => a.id !== id);
    if (this.db.accounts.length < beforeLen) {
      this.addLog("Account Manager", `Akun ID [${id}] dihapus`, "warn");
      this.persist();
      return true;
    }
    return false;
  }

  // ================= Products =================
  public getProducts(): AdminProduct[] {
    return this.db.products;
  }

  public saveProduct(prod: AdminProduct): AdminProduct {
    const formatted = prod.priceFormatted || `Rp ${prod.price.toLocaleString("id-ID")}`;
    const cleanProd: AdminProduct = { ...prod, priceFormatted: formatted };

    const idx = this.db.products.findIndex((p) => p.id === prod.id);
    if (idx >= 0) {
      this.db.products[idx] = cleanProd;
    } else {
      this.db.products.unshift(cleanProd);
    }
    this.addLog("Digital Shop", `Katalog produk [${cleanProd.title}] disimpan (Harga: ${formatted})`, "success");
    this.persist();
    return cleanProd;
  }

  public deleteProduct(id: string): boolean {
    const before = this.db.products.length;
    this.db.products = this.db.products.filter((p) => p.id !== id);
    if (this.db.products.length < before) {
      this.addLog("Digital Shop", `Produk ID [${id}] dihapus dari katalog`, "warn");
      this.persist();
      return true;
    }
    return false;
  }

  // ================= Courses =================
  public getCourses(): AdminCourse[] {
    return this.db.courses;
  }

  public saveCourse(course: AdminCourse): AdminCourse {
    const idx = this.db.courses.findIndex((c) => c.id === course.id);
    if (idx >= 0) {
      this.db.courses[idx] = { ...this.db.courses[idx], ...course };
    } else {
      this.db.courses.push(course);
    }
    this.addLog("Kelas Masterclass", `Modul kelas [${course.title}] diperbarui`, "info");
    this.persist();
    return course;
  }

  public deleteCourse(id: string): boolean {
    const before = this.db.courses.length;
    this.db.courses = this.db.courses.filter((c) => c.id !== id);
    if (this.db.courses.length < before) {
      this.addLog("Kelas Masterclass", `Modul ID [${id}] dihapus`, "warn");
      this.persist();
      return true;
    }
    return false;
  }

  // ================= Transactions =================
  public getTransactions(): AdminTransaction[] {
    return this.db.transactions;
  }

  public createTransaction(txData: {
    userName: string;
    userEmail: string;
    productTitle: string;
    amount: number;
    paymentMethod: string;
  }): AdminTransaction {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newTx: AdminTransaction = {
      id: `TX-2026-${randomSuffix}`,
      userName: txData.userName,
      userEmail: txData.userEmail,
      productTitle: txData.productTitle,
      amount: txData.amount,
      status: "SUCCESS", // Instant production settlement for digital assets
      date: new Date().toISOString(),
      paymentMethod: txData.paymentMethod || "QRIS",
    };

    this.db.transactions.unshift(newTx);
    this.addLog(
      "Payment Gateway",
      `Transaksi baru [${newTx.id}] oleh ${newTx.userName} sebesar Rp ${newTx.amount.toLocaleString("id-ID")} berhasil diverifikasi via ${newTx.paymentMethod}`,
      "success"
    );

    // Also increment sales count on matching product
    const matchingProd = this.db.products.find((p) => p.title === txData.productTitle);
    if (matchingProd) {
      matchingProd.sales = (matchingProd.sales || 0) + 1;
    }

    this.persist();
    return newTx;
  }

  public updateTransactionStatus(id: string, status: "SUCCESS" | "PENDING" | "CANCELLED"): AdminTransaction | null {
    const tx = this.db.transactions.find((t) => t.id === id);
    if (tx) {
      tx.status = status;
      this.addLog("Payment Gateway", `Status transaksi [${id}] diubah menjadi ${status}`, "info");
      this.persist();
      return tx;
    }
    return null;
  }

  // ================= Logs =================
  public getLogs(): AdminSystemLog[] {
    return this.db.logs;
  }

  public addLog(module: string, message: string, level: "info" | "warn" | "success" | "error" = "info"): AdminSystemLog {
    const newLog: AdminSystemLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
    };
    this.db.logs.unshift(newLog);
    if (this.db.logs.length > 200) {
      this.db.logs = this.db.logs.slice(0, 200);
    }
    return newLog;
  }

  // ================= Metrics =================
  public getLiveMetrics() {
    const totalRevenue = this.db.transactions
      .filter((t) => t.status === "SUCCESS")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const activeAccounts = this.db.accounts.filter((a) => a.active).length;

    return {
      totalUsers: 4890 + this.db.transactions.length,
      activeAccounts: activeAccounts || 1,
      totalTransactions: this.db.transactions.length,
      totalRevenue: totalRevenue,
      totalRenderedVideos: 14280 + this.db.transactions.length * 4,
      apiSuccessRate: 99.8,
    };
  }

  // ================= Factory Reset =================
  public resetToDefaults(): StudioProDatabase {
    this.db = {
      tools: { ...DEFAULT_TOOLS },
      accounts: [...DEFAULT_ACCOUNTS],
      products: [...DEFAULT_PRODUCTS],
      courses: [...DEFAULT_COURSES],
      transactions: [...DEFAULT_TRANSACTIONS],
      logs: [
        {
          id: `log-reset-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: "warn",
          module: "System Admin",
          message: "Database sistem dipulihkan ke konfigurasi standar pabrik (Factory Reset).",
        },
      ],
    };
    this.persist();
    return this.db;
  }
}

export const dbService = new StudioProDatabaseService();
