import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function DemoControls() {
  const { experiments, setExperimentVariant } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-white/5 backdrop-blur-md text-gray-300 p-3 rounded-full shadow-lg hover:bg-white/10 hover:text-white transition-all z-[100] border border-white/10"
        title="Controles Demo (Amplitude Experiment)"
      >
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 w-80 bg-[var(--color-surface)]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
      <div className="bg-white/5 px-4 py-3 flex justify-between items-center border-b border-white/10">
        <h3 className="font-bold text-xs uppercase tracking-widest text-white flex items-center gap-2">
          <Settings className="w-3 h-3 text-[var(--color-accent-cyan)]" />
          Demo Controls (Exp)
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4 space-y-5 max-h-96 overflow-y-auto">
        <div className="space-y-3">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hero CTA Widget</label>
          <div className="flex gap-2">
            <button onClick={() => setExperimentVariant('hero_cta', 'A')} className={`flex-1 py-2 px-2 text-xs font-bold tracking-wider uppercase rounded-lg border transition-all ${experiments.hero_cta === 'A' ? 'bg-[var(--color-accent-cyan)]/20 border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)]' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>Option A</button>
            <button onClick={() => setExperimentVariant('hero_cta', 'B')} className={`flex-1 py-2 px-2 text-xs font-bold tracking-wider uppercase rounded-lg border transition-all ${experiments.hero_cta === 'B' ? 'bg-[var(--color-accent-cyan)]/20 border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)]' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>Option B</button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Checkout Layout</label>
          <div className="flex gap-2">
            <button onClick={() => setExperimentVariant('checkout_layout', 'A')} className={`flex-1 py-2 px-2 text-xs font-bold tracking-wider uppercase rounded-lg border transition-all ${experiments.checkout_layout === 'A' ? 'bg-[var(--color-accent-cyan)]/20 border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)]' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>A (2 Pasos)</button>
            <button onClick={() => setExperimentVariant('checkout_layout', 'B')} className={`flex-1 py-2 px-2 text-xs font-bold tracking-wider uppercase rounded-lg border transition-all ${experiments.checkout_layout === 'B' ? 'bg-[var(--color-accent-cyan)]/20 border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)]' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>B (1 Paso)</button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Scarcity Banner</label>
          <div className="flex gap-2">
            <button onClick={() => setExperimentVariant('scarcity_banner', 'on')} className={`flex-1 py-2 px-2 text-xs font-bold tracking-wider uppercase rounded-lg border transition-all ${experiments.scarcity_banner === 'on' ? 'bg-[var(--color-accent-cyan)]/20 border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)]' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>ON</button>
            <button onClick={() => setExperimentVariant('scarcity_banner', 'off')} className={`flex-1 py-2 px-2 text-xs font-bold tracking-wider uppercase rounded-lg border transition-all ${experiments.scarcity_banner === 'off' ? 'bg-[var(--color-accent-cyan)]/20 border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)]' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>OFF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
