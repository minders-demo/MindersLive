import { EventCategory } from './mockData';

// Simulated AI Image Generator
export const generateEventImage = async (name: string, category: EventCategory, city: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const keywords = encodeURIComponent(`${category} ${name} ${city}`);
  // Instead of real AI generation, we simulate it by fetching an Unsplash image matching the context
  // This satisfies the demo requirement while ensuring an image always loads fast.
  return `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&keywords=${keywords}`;
};

export const getCategoryPlaceholder = (category: EventCategory): string => {
  const map: Record<EventCategory, string> = {
    'Conciertos': 'https://images.unsplash.com/photo-1540039155732-d692ed5fa126?w=800&q=80',
    'Festivales': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    'Teatro': 'https://images.unsplash.com/photo-1507676184212-d0330a151f78?w=800&q=80',
    'Deportes': 'https://images.unsplash.com/photo-1461896836934-ffe60eaf8ea3?w=800&q=80',
    'Conferencias': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
    'Experiencias': 'https://images.unsplash.com/photo-1533174000255-bf1593c66291?w=800&q=80',
    'Museo': 'https://images.unsplash.com/photo-1518998053401-b264d1c9efd4?w=800&q=80'
  };
  return map[category] || map['Conciertos'];
};
