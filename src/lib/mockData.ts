export type EventCategory = 
  | 'Conciertos' 
  | 'Festivales' 
  | 'Teatro' 
  | 'Deportes' 
  | 'Conferencias' 
  | 'Experiencias' 
  | 'Museo';

export interface EventLocation {
  id: string;
  name: string;
  price: number;
  capacity: number;
  available: number;
}

export interface AppEvent {
  event_id: string;
  name: string;
  artist: string;
  category: EventCategory;
  city: string;
  venue: string;
  date: string;
  doorTime: string;
  startTime: string;
  gradient: [string, string];
  description: string;
  minAge: number;
  locations: EventLocation[];
  status: 'disponible' | 'preventa' | 'agotado' | 'ultimos_cupos';
  transferable: boolean;
  resalable: boolean;
  tags: string[];
  imageUrl?: string;
}

export const MOCK_EVENTS: AppEvent[] = [
  {
    event_id: 'e1',
    name: 'Neon Beats Festival',
    artist: 'Varios Artistas',
    category: 'Festivales',
    city: 'Bogotá',
    venue: 'Parque Simón Bolívar',
    date: '2025-11-15',
    doorTime: '14:00',
    startTime: '16:00',
    gradient: ['#7C3AED', '#EC4899'],
    description: 'El festival de música electrónica más grande del año. Luces de neón y los mejores DJs internacionales.',
    minAge: 18,
    locations: [
      { id: 'gen', name: 'General', price: 250000, capacity: 10000, available: 50 },
      { id: 'vip', name: 'VIP', price: 550000, capacity: 2000, available: 10 }
    ],
    status: 'ultimos_cupos',
    transferable: true,
    resalable: true,
    tags: ['tendencia', 'recomendado'],
    imageUrl: 'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?q=80&w=1336&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    event_id: 'e2',
    name: 'Andes Pop Live',
    artist: 'Varios Artistas',
    category: 'Conciertos',
    city: 'Medellín',
    venue: 'Estadio Atanasio Girardot',
    date: '2025-09-20',
    doorTime: '17:00',
    startTime: '20:00',
    gradient: ['#22D3EE', '#0B1B33'],
    description: 'Noche de pop latino con los artistas más escuchados del momento.',
    minAge: 14,
    locations: [
      { id: 'gra', name: 'Gradería', price: 120000, capacity: 15000, available: 5000 },
      { id: 'pla', name: 'Platea', price: 280000, capacity: 5000, available: 200 },
      { id: 'pal', name: 'Palcos', price: 450000, capacity: 1000, available: 0 }
    ],
    status: 'disponible',
    transferable: true,
    resalable: true,
    tags: ['popular', 'familiar'],
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    event_id: 'e3',
    name: 'Salsa Eterna',
    artist: 'Leyendas de la Salsa',
    category: 'Conciertos',
    city: 'Cali',
    venue: 'Arena Cañaveralejo',
    date: '2025-12-05',
    doorTime: '18:00',
    startTime: '21:00',
    gradient: ['#FACC15', '#EC4899'],
    description: 'Un homenaje a los grandes clásicos de la salsa. Ven a bailar.',
    minAge: 18,
    locations: [
      { id: 'gen', name: 'General', price: 90000, capacity: 5000, available: 100 },
      { id: 'vip', name: 'VIP', price: 200000, capacity: 1000, available: 0 }
    ],
    status: 'ultimos_cupos',
    transferable: true,
    resalable: false,
    tags: ['tendencia'],
    imageUrl: 'https://images.unsplash.com/photo-1541293712104-77db9e7752ea?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    event_id: 'e4',
    name: 'Rock Capital Nights',
    artist: 'Bandas Locales e Invitados',
    category: 'Conciertos',
    city: 'Bogotá',
    venue: 'Movistar Arena',
    date: '2025-02-14',
    doorTime: '17:00',
    startTime: '19:30',
    gradient: ['#0B1B33', '#7C3AED'],
    description: 'Noche de distorsión y buena energía en el corazón de Bogotá.',
    minAge: 14,
    locations: [
      { id: 'pis', name: 'Pista', price: 150000, capacity: 4000, available: 4000 },
      { id: 'gra', name: 'Gradas', price: 100000, capacity: 6000, available: 6000 }
    ],
    status: 'preventa',
    transferable: true,
    resalable: true,
    tags: ['rock', 'preventa'],
    imageUrl: 'https://images.unsplash.com/photo-1629276301820-0f3eedc29fd0?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    event_id: 'e5',
    name: 'Aurora Indie Sessions',
    artist: 'Indie Bands',
    category: 'Festivales',
    city: 'Barranquilla',
    venue: 'Malecón',
    date: '2025-10-10',
    doorTime: '15:00',
    startTime: '16:00',
    gradient: ['#00E5A8', '#22D3EE'],
    description: 'Música alternativa junto al río, brisa y buena comida.',
    minAge: 18,
    locations: [
      { id: 'gen', name: 'General', price: 80000, capacity: 3000, available: 1500 }
    ],
    status: 'disponible',
    transferable: true,
    resalable: true,
    tags: ['indie'],
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80'
  },
  {
    event_id: 'e6',
    name: 'Comedia Sin Filtro',
    artist: 'Top Comediantes',
    category: 'Teatro',
    city: 'Bogotá',
    venue: 'Teatro Nacional',
    date: '2025-08-15',
    doorTime: '19:00',
    startTime: '20:00',
    gradient: ['#FACC15', '#07111F'],
    description: 'No te guardes las risas en este show donde todo se vale.',
    minAge: 18,
    locations: [
      { id: 'pla', name: 'Platea', price: 60000, capacity: 500, available: 50 },
      { id: 'bal', name: 'Balcón', price: 40000, capacity: 300, available: 20 }
    ],
    status: 'ultimos_cupos',
    transferable: false,
    resalable: false,
    tags: ['comedia'],
    imageUrl: 'https://images.unsplash.com/photo-1543584756-8f40a802e14f?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    event_id: 'e7',
    name: 'La Obra Imposible',
    artist: 'Compañía de Teatro Central',
    category: 'Teatro',
    city: 'Medellín',
    venue: 'Teatro Pablo Tobón Uribe',
    date: '2025-09-01',
    doorTime: '18:30',
    startTime: '19:30',
    gradient: ['#EC4899', '#7C3AED'],
    description: 'Drama y misterio en una obra que desafía la realidad.',
    minAge: 12,
    locations: [
      { id: 'gen', name: 'Ingreso', price: 50000, capacity: 800, available: 0 }
    ],
    status: 'agotado',
    transferable: true,
    resalable: true,
    tags: ['obra', 'premium'],
    imageUrl: 'https://images.unsplash.com/photo-1579539760267-b2e78d9d735e?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    event_id: 'e8',
    name: 'Stand Up Bajo La Luna',
    artist: 'Colectivo Risa',
    category: 'Teatro',
    city: 'Cali',
    venue: 'Teatro Municipal',
    date: '2025-11-20',
    doorTime: '19:00',
    startTime: '20:00',
    gradient: ['#0B1B33', '#22D3EE'],
    description: 'Un show al aire libre para disfrutar de historias hilarantes.',
    minAge: 18,
    locations: [
      { id: 'gen', name: 'General', price: 35000, capacity: 400, available: 210 }
    ],
    status: 'disponible',
    transferable: true,
    resalable: false,
    tags: ['standup'],
    imageUrl: 'https://images.unsplash.com/photo-1611956425642-d5a8169abd63?q=80&w=2411&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    event_id: 'e9',
    name: 'Final Urbana Cup',
    artist: 'Equipos Finalistas',
    category: 'Deportes',
    city: 'Bogotá',
    venue: 'Estadio El Campín',
    date: '2025-12-10',
    doorTime: '15:00',
    startTime: '18:00',
    gradient: ['#00E5A8', '#07111F'],
    description: 'La gran final del fútbol urbano, emoción al límite.',
    minAge: 5,
    locations: [
      { id: 'nor', name: 'Norte', price: 40000, capacity: 8000, available: 100 },
      { id: 'sur', name: 'Sur', price: 40000, capacity: 8000, available: 150 },
      { id: 'ori', name: 'Oriental', price: 80000, capacity: 12000, available: 2000 },
      { id: 'occ', name: 'Occidental', price: 120000, capacity: 10000, available: 500 }
    ],
    status: 'disponible',
    transferable: true,
    resalable: true,
    tags: ['deportes', 'familiar'],
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    event_id: 'e10',
    name: 'Match Stars Colombia',
    artist: 'Leyendas Deportivas',
    category: 'Deportes',
    city: 'Medellín',
    venue: 'Coliseo Iván de Bedout',
    date: '2025-10-30',
    doorTime: '17:00',
    startTime: '19:00',
    gradient: ['#FACC15', '#EC4899'],
    description: 'Juego de exhibición con los mejores atletas colombianos.',
    minAge: 0,
    locations: [
      { id: 'gen', name: 'General', price: 50000, capacity: 4000, available: 2000 },
      { id: 'vip', name: 'Cancha', price: 150000, capacity: 500, available: 50 }
    ],
    status: 'disponible',
    transferable: true,
    resalable: true,
    tags: ['exhibicion'],
    imageUrl: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    event_id: 'e11',
    name: 'Future Commerce Summit',
    artist: 'Speakers Internacionales',
    category: 'Conferencias',
    city: 'Bogotá',
    venue: 'Ágora Bogotá',
    date: '2025-09-15',
    doorTime: '08:00',
    startTime: '09:00',
    gradient: ['#22D3EE', '#7C3AED'],
    description: 'Conoce las tendencias de comercio electrónico y pagos para 2026.',
    minAge: 18,
    locations: [
      { id: 'stu', name: 'Estudiantes', price: 100000, capacity: 500, available: 40 },
      { id: 'pro', name: 'Profesional', price: 350000, capacity: 2000, available: 500 }
    ],
    status: 'disponible',
    transferable: false,
    resalable: false,
    tags: ['tech', 'negocios'],
    imageUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80'
  },
  {
    event_id: 'e12',
    name: 'Growth & Data Live',
    artist: 'Expertos en Marketing',
    category: 'Conferencias',
    city: 'Medellín',
    venue: 'Plaza Mayor',
    date: '2025-10-22',
    doorTime: '08:30',
    startTime: '09:00',
    gradient: ['#0B1B33', '#00E5A8'],
    description: 'Aprende a escalar tu negocio usando datos y growth hacking.',
    minAge: 18,
    locations: [
      { id: 'gen', name: 'Entrada General', price: 200000, capacity: 1000, available: 1000 }
    ],
    status: 'preventa',
    transferable: false,
    resalable: false,
    tags: ['marketing', 'preventa'],
    imageUrl: 'https://images.unsplash.com/photo-1560523159-6b681a1e1852?w=800&q=80'
  },
  {
    event_id: 'e13',
    name: 'Ruta Café Premium',
    artist: 'Productores Locales',
    category: 'Experiencias',
    city: 'Armenia',
    venue: 'Finca El Ocaso',
    date: '2025-08-30',
    doorTime: '09:00',
    startTime: '09:30',
    gradient: ['#FACC15', '#07111F'],
    description: 'Recorrido especializado catando los mejores cafés de la región.',
    minAge: 12,
    locations: [
      { id: 'ful', name: 'Día Completo', price: 150000, capacity: 50, available: 5 }
    ],
    status: 'ultimos_cupos',
    transferable: true,
    resalable: false,
    tags: ['turismo'],
    imageUrl: 'https://images.unsplash.com/photo-1556742400-b5b7c5121f99?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    event_id: 'e14',
    name: 'Tour Graffiti Nights',
    artist: 'Artistas Urbanos',
    category: 'Experiencias',
    city: 'Medellín',
    venue: 'Comuna 13',
    date: '2025-09-05',
    doorTime: '18:00',
    startTime: '18:30',
    gradient: ['#EC4899', '#22D3EE'],
    description: 'Descubre los impresionantes murales en un recorrido nocturno guiado.',
    minAge: 14,
    locations: [
      { id: 'tou', name: 'Tour Guiado', price: 40000, capacity: 100, available: 0 }
    ],
    status: 'agotado',
    transferable: true,
    resalable: true,
    tags: ['arte', 'urbano'],
    imageUrl: 'https://images.unsplash.com/photo-1727520018050-c0c351d9431d?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    event_id: 'e15',
    name: 'Museo Vivo Digital',
    artist: 'Colectivo Arte Tech',
    category: 'Museo',
    city: 'Bogotá',
    venue: 'Maloka',
    date: '2025-11-01',
    doorTime: '10:00',
    startTime: '10:00',
    gradient: ['#7C3AED', '#0B1B33'],
    description: 'Exposición inmersiva de arte digital y hologramas.',
    minAge: 0,
    locations: [
      { id: 'gen', name: 'Entrada', price: 25000, capacity: 500, available: 200 }
    ],
    status: 'disponible',
    transferable: true,
    resalable: false,
    tags: ['familiar', 'tech'],
    imageUrl: 'https://images.unsplash.com/photo-1637578035851-c5b169722de1?q=80&w=2442&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    event_id: 'e16',
    name: 'Sunset Picnic Fest',
    artist: 'Bandas Locales',
    category: 'Festivales',
    city: 'Cartagena',
    venue: 'Castillo San Felipe (Exteriores)',
    date: '2025-12-28',
    doorTime: '16:00',
    startTime: '17:00',
    gradient: ['#FACC15', '#EC4899'],
    description: 'Música, comida y el mejor atardecer del Caribe.',
    minAge: 18,
    locations: [
      { id: 'pic', name: 'Picnic Access', price: 90000, capacity: 1000, available: 800 }
    ],
    status: 'disponible',
    transferable: true,
    resalable: true,
    tags: ['caribe'],
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80'
  },
  {
    event_id: 'e17',
    name: 'Minders Fan Zone',
    artist: 'Minders Live',
    category: 'Experiencias',
    city: 'Bogotá',
    venue: 'Parque de la 93',
    date: '2025-08-25',
    doorTime: '12:00',
    startTime: '12:00',
    gradient: ['#00E5A8', '#7C3AED'],
    description: 'Activación de marca con sorteos, juegos y experiencias premium.',
    minAge: 0,
    locations: [
      { id: 'fre', name: 'Entrada Libre', price: 0, capacity: 2000, available: 500 }
    ],
    status: 'disponible',
    transferable: false,
    resalable: false,
    tags: ['gratis', 'familiar'],
    imageUrl: 'https://images.unsplash.com/photo-1586269509797-c36a25c46eeb?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    event_id: 'e18',
    name: 'Data Driven Concert Experience',
    artist: 'Minders Music',
    category: 'Conciertos',
    city: 'Bogotá',
    venue: 'Movistar Arena',
    date: '2025-11-20',
    doorTime: '19:00',
    startTime: '20:30',
    gradient: ['#0B1B33', '#EC4899'],
    description: 'Un concierto donde el setlist lo deciden los datos en tiempo real.',
    minAge: 12,
    locations: [
      { id: 'pis', name: 'Pista Analítica', price: 180000, capacity: 3000, available: 200 },
      { id: 'gra', name: 'Grada Dashboard', price: 120000, capacity: 5000, available: 1500 }
    ],
    status: 'disponible',
    transferable: true,
    resalable: true,
    tags: ['recomendado', 'innovacion'],
    imageUrl: 'https://images.unsplash.com/photo-1612941736650-350c1326ea4c?q=80&w=2831&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
];
