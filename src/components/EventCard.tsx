import React from 'react';
import { Link } from 'react-router-dom';
import { AppEvent } from '../lib/mockData';
import { formatCurrency } from '../lib/utils';
import { trackEvent } from '../lib/amplitude';

interface EventCardProps {
  key?: React.Key;
  event: AppEvent;
}

export function EventCard({ event }: EventCardProps) {
  const minPrice = Math.min(...event.locations.map(l => l.price));
  
  const handleClick = () => {
    trackEvent("Event Viewed", { 
      event_id: event.event_id, 
      event_name: event.name, 
      category: event.category, 
      city: event.city, 
      venue: event.venue 
    });
  };

  return (
    <Link 
      to={`/event/${event.event_id}`} 
      onClick={handleClick}
      className={`group flex flex-col bg-[var(--color-surface)] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 ${event.status === 'agotado' ? 'sold-out' : ''}`}
    >
      <div 
        className="card-image-wrapper relative pt-[56.25%] overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${event.gradient[0]} 0%, ${event.gradient[1]} 100%)` }}
      >
        {event.imageUrl && (
          <img 
            src={event.imageUrl} 
            alt={event.name} 
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy" 
            decoding="async" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }} 
          />
        )}
        {event.status === 'agotado' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
            <span className="border-2 border-[var(--color-accent-pink)] text-[var(--color-accent-pink)] px-4 py-1 font-black transform -rotate-12 uppercase tracking-tighter">
              Agotado
            </span>
          </div>
        ) : (
          <>
            {event.status === 'preventa' && (
              <div className="absolute top-3 left-3 bg-[var(--color-accent-cyan)] text-black text-[9px] font-bold px-2 py-0.5 rounded z-20">
                PREVENTA
              </div>
            )}
            
            {event.status === 'ultimos_cupos' && (
               <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-20">
                 <div className="bg-[var(--color-accent-pink)] text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                   <span className="animate-pulse w-1.5 h-1.5 bg-white rounded-full"></span>
                   ÚLTIMOS CUPOS
                 </div>
                 <div className="text-[var(--color-accent-pink)] text-[9px] font-bold bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-md">
                   Solo quedan {Math.min(...event.locations.map(l => l.available))}
                 </div>
               </div>
            )}
            
            {event.resalable && event.status !== 'preventa' && (
               <div className="absolute top-3 left-3 bg-[var(--color-accent-mint)] text-black text-[9px] font-bold px-2 py-0.5 rounded z-20">
                 REVENTA VERIFICADA
               </div>
            )}
          </>
        )}

        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[var(--color-surface)] to-transparent z-20">
          <div className="text-white font-bold text-sm">{event.name}</div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-400 uppercase truncate pr-2">
            {event.city} • {event.venue}
          </span>
          <span className={event.status === 'agotado' ? 'text-gray-500 line-through text-xs font-bold' : 'text-[var(--color-accent-cyan)] font-bold text-xs'}>
            {minPrice === 0 ? 'GRATIS' : formatCurrency(minPrice)}
          </span>
        </div>
        
        {event.status === 'agotado' ? (
          <button className="w-full py-2 bg-white/5 text-[11px] font-bold rounded-lg border border-white/5 cursor-not-allowed text-gray-400">
            LISTA DE ESPERA
          </button>
        ) : (
          <button className="w-full py-2 bg-white/5 text-[11px] font-bold rounded-lg border border-white/10 group-hover:bg-[var(--color-accent-purple)] group-hover:text-white transition-colors">
            {event.status === 'ultimos_cupos' ? 'SELECCIONAR ASIENTOS' : 'COMPRAR TICKETS'}
          </button>
        )}
      </div>
    </Link>
  );
}
