import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, TOOLS_CONFIG } from './components/Sidebar';
import { AIStudioDrawer } from './components/AIStudioDrawer';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthModal } from './components/AuthModal';
import { AddAccountModal } from './components/AddAccountModal';
import { MicrotoolsModal } from './components/MicrotoolsModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { Toast, ToastMessage } from './components/Toast';

import { AppWorkspaceView } from './components/views/AppWorkspaceView';
import { KelasView } from './components/views/KelasView';
import { ShopView } from './components/views/ShopView';
import { SettingsView } from './components/views/SettingsView';
import { AdminDashboardView } from './components/views/AdminDashboardView';

import { MainView, User, AccountProfile, MicrotoolAction, ToolConfig } from './types';
import { STORAGE_KEYS, supabase, isSupabaseConfigured } from './lib/supabase';

export default function App() {
  // Navigation & Tool State
  const [activeView, setActiveView] = useState<MainView>('app');
  const [activeToolId, setActiveToolId] = useState<string>('Flow');

  // Workspace Tools Config State (Customizable via Admin Dashboard)
  const [tools, setTools] = useState<Record<string, ToolConfig>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_TOOLS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return TOOLS_CONFIG;
  });

  // Sidebar & Studio Drawers
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // User & Auth State
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      id: 'usr_owner',
      email: 'idstudihome@gmail.com',
      name: 'Studi Home Admin',
      avatar: 'https://ui-avatars.com/api/?name=Studi+Home&background=7c3aed&color=fff&font-size=0.35',
      provider: 'google',
      isLoggedIn: true,
    };
  });

  // Multi-Account Profile State (e.g. Flow PRO accounts)
  const [accounts, setAccounts] = useState<AccountProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      { id: 'acc_1', name: 'Flow Pro 12', tier: 'PRO', credit: 280, active: true },
      { id: 'acc_2', name: 'dracin (PRO)', tier: 'PRO', credit: 163, active: false },
      { id: 'acc_3', name: 'Canva Pro Shared', tier: 'PRO', credit: 999, active: false },
    ];
  });
  const [activeAccountId, setActiveAccountId] = useState<string>('acc_2');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [activeMicrotool, setActiveMicrotool] = useState<MicrotoolAction | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast_' + Date.now() + '_' + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Supabase Auth listener if configured
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u: User = {
            id: session.user.id,
            email: session.user.email || 'user@example.com',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            avatar: session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email || 'User')}&background=7c3aed&color=fff`,
            provider: 'supabase',
            isLoggedIn: true,
          };
          setCurrentUser(u);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u: User = {
            id: session.user.id,
            email: session.user.email || 'user@example.com',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            avatar: session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email || 'User')}&background=7c3aed&color=fff`,
            provider: 'supabase',
            isLoggedIn: true,
          };
          setCurrentUser(u);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  // Sync tools and accounts from backend REST API
  useEffect(() => {
    fetch('/api/tools')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setTools(data);
          localStorage.setItem(STORAGE_KEYS.ADMIN_TOOLS, JSON.stringify(data));
        }
      })
      .catch(() => {});

    fetch('/api/accounts')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AccountProfile[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setAccounts(data);
          const active = data.find((a) => a.active);
          if (active) setActiveAccountId(active.id);
          localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, []);

  const handleAddAccount = async (newAcc: AccountProfile) => {
    const updated = [newAcc, ...accounts];
    setAccounts(updated);
    setActiveAccountId(newAcc.id);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
    showToast(`Akun ${newAcc.name} berhasil dihubungkan!`, 'success');

    try {
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAcc),
      });
    } catch {
      // ignore
    }
  };

  const handleSwitchAccount = async (accId: string) => {
    setActiveAccountId(accId);
    setAccounts((prev) => prev.map((a) => ({ ...a, active: a.id === accId })));
    showToast('Akun sesi aktif diganti.', 'info');
    try {
      await fetch('/api/accounts/switch-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: accId }),
      });
    } catch {
      // ignore
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Selamat datang ${user.name}! Akun Google & Gemini AI aktif.`, 'success');
  };

  const handleLogout = () => {
    const guestUser: User = {
      id: 'usr_guest',
      email: '',
      name: 'Tamu',
      avatar: 'https://ui-avatars.com/api/?name=Guest&background=a1a1aa&color=fff',
      isLoggedIn: false,
    };
    setCurrentUser(guestUser);
    localStorage.removeItem(STORAGE_KEYS.USER);
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    showToast('Berhasil keluar dari akun.', 'info');
  };

  const [workspaceRefreshKey, setWorkspaceRefreshKey] = useState(0);

  const handleForceRefresh = () => {
    setWorkspaceRefreshKey((prev) => prev + 1);
    showToast('Menyegarkan website asli...', 'info');
  };

  const activeToolConfig = tools[activeToolId] || tools.Flow || TOOLS_CONFIG.Flow;
  const activeAccountObj = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-100 text-zinc-800 antialiased select-none font-sans">
      
      {/* Top Application Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onToggleStudio={() => setIsStudioOpen(!isStudioOpen)}
        isStudioOpen={isStudioOpen}
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          setIsSidebarOpen(false);
        }}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onForceRefresh={handleForceRefresh}
        activeToolName={activeToolConfig.name}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeToolId={activeToolId}
          onSelectTool={(toolId) => {
            setActiveToolId(toolId);
            setActiveView('app');
            setIsSidebarOpen(false);
          }}
          accounts={accounts}
          activeAccountId={activeAccountId}
          onSelectAccount={(accId) => handleSwitchAccount(accId)}
          onOpenAddAccount={() => setIsAddAccountOpen(true)}
          toolsConfig={tools}
        />

        {/* Center View Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          {activeView === 'app' && (
            <AppWorkspaceView
              tool={activeToolConfig}
              activeAccount={activeAccountObj}
              activeAccountId={activeAccountId}
              userEmail={currentUser?.email}
              refreshKey={workspaceRefreshKey}
              onForceRefresh={handleForceRefresh}
              onOpenAddAccount={() => setIsAddAccountOpen(true)}
              onOpenStudio={() => setIsStudioOpen(true)}
              onOpenVideoPlayer={() => setIsVideoPlayerOpen(true)}
              onShowToast={showToast}
            />
          )}

          {activeView === 'kelas' && <KelasView onShowToast={showToast} />}

          {activeView === 'shop' && <ShopView onShowToast={showToast} />}

          {activeView === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthOpen(true)}
              onShowToast={showToast}
              onSelectView={(view) => setActiveView(view)}
            />
          )}

          {activeView === 'admin' && (
            <AdminDashboardView
              currentUser={currentUser}
              tools={tools}
              onUpdateTools={(newTools) => setTools(newTools)}
              accounts={accounts}
              onUpdateAccounts={(newAccs) => setAccounts(newAccs)}
              onShowToast={showToast}
              onSwitchToWorkspace={(toolId) => {
                if (toolId) setActiveToolId(toolId);
                setActiveView('app');
              }}
            />
          )}
        </main>

        {/* Right AI Studio Drawer (Storyboard & Microtools) */}
        <AIStudioDrawer
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          currentUser={currentUser}
          onOpenMicrotool={(tool) => setActiveMicrotool(tool)}
          onShowToast={showToast}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          setIsSidebarOpen(false);
        }}
        onOpenStudio={() => setIsStudioOpen(true)}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onAddAccount={handleAddAccount}
      />

      <MicrotoolsModal
        tool={activeMicrotool}
        isOpen={Boolean(activeMicrotool)}
        onClose={() => setActiveMicrotool(null)}
        userApiKey={localStorage.getItem(STORAGE_KEYS.CUSTOM_API_KEY) || undefined}
        onShowToast={showToast}
      />

      <VideoPlayerModal
        isOpen={isVideoPlayerOpen}
        onClose={() => setIsVideoPlayerOpen(false)}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Offline Status Badge */}
      <OfflineIndicator />
    </div>
  );
}
