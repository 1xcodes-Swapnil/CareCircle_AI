import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  Smartphone,
  Eye,
  EyeOff,
  User
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (userId: string, token?: string, user?: any) => void;
  onNavigateToRegister: () => void;
}

export default function LoginPage({ onLoginSuccess, onNavigateToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('sarah.vance@example.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        onLoginSuccess(data.user.id, data.token, data.user);
      } else {
        const data = await res.json();
        setError(data.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      setError('Connection to backend server failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-center lg:grid lg:grid-cols-12 overflow-hidden selection:bg-teal-500 selection:text-white">
      
      {/* LEFT COLUMN: Clean, premium forms card (lg:col-span-5) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:col-span-5 bg-white relative">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/10">
              <Heart className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">CareCircle AI</h1>
              <p className="text-[10px] text-slate-500 font-mono">Premium Family Care Companion</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">Welcome back</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Sign in to coordinate wellbeing guardrails for your loved ones.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-teal-800 text-xs font-medium flex items-center justify-between">
              <span>{infoMessage}</span>
              <button onClick={() => setInfoMessage(null)} className="text-teal-900 font-bold hover:underline ml-2">Dismiss</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="login_email" className="text-xs font-semibold text-slate-700 block">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="login_email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="login_pass" className="text-xs font-semibold text-slate-700">Password</label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); setInfoMessage('In a production environment, this triggers an automated email reset token.'); }}
                  className="text-[11px] font-bold text-teal-600 hover:text-teal-700 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login_pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="remember_me" className="ml-2 text-xs text-slate-500 font-medium cursor-pointer select-none">
                Remember my device for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="login_submit_btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-teal-600/10 hover:shadow-teal-600/15 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Workspace'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Social Sign In Options */}
          <div className="space-y-4">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-100" />
              <span className="flex-shrink mx-4 text-[10px] uppercase font-mono tracking-wider text-slate-400">Or quick log in as</span>
              <div className="flex-grow border-t border-slate-100" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onLoginSuccess('usr_sarah')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <User className="w-4 h-4 text-teal-600" />
                <span>Sarah (Demo)</span>
              </button>
              <button
                type="button"
                onClick={() => onLoginSuccess('usr_eleanor')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <User className="w-4 h-4 text-teal-600" />
                <span>Eleanor (Demo)</span>
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 font-medium">
              Demo only, no real OAuth credentials required for bypass.
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <button 
                type="button"
                id="login_nav_register_btn"
                onClick={onNavigateToRegister}
                className="font-bold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
              >
                Sign Up for Free
              </button>
            </p>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: Splendid brand visualizer with animated illustration & security specs (lg:col-span-7) */}
      <div className="hidden lg:flex lg:col-span-7 bg-slate-900 flex-col justify-between p-12 text-slate-100 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.1),transparent_40%)]" />
        
        {/* Quick developer credential tip */}
        <div className="self-end bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl backdrop-blur-sm max-w-xs text-[10px] font-mono text-slate-300">
          <span className="text-emerald-400 font-bold block mb-1">⚡ QUICK DEMO LOGIN ACCOUNTS:</span>
          <div>Caregiver: <span className="text-slate-100">sarah.vance@example.com</span></div>
          <div>Recipient: <span className="text-slate-100">eleanor.vance@example.com</span></div>
          <p className="mt-1 opacity-70 text-[9px]">Click either Sarah (Demo) or Eleanor (Demo) button to bypass with mock roles immediately.</p>
        </div>

        <div className="space-y-6 max-w-lg mt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fully HIPAA & GDPR Protected Ecosystem</span>
          </div>

          <h3 className="text-3xl font-bold tracking-tight leading-snug">
            Establishing continuous emotional reassurance for families.
          </h3>

          <p className="text-sm text-slate-400 leading-relaxed">
            By connecting wearable biometrics, smart home metrics, and cognitive assistant logs, CareCircle AI ensures that you will never have to doubt whether your parents are safe, active, and adhering to medications.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs">Medical ID Encryption</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">End-to-end client-side hashing for clinical records.</p>
              </div>
            </div>
            <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs">Automated Incident Routing</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Dispatches SMS notifications under high-risk alarms.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <span>CareCircle AI Orchestrator v1.1</span>
          <span>Secured with SSL Standard</span>
        </div>
      </div>

    </div>
  );
}
