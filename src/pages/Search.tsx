import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { MOCK_EVENTS, EventCategory } from '../lib/mockData';
import { EventCard } from '../components/EventCard';
import { trackEvent } from '../lib/amplitude';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const cityParam = searchParams.get('city') || '';
  const categoryParam = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(q);
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '1000000');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'Relevancia');

  useEffect(() => {
    setSearchQuery(q);
    setSelectedCity(cityParam);
    setSelectedCategory(categoryParam);
  }, [q, cityParam, categoryParam]);

  const cities = Array.from(new Set(MOCK_EVENTS.map(e => e.city)));
  const categories = Array.from(new Set(MOCK_EVENTS.map(e => e.category)));

  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter(event => {
      const matchQ = event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     event.artist.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     event.venue.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCity = selectedCity ? event.city === selectedCity : true;
      const matchCat = selectedCategory ? event.category === selectedCategory : true;
      
      const minPriceLoc = Math.min(...event.locations.map(l => l.price));
      const matchPrice = minPriceLoc <= parseInt(maxPrice, 10);

      return matchQ && matchCity && matchCat && matchPrice;
    }).sort((a, b) => {
      if (sortBy === 'Fecha ↑') return new Date(a.date).getTime() - new Date(b.date).getTime();
      const minPriceA = Math.min(...a.locations.map(l => l.price));
      const minPriceB = Math.min(...b.locations.map(l => l.price));
      if (sortBy === 'Precio ↑') return minPriceA - minPriceB;
      if (sortBy === 'Precio ↓') return minPriceB - minPriceA;
      return 0;
    });
  }, [searchQuery, selectedCity, selectedCategory, maxPrice, sortBy]);

  const applyFilters = (newParams: Record<string, string>) => {
    const current = Object.fromEntries([...searchParams]);
    const updated = { ...current, ...newParams };
    
    Object.keys(updated).forEach(key => {
      if (!updated[key]) delete updated[key];
    });
    
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent("Search Performed", { query: searchQuery, results_count: filteredEvents.length });
    applyFilters({ q: searchQuery });
  };

  const clearFilters = () => {
    trackEvent("Filter Cleared", {});
    setSearchParams({});
    setSearchQuery('');
    setSelectedCity('');
    setSelectedCategory('');
    setMaxPrice('1000000');
    setSortBy('Relevancia');
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-6 uppercase tracking-tight">Explorar Eventos</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por artista, evento o venue..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-[var(--color-accent-cyan)] focus:bg-[var(--color-accent-cyan)]/5 transition-all shadow-inner"
            />
          </form>
          <button 
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-lg"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>

        {showFilters && (
          <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-white/10 mb-8 flex flex-col gap-6 animate-in slide-in-from-top-4 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-6 w-full">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Ciudad</label>
                <select 
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    applyFilters({ city: e.target.value });
                    trackEvent("Filter Applied", { filter_type: "city", filter_value: e.target.value, results_count: filteredEvents.length });
                  }}
                  className="w-full p-3 bg-[var(--color-primary)] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[var(--color-accent-cyan)] appearance-none transition-colors"
                >
                  <option value="">Todas las ciudades</option>
                  {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="flex justify-between text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                  <span>Precio Máximo</span>
                  <span className="text-[var(--color-accent-cyan)]">${parseInt(maxPrice).toLocaleString()}</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="1000000" 
                  step="50000"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    applyFilters({ maxPrice: e.target.value });
                  }}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-cyan)]"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Ordenar por</label>
                <select 
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    applyFilters({ sortBy: e.target.value });
                  }}
                  className="w-full p-3 bg-[var(--color-primary)] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[var(--color-accent-cyan)] appearance-none transition-colors"
                >
                  <option value="Relevancia">Relevancia</option>
                  <option value="Fecha ↑">Fecha ↑</option>
                  <option value="Precio ↑">Precio ↑</option>
                  <option value="Precio ↓">Precio ↓</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Pills Always Visible */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
              Categorías
              {selectedCategory && (
                <span className="bg-[var(--color-accent-yellow)]/20 text-[var(--color-accent-yellow)] text-[10px] px-2 py-0.5 rounded">Filtro Activo</span>
              )}
            </h2>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar">
            <button 
              onClick={() => {
                setSelectedCategory('');
                applyFilters({ category: '' });
              }}
              className={`flex-none px-6 py-2 border rounded-full text-xs font-bold uppercase tracking-wider transition-all ${!selectedCategory ? 'bg-[var(--color-accent-cyan)] text-black border-[var(--color-accent-cyan)]' : 'bg-white/5 border-white/10 hover:bg-[var(--color-surface)] hover:text-[var(--color-accent-cyan)]'}`}
            >
              Todas
            </button>
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => {
                  setSelectedCategory(cat);
                  applyFilters({ category: cat });
                  trackEvent("Filter Applied", { filter_type: "category", filter_value: cat, results_count: MOCK_EVENTS.filter(ev => ev.category === cat).length });
                }}
                className={`flex-none px-6 py-2 border rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === cat ? 'bg-[var(--color-accent-cyan)] text-black border-[var(--color-accent-cyan)]' : 'bg-white/5 border-white/10 hover:bg-[var(--color-surface)] hover:text-[var(--color-accent-cyan)]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">
          Se encontraron {filteredEvents.length} resultados
        </div>
        
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-surface)] rounded-3xl border border-white/5 shadow-xl">
            <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">No encontramos eventos</h3>
            <p className="text-sm font-medium text-gray-400">Intenta cambiar los filtros o tu búsqueda.</p>
            <button 
              onClick={clearFilters}
              className="mt-6 px-8 py-3 bg-[var(--color-accent-purple)] text-white rounded-xl text-xs uppercase font-bold tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map(event => <EventCard key={event.event_id} event={event} />)}
          </div>
        )}
      </div>
    </div>
  );
}
