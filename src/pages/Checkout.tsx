import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, ShieldCheck, X, CheckCircle, AlertTriangle, Building } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MOCK_EVENTS } from '../lib/mockData';
import { formatCurrency } from '../lib/utils';
import { trackEvent, triggerSurvey } from '../lib/amplitude';

export function Checkout() {
  const { cart, clearCart, addTickets, experiments, user } = useAppContext();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [orderSummary, setOrderSummary] = useState<any[]>([]);

  // Step 1 State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [document, setDocument] = useState('');

  // Step 2 State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [pseBank, setPseBank] = useState('');
  const [walletType, setWalletType] = useState('nequi');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee - discount;

  const isStep1Valid = name.length > 2 && /^\S+@\S+\.\S+$/.test(email) && document.length > 4;
  
  let isPaymentValid = false;
  if (paymentMethod === 'card') {
    isPaymentValid = cardNumber.length >= 19 && cardExpiry.length >= 5 && cardCvc.length >= 3;
  } else if (paymentMethod === 'pse') {
    isPaymentValid = pseBank.length > 0;
  } else {
    isPaymentValid = true; // wallet has default
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    const masked = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(masked);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setCardExpiry(val);
  };

  useEffect(() => {
    if (cart.length === 0 && checkoutStatus !== 'success') {
      navigate('/cart');
    }
    trackEvent("Checkout Step Viewed", { step, layout: experiments.checkout_layout });
  }, [step, cart.length, navigate, checkoutStatus, experiments.checkout_layout]);

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'MINDERS10') {
      const discountAmount = subtotal * 0.1;
      setDiscount(discountAmount);
      setCouponError('');
      trackEvent("Coupon Applied", { coupon_code: couponCode, valid: true, discount_amount: discountAmount });
    } else {
      setDiscount(0);
      setCouponError('Cupón inválido o expirado.');
      trackEvent("Coupon Applied", { coupon_code: couponCode, valid: false });
    }
  };

  const handleSimulatePayment = (success: boolean) => {
    if (!isPaymentValid) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (success) {
        setCheckoutStatus('success');
        
        // Generate tickets
        const newTickets = cart.flatMap(item => {
          return Array.from({ length: item.quantity }).map(() => ({
            ticket_id: Math.random().toString(36).substr(2, 9),
            event_id: item.event_id,
            location_id: item.location_id,
            purchase_date: new Date().toISOString(),
            status: 'active' as const
          }));
        });
        
        addTickets(newTickets);
        
        const summaryInfo = cart.map(item => {
           const ev = MOCK_EVENTS.find(e => e.event_id === item.event_id);
           let locName = 'Localidad';
           if (ev) {
             const realLoc = ev.locations.find(l => l.id === item.location_id.replace('resale_', ''));
             if (realLoc) {
               locName = item.location_id.startsWith('resale_') ? `REVENTA - ${realLoc.name}` : realLoc.name;
             }
           }
           return {
             name: ev?.name || 'Evento',
             locationName: locName,
             date: ev?.date || '',
             quantity: item.quantity,
             price: item.price
           };
        });
        setOrderSummary(summaryInfo);
        
        trackEvent("Purchase Completed", { 
          order_id: Math.random().toString(36).substr(2, 9), 
          revenue: total, 
          tickets_count: newTickets.length,
          payment_method: paymentMethod
        });
        
        // Trigger post-purchase survey
        setTimeout(() => triggerSurvey("NPS Post-compra"), 2000);
      } else {
        setCheckoutStatus('failed');
        trackEvent("Payment Failed", { payment_method: paymentMethod, error_type: "demo_declined" });
      }
    }, 1500);
  };

  const handleCancel = () => {
    trackEvent("Checkout Abandoned", { step });
    triggerSurvey("Encuesta de abandono");
    navigate('/cart');
  };

  if (checkoutStatus === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-24 h-24 bg-accent-mint/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(0,229,168,0.3)]">
          <CheckCircle className="w-12 h-12 text-accent-mint" />
        </div>
        <h1 className="text-4xl font-bold uppercase tracking-tight">¡Pago Exitoso!</h1>
        <p className="text-gray-400 font-medium">Tus entradas han sido emitidas y están listas en tu cuenta.</p>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 my-8 text-left max-w-sm mx-auto">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Resumen de compra</h3>
          <div className="space-y-4 text-sm mb-4">
            {orderSummary.map((item, i) => (
              <div key={i} className="flex justify-between border-b border-white/5 pb-2">
                <div className="flex flex-col">
                  <span className="font-bold text-white">{item.name}</span>
                  <span className="text-xs text-gray-400">{item.locationName} x{item.quantity}</span>
                  <span className="text-xs text-gray-500">{item.date ? new Date(item.date).toLocaleDateString() : ''}</span>
                </div>
                <span className="font-bold text-[var(--color-accent-cyan)]">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="flex justify-between"><span className="text-gray-400">Total pagado:</span> <span className="font-bold text-[var(--color-accent-mint)]">{formatCurrency(total)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Entradas totales:</span> <span className="font-bold text-white">{cart.reduce((a, b) => a + b.quantity, 0)}</span></div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => { clearCart(); navigate('/tickets'); }}
            className="px-8 py-4 bg-[var(--color-accent-cyan)] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-colors shadow-lg"
          >
            Ver Mis Entradas
          </button>
          <button 
            onClick={() => { clearCart(); navigate('/'); }}
            className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
      
      {/* Left Column - Forms */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold uppercase tracking-tight">Finalizar Compra</h1>
          <button onClick={handleCancel} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm uppercase tracking-widest font-bold">
            <X className="w-4 h-4"/> Cancelar
          </button>
        </div>

        {/* Failed Banner */}
        {checkoutStatus === 'failed' && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <h3 className="font-bold text-red-500 text-sm">El pago ha sido rechazado</h3>
              <p className="text-xs text-red-200 mt-1">Tu banco ha declinado la transacción. Por favor intenta con otro medio de pago (Demo).</p>
            </div>
          </div>
        )}

        {/* Step 1: Info (Mock layout switch via experiment) */}
        <div className={`bg-[var(--color-surface)] border border-white/5 rounded-3xl p-8 shadow-2xl ${step !== 1 && experiments.checkout_layout === 'A' ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold uppercase tracking-tight">1. Datos Personales</h2>
            {step > 1 && experiments.checkout_layout === 'A' && (
              <button onClick={() => setStep(1)} className="text-[var(--color-accent-cyan)] text-xs font-bold uppercase tracking-widest">Editar</button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Nombre Completo</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Juan Pérez" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Correo Electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="juan@correo.com" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Documento de Identidad</label>
              <input type="text" value={document} onChange={e => setDocument(e.target.value)} placeholder="123456789" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors" />
            </div>
          </div>

          {step === 1 && experiments.checkout_layout === 'A' && (
             <button onClick={() => setStep(2)} disabled={!isStep1Valid} className="mt-8 px-8 py-4 bg-[var(--color-accent-purple)] text-white rounded-xl font-bold text-xs uppercase tracking-widest w-full hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:grayscale shadow-lg shadow-purple-500/20">
               Continuar al Pago
             </button>
          )}
        </div>

        {/* Step 2: Payment */}
        <div className={`bg-[var(--color-surface)] border border-white/5 rounded-3xl p-8 shadow-2xl ${step !== 2 && experiments.checkout_layout === 'A' ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="text-lg font-bold mb-6 uppercase tracking-tight">2. Método de Pago</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button 
              onClick={() => setPaymentMethod('card')}
              className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors ${paymentMethod === 'card' ? 'border-[var(--color-accent-cyan)] bg-[var(--color-accent-cyan)]/10 text-[var(--color-accent-cyan)]' : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'}`}
            >
              <CreditCard className="w-6 h-6 mb-1" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Tarjeta</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('pse')}
              className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors ${paymentMethod === 'pse' ? 'border-[var(--color-accent-cyan)] bg-[var(--color-accent-cyan)]/10 text-[var(--color-accent-cyan)]' : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'}`}
            >
              <Building className="w-6 h-6 mb-1" />
              <span className="text-[10px] uppercase tracking-widest font-bold">PSE</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('wallet')}
              className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors ${paymentMethod === 'wallet' ? 'border-[var(--color-accent-cyan)] bg-[var(--color-accent-cyan)]/10 text-[var(--color-accent-cyan)]' : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'}`}
            >
              <Wallet className="w-6 h-6 mb-1" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Billetera</span>
            </button>
          </div>

          <div className="min-h-[160px]">
            {paymentMethod === 'card' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-left-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Número de Tarjeta</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" value={cardNumber} onChange={handleCardNumberChange} placeholder="0000 0000 0000 0000" className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Vencimiento</label>
                    <input type="text" value={cardExpiry} onChange={handleExpiryChange} placeholder="MM/YY" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors text-center" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">CVC</label>
                    <input type="text" maxLength={4} value={cardCvc} onChange={e => setCardCvc(e.target.value.replace(/\D/g, ''))} placeholder="123" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors text-center" />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'pse' && (
              <div className="animate-in fade-in slide-in-from-left-4">
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Selecciona tu banco</label>
                <select value={pseBank} onChange={e => setPseBank(e.target.value)} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors appearance-none">
                  <option value="">Seleccionar banco...</option>
                  <option value="bancolombia">Bancolombia</option>
                  <option value="davivienda">Davivienda</option>
                  <option value="bbva">BBVA</option>
                  <option value="bogota">Banco de Bogotá</option>
                </select>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-left-4">
                {['Nequi', 'Daviplata', 'PayPal'].map((w) => (
                   <label key={w} className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-colors ${walletType === w.toLowerCase() ? 'border-[var(--color-accent-pink)] bg-[var(--color-accent-pink)]/10 text-white font-bold' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                     <input type="radio" value={w.toLowerCase()} checked={walletType === w.toLowerCase()} onChange={e => setWalletType(e.target.value)} className="hidden" />
                     {w}
                   </label>
                ))}
              </div>
            )}
          </div>

          {(step === 2 || experiments.checkout_layout === 'B') && (
            <div className="flex flex-col sm:flex-row gap-4 border-t border-white/5 pt-8 mt-6">
              <button 
                onClick={() => handleSimulatePayment(true)}
                disabled={isProcessing || !isPaymentValid || !isStep1Valid}
                className="flex-1 py-4 bg-[var(--color-accent-mint)] text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:grayscale text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(0,229,168,0.2)]"
              >
                {isProcessing ? 'Procesando...' : 'Simular Pago Exitoso'}
              </button>
              <button 
                onClick={() => handleSimulatePayment(false)}
                disabled={isProcessing || !isPaymentValid || !isStep1Valid}
                className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-colors disabled:opacity-50 text-xs uppercase tracking-widest"
              >
                {isProcessing ? 'Procesando...' : 'Simular Pago Rechazado'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Summary */}
      <div className="lg:col-span-1">
        <div className="bg-[var(--color-surface)] border border-white/5 rounded-3xl p-6 sticky top-24 shadow-2xl relative overflow-hidden">
          <h2 className="text-lg font-bold mb-6 uppercase tracking-tight">Resumen</h2>
          
          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between text-gray-400 font-medium">
              <span>Subtotal ({cart.length} items)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-400 font-medium">
              <span>Cargo por servicio (10%)</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[var(--color-accent-cyan)] font-bold">
                <span>Descuento (MINDERS10)</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-4 flex justify-between font-bold text-xl uppercase tracking-tight">
              <span>Total a pagar</span>
              <span className="text-[var(--color-accent-cyan)]">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <label className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
              <span>Código Promocional</span>
              <span className="bg-white/10 text-[8px] px-1.5 py-0.5 rounded text-gray-300">Demo: MINDERS10</span>
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="MINDERS10" 
                className="flex-1 p-3 bg-[var(--color-primary)] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] uppercase transition-colors" 
              />
              <button 
                onClick={handleApplyCoupon}
                className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-bold text-xs uppercase tracking-widest"
              >
                Aplicar
              </button>
            </div>
            {couponError && <p className="text-red-400 text-[10px] font-bold tracking-wider uppercase mt-2">{couponError}</p>}
            {discount > 0 && <p className="text-[var(--color-accent-cyan)] text-[10px] font-bold tracking-wider uppercase mt-2">Cupón aplicado correctamente.</p>}
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-[var(--color-accent-mint)] font-bold uppercase tracking-widest bg-[var(--color-accent-mint)]/10 py-3 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
            <span>Pago seguro encriptado 256-bits</span>
          </div>
        </div>
      </div>

    </div>
  );
}
