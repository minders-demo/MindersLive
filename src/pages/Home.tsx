import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';
import {useAppContext} from '../context/AppContext';
import {MOCK_EVENTS} from '../lib/mockData';
import {EventCard} from '../components/EventCard';
import {
  fetchExperimentVariants,
  getHomeCardsExperimentVariant,
  trackEvent,
  type HomeCardsExperimentVariant,
} from '../lib/amplitude';

export function Home() {
  const {user} = useAppContext();
  const navigate = useNavigate();

  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [homeCardsVariant, setHomeCardsVariant] =
    useState<HomeCardsExperimentVariant>(
      () => getHomeCardsExperimentVariant(),
    );

  const evaluatedUserIdRef = useRef(user.id);
  const homeViewTrackedRef = useRef(false);

  const cities = Array.from(
    new Set(MOCK_EVENTS.map((event) => event.city)),
  );

  const categories = Array.from(
    new Set(MOCK_EVENTS.map((event) => event.category)),
  );

  useEffect(() => {
    if (evaluatedUserIdRef.current === user.id) return;

    evaluatedUserIdRef.current = user.id;

    let cancelled = false;

    fetchExperimentVariants().then(() => {
      if (!cancelled) {
        setHomeCardsVariant(
          getHomeCardsExperimentVariant(),
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user.id]);

  useEffect(() => {
    if (homeViewTrackedRef.current) return;

    homeViewTrackedRef.current = true;

    trackEvent('Home Page Viewed', {
      page_path: window.location.pathname,
      page_url: window.location.href,
      experiment_variant: homeCardsVariant,
    });
  }, [homeCardsVariant]);

  const handleCityChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const city = event.target.value;

    setSelectedCity(city);

    if (city) {
      trackEvent('City Selected', {
        city,
        source_screen: 'Home',
      });
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    const resultsCount = MOCK_EVENTS.filter((appEvent) =>
      appEvent.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    ).length;

    trackEvent('Search Performed', {
      query: searchQuery,
      results_count: resultsCount,
    });

    navigate(
      `/search?q=${searchQuery}${
        selectedCity ? `&city=${selectedCity}` : ''
      }`,
    );
  };

  const handleCategoryClick = (category: string) => {
    const resultsCount = MOCK_EVENTS.filter(
      (event) => event.category === category,
    ).length;

    trackEvent('Filter Applied', {
      filter_type: 'category',
      filter_value: category,
      results_count: resultsCount,
    });

    navigate(`/search?category=${category}`);
  };

  const filteredEvents = MOCK_EVENTS.filter(
    (event) =>
      selectedCity === '' ||
      event.city === selectedCity,
  );

  const trendingEvents = filteredEvents
    .filter(
      (event) =>
        event.tags.includes('tendencia') ||
        event.tags.includes('recomendado'),
    )
    .slice(0, 4);

  const upcomingEvents = filteredEvents
    .filter(
      (event) =>
        new Date(event.date) > new Date(),
    )
    .sort(
      (left, right) =>
        new Date(left.date).getTime() -
        new Date(right.date).getTime(),
    )
    .slice(0, 4);

  const lastTicketsEvents = filteredEvents
    .filter(
      (event) =>
        event.status === 'ultimos_cupos',
    )
    .slice(0, 4);

  const featured =
    trendingEvents[0] ||
    upcomingEvents[0] ||
    MOCK_EVENTS[0];

  const favoriteCity =
    user.preferences?.favorite_city;

  const favoriteCategories =
    user.preferences?.favorite_categories || [];

  const preferenceEvents =
    favoriteCity || favoriteCategories.length > 0
      ? MOCK_EVENTS.filter(
          (event) =>
            (favoriteCity &&
              event.city === favoriteCity) ||
            favoriteCategories.includes(event.category),
        ).slice(0, 4)
      : [];

  return (
    <div className="space-y-16 pb-16">
      <section className="group relative min-h-[420px] shrink-0 overflow-hidden rounded-3xl">
        {featured.imageUrl ? (
          <img
            src={featured.imageUrl}
            alt={featured.name}
            className="hero-image absolute inset-0 h-full w-full object-cover"
            loading="eager"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex min-h-[480px] w-full gap-0 opacity-30 blur-xl">
            <div className="h-full w-1/4 bg-[var(--color-accent-purple)]" />
            <div className="h-full w-1/4 bg-[var(--color-accent-pink)]" />
            <div className="h-full w-1/4 bg-[var(--color-accent-cyan)]" />
            <div className="h-full w-1/4 bg-[var(--color-accent-mint)]" />
          </div>
        )}

        <div className="hero-overlay absolute inset-0 z-10" />

        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded bg-[var(--color-accent-yellow)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
              Destacado
            </span>

            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent-cyan)]">
              {featured.category}
            </span>
          </div>

          <h1 className="mb-4 text-5xl font-extrabold uppercase italic leading-none tracking-tighter text-white md:text-7xl">
            {featured.name}
          </h1>

          <p className="mb-8 max-w-md text-sm text-gray-300 md:text-base">
            {featured.description.split('.')[0]}.
            <br />

            <span className="mt-2 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent-pink)]">
              {new Date(
                featured.date,
              ).toLocaleDateString()}{' '}
              • {featured.city}
            </span>
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                navigate(`/event/${featured.event_id}`)
              }
              className="rounded-full bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-pink)] px-8 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-transform hover:scale-105"
            >
              Comprar Boletas
            </button>

            <button
              type="button"
              onClick={() => navigate('/search')}
              className="rounded-full border border-white/20 bg-white/10 px-8 py-3 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              Explorar más eventos
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-4 -mt-6 rounded-2xl border border-white/10 bg-[var(--color-surface)] p-4 shadow-xl lg:mx-auto lg:max-w-4xl">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-4 md:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Busca artistas, eventos o venues..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              className="w-full rounded-full border border-white/10 bg-[var(--color-primary)] py-2 pl-12 pr-4 text-sm text-white transition-colors focus:border-[var(--color-accent-cyan)] focus:outline-none"
            />
          </div>

          <div className="relative md:w-64">
            <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <select
              value={selectedCity}
              onChange={handleCityChange}
              className="w-full appearance-none rounded-full border border-white/10 bg-[var(--color-primary)] py-2 pl-12 pr-4 text-sm text-white transition-colors focus:border-[var(--color-accent-cyan)] focus:outline-none"
            >
              <option value="">
                Todas las ciudades
              </option>

              {cities.map((city) => (
                <option
                  key={city}
                  value={city}
                >
                  {city}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-pink)] px-6 py-2 text-sm font-bold text-white transition-transform hover:scale-105 md:w-auto"
          >
            Buscar
          </button>
        </form>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight text-white">
            Categorías

            <span className="rounded bg-[var(--color-accent-yellow)]/20 px-2 py-0.5 text-[10px] text-[var(--color-accent-yellow)]">
              All
            </span>
          </h2>
        </div>

        <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-4">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() =>
                handleCategoryClick(category)
              }
              className="flex-none rounded-full border border-white/10 bg-white/5 px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:bg-[var(--color-surface)] hover:text-[var(--color-accent-cyan)]"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {preferenceEvents.length > 0 && (
        <section className="group relative mb-8 overflow-hidden rounded-3xl border border-white/5 bg-[var(--color-surface)] p-8">
          <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--color-accent-purple)]/10 blur-3xl" />

          <div className="relative z-10 mb-6 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold uppercase tracking-tight text-white">
                <Sparkles className="h-5 w-5 text-[var(--color-accent-mint)]" />
                Para Ti
              </h2>

              <p className="mt-1 text-xs font-medium uppercase tracking-widest text-gray-400">
                Basado en tus preferencias
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {preferenceEvents.map((event, index) => (
              <EventCard
                key={event.event_id}
                event={event}
                sectionName="Para Ti"
                cardPosition={index + 1}
              />
            ))}
          </div>
        </section>
      )}

      {trendingEvents.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight text-white">
              Eventos Tendencia

              <span className="rounded bg-[var(--color-accent-pink)]/20 px-2 py-0.5 text-[10px] text-[var(--color-accent-pink)]">
                Hot
              </span>
            </h2>

            <button
              type="button"
              onClick={() => navigate('/search')}
              className="text-xs font-semibold text-[var(--color-accent-cyan)] hover:underline"
            >
              Ver todos
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {trendingEvents.map((event, index) => (
              <EventCard
                key={event.event_id}
                event={event}
                experimentVariant={homeCardsVariant}
                sectionName="Eventos Tendencia"
                cardPosition={index + 1}
              />
            ))}
          </div>
        </section>
      )}

      {upcomingEvents.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight text-white">
              Próximos Eventos
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {upcomingEvents.map((event, index) => (
              <EventCard
                key={event.event_id}
                event={event}
                sectionName="Próximos Eventos"
                cardPosition={index + 1}
              />
            ))}
          </div>
        </section>
      )}

      {lastTicketsEvents.length > 0 && (
        <section id="ultimos-cupos">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight text-white">
              Últimos Cupos

              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent-pink)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent-pink)]" />
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {lastTicketsEvents.map((event, index) => (
              <EventCard
                key={event.event_id}
                event={event}
                experimentVariant={homeCardsVariant}
                sectionName="Últimos Cupos"
                cardPosition={index + 1}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 grid grid-cols-1 gap-8 divide-y divide-white/5 rounded-3xl border border-white/5 bg-[var(--color-surface)] p-8 text-center md:grid-cols-4 md:divide-x md:divide-y-0">
        <div className="p-4">
          <div className="mb-1 text-lg font-bold uppercase tracking-tight text-[var(--color-accent-mint)]">
            Tickets Digitales
          </div>

          <div className="text-xs text-gray-400">
            Verificados en la Blockchain de Minders.
          </div>
        </div>

        <div className="p-4">
          <div className="mb-1 text-lg font-bold uppercase tracking-tight text-[var(--color-accent-cyan)]">
            Compra Segura
          </div>

          <div className="text-xs text-gray-400">
            Protegido con encriptación bancaria.
          </div>
        </div>

        <div className="p-4">
          <div className="mb-1 text-lg font-bold uppercase tracking-tight text-[var(--color-accent-purple)]">
            Reventa Segura
          </div>

          <div className="text-xs text-gray-400">
            Compra boletas revendidas con garantía de acceso.
          </div>
        </div>

        <div className="p-4">
          <div className="mb-1 text-lg font-bold uppercase tracking-tight text-[var(--color-accent-yellow)]">
            Soporte 24/7
          </div>

          <div className="text-xs text-gray-400">
            Antes, durante y después de tu evento.
          </div>
        </div>
      </section>
    </div>
  );
}
