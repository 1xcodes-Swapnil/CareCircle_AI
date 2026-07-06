import { motion } from 'motion/react';
import { 
  Heart, 
  Shield, 
  Zap, 
  Users, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  Smile, 
  Clock, 
  Smartphone, 
  MessageSquare 
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const features = [
    {
      icon: <Smile className="w-6 h-6 text-teal-500" />,
      title: "Reassurance First",
      description: "Unlike traditional clinical dashboards, we answer 'Is my family okay?' instantly with emotional clarity."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-teal-500" />,
      title: "Multi-Agent AI Specialists",
      description: "Autonomous specialized agents work in unison to track medications, verify physical safety, and detect trends."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-teal-500" />,
      title: "Elder & Elder-Friendly",
      description: "Extra large typography, high contrast modes, voice guidance, and massive 48px touch targets for elderly members."
    },
    {
      icon: <Heart className="w-6 h-6 text-teal-500" />,
      title: "Smartwatch Telemetry Sync",
      description: "Real-time background sync of pulse, step trends, sleep depth, and emergency smartwatch SOS actions."
    },
    {
      icon: <Shield className="w-6 h-6 text-teal-500" />,
      title: "Clinical Safe Guardrails",
      description: "Every agent recommendations passes through a multi-agent Clinical Reflection filter to strip unsafe medical advice."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-teal-500" />,
      title: "Interactive AI Companion",
      description: "Consult your AI Family Care companion about sleep quality, clinical questions, or cognitive training prompts."
    }
  ];

  const pricing = [
    {
      name: "Standard Circle",
      price: "$19",
      period: "per month",
      desc: "Perfect for secondary peace of mind monitoring for single-recipient care.",
      features: [
        "1 Care Recipient Profile",
        "Up to 3 Caregiver accounts",
        "Standard Smartwatch Sync",
        "Daily AI Wellness summaries",
        "Standard email and push support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Family Circle Premium",
      price: "$39",
      period: "per month",
      desc: "Our most popular tier. Complete coverage for multiple family members.",
      features: [
        "Up to 3 Care Recipient Profiles",
        "Unlimited Caregiver accounts",
        "Real-time Vitals & Sleep Syncing",
        "Continuous Multi-Agent Orchestration",
        "Priority SMS & Voice Calling Alerts",
        "Weekly AI cognitive risk trends"
      ],
      cta: "Protect Your Family",
      popular: true
    },
    {
      name: "Enterprise Clinical Hub",
      price: "Custom",
      period: "for organizations",
      desc: "Tailored clinical dashboards and custom APIs for nursing homes & hospitals.",
      features: [
        "Unlimited Recipient Profiles",
        "Custom clinical integration",
        "HIPAA-compliant data storage",
        "Dedicated account manager",
        "Custom agent-logic fine tuning"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* Top Navbar Header */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/10">
              <Heart className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">CareCircle AI</h1>
              <p className="text-[10px] text-slate-500 font-mono">Autonomous Family Peace of Mind</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              id="landing_btn_nav_login"
              onClick={onLogin}
              className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors cursor-pointer px-4 py-2"
            >
              Sign In
            </button>
            <button 
              id="landing_btn_nav_getstarted"
              onClick={onGetStarted}
              className="text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/15 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-teal-50/40 via-white to-white">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-teal-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Multi-Agent Family Care Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-none">
            Is your family okay? <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
              Know instantly, with absolute calm.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            CareCircle AI connects wearables, medication checklists, and safety sensors. Our specialized autonomous agents coordinate behind the scenes to deliver reassuring human-centered guidance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              id="landing_btn_hero_primary"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-xl shadow-teal-600/20 hover:shadow-teal-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Secure Your Circle Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              id="landing_btn_hero_secondary"
              onClick={onLogin}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-2xl transition-all cursor-pointer shadow-sm"
            >
              Enter Client Workspace
            </button>
          </div>

          {/* Social Proof */}
          <div className="pt-12 text-center space-y-4">
            <p className="text-xs uppercase font-mono tracking-widest text-slate-400">Trusted by over 4,500 active caregivers & clinical circles</p>
            <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400 font-bold text-sm tracking-tight opacity-75">
              <span>Apple Health Sync</span>
              <span className="text-slate-300">•</span>
              <span>Notion API Ready</span>
              <span className="text-slate-300">•</span>
              <span>Google Fit Certified</span>
              <span className="text-slate-300">•</span>
              <span>Stripe Protected Secure Payment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reassurance First Pitch (The Emotional Anchor) */}
      <section className="py-16 bg-white border-t border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            A Dashboard Designed to Heal Anxiety, Not Induce Panic
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Traditional health apps bombard you with lines of telemetry, warning icons, and medical charts, creating continuous background anxiety. 
            <strong> CareCircle is different.</strong> Our design system prioritizes absolute human reassurance. Every morning, we greet you with a simple, clear reassurance message: <em>"Everyone in your family is safe today."</em>
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Intelligent Features for Modern Peace of Mind</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
              Explore how CareCircle coordinates safety, medication adherence, and wearable telemetry with high-fidelity design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <div key={idx} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-base">{feat.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">How It Works</h2>
            <p className="text-slate-500 text-sm sm:text-base">Setting up effortless family guardrails takes less than 5 minutes.</p>
          </div>

          <div className="relative border-l-2 border-slate-100 pl-8 ml-4 space-y-12">
            <div className="relative">
              <span className="absolute -left-12 top-0.5 w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-md">1</span>
              <h3 className="font-bold text-slate-900 text-lg">Connect Wearable smartwatch</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed max-w-xl">
                Configure your parents Apple Watch, Google Fitbit, or Garmin device. Our platform establishes a continuous background vitals synchronization immediately.
              </p>
            </div>
            <div className="relative">
              <span className="absolute -left-12 top-0.5 w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-md">2</span>
              <h3 className="font-bold text-slate-900 text-lg">Define Daily Check-in & Medication Schedules</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed max-w-xl">
                Add clinical medications, daily check-in windows, and primary doctors. Our specialized agents configure appropriate alarms and notifications.
              </p>
            </div>
            <div className="relative">
              <span className="absolute -left-12 top-0.5 w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-md">3</span>
              <h3 className="font-bold text-slate-900 text-lg">Gain Autonomous Reassurance</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed max-w-xl">
                Relax knowing that if a check-in is missed, or a physical SOS action is triggered, our platform automatically launches specialized agents, and dispatches SMS alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Simple, Reassuring Pricing</h2>
            <p className="text-slate-500 text-sm sm:text-base">No contracts, cancel anytime. Try any tier free for 14 days.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricing.map((tier, idx) => (
              <div 
                key={idx} 
                className={`bg-white rounded-3xl p-8 border text-left flex flex-col justify-between shadow-sm relative overflow-hidden ${
                  tier.popular ? 'ring-2 ring-teal-600 border-teal-200' : 'border-slate-100'
                }`}
              >
                {tier.popular && (
                  <span className="absolute top-4 right-4 bg-teal-100 text-teal-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    RECOMMENDED
                  </span>
                )}
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{tier.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{tier.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1.5 border-b border-slate-100 pb-5">
                    <span className="text-4xl font-extrabold text-slate-900">{tier.price}</span>
                    <span className="text-xs text-slate-500">/ {tier.period}</span>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-600">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4.5 h-4.5 text-teal-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={onGetStarted}
                  className={`w-full mt-8 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    tier.popular
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Designed with Caregivers, for Parents</h2>
            <p className="text-slate-500 text-sm sm:text-base">Here is why families trust CareCircle AI with their everyday wellness.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
              <p className="text-xs sm:text-sm italic text-slate-600 leading-relaxed">
                "My 82-year-old father live by himself 3 hours away. I was constantly calling him just to verify he took his medication, which irritated him. Now, CareCircle syncs with his Fitbit. I know he is okay without nagging him."
              </p>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Mark Vance</h4>
                <p className="text-[10px] text-slate-400">Caregiver for Eleanor Vance</p>
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
              <p className="text-xs sm:text-sm italic text-slate-600 leading-relaxed">
                "I like the simplified screen. When it pops up, I just touch the giant green checkin button and it lets my daughter know I am healthy. I can also ask the AI companion clinical health questions easily."
              </p>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Eleanor Vance</h4>
                <p className="text-[10px] text-slate-400">Care Recipient (78 yrs old)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Call To Action */}
      <section className="py-20 bg-gradient-to-t from-teal-50 to-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Ready to secure your family circle?</h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
            Get started today. Setup is fully intuitive, HIPAA-protected, and designed for elder accessibility.
          </p>
          <button 
            id="landing_btn_cta_getstarted"
            onClick={onGetStarted}
            className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-xl shadow-teal-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Protect Your Loved Ones</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Standard Footing */}
      <footer className="border-t border-slate-100 bg-white py-12 text-center text-slate-400 text-xs font-mono">
        <div className="max-w-5xl mx-auto px-6 space-y-4">
          <p>© 2026 CareCircle AI Inc. All rights reserved.</p>
          <p className="max-w-2xl mx-auto opacity-75">
            Disclaimer: CareCircle AI is an informational support companion. Our autonomous agents are not licensed doctors, and do not provide legal medical diagnoses. Always consult a physician for clinical emergencies.
          </p>
        </div>
      </footer>

    </div>
  );
}
