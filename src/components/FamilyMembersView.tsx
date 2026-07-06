import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Smile, 
  Heart, 
  Activity, 
  ShieldAlert, 
  Clock, 
  CheckCircle,
  X,
  Mail,
  Users
} from 'lucide-react';
import { FamilyMember, Alert } from '../types';

interface FamilyMembersViewProps {
  familyMembers: FamilyMember[];
  alerts: Alert[];
  showToast?: (title: string, message: string, type: 'success' | 'alert' | 'info') => void;
  onInviteMember: (member: { name: string; age: number; relationship: string; email: string }) => void;
  selectedRecipientId?: string;
  onSelectRecipient?: (id: string) => void;
}

export default function FamilyMembersView({ 
  familyMembers, 
  alerts, 
  showToast, 
  onInviteMember,
  selectedRecipientId,
  onSelectRecipient 
}: FamilyMembersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'alert' | 'good'>('all');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  // Form states
  const [inviteName, setInviteName] = useState('');
  const [inviteAge, setInviteAge] = useState('');
  const [inviteRelation, setInviteRelation] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  // Selected member detail panel state
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const activeAlerts = alerts.filter(a => a.status === 'pending');

  const filteredMembers = familyMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.primaryConditions.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const hasAlert = activeAlerts.some(a => a.familyMemberId === member.id);
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'alert' && hasAlert) || 
                          (statusFilter === 'good' && !hasAlert);

    return matchesSearch && matchesStatus;
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteRelation || !inviteEmail) return;

    onInviteMember({
      name: inviteName,
      age: Number(inviteAge) || 45,
      relationship: inviteRelation,
      email: inviteEmail
    });

    // Reset
    setInviteName('');
    setInviteAge('');
    setInviteRelation('');
    setInviteEmail('');
    setIsInviteOpen(false);
    if (showToast) {
      showToast('HIPAA Invitation Sent', `Secure email invitation was sent to ${inviteEmail} under HIPAA Access Policies.`, 'success');
    } else {
      alert(`Success! Secure email invitation was sent to ${inviteEmail} under HIPAA Access Policies.`);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 selection:bg-teal-500 selection:text-white">
      
      {/* Search, Filter & Action Ribbon */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, condition..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex bg-slate-50 p-1 border border-slate-100 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('good')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'good' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Stable
            </button>
            <button
              onClick={() => setStatusFilter('alert')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'alert' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Alarms
            </button>
          </div>

          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Grid of members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => {
          const hasAlert = activeAlerts.some(a => a.familyMemberId === member.id);
          const memberAlerts = activeAlerts.filter(a => a.familyMemberId === member.id);
          const isSelected = member.id === selectedRecipientId;

          return (
            <div 
              key={member.id}
              className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6 transition-all ${
                hasAlert 
                  ? 'border-rose-300 ring-2 ring-rose-500/10' 
                  : isSelected
                  ? 'border-teal-500 ring-2 ring-teal-500/10'
                  : 'border-slate-200/80 hover:shadow-md'
              }`}
            >
              {/* Header profile details */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-teal-600 text-sm shadow-sm">
                      {member.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{member.name}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">{member.relationship} (Age {member.age})</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                    hasAlert ? 'bg-rose-100 text-rose-800' : isSelected ? 'bg-teal-100 text-teal-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {hasAlert ? 'ALARM ACTIVE' : isSelected ? 'ACTIVE RECIPIENT' : 'SECURE / STABLE'}
                  </span>
                </div>

                {/* Primary medical conditions */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Diagnosed Conditions</span>
                  <div className="flex flex-wrap gap-1.5">
                    {member.primaryConditions.map((cond, idx) => (
                      <span key={idx} className="bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-xl">
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Live wearable telemetries */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                    <Heart className="w-4.5 h-4.5 text-rose-500 mx-auto mb-1" />
                    <span className="text-slate-400 text-[9px] block">Heart Pulse</span>
                    <span className="font-extrabold text-xs text-slate-800">{member.wearableData.heartRate} bpm</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                    <Activity className="w-4.5 h-4.5 text-emerald-500 mx-auto mb-1" />
                    <span className="text-slate-400 text-[9px] block">Today's Steps</span>
                    <span className="font-extrabold text-xs text-slate-800">{member.wearableData.steps} / 6,000</span>
                  </div>
                </div>

                {/* Active alert indicator details */}
                {hasAlert && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                      <ShieldAlert className="w-4.5 h-4.5 text-rose-600 animate-pulse" />
                      <span>{memberAlerts[0]?.type.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-normal">{memberAlerts[0]?.reasoningSummary}</p>
                  </div>
                )}
              </div>

              {/* Quick communications block */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-3">
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="text-[11px] font-bold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer text-left"
                  >
                    View health overview
                  </button>
                  {onSelectRecipient && (
                    <button
                      onClick={() => {
                        onSelectRecipient(member.id);
                        if (showToast) {
                          showToast('Active Recipient Context Switched', `System switched context to ${member.name}.`, 'info');
                        }
                      }}
                      className={`text-[10px] font-bold text-left cursor-pointer transition-colors ${
                        isSelected 
                          ? 'text-teal-700 font-extrabold' 
                          : 'text-slate-400 hover:text-teal-600'
                      }`}
                    >
                      {isSelected ? '● Active Recipient' : '○ Set as Active Recipient'}
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (showToast) {
                        showToast('VoIP Call Initiated', `Dialing direct CareCircle VoIP link to ${member.name}'s wearable device...`, 'info');
                      } else {
                        alert(`Calling VoIP audio directly to ${member.name}'s wristwatch...`);
                      }
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 flex items-center justify-center cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if (showToast) {
                        showToast('Encrypted Message Opened', `Redirecting to secure messaging tunnel for ${member.name}'s care circle...`, 'success');
                      } else {
                        alert(`Opening encrypted SMS message room for ${member.name}'s caregivers...`);
                      }
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 flex items-center justify-center cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECT MEMBER HEALTH OVERVIEW DIALOG */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Health Profile Summary</span>
              <h3 className="text-xl font-extrabold text-slate-950 mt-3">{selectedMember.name}</h3>
              <p className="text-xs text-slate-400 mt-1">Diagnosed primary conditions and treatment summary</p>
            </div>

            <div className="space-y-4 text-xs font-medium">
              
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Active Medical Directives</span>
                <div className="flex flex-col gap-2">
                  {selectedMember.primaryConditions.map((cond, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                      <span className="text-slate-700 font-semibold">{cond}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Today's Medication Adherence</span>
                <div className="space-y-2">
                  {selectedMember.medications.map((med, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800">{med.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Time: {med.time}</div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        med.status === 'taken' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {med.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* INVITE NEW MEMBER DIALOG */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-950 tracking-tight">Invite Family Member</h3>
              <p className="text-xs text-slate-400">Invite a new care recipient profile or a supporting caregiver to coordinate together.</p>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Member Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Robert Vance"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Age (optional)</label>
                  <input
                    type="number"
                    value={inviteAge}
                    onChange={(e) => setInviteAge(e.target.value)}
                    placeholder="75"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Relationship</label>
                  <input
                    type="text"
                    required
                    value={inviteRelation}
                    onChange={(e) => setInviteRelation(e.target.value)}
                    placeholder="Father / Aunt / Brother"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Contact Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="robert.vance@example.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-teal-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Send CareCircle Invitation</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
