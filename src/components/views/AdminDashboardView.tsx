import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Globe,
  Users,
  ShoppingBag,
  GraduationCap,
  FileText,
  Activity,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Upload,
  RefreshCw,
  RotateCcw,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  CreditCard,
  Sliders,
  DollarSign,
  Server,
  Sparkles,
} from 'lucide-react';
import {
  User,
  AccountProfile,
  ToolConfig,
  AdminMetricSummary,
  AdminProduct,
  AdminCourse,
  AdminTransaction,
  AdminSystemLog,
} from '../../types';
import { STORAGE_KEYS } from '../../lib/supabase';
import {
  INITIAL_ADMIN_METRICS,
  INITIAL_ADMIN_PRODUCTS,
  INITIAL_ADMIN_COURSES,
  INITIAL_ADMIN_TRANSACTIONS,
  INITIAL_ADMIN_LOGS,
} from '../../data/adminInitialData';

interface AdminDashboardViewProps {
  currentUser: User;
  tools: Record<string, ToolConfig>;
  onUpdateTools: (updatedTools: Record<string, ToolConfig>) => void;
  accounts: AccountProfile[];
  onUpdateAccounts: (updatedAccounts: AccountProfile[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onSwitchToWorkspace: (toolId?: string) => void;
}

type AdminTab = 'overview' | 'tools' | 'accounts' | 'products' | 'courses' | 'transactions' | 'logs';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  tools,
  onUpdateTools,
  accounts,
  onUpdateAccounts,
  onShowToast,
  onSwitchToWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Metrics State
  const [metrics, setMetrics] = useState<AdminMetricSummary>(INITIAL_ADMIN_METRICS);

  // Products State
  const [products, setProducts] = useState<AdminProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ADMIN_PRODUCTS;
  });

  // Courses State
  const [courses, setCourses] = useState<AdminCourse[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_COURSES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ADMIN_COURSES;
  });

  // Transactions State
  const [transactions, setTransactions] = useState<AdminTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ADMIN_TRANSACTIONS;
  });

  // Logs State
  const [logs, setLogs] = useState<AdminSystemLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ADMIN_LOGS;
  });

  // Server Health State
  const [serverHealth, setServerHealth] = useState<{
    status: string;
    uptimeSeconds: number;
    memoryUsageMB?: { rss: number; heapUsed: number };
    geminiStatus?: { configured: boolean; model: string };
    latencyMs?: number;
  }>({
    status: 'checking',
    uptimeSeconds: 0,
  });
  const [isHealthChecking, setIsHealthChecking] = useState(false);

  // Search filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form States
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Partial<ToolConfig> | null>(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Partial<AccountProfile> | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<AdminProduct> | null>(null);

  // ==========================================
  // REAL FULLSTACK PERSISTENT API LOADERS
  // ==========================================

  const fetchLiveMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch {
      // ignore
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        localStorage.setItem(STORAGE_KEYS.ADMIN_PRODUCTS, JSON.stringify(data));
      }
    } catch {
      // ignore
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        localStorage.setItem(STORAGE_KEYS.ADMIN_COURSES, JSON.stringify(data));
      }
    } catch {
      // ignore
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
        localStorage.setItem(STORAGE_KEYS.ADMIN_TRANSACTIONS, JSON.stringify(data));
      }
    } catch {
      // ignore
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
        localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(data));
      }
    } catch {
      // ignore
    }
  };

  const fetchToolsAndAccounts = async () => {
    try {
      const resTools = await fetch('/api/tools');
      if (resTools.ok) {
        const dataTools = await resTools.json();
        onUpdateTools(dataTools);
      }
      const resAcc = await fetch('/api/accounts');
      if (resAcc.ok) {
        const dataAcc = await resAcc.json();
        onUpdateAccounts(dataAcc);
      }
    } catch {
      // ignore
    }
  };

  const addLog = async (level: 'info' | 'warn' | 'success' | 'error', module: string, message: string) => {
    const newLog: AdminSystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level,
      module,
      message,
    };
    const updated = [newLog, ...logs.slice(0, 49)];
    setLogs(updated);
    localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(updated));

    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, module, message }),
      });
    } catch {
      // ignore
    }
  };

  // Fetch Server Health
  const fetchServerStats = async () => {
    setIsHealthChecking(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/admin/system-stats');
      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        setServerHealth({
          status: data.status,
          uptimeSeconds: data.uptimeSeconds,
          memoryUsageMB: data.memoryUsageMB,
          geminiStatus: data.geminiStatus,
          latencyMs,
        });
        addLog('success', 'Health Check', `Server normal. Latensi: ${latencyMs}ms. Model: ${data.geminiStatus?.model}`);
      } else {
        setServerHealth((prev) => ({ ...prev, status: 'warning', latencyMs }));
      }
    } catch {
      setServerHealth((prev) => ({ ...prev, status: 'offline' }));
      addLog('error', 'Health Check', 'Gagal menghubungi server endpoint /api/admin/system-stats.');
    } finally {
      setIsHealthChecking(false);
    }
  };

  useEffect(() => {
    fetchServerStats();
    fetchLiveMetrics();
    fetchProducts();
    fetchCourses();
    fetchTransactions();
    fetchLogs();
    fetchToolsAndAccounts();
  }, []);

  // Tool Management Handlers with Persistent Backend
  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool || !editingTool.id || !editingTool.name || !editingTool.url) {
      onShowToast('ID, Nama, dan URL Tool wajib diisi.', 'error');
      return;
    }

    const toolObj: ToolConfig = {
      id: editingTool.id,
      name: editingTool.name,
      category: editingTool.category || 'video',
      url: editingTool.url,
      template: editingTool.template || 'generic',
      title: editingTool.title || `${editingTool.name} Workspace`,
      desc: editingTool.desc || 'Platform terintegrasi di Studio Pro.',
      color: editingTool.color || 'purple',
      status: editingTool.status || 'active',
    };

    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolObj),
      });
      if (res.ok) {
        const updatedTools = { ...tools, [toolObj.id]: toolObj };
        onUpdateTools(updatedTools);
        localStorage.setItem(STORAGE_KEYS.ADMIN_TOOLS, JSON.stringify(updatedTools));
        addLog('success', 'Tool Config', `Platform "${toolObj.name}" (${toolObj.id}) berhasil disimpan.`);
        onShowToast(`Platform "${toolObj.name}" berhasil disimpan ke server database!`, 'success');
      }
    } catch {
      onShowToast('Gagal menyimpan platform ke server.', 'error');
    }
    setIsToolModalOpen(false);
    setEditingTool(null);
  };

  const handleDeleteTool = async (toolId: string) => {
    if (Object.keys(tools).length <= 1) {
      onShowToast('Minimal satu tool harus tetap ada.', 'error');
      return;
    }
    if (confirm(`Hapus tool "${tools[toolId]?.name}" dari workspace?`)) {
      try {
        const res = await fetch(`/api/tools/${toolId}`, { method: 'DELETE' });
        if (res.ok) {
          const updated = { ...tools };
          const toolName = updated[toolId]?.name;
          delete updated[toolId];
          onUpdateTools(updated);
          localStorage.setItem(STORAGE_KEYS.ADMIN_TOOLS, JSON.stringify(updated));
          addLog('warn', 'Tool Config', `Platform "${toolName}" dihapus dari daftar aktif.`);
          onShowToast(`Tool "${toolName}" dihapus dari server database.`, 'info');
        }
      } catch {
        onShowToast('Gagal menghapus tool dari server.', 'error');
      }
    }
  };

  // Account Management Handlers with Persistent Backend
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !editingAccount.name) {
      onShowToast('Nama profil akun wajib diisi.', 'error');
      return;
    }

    const accObj: AccountProfile = {
      id: editingAccount.id || `acc_${Date.now()}`,
      name: editingAccount.name,
      tier: editingAccount.tier || 'PRO',
      credit: Number(editingAccount.credit) || 200,
      active: editingAccount.active ?? false,
    };

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accObj),
      });
      if (res.ok) {
        const updated = accounts.some((a) => a.id === accObj.id)
          ? accounts.map((a) => (a.id === accObj.id ? accObj : a))
          : [...accounts, accObj];
        onUpdateAccounts(updated);
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
        addLog('success', 'Account Mgr', `Akun sesi "${accObj.name}" berhasil disimpan.`);
        onShowToast(`Akun "${accObj.name}" berhasil disimpan ke server database!`, 'success');
        fetchLiveMetrics();
      }
    } catch {
      onShowToast('Gagal menyimpan akun ke server.', 'error');
    }
    setIsAccountModalOpen(false);
    setEditingAccount(null);
  };

  const handleDeleteAccount = async (accId: string) => {
    if (accounts.length <= 1) {
      onShowToast('Minimal satu profil akun harus tetap ada.', 'error');
      return;
    }
    if (confirm('Hapus profil akun ini?')) {
      try {
        const res = await fetch(`/api/accounts/${accId}`, { method: 'DELETE' });
        if (res.ok) {
          const updated = accounts.filter((a) => a.id !== accId);
          onUpdateAccounts(updated);
          localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
          addLog('warn', 'Account Mgr', `Profil akun ID ${accId} dihapus.`);
          onShowToast('Profil akun dihapus dari server database.', 'info');
          fetchLiveMetrics();
        }
      } catch {
        onShowToast('Gagal menghapus akun dari server.', 'error');
      }
    }
  };

  // Product Management Handlers with Persistent Backend
  const handleToggleProduct = async (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const updated = { ...prod, active: !prod.active };
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setProducts((prev) => prev.map((p) => (p.id === prodId ? updated : p)));
        onShowToast(`Status produk "${prod.title}" diperbarui.`, 'info');
      }
    } catch {
      onShowToast('Gagal memperbarui status produk.', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.title || !editingProduct.price) {
      onShowToast('Judul dan harga produk wajib diisi.', 'error');
      return;
    }

    const formattedPrice = `Rp ${Number(editingProduct.price).toLocaleString('id-ID')}`;
    const productData: AdminProduct = {
      id: editingProduct.id || `p_${Date.now()}`,
      title: editingProduct.title,
      price: Number(editingProduct.price),
      priceFormatted: formattedPrice,
      category: editingProduct.category || 'Prompt Kit',
      sales: editingProduct.sales ?? 0,
      active: editingProduct.active ?? true,
      desc: editingProduct.desc || 'Aset digital berkualitas tinggi untuk kreator.',
      features: editingProduct.features || ['Lisensi Komersial', 'Panduan Penggunaan', 'Akses Langsung'],
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (res.ok) {
        const saved = await res.json();
        setProducts((prev) => {
          const exists = prev.some((p) => p.id === saved.id);
          return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
        });
        addLog('success', 'Shop Catalog', `Produk "${productData.title}" disimpan.`);
        onShowToast(`Produk "${productData.title}" berhasil disimpan ke server database!`, 'success');
        fetchLiveMetrics();
      }
    } catch {
      onShowToast('Gagal menyimpan produk ke server.', 'error');
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (confirm('Hapus produk ini dari katalog?')) {
      try {
        const res = await fetch(`/api/products/${prodId}`, { method: 'DELETE' });
        if (res.ok) {
          setProducts((prev) => prev.filter((p) => p.id !== prodId));
          addLog('warn', 'Shop Catalog', `Produk ID ${prodId} dihapus.`);
          onShowToast('Produk dihapus dari database server.', 'info');
          fetchLiveMetrics();
        }
      } catch {
        onShowToast('Gagal menghapus produk.', 'error');
      }
    }
  };

  // Course Management Handlers with Persistent Backend
  const handleToggleCourse = async (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    const updated = { ...course, completed: !course.completed };
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)));
        onShowToast('Status modul kelas berhasil diperbarui.', 'info');
      }
    } catch {
      onShowToast('Gagal memperbarui status kelas.', 'error');
    }
  };

  const handleAddCourse = async (title: string) => {
    const newCourse: AdminCourse = {
      id: `m_${Date.now()}`,
      title,
      duration: '45 Menit',
      completed: false,
      category: 'Video AI',
      desc: 'Materi teknik produksi video sinematik dengan AI terkini.',
      studentCount: 100,
    };
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });
      if (res.ok) {
        const saved = await res.json();
        setCourses((prev) => [...prev, saved]);
        addLog('success', 'Kurikulum', `Modul kelas "${title}" ditambahkan.`);
        onShowToast(`Modul "${title}" berhasil disimpan ke server!`, 'success');
      }
    } catch {
      onShowToast('Gagal menambahkan modul kelas.', 'error');
    }
  };

  // Transaction Status Toggle with Persistent Backend
  const handleToggleTransactionStatus = async (trxId: string) => {
    const trx = transactions.find((t) => t.id === trxId);
    if (!trx) return;
    const nextStatus = trx.status === 'SUCCESS' ? 'PENDING' : 'SUCCESS';
    try {
      const res = await fetch(`/api/transactions/${trxId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === trxId ? { ...t, status: nextStatus } : t))
        );
        addLog('info', 'Transaksi', `Status ${trxId} diubah ke ${nextStatus}.`);
        onShowToast(`Status transaksi diperbarui ke ${nextStatus}!`, 'success');
        fetchLiveMetrics();
      }
    } catch {
      onShowToast('Gagal memperbarui status transaksi di server.', 'error');
    }
  };

  // Factory Reset Handler
  const handleFactoryReset = async () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh database studio ke setelan standar produksi?')) {
      try {
        const res = await fetch('/api/admin/reset-default', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          onShowToast(data.message || 'Database berhasil direset ke standar produksi.', 'success');
          // Reload everything
          fetchServerStats();
          fetchLiveMetrics();
          fetchProducts();
          fetchCourses();
          fetchTransactions();
          fetchLogs();
          fetchToolsAndAccounts();
        }
      } catch {
        onShowToast('Gagal mereset database server.', 'error');
      }
    }
  };

  // Export Full Configuration
  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      adminEmail: currentUser.email,
      tools,
      accounts,
      products,
      courses,
      transactions,
      logs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studiopro_admin_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('info', 'Backup', 'Ekspor konfigurasi backup berhasil diunduh.');
    onShowToast('File backup konfigurasi berhasil diekspor!', 'success');
  };

  // Format IDR Currency
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const toolsList = Object.values(tools);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950 text-zinc-100 select-text">
      {/* Top Admin Header Bar */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">
                Pusat Kontrol & Manajemen Admin
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-950 text-purple-300 border border-purple-800">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Pengelola sistem: <span className="font-semibold text-zinc-300">{currentUser.email}</span>
            </p>
          </div>
        </div>

        {/* Global Quick Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchServerStats}
            disabled={isHealthChecking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition border border-zinc-700"
            title="Cek Status Server & Gemini Model"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isHealthChecking ? 'animate-spin text-purple-400' : ''}`} />
            <span className="hidden sm:inline">Uji Sistem</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-bold transition border border-purple-500/30 shadow-xs"
            title="Ekspor Backup Semua Konfigurasi"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor JSON</span>
          </button>

          <button
            onClick={handleFactoryReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white text-xs font-bold transition border border-red-800/50 shadow-xs"
            title="Reset Database ke Standar Produksi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Standar</span>
          </button>
        </div>
      </div>

      {/* Admin Secondary Navigation Tabs */}
      <div className="bg-zinc-900 border-b border-zinc-800/80 px-4 md:px-8 flex items-center gap-1 overflow-x-auto scrollbar-none flex-shrink-0">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Ringkasan Metrik</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'tools'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Kelola Platform ({toolsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'accounts'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Akun & Sesi ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Produk Shop ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'courses'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Kelas Kreator ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Pesanan ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Log Audit ({logs.length})</span>
        </button>
      </div>

      {/* Main Admin Scrollable Canvas */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto pb-24">
        
        {/* ======================================================== */}
        {/* TAB 1: RINGKASAN & METRIK */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">Total Pendapatan</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-xl md:text-2xl font-black text-white">{formatIDR(metrics.totalRevenue)}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>+18.4% dari bulan lalu</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">Pengguna Terdaftar</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-xl md:text-2xl font-black text-white">{metrics.totalUsers.toLocaleString()}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-purple-400">
                    <span>{metrics.activeAccounts} Akun PRO aktif</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">Video Render Flow AI</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-xl md:text-2xl font-black text-white">{metrics.totalRenderedVideos.toLocaleString()}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-blue-400">
                    <span>Veo 3.1 & Model Sinematik</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">Keandalan API & Proxy</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-xl md:text-2xl font-black text-white">{metrics.apiSuccessRate}%</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400">
                    <span>0 Insiden Downtime</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Server Status Widget & Live Health */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Server className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Status Infrastruktur & Layanan AI</h3>
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-full text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Semua Sistem Normal
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-800/80">
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-[11px] text-zinc-500 font-semibold block mb-1">Model AI Utama</span>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-zinc-200">
                      {serverHealth.geminiStatus?.model || 'gemini-flash-latest'}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
                    {serverHealth.latencyMs ? `Respon: ${serverHealth.latencyMs}ms` : 'Terhubung & Aktif'}
                  </span>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-[11px] text-zinc-500 font-semibold block mb-1">Smart Reverse Proxy</span>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-zinc-200">Bypass Header & Anti-Framing</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Port 3000 Ingress Normal
                  </span>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-[11px] text-zinc-500 font-semibold block mb-1">Penggunaan Memori Heap</span>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-zinc-200">
                      {serverHealth.memoryUsageMB?.heapUsed ? `${serverHealth.memoryUsageMB.heapUsed} MB` : 'Optimal'}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Uptime: {Math.floor(serverHealth.uptimeSeconds / 60)} menit
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links & Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-950/40 to-indigo-950/30 border border-purple-800/40 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-white mb-1">Kelola Platform & Tool URL</h4>
                <p className="text-xs text-zinc-400 mb-4">
                  Perbarui URL target Google Flow, Gemini, ChatGPT, Canva, atau tambah platform video AI baru ke workspace.
                </p>
                <button
                  onClick={() => setActiveTab('tools')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                >
                  <span>Buka Kelola Platform</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-gradient-to-br from-emerald-950/40 to-zinc-900 border border-emerald-800/40 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-white mb-1">Kelola Akun Bersama & Sesi PRO</h4>
                <p className="text-xs text-zinc-400 mb-4">
                  Alokasikan kuota kredit Flow Pro, Canva Pro Shared, dan atur akun aktif untuk tim atau anggota.
                </p>
                <button
                  onClick={() => setActiveTab('accounts')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <span>Buka Kelola Akun</span>
                  <Users className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: KELOLA PLATFORM & TOOLS WORKSPACE */}
        {/* ======================================================== */}
        {activeTab === 'tools' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Platform & Tool Workspace</h2>
                <p className="text-xs text-zinc-400">
                  Kelola tautan resmi yang diakses pada panel workspace Studio Pro.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingTool({
                    id: `tool_${Date.now()}`,
                    name: '',
                    category: 'video',
                    url: 'https://',
                    template: 'generic',
                    title: '',
                    desc: '',
                    color: 'purple',
                    status: 'active',
                  });
                  setIsToolModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Platform Baru</span>
              </button>
            </div>

            {/* Tools Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="p-4">Nama Platform</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">URL Resmi</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {toolsList.map((tool) => (
                      <tr key={tool.id} className="hover:bg-zinc-800/40 transition">
                        <td className="p-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{tool.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">({tool.id})</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-1">{tool.desc}</p>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 font-medium text-zinc-300 capitalize text-[10px]">
                            {tool.category}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-purple-300 truncate max-w-xs">
                          {tool.url}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Aktif
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onSwitchToWorkspace(tool.id)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                              title="Buka di Workspace"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingTool(tool);
                                setIsToolModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                              title="Edit Tool"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTool(tool.id)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition"
                              title="Hapus Tool"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: AKUN & SESI TIM */}
        {/* ======================================================== */}
        {activeTab === 'accounts' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Profil Akun & Sesi Bersama</h2>
                <p className="text-xs text-zinc-400">
                  Kelola akun PRO, kredit render video, dan tier langganan untuk kreator.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingAccount({
                    id: '',
                    name: '',
                    tier: 'PRO',
                    credit: 250,
                    active: false,
                  });
                  setIsAccountModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Akun Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`bg-zinc-900 border rounded-2xl p-5 space-y-3 transition ${
                    acc.active ? 'border-purple-500/80 shadow-md shadow-purple-900/20' : 'border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-950 text-purple-300 border border-purple-800">
                      {acc.tier}
                    </span>
                    {acc.active && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Sedang Aktif
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-white">{acc.name}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">ID: {acc.id}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Sisa Kredit</span>
                      <span className="text-base font-black text-white">{acc.credit} Kredit</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingAccount(acc);
                          setIsAccountModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                        title="Edit Akun"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(acc.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: PRODUK DIGITAL SHOP */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Katalog Produk Digital</h2>
                <p className="text-xs text-zinc-400">
                  Kelola paket prompt, top-up kredit, dan template video yang dijual di Digital Shop.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct({
                    id: '',
                    title: '',
                    price: 99000,
                    category: 'Prompt Kit',
                    desc: '',
                    active: true,
                    features: ['Akses Instan', 'Lisensi Penuh'],
                  });
                  setIsProductModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Produk Digital</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {prod.category}
                      </span>
                      <button
                        onClick={() => handleToggleProduct(prod.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          prod.active
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {prod.active ? 'Aktif Tayang' : 'Draft / Nonaktif'}
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-white">{prod.title}</h3>
                    <p className="text-xs text-zinc-400 line-clamp-2">{prod.desc}</p>
                    <div className="text-base font-extrabold text-purple-400">
                      {prod.priceFormatted || formatIDR(prod.price)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-400">
                    <span>Terjual: {prod.sales} unit</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setIsProductModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                        title="Edit Produk"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: KURIKULUM KELAS KREATOR */}
        {/* ======================================================== */}
        {activeTab === 'courses' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Modul & Kurikulum Kelas</h2>
                <p className="text-xs text-zinc-400">
                  Kelola materi edukasi video AI, durasi, dan status penyelesaian siswa.
                </p>
              </div>
              <button
                onClick={() => {
                  const title = prompt('Masukkan Judul Modul Kelas Baru:');
                  if (title) {
                    handleAddCourse(title);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Modul Kelas</span>
              </button>
            </div>

            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">
                        {course.category}
                      </span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {course.duration}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{course.title}</h3>
                    <p className="text-xs text-zinc-400">{course.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button
                      onClick={() => handleToggleCourse(course.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        course.completed
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {course.completed ? 'Selesai' : 'Belum Selesai'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: TRANSAKSI & PESANAN */}
        {/* ======================================================== */}
        {activeTab === 'transactions' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Log Transaksi Digital Shop</h2>
                <p className="text-xs text-zinc-400">
                  Pantau pembayaran masuk, status transaksi QRIS/Transfer, dan pemenuhan aset digital.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari pesanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-purple-500 w-48 sm:w-60"
                />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="p-4">ID Transaksi</th>
                      <th className="p-4">Pelanggan</th>
                      <th className="p-4">Item Produk</th>
                      <th className="p-4">Nominal</th>
                      <th className="p-4">Metode</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {transactions
                      .filter(
                        (t) =>
                          t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.productTitle.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((trx) => (
                        <tr key={trx.id} className="hover:bg-zinc-800/40 transition">
                          <td className="p-4 font-mono font-bold text-white">{trx.id}</td>
                          <td className="p-4">
                            <div className="font-semibold text-zinc-200">{trx.userName}</div>
                            <div className="text-[11px] text-zinc-400">{trx.userEmail}</div>
                          </td>
                          <td className="p-4 font-medium text-zinc-300">{trx.productTitle}</td>
                          <td className="p-4 font-extrabold text-emerald-400">{formatIDR(trx.amount)}</td>
                          <td className="p-4 text-zinc-400">{trx.paymentMethod}</td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                trx.status === 'SUCCESS'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {trx.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleToggleTransactionStatus(trx.id)}
                              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-bold text-[11px] transition"
                            >
                              Ubah Status
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: LOG AUDIT & KEAMANAN SISTEM */}
        {/* ======================================================== */}
        {activeTab === 'logs' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Log Audit & Aktivitas Sistem</h2>
                <p className="text-xs text-zinc-400">
                  Audit keamanan real-time untuk request proxy, generasi AI, dan alokasi sesi akun.
                </p>
              </div>

              <button
                onClick={() => {
                  if (confirm('Bersihkan log riwayat audit?')) {
                    setLogs([]);
                    localStorage.removeItem(STORAGE_KEYS.ADMIN_LOGS);
                    onShowToast('Log riwayat audit dibersihkan.', 'info');
                  }
                }}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 rounded-xl text-xs font-bold transition border border-zinc-700"
              >
                Bersihkan Log
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 font-mono text-xs space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">Tidak ada log aktivitas tercatat.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 flex-shrink-0 mt-0.5">[{log.timestamp}]</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold flex-shrink-0 ${
                        log.level === 'success'
                          ? 'bg-emerald-950 text-emerald-400'
                          : log.level === 'warn'
                          ? 'bg-amber-950 text-amber-400'
                          : log.level === 'error'
                          ? 'bg-red-950 text-red-400'
                          : 'bg-blue-950 text-blue-400'
                      }`}
                    >
                      {log.module}
                    </span>
                    <span className="text-zinc-300 leading-relaxed">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: EDIT / TAMBAH TOOL PLATFORM */}
      {/* ======================================================== */}
      {isToolModalOpen && editingTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white">
              {editingTool.id && tools[editingTool.id] ? 'Edit Platform Workspace' : 'Tambah Platform Workspace'}
            </h3>

            <form onSubmit={handleSaveTool} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">ID Unik (Key)</label>
                <input
                  type="text"
                  disabled={Boolean(editingTool.id && tools[editingTool.id])}
                  value={editingTool.id || ''}
                  onChange={(e) => setEditingTool({ ...editingTool, id: e.target.value.replace(/\s+/g, '') })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono disabled:opacity-50"
                  placeholder="contoh: Sora, Runway, Midjourney"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Nama Tampilan</label>
                  <input
                    type="text"
                    value={editingTool.name || ''}
                    onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                    placeholder="contoh: Sora AI Studio"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Kategori</label>
                  <select
                    value={editingTool.category || 'video'}
                    onChange={(e) => setEditingTool({ ...editingTool, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  >
                    <option value="video">Video</option>
                    <option value="assistant">Assistant</option>
                    <option value="social">Social</option>
                    <option value="riset">Riset</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">URL Resmi Target</label>
                <input
                  type="url"
                  value={editingTool.url || ''}
                  onChange={(e) => setEditingTool({ ...editingTool, url: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                  placeholder="https://labs.google/fx/tools/flow"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Deskripsi Singkat</label>
                <textarea
                  value={editingTool.desc || ''}
                  onChange={(e) => setEditingTool({ ...editingTool, desc: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white resize-none h-16"
                  placeholder="Deskripsi platform untuk kreator..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsToolModalOpen(false);
                    setEditingTool(null);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition shadow-md shadow-purple-600/30"
                >
                  Simpan Platform
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT / TAMBAH AKUN PRO */}
      {/* ======================================================== */}
      {isAccountModalOpen && editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white">
              {editingAccount.id ? 'Edit Profil Akun Sesi' : 'Tambah Profil Akun Baru'}
            </h3>

            <form onSubmit={handleSaveAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Nama Akun / Tim</label>
                <input
                  type="text"
                  value={editingAccount.name || ''}
                  onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  placeholder="contoh: Flow Pro Premium 04"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Tier</label>
                  <select
                    value={editingAccount.tier || 'PRO'}
                    onChange={(e) => setEditingAccount({ ...editingAccount, tier: e.target.value as any })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  >
                    <option value="PRO">PRO</option>
                    <option value="FREE">FREE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Alokasi Kredit</label>
                  <input
                    type="number"
                    value={editingAccount.credit ?? 200}
                    onChange={(e) => setEditingAccount({ ...editingAccount, credit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountModalOpen(false);
                    setEditingAccount(null);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition shadow-md shadow-emerald-600/30"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: EDIT / TAMBAH PRODUK DIGITAL */}
      {/* ======================================================== */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white">
              {editingProduct.id ? 'Edit Produk Digital' : 'Tambah Produk Digital Baru'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Judul Produk</label>
                <input
                  type="text"
                  value={editingProduct.title || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  placeholder="contoh: Master Preset Veo 3 Sinematik"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Harga (Rupiah)</label>
                  <input
                    type="number"
                    value={editingProduct.price || 99000}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Kategori</label>
                  <select
                    value={editingProduct.category || 'Prompt Kit'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                  >
                    <option value="Prompt Kit">Prompt Kit</option>
                    <option value="Akun & Kredit">Akun & Kredit</option>
                    <option value="Template Video">Template Video</option>
                    <option value="Membership">Membership</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Deskripsi Produk</label>
                <textarea
                  value={editingProduct.desc || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, desc: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white resize-none h-16"
                  placeholder="Keterangan manfaat aset digital..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition shadow-md shadow-purple-600/30"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
