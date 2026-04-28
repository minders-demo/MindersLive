import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MOCK_EVENTS } from '../lib/mockData';

export function Preferences() {
  const { user, updatePreferences } = useAppContext();
  const navigate = useNavigate();

  const cities = Array.from(new Set(MOCK_EVENTS.map(e => e.city)));
  const categories = Array.from(new Set(MOCK_EVENTS.map(e => e.category)));

  const [favCity, setFavCity] = useState(user.preferences?.favorite_city || '');
  const [favCategories, setFavCategories] = useState<string[]>(user.preferences?.favorite_categories || []);
  const [marketing, setMarketing] = useState(user.preferences?.marketing_opt_in ?? true);

  if (user.role === 'anonymous') {
    navigate('/login');
    return null;
  }

  const handleSave = () => {
    updatePreferences({
      favorite_city: favCity,
      favorite_categories: favCategories,
      marketing_opt_in: marketing
    });
    alert('Preferencias guardadas (Simulación Amplitude Identify)');
  };

  const toggleCategory = (cat: string) => {
    setFavCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8 animate-in fade-in">
      <h1 className="text-3xl font-bold uppercase tracking-tight">Mis Preferencias</h1>
      
      <div className="bg-[var(--color-surface)] border border-white/5 rounded-3xl p-8 space-y-8 shadow-2xl">
        
        <div>
          <h2 className="text-lg font-bold mb-4 uppercase tracking-tight">Ciudad Favorita</h2>
          <select 
            value={favCity}
            onChange={(e) => setFavCity(e.target.value)}
            className="w-full p-3 bg-[var(--color-primary)] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors"
          >
            <option value="">Selecciona tu ciudad</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4 uppercase tracking-tight">Categorías Favoritas</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-widest ${
                  favCategories.includes(cat) 
                    ? 'bg-[var(--color-accent-cyan)]/20 border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)] shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
           <label className="flex items-center gap-3 cursor-pointer">
             <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="w-5 h-5 accent-[var(--color-accent-pink)] rounded focus:ring-offset-0 focus:ring-0" />
             <span className="text-gray-300 text-sm font-medium">Recibir ofertas y sugerencias basadas en mis gustos</span>
           </label>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-pink)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm uppercase tracking-widest shadow-lg shadow-purple-500/20"
        >
          <Save className="w-5 h-5"/> Guardar Preferencias
        </button>

      </div>
    </div>
  );
}
