import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Heart, 
  Users, 
  ShieldAlert, 
  Smartphone,
  Sparkles,
  Award
} from 'lucide-react';

interface RegisterPageProps {
  onRegisterSuccess: (userId: string, token?: string, user?: any) => void;
  onNavigateToLogin: () => void;
}

export default function RegisterPage({ onRegisterSuccess, onNavigateToLogin }: RegisterPageProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'caregiver' | 'parent' | 'child' | 'carerecipient'>('caregiver');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);

  // Handle mock SMS digit keys
  const handleDigitChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next field
    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role: selectedRole === 'carerecipient' ? 'carerecipient' : 'caregiver',
          emergencyContacts: emergencyName ? [
            { name: emergencyName, phone: emergencyPhone, relation: emergencyRelation }
          ] : []
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        onRegisterSuccess(data.user.id, data.token, data.user);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to complete registration.');
      }
    } catch (err) {
      alert('Network error connecting to verification system. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const roles = [
    {
      id: 'caregiver' as const,
      title: "Primary Caregiver",
      desc: "Coordinate medication schedules, track vitals, and handle critical safety alerts."
    },
    {
      id: 'parent' as const,
      title: "Family Parent",
      desc: "Check-in on elderly parents while keeping children's health updated in one panel."
    },
    {
      id: 'child' as const,
      title: "Family Member / Child",
      desc: "Stay updated on grandma's wellbeing and coordinate quick wellness check-ins."
    },
    {
      id: 'carerecipient' as const,
      title: "Care Recipient / Senior",
      desc: "Simplified access with massive touch targets to report health states with one-tap."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center justify-center p-6 selection:bg-teal-500 selection:text-white">
      
      {/* Container Card */}
      <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex justify-between items-center pb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center">
              <Heart className="w-4.5 h-4.5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-sm tracking-tight">CareCircle AI</h2>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono">Step {step} of 4</span>
        </div>

        {/* Dynamic Step Progress Indicator */}
        <div className="space-y-2">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-teal-600 rounded-full transition-all duration-300" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-4 text-[10px] font-mono uppercase tracking-wider text-center text-slate-400 font-bold">
            <span className={step >= 1 ? "text-teal-600" : ""}>1. Profile</span>
            <span className={step >= 2 ? "text-teal-600" : ""}>2. Role</span>
            <span className={step >= 3 ? "text-teal-600" : ""}>3. SOS Core</span>
            <span className={step >= 4 ? "text-teal-600" : ""}>4. Verify</span>
          </div>
        </div>

        {/* Dynamic forms step renders */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Create your personal workspace</h3>
              <p className="text-xs text-slate-400">First, enter some general account details so we can authenticate you securely.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Vance"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah.vance@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              id="btn_register_step1_next"
              type="submit"
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-teal-600/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Select your family role</h3>
              <p className="text-xs text-slate-400">This configures high contrast and elder-accessibility interfaces immediately if senior is chosen.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer h-36 ${
                    selectedRole === r.id
                      ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{r.title}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedRole === r.id ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300'
                    }`}>
                      {selectedRole === r.id && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal mt-2">{r.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                id="btn_register_step2_next"
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-teal-600/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Confirm Role Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Configure core emergency contacts</h3>
              <p className="text-xs text-slate-400">If our physical agents trigger a high-risk vitals alerts, these details receive instant automated notifications.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Contact Person Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Michael Vance"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Emergency Phone</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+1 (555) 321-7654"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Family Relationship</label>
                  <input
                    type="text"
                    required
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    placeholder="Son / Daughter"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 font-medium"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-normal">
                  Our system verifies details against the HIPAA Clinical guidelines. In an active SOS smartwatch triggers, CareCircle dials this contact in priority sequence automatically.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                id="btn_register_step3_next"
                type="submit"
                className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-teal-600/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Save Emergency Contact</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handleVerifySubmit} className="space-y-6">
            <div className="space-y-1 text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto text-teal-600 mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Demo Verification Step</h3>
              <p className="text-xs text-slate-400">Please enter any 6 digits to complete your demo registration (no real SMS is dispatched).</p>
            </div>

            <div className="flex justify-center gap-2 sm:gap-3 py-4">
              {verificationCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`digit-${idx}`}
                  type="text"
                  maxLength={1}
                  required
                  value={digit}
                  onChange={(e) => handleDigitChange(e.target.value, idx)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center bg-slate-50 border border-slate-200 text-slate-900 text-lg sm:text-xl font-extrabold rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                />
              ))}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setVerificationCode(['4', '8', '2', '1', '9', '7'])}
                className="text-[11px] font-bold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
              >
                Auto-fill Demo Code (482197)
              </button>
            </div>

            <div className="flex justify-between items-center gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                id="btn_register_verify_submit"
                type="submit"
                disabled={isVerifying}
                className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-teal-600/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isVerifying ? 'Verifying OTP...' : 'Complete Verification'}</span>
                {!isVerifying && <Check className="w-4 h-4 stroke-[2.5]" />}
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Already registered?{' '}
            <button 
              type="button"
              onClick={onNavigateToLogin}
              className="font-bold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
            >
              Sign In Instead
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
