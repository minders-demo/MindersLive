import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Info, Share2, Heart, AlertCircle, ShoppingCart, Facebook, MessageCircle, Link as LinkIcon, Check } from 'lucide-react';
import { MOCK_EVENTS } from '../lib/mockData';
import { useAppContext } from '../context/AppContext';
import { trackEvent, triggerGuide } from '../lib/amplitude';
import { formatCurrency } from '../lib/utils';
import { useToast } from '../components/Toast';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, experiments } = useAppContext();
  const { showToast } = useToast();
  
  const event = MOCK_EVENTS.find(e => e.event_id === id);
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  const viewingCount = useMemo(() => Math.floor(Math.random() * (24 - 8 + 1)) + 8, []);
  const soldCount = useMemo(() => Math.floor(Math.random() * (480 - 180 + 1)) + 180, []);

  const displayLocations = useMemo(() => {
    if (!event) return [];
    const base = [...event.locations];
    if (event.resalable) {
      const resaleLocs = event.locations.map(loc => ({
        ...loc,
        id: `resale_${loc.id}`,
        name: `REVENTA - ${loc.name}`,
        price: loc.price * 0.9,
        available: Math.max(1, Math.floor(loc.available * 0.2)),
        isResale: true
      }));
      return [...base, ...resaleLocs];
    }
    return base;
  }, [event]);

  useEffect(() => {
    if (event) {
      trackEvent("Event Viewed", { 
        event_id: event.event_id, 
        event_name: event.name, 
        category: event.category, 
        city: event.city, 
        venue: event.venue 
      });
      if (event.locations.length > 2) {
        triggerGuide('Seat Map Selection');
      }
    }
  }, [event]);

  useEffect(() => {
    if (!event) return;
    const eventTime = new Date(event.date).getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = eventTime - now;
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ d, h, m, s });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (!event) return <div className="text-center py-20">Evento no encontrado</div>;

  const handleAddToCart = () => {
    if (!selectedLoc) return;
    const location = displayLocations.find(l => l.id === selectedLoc);
    if (!location) return;

    trackEvent("Add To Cart", { 
      event_id: event.event_id, 
      quantity, 
      cart_value: location.price * quantity 
    });

    addToCart({
      event_id: event.event_id,
      location_id: location.id,
      quantity,
      price: location.price
    });

    showToast(
      <div 
        className="cursor-pointer" 
        onClick={() => navigate('/cart')}
      >
        ¡Entrada agregada! <span className="underline ml-1">Ver carrito →</span>
      </div>, 
      'success'
    );
  };

  const selectedLocationDetail = displayLocations.find(l => l.id === selectedLoc);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Hero */}
      <div 
        className="w-full h-64 md:h-[480px] relative flex items-end shadow-2xl"
      >
        <div 
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${event.gradient[0]} 0%, ${event.gradient[1]} 100%)` }}
        >
          {event.imageUrl && (
            <img 
              src={event.imageUrl}
              alt={event.name} 
              className="absolute inset-0 w-full h-full object-cover object-center" 
              loading="lazy" 
              decoding="async" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }} 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)] via-[var(--color-primary)]/40 to-transparent"></div>
        </div>
        <div className="relative z-10 p-8 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              {timeLeft && (
                <div className="flex gap-4 mb-6">
                  <div className="flex flex-col items-center bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 min-w-[70px]">
                    <span className="text-2xl font-bold text-white leading-none">{timeLeft.d}</span>
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mt-1">Días</span>
                  </div>
                  <div className="flex flex-col items-center bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 min-w-[70px]">
                    <span className="text-2xl font-bold text-white leading-none">{timeLeft.h}</span>
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mt-1">Hrs</span>
                  </div>
                  <div className="flex flex-col items-center bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 min-w-[70px]">
                    <span className="text-2xl font-bold text-white leading-none">{timeLeft.m}</span>
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mt-1">Min</span>
                  </div>
                  <div className="flex flex-col items-center bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 min-w-[70px]">
                    <span className="text-2xl font-bold text-[var(--color-accent-pink)] leading-none">{timeLeft.s}</span>
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mt-1">Seg</span>
                  </div>
                </div>
              )}
              <div className="flex gap-2 mb-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest">{event.category}</span>
                {event.status === 'ultimos_cupos' && (
                  <span className="px-3 py-1 bg-[var(--color-accent-yellow)] text-black rounded-full text-[10px] font-bold uppercase tracking-widest">Últimos Cupos</span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight uppercase italic">{event.name}</h1>
              <p className="text-xl text-gray-300 font-medium">{event.artist}</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition border border-white/20"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[var(--color-accent-pink)] text-[var(--color-accent-pink)]' : 'text-white'}`} />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowShare(!showShare)}
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition border border-white/20"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
                {showShare && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--color-surface)] rounded-xl shadow-2xl border border-white/10 p-2 z-50">
                    <button onClick={() => window.open(`https://facebook.com/sharer/sharer.php?u=${window.location.href}`)} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-lg text-sm text-gray-300 font-bold transition">
                      <Facebook className="w-4 h-4 text-[#1877F2]" /> Facebook
                    </button>
                    <button onClick={() => window.open(`https://wa.me/?text=¡Mira este evento en Minders Live! ${window.location.href}`)} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-lg text-sm text-gray-300 font-bold transition">
                      <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-lg text-sm text-gray-300 font-bold transition">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />} {copied ? 'Copiado!' : 'Copiar Link'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-white/5 flex flex-wrap gap-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent-cyan)]/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[var(--color-accent-cyan)]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Fecha</p>
                <p className="font-semibold text-sm">{new Date(event.date).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent-pink)]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[var(--color-accent-pink)]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Horario</p>
                <p className="font-semibold text-sm">Puertas: {event.doorTime} | Inicio: {event.startTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent-purple)]/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-[var(--color-accent-purple)]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Lugar</p>
                <p className="font-semibold text-sm">{event.venue}, {event.city}</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-tighter">Acerca del evento</h2>
            <p className="text-gray-300 leading-relaxed text-sm">{event.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-white/5 shadow-xl">
              <h3 className="text-sm uppercase tracking-widest font-bold mb-4 flex items-center gap-2 text-[var(--color-accent-cyan)]"><Info className="w-4 h-4" /> Reglas del evento</h3>
              <ul className="space-y-2 text-xs text-gray-400 list-disc list-inside font-medium border-l border-white/5 pl-4">
                <li>Edad mínima: {event.minAge} años.</li>
                <li>Prohibido el ingreso de bebidas alcohólicas.</li>
                <li>No se permite el reingreso.</li>
                <li>Apertura de puertas {event.doorTime}.</li>
              </ul>
            </div>
            <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-white/5 shadow-xl">
              <h3 className="text-sm uppercase tracking-widest font-bold mb-4 flex items-center gap-2 text-[var(--color-accent-yellow)]"><AlertCircle className="w-4 h-4" /> Reventa & Transferencia</h3>
              <ul className="space-y-2 text-xs text-gray-400 list-disc list-inside font-medium border-l border-white/5 pl-4">
                <li>Transferencia permitida: {event.transferable ? 'Sí' : 'No'}</li>
                <li>Reventa oficial permitida: {event.resalable ? 'Sí' : 'No'}</li>
                <li>Los tickets son digitales con QR dinámico.</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-white/10 sticky top-24 shadow-2xl">
            <h2 className="text-lg font-bold mb-6 uppercase tracking-tight">Comprar Entradas</h2>
            
            {experiments.scarcity_banner === 'on' && event.status === 'ultimos_cupos' && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-red-200">¡Últimas entradas disponibles! No te quedes por fuera.</p>
              </div>
            )}

            {/* Social Proof */}
            <div className="space-y-2 mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <span>👁 {viewingCount} personas están viendo este evento</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-accent-pink)] font-bold">
                <span>🔥 {soldCount} entradas vendidas en las últimas 24h</span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Selecciona la localidad</h3>
              {displayLocations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => {
                    setSelectedLoc(loc.id);
                    trackEvent("Ticket Tier Selected", { event_id: event.event_id, tier: loc.name, price: loc.price, availability: loc.available });
                  }}
                  disabled={loc.available === 0}
                  className={`w-full text-left p-4 rounded-xl border border-white/5 transition-all flex justify-between items-center bg-white/5 hover:border-[var(--color-accent-cyan)] ${
                    selectedLoc === loc.id 
                      ? 'border-[var(--color-accent-cyan)] bg-[var(--color-accent-cyan)]/10 ring-1 ring-[var(--color-accent-cyan)]/50' 
                      : ''
                  } ${loc.available === 0 ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                >
                  <div className="flex-1">
                    <p className="font-bold text-sm">{loc.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                      {loc.available === 0 ? 'Agotado' : `Quedan ${loc.available}`}
                    </p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className={`font-bold text-sm ${loc.available === 0 ? 'text-gray-500 line-through' : 'text-[var(--color-accent-cyan)]'}`}>{formatCurrency(loc.price)}</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedLoc && selectedLocationDetail && (
              <div className="space-y-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Cantidad</span>
                  <div className="flex items-center bg-[var(--color-primary)] rounded-lg border border-white/10 h-10">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 h-full text-gray-400 hover:text-white transition hover:bg-white/5 rounded-l-lg"
                    >-</button>
                    <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(Math.min(10, selectedLocationDetail.available), quantity + 1))}
                      className="px-4 h-full text-gray-400 hover:text-white transition hover:bg-white/5 rounded-r-lg"
                    >+</button>
                  </div>
                </div>

                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Total a pagar</span>
                  <span className="text-2xl font-bold">{formatCurrency(selectedLocationDetail.price * quantity)}</span>
                </div>

                <button 
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-pink)] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  AGREGAR AL CARRITO
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
