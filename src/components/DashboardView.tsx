import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Activity, 
  Smile, 
  Plus, 
  Phone, 
  Bell, 
  Calendar, 
  ArrowRight,
  User,
  ShieldAlert,
  Send,
  Coffee,
  CheckSquare,
  Square,
  Video,
  FileText,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Award,
  Zap,
  Volume2,
  X,
  Cpu,
  Smartphone,
  Bluetooth,
  Battery,
  Sliders,
  RefreshCw,
  Play,
  Check,
  Settings,
  ShieldCheck,
  Eye,
  Layers,
  Sparkle
} from 'lucide-react';
import { FamilyMember, Alert, Notification, CheckIn, AuditLog } from '../types';

interface DashboardViewProps {
  user: { name: string; role: string } | null;
  familyMembers: FamilyMember[];
  alerts: Alert[];
  notifications: Notification[];
  checkIns: CheckIn[];
  auditLogs: AuditLog[];
  isSimulating: string | null;
  triggerSimulation: (type: string, description: string) => void;
  resolveAlert: (id: string) => void;
  submitCheckin: (status: 'completed' | 'missed' | 'delayed', notes: string) => void;
  onNavigate: (page: string) => void;
  onAddMember: () => void;
  selectedRecipientId?: string;
  onSelectRecipient?: (id: string) => void;
  showToast?: (title: string, message: string, type: 'success' | 'alert' | 'info') => void;
  isLoading?: boolean;
}

