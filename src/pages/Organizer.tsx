import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, DollarSign, Plus, Settings, X, Wand2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { trackEvent, triggerGuide } from '../lib/amplitude';
import { formatCurrency, getFallbackImage } from '../lib/utils';
import { MOCK_EVENTS } from '../lib/mockData';
import { useToast } from '../components/Toast';
import { generateEventImage } from '../lib/eventImages';

export function Organizer() {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    category: 'Conciertos',
    city: '',
    venue: '',
    date: '',
    capacity: '',
    basePrice: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (user.role !== 'organizer') return;
    trackEvent("Organizer Dashboard Viewed", {});
    triggerGuide("Guía de organizador");
  }, [user.role]);

  if (user.role !== 'organizer') {
    return (
      <div className="text-center py-24 animate-in fade-in">
        <h2 className="text-2xl font-bold mb-4 uppercase tracking-tight">Acceso Denegado</h2>
        <p className="text-gray-400 mb-8 font-medium">Esta sección es exclusiva para organizadores.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-[var(--color-accent-cyan)] text-black rounded-lg font-bold uppercase tracking-widest text-xs">Ir al Inicio</button>
      </div>
    );
  }

  const myEvents = MOCK_EVENTS.slice(0, 3); // Mocking that the first 3 belong to this organizer

  const handleCreateEvent = () => {
    trackEvent("Event Creation Started", {});
    setIsModalOpen(true);
  };

  const handleExport = (event_id: string) => {
    trackEvent("Attendee List Exported", { event_id });
    showToast("Lista de asistentes exportada (Demo)", "success");
  };

  const handleGenerateImage = async () => {
    if (!eventData.name || !eventData.city) {
      showToast("Ingresa nombre y ciudad primero", "warning");
      return;
    }
    setIsGenerating(true);
    trackEvent("AI Image Generation Requested", { category: eventData.category });
    try {
      const url = await generateEventImage(eventData.name, eventData.category as any, eventData.city);
      setEventData(prev => ({ ...prev, imageUrl: url }));
      showToast("Imagen generada con IA", "success");
    } catch (e) {
      showToast("Error generando imagen", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent("Event Created", { event_name: eventData.name, category: eventData.category });
    setIsModalOpen(false);
    showToast("Evento creado exitosamente (Demo)", "success");
    setEventData({
      name: '', description: '', category: 'Conciertos', city: '', venue: '', date: '', capacity: '', basePrice: '', imageUrl: ''
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">Portal del Organizador</h1>
          <p className="text-gray-400 font-medium">Bienvenido de vuelta, {user.name}</p>
        </div>
        <button 
          onClick={handleCreateEvent}
          className="flex items-center gap-2 px-6 py-4 bg-[var(--color-accent-cyan)] text-black text-sm rounded-xl font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          <Plus className="w-5 h-5"/> Crear Evento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--color-surface)] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent-mint)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-accent-mint)]/20 transition-colors"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-lg shadow-[var(--color-accent-mint)]/10">
              <DollarSign className="w-5 h-5 text-[var(--color-accent-mint)]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ingresos Totales (Demo)</p>
              <h3 className="text-2xl font-bold mt-1 text-[var(--color-accent-mint)]">{formatCurrency(125000000)}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[var(--color-surface)] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent-cyan)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-accent-cyan)]/20 transition-colors"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-lg shadow-[var(--color-accent-cyan)]/10">
              <BarChart3 className="w-5 h-5 text-[var(--color-accent-cyan)]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tickets Vendidos</p>
              <h3 className="text-2xl font-bold mt-1 text-[var(--color-accent-cyan)]">4,250</h3>
            </div>
          </div>
        </div>
        <div className="bg-[var(--color-surface)] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent-purple)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-accent-purple)]/20 transition-colors"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-lg shadow-[var(--color-accent-purple)]/10">
              <Users className="w-5 h-5 text-[var(--color-accent-purple)]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Conversión Promedio</p>
              <h3 className="text-2xl font-bold mt-1 text-[var(--color-accent-purple)]">8.4%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-[var(--color-surface)] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
          <h2 className="text-lg font-bold uppercase tracking-tight">Tus Eventos Activos</h2>
        </div>
        <div className="divide-y divide-white/5">
          {myEvents.map(event => (
            <div key={event.event_id} className="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-white/5 transition-colors group">
              <div 
                className="w-full md:w-24 h-16 rounded-xl border border-white/10 flex-shrink-0 relative overflow-hidden"
                style={{ background: event.imageUrl ? 'none' : `linear-gradient(135deg, ${event.gradient[0]} 0%, ${event.gradient[1]} 100%)` }}
              >
                {event.imageUrl && (
                  <img 
                    src={event.imageUrl} 
                    alt={event.name} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    loading="lazy" 
                    decoding="async" 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFallbackImage(event.category);
                    }} 
                  />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-sm uppercase tracking-tight">{event.name}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{new Date(event.date).toLocaleDateString()} • {event.venue}</p>
                <div className="text-[10px] text-[var(--color-accent-mint)] font-bold tracking-widest uppercase mt-2">Vendido: 85%</div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => handleExport(event.event_id)}
                  className="flex-1 md:flex-none px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-[var(--color-accent-cyan)] hover:text-[var(--color-accent-cyan)] transition-colors"
                >
                  Exportar Lista
                </button>
                <button className="p-3 text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--color-surface)] border border-white/10 shadow-2xl rounded-3xl p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6"/>
            </button>
            <h3 className="font-bold text-2xl mb-6 uppercase tracking-tight">Crear Nuevo Evento</h3>
            
            <form onSubmit={handleSaveEvent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Nombre del evento</label>
                  <input type="text" required value={eventData.name} onChange={e => setEventData({...eventData, name: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Categoría</label>
                  <select value={eventData.category} onChange={e => setEventData({...eventData, category: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] appearance-none transition-colors">
                    <option value="Conciertos">Conciertos</option>
                    <option value="Festivales">Festivales</option>
                    <option value="Teatro">Teatro</option>
                    <option value="Deportes">Deportes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Ciudad</label>
                  <input type="text" required value={eventData.city} onChange={e => setEventData({...eventData, city: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Lugar (Venue)</label>
                  <input type="text" required value={eventData.venue} onChange={e => setEventData({...eventData, venue: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Fecha</label>
                  <input type="date" required value={eventData.date} onChange={e => setEventData({...eventData, date: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors" style={{colorScheme: 'dark'}} />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Aforo</label>
                    <input type="number" required value={eventData.capacity} onChange={e => setEventData({...eventData, capacity: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Precio Base</label>
                    <input type="number" required value={eventData.basePrice} onChange={e => setEventData({...eventData, basePrice: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Descripción</label>
                <textarea rows={3} required value={eventData.description} onChange={e => setEventData({...eventData, description: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors"></textarea>
              </div>

              {/* AI Image Generation Section */}
              <div className="p-6 border border-[var(--color-accent-purple)]/30 rounded-2xl bg-[var(--color-accent-purple)]/5">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-[var(--color-accent-purple)] flex items-center gap-2 mb-2"><Wand2 className="w-4 h-4"/> Imagen del Evento (IA)</h4>
                    <p className="text-xs text-gray-400 mb-4">Genera una imagen impactante para tu evento usando nuestra inteligencia artificial. Se basará en el nombre, categoría y ciudad.</p>
                    <button 
                      type="button"
                      onClick={handleGenerateImage}
                      disabled={isGenerating}
                      className="px-6 py-3 bg-[var(--color-accent-purple)] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? 'Generando...' : 'Generar Imagen Mágicamente'}
                    </button>
                  </div>
                  <div className="w-32 h-32 md:w-48 md:h-32 bg-black/50 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {eventData.imageUrl ? (
                      <img src={eventData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Vista Previa</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="px-8 py-4 bg-[var(--color-accent-cyan)] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
