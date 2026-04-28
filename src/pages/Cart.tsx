import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowRight, Minus, Plus, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MOCK_EVENTS } from '../lib/mockData';
import { formatCurrency, getFallbackImage } from '../lib/utils';
import { trackEvent } from '../lib/amplitude';
import { useToast } from '../components/Toast';

export function Cart() {
  const { cart, removeFromCart, updateCartItemQuantity, clearCart, user } = useAppContext();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [showLoginModal, setShowLoginModal] = useState(false);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const serviceFee = cartTotal * 0.1;
  const total = cartTotal + serviceFee;

  const handleCheckoutClick = () => {
    trackEvent("Checkout Started", { cart_value: cartTotal, items_count: cart.length });
    if (user.role === 'anonymous') {
      setShowLoginModal(true);
      return;
    }
    navigate('/checkout');
  };

  const handleLoginRedirect = () => {
    localStorage.setItem('redirectAfterLogin', '/checkout');
    navigate('/login');
  };

  const handleRegisterRedirect = () => {
    localStorage.setItem('redirectAfterLogin', '/checkout');
    navigate('/register');
  };

  const handleRemove = (event_id: string, location_id: string) => {
    trackEvent("Remove From Cart", { event_id, location_id });
    removeFromCart(event_id, location_id);
  };

  const updateQuantity = (event_id: string, location_id: string, newQty: number, max: number) => {
    if (newQty < 1) return;
    if (newQty > max) {
      showToast('No puedes agregar más tickets de la capacidad disponible', 'warning');
      return;
    }
    updateCartItemQuantity(event_id, location_id, newQty);
  };

  const handleEmptyCart = () => {
    if (window.confirm("¿Estás seguro de que quieres vaciar tu carrito?")) {
      clearCart();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 bg-[var(--color-surface)] rounded-3xl border border-white/5 shadow-xl animate-in fade-in">
        <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4 uppercase tracking-tight">Tu carrito está vacío</h2>
        <p className="text-gray-400 mb-8 font-medium">Descubre eventos increíbles y no te quedes por fuera.</p>
        <button 
          onClick={() => navigate('/search')}
          className="px-8 py-4 bg-[var(--color-accent-cyan)] text-black rounded-xl text-sm uppercase tracking-widest font-bold hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]"
        >
          Explorar Eventos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end">
        <h1 className="text-3xl font-bold uppercase tracking-tight">Tu Carrito</h1>
        <button 
          onClick={handleEmptyCart}
          className="text-[10px] text-gray-400 hover:text-red-400 uppercase tracking-widest font-bold flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3 h-3" /> Vaciar carrito
        </button>
      </div>

      <div className="bg-[var(--color-surface)] rounded-2xl border border-white/5 p-6 space-y-6 shadow-2xl">
        {cart.map((item, index) => {
          const event = MOCK_EVENTS.find(e => e.event_id === item.event_id);
          const location = event?.locations.find(l => l.id === item.location_id);
          
          if (!event || !location) return null;

          return (
            <div key={`${item.event_id}-${item.location_id}-${index}`} className="flex flex-col md:flex-row gap-6 items-center py-6 border-b border-white/5 last:border-0 relative">
              <div 
                className="w-full md:w-32 h-24 rounded-lg flex-shrink-0 relative overflow-hidden shadow-lg"
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
              </div>
              
              <div className="flex-1 space-y-2 text-center md:text-left z-10 relative">
                <Link to={`/event/${event.event_id}`} className="text-xl font-bold uppercase tracking-tight hover:text-[var(--color-accent-cyan)] transition-colors">{event.name}</Link>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <p>{event.city} • {event.venue}</p>
                </div>
                <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] uppercase font-bold tracking-widest mt-2 text-gray-300">
                  {location.name} • <span className="text-white">{formatCurrency(item.price)} C/U</span>
                </div>
              </div>

              <div className="flex items-center gap-6 z-10 relative">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-1 text-sm font-bold">
                  <button onClick={() => updateQuantity(item.event_id, item.location_id, item.quantity - 1, location.capacity)} className="p-2 hover:bg-white/10 rounded"><Minus className="w-4 h-4" /></button>
                  <span className="w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.event_id, item.location_id, item.quantity + 1, location.capacity)} className="p-2 hover:bg-white/10 rounded"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="text-right w-24">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total</p>
                  <p className="font-bold text-lg text-[var(--color-accent-pink)]">{formatCurrency(item.price * item.quantity)}</p>
                </div>
                <button 
                  onClick={() => handleRemove(item.event_id, item.location_id)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <div className="w-full md:w-96 bg-[var(--color-surface)] rounded-2xl border border-white/5 p-6 space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent-cyan)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Cargo por servicio (10%)</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xl">
              <span className="font-bold uppercase tracking-tight">Total</span>
              <span className="font-bold text-[var(--color-accent-cyan)]">{formatCurrency(total)}</span>
            </div>

            <button 
              onClick={handleCheckoutClick}
              className="w-full py-4 bg-[var(--color-accent-cyan)] text-black rounded-xl font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2 mt-4 text-xs"
            >
              IR A PAGAR
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--color-surface)] border border-white/10 p-8 rounded-3xl max-w-sm w-full relative shadow-2xl">
            <button onClick={() => setShowLoginModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-[var(--color-accent-cyan)]/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <ShoppingCart className="w-6 h-6 text-[var(--color-accent-cyan)]" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2 uppercase tracking-tight">Inicia sesión</h3>
            <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold leading-relaxed mb-8">Para continuar con tu compra y asegurar tus entradas, debes entrar a tu cuenta.</p>
            <div className="space-y-3">
              <button onClick={handleLoginRedirect} className="w-full py-4 text-xs uppercase tracking-widest font-bold bg-[var(--color-accent-cyan)] text-black rounded-xl hover:bg-cyan-400 transition-colors">
                Iniciar Sesión
              </button>
              <button onClick={handleRegisterRedirect} className="w-full py-4 text-xs uppercase tracking-widest font-bold bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors">
                Registrarse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
