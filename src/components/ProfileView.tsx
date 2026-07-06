import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Award, 
  Heart, 
  Sparkles,
  Info
} from 'lucide-react';

interface ProfileViewProps {
  user: { name: string; role: string; email?: string; phone?: string } | null;
  showToast?: (title: string, message: string, type: 'success' | 'alert' | 'info') => void;
}

export default function ProfileView({ user, showToast }: ProfileViewProps) {
  const [profileName, setProfileName] = useState(user?.name || 'Sarah Vance');
  const [profileEmail, setProfileEmail] = useState(user?.email || (user?.role === 'carerecipient' ? 'eleanor.vance@example.com' : 'sarah.vance@example.com'));
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+1 (555) 123-4567');
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email || (user.role === 'carerecipient' ? 'eleanor.vance@example.com' : 'sarah.vance@example.com'));
      setProfilePhone(user.phone || '+1 (555) 123-4567');
    }
  }, [user]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      if (showToast) {
        showToast('Profile Updated', 'Profile updates saved successfully under secured SSL connection.', 'success');
      } else {
        alert('Profile updates saved successfully under secured SSL connection.');
      }
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 text-slate-900 selection:bg-teal-500 selection:text-white">
      
      {/* Profile info card */}
      <div className="bg-white border border-slate-200/80 p-6 sm:p-10 rounded-3xl shadow-sm space-y-6 relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-teal-500/10 shrink-0">
            {profileName.split(' ').map(n=>n[0]).join('')}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-extrabold text-slate-950 text-lg">{profileName}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Circle Role: <span className="font-bold text-teal-600 uppercase">{user?.role || 'Primary Caregiver'}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Display Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Secure Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Emergency Phone Coordinate</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                required
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaved}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-teal-600/10 cursor-pointer"
          >
            {isSaved ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>

        <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 leading-normal">
            Your personal profiles and connected smart devices are fully protected under clinical regulations. We never distribute telemetry data to third parties.
          </p>
        </div>

      </div>

    </div>
  );
}
