import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket as TicketIcon, QrCode, Send, Repeat1, X, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MOCK_EVENTS } from '../lib/mockData';
import { trackEvent, triggerGuide } from '../lib/amplitude';
import { useToast } from '../components/Toast';
import { formatCurrency, getFallbackImage } from '../lib/utils';

export function MyTickets() {
  const { tickets, transferTicket, user } = useAppContext();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [resaleModalOpen, setResaleModalOpen] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  
  const [resalePrice, setResalePrice] = useState(150000);

  // Validation
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValidTransfer = isValidEmail(transferEmail);

  // Demo Trigger Guide
  React.useEffect(() => {
    if (tickets.length > 0) {
      triggerGuide("Guía de transferencia");
    }
  }, [tickets.length]);

  if (user.role === 'anonymous') {
    return (
      <div className="text-center py-20 animate-in fade-in">
        <h2 className="text-2xl font-bold mb-4 uppercase tracking-tight">Inicia sesión para ver tus entradas</h2>
        <button onClick={() => navigate('/login')} className="px-6 py-2 bg-[var(--color-accent-cyan)] text-black rounded-lg font-bold uppercase tracking-widest text-xs">Iniciar Sesión</button>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 bg-[var(--color-surface)] rounded-3xl border border-white/5 shadow-xl animate-in fade-in">
        <TicketIcon className="w-16 h-16 text-gray-600 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4 uppercase tracking-tight">No tienes entradas aún</h2>
        <p className="text-gray-400 mb-8 font-medium">Tus próximas experiencias aparecerán aquí.</p>
        <button 
          onClick={() => navigate('/search')}
          className="px-8 py-4 bg-[var(--color-accent-cyan)] text-black rounded-xl text-sm uppercase tracking-widest font-bold hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]"
        >
          Explorar Eventos
        </button>
      </div>
    );
  }

  const activeTickets = tickets.filter(t => t.status === 'active');
  const pastTickets = tickets.filter(t => t.status !== 'active');

  const handleOpenQR = (ticket_id: string, event_id: string) => {
    trackEvent("Ticket Opened", { ticket_id, event_id });
    setSelectedTicket(ticket_id);
  };

  const handleTransfer = () => {
    if (!selectedTicket || !isValidTransfer) return;
    if (!window.confirm(`¿Estás seguro de enviar la entrada a ${transferEmail}?`)) return;

    const ticket = tickets.find(t => t.ticket_id === selectedTicket);
    if (!ticket) return;

    trackEvent("Ticket Transferred", { ticket_id: selectedTicket, event_id: ticket.event_id, recipient_type: "email" });
    transferTicket(selectedTicket, transferEmail);
    showToast(`Entrada transferida a ${transferEmail}`, 'success');
    setTransferModalOpen(false);
    setSelectedTicket(null);
    setTransferEmail('');
  };

  const handlePublishResale = () => {
    if (!selectedTicket) return;
    const ticket = tickets.find(t => t.ticket_id === selectedTicket);
    if (!ticket) return;

    // We'll just mark it as transferred conceptually for this demo or call a resale mock function
    trackEvent("Resale Listing Created", { ticket_id: selectedTicket, event_id: ticket.event_id, resale_price: resalePrice });
    transferTicket(selectedTicket, 'resale_market'); // Mock status change
    showToast(`Entrada publicada en reventa por ${formatCurrency(resalePrice)}`, 'success');
    setResaleModalOpen(false);
    setSelectedTicket(null);
  };
  
  const handleAddToWallet = () => {
    showToast("Añadido a Apple/Google Wallet (Demo)", 'success');
  };

  const renderTicketCard = (ticket: typeof tickets[0]) => {
    const event = MOCK_EVENTS.find(e => e.event_id === ticket.event_id);
    if (!event) return null;
    const location = event.locations.find(l => l.id === ticket.location_id);

    return (
      <div key={ticket.ticket_id} className="bg-[var(--color-surface)] border border-white/5 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative group">
        <div 
          className="w-full md:w-48 h-32 md:h-auto relative"
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
        <div className="p-6 flex-1 flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-1 uppercase tracking-tight">{event.name}</h3>
          <p className="text-gray-400 mb-4 text-[10px] uppercase tracking-widest font-bold">{new Date(event.date).toLocaleDateString()} • {event.venue}</p>
          <div className="flex gap-4">
            <div className="font-mono text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-lg uppercase tracking-widest text-gray-300">Localidad: <b className="text-white">{location?.name}</b></div>
            <div className="font-mono text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-lg uppercase tracking-widest text-gray-300">Cod: <b className="text-[var(--color-accent-cyan)]">{ticket.ticket_id.toUpperCase()}</b></div>
          </div>
        </div>
        
        {ticket.status === 'active' && (
          <div className="p-6 border-t md:border-t-0 md:border-l border-white/5 flex flex-row md:flex-col gap-3 justify-center bg-black/20">
             <button 
                onClick={() => handleOpenQR(ticket.ticket_id, event.event_id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-accent-cyan)] text-black font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-colors shadow-lg"
              >
                <QrCode className="w-5 h-5" /> Ver Entrada
             </button>
             <div className="flex gap-2">
               <button 
                 onClick={() => { setSelectedTicket(ticket.ticket_id); setTransferModalOpen(true); }}
                 className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] uppercase tracking-widest font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
               >
                 <Send className="w-4 h-4" /> Transferir
               </button>
               {event.resalable && (
                 <button 
                    onClick={() => { setSelectedTicket(ticket.ticket_id); setResaleModalOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--color-accent-pink)]/10 border border-[var(--color-accent-pink)]/50 rounded-xl text-[10px] uppercase tracking-widest font-bold text-[var(--color-accent-pink)] hover:bg-[var(--color-accent-pink)] opacity-90 transition-colors"
                  >
                    <Repeat1 className="w-4 h-4" /> Vender
                  </button>
               )}
             </div>
          </div>
        )}
        
        {ticket.status !== 'active' && (
          <div className="p-6 border-t md:border-t-0 md:border-l border-white/5 flex items-center justify-center bg-black/40">
             <span className="px-4 py-2 border border-dashed border-white/20 rounded-lg text-gray-500 uppercase font-bold tracking-widest text-[10px] inline-block transform rotate-[-5deg]">
               {ticket.status === 'transferred' ? 'Transferida' : 'En Reventa'}
             </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-6 uppercase tracking-tight">Mis Entradas</h1>
        <div className="space-y-6">
          {activeTickets.map(renderTicketCard)}
        </div>
      </div>

      {pastTickets.length > 0 && (
        <div className="opacity-60">
          <h2 className="text-xl font-bold mb-6 uppercase tracking-tight">Historial / Transferidas</h2>
          <div className="space-y-4">
            {pastTickets.map(renderTicketCard)}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedTicket && !transferModalOpen && !resaleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121212] text-white rounded-3xl p-8 max-w-sm w-full text-center relative border border-white/10 shadow-2xl">
            <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white">
              <X className="w-6 h-6"/>
            </button>
            <h3 className="font-bold text-xl mb-6 uppercase tracking-tight">Entrada Digital</h3>
            <div className="w-48 h-48 bg-white mx-auto rounded-2xl flex items-center justify-center mb-6 border-4 border-[var(--color-accent-cyan)] shadow-[0_0_30px_rgba(34,211,238,0.3)] relative overflow-hidden">
              <QrCode className="w-40 h-40 text-black relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-blue-500/20 z-0"></div>
            </div>
            <p className="font-mono text-sm bg-white/5 border border-white/10 p-2 rounded-xl tracking-widest text-[var(--color-accent-cyan)] font-bold">{selectedTicket.toUpperCase()}</p>
            <p className="mt-4 text-[10px] uppercase font-bold tracking-widest text-gray-500">Este código se actualiza cada 30 segundos.</p>
            <button onClick={handleAddToWallet} className="mt-6 w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
               Añadir a Wallet
            </button>
          </div>
        </div>
      )}

      {transferModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--color-surface)] border border-white/10 shadow-2xl rounded-3xl p-8 max-w-md w-full relative">
            <button onClick={() => { setTransferModalOpen(false); setSelectedTicket(null); }} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6"/>
            </button>
            <h3 className="font-bold text-xl mb-2 uppercase tracking-tight">Transferir Entrada</h3>
            <p className="text-gray-400 text-xs font-medium mb-6">Envía esta entrada a un amigo. Una vez aceptada, perderás el acceso a ella.</p>
            
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Correo del destinatario</label>
            <input 
              type="email" 
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
              placeholder="amigo@correo.com" 
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors" 
            />
            {transferEmail.length > 0 && !isValidTransfer && <p className="text-red-400 text-[10px] uppercase font-bold mt-1 tracking-wider">Correo inválido</p>}
            
            <button 
              onClick={handleTransfer}
              disabled={!isValidTransfer}
              className="mt-6 w-full py-4 bg-[var(--color-accent-cyan)] text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:grayscale text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            >
              Enviar Entrada
            </button>
          </div>
        </div>
      )}

      {resaleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--color-surface)] border border-white/10 shadow-2xl rounded-3xl p-8 max-w-md w-full relative">
            <button onClick={() => { setResaleModalOpen(false); setSelectedTicket(null); }} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6"/>
            </button>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-8 h-8 text-[var(--color-accent-mint)]" />
              <h3 className="font-bold text-xl uppercase tracking-tight">Reventa Segura</h3>
            </div>
            <p className="text-gray-400 text-xs font-medium mb-6">Publica tu entrada en el marketplace oficial. Nosotros nos encargamos de verificarla y asegurar tu pago.</p>
            
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Precio de Reventa (Max: +20%)</label>
                <input 
                  type="number" 
                  value={resalePrice}
                  onChange={(e) => setResalePrice(Number(e.target.value))}
                  min={10000}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-lg font-bold text-[var(--color-accent-pink)] outline-none focus:border-[var(--color-accent-pink)] transition-colors" 
                />
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center text-xs uppercase tracking-widest font-bold">
                 <span className="text-gray-400">Recibes (Comisión 10%):</span>
                 <span className="text-white">{formatCurrency(resalePrice * 0.9)}</span>
              </div>
            </div>
            
            <button 
              onClick={handlePublishResale}
              className="w-full py-4 bg-[var(--color-accent-pink)] text-black font-bold rounded-xl hover:bg-pink-400 transition-colors text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(236,72,153,0.3)]"
            >
              Publicar Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
