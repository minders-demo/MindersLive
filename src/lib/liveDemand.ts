import type {AppEvent} from './mockData';

export interface LiveDemandSnapshot {
  activeBuyers: number;
  availableTickets: number;
  availabilityPercent: number;
  dataSource: 'demo';
}

const ACTIVE_BUYERS_BY_EVENT: Record<string, number> = {
  e1: 214,
  e3: 135,
  e6: 102,
  e13: 62,
  e18: 78,
};

export function getLiveDemandSnapshot(event: AppEvent): LiveDemandSnapshot {
  const scarceLocation = event.locations
    .filter((location) => location.available > 0)
    .sort((left, right) => left.available - right.available)[0];

  const availableTickets = scarceLocation?.available ?? 0;
  const capacity = scarceLocation?.capacity ?? 0;

  const availabilityPercent =
    capacity > 0
      ? Math.max(
          2,
          Math.min(
            100,
            Math.round((availableTickets / capacity) * 100),
          ),
        )
      : 0;

  const fallbackBuyers = Math.max(
    12,
    Math.min(89, Math.round(availableTickets * 0.35)),
  );

  return {
    activeBuyers:
      ACTIVE_BUYERS_BY_EVENT[event.event_id] ?? fallbackBuyers,
    availableTickets,
    availabilityPercent,
    dataSource: 'demo',
  };
}
