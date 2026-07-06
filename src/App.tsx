import { useState, useEffect } from 'react';
import { 
  Heart, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Activity, 
  Users, 
  Plus, 
  Phone, 
  Bell, 
  Calendar, 
  ArrowRight,
  User as UserIcon,
  ShieldAlert,
  Send,
  Home,
  Settings,
  Palette,
  Terminal,
  RefreshCw,
  LogOut,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, FamilyMember, CheckIn, Alert, AuditLog, Notification } from './types.js';

// Import newly created modular sub-components
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardView from './components/DashboardView';
import FamilyMembersView from './components/FamilyMembersView';
import HealthOverviewView from './components/HealthOverviewView';
import AiAssistantView from './components/AiAssistantView';
import AlertsTimelineView from './components/AlertsTimelineView';
import FamilyWellbeingView from './components/FamilyWellbeingView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import CustomizationView from './components/CustomizationView';
import DeveloperModeView from './components/DeveloperModeView';
import RecipientDashboardView from './components/RecipientDashboardView';

export default function App() {
  // Authentication & Role-based Access States
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>(() => localStorage.getItem('token') || '');

  // Keep localStorage in sync with token
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register' | 'dashboard' | 'members' | 'health' | 'assistant' | 'timeline' | 'wellbeing' | 'profile' | 'settings' | 'customization' | 'developer'>('landing');

  // Core Synchronized Database States
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [geminiRateLimited, setGeminiRateLimited] = useState<boolean>(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // UI Interactive States
  const [isSimulating, setIsSimulating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'alert' | 'info' } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveUser(data.user);
        setCurrentView('dashboard');
      } else {
        setToken('');
        setCurrentView('landing');
      }
    } catch (err) {
      console.error('Failed to restore user session:', err);
    }
  };

  // 1. Initial Login Auto-bootstrap for immediate preview response
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      fetchCurrentUser(savedToken);
    } else {
      // We bootstrap the login process silently to seed initial state
      handleLoginSilent('usr_sarah');
    }
  }, []);

  // 2. State Sync Polling Engine & Real-Time SSE Stream (Vitals, Alerts & Logs)
  useEffect(() => {
    if (!token) return;

    syncDatabase();

    // Establish real-time SSE stream
    const eventSource = new EventSource(`/api/stream?token=${encodeURIComponent(token)}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'sync') {
          syncDatabase();
        }
      } catch (err) {
        console.error('Error parsing SSE payload:', err);
      }
    };

    eventSource.onerror = (err) => {
      // Quietly log to prevent noise
      console.warn('Real-time SSE stream connection retry active.');
    };

    // Poll for real-time updates every 3 seconds as a resilient fallback
    const interval = setInterval(() => {
      syncDatabase();
    }, 3000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [token]);

  // Helper to sync all database tables from our Express server
  const syncDatabase = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [membersRes, alertsRes, logsRes, notifsRes] = await Promise.all([
        fetch('/api/profile', { headers }),
        fetch('/api/alerts', { headers }),
        fetch('/api/audit-logs', { headers }),
        fetch('/api/notifications', { headers })
      ]);

      if (membersRes.ok && alertsRes.ok && logsRes.ok && notifsRes.ok) {
        const mData = await membersRes.json();
        const aData = await alertsRes.json();
        const lData = await logsRes.json();
        const nData = await notifsRes.json();

        const nonArchived = (mData.familyMembers || []).filter((fm: FamilyMember) => !fm.archived);
        setFamilyMembers(mData.familyMembers || []);
        
        setSelectedRecipientId(prev => {
          if (prev && (mData.familyMembers || []).some((fm: FamilyMember) => fm.id === prev && !fm.archived)) {
            return prev;
          }
          return nonArchived[0]?.id || (mData.familyMembers || [])[0]?.id || '';
        });

        setGeminiRateLimited(mData.geminiRateLimited || false);
        setCooldownSeconds(mData.cooldownSeconds || 0);
        setAlerts(aData.alerts);
        setAuditLogs(lData.auditLogs);
        setNotifications(nData.notifications);
      }
    } catch (err) {
      // Use console.warn to prevent transient dev server restarts/disconnects from polluting error logs
      console.warn('Database polling temporary status:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSelectRecipient = async (recipientId: string) => {
    setSelectedRecipientId(recipientId);
    try {
      console.log(`[Recipient Selection Change] Passing Recipient ID ${recipientId} to backend API...`);
      const res = await fetch('/api/recipient/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId })
      });
      if (res.ok) {
        syncDatabase();
      }
    } catch (err) {
      console.error('Failed to notify backend of context switch:', err);
    }
  };

  const handleLoginSilent = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setActiveUser(data.user);
      }
    } catch (err) {
      console.error('Silent boot failed:', err);
    }
  };

  const handleLogin = async (userId: string, directToken?: string, directUser?: any) => {
    setIsLoggingIn(true);
    if (directToken && directUser) {
      setToken(directToken);
      setActiveUser(directUser);
      setCurrentView('dashboard');
      showToast('Secure Entrance Verified', `Successfully authenticated as ${directUser.name} (${directUser.role.toUpperCase()})`, 'success');
      setIsLoggingIn(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setActiveUser(data.user);
        setCurrentView('dashboard');
        showToast('Secure Entrance Verified', `Successfully authenticated as ${data.user.name} (${data.user.role.toUpperCase()})`, 'success');
      } else {
        const data = await res.json();
        showToast('Authentication Error', data.error || 'Authentication failed.', 'alert');
      }
    } catch (err) {
      showToast('Authentication Error', 'Unable to reach clinical authentication nodes.', 'alert');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setActiveUser(null);
    setCurrentView('landing');
    showToast('Secure Session Closed', 'You have successfully signed out.', 'success');
  };

  const showToast = (title: string, message: string, type: 'success' | 'alert' | 'info') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 3. Trigger simulation workflows on the server
  const triggerSimulation = async (type: string, description: string) => {
    setIsSimulating(type);
    showToast('Simulation Initiated', `Publishing event "${type}" to Event Bus...`, 'info');

    try {
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const payload = type === 'DailyCheckInMissed' 
        ? { missedAt: new Date().toISOString(), scheduleTime: '09:00 AM' }
        : type === 'MedicineMissed'
        ? { medicineName: 'Lisinopril (Hypertension)', scheduledTime: '08:00 AM' }
        : type === 'MoodUpdated'
        ? { mood: 'Anxious / Agitated', source: 'Wearable HR spike' }
        : { source: 'Smartwatch SOS Clicked', heartRate: 115 };

      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ type, payload })
      });

      if (res.ok) {
        setTimeout(() => {
          showToast('Specialists Responding', 'Planner Agent has dispatched tasks to Health & Safety Agents.', 'info');
        }, 1200);

        setTimeout(() => {
          syncDatabase();
          showToast('Orchestration Finalized', 'Reflection Agent passed safe actions. Action Engine completed.', 'success');
          setIsSimulating(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Simulation launch failed:', err);
      setIsSimulating(null);
    }
  };

  // 4. Resolve active alert
  const resolveAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Alert Resolved', 'The care recipient alert was successfully resolved and logged.', 'success');
        syncDatabase();
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  // 5. Submit Wellness Check-in (Eleanor Vance Portal)
  const submitCheckin = async (status: 'completed' | 'missed' | 'delayed', notes: string) => {
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        showToast('Check-In Received', 'Wellness confirmation dispatched to Caregiver network.', 'success');
        syncDatabase();
      }
    } catch (err) {
      console.error('Failed to dispatch check-in:', err);
    }
  };

  // 6. Reset Database Simulation
  const resetDatabase = async () => {
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('System Reset', 'All database tables reset to clean initial seed data.', 'success');
        syncDatabase();
      }
    } catch (err) {
      console.error('Failed to reset DB:', err);
    }
  };

  const clearSystemLogs = async () => {
    try {
      await fetch('/api/audit-logs/clear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      syncDatabase();
      showToast('Trace Console Cleared', 'Live stream logs cleared successfully.', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Extract counts
  const pendingAlertsCount = alerts.filter(a => a.status === 'pending').length;

  // Side navigation menu items
  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home },
    { id: 'members' as const, label: 'Family Circles', icon: Users },
    { id: 'health' as const, label: 'Health Overview', icon: Activity },
    { id: 'assistant' as const, label: 'AI Companion', icon: Sparkles },
    { id: 'timeline' as const, label: 'Chronology Feed', icon: FileText },
    { id: 'wellbeing' as const, label: 'Wellbeing Index', icon: Heart },
    { id: 'profile' as const, label: 'Personal Profile', icon: UserIcon },
    { id: 'settings' as const, label: 'Escalation rules', icon: Settings },
    { id: 'customization' as const, label: 'Interface Look', icon: Palette },
  ];

  // ISO Isolated Fullscreen views checking
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentView('register')} onLogin={() => setCurrentView('login')} />;
  }

  if (currentView === 'login') {
    return (
      <LoginPage 
        onLoginSuccess={(userId, token, user) => handleLogin(userId, token, user)} 
        onNavigateToRegister={() => setCurrentView('register')} 
      />
    );
  }

  if (currentView === 'register') {
    return (
      <RegisterPage 
        onRegisterSuccess={(userId, token, user) => handleLogin(userId, token, user)} 
        onNavigateToLogin={() => setCurrentView('login')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* Toast Alert Feed */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            id="sim_toast"
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-start gap-3 p-4 rounded-2xl border max-w-sm shadow-2xl backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-emerald-900 border-emerald-800 text-white' 
                : toast.type === 'alert'
                ? 'bg-rose-900 border-rose-800 text-white'
                : 'bg-teal-900 border-teal-800 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />}
            {toast.type === 'alert' && <AlertTriangle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Sparkles className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />}
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider">{toast.title}</h4>
              <p className="text-xs opacity-90 mt-1 leading-normal">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 p-4 shadow-sm flex justify-between items-center">
        
        <div className="flex items-center gap-3">
          {/* Mobile Menu trigger */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/10 shrink-0">
              <Heart className="w-4.5 h-4.5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900">CareCircle AI</h1>
              <p className="text-[9px] text-slate-400 font-mono hidden sm:block">HIPAA Secure Workspace</p>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          
          {/* Live agent status badge */}
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">Planner Active</span>
          </div>

          {/* Quick simulation seed reset button */}
          <button
            onClick={resetDatabase}
            title="Restore simulation seeds"
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Active Care Recipient Context Switcher */}
          {activeUser?.role === 'caregiver' && familyMembers.length > 0 && (
            <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-100 p-1 rounded-xl shadow-inner shrink-0 max-w-[160px] sm:max-w-none">
              <span className="hidden lg:inline text-[10px] font-mono text-teal-800 font-bold px-2 uppercase">Active Recipient:</span>
              <select
                value={selectedRecipientId}
                onChange={(e) => {
                  handleSelectRecipient(e.target.value);
                  showToast('Care Context Switched', `System switched context to ${familyMembers.find(f => f.id === e.target.value)?.name || 'active recipient'}.`, 'info');
                }}
                className="bg-transparent text-xs font-bold text-teal-950 border-none outline-none pr-1.5 cursor-pointer py-1"
              >
                {familyMembers.filter(fm => !fm.archived).map(fm => (
                  <option key={fm.id} value={fm.id} className="text-slate-900 bg-white">
                    {fm.name} ({fm.relationship})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Role selection dropdown wrapper */}
          <div className="flex bg-slate-100 p-1 border border-slate-150 rounded-xl">
            <button
              onClick={() => handleLogin('usr_sarah')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeUser?.role === 'caregiver' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sarah (Caregiver)
            </button>
            <button
              onClick={() => handleLogin('usr_eleanor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeUser?.role === 'carerecipient' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Eleanor (Recipient)
            </button>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CORE WORKSPACE LAYOUT */}
      <div className="flex-1 flex relative">
        
        {/* DESKTOP SIDEBAR NAVIGATION PANEL */}
        <aside className="hidden lg:flex flex-col justify-between w-64 bg-white border-r border-slate-200/80 p-5 shrink-0 h-[calc(100vh-69px)] sticky top-[69px]">
          
          <div className="space-y-6">
            
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Workspace Panels</span>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <IconComp className="w-4.5 h-4.5" />
                      <span>{item.label}</span>
                      
                      {item.id === 'timeline' && pendingAlertsCount > 0 && (
                        <span className="ml-auto bg-rose-500 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-mono font-black animate-pulse">
                          {pendingAlertsCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Separate Developer Mode trigger links */}
            <div className="space-y-1.5 border-t border-slate-100 pt-4">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Engineering Mode</span>
              <button
                id="sidebar_dev_mode_btn"
                onClick={() => setCurrentView('developer')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  currentView === 'developer' 
                    ? 'bg-slate-950 text-emerald-400 shadow-inner' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Terminal className="w-4.5 h-4.5" />
                <span>Developer Mode</span>
              </button>
            </div>

          </div>

          {/* User ID profile footer block */}
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-2 border border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {activeUser?.name[0] || 'S'}
            </div>
            <div className="overflow-hidden">
              <span className="font-extrabold text-[11px] text-slate-800 block truncate">{activeUser?.name || 'Sarah Vance'}</span>
              <span className="text-[9px] text-slate-500 block capitalize">{activeUser?.role || 'Primary Caregiver'}</span>
            </div>
          </div>

        </aside>

        {/* MOBILE SIDEBAR MOBILE DRAWER */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Overlay */}
              <div 
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden" 
              />
              <motion.aside 
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                className="fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200 p-5 z-50 flex flex-col justify-between h-full lg:hidden"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-sm">Navigation</h3>
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {menuItems.map((item) => {
                      const IconComp = item.icon;
                      const isActive = currentView === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setCurrentView(item.id); setIsMobileMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-teal-50 text-teal-700' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <IconComp className="w-4.5 h-4.5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>

                  <div className="border-t border-slate-100 pt-4">
                    <button
                      onClick={() => { setCurrentView('developer'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        currentView === 'developer' ? 'bg-slate-950 text-emerald-400' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Terminal className="w-4.5 h-4.5" />
                      <span>Developer Mode</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-2 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {activeUser?.name[0] || 'S'}
                  </div>
                  <div>
                    <span className="font-extrabold text-[11px] text-slate-800 block">{activeUser?.name || 'Sarah Vance'}</span>
                    <span className="text-[9px] text-slate-500 block capitalize">{activeUser?.role || 'Primary Caregiver'}</span>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* CENTRAL VIEWPORT WRAPPER */}
        <section className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && (
                activeUser?.role === 'carerecipient' ? (
                  <RecipientDashboardView 
                    user={activeUser}
                    familyMembers={familyMembers}
                    alerts={alerts}
                    checkIns={checkIns}
                    submitCheckin={submitCheckin}
                    triggerSimulation={triggerSimulation}
                  />
                ) : (
                  <DashboardView 
                    user={activeUser}
                    familyMembers={familyMembers}
                    alerts={alerts}
                    notifications={notifications}
                    checkIns={checkIns}
                    auditLogs={auditLogs}
                    isSimulating={isSimulating}
                    triggerSimulation={triggerSimulation}
                    resolveAlert={resolveAlert}
                    submitCheckin={submitCheckin}
                    onNavigate={(view) => setCurrentView(view as any)}
                    onAddMember={() => setCurrentView('members')}
                    selectedRecipientId={selectedRecipientId}
                    onSelectRecipient={handleSelectRecipient}
                    showToast={showToast}
                    isLoading={isInitialLoading}
                  />
                )
              )}

              {currentView === 'members' && (
                <FamilyMembersView 
                  familyMembers={familyMembers}
                  alerts={alerts}
                  showToast={showToast}
                  selectedRecipientId={selectedRecipientId}
                  onSelectRecipient={handleSelectRecipient}
                  onInviteMember={async (newMember) => {
                    try {
                      const res = await fetch('/api/family-members', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          name: newMember.name,
                          age: newMember.age,
                          relationship: newMember.relationship,
                          email: newMember.email,
                          phone: ''
                        })
                      });
                      if (res.ok) {
                        showToast('Family Member Registered', `Successfully added ${newMember.name} as ${newMember.relationship}.`, 'success');
                        syncDatabase();
                      }
                    } catch (err) {
                      console.error('Failed to invite member:', err);
                    }
                  }}
                />
              )}

              {currentView === 'health' && (
                <HealthOverviewView 
                  familyMembers={familyMembers} 
                  selectedRecipientId={selectedRecipientId} 
                  syncDatabase={syncDatabase}
                  auditLogs={auditLogs}
                />
              )}

              {currentView === 'assistant' && (
                <AiAssistantView familyMembers={familyMembers} alerts={alerts} selectedRecipientId={selectedRecipientId} showToast={showToast} />
              )}

              {currentView === 'timeline' && (
                <AlertsTimelineView 
                  alerts={alerts}
                  checkIns={checkIns}
                  resolveAlert={resolveAlert}
                />
              )}

              {currentView === 'wellbeing' && (
                <FamilyWellbeingView familyMembers={familyMembers} alerts={alerts} selectedRecipientId={selectedRecipientId} showToast={showToast} />
              )}

              {currentView === 'profile' && (
                <ProfileView user={activeUser} showToast={showToast} />
              )}

              {currentView === 'settings' && (
                <SettingsView />
              )}

              {currentView === 'customization' && (
                <CustomizationView />
              )}

              {currentView === 'developer' && (
                <DeveloperModeView 
                  alerts={alerts}
                  auditLogs={auditLogs}
                  notifications={notifications}
                  isSimulating={isSimulating}
                  triggerSimulation={triggerSimulation}
                  clearSystemLogs={clearSystemLogs}
                  geminiRateLimited={geminiRateLimited}
                  cooldownSeconds={cooldownSeconds}
                />
              )}
            </motion.div>
          </AnimatePresence>

        </section>

      </div>

      {/* CORE FOOTER BRAND */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-[10px] text-slate-400 font-mono">
        <p>© 2026 CareCircle AI Inc. Protected under clinical compliance guidelines.</p>
        <p className="mt-1 opacity-70">Secured via SSL Standard Signature Headers</p>
      </footer>

    </div>
  );
}