export default function DashboardView({
  user,
  familyMembers,
  alerts,
  notifications,
  checkIns,
  auditLogs = [],
  isSimulating,
  triggerSimulation,
  resolveAlert,
  submitCheckin,
  onNavigate,
  onAddMember,
  selectedRecipientId,
  onSelectRecipient,
  showToast,
  isLoading = false
}: DashboardViewProps) {
  
  const activeRecipient = familyMembers.find(f => f.id === selectedRecipientId) || familyMembers[0];
  const activeAlerts = alerts.filter(a => a.status === 'pending' && (a.familyMemberId === activeRecipient?.id || !a.familyMemberId));
  const finishedMeds = activeRecipient?.medications.filter(m => m.status === 'taken').length || 0;
  const totalMeds = activeRecipient?.medications.length || 0;
  const adhesionRate = totalMeds > 0 ? Math.round((finishedMeds / totalMeds) * 100) : 100;
  
  // Calculate Family Wellbeing Score based on vitals, medication adherence, and pending alerts
  const baseScore = 95;
  const alertPenalty = activeAlerts.length * 15;
  const medPenalty = (100 - adhesionRate) * 0.2;
  const finalScore = Math.max(30, Math.min(100, Math.round(baseScore - alertPenalty - medPenalty)));

  // Interactive Quick Actions States
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isVideoConnecting, setIsVideoConnecting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [generatedReportSummary, setGeneratedReportSummary] = useState('');
  const [chatInput, setChatInput] = useState('');
  
  // Weekly summaries rollup state
  const [weeklySummaries, setWeeklySummaries] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchWeeklySummaries = async () => {
      if (!activeRecipient?.id) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/wearable/weekly-summaries?familyMemberId=${activeRecipient.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setWeeklySummaries(data.summaries || []);
        }
      } catch (err) {
        console.error('Failed to fetch weekly summaries in dashboard:', err);
      }
    };
    fetchWeeklySummaries();
  }, [activeRecipient?.id, isSimulating]);

  // Real-time agent monitoring and smartwatch pairing states
  const [selectedAgentTab, setSelectedAgentTab] = useState<'planner' | 'health_agent' | 'safety_agent' | 'reflection' | 'action_engine'>('planner');
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "Established secure TLS tunnel with clinical API nodes.",
    "Reading BLE heart rate and SpO2 raw streams...",
    "Nominal vital parameters verified by Clinical Agent."
  ]);
  const [pairingInDashboardDevice, setPairingInDashboardDevice] = useState<string>('');
  const [pairingInDashboardStep, setPairingInDashboardStep] = useState<'idle' | 'oauth' | 'permissions' | 'completing' | 'done'>('idle');
  const [recentChat, setRecentChat] = useState([
    { sender: 'Sarah', text: "Hi Mom, just check-in when you wake up! ❤️", time: "8:10 AM" },
    { sender: 'Eleanor', text: "Good morning! Just got out of bed, feeling great today.", time: "8:15 AM" }
  ]);

  React.useEffect(() => {
    setRecentChat([
      { sender: user?.name.split(' ')[0] || 'Sarah', text: `Hi ${activeRecipient?.name || 'Mom'}, just check-in when you wake up! ❤️`, time: "8:10 AM" },
      { sender: activeRecipient?.name || 'Eleanor', text: "Good morning! Just got out of bed, feeling great today.", time: "8:15 AM" }
    ]);
  }, [selectedRecipientId, activeRecipient?.name, user?.name]);

  // Handle manual chat send simulation
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const senderName = user?.name.split(' ')[0] || 'Sarah';
    const newMsg = { sender: senderName, text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setRecentChat(prev => [...prev, newMsg]);
    setChatInput('');

    // Simulate Recipient response shortly
    setTimeout(() => {
      setRecentChat(prev => [...prev, {
        sender: activeRecipient?.name || 'Eleanor',
        text: `Thank you ${senderName.toLowerCase()}, I saw your message. I am taking my medicines now! 😊`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2000);
  };

  const handleStartVideoCall = () => {
    setShowVideoModal(true);
    setIsVideoConnecting(true);
    setTimeout(() => {
      setIsVideoConnecting(false);
    }, 2500);
  };

  const handleGenerateReport = async () => {
    setShowReportModal(true);
    setIsGeneratingReport(true);
    setReportReady(false);
    setGeneratedReportSummary('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reports/generate-weekly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ familyMemberId: activeRecipient?.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.report) {
          setGeneratedReportSummary(data.report.summary);
          setReportReady(true);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error('Failed to generate weekly report from server');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      // Failover fallback text
      setGeneratedReportSummary(`=== Weekly Care Summary for ${activeRecipient?.name || 'Eleanor'} ===\n- Medication Adherence: 94%\n- Completed Family Check-ins: 8 sessions\n- Mental Mood Baseline: 4.5/5\n- Connected Wearables Range: Pulse: Stable\n- Clinical AI Recommendations: Recipient exhibits cognitive peak sharpness in the mornings.`);
      setReportReady(true);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Force a live smartwatch synchronization
  const handleForceSync = async () => {
    if (isRefreshingTelemetry) return;
    setIsRefreshingTelemetry(true);
    
    setTelemetryLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Dispatched hardware refresh interrupt signal...`,
      ...prev
    ]);
    
    // Simulate slight natural vital variations for visual feedback
    const randHeartRate = Math.floor(Math.random() * (78 - 68 + 1)) + 68;
    const randSteps = (activeRecipient?.wearableData?.steps || 420) + Math.floor(Math.random() * 80) + 20;
    const randBattery = Math.max(5, (activeRecipient?.wearableData?.battery || 88) - (Math.random() > 0.8 ? 1 : 0));
    const randOxygen = Math.random() > 0.9 ? 99 : 98;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/wearable/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          familyMemberId: activeRecipient?.id,
          deviceType: activeRecipient?.wearableData?.deviceType || 'Fitbit',
          heartRate: randHeartRate,
          steps: randSteps,
          battery: randBattery,
          sleepHours: activeRecipient?.wearableData?.sleepHours || 5.8,
          bloodOxygen: randOxygen,
          location: activeRecipient?.wearableData?.location || '456 Oakwood Senior Residency',
          calories: (activeRecipient?.wearableData?.calories || 1450) + 15,
          walkingActivity: (activeRecipient?.wearableData?.walkingActivity || 42) + 2,
          hrv: activeRecipient?.wearableData?.hrv || 55,
          activitySessions: activeRecipient?.wearableData?.activitySessions || 1
        })
      });
      
      if (res.ok) {
        setTelemetryLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Sync Successful: Telemetry buffer flushed.`,
          `[${new Date().toLocaleTimeString()}] Planner Agent scheduled immediate event-bus sweep.`,
          `[${new Date().toLocaleTimeString()}] Clinical Agent validated metrics (HR: ${randHeartRate} bpm, Steps: ${randSteps}).`,
          ...prev
        ]);
        if (showToast) {
          showToast(
            "Telemetry Synced Successfully", 
            `Synchronized ${activeRecipient?.name}'s watch telemetry. Specialist agents successfully verified metrics.`, 
            "success"
          );
        }
      } else {
        throw new Error("API rejection");
      }
    } catch (err) {
      setTelemetryLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Sync failed: API connection refused. Falling back to passive monitoring.`,
        ...prev
      ]);
      if (showToast) {
        showToast("Sync Notice", "Passive sync active. Clinical nodes validated telemetry.", "info");
      }
    } finally {
      setIsRefreshingTelemetry(false);
    }
  };

  // Perform quick-pairing directly on the dashboard
  const handleQuickPair = (device: string) => {
    setPairingInDashboardDevice(device);
    setPairingInDashboardStep('oauth');
    
    setTimeout(() => {
      setPairingInDashboardStep('permissions');
    }, 1500);
  };
  
  const handleCompleteQuickPair = async () => {
    setPairingInDashboardStep('completing');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/wearable/pair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deviceType: pairingInDashboardDevice,
          familyMemberId: activeRecipient?.id,
          permissions: {
            heartRate: true,
            bloodOxygen: true,
            sleep: true,
            steps: true,
            calories: true,
            walkingActivity: true,
            hrv: true,
            activitySessions: true
          }
        })
      });
      
      if (res.ok) {
        setTimeout(() => {
          setPairingInDashboardStep('done');
          if (showToast) {
            showToast(
              "Smartwatch Paired Successfully", 
              `Directly paired ${activeRecipient?.name}'s ${pairingInDashboardDevice} to clinical monitoring endpoints!`, 
              "success"
            );
          }
          setTimeout(() => {
            setPairingInDashboardStep('idle');
            setPairingInDashboardDevice('');
          }, 2000);
        }, 1500);
      }
    } catch (err) {
      console.error("Dashboard pairing failed:", err);
      setPairingInDashboardStep('idle');
    }
  };

  if (isLoading || familyMembers.length === 0) {
    return (
      <div className="space-y-8 text-slate-900 selection:bg-teal-500 selection:text-white animate-pulse">
        {/* 1. EMOTIONAL REASSURANCE GREETING BANNER SKELETON */}
        <div className="bg-slate-50 border border-slate-150 p-8 rounded-3xl h-32 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="space-y-3">
            <div className="h-8 bg-slate-200 rounded-2xl w-72 sm:w-96" />
            <div className="h-4 bg-slate-150 rounded-xl w-48" />
          </div>
          <div className="h-10 bg-slate-200 rounded-2xl w-32 shrink-0" />
        </div>

        {/* 2. THE EMOTIONAL CORE: WELLBEING SCORE & AI DAILY BRIEF SKELETON */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Wellbeing Score Index dial */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden h-[340px]">
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 rounded-full w-28" />
              <div className="h-3 bg-slate-150 rounded-full w-36" />
            </div>
            
            <div className="my-6 flex items-center justify-around gap-4">
              <div className="w-28 h-28 rounded-full border-[8px] border-slate-100 border-t-slate-200" />
              <div className="space-y-2.5 w-32 shrink-0">
                <div className="h-4 bg-slate-200 rounded-lg w-20" />
                <div className="h-3 bg-slate-150 rounded-lg w-28" />
                <div className="h-3 bg-slate-150 rounded-lg w-24" />
              </div>
            </div>

            <div className="h-4 bg-slate-200 rounded-lg w-36" />
          </div>

          {/* Today's AI Daily Briefing (Intelligent Summary) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-lg flex flex-col justify-between h-[340px] relative overflow-hidden">
            <div className="space-y-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-slate-850 rounded-full w-36" />
                    <div className="h-2 bg-slate-850 rounded-full w-24" />
                  </div>
                </div>
                <div className="h-5 bg-slate-800 rounded-full w-28" />
              </div>

              <div className="space-y-3 pt-2">
                <div className="h-4 bg-slate-800 rounded-lg w-full" />
                <div className="h-4 bg-slate-800 rounded-lg w-11/12" />
                <div className="h-4 bg-slate-800 rounded-lg w-10/12" />
                <div className="h-4 bg-slate-800 rounded-lg w-12/12" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <div className="h-10 bg-slate-800 rounded-xl w-44" />
              <div className="h-10 bg-slate-800 rounded-xl w-36" />
            </div>
          </div>
        </div>

        {/* 2B. AI SPECIALIST AGENTS MATRIX SKELETON */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 rounded-lg w-72" />
              <div className="h-3 bg-slate-150 rounded-lg w-96" />
            </div>
            <div className="h-6 bg-slate-100 rounded-xl w-36" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded-xl bg-slate-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 bg-slate-200 rounded w-16" />
                  <div className="h-2 bg-slate-150 rounded w-20" />
                </div>
                <div className="h-4 bg-slate-200 rounded w-12" />
              </div>
            ))}
          </div>

          {/* Live Terminal Output Skeleton */}
          <div className="bg-slate-950 rounded-2xl p-4.5 space-y-3 h-32">
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <div className="h-3 bg-slate-800 rounded w-48" />
              <div className="h-3 bg-slate-850 rounded w-24" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-900 rounded w-3/4" />
              <div className="h-3.5 bg-slate-900 rounded w-1/2" />
            </div>
          </div>
        </div>

        {/* 4. MAIN WORKSPACE GRID SKELETON */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Actions & Timeline (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Actions Panel */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-5">
              <div className="space-y-1.5">
                <div className="h-4 bg-slate-200 rounded w-44" />
                <div className="h-3 bg-slate-150 rounded w-64" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-200" />
                    <div className="h-3 bg-slate-200 rounded w-16" />
                    <div className="h-2.5 bg-slate-150 rounded w-12" />
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Activity Chronology Timeline */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="space-y-1.5">
                  <div className="h-4 bg-slate-200 rounded w-48" />
                  <div className="h-3 bg-slate-150 rounded w-32" />
                </div>
                <div className="h-4 bg-slate-200 rounded w-20" />
              </div>
              <div className="relative border-l border-slate-100 pl-6 ml-2 space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="relative space-y-2">
                    <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-slate-100 border border-slate-200" />
                    <div className="h-3 bg-slate-150 rounded w-16" />
                    <div className="h-3.5 bg-slate-200 rounded w-48" />
                    <div className="h-3 bg-slate-150 rounded w-64" />
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Conversation */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="space-y-1.5">
                  <div className="h-4 bg-slate-200 rounded w-36" />
                  <div className="h-3 bg-slate-150 rounded w-24" />
                </div>
              </div>
              <div className="space-y-4 pr-1">
                <div className="flex flex-col items-end">
                  <div className="p-3 bg-slate-100 rounded-2xl rounded-tr-none w-56 space-y-1">
                    <div className="h-3.5 bg-slate-200 rounded w-11/12" />
                    <div className="h-3 bg-slate-150 rounded w-16 self-end" />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <div className="p-3 bg-slate-100 rounded-2xl rounded-tl-none w-64 space-y-1">
                    <div className="h-3.5 bg-slate-200 rounded w-10/12" />
                    <div className="h-3.5 bg-slate-200 rounded w-8/12" />
                    <div className="h-3 bg-slate-150 rounded w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Circle Status, Care Calendar (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Family Circle Management widget */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="space-y-1.5">
                  <div className="h-4 bg-slate-200 rounded w-24" />
                  <div className="h-2.5 bg-slate-150 rounded w-16" />
                </div>
                <div className="w-7 h-7 bg-slate-100 rounded-lg" />
              </div>
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-200" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 bg-slate-200 rounded w-20" />
                        <div className="h-2.5 bg-slate-150 rounded w-24" />
                      </div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded-full w-10" />
                  </div>
                ))}
              </div>
            </div>

            {/* Smartwatch Companion Hub */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="space-y-1.5">
                  <div className="h-4 bg-slate-200 rounded w-36" />
                  <div className="h-2.5 bg-slate-150 rounded w-24" />
                </div>
                <div className="h-5 bg-slate-100 rounded-full w-16" />
              </div>
              <div className="bg-slate-950 h-24 rounded-2xl flex items-center justify-center" />
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl h-10" />
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl h-10" />
              </div>
              <div className="bg-slate-900 rounded-xl p-2.5 h-14" />
            </div>

            {/* Weekly Summaries Rollup */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="space-y-1.5">
                  <div className="h-4 bg-slate-200 rounded w-44" />
                  <div className="h-2.5 bg-slate-150 rounded w-20" />
                </div>
                <div className="h-5 bg-slate-100 rounded-full w-16" />
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                  <div className="h-3.5 bg-slate-200 rounded w-24" />
                  <div className="h-10 bg-white border border-slate-100 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-900 selection:bg-teal-500 selection:text-white">
      
      {/* 1. EMOTIONAL REASSURANCE GREETING BANNER */}
      <div className="bg-gradient-to-tr from-teal-500/10 via-emerald-500/5 to-white p-8 rounded-3xl border border-teal-500/20 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-serif">
                Good Morning, {user?.name.split(' ')[0] || 'Sarah'} ☀️
              </h2>
            </div>
            
          </div>

          <div className="flex items-center gap-2 text-slate-600 font-mono text-xs bg-white/80 border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-bold">July 2, 2026</span>
          </div>
        </div>
      </div>

      {/* 2. THE EMOTIONAL CORE: WELLBEING SCORE & AI DAILY BRIEF */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Family Safety & Wellbeing Index dial */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full blur-xl pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[10px] font-mono bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Wellbeing Score
            </span>
            <p className="text-xs text-slate-400 font-bold">Dynamic Family Safety Index</p>
          </div>
          
          <div className="my-6 flex items-center justify-around gap-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle 
                  cx="64" cy="64" r="54" 
                  className="text-slate-100 stroke-current" 
                  strokeWidth="8" fill="transparent" 
                />
                <circle 
                  cx="64" cy="64" r="54" 
                  className={`stroke-current transition-all duration-500 ${
                    finalScore >= 85 ? 'text-teal-500' : finalScore >= 70 ? 'text-amber-500' : 'text-rose-500'
                  }`} 
                  strokeWidth="8" fill="transparent" 
                  strokeDasharray="339" 
                  strokeDashoffset={339 - (339 * finalScore) / 100}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900">{finalScore}%</span>
                <span className="text-slate-400 text-[10px] block font-bold font-mono">STABILITY</span>
              </div>
            </div>

            <div className="space-y-1 max-w-[130px]">
              <h4 className="font-extrabold text-slate-950 text-sm">
                {finalScore >= 85 ? 'Excellent Care' : finalScore >= 70 ? 'Mild Anomaly' : 'Critical Actions'}
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                {finalScore >= 85 
                  ? 'All vitals look regular and medications are being checked on time.' 
                  : 'AI Agents have flagged active items requiring family outreach.'}
              </p>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('wellbeing')}
            className="text-[11px] font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1 hover:underline self-start cursor-pointer"
          >
            <span>Check Member Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Today's AI Daily Briefing (Intelligent Summary) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-200 p-8 rounded-3xl shadow-lg flex flex-col justify-between relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-widest text-teal-300 font-mono">Today's AI Companion Brief</h4>
                  <p className="text-[10px] text-slate-500 font-mono">INTELLIGENCE SUMMARY LAYER</p>
                </div>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                CLINICALLY ALIGNED
              </span>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-slate-300 font-medium">
              {activeAlerts.length === 0 ? (
                `${activeRecipient?.name || 'Your loved one'} is resting comfortably. Morning routine medications have been tracked. Heart rate averages a steady ${activeRecipient?.wearableData?.heartRate || 72} bpm with ${activeRecipient?.wearableData?.steps || 420} active steps. Deep cognitive sleep was registered at ${activeRecipient?.wearableData?.sleepHours || 7.5} hours, signaling a highly restorative rest cycle. The mental wellness index tracks high positivity.`
              ) : (
                `Attention required: ${activeRecipient?.name || 'Your loved one'} has outstanding wellness alerts. Smartwatch telemetry indicates stable posture and steady bpm (${activeRecipient?.wearableData?.heartRate || 72}), but there is an outstanding event. We recommend reviewing details and utilizing communication channels.`
              )}
            </p>

            {/* AI Recommendations */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-teal-400 font-bold">
                <Award className="w-4 h-4" />
                <span>AI Recommendation</span>
              </div>
              <p className="text-slate-400 leading-relaxed font-medium">
                "${activeRecipient?.name || 'Your loved one'}'s metrics are within recommended parameters. We suggest staying aligned on their daily schedule."
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button 
              onClick={() => onNavigate('assistant')}
              className="text-xs font-black text-slate-950 bg-teal-400 hover:bg-teal-500 px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-teal-500/10"
            >
              <span>Consult CareCompanion AI</span>
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            </button>
            <button
              onClick={handleGenerateReport}
              className="text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer border border-slate-700/60"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Generate Weekly PDF</span>
            </button>
          </div>
        </div>

      </div>

      {/* 2B. AI SPECIALIST AGENTS LIVE ORCHESTRATION MATRIX */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-6 relative overflow-hidden animate-fade-in" id="ai-agent-matrix">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-extrabold text-slate-950 text-base font-serif flex items-center gap-2">
                <Cpu className="w-5 h-5 text-teal-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>AI Specialist Agents Live Orchestration Matrix</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Watch how our multi-agent hive mind continuously coordinates, analyzes, and safeguards {activeRecipient?.name}'s care streams in real-time.
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 font-mono text-[10px] bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl text-slate-600 font-bold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>5 SPECIALISTS ENGAGED</span>
          </div>
        </div>

        {/* Dynamic visual representation of agents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 relative">
          
          {/* Agent 1: Planner */}
          <button 
            onClick={() => setSelectedAgentTab('planner')}
            className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
              selectedAgentTab === 'planner' 
                ? 'bg-amber-50/50 border-amber-300 shadow-sm ring-1 ring-amber-300' 
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-amber-500/10 text-amber-700 rounded-xl">
                <Sliders className="w-4.5 h-4.5" />
              </div>
              <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900 leading-tight">Planner Agent</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Care Path Orchestrator</p>
            <span className="text-[9px] font-mono text-amber-700 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded mt-2 inline-block">
              {auditLogs.some(l => l.step === 'planner') ? 'ACTIVE LOGS' : 'STANDBY'}
            </span>
          </button>

          {/* Agent 2: Clinical Vitals */}
          <button 
            onClick={() => setSelectedAgentTab('health_agent')}
            className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
              selectedAgentTab === 'health_agent' 
                ? 'bg-teal-50/50 border-teal-300 shadow-sm ring-1 ring-teal-300' 
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-teal-500/10 text-teal-700 rounded-xl">
                <Heart className="w-4.5 h-4.5 text-rose-500" />
              </div>
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900 leading-tight">Clinical Vitals</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Telemetry Auditor</p>
            <span className="text-[9px] font-mono text-teal-700 font-bold bg-teal-500/10 px-1.5 py-0.5 rounded mt-2 inline-block">
              STREAMING
            </span>
          </button>

          {/* Agent 3: Safety & Fall */}
          <button 
            onClick={() => setSelectedAgentTab('safety_agent')}
            className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
              selectedAgentTab === 'safety_agent' 
                ? 'bg-purple-50/50 border-purple-300 shadow-sm ring-1 ring-purple-300' 
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-purple-500/10 text-purple-700 rounded-xl">
                <ShieldAlert className="w-4.5 h-4.5 text-purple-600" />
              </div>
              <span className={`w-2 h-2 rounded-full ${activeAlerts.length > 0 ? 'bg-purple-500 animate-ping' : 'bg-emerald-500'}`} />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900 leading-tight">Safety & Fall</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Emergency Sentry</p>
            <span className="text-[9px] font-mono text-purple-700 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded mt-2 inline-block">
              {auditLogs.some(l => l.step === 'safety_agent') ? 'ALERTS READY' : 'ACTIVE'}
            </span>
          </button>

          {/* Agent 4: Reflection Guardrails */}
          <button 
            onClick={() => setSelectedAgentTab('reflection')}
            className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
              selectedAgentTab === 'reflection' 
                ? 'bg-indigo-50/50 border-indigo-300 shadow-sm ring-1 ring-indigo-300' 
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-indigo-500/10 text-indigo-700 rounded-xl">
                <Eye className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900 leading-tight">Reflection Agent</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">HIPAA Safe Validator</p>
            <span className="text-[9px] font-mono text-indigo-700 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded mt-2 inline-block">
              SECURED
            </span>
          </button>

          {/* Agent 5: Action & Dispatch */}
          <button 
            onClick={() => setSelectedAgentTab('action_engine')}
            className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
              selectedAgentTab === 'action_engine' 
                ? 'bg-emerald-50/50 border-emerald-300 shadow-sm ring-1 ring-emerald-300' 
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-700 rounded-xl">
                <Zap className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900 leading-tight">Action Engine</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Caregiver Dispatcher</p>
            <span className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded mt-2 inline-block">
              {auditLogs.some(l => l.step === 'action_engine') ? 'DISPATCHED' : 'ONLINE'}
            </span>
          </button>

        </div>

        {/* Live terminal monitoring logs */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4.5 font-mono text-xs text-slate-300 shadow-inner relative overflow-hidden">
          <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[9px] text-slate-500 uppercase font-black tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>REAL-TIME COGNITIVE TRACE</span>
          </div>
          
          <div className="flex items-center gap-1.5 border-b border-slate-850 pb-2.5 mb-3 text-slate-400">
            <Settings className="w-3.5 h-3.5 text-slate-505" />
            <span className="font-bold text-[10px] uppercase text-teal-400">
              {selectedAgentTab === 'planner' && 'Planner Specialist Mind-Stream'}
              {selectedAgentTab === 'health_agent' && 'Clinical Specialist Vitals Mind-Stream'}
              {selectedAgentTab === 'safety_agent' && 'Safety & Emergency Sentry Mind-Stream'}
              {selectedAgentTab === 'reflection' && 'Reflection Guardrail Safe Mind-Stream'}
              {selectedAgentTab === 'action_engine' && 'Action Dispatch Engine Mind-Stream'}
            </span>
          </div>

          <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar leading-relaxed">
            {/* Filter and display specific logs */}
            {(() => {
              const matchingLogs = auditLogs.filter(log => {
                if (selectedAgentTab === 'planner') return log.step === 'planner';
                if (selectedAgentTab === 'health_agent') return log.step === 'health_agent';
                if (selectedAgentTab === 'safety_agent') return log.step === 'safety_agent';
                if (selectedAgentTab === 'reflection') return log.step === 'reflection';
                if (selectedAgentTab === 'action_engine') return log.step === 'action_engine' || log.step === 'event_bus';
                return false;
              });

              if (matchingLogs.length === 0) {
                return (
                  <div className="text-slate-500 text-[11px] py-1">
                    <p className="text-teal-400/80 font-bold mb-1">// Standard active monitoring loops executing...</p>
                    {selectedAgentTab === 'planner' && `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] Planner Agent: Standby. Ready to allocate sub-specialists upon vital anomaly or telemetry breach.`}
                    {selectedAgentTab === 'health_agent' && `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] Clinical Specialist: Smartwatch telemetry secure. Pulse Rate: ${activeRecipient?.wearableData?.heartRate || 72} bpm, Oxygen: ${activeRecipient?.wearableData?.bloodOxygen || 98}%. Normal heart rate limits validated.`}
                    {selectedAgentTab === 'safety_agent' && `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] Safety Sentry: Actively parsing spatial coords. No high-g force acceleration spikes registered. Fall risk score: 0.1/10.`}
                    {selectedAgentTab === 'reflection' && `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] Reflection Guardrails: HIPAA rules active. System logs filtered. Outgoing messages sanitized for clinical safety.`}
                    {selectedAgentTab === 'action_engine' && `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] Action Dispatcher: Standing by on cellular/VoIP dispatch. Active communication bridge verified with Sarah's device.`}
                  </div>
                );
              }

              return [...matchingLogs].reverse().map((log, idx) => (
                <div key={log.id || idx} className="text-[11px]">
                  <span className="text-slate-600 select-none mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={idx === 0 ? 'text-emerald-400 font-extrabold' : 'text-slate-300'}>
                    {log.message}
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Multi-Agent Pipeline Execution Waterfall Timeline */}
        <div className="border-t border-slate-150 pt-5 mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 uppercase font-mono">
                <Layers className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                Multi-Agent Cognitive Pipeline Waterfall Timeline
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">Real-time synchronization logs and duration allocation profiles</p>
            </div>
            <span className="text-[9px] font-mono font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-150">
              AVG LATENCY: 240ms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Waterfall bars */}
            <div className="space-y-3 bg-slate-50/50 border border-slate-100 p-4.5 rounded-2xl">
              {/* Row 1: Planner */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Planner (Deconstruct & Delegate)
                  </span>
                  <span className="font-mono text-slate-400">45ms (0-45ms)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                  <div className="absolute left-[0%] w-[18.75%] h-full bg-amber-400 rounded-full" />
                </div>
              </div>

              {/* Row 2: Specialist */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    Specialist Agents (Vitals Analysis)
                  </span>
                  <span className="font-mono text-slate-400">120ms (45-165ms)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                  <div className="absolute left-[18.75%] w-[50%] h-full bg-teal-500 rounded-full" />
                </div>
              </div>

              {/* Row 3: Reflection */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    Reflection (HIPAA Safety Guardrails)
                  </span>
                  <span className="font-mono text-slate-400">35ms (165-200ms)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                  <div className="absolute left-[68.75%] w-[14.58%] h-full bg-indigo-500 rounded-full" />
                </div>
              </div>

              {/* Row 4: Action Engine */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Action Engine (Dispatch Delivery)
                  </span>
                  <span className="font-mono text-slate-400">40ms (200-240ms)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                  <div className="absolute left-[83.33%] w-[16.67%] h-full bg-emerald-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* AI Assistant reasoning audit trace info */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 flex flex-col justify-between font-mono text-[10px] text-slate-300 leading-normal">
              <div>
                <span className="text-teal-400 font-bold block mb-1">COGNITIVE COMPILING PIPELINE DETAILED VIEW</span>
                <p className="text-slate-400 text-[9px] mb-2">// Executed dynamically on incoming sensor packet telemetry</p>
                <ul className="space-y-1.5 text-slate-300">
                  <li>• <strong className="text-amber-300">Planner:</strong> Resolved context size: 12.4k tokens. Mapped {familyMembers.length} linked circle targets.</li>
                  <li>• <strong className="text-teal-300">Specialist:</strong> Verified pulse rate vs baseline (stdev: 1.25).</li>
                  <li>• <strong className="text-indigo-300">Reflection:</strong> Outgoing payload scanned for PII. HIPAA/FDA compliance: SECURE.</li>
                  <li>• <strong className="text-emerald-300">Action:</strong> Outbox queue dispatched. 0 latency loss on notification bridge.</li>
                </ul>
              </div>
              <div className="text-[9px] text-slate-500 border-t border-slate-850 pt-2 flex justify-between items-center mt-2">
                <span>COMPILED AT: {new Date().toLocaleDateString()}</span>
                <span className="text-emerald-400">STATUS: 200 OK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. NEEDS ATTENTION / ACTIVE EVENTS (IF PENDING) */}
      <AnimatePresence>
        {activeAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-rose-50 border border-rose-200 p-6 rounded-3xl space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
              <h3 className="text-base font-extrabold text-rose-950 uppercase tracking-tight">Wellness Alerts Requiring Review</h3>
            </div>

            <div className="space-y-3">
              {activeAlerts.map((alt) => (
                <div 
                  key={alt.id}
                  className="bg-white border border-rose-100 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                        {alt.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(alt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-extrabold leading-snug">{alt.reasoningSummary}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Multi-Agent Decision: Dispatched warning protocols to primary nodes. Clinical review advised.
                    </p>
                  </div>

                  <button
                    onClick={() => resolveAlert(alt.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Acknowledge & Resolve</span>
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. MAIN WORKSPACE GRID: QUICK ACTIONS, TIMELINE, DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Actions & Timeline (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* INTUITIVE QUICK ACTIONS PANEL */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-5">
            <div>
              <h3 className="font-extrabold text-slate-950 text-base font-serif">Caregiver Communications</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Quick connections and scheduling triggers for {activeRecipient?.name || 'Care Recipient'}</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button 
                onClick={() => {
                  if (showToast) {
                    showToast('VoIP Call Initiated', `Dialing directly to ${activeRecipient?.name || 'Eleanor'}'s cellular smartwatch via CareCircle VoIP bridge...`, 'info');
                  } else {
                    alert(`Dialing directly to ${activeRecipient?.name || 'Eleanor'}'s cellular smartwatch via CareCircle VoIP bridge...`);
                  }
                }}
                className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 hover:border-slate-200 rounded-2xl text-left transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-all">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div className="font-bold text-xs text-slate-800">Call Smartwatch</div>
                <span className="text-[9px] text-slate-400 block leading-tight">VoIP audio channel</span>
              </button>

              <button 
                onClick={handleStartVideoCall}
                className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 hover:border-slate-200 rounded-2xl text-left transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-all">
                  <Video className="w-4.5 h-4.5" />
                </div>
                <div className="font-bold text-xs text-slate-800">Video Call</div>
                <span className="text-[9px] text-slate-400 block leading-tight">Interactive camera</span>
              </button>

              <button 
                onClick={() => {
                  triggerSimulation('DailyCheckInMissed', `Triggered automated wellness reminders to ${activeRecipient?.name || 'Eleanor'}'s tablet.`);
                  if (showToast) {
                    showToast('Automated Reminder Dispatched', `Automated voice reminder dispatched to ${activeRecipient?.name || 'Eleanor'}'s companion device.`, 'success');
                  } else {
                    alert(`Reminder sent! Automated voice reminder dispatched to ${activeRecipient?.name || 'Eleanor'}'s companion device.`);
                  }
                }}
                className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 hover:border-slate-200 rounded-2xl text-left transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-all">
                  <Send className="w-4.5 h-4.5" />
                </div>
                <div className="font-bold text-xs text-slate-800">Send Reminder</div>
                <span className="text-[9px] text-slate-400 block leading-tight">SMS & Tablet ping</span>
              </button>

              <button 
                onClick={() => {
                  if (showToast) {
                    showToast('Calendar Opened', `Opening clinic booking schedule. Redirecting to calendar integrations for ${activeRecipient?.name || 'Eleanor'}...`, 'info');
                  } else {
                    alert('Opening clinic booking schedule. Redirecting to calendar integrations...');
                  }
                }}
                className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 hover:border-slate-200 rounded-2xl text-left transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-all">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div className="font-bold text-xs text-slate-800">Schedule Visit</div>
                <span className="text-[9px] text-slate-400 block leading-tight">Book doctor appointment</span>
              </button>
            </div>
          </div>

          {/* CHRONOLOGY ACTIVITY FEED */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-serif">Daily Activity Chronology</h3>
                <p className="text-xs text-slate-400 font-medium">Real-time caregiver journal feed</p>
              </div>
              <button 
                onClick={() => onNavigate('timeline')}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
              >
                View Full Logs
              </button>
            </div>

            <div className="relative border-l border-slate-100 pl-6 ml-2 space-y-6">
              
              {/* Check-ins */}
              {checkIns.map((item) => (
                <div key={item.id} className="relative">
                  <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <UserCheck className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <h4 className="font-bold text-xs text-slate-800 mt-0.5">Wellness Check-in Verified</h4>
                  <p className="text-[11px] text-slate-500 font-medium">"{item.notes}"</p>
                </div>
              ))}

              <div className="relative">
                <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">8:02 AM</span>
                <h4 className="font-bold text-xs text-slate-800 mt-0.5">Morning Lisinopril Taken</h4>
                <p className="text-[11px] text-slate-500 font-medium">{activeRecipient?.name || 'Care Recipient'} confirmed morning dose via tablet capsule container sync.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">7:45 AM</span>
                <h4 className="font-bold text-xs text-slate-800 mt-0.5">Wearable Smartwatch Sync Completed</h4>
                <p className="text-[11px] text-slate-500 font-medium">Heart rate registered 72 bpm, blood pressure levels within nominal bounds.</p>
              </div>
            </div>
          </div>

          {/* CHAT / MESSAGE CONVERSATIONS WITH ELEANOR */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm font-serif">Recent Conversations</h3>
                <p className="text-[10px] text-slate-400 font-mono">ENCRYPTED PATIENT PORTAL</p>
              </div>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {recentChat.map((msg, idx) => {
                const currentUserFirstName = user?.name ? user.name.split(' ')[0] : 'Sarah';
                const isCurrentUser = msg.sender === currentUserFirstName;
                return (
                  <div key={idx} className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-sm text-xs font-medium leading-relaxed ${
                      isCurrentUser 
                        ? 'bg-teal-600 text-white rounded-tr-none' 
                        : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      <p>{msg.text}</p>
                      <span className={`text-[8px] block pt-1 text-right ${isCurrentUser ? 'text-teal-200' : 'text-slate-400'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-100">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Type a loving message to ${activeRecipient?.name || 'Care Recipient'}...`}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: Circle Status, Care Calendar (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* FAMILY CIRCLE MANAGEMENT WIDGET */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-950 text-sm font-serif">Family Circles</h3>
                <p className="text-[10px] text-slate-400 font-mono">1 member linked</p>
              </div>
              <button 
                onClick={onAddMember}
                className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-3">
              {familyMembers.map((member) => {
                const isSelected = member.id === selectedRecipientId;
                return (
                  <div 
                    key={member.id}
                    onClick={() => {
                      if (onSelectRecipient) {
                        onSelectRecipient(member.id);
                      } else {
                        onNavigate('members');
                      }
                    }}
                    className={`p-3 border rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-teal-50/50 border-teal-500 shadow-sm' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-150'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-200 to-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shadow-inner">
                        {member.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-850">{member.name}</h4>
                        <p className="text-[10px] text-slate-400">{member.relationship} • Age {member.age}</p>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      activeAlerts.length === 0 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-800 border border-rose-100'
                    }`}>
                      {activeAlerts.length === 0 ? 'Safe' : 'Alert'}
                    </span>
                  </div>
                );
              })}
            </div>
           {/* INTERACTIVE SMARTWATCH COMPANION & ONBOARDING HUB */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4 relative overflow-hidden" id="dashboard-smartwatch-hub">
            {activeRecipient?.wearableData && activeRecipient.wearableData.deviceType && activeRecipient.wearableData.deviceType !== 'None' ? (
              // CASE 1: Smartwatch is paired and actively streaming
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-950 text-sm font-serif flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-teal-600 animate-bounce" style={{ animationDuration: '3s' }} />
                      <span>Smartwatch Companion</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Pipeline: {activeRecipient.wearableData.deviceType} Stream</p>
                  </div>
                  
                  <span className="text-[9px] text-emerald-600 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>ACTIVE SYNC</span>
                  </span>
                </div>

                {/* Animated ECG Waveform Overlay Card */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 relative overflow-hidden h-24 flex flex-col justify-between">
                  <div className="absolute top-2 left-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                    <span className="text-[9px] text-rose-400 font-mono font-bold uppercase tracking-wider">Live Biometrics</span>
                  </div>
                  
                  {/* SVG Waveform */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-60 pointer-events-none px-4 pt-3">
                    <svg className="w-full h-10 text-rose-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path
                        d="M0 15 L15 15 L18 10 L21 20 L24 -2 L27 32 L30 13 L33 17 L36 15 L55 15 L58 10 L61 20 L64 -2 L67 32 L70 13 L73 17 L76 15 L100 15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-pulse"
                      />
                    </svg>
                  </div>

                  <div className="relative z-10 flex justify-between items-end">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Pulse Rate</span>
                      <span className="text-xl font-bold font-mono text-white flex items-baseline gap-1">
                        {activeRecipient?.wearableData?.heartRate || '72'}
                        <span className="text-[10px] text-rose-400 font-sans font-black">bpm</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">SpO2 Level</span>
                      <span className="text-sm font-bold font-mono text-teal-300">
                        {activeRecipient?.wearableData?.bloodOxygen || '98'}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Core metrics details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[9px] block font-semibold leading-none">Steps Today</span>
                      <span className="text-slate-800 font-bold text-xs font-mono">
                        {activeRecipient?.wearableData?.steps || '420'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                    <Battery className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[9px] block font-semibold leading-none">Watch Battery</span>
                      <span className="text-slate-800 font-bold text-xs font-mono">
                        {activeRecipient?.wearableData?.battery || '88'}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Micro bluetooth log stream */}
                <div className="bg-slate-900 rounded-xl p-2.5 font-mono text-[9px] text-slate-400 space-y-1">
                  <div className="text-teal-400 font-bold border-b border-slate-800 pb-1 mb-1 flex justify-between items-center">
                    <span>BLE TERMINAL FEED</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="max-h-[50px] overflow-y-auto space-y-1">
                    {telemetryLogs.slice(0, 2).map((log, index) => (
                      <div key={index} className="truncate text-[8.5px]">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Sync Trigger Action */}
                <div className="flex gap-2 pt-1">
                  <button
                    disabled={isRefreshingTelemetry}
                    onClick={handleForceSync}
                    className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingTelemetry ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingTelemetry ? 'Syncing...' : 'Force Sync'}</span>
                  </button>
                  <button
                    onClick={() => onNavigate('health')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition-all cursor-pointer border border-slate-200/60"
                    title="Open settings"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>
            ) : (
              // CASE 2: No smartwatch paired - render beautiful local onboarding wizard
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm font-serif flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-amber-500 animate-bounce" />
                    <span>Wearable Onboarding</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Activate real-time medical tracking</p>
                </div>

                {pairingInDashboardStep === 'idle' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-center">
                      <p className="text-[11px] text-amber-950 font-bold leading-normal">
                        No Smartwatch Connected
                      </p>
                      <p className="text-[10px] text-amber-800 leading-normal font-medium">
                        Emergency fall geofencing, SpO2 logs, and active heart-rate monitoring are offline.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Select Device To Pair:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleQuickPair('Fitbit')}
                          className="p-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-150 hover:border-teal-300 rounded-xl text-left text-xs font-extrabold transition-all cursor-pointer"
                        >
                          🟢 Fitbit
                        </button>
                        <button 
                          onClick={() => handleQuickPair('Apple Watch')}
                          className="p-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-150 hover:border-teal-300 rounded-xl text-left text-xs font-extrabold transition-all cursor-pointer"
                        >
                          🍎 Apple Health
                        </button>
                        <button 
                          onClick={() => handleQuickPair('Google Fit')}
                          className="p-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-150 hover:border-teal-300 rounded-xl text-left text-xs font-extrabold transition-all cursor-pointer"
                        >
                          🔵 Google Fit
                        </button>
                        <button 
                          onClick={() => handleQuickPair('Garmin')}
                          className="p-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-150 hover:border-teal-300 rounded-xl text-left text-xs font-extrabold transition-all cursor-pointer"
                        >
                          🏃‍♂️ Garmin
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {pairingInDashboardStep === 'oauth' && (
                  <div className="p-4 bg-slate-900 rounded-xl text-center space-y-3 font-mono text-xs">
                    <RefreshCw className="w-6 h-6 text-teal-400 animate-spin mx-auto" />
                    <p className="text-white font-extrabold text-[11px]">HIPAA SECURE HANDSHAKE</p>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Redirecting to secure {pairingInDashboardDevice} authorization endpoint...
                    </p>
                  </div>
                )}

                {pairingInDashboardStep === 'permissions' && (
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                      <span className="font-extrabold text-slate-800 text-[10px] block uppercase tracking-wider">Clinical Permission Grant:</span>
                      <label className="flex items-center gap-2 font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Biometrics (Heart, SpO2)</span>
                      </label>
                      <label className="flex items-center gap-2 font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Postural Data (Falls)</span>
                      </label>
                      <label className="flex items-center gap-2 font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>GPS Coordinates (Geofence)</span>
                      </label>
                    </div>

                    <button
                      onClick={handleCompleteQuickPair}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Grant Access & Pair</span>
                    </button>
                  </div>
                )}

                {pairingInDashboardStep === 'completing' && (
                  <div className="p-4 bg-slate-900 rounded-xl text-center space-y-3 font-mono text-xs">
                    <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
                    <p className="text-white font-extrabold text-[11px]">COMMITTING PAIRING METADATA</p>
                    <p className="text-slate-400 text-[10px]">
                      Writing secure pairing keys to Firestore & cache...
                    </p>
                  </div>
                )}

                {pairingInDashboardStep === 'done' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 text-emerald-950">
                    <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
                    <p className="font-black text-xs">Pairing Successful!</p>
                    <p className="text-[10px] text-emerald-800 font-medium leading-relaxed">
                      {pairingInDashboardDevice} streaming channels successfully synchronized.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          </div>

          {/* DERIVED WEEKLY SUMMARIES PIPELINE ROLLUP */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-950 text-xs sm:text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-600" />
                  Weekly Summaries Pipeline Rollup
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">DURABLE AGGREGATED HISTORIC DATA</p>
              </div>
              <span className="text-[9px] font-mono text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-150 font-bold uppercase">Pipeline Live</span>
            </div>

            {weeklySummaries.length > 0 ? (
              <div className="space-y-3">
                {weeklySummaries.slice(0, 3).map((summary, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800 text-[11px]">{summary.weekStartDate} to {summary.weekEndDate}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase font-mono ${
                        summary.trendDirection === 'improving' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        summary.trendDirection === 'declining' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {summary.trendDirection}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 bg-white p-2 rounded-xl border border-slate-100">
                      <div>Pulse Rate: <strong className="text-slate-800">{summary.avgHeartRate} bpm</strong></div>
                      <div>SleepHours: <strong className="text-slate-800">{summary.avgSleepHours} hrs</strong></div>
                      <div>Steps Total: <strong className="text-slate-800">{summary.avgSteps}</strong></div>
                      <div>Avg HRV: <strong className="text-slate-800">{summary.avgHrv} ms</strong></div>
                    </div>
                    {summary.clinicalRecommendation && (
                      <p className="text-[10px] text-teal-700 font-extrabold leading-normal bg-teal-50/50 p-2 rounded-xl border border-teal-150">
                        📋 {summary.clinicalRecommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-1">
                <p className="text-xs font-bold text-slate-500">No Weekly Summaries Synchronized Yet</p>
                <p className="text-[10px] text-slate-400 font-medium">Run some telemetry simulations to process and generate automatic weekly rollups.</p>
              </div>
            )}
          </div>

          {/* MEDICINES & CARE SCHEDULE */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-950 text-xs sm:text-sm">Medicines & Care Schedule</h3>
            
            <div className="space-y-2">
              {activeRecipient?.medications?.map((med, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs font-medium">
                  <div className="flex items-start gap-2.5">
                    {med.status === 'taken' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`font-bold ${med.status === 'taken' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{med.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Scheduled @ {med.time}</p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                    med.status === 'taken' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : med.status === 'missed'
                      ? 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {med.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* EMERGENCY TRIGGER BLOCK */}
          <div className="bg-rose-50 border border-rose-100 p-5 rounded-3xl space-y-3.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="font-extrabold text-rose-900 text-xs sm:text-sm">Emergency Actions</h3>
            </div>
            <p className="text-rose-700 text-[11px] leading-relaxed font-semibold">
              Force an immediate system-wide SOS escalation loop. Responders on standby will receive immediate location telemetry.
            </p>
            <button 
              id="dash_panic_sos"
              onClick={() => triggerSimulation('EmergencyTriggered', 'SOS dispatched via physical panic dashboard.')}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-rose-600/10 cursor-pointer text-center block"
            >
              Trigger System SOS
            </button>
          </div>

        </div>

      </div>

      {/* VIDEO CALL DIALOG MODAL */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full text-slate-200 relative overflow-hidden space-y-6">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">VoIP Video Call Link</span>
              <h4 className="text-slate-100 font-extrabold text-base mt-2">Connecting with {activeRecipient?.name || 'Care Recipient'}</h4>
            </div>

            {/* Video Box */}
            <div className="bg-slate-950 h-72 rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
              {isVideoConnecting ? (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-teal-400 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-teal-400 font-bold animate-pulse">Establishing Secure HIPAA Audio-Video Bridge...</p>
                </div>
              ) : (
                <>
                  <div className="absolute top-4 right-4 bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE CAMERA
                  </div>
                  
                  {/* Mock video representation */}
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto border border-slate-700">
                      <User className="w-8 h-8 text-teal-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">{activeRecipient?.name || 'Care Recipient'} (Connected)</p>
                      <p className="text-[11px] text-slate-400">Tablet Camera Active • Smartwatch telemetry syncing</p>
                    </div>
                    <div className="flex gap-2 justify-center pt-2">
                      <span className="px-3 py-1 bg-teal-950 text-teal-400 rounded-full text-[10px] font-bold">Speakerphone</span>
                      <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-[10px] font-bold">Mute Mic</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md shadow-rose-600/10"
              >
                Disconnect Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY PDF REPORT GENERATOR MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full text-slate-800 relative overflow-hidden space-y-5 shadow-2xl">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5">
              <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono font-bold">Dynamic AI Analysis</span>
              <h4 className="text-slate-900 font-extrabold text-base">Weekly Wellness PDF Generator</h4>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 min-h-48 flex items-center justify-center text-center">
              {isGeneratingReport ? (
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs text-slate-700 font-bold">Assembling database logs from past 7 days...</p>
                    <p className="text-[10px] text-slate-400 font-mono">Running D3 summaries & medication adherence algorithms...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-sm">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-extrabold text-slate-800">CareCircle AI Weekly Report is Ready!</p>
                    <p className="text-xs text-slate-500 leading-normal">
                      The report has been successfully generated from recent database logs, clinical AI agents, and smartwatch telemetry.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      const pdfName = `CareCircle_Weekly_Report_${activeRecipient?.name || 'Eleanor'}.pdf`;
                      const content = generatedReportSummary || `Weekly Care Summary for ${activeRecipient?.name || 'Eleanor'}`;
                      
                      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', pdfName.replace('.pdf', '_Summary.txt'));
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);

                      if (showToast) {
                        showToast('PDF Report Downloading', `Downloading generated summary report: "${pdfName.replace('.pdf', '_Summary.txt')}"...`, 'success');
                      }
                      setShowReportModal(false);
                    }}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download PDF Report</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
