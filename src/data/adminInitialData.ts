import {
  AdminMetricSummary,
  AdminProduct,
  AdminCourse,
  AdminTransaction,
  AdminSystemLog,
  ToolConfig,
} from '../types';
import { TOOLS_CONFIG } from '../components/Sidebar';

export const INITIAL_ADMIN_METRICS: AdminMetricSummary = {
  totalUsers: 4892,
  activeAccounts: 128,
  totalTransactions: 642,
  totalRevenue: 68450000, // Rp 68.450.000
  totalRenderedVideos: 14280,
  apiSuccessRate: 99.4,
};

export const INITIAL_ADMIN_PRODUCTS: AdminProduct[] = [
  {
    id: 'p1',
    title: '500+ Master Prompt Sinematik Google Flow & Sora',
    price: 99000,
    priceFormatted: 'Rp 99.000',
    category: 'Prompt Kit',
    sales: 1240,
    active: true,
    desc: 'Koleksi prompt visual level bioskop dengan konsistensi karakter, sudut kamera 35mm-85mm, dan preset lighting dramatis.',
    features: ['Stop-Motion Clay Preset', 'Cyberpunk & Sci-Fi Universe', 'Prompt Konsistensi Karakter'],
  },
  {
    id: 'p2',
    title: 'Top Up Sesi Flow Pro 500 Kredit (Aktif Instan)',
    price: 149000,
    priceFormatted: 'Rp 149.000',
    category: 'Akun & Kredit',
    sales: 2850,
    active: true,
    desc: 'Isi ulang kredit instan untuk akun Google Flow Anda. Render video tanpa antrean dan akses model resolusi 1080P/4K.',
    features: ['500 Kredit Siap Pakai', 'Masa Aktif 30 Hari', 'Garansi Re-Link Token'],
  },
  {
    id: 'p3',
    title: 'Mega Bundle Template CapCut & Voiceover Audio FX',
    price: 79000,
    priceFormatted: 'Rp 79.000',
    category: 'Template Video',
    sales: 980,
    active: true,
    desc: 'Paket lengkap transisi siap pakai, sound effect cinematic whoosh, dan musik background bebas copyright untuk konten TikTok.',
    features: ['30+ Template Timeline', '200+ Sound FX Bebas Royalti', 'LUT Grading Sinematik'],
  },
  {
    id: 'p4',
    title: 'Akses VIP Komunitas Kreator Studio Pro (Annual)',
    price: 349000,
    priceFormatted: 'Rp 349.000',
    category: 'Membership',
    sales: 412,
    active: true,
    desc: 'Mentoring mingguan, grup diskusi rahasia Telegram, akses dini model AI video terbaru, dan review portofolio bulanan.',
    features: ['Live Session Mingguan', 'Group Telegram Private', 'Early Access Veo 3.1 & Sora'],
  },
];

export const INITIAL_ADMIN_COURSES: AdminCourse[] = [
  {
    id: 'm1',
    title: 'Penguasaan Google Flow & Prompt Sinematik 8K',
    duration: '45 Menit',
    completed: true,
    category: 'Video AI',
    desc: 'Pelajari sintaks prompt camera movement (orbit, crane, tracking shot), konsistensi pencahayaan rim light, dan rasio aspek multiplatform.',
    studentCount: 2310,
  },
  {
    id: 'm2',
    title: 'Teknik Clay Animation & Stop-Motion Krakatau',
    duration: '60 Menit',
    completed: true,
    category: 'Animasi',
    desc: 'Eksplorasi gaya plastisin/claymation dengan konsistensi temporal antar frame serta transisi dramatis tanpa deformasi karakter.',
    studentCount: 1845,
  },
  {
    id: 'm3',
    title: 'Otomasi Storyboard dengan Gemini Flash Multimodal',
    duration: '50 Menit',
    completed: false,
    category: 'AI Engineering',
    desc: 'Integrasi API langsung, pembagian scene berurutan, visual continuity, hingga pembuatan naskah voiceover siap pakai.',
    studentCount: 1420,
  },
  {
    id: 'm4',
    title: 'Formula Hook 3 Detik & Affiliate Viral FYP TikTok',
    duration: '40 Menit',
    completed: false,
    category: 'Marketing',
    desc: 'Strategi psikologi audiens, kurasi kata kunci trending, dan pengemasan CTA konversi tinggi untuk konten affiliate.',
    studentCount: 3105,
  },
];

