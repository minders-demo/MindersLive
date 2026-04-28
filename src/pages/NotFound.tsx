import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95">
      <div className="w-full max-w-lg mb-8 rounded-3xl overflow-hidden shadow-2xl relative">
        <img 
          src="https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          alt="404 No Encontrado" 
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)] to-transparent"></div>
      </div>
      <h1 className="text-6xl font-extrabold mb-4 uppercase tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)]">
        404
      </h1>
      <h2 className="text-2xl font-bold mb-4 uppercase tracking-tight text-white">
        La página no existe
      </h2>
      <p className="text-gray-400 max-w-md mb-8">
        Parece que te has perdido. La página que buscas ya no está disponible o la dirección es incorrecta.
      </p>
      <Link 
        to="/"
        className="px-8 py-4 bg-[var(--color-accent-purple)] text-white rounded-full text-xs uppercase font-bold tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(124,58,237,0.3)]"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
