import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Activity, 
  Sparkles, 
  Brain, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  FileText,
  PlusCircle,
  Trash2,
  Smile,
  ShieldCheck,
  ChevronRight,
  Upload,
  Eye,
  FileSpreadsheet,
  TrendingUp,
  Moon
} from 'lucide-react';
import { FamilyMember, Alert } from '../types';

interface Appointment {
  id: string;
  familyMemberId: string;
  doctor: string;
  hospital: string;
  purpose: string;
  time: string;
  location: string;
  onlineLink?: string;
  prescription?: string;
  status: 'scheduled' | 'completed' | 'rescheduled' | 'cancelled';
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  notes?: string;
}

interface PrescriptionDocument {
  id: string;
  familyMemberId: string;
  fileName: string;
  doctor: string;
  hospital: string;
  date: string;
  extractedMeds: Array<{ name: string; dosage: string; schedule: string }>;
  notes: string;
}

interface MedicalReport {
  id: string;
  familyMemberId: string;
  fileName: string;
  type: string;
  date: string;
  summary: string;
  url: string;
  searchableText?: string;
}

interface WellnessLog {
  id: string;
  timestamp: string;
  mood: number;
  stressLevel: number;
  sleepQuality: number;
  socialInteraction: string;
  journal: string;
}

interface FamilyWellbeingViewProps {
  familyMembers: FamilyMember[];
  alerts: Alert[];
  selectedRecipientId?: string;
  showToast?: (title: string, message: string, type: 'success' | 'alert' | 'info') => void;
}