export const INITIAL_ADMIN_TRANSACTIONS: AdminTransaction[] = [
  {
    id: 'TRX-88219',
    userName: 'Budi Santoso',
    userEmail: 'budi.santoso@gmail.com',
    productTitle: 'Top Up Sesi Flow Pro 500 Kredit',
    amount: 149000,
    status: 'SUCCESS',
    date: '10 Sep 2026, 11:42',
    paymentMethod: 'QRIS BCA',
  },
  {
    id: 'TRX-88218',
    userName: 'Rina Wijaya',
    userEmail: 'rina.creative@yahoo.com',
    productTitle: '500+ Master Prompt Sinematik Google Flow',
    amount: 99000,
    status: 'SUCCESS',
    date: '10 Sep 2026, 10:15',
    paymentMethod: 'GoPay',
  },
  {
    id: 'TRX-88217',
    userName: 'Dimas Creator',
    userEmail: 'dimas.video@gmail.com',
    productTitle: 'Akses VIP Komunitas Kreator Studio Pro',
    amount: 349000,
    status: 'SUCCESS',
    date: '10 Sep 2026, 08:30',
    paymentMethod: 'Transfer Mandiri',
  },
  {
    id: 'TRX-88216',
    userName: 'Siti Nurhaliza',
    userEmail: 'siti.production@gmail.com',
    productTitle: 'Mega Bundle Template CapCut & Voiceover',
    amount: 79000,
    status: 'PENDING',
    date: '10 Sep 2026, 07:05',
    paymentMethod: 'OVO',
  },
  {
    id: 'TRX-88215',
    userName: 'Reza Art & VFX',
    userEmail: 'reza.vfx@gmail.com',
    productTitle: 'Top Up Sesi Flow Pro 500 Kredit',
    amount: 149000,
    status: 'SUCCESS',
    date: '09 Sep 2026, 22:50',
    paymentMethod: 'ShopeePay',
  },
];

export const INITIAL_ADMIN_LOGS: AdminSystemLog[] = [
  {
    id: 'log-1',
    timestamp: '10 Sep 2026, 12:20:15',
    level: 'info',
    module: 'Reverse Proxy',
    message: 'Header X-Frame-Options dinetralkan untuk target labs.google/fx/tools/flow.',
  },
  {
    id: 'log-2',
    timestamp: '10 Sep 2026, 12:18:40',
    level: 'success',
    module: 'Gemini Engine',
    message: 'Koneksi model gemini-flash-latest terverifikasi aktif (latensi: 210ms).',
  },
  {
    id: 'log-3',
    timestamp: '10 Sep 2026, 11:42:02',
    level: 'success',
    module: 'Digital Shop',
    message: 'Transaksi TRX-88219 (Rp 149.000) terkonfirmasi lunas via QRIS.',
  },
  {
    id: 'log-4',
    timestamp: '10 Sep 2026, 11:15:30',
    level: 'info',
    module: 'Multi-Account',
    message: 'Sesi akun "dracin (PRO)" dialihkan aktif dengan saldo 163 kredit.',
  },
  {
    id: 'log-5',
    timestamp: '10 Sep 2026, 10:05:12',
    level: 'info',
    module: 'PWA ServiceWorker',
    message: 'Precache manifest 19 aset selesai dimuat untuk operasi luring.',
  },
];

export function getInitialAdminTools(): Record<string, ToolConfig> {
  return { ...TOOLS_CONFIG };
}
