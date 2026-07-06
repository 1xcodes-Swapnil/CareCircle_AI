import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Phone, 
  MessageSquare, 
  Mic, 
  Volume2, 
  Calendar,
  Smile, 
  Meh, 
  Frown, 
  HeartHandshake,
  ShieldAlert,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { FamilyMember, CheckIn, Alert } from '../types';

interface RecipientDashboardViewProps {
  user: { name: string; role: string } | null;
  familyMembers: FamilyMember[];
  alerts: Alert[];
  checkIns: CheckIn[];
  submitCheckin: (status: 'completed' | 'missed' | 'delayed', notes: string) => void;
  triggerSimulation: (type: string, description: string) => void;
}

export default function RecipientDashboardView({
  user,
  familyMembers,
  alerts,
  checkIns,
  submitCheckin,
  triggerSimulation
}: RecipientDashboardViewProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodMessage, setMoodMessage] = useState<string>('');
  
  // Local state for interactive medication completion
  const [medTaken, setMedTaken] = useState<Record<string, boolean>>({
    'Lisinopril (Morning)': false,
    'Multivitamins (Afternoon)': false,
    'Calcium Supplement (Night)': false
  });

  const [assistantResponse, setAssistantResponse] = useState<string>(
    "Hello Eleanor, I'm your CareCompanion. I'm keeping watch over your vitals today. Your heart rate looks perfectly steady at 72 beats per minute. Don't forget your warm tea!"
  );

  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  
  // Custom interactive mood feedback
  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    const notesMap: Record<string, string> = {
      'happy': 'I am feeling great today!',
      'okay': 'I am feeling fine, just resting.',
      'sad': 'I am feeling a little tired or lonely today.',
      'anxious': 'I am feeling a bit anxious.'
    };
    
    // Trigger checkin event automatically under the hood
    submitCheckin('completed', notesMap[mood] || 'Registered wellness mood');

    if (mood === 'happy') {
      setMoodMessage("Wonderful! Sarah has been notified that you are in high spirits today! ❤️");
      setAssistantResponse("That's lovely to hear, Eleanor! I have updated Sarah. Let's listen to your favorite classical music playlist or do some light stretching.");
    } else if (mood === 'okay') {
      setMoodMessage("Good. Remember to take regular sips of water and enjoy the garden view. 🌿");
      setAssistantResponse("Steady and calm is a great way to be. Let me know if you would like me to read today's weather forecast or your calendar events.");
    } else if (mood === 'sad') {
      setMoodMessage("Sending you warm hugs! Sarah has been notified and will call you soon. 🤗");
      setAssistantResponse("I'm sorry you're feeling a bit low, Eleanor. I've sent a gentle nudge to Sarah to let her know you'd love a quick call. I'm right here with you.");
      // Simulate mood alert or helper triggers
      triggerSimulation('MoodUpdated', 'Eleanor registered feeling lonely/sad on her interactive Recipient screen.');
    } else if (mood === 'anxious') {
      setMoodMessage("Take a slow, deep breath. We are right here with you and you are safe. 🌸");
      setAssistantResponse("Take a deep breath in... hold... and gently let it out. You are safe. I've let Sarah know you're feeling a bit uneasy so she can check in.");
      triggerSimulation('MoodUpdated', 'Eleanor registered high anxiety. Smartwatch heart rate telemetry synced.');
    }
  };

  const toggleMedication = (name: string) => {
    setMedTaken(prev => {
      const updated = { ...prev, [name]: !prev[name] };
      // Toast or notify caregiver
      submitCheckin('completed', `Confirmed medication taken: ${name}`);
      return updated;
    });
  };

  const handleImSafe = () => {
    submitCheckin('completed', "Eleanor clicked the large 'I'm Safe' button from her dedicated screen.");
    // Display a beautiful celebratory message in local assistant
    setAssistantResponse("I have successfully registered your daily confirmation. Sarah is notified. You are an absolute superstar!");
    // Trigger simulation completion under the hood to satisfy state flows
    setSelectedMood('happy');
    setMoodMessage("Caregivers notified. Your 'I am Safe' confirmation is securely logged! ✅");
  };

  const handleSOS = () => {
    triggerSimulation('EmergencyTriggered', 'SOS dispatched via physical panic dashboard on Eleanor Recipient screen.');
    setAssistantResponse("Eleanor, I've detected your Emergency SOS! Dispatching coordinates and notifying Sarah and standby responders immediately. Stay calm.");
  };

  const startVoiceAssistant = () => {
    setIsListening(true);
    setTranscription("Listening...");
    setTimeout(() => {
      setTranscription('"How is my schedule today?"');
    }, 1500);

    setTimeout(() => {
      setIsListening(false);
      setAssistantResponse(
        "You have a Cognitive Brain Exercises session with Emma Vance at 2:00 PM today. Sarah is also scheduled to visit you later this afternoon around 5:30 PM! I've set a reminder to alert you 15 minutes prior."
      );
      setTranscription('');
    }, 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 selection:bg-teal-500 selection:text-white">
      
      {/* 1. ELEANOR GREETING HEADER */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-8 rounded-3xl border border-amber-100 shadow-sm text-slate-950 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif text-slate-900 leading-tight">
              Good Morning, Eleanor! ☀️
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              We are so glad to see you today. Today is Thursday, July 2.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-emerald-500 text-white font-extrabold px-5 py-2.5 rounded-2xl shadow-md shrink-0 text-sm">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse shrink-0" />
            <span>Connected with Sarah</span>
          </div>
        </div>
      </div>

      {/* 2. THE BIG ACTIONS: I'M SAFE & SOS PANIC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* HUGE I'M SAFE BUTTON */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleImSafe}
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center gap-4 border border-emerald-400 group cursor-pointer transition-colors h-72"
        >
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-all">
            <CheckCircle className="w-10 h-10 text-white stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black tracking-tight block">I'm Okay!</span>
            <span className="text-emerald-100 font-bold text-sm block">Tap to let Sarah know you are safe</span>
          </div>
        </motion.button>

        {/* HUGE EMERGENCY SOS BUTTON */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleSOS}
          className="bg-rose-600 hover:bg-rose-700 text-white p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center gap-4 border border-rose-500 group cursor-pointer transition-colors h-72"
        >
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-all animate-pulse">
            <ShieldAlert className="w-10 h-10 text-white stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black tracking-tight block">Get Help Now</span>
            <span className="text-rose-100 font-bold text-sm block">Tap here if you need urgent attention</span>
          </div>
        </motion.button>

      </div>

      {/* 3. FEELING QUESTIONNAIRE */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 text-center">
        <h3 className="text-2xl font-extrabold text-slate-900 font-serif">How are you feeling right now, Eleanor?</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { id: 'happy', label: 'Wonderful', icon: Smile, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
            { id: 'okay', label: 'Just Okay', icon: Meh, color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
            { id: 'sad', label: 'Tired / Low', icon: Frown, color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
            { id: 'anxious', label: 'Uneasy', icon: AlertTriangle, color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
          ].map((item) => {
            const IconComp = item.icon;
            const isSelected = selectedMood === item.id;
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleMoodSelect(item.id)}
                className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer font-extrabold text-base ${
                  isSelected 
                    ? 'ring-4 ring-teal-500 bg-teal-50 border-teal-400 text-teal-800' 
                    : item.color
                }`}
              >
                <IconComp className="w-8 h-8" />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {moodMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-800 font-bold text-base max-w-lg mx-auto"
            >
              {moodMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. MEDICATION CHECKLIST */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-2xl font-extrabold text-slate-900 font-serif">Today's Medicines</h3>
          <p className="text-slate-500 font-medium text-base mt-1">Please tap on each medicine once you have taken it.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'Lisinopril (Morning)', time: '8:00 AM', desc: '1 Pill with water' },
            { key: 'Multivitamins (Afternoon)', time: '12:30 PM', desc: '1 Capsule after lunch' },
            { key: 'Calcium Supplement (Night)', time: '8:30 PM', desc: '1 Tablet before sleep' }
          ].map((item) => {
            const taken = medTaken[item.key];
            
            return (
              <motion.div
                key={item.key}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleMedication(item.key)}
                className={`p-6 rounded-2xl border-2 flex flex-col justify-between h-44 cursor-pointer transition-all select-none ${
                  taken 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm' 
                    : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-5 h-5 ${taken ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="font-mono font-bold text-sm tracking-wider">{item.time}</span>
                  </div>
                  {taken && <CheckCircle className="w-6 h-6 text-emerald-600 fill-emerald-100" />}
                </div>

                <div className="space-y-1 mt-4">
                  <h4 className={`text-lg font-extrabold leading-snug ${taken ? 'line-through text-emerald-700/70' : 'text-slate-800'}`}>
                    {item.key.split(' ')[0]}
                  </h4>
                  <p className={`text-xs font-bold uppercase tracking-wider ${taken ? 'text-emerald-600/70' : 'text-slate-400'}`}>
                    {item.key.includes('Morning') ? 'Morning' : item.key.includes('Afternoon') ? 'Afternoon' : 'Evening'} Dose
                  </p>
                  <p className={`text-sm ${taken ? 'text-emerald-700/60' : 'text-slate-500'}`}>{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 5. INTERACTIVE COMPANION & VOICE ASSISTANT */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/20 rounded-2xl border border-teal-500/30">
            <Sparkles className="w-6 h-6 text-teal-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white font-serif">Your AI Companion</h3>
            <p className="text-[11px] font-mono text-teal-300 uppercase tracking-widest font-extrabold">Eleanor's Companion Active</p>
          </div>
        </div>

        {/* Message bubble from companion */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl text-base leading-relaxed text-slate-200 font-medium">
          "{assistantResponse}"
        </div>

        {/* Voice interaction box */}
        <div className="p-5 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isListening ? 'bg-rose-500 animate-pulse' : 'bg-slate-800'}`}>
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Voice Assistant Companion</p>
              <p className="text-xs text-slate-400 font-medium">{isListening ? 'I am listening to you...' : 'Tap the microphone to speak with me.'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {transcription && (
              <span className="text-xs text-teal-300 font-mono font-bold bg-teal-950 border border-teal-900 px-3 py-1 rounded-lg animate-pulse mr-2">
                {transcription}
              </span>
            )}
            <button
              onClick={startVoiceAssistant}
              disabled={isListening}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>Tap to Speak</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. MESSAGES FROM FAMILY & CALENDAR SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Messages from family */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageSquare className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-extrabold text-slate-900">Family Messages</h3>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-teal-50/50 border border-teal-100/50 rounded-2xl space-y-1 text-sm font-medium">
              <div className="flex justify-between items-center text-slate-500 text-xs">
                <span className="font-bold text-teal-700">Sarah (Daughter)</span>
                <span>8:15 AM</span>
              </div>
              <p className="text-slate-800 text-sm leading-relaxed pt-1">
                "Good morning Mom! I hope you slept wonderfully. I'm heading over after my doctor's appointment around 5:30 PM. I'm bringing those fresh strawberries you love! Let me know if you need anything else! ❤️"
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1 text-sm font-medium">
              <div className="flex justify-between items-center text-slate-500 text-xs">
                <span className="font-bold text-slate-700">James (Son)</span>
                <span>Yesterday</span>
              </div>
              <p className="text-slate-800 text-sm leading-relaxed pt-1">
                "Hi Mom, just calling to say I love you! The kids did great at their soccer match today. Speak soon!"
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming appointments simplify */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-extrabold text-slate-900">Your Calendar</h3>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-amber-50/50 border border-amber-100/50 rounded-2xl space-y-2 text-sm font-medium">
              <div className="flex justify-between items-center">
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase">Today</span>
                <span className="text-slate-500 text-xs font-bold">2:00 PM</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Emma Vance</h4>
              <p className="text-slate-600 text-xs">Cognitive Brain Exercises Session</p>
              <div className="text-[11px] text-amber-800 font-bold bg-amber-100/40 p-2 rounded-lg mt-2">
                Note: Video session link will appear on your tablet 10 minutes prior.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-1 text-sm font-medium">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Tomorrow</span>
                <span className="text-slate-500 text-xs">10:30 AM</span>
              </div>
              <h4 className="font-bold text-slate-800">Routine Checkup</h4>
              <p className="text-slate-500 text-xs">Dr. James Wilson (Cardiology)</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
