import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Filter, 
  Sparkles, 
  Activity, 
  X, 
  Info,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Alert, CheckIn } from '../types';

interface AlertsTimelineViewProps {
  alerts: Alert[];
  checkIns: CheckIn[];
  resolveAlert: (id: string) => void;
}

export default function AlertsTimelineView({ alerts, checkIns, resolveAlert }: AlertsTimelineViewProps) {
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(a => {
    return severityFilter === 'all' || a.level === severityFilter;
  });

  const toggleExpand = (id: string) => {
    setExpandedAlert(expandedAlert === id ? null : id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-900 selection:bg-teal-500 selection:text-white">
      
      {/* LEFT COLUMN: Severity Filters & Status Stats (lg:col-span-4) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Severity filter card */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Filter className="w-5 h-5 text-teal-600" />
            <h3 className="font-extrabold text-slate-950 text-sm sm:text-base">Filter Chronology</h3>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`w-full p-3 rounded-2xl border text-left flex justify-between items-center transition-all cursor-pointer font-bold text-xs ${
                severityFilter === 'all' 
                  ? 'bg-teal-50 border-teal-500 text-teal-700' 
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span>All Incidents & Reminders</span>
              <span className="bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                {alerts.length}
              </span>
            </button>

            <button
              onClick={() => setSeverityFilter('high')}
              className={`w-full p-3 rounded-2xl border text-left flex justify-between items-center transition-all cursor-pointer font-bold text-xs ${
                severityFilter === 'high' 
                  ? 'bg-rose-50 border-rose-500 text-rose-700 animate-pulse' 
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span>High Severity Alarms</span>
              <span className="bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                {alerts.filter(a => a.level === 'high').length}
              </span>
            </button>

            <button
              onClick={() => setSeverityFilter('medium')}
              className={`w-full p-3 rounded-2xl border text-left flex justify-between items-center transition-all cursor-pointer font-bold text-xs ${
                severityFilter === 'medium' 
                  ? 'bg-amber-50 border-amber-500 text-amber-700' 
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span>Medium Risk Warnings</span>
              <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                {alerts.filter(a => a.level === 'medium').length}
              </span>
            </button>
          </div>
        </div>

        {/* Overview of general historical health checks */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-950 text-xs sm:text-sm">Wellness Check-In Archive</h3>
          <p className="text-xs text-slate-500 leading-normal">Explore past manual and smartwatch confirmation logs.</p>
          
          <div className="space-y-2.5">
            {checkIns.map((ch) => (
              <div key={ch.id} className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Completed
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(ch.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed italic">"{ch.notes}"</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Chronological Timeline Log (lg:col-span-8) */}
      <div className="lg:col-span-8 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-950 text-base">Care Event Chronology</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time trace logs of medication compliance and emergency tickets.</p>
          </div>

          <span className="text-[10px] font-mono bg-slate-50 text-slate-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Active Feed
          </span>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 space-y-3">
            <CheckCircle className="w-10 h-10 mx-auto text-slate-300" />
            <div className="font-bold text-slate-700 text-sm">All clear! No pending incidents match the filters.</div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-normal">Our background specialists are continuing monitoring connected devices.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 pl-8 ml-4 space-y-6">
            {filteredAlerts.map((alert) => {
              const isExpanded = expandedAlert === alert.id;
              
              let levelColor = 'border-slate-200 text-slate-500 bg-slate-50';
              if (alert.level === 'high') levelColor = 'border-rose-200 text-rose-600 bg-rose-50';
              if (alert.level === 'medium') levelColor = 'border-amber-200 text-amber-600 bg-amber-50';

              return (
                <div key={alert.id} className="relative space-y-2">
                  
                  {/* Timeline icon indicator */}
                  <span className={`absolute -left-[2.35rem] top-0.5 w-7 h-7 rounded-full border flex items-center justify-center shadow-sm ${levelColor}`}>
                    <AlertTriangle className={`w-4 h-4 ${alert.level === 'high' ? 'animate-bounce' : ''}`} />
                  </span>

                  {/* Header summary info */}
                  <div 
                    onClick={() => toggleExpand(alert.id)}
                    className="flex justify-between items-start gap-4 cursor-pointer p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-2xl transition-all"
                  >
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase text-slate-400">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm mt-0.5 uppercase tracking-wide">
                        {alert.type.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-1">
                        {alert.reasoningSummary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        alert.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {alert.status.toUpperCase()}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded details panel */}
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-white border border-slate-200 rounded-2xl space-y-4 text-xs font-medium"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Risk Assessment Reasoning</span>
                        <p className="text-slate-700 leading-relaxed">{alert.reasoningSummary}</p>
                      </div>

                      {alert.status === 'pending' && (
                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-teal-600/10"
                          >
                            Mark as Resolved
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
