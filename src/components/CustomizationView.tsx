import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Heart, 
  Palette, 
  Eye, 
  Smartphone, 
  Layout, 
  Save,
  CheckCircle
} from 'lucide-react';

export default function CustomizationView() {
  const [themeColor, setThemeColor] = useState<'teal' | 'indigo' | 'slate'>('teal');
  const [cardBorder, setCardBorder] = useState<'flat' | 'rounded' | 'shadow'>('rounded');
  const [fontSize, setFontSize] = useState<'compact' | 'standard' | 'accessible'>('standard');
  const [isApplying, setIsApplying] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }, 1000);
  };

  const previewColors = {
    teal: 'bg-teal-500 border-teal-500',
    indigo: 'bg-indigo-500 border-indigo-500',
    slate: 'bg-slate-700 border-slate-700'
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 text-slate-900 selection:bg-teal-500 selection:text-white">
      
      {/* Customization control card */}
      <div className="bg-white border border-slate-200/80 p-6 sm:p-10 rounded-3xl shadow-sm space-y-6">
        
        <div className="border-b border-slate-100 pb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="font-extrabold text-slate-950 text-base">Workspace Theme</h3>
            <p className="text-xs text-slate-500 mt-0.5">Adjust aesthetic parameters for optimized cognitive readability.</p>
          </div>
        </div>

        <form onSubmit={handleApply} className="space-y-6">
          
          <div className="space-y-4 font-medium text-xs">
            
            {/* Color Accent choice */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Accent Palette Color</span>
              <div className="grid grid-cols-3 gap-3">
                {(['teal', 'indigo', 'slate'] as const).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setThemeColor(col)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold capitalize ${
                      themeColor === col 
                        ? 'bg-teal-50 border-teal-500 text-teal-700' 
                        : 'bg-slate-50 border-slate-100 text-slate-500'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizing/Typography Choice - critical for elders! */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Reading Scale / Sizing</span>
              <div className="grid grid-cols-3 gap-3">
                {(['compact', 'standard', 'accessible'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFontSize(sz)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold capitalize ${
                      fontSize === sz 
                        ? 'bg-teal-50 border-teal-500 text-teal-700' 
                        : 'bg-slate-50 border-slate-100 text-slate-500'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                "Accessible" enhances contrast ratios and expands paragraph spacing for elderly recipients.
              </p>
            </div>

            {/* Card style selection */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Card Styling</span>
              <div className="grid grid-cols-3 gap-3">
                {(['flat', 'rounded', 'shadow'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setCardBorder(style)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold capitalize ${
                      cardBorder === style 
                        ? 'bg-teal-50 border-teal-500 text-teal-700' 
                        : 'bg-slate-50 border-slate-100 text-slate-500'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
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
                <span>Visual parameters synced. UI customized successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isApplying}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-teal-600/10 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Save className="w-4.5 h-4.5" />
            <span>{isApplying ? 'Applying Styles...' : 'Confirm Visual Setup'}</span>
          </button>
        </form>

      </div>

    </div>
  );
}
