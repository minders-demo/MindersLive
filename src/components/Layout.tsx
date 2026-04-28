import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Ticket, User as UserIcon, Menu } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../lib/utils';
import { trackEvent } from '../lib/amplitude';
import { DemoControls } from './DemoControls';

export function Layout() {
  const { cart, user, logout } = useAppContext();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSupportClick = () => {
    trackEvent("Support Topic Selected", { topic: "General Help" });
    alert("Support Chat: How can we help?");
  };

  return (
    <div className="min-h-screen flex flex-col text-white bg-[var(--color-primary)] font-sans">
      <header className="sticky top-0 z-50 flex flex-col shrink-0">
        <nav className="h-16 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-[var(--color-accent-purple)] to-[var(--color-accent-pink)] rounded-lg flex items-center justify-center font-bold text-white">M</div>
              <span className="text-white font-bold text-xl tracking-tight uppercase">Minders<span className="text-[var(--color-accent-cyan)]">Live</span></span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/search" className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white transition">
              <Search className="w-4 h-4" />
              <span>Explorar</span>
            </Link>
            
            {(user.role === 'registered' || user.role === 'organizer') && (
              <Link to="/tickets" className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white transition">
                <Ticket className="w-4 h-4" />
                <span>Mis Entradas</span>
              </Link>
            )}

            {user.role === 'organizer' && (
              <Link to="/organizer" className="text-sm font-bold text-[var(--color-accent-mint)] hover:text-white transition">
                Portal Organizador
              </Link>
            )}

            <button onClick={() => navigate('/cart')} className="relative p-2 text-gray-300 hover:text-white transition">
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[var(--color-accent-pink)] rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>

            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-300 hover:text-white pb-1">
                {user.role !== 'anonymous' ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] p-[2px]">
                    <div className="w-full h-full rounded-full bg-[var(--color-surface)] flex items-center justify-center text-xs font-bold text-white">
                      {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                    </div>
                  </div>
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
              </button>
              
              <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-50">
                <div className="w-48 bg-[var(--color-surface)] rounded-md shadow-lg border border-white/5 py-1">
                  {user.role === 'anonymous' ? (
                    <>
                      <Link to="/login" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5">Iniciar Sesión</Link>
                      <Link to="/register" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5">Registrarse</Link>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">{user.name || 'Usuario'}</div>
                      <Link to="/preferences" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5">Preferencias</Link>
                      <button onClick={() => { logout(); navigate('/'); }} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5">Cerrar Sesión</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </nav>

        {/* Sub-navigation (Design Match) */}
        <div className="h-12 bg-[var(--color-surface)] border-b border-white/5 hidden md:flex items-center justify-center gap-8 shrink-0">
          <Link to="/" className="text-xs uppercase tracking-widest text-white hover:text-[var(--color-accent-cyan)] transition-colors h-full flex items-center px-2 font-bold">Inicio</Link>
          <Link to="/search?category=Conciertos" className="text-xs uppercase tracking-widest text-gray-300 hover:text-white transition-colors h-full flex items-center px-2 font-bold">Conciertos</Link>
          <Link to="/search?category=Festivales" className="text-xs uppercase tracking-widest text-gray-300 hover:text-white transition-colors h-full flex items-center px-2 font-bold">Festivales</Link>
          <Link to="/search?category=Teatro" className="text-xs uppercase tracking-widest text-gray-300 hover:text-white transition-colors h-full flex items-center px-2 font-bold">Teatro</Link>
          <Link to="/search?category=Deportes" className="text-xs uppercase tracking-widest text-gray-300 hover:text-white transition-colors h-full flex items-center px-2 font-bold">Deportes</Link>
        </div>
        
        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-[var(--color-surface)] border-t border-white/5 px-4 py-4 space-y-4">
            <Link to="/search" className="block text-gray-300 font-bold" onClick={() => setIsMenuOpen(false)}>Explorar</Link>
            <Link to="/search?category=Conciertos" className="block text-gray-300 text-sm uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>Conciertos</Link>
            <Link to="/search?category=Festivales" className="block text-gray-300 text-sm uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>Festivales</Link>
            <Link to="/cart" className="block text-gray-300 flex justify-between font-bold" onClick={() => setIsMenuOpen(false)}>
              Carrito {cartItemsCount > 0 && <span className="text-[var(--color-accent-pink)]">{cartItemsCount}</span>}
            </Link>
            <Link to="/tickets" className="block text-gray-300 font-bold" onClick={() => setIsMenuOpen(false)}>Mis Entradas</Link>
            {user.role === 'anonymous' ? (
              <Link to="/login" className="block text-[var(--color-accent-cyan)] font-bold" onClick={() => setIsMenuOpen(false)}>Iniciar Sesión</Link>
            ) : (
              <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block text-[var(--color-accent-pink)] font-bold w-full text-left">Cerrar Sesión</button>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 relative">
        <Outlet />
      </main>

      <footer className="bg-[var(--color-surface)] border-t border-white/10 pt-12 pb-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 mb-12">
          <div className="flex-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-tr from-[var(--color-accent-purple)] to-[var(--color-accent-pink)] rounded-lg flex items-center justify-center font-bold text-white">M</div>
              <span className="text-white font-bold text-xl tracking-tight uppercase">Minders<span className="text-[var(--color-accent-cyan)]">Live</span></span>
            </Link>
            <p className="text-gray-400 text-sm max-w-sm mb-6">La plataforma más segura y rápida para descubrir y asistir a tus eventos favoritos en toda Latinoamérica.</p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/minders.latam/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition border border-white/10"><svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
              <a href="https://linkedin.com/company/mindersio/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition border border-white/10"><svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
              <a href="https://www.youtube.com/@minders.latam" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition border border-white/10"><svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 text-sm">
            <div>
              <h4 className="font-bold text-white uppercase tracking-widest mb-4">Buenos Aires</h4>
              <p className="text-gray-400">Argentina.</p>
              <p className="text-gray-400">Av. Sta. Fe 2755 Piso 12,</p>
              <p className="text-gray-400">C1425.</p>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-widest mb-4">Bogotá</h4>
              <p className="text-gray-400">Colombia.</p>
              <p className="text-gray-400">Av. Cra 19 #100-45, Usaquén,</p>
              <p className="text-gray-400">110121.</p>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-widest mb-4">São Paulo</h4>
              <p className="text-gray-400">Brasil.</p>
              <p className="text-gray-400">Alameda Rio Claro, 241, Bela Vista,</p>
              <p className="text-gray-400">01332-010.</p>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-widest mb-4">Ciudad de México</h4>
              <p className="text-gray-400">México.</p>
              <p className="text-gray-400">Av. de los Insurgentes Sur 601, Nápoles, Benito Juárez,</p>
              <p className="text-gray-400">03810.</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-6 border-t border-white/5 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          <div className="flex gap-4 items-center mb-4 md:mb-0">
            <span>&copy; 2026 Minders Live Demo</span>
            <span className="hidden md:flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> System Operational</span>
          </div>
          <div className="flex gap-6 items-center">
            <Link to="#" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <span className="text-[var(--color-accent-cyan)]">v1.2.0-stable</span>
          </div>
        </div>
      </footer>

      {/* Floating Chat Demo */}
      <button 
        onClick={handleSupportClick}
        className="fixed bottom-12 right-6 md:bottom-12 bg-gradient-to-tr from-[var(--color-accent-purple)] to-[var(--color-accent-pink)] hover:bg-purple-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105 z-50 border border-white/20"
        aria-label="Soporte"
      >
        <span className="font-bold text-[10px] uppercase tracking-widest">Ayuda</span>
      </button>

      <DemoControls />
    </div>
  );
}
