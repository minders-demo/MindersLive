import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MOCK_EVENTS } from '../lib/mockData';
import { EventCard } from '../components/EventCard';
import { trackEvent } from '../lib/amplitude';

export function Home() {
  const { experiments, user } = useAppContext();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const cities = Array.from(new Set(MOCK_EVENTS.map(e => e.city)));
  const categories = Array.from(new Set(MOCK_EVENTS.map(e => e.category)));

  useEffect(() => {
    trackEvent("Experiment Exposure", { flag_key: "hero_cta", variant: experiments.hero_cta });
  }, [experiments.hero_cta]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setSelectedCity(city);
    if (city) {
      trackEvent("City Selected", { city, source_screen: "Home" });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent("Search Performed", { query: searchQuery, results_count: MOCK_EVENTS.filter(ev => ev.name.toLowerCase().includes(searchQuery.toLowerCase())).length });
    navigate(`/search?q=${searchQuery}${selectedCity ? `&city=${selectedCity}` : ''}`);
  };

  const handleCategoryClick = (category: string) => {
    trackEvent("Filter Applied", { filter_type: "category", filter_value: category, results_count: MOCK_EVENTS.filter(ev => ev.category === category).length });
    navigate(`/search?category=${category}`);
  };

  const filteredEvents = MOCK_EVENTS.filter(event => 
    (selectedCity === '' || event.city === selectedCity)
  );

  const trendingEvents = filteredEvents.filter(e => e.tags.includes('tendencia') || e.tags.includes('recomendado')).slice(0, 4);
  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) > new Date()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 4);
  const lastTicketsEvents = filteredEvents.filter(e => e.status === 'ultimos_cupos').slice(0, 4);

  const featured = trendingEvents[0] || upcomingEvents[0] || MOCK_EVENTS[0];

  // Preference-based filtering
  const favCity = user?.preferences?.favorite_city;
  const favCategories = user?.preferences?.favorite_categories || [];
  const preferenceEvents = (favCity || favCategories.length > 0) 
    ? MOCK_EVENTS.filter(e => 
        (favCity && e.city === favCity) || 
        (favCategories.includes(e.category))
      ).slice(0, 4)
    : [];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="rounded-3xl relative overflow-hidden shrink-0 group min-h-[420px]">
        {featured.imageUrl ? (
          <img 
            src={featured.imageUrl} 
            alt={featured.name} 
            className="hero-image absolute inset-0 w-full h-full object-cover" 
            loading="eager" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }} 
          />
        ) : (
          <div className="w-full min-h-[480px] absolute inset-0 flex gap-0 blur-xl opacity-30">
            <div className="w-1/4 h-full bg-[var(--color-accent-purple)]"></div>
            <div className="w-1/4 h-full bg-[var(--color-accent-pink)]"></div>
            <div className="w-1/4 h-full bg-[var(--color-accent-cyan)]"></div>
            <div className="w-1/4 h-full bg-[var(--color-accent-mint)]"></div>
          </div>
        )}
        <div className="absolute inset-0 hero-overlay z-10"></div>
        
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 z-20">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[var(--color-accent-yellow)] text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Destacado</span>
            <span className="text-[var(--color-accent-cyan)] text-[10px] font-medium tracking-wider uppercase">{featured.category}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-none mb-4 uppercase tracking-tighter italic">
            {featured.name}
          </h1>
          <p className="text-sm md:text-base text-gray-300 max-w-md mb-8">
            {featured.description.split('.')[0]}.<br/>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-accent-pink)] mt-2 block">
              {new Date(featured.date).toLocaleDateString()} • {featured.city}
            </span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate(`/event/${featured.event_id}`)}
              className="bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-pink)] text-white px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(236,72,153,0.3)]"
            >
              Comprar Boletas
            </button>
            <button 
              onClick={() => navigate('/search')}
              className="bg-white/10 backdrop-blur-md text-white px-8 py-3 rounded-full font-bold text-sm border border-white/20 hover:bg-white/20 transition-colors"
            >
              Explorar más eventos
            </button>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-4 shadow-xl -mt-6 relative z-20 mx-4 max-w-4xl lg:mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Busca artistas, eventos o venues..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-[var(--color-primary)] border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-[var(--color-accent-cyan)] transition-colors"
            />
          </div>
          <div className="md:w-64 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select 
              value={selectedCity}
              onChange={handleCityChange}
              className="w-full pl-12 pr-4 py-2 bg-[var(--color-primary)] border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-[var(--color-accent-cyan)] appearance-none transition-colors"
            >
              <option value="">Todas las ciudades</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
          <button type="submit" className="md:w-auto px-6 py-2 bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-pink)] text-white rounded-full text-sm font-bold hover:scale-105 transition-transform">
            Buscar
          </button>
        </form>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
            Categorías
            <span className="bg-[var(--color-accent-yellow)]/20 text-[var(--color-accent-yellow)] text-[10px] px-2 py-0.5 rounded">All</span>
          </h2>
        </div>
        <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => handleCategoryClick(cat)}
              className="flex-none px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-surface)] hover:text-[var(--color-accent-cyan)] transition-all"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Preferences Based Events */}
      {preferenceEvents.length > 0 && (
        <section className="bg-[var(--color-surface)] border border-white/5 rounded-3xl p-8 mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent-purple)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--color-accent-mint)]" />
                Para Ti
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Basado en tus preferencias</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {preferenceEvents.map(event => <EventCard key={event.event_id} event={event} />)}
          </div>
        </section>
      )}

      {/* Destacados */}
      {trendingEvents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
              Eventos Tendencia
              <span className="bg-[var(--color-accent-pink)]/20 text-[var(--color-accent-pink)] text-[10px] px-2 py-0.5 rounded">Hot</span>
            </h2>
            <button onClick={() => navigate('/search')} className="text-xs text-[var(--color-accent-cyan)] font-semibold hover:underline">Ver todos</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingEvents.map(event => <EventCard key={event.event_id} event={event} />)}
          </div>
        </section>
      )}

      {/* Próximos Eventos */}
      {upcomingEvents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
              Próximos Eventos
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map(event => <EventCard key={event.event_id} event={event} />)}
          </div>
        </section>
      )}

      {/* Últimos Cupos */}
      {lastTicketsEvents.length > 0 && (
        <section id="ultimos-cupos">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
              Últimos Cupos
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-pink)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent-pink)]"></span>
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lastTicketsEvents.map(event => <EventCard key={event.event_id} event={event} />)}
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="bg-[var(--color-surface)] border border-white/5 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/5 mt-12">
        <div className="p-4">
          <div className="text-[var(--color-accent-mint)] font-bold text-lg mb-1 uppercase tracking-tight">Tickets Digitales</div>
          <div className="text-xs text-gray-400">Verificados en la Blockchain de Minders.</div>
        </div>
        <div className="p-4">
          <div className="text-[var(--color-accent-cyan)] font-bold text-lg mb-1 uppercase tracking-tight">Compra Segura</div>
          <div className="text-xs text-gray-400">Protegido con encriptación bancaria.</div>
        </div>
        <div className="p-4">
          <div className="text-[var(--color-accent-purple)] font-bold text-lg mb-1 uppercase tracking-tight">Reventa Segura</div>
          <div className="text-xs text-gray-400">Compra boletas revendidas con garantía de acceso.</div>
        </div>
        <div className="p-4">
          <div className="text-[var(--color-accent-yellow)] font-bold text-lg mb-1 uppercase tracking-tight">Soporte 24/7</div>
          <div className="text-xs text-gray-400">Antes, durante y después de tu evento.</div>
        </div>
      </section>

    </div>
  );
}
