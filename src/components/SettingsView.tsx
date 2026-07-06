import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Smartphone, 
  ShieldCheck, 
  Info, 
  Lock, 
  Mail, 
  Save,
  CheckCircle
} from 'lucide-react';

export default function SettingsView() {
  const [smsAlarms, setSmsAlarms] = useState(true);
  const [emailDigests, setEmailDigests] = useState(true);
  const [watchSync, setWatchSync] = useState(true);
  const [escalationPath, setEscalationPath] = useState('sequential');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }, 1200);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 text-slate-900 selection:bg-teal-500 selection:text-white">
      
      {/* Settings Panel */}
      <div className="bg-white border border-slate-200/80 p-6 sm:p-10 rounded-3xl shadow-sm space-y-6">
        
        <div className="border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-950 text-base">Notification Escalations</h3>
          <p className="text-xs text-slate-500 mt-0.5">Customize automation triggers when health anomalies occur.</p>
        </div>

        <form onSubmit={handleSettingsSave} className="space-y-6">
          
          <div className="space-y-4">
            
            {/* SMS Alarm Toggle */}
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-xs sm:text-sm block">SMS SOS Escalate</span>
                <p className="text-[10px] text-slate-500 leading-normal">Send automated emergency messages to all coordinators.</p>
              </div>
              <input
                type="checkbox"
                checked={smsAlarms}
                onChange={(e) => setSmsAlarms(e.target.checked)}
                className="w-5 h-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
              />
            </div>

            {/* Email Digest Toggle */}
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-xs sm:text-sm block">Weekly Email Summary</span>
                <p className="text-[10px] text-slate-500 leading-normal">Deliver consolidated medication and behavioral reports weekly.</p>
              </div>
              <input
                type="checkbox"
                checked={emailDigests}
                onChange={(e) => setEmailDigests(e.target.checked)}
                className="w-5 h-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
              />
            </div>

            {/* Smartwatch Heartbeat pings */}
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-xs sm:text-sm block">Wearable Bio-metric Sync</span>
                <p className="text-[10px] text-slate-500 leading-normal">Poll watch telemetry continuously every 60 seconds.</p>
              </div>
              <input
                type="checkbox"
                checked={watchSync}
                onChange={(e) => setWatchSync(e.target.checked)}
                className="w-5 h-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
              />
            </div>

            {/* Escalation sequencing dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Crisis Dispatch Routing</label>
              <select
                value={escalationPath}
                onChange={(e) => setEscalationPath(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
              >
                <option value="sequential">Sequential Dialing (Primary Contact First)</option>
                <option value="simultaneous">Simultaneous Broadcast (Notify All Circles)</option>
              </select>
            </div>

          </div>

          <AnimatePresence>
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-bold"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Escalation guidelines and communication channels successfully updated!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-teal-600/10 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Save className="w-4.5 h-4.5" />
            <span>{isSaving ? 'Updating Workspace...' : 'Save Escalation Rules'}</span>
          </button>
        </form>

      </div>

    </div>
  );
}