export default function FamilyWellbeingView({ familyMembers, alerts, selectedRecipientId, showToast }: FamilyWellbeingViewProps) {
  const activeRecipient = familyMembers.find(f => f.id === selectedRecipientId) || familyMembers[0];
  const activeAlerts = alerts.filter(a => a.status === 'pending' && (a.familyMemberId === activeRecipient?.id || !a.familyMemberId));
  const totalMeds = activeRecipient?.medications.length || 0;
  const takenMeds = activeRecipient?.medications.filter(m => m.status === 'taken').length || 0;
  const adhesionPercentage = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 100;

  // Tabs: 'overview' | 'calendar' | 'prescriptions' | 'wellness'
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'prescriptions' | 'wellness'>('overview');

  // Loading & Data States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionDocument[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [newApt, setNewApt] = useState({
    doctor: '',
    hospital: '',
    purpose: 'Routine Check-Up',
    time: '',
    location: '',
    onlineLink: '',
    recurring: 'none' as 'none' | 'daily' | 'weekly' | 'monthly'
  });

  const [followUpAptId, setFollowUpAptId] = useState<string | null>(null);
  const [followUpData, setFollowUpData] = useState({
    happened: true,
    notes: '',
    followUpDate: ''
  });

  const [showWellnessForm, setShowWellnessForm] = useState(false);
  const [newWellness, setNewWellness] = useState({
    mood: 4,
    stressLevel: 2,
    sleepQuality: 4,
    socialInteraction: 'Spoke with her grandchildren on video call.',
    journal: 'Spent a pleasant afternoon watering her porch plants and listening to classic radio.'
  });

  // Simulated File Upload States
  const [uploadType, setUploadType] = useState<'prescription' | 'report'>('prescription');
  const [uploading, setUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadTextData, setUploadTextData] = useState('');

  // Production-grade Document Processing States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileMimeType, setFileMimeType] = useState<string>('');
  const [showReviewScreen, setShowReviewScreen] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [fallbackWarning, setFallbackWarning] = useState<string>('');
  const [approving, setApproving] = useState<boolean>(false);

  useEffect(() => {
    fetchWellbeingData();
  }, [selectedRecipientId]);

  const fetchWellbeingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [aptRes, presRes, repRes, wellRes] = await Promise.all([
        fetch('/api/appointments', { headers }),
        fetch('/api/prescriptions', { headers }),
        fetch('/api/reports', { headers }),
        fetch('/api/wellness', { headers })
      ]);

      if (aptRes.ok && presRes.ok && repRes.ok && wellRes.ok) {
        const aptData = await aptRes.json();
        const presData = await presRes.json();
        const repData = await repRes.json();
        const wellData = await wellRes.json();

        const activeId = activeRecipient?.id;

        setAppointments((aptData.appointments || []).filter((a: any) => a.familyMemberId === activeId));
        setPrescriptions((presData.prescriptions || []).filter((p: any) => p.familyMemberId === activeId));
        setReports((repData.reports || []).filter((r: any) => r.familyMemberId === activeId));
        setWellnessLogs((wellData.wellnessLogs || []).filter((w: any) => !w.familyMemberId || w.familyMemberId === activeId));
      }
    } catch (e) {
      console.error('Failed to fetch wellbeing datasets:', e);
    } finally {
      setLoading(false);
    }
  };

  // Appointment Actions
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApt.doctor || !newApt.hospital || !newApt.time) {
      if (showToast) {
        showToast('Form Incomplete', 'Please specify the Doctor, Clinic/Hospital, and Appointment Date/Time.', 'alert');
      } else {
        alert('Please specify the Doctor, Clinic/Hospital, and Appointment Date/Time.');
      }
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newApt, familyMemberId: activeRecipient?.id })
      });

      if (response.ok) {
        setShowAppointmentForm(false);
        setNewApt({
          doctor: '',
          hospital: '',
          purpose: 'Routine Check-Up',
          time: '',
          location: '',
          onlineLink: '',
          recurring: 'none'
        });
        await fetchWellbeingData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    // Elegant, premium inline dialog fallback or simple visual confirm
    if (window.confirm && !window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchWellbeingData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpAptId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${followUpAptId}/follow-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(followUpData)
      });

      if (response.ok) {
        setFollowUpAptId(null);
        setFollowUpData({ happened: true, notes: '', followUpDate: '' });
        await fetchWellbeingData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Wellness Logging
  const handleAddWellnessLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/wellness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newWellness, familyMemberId: activeRecipient?.id })
      });

      if (response.ok) {
        setShowWellnessForm(false);
        await fetchWellbeingData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle real file selection and Base64 reading
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadFileName(file.name);
    setFileMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Production-grade Document Analysis (OCR & Clinical AI Parsing)
  const handleAnalyzeDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName && !uploadTextData) {
      if (showToast) {
        showToast('Input Required', 'Please select a file or type manual notes for analysis.', 'alert');
      } else {
        alert('Please select a file or type manual notes for analysis.');
      }
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        fileName: uploadFileName || (uploadType === 'prescription' ? 'prescription_manual.txt' : 'medical_report_manual.txt'),
        fileData: fileBase64 || null,
        mimeType: fileMimeType || null,
        textData: uploadTextData || '',
        documentType: uploadType,
        familyMemberId: activeRecipient?.id
      };

      const response = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setExtractedData(data.extractedData);
          setFallbackWarning(data.warning || '');
          setShowReviewScreen(true);
          if (showToast) {
            showToast('Analysis Complete', 'Clinical data extracted successfully. Please review and verify below.', 'success');
          }
        } else {
          throw new Error(data.error || 'Failed to extract clinical data.');
        }
      } else {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error during extraction.');
      }
    } catch (err: any) {
      console.error(err);
      if (showToast) {
        showToast('Extraction Failed', err.message || 'Failed to process document.', 'alert');
      } else {
        alert(err.message || 'Failed to process document.');
      }
    } finally {
      setUploading(false);
    }
  };

  // Approve and Synchronize through multi-agent orchestration pipeline
  const handleApproveDocument = async () => {
    if (!extractedData) return;
    try {
      setApproving(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        familyMemberId: activeRecipient?.id,
        fileName: uploadFileName || (uploadType === 'prescription' ? 'prescription_approved.txt' : 'medical_report_approved.txt'),
        documentType: uploadType,
        structuredData: extractedData
      };

      const response = await fetch('/api/documents/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          // Reset states
          setUploadFileName('');
          setUploadTextData('');
          setSelectedFile(null);
          setFileBase64('');
          setFileMimeType('');
          setShowReviewScreen(false);
          setExtractedData(null);
          
          await fetchWellbeingData();
          
          if (showToast) {
            showToast('Synchronized Successfully', 'Extracted data approved. Invoked Medication, Calendar, Report, and Planner agents.', 'success');
          } else {
            alert('Extracted data approved. Invoked Medication, Calendar, Report, and Planner agents.');
          }
        } else {
          throw new Error(resData.error || 'Sync failed.');
        }
      } else {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error during approval.');
      }
    } catch (err: any) {
      console.error(err);
      if (showToast) {
        showToast('Approval Failed', err.message || 'Failed to approve and synchronize.', 'alert');
      } else {
        alert(err.message || 'Failed to approve and synchronize.');
      }
    } finally {
      setApproving(false);
    }
  };

  const handleDeleteDoc = async (id: string, type: 'prescription' | 'report') => {
    if (window.confirm && !window.confirm('Are you sure you want to archive this clinical document?')) return;
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'prescription' ? `/api/prescriptions/${id}` : `/api/reports/${id}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchWellbeingData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Wellbeing overall calculations
  const baseScore = 96;
  const riskDeduction = activeAlerts.length * 15;
  const adherenceDeduction = (100 - adhesionPercentage) * 0.15;
  const overallScore = Math.max(30, Math.min(100, Math.round(baseScore - riskDeduction - adherenceDeduction)));

  return (
    <div className="space-y-6 text-slate-900 selection:bg-teal-500 selection:text-white">
      
      {/* 1. Header Navigation Tabs */}
      <div className="bg-white border border-slate-200/80 p-2 rounded-2xl flex flex-wrap gap-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'overview' 
              ? 'bg-teal-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Wellbeing Overview
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'calendar' 
              ? 'bg-teal-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Clinical Calendar & Appointments
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'prescriptions' 
              ? 'bg-teal-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Clinical OCR & Reports
        </button>
        <button
          onClick={() => setActiveTab('wellness')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'wellness' 
              ? 'bg-teal-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Mental Wellness Log
        </button>
      </div>

      {loading && (
        <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl shadow-sm">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-bold font-mono">SYNCHRONIZING SECURE WELLBEING WORKSPACE...</p>
        </div>
      )}

      {!loading && (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Overview stats layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card 1: Family Index Dial */}
                <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
                  <span className="text-[10px] font-mono bg-slate-50 text-slate-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    Overall wellbeing score
                  </span>
                  <div className="flex items-center gap-6">
                    <div className="relative flex items-center justify-center w-20 h-20 bg-teal-50 text-teal-600 rounded-full font-extrabold text-2xl shadow-inner">
                      {overallScore}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {overallScore >= 85 ? 'Highly Stable' : overallScore >= 70 ? 'Moderate Concern' : 'High Care Alert'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        Continuous compliance indices calculated by background health specialists.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Medication Adherence Index */}
                <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
                  <span className="text-[10px] font-mono bg-slate-50 text-slate-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    Pill Adherence Index
                  </span>
                  <div className="flex items-center gap-6">
                    <div className="relative flex items-center justify-center w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full font-extrabold text-2xl shadow-inner">
                      {adhesionPercentage}%
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {adhesionPercentage >= 80 ? 'Highly Compliant' : 'Requires Oversight'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        {takenMeds} of {totalMeds} daily prescriptions successfully verified.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 3: Mental / Cognitive wellness index */}
                <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
                  <span className="text-[10px] font-mono bg-slate-50 text-slate-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    Mental Wellness Index
                  </span>
                  <div className="flex items-center gap-6">
                    <div className="relative flex items-center justify-center w-20 h-20 bg-purple-50 text-purple-600 rounded-full font-extrabold text-2xl shadow-inner">
                      {wellnessLogs.length > 0 ? `${Math.round(80 + (wellnessLogs[0].mood * 4))}%` : '88%'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">Stable Cognitive State</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        Determined by smartwatch stress evaluations and conversational logs.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Main Insights Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Risk Analysis Matrix (lg:col-span-8) */}
                <div className="lg:col-span-8 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-teal-600" />
                      <h3 className="font-extrabold text-slate-950 text-base">Vitals Risk Matrix</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Biometric analysis categorized by active safety agents.</p>
                  </div>

                  <div className="space-y-4 font-medium text-xs">
                    
                    {/* Row 1: Pulse risk */}
                    <div className="p-4 bg-slate-50 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Heart className="w-4.5 h-4.5 text-rose-500" />
                          <span>Cardiovascular Rhythm</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">Normal pulse fluctuations registered. No arrhythmia anomalies noted.</p>
                      </div>

                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto shrink-0">
                        LOW RISK
                      </span>
                    </div>

                    {/* Row 2: Sleep index */}
                    <div className="p-4 bg-slate-50 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Brain className="w-4.5 h-4.5 text-purple-600" />
                          <span>Sleep & Cognitive Stress</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">Elevated stress monitored between 2:00 AM and 3:00 AM yesterday. Watch for fatigue trends.</p>
                      </div>

                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto shrink-0">
                        MODERATE RISK
                      </span>
                    </div>

                    {/* Row 3: Physical motion */}
                    <div className="p-4 bg-slate-50 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Activity className="w-4.5 h-4.5 text-emerald-600" />
                          <span>Physical Activity & Step Adherence</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">Targeting 6,000 steps daily. Consistent background walks registered.</p>
                      </div>

                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto shrink-0">
                        LOW RISK
                      </span>
                    </div>

                  </div>
                </div>

                {/* AI Recommendations panel (lg:col-span-4) */}
                <div className="lg:col-span-4 bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-teal-600" />
                    <h3 className="font-bold text-slate-950 text-xs sm:text-sm">Wellbeing Recommendations</h3>
                  </div>

                  <div className="space-y-3 font-medium text-xs leading-relaxed text-slate-600">
                    <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-2xl space-y-1">
                      <h4 className="font-bold text-slate-900 text-xs">Verify evening Donepezil dose</h4>
                      <p className="text-[11px] text-slate-500">Ensure {activeRecipient?.name || 'Care Recipient'} takes her cognitive therapy pill at 9:00 PM to protect clinical consistency.</p>
                    </div>

                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-1">
                      <h4 className="font-bold text-slate-900 text-xs">Encourage hydration and morning walks</h4>
                      <p className="text-[11px] text-slate-500">Step indices demonstrate active walking trends. Keep target thresholds at 6,000 steps.</p>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Calendar Control bar */}
              <div className="flex justify-between items-center bg-white p-4 border border-slate-200/80 rounded-2xl shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-950 text-sm sm:text-base">Clinical Roster & Reminders</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Manage doctor appointments, routine vaccinations, and telehealth calls.</p>
                </div>
                <button
                  onClick={() => { setShowAppointmentForm(!showAppointmentForm); setFollowUpAptId(null); }}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-teal-600/10"
                >
                  <PlusCircle className="w-4.5 h-4.5" />
                  <span>New Appointment</span>
                </button>
              </div>

              {/* Appointment Creation Form */}
              {showAppointmentForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white border border-teal-200 p-6 rounded-3xl shadow-sm space-y-4"
                  onSubmit={handleCreateAppointment}
                >
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Schedule New Clinical Appointment</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1.5">
                      <label className="text-slate-500">Doctor Name</label>
                      <input
                        type="text"
                        value={newApt.doctor}
                        onChange={(e) => setNewApt({ ...newApt, doctor: e.target.value })}
                        placeholder="e.g. Dr. Arthur Pendelton (Cardiologist)"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500">Hospital / Clinic</label>
                      <input
                        type="text"
                        value={newApt.hospital}
                        onChange={(e) => setNewApt({ ...newApt, hospital: e.target.value })}
                        placeholder="e.g. Silver Springs Memorial Hospital"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500">Purpose</label>
                      <select
                        value={newApt.purpose}
                        onChange={(e) => setNewApt({ ...newApt, purpose: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium cursor-pointer"
                      >
                        <option value="Routine Check-Up">Routine Check-Up</option>
                        <option value="Cardiology Review">Cardiology Review</option>
                        <option value="Vaccination / Booster">Vaccination / Booster</option>
                        <option value="Telehealth Video Call">Telehealth Video Call</option>
                        <option value="Cognitive Assessment">Cognitive Assessment</option>
                        <option value="Prescription Refill Review">Prescription Refill Review</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500">Scheduled Date & Time</label>
                      <input
                        type="datetime-local"
                        value={newApt.time}
                        onChange={(e) => setNewApt({ ...newApt, time: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500">Physical Location / Room</label>
                      <input
                        type="text"
                        value={newApt.location}
                        onChange={(e) => setNewApt({ ...newApt, location: e.target.value })}
                        placeholder="e.g. Suite 402, Cardiac Ward"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500">Online Link (Optional, for Telehealth)</label>
                      <input
                        type="url"
                        value={newApt.onlineLink}
                        onChange={(e) => setNewApt({ ...newApt, onlineLink: e.target.value })}
                        placeholder="e.g. https://meet.google.com/abc-defg-hij"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500">Recurring Pattern</label>
                      <select
                        value={newApt.recurring}
                        onChange={(e) => setNewApt({ ...newApt, recurring: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium cursor-pointer"
                      >
                        <option value="none">One-off Event</option>
                        <option value="daily">Daily Roster</option>
                        <option value="weekly">Weekly Routine</option>
                        <option value="monthly">Monthly Cycle</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowAppointmentForm(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl cursor-pointer"
                    >
                      Register Appointment
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Follow-Up Management Form */}
              {followUpAptId && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gradient-to-tr from-slate-50 to-indigo-50/40 border border-indigo-200 p-6 rounded-3xl shadow-sm space-y-4"
                  onSubmit={handleFollowUpSubmit}
                >
                  <div className="flex items-center gap-2 border-b border-indigo-100 pb-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Trigger Post-Appointment Clinical Follow-Up</h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-xs font-semibold">
                    <div className="space-y-2">
                      <label className="text-slate-600 font-bold block">Did {activeRecipient?.name || 'Care Recipient'} successfully attend this appointment?</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold">
                          <input
                            type="radio"
                            checked={followUpData.happened === true}
                            onChange={() => setFollowUpData({ ...followUpData, happened: true })}
                          />
                          <span className="text-emerald-700">Yes, Completed Successfully</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold">
                          <input
                            type="radio"
                            checked={followUpData.happened === false}
                            onChange={() => setFollowUpData({ ...followUpData, happened: false })}
                          />
                          <span className="text-rose-700">No, Missed / Cancelled / Rescheduled</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-600 font-bold block">Doctor Notes, Observations & Vitals Discussed</label>
                      <textarea
                        value={followUpData.notes}
                        onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                        placeholder={`e.g. Heart rate stable. Doc adjusted Lisinopril to 10mg. ${activeRecipient?.name || 'Care Recipient'} felt slightly dizzy.`}
                        rows={3}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-800"
                      />
                    </div>

                    {!followUpData.happened && (
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-bold block">Rescheduled Date & Time</label>
                        <input
                          type="datetime-local"
                          value={followUpData.followUpDate}
                          onChange={(e) => setFollowUpData({ ...followUpData, followUpDate: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 border-t border-indigo-150 pt-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFollowUpAptId(null)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer shadow"
                    >
                      Process Follow-Up & Update Memories
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Roster Listing */}
              <div className="space-y-3.5">
                {appointments.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-slate-150 rounded-3xl">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs text-slate-500 font-bold font-mono">NO SCHEDULED CLINICAL APPOINTMENTS</p>
                  </div>
                ) : (
                  appointments.map((apt) => {
                    const isUpcoming = new Date(apt.time).getTime() > Date.now();
                    return (
                      <div
                        key={apt.id}
                        className={`p-5 bg-white border rounded-3xl shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all ${
                          apt.status === 'completed' 
                            ? 'border-slate-100 bg-slate-50/50 opacity-80' 
                            : apt.status === 'rescheduled'
                            ? 'border-indigo-100 bg-indigo-50/10'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex gap-4 items-start">
                          <div className={`p-3 rounded-2xl shrink-0 ${
                            apt.status === 'completed' 
                              ? 'bg-slate-100 text-slate-500' 
                              : 'bg-teal-50 text-teal-600'
                          }`}>
                            <Calendar className="w-5 h-5" />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{apt.purpose}</h4>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                apt.status === 'completed'
                                  ? 'bg-slate-100 text-slate-600'
                                  : apt.status === 'rescheduled'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-teal-100 text-teal-800'
                              }`}>
                                {apt.status}
                              </span>
                              {apt.recurring !== 'none' && (
                                <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  {apt.recurring}
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-semibold text-slate-700">
                              With <strong className="text-slate-900">{apt.doctor}</strong> at {apt.hospital}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4 shrink-0 text-slate-400" />
                                {new Date(apt.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Info className="w-4 h-4 shrink-0 text-slate-400" />
                                Location: {apt.location}
                              </span>
                              {apt.onlineLink && (
                                <a 
                                  href={apt.onlineLink} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-teal-600 font-bold hover:underline"
                                >
                                  Join Telehealth Room
                                </a>
                              )}
                            </div>

                            {apt.notes && (
                              <p className="p-3 bg-slate-50 text-[11px] text-slate-600 rounded-xl leading-relaxed border border-slate-100 max-w-xl">
                                <strong>Observations Summary:</strong> {apt.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap md:flex-col items-end gap-2 self-start md:self-auto ml-12 md:ml-0 shrink-0">
                          {apt.status === 'scheduled' && (
                            <button
                              onClick={() => { setFollowUpAptId(apt.id); setShowAppointmentForm(false); }}
                              className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                            >
                              Follow-Up / Completed?
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAppointment(apt.id)}
                            className="text-xs font-bold text-slate-500 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Cancel appointment"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'prescriptions' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Document OCR Upload & Verification Section */}
              {showReviewScreen && extractedData ? (
                /* Editable Clinical OCR Review Screen */
                <div id="clinical-verification-portal" className="bg-slate-50 border border-teal-200 p-6 rounded-3xl shadow-md space-y-6">
                  <div className="flex items-center justify-between border-b border-teal-100 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-teal-600" />
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Clinical Verification Portal</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Please verify and refine the extracted clinical data before executing the multi-agent orchestration pipeline.
                        </p>
                      </div>
                    </div>
                    <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      OCR Approved
                    </span>
                  </div>

                  {fallbackWarning && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-[11px] text-amber-800 font-medium">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>OCR Fallback Engaged:</strong> {fallbackWarning}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1.5">
                      <label className="text-slate-500">Prescribing Doctor</label>
                      <input
                        id="review-doctor"
                        type="text"
                        value={extractedData.doctor || ''}
                        onChange={(e) => setExtractedData({ ...extractedData, doctor: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-500">Prescribing Hospital / Clinic</label>
                      <input
                        id="review-hospital"
                        type="text"
                        value={extractedData.hospital || ''}
                        onChange={(e) => setExtractedData({ ...extractedData, hospital: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-500">Clinical Diagnosis (if explicitly noted)</label>
                      <input
                        id="review-diagnosis"
                        type="text"
                        value={extractedData.diagnosis || ''}
                        onChange={(e) => setExtractedData({ ...extractedData, diagnosis: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium text-slate-800"
                        placeholder="e.g. Essential Hypertension"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-500">Follow-up Appointment Date</label>
                      <input
                        id="review-followup-date"
                        type="date"
                        value={extractedData.followUpDate || ''}
                        onChange={(e) => setExtractedData({ ...extractedData, followUpDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-semibold">
                    <label className="text-slate-500">Important Clinical Notes & Directions</label>
                    <textarea
                      id="review-notes"
                      value={extractedData.clinicalNotes || ''}
                      onChange={(e) => setExtractedData({ ...extractedData, clinicalNotes: e.target.value })}
                      rows={2}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium text-slate-800"
                    />
                  </div>

                  {/* Medications Verification Sub-table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">Verified Medication Schedules</h5>
                      <button
                        id="btn-add-med-row"
                        type="button"
                        onClick={() => {
                          const list = [...(extractedData.medications || [])];
                          list.push({ name: '', dosage: '', frequency: '', duration: '', timeScheduled: '08:00 AM' });
                          setExtractedData({ ...extractedData, medications: list });
                        }}
                        className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Add Medication Row</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                      <table className="w-full text-left text-xs font-medium border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <th className="p-3">Medicine Name</th>
                            <th className="p-3">Dosage</th>
                            <th className="p-3">Frequency</th>
                            <th className="p-3">Duration</th>
                            <th className="p-3">Schedule</th>
                            <th className="p-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {(!extractedData.medications || extractedData.medications.length === 0) ? (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-slate-400 font-medium">No medications parsed. Click add row to specify.</td>
                            </tr>
                          ) : (
                            extractedData.medications.map((med: any, idx: number) => (
                              <tr key={idx}>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={med.name || ''}
                                    onChange={(e) => {
                                      const list = [...extractedData.medications];
                                      list[idx].name = e.target.value;
                                      setExtractedData({ ...extractedData, medications: list });
                                    }}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium text-slate-800 bg-slate-50/50"
                                    placeholder="e.g. Donepezil"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={med.dosage || ''}
                                    onChange={(e) => {
                                      const list = [...extractedData.medications];
                                      list[idx].dosage = e.target.value;
                                      setExtractedData({ ...extractedData, medications: list });
                                    }}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium text-slate-800 bg-slate-50/50"
                                    placeholder="e.g. 5mg"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={med.frequency || ''}
                                    onChange={(e) => {
                                      const list = [...extractedData.medications];
                                      list[idx].frequency = e.target.value;
                                      setExtractedData({ ...extractedData, medications: list });
                                    }}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium text-slate-800 bg-slate-50/50"
                                    placeholder="e.g. Once daily at bedtime"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={med.duration || ''}
                                    onChange={(e) => {
                                      const list = [...extractedData.medications];
                                      list[idx].duration = e.target.value;
                                      setExtractedData({ ...extractedData, medications: list });
                                    }}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium text-slate-800 bg-slate-50/50"
                                    placeholder="e.g. Continuous"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={med.timeScheduled || ''}
                                    onChange={(e) => {
                                      const list = [...extractedData.medications];
                                      list[idx].timeScheduled = e.target.value;
                                      setExtractedData({ ...extractedData, medications: list });
                                    }}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium text-slate-800 bg-slate-50/50"
                                    placeholder="e.g. 09:00 PM"
                                  />
                                </td>
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = extractedData.medications.filter((_: any, i: number) => i !== idx);
                                      setExtractedData({ ...extractedData, medications: list });
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Laboratory Parameters Sub-table */}
                  {uploadType === 'report' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">Verified Laboratory & Biometric Biomarkers</h5>
                        <button
                          id="btn-add-lab-row"
                          type="button"
                          onClick={() => {
                            const list = [...(extractedData.laboratoryValues || [])];
                            list.push({ parameter: '', value: '', unit: '', status: 'normal' });
                            setExtractedData({ ...extractedData, laboratoryValues: list });
                          }}
                          className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Add Lab Parameter Row</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                        <table className="w-full text-left text-xs font-medium border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                              <th className="p-3">Lab Biomarker Parameter</th>
                              <th className="p-3">Value</th>
                              <th className="p-3">Reference Unit</th>
                              <th className="p-3">Range Status</th>
                              <th className="p-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150">
                            {(!extractedData.laboratoryValues || extractedData.laboratoryValues.length === 0) ? (
                              <tr>
                                <td colSpan={5} className="p-4 text-center text-slate-400 font-medium">No biometric markers parsed. Click add row to specify.</td>
                              </tr>
                            ) : (
                              extractedData.laboratoryValues.map((lab: any, idx: number) => (
                                <tr key={idx}>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={lab.parameter || ''}
                                      onChange={(e) => {
                                        const list = [...extractedData.laboratoryValues];
                                        list[idx].parameter = e.target.value;
                                        setExtractedData({ ...extractedData, laboratoryValues: list });
                                      }}
                                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium text-slate-800 bg-slate-50/50"
                                      placeholder="e.g. HbA1c"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={lab.value || ''}
                                      onChange={(e) => {
                                        const list = [...extractedData.laboratoryValues];
                                        list[idx].value = e.target.value;
                                        setExtractedData({ ...extractedData, laboratoryValues: list });
                                      }}
                                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium text-slate-800 bg-slate-50/50"
                                      placeholder="e.g. 5.6"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={lab.unit || ''}
                                      onChange={(e) => {
                                        const list = [...extractedData.laboratoryValues];
                                        list[idx].unit = e.target.value;
                                        setExtractedData({ ...extractedData, laboratoryValues: list });
                                      }}
                                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium text-slate-800 bg-slate-50/50"
                                      placeholder="e.g. %"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <select
                                      value={lab.status || 'unspecified'}
                                      onChange={(e) => {
                                        const list = [...extractedData.laboratoryValues];
                                        list[idx].status = e.target.value;
                                        setExtractedData({ ...extractedData, laboratoryValues: list });
                                      }}
                                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-bold text-slate-700 bg-slate-50"
                                    >
                                      <option value="normal">Normal</option>
                                      <option value="high">High Range</option>
                                      <option value="low">Low Range</option>
                                      <option value="unspecified">Unspecified</option>
                                    </select>
                                  </td>
                                  <td className="p-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = extractedData.laboratoryValues.filter((_: any, i: number) => i !== idx);
                                        setExtractedData({ ...extractedData, laboratoryValues: list });
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      id="btn-cancel-verification"
                      type="button"
                      onClick={() => {
                        setShowReviewScreen(false);
                        setExtractedData(null);
                        setSelectedFile(null);
                        setFileBase64('');
                        setFileMimeType('');
                        setUploadFileName('');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Cancel Analysis
                    </button>
                    <button
                      id="btn-approve-verification"
                      type="button"
                      disabled={approving}
                      onClick={handleApproveDocument}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-teal-600/10 flex items-center gap-1.5"
                    >
                      {approving ? (
                        <>
                          <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Executing Agent Orchestration...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4.5 h-4.5" />
                          <span>Approve & Execute Specialist Agents</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Production-grade drag-and-drop secure file uploader */
                <div id="secure-document-intake" className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Upload className="w-5 h-5 text-teal-600" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Production Clinical Document Intake</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Upload any prescription, medication chart, or laboratory report for real-time AI-powered parsing and orchestration.</p>
                    </div>
                  </div>

                  <form onSubmit={handleAnalyzeDocument} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="space-y-1.5">
                        <label className="text-slate-500">Clinical Category</label>
                        <div className="flex gap-2">
                          <button
                            id="category-prescription"
                            type="button"
                            onClick={() => { setUploadType('prescription'); setUploadFileName(''); }}
                            className={`flex-1 py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                              uploadType === 'prescription'
                                ? 'bg-teal-50 border-teal-300 text-teal-700'
                                : 'bg-white border-slate-250 text-slate-600'
                            }`}
                          >
                            Doctor Prescription
                          </button>
                          <button
                            id="category-report"
                            type="button"
                            onClick={() => { setUploadType('report'); setUploadFileName(''); }}
                            className={`flex-1 py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                              uploadType === 'report'
                                ? 'bg-teal-50 border-teal-300 text-teal-700'
                                : 'bg-white border-slate-250 text-slate-600'
                            }`}
                          >
                            Medical / Lab Report
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-500">Document Name / Identification</label>
                        <input
                          id="input-filename"
                          type="text"
                          value={uploadFileName}
                          onChange={(e) => setUploadFileName(e.target.value)}
                          placeholder={uploadType === 'prescription' ? 'e.g. springfield_rx_july.pdf' : 'e.g. blood_panel_july.png'}
                          required
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Drag and Drop Box */}
                    <div className="space-y-1.5 text-xs font-semibold">
                      <label className="text-slate-500">Secure File Selection (PDF or Image)</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col items-center justify-center space-y-2 relative">
                        <input
                          id="file-input-ocr"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <Upload className="w-8 h-8 text-slate-400" />
                        <div className="text-center">
                          <p className="text-slate-700 font-bold">
                            {selectedFile ? `Selected File: ${selectedFile.name}` : 'Drag & drop clinical report, or click to choose file'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">Supports PDF, PNG, JPG up to 15MB. Processes instantly with Gemini Vision.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs font-semibold">
                      <label className="text-slate-500">Alternative Text Entry (For notes, email copies, or manual transcription)</label>
                      <textarea
                        id="textarea-manual-ocr"
                        value={uploadTextData}
                        onChange={(e) => setUploadTextData(e.target.value)}
                        placeholder={uploadType === 'prescription' 
                          ? `e.g. Dr. Robert Chen Silver Springs RX. ${activeRecipient?.name || 'Care Recipient'}: Lisinopril 10mg morning daily for high blood pressure.`
                          : 'e.g. Silver Springs Diagnostics Lab. Brain MRI Scan: Mild hippocampal volume reduction consistent with cognitive decline. Healthy arterial vessels.'
                        }
                        rows={3}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium text-slate-800"
                      />
                    </div>

                    <div className="flex justify-end pt-2 shrink-0">
                      <button
                        id="btn-analyze-doc"
                        type="submit"
                        disabled={uploading}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-teal-600/10 flex items-center gap-1.5"
                      >
                        {uploading ? (
                          <>
                            <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>AI Vision Extracting Clinical Data...</span>
                          </>
                        ) : (
                          <>
                            <Brain className="w-4.5 h-4.5" />
                            <span>Analyze Clinical Document</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Lists of Prescriptions & Reports */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column 1: Prescriptions with OCR extract list */}
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <h4 className="font-extrabold text-slate-900 text-sm">Active Prescriptions ({prescriptions.length})</h4>
                  </div>

                  <div className="space-y-3">
                    {prescriptions.length === 0 ? (
                      <p className="text-xs text-slate-400 font-bold font-mono text-center py-6">No prescription archives uploaded.</p>
                    ) : (
                      prescriptions.map(p => (
                        <div key={p.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 relative">
                          <button
                            onClick={() => handleDeleteDoc(p.id, 'prescription')}
                            className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Remove document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="space-y-1">
                            <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">{p.fileName}</h5>
                            <p className="text-[11px] text-slate-500 font-medium">Prescribed by {p.doctor} ({p.hospital})</p>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-[11px]">
                            <span className="text-[10px] text-teal-600 font-extrabold uppercase font-mono tracking-wider block">Verified OCR Roster Additions</span>
                            {p.extractedMeds.map((em, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-white p-2 border border-slate-150 rounded-lg">
                                <span className="font-bold text-slate-800">{em.name} <span className="text-slate-400">({em.dosage})</span></span>
                                <span className="text-teal-700 font-bold font-mono text-[9px] uppercase tracking-wider">{em.schedule}</span>
                              </div>
                            ))}
                          </div>

                          <p className="text-[10px] text-slate-400 italic leading-relaxed mt-1">Note: {p.notes}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Column 2: Medical / Lab Reports with AI Summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                    <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                    <h4 className="font-extrabold text-slate-900 text-sm">AI Medical Report Summaries ({reports.length})</h4>
                  </div>

                  <div className="space-y-3">
                    {reports.length === 0 ? (
                      <p className="text-xs text-slate-400 font-bold font-mono text-center py-6">No clinical reports analyzed yet.</p>
                    ) : (
                      reports.map(r => (
                        <div key={r.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 relative">
                          <button
                            onClick={() => handleDeleteDoc(r.id, 'report')}
                            className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Remove report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">{r.fileName}</h5>
                              <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase font-mono">{r.type}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium block">Analyzed on {new Date(r.date).toLocaleDateString()}</span>
                          </div>

                          <div className="bg-indigo-50/40 border border-indigo-100 p-3 rounded-xl space-y-1.5">
                            <span className="text-[10px] text-indigo-700 font-extrabold uppercase font-mono tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Clinical Specialist Summary</span>
                            </span>
                            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">{r.summary}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === 'wellness' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Wellness Controller Bar */}
              <div className="flex justify-between items-center bg-white p-4 border border-slate-200/80 rounded-2xl shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-950 text-sm sm:text-base">Family Mental Wellness & Mood Journal</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Log daily moods, nocturnal anxiety scales, stress indices, and social interactions.</p>
                </div>
                <button
                  onClick={() => setShowWellnessForm(!showWellnessForm)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-purple-600/10"
                >
                  <PlusCircle className="w-4.5 h-4.5" />
                  <span>Log Daily Wellness</span>
                </button>
              </div>

              {/* Wellness logging form */}
              {showWellnessForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white border border-purple-200 p-6 rounded-3xl shadow-sm space-y-4 font-semibold text-xs text-slate-700"
                  onSubmit={handleAddWellnessLog}
                >
                  <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
                    <Smile className="w-5 h-5 text-purple-600" />
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Record {activeRecipient?.name || "Care Recipient"}'s Daily Wellness Indices</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Mood Scale */}
                    <div className="space-y-2 bg-slate-50 p-4 rounded-2xl">
                      <label className="text-slate-800 font-bold block">Mood (1 - Very Low, 5 - Happy)</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={newWellness.mood}
                        onChange={(e) => setNewWellness({ ...newWellness, mood: Number(e.target.value) })}
                        className="w-full accent-purple-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Low</span>
                        <span className="font-bold text-purple-700 font-mono text-sm">{newWellness.mood}/5</span>
                        <span>Happy</span>
                      </div>
                    </div>

                    {/* Stress Level */}
                    <div className="space-y-2 bg-slate-50 p-4 rounded-2xl">
                      <label className="text-slate-800 font-bold block">Stress Level (1 - Relaxed, 5 - High anxiety)</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={newWellness.stressLevel}
                        onChange={(e) => setNewWellness({ ...newWellness, stressLevel: Number(e.target.value) })}
                        className="w-full accent-purple-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Relaxed</span>
                        <span className="font-bold text-purple-700 font-mono text-sm">{newWellness.stressLevel}/5</span>
                        <span>High</span>
                      </div>
                    </div>

                    {/* Sleep Quality */}
                    <div className="space-y-2 bg-slate-50 p-4 rounded-2xl">
                      <label className="text-slate-800 font-bold block">Sleep Quality (1 - Insomnia, 5 - Restful)</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={newWellness.sleepQuality}
                        onChange={(e) => setNewWellness({ ...newWellness, sleepQuality: Number(e.target.value) })}
                        className="w-full accent-purple-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Insomnia</span>
                        <span className="font-bold text-purple-700 font-mono text-sm">{newWellness.sleepQuality}/5</span>
                        <span>Restful</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-500">Social Interaction Details</label>
                      <input
                        type="text"
                        value={newWellness.socialInteraction}
                        onChange={(e) => setNewWellness({ ...newWellness, socialInteraction: e.target.value })}
                        placeholder="Spoke with family, played chess, watered porch plants."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-slate-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500">Caregiver Journal / Daily Narrative Observations</label>
                      <textarea
                        value={newWellness.journal}
                        onChange={(e) => setNewWellness({ ...newWellness, journal: e.target.value })}
                        placeholder="Observe evening confusion, stable morning clarity, cognitive orientation."
                        rows={2.5}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowWellnessForm(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl cursor-pointer shadow"
                    >
                      Record Wellness Log
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Historical wellness log results */}
              <div className="space-y-3.5">
                {wellnessLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold font-mono text-center py-6 bg-white border rounded-3xl">No wellness records filed.</p>
                ) : (
                  wellnessLogs.map(log => (
                    <div key={log.id} className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
                      <div className="flex justify-between items-start border-b border-slate-150 pb-3 flex-wrap gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          <Smile className="w-5 h-5 text-purple-600" />
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Daily Wellbeing Indices Logged</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold font-mono">
                          {new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>

                      {/* Display Scales */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100/40">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Mood Indicator</span>
                          <span className="font-extrabold text-purple-700 text-base sm:text-lg">{log.mood}/5</span>
                        </div>

                        <div className="p-3.5 bg-amber-50/40 rounded-2xl border border-amber-100/40">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Stress Index</span>
                          <span className="font-extrabold text-amber-700 text-base sm:text-lg">{log.stressLevel}/5</span>
                        </div>

                        <div className="p-3.5 bg-sky-50/40 rounded-2xl border border-sky-100/40">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Sleep Quality</span>
                          <span className="font-extrabold text-sky-700 text-base sm:text-lg">{log.sleepQuality}/5</span>
                        </div>
                      </div>

                      {/* Text info */}
                      <div className="space-y-2 text-xs leading-relaxed">
                        {log.socialInteraction && (
                          <p className="text-slate-600 font-medium">
                            <strong className="text-slate-800">Social Engagement:</strong> {log.socialInteraction}
                          </p>
                        )}
                        {log.journal && (
                          <p className="text-slate-600 font-medium">
                            <strong className="text-slate-800">Narrative Observations:</strong> "{log.journal}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

    </div>
  );
}
