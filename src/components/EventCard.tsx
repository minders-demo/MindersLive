import React, {
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {ArrowRight} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import type {HomeCardsExperimentVariant} from '../lib/amplitude';
import {trackEvent} from '../lib/amplitude';
import {getLiveDemandSnapshot} from '../lib/liveDemand';
import type {AppEvent} from '../lib/mockData';
import {formatCurrency} from '../lib/utils';

interface EventCardProps {
  event: AppEvent;
  experimentVariant?: HomeCardsExperimentVariant;
  sectionName?: string;
  cardPosition?: number;
}

function getDeviceGroup(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';

  return window.matchMedia('(max-width: 767px)').matches
    ? 'mobile'
    : 'desktop';
}

export function EventCard({
  event,
  experimentVariant = 'control',
  sectionName = 'unknown',
  cardPosition = 0,
}: EventCardProps) {
  const navigate = useNavigate();

  const minPrice = Math.min(
    ...event.locations.map((location) => location.price),
  );

  const liveDemand = useMemo(
    () => getLiveDemandSnapshot(event),
    [event],
  );

  const lastTrackedViewRef = useRef('');

  const positiveAvailability = event.locations
    .map((location) => location.available)
    .filter((available) => available > 0);

  const remainingTickets =
    positiveAvailability.length > 0
      ? Math.min(...positiveAvailability)
      : 0;

  const isTreatment =
    experimentVariant === 'treatment' &&
    event.status !== 'agotado';

  useEffect(() => {
    if (!isTreatment) return;

    const viewKey =
      `${event.event_id}:${sectionName}:${experimentVariant}`;

    if (lastTrackedViewRef.current === viewKey) return;

    lastTrackedViewRef.current = viewKey;

    trackEvent('Live Demand Card Viewed', {
      event_id: event.event_id,
      event_name: event.name,
      category: event.category,
      section_name: sectionName,
      card_position: cardPosition,
      experiment_variant: experimentVariant,
      people_buying: liveDemand.activeBuyers,
      tickets_available: liveDemand.availableTickets,
      live_data_source: liveDemand.dataSource,
      device_group: getDeviceGroup(),
    });
  }, [
    cardPosition,
    event.category,
    event.event_id,
    event.name,
    experimentVariant,
    isTreatment,
    liveDemand.activeBuyers,
    liveDemand.availableTickets,
    liveDemand.dataSource,
    sectionName,
  ]);

  const commonProperties = {
    event_id: event.event_id,
    event_name: event.name,
    category: event.category,
    city: event.city,
    venue: event.venue,
    min_price: minPrice,
    section_name: sectionName,
    card_position: cardPosition,
    experiment_variant: experimentVariant,
    device_group: getDeviceGroup(),
  };

  const openEvent = (
    interactionSource:
      | 'image'
      | 'primary_cta'
      | 'details_link'
      | 'waitlist',
  ) => {
    if (
      isTreatment &&
      interactionSource === 'primary_cta'
    ) {
      trackEvent('Live Demand CTA Clicked', {
        ...commonProperties,
        cta_text: 'Ver entradas',
        people_buying: liveDemand.activeBuyers,
        tickets_available: liveDemand.availableTickets,
        availability_percent:
          liveDemand.availabilityPercent,
        live_data_source: liveDemand.dataSource,
      });
    }

    trackEvent('Event Card Clicked', {
      ...commonProperties,
      source_component: 'event_card',
      interaction_source: interactionSource,
    });

    navigate(`/event/${event.event_id}`);
  };

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-[var(--color-surface)] transition-all duration-300 ${
        isTreatment
          ? 'border-cyan-400/20 shadow-[0_18px_45px_rgba(0,0,0,0.25)] hover:-translate-y-1 hover:border-cyan-300/40'
          : 'border-white/5 hover:border-white/20'
      } ${event.status === 'agotado' ? 'sold-out' : ''}`}
    >
      <button
        type="button"
        onClick={() => openEvent('image')}
        className="card-image-wrapper relative block w-full overflow-hidden pt-[56.25%] text-left"
        style={{
          background:
            `linear-gradient(135deg, ` +
            `${event.gradient[0]} 0%, ` +
            `${event.gradient[1]} 100%)`,
        }}
        aria-label={`Ver ${event.name}`}
      >
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
            onError={(imageEvent) => {
              imageEvent.currentTarget.style.display = 'none';
            }}
          />
        )}

        {event.status === 'agotado' ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
            <span className="-rotate-6 border-2 border-[var(--color-accent-pink)] px-4 py-1 font-black uppercase tracking-tighter text-[var(--color-accent-pink)]">
              Agotado
            </span>
          </div>
        ) : (
          <>
            {event.status === 'preventa' && (
              <div className="absolute left-3 top-3 z-20 rounded-md bg-[var(--color-accent-cyan)] px-2.5 py-1 text-[9px] font-black tracking-wide text-black">
                PREVENTA
              </div>
            )}

            {event.status === 'ultimos_cupos' && (
              <div className="absolute right-3 top-3 z-20 flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 rounded-md bg-[var(--color-accent-pink)] px-2.5 py-1 text-[9px] font-black tracking-wide text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  ÚLTIMOS CUPOS
                </div>

                {!isTreatment && (
                  <div className="rounded bg-black/65 px-2 py-0.5 text-[9px] font-bold text-[var(--color-accent-pink)] backdrop-blur-md">
                    Solo quedan {remainingTickets}
                  </div>
                )}
              </div>
            )}

            {event.resalable &&
              event.status !== 'preventa' && (
                <div className="absolute left-3 top-3 z-20 rounded-md bg-[var(--color-accent-mint)] px-2.5 py-1 text-[9px] font-black tracking-wide text-black">
                  REVENTA VERIFICADA
                </div>
              )}
          </>
        )}

        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[var(--color-surface)] via-[var(--color-surface)]/75 to-transparent p-4 pt-12">
          <div className="text-sm font-bold text-white">
            {event.name}
          </div>
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-[10px] font-medium uppercase text-gray-400">
            {event.city} • {event.venue}
          </span>

          <span
            className={`shrink-0 text-xs font-bold ${
              event.status === 'agotado'
                ? 'text-gray-500 line-through'
                : 'text-[var(--color-accent-cyan)]'
            }`}
          >
            {minPrice === 0
              ? 'GRATIS'
              : formatCurrency(minPrice)}
          </span>
        </div>

        {isTreatment && (
          <div className="space-y-2 py-1">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent-pink)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent-pink)]" />
              </span>

              <span className="font-black uppercase tracking-wider text-[var(--color-accent-pink)]">
                En vivo
              </span>

              <span className="text-gray-300">
                {liveDemand.activeBuyers} comprando ahora
              </span>
            </div>

            <div
              className="h-1.5 overflow-hidden rounded-full bg-white/10"
              aria-label={`${liveDemand.availabilityPercent}% de disponibilidad`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-cyan)] via-[var(--color-accent-purple)] to-[var(--color-accent-pink)] transition-all duration-700"
                style={{
                  width: `${liveDemand.availabilityPercent}%`,
                }}
              />
            </div>

            <p className="text-[11px] text-gray-300">
              Quedan{' '}
              <strong className="text-white">
                {liveDemand.availableTickets}
              </strong>{' '}
              {liveDemand.availableTickets === 1
                ? 'entrada disponible'
                : 'entradas disponibles'}
            </p>
          </div>
        )}

        <div className="mt-auto space-y-2">
          {event.status === 'agotado' ? (
            <button
              type="button"
              onClick={() => openEvent('waitlist')}
              className="w-full rounded-xl border border-white/5 bg-white/5 py-2.5 text-[11px] font-bold text-gray-300 transition hover:bg-white/10"
            >
              LISTA DE ESPERA
            </button>
          ) : isTreatment ? (
            <>
              <button
                type="button"
                onClick={() => openEvent('primary_cta')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 py-2.5 text-[11px] font-black tracking-wide text-white shadow-[0_8px_24px_rgba(34,211,238,0.15)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
              >
                VER ENTRADAS
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => openEvent('details_link')}
                className="w-full py-0.5 text-center text-[10px] font-semibold text-[var(--color-accent-cyan)] underline-offset-4 transition hover:underline"
              >
                Ver detalles
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => openEvent('primary_cta')}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 text-[11px] font-bold transition-colors group-hover:bg-[var(--color-accent-purple)] group-hover:text-white"
            >
              {event.status === 'ultimos_cupos'
                ? 'SELECCIONAR ASIENTOS'
                : 'COMPRAR TICKETS'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
