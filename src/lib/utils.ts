import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getFallbackImage(category?: string): string {
  const fallbacks: Record<string, string> = {
    'Conciertos':   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    'Festivales':   'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    'Teatro':       'https://images.unsplash.com/photo-1507676184212-d0330a151f78?w=800&q=80',
    'Deportes':     'https://images.unsplash.com/photo-1461896836934-ffe60eaf8ea3?w=800&q=80',
    'Conferencias': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
    'Experiencias': 'https://images.unsplash.com/photo-1533174000255-bf1593c66291?w=800&q=80',
    'Museo':        'https://images.unsplash.com/photo-1518998053401-b264d1c9efd4?w=800&q=80',
  };
  return fallbacks[category ?? ''] ?? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80';
}
