import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { EventDetail } from './pages/EventDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { MyTickets } from './pages/MyTickets';
import { Organizer } from './pages/Organizer';
import { Auth } from './pages/Auth';
import { Preferences } from './pages/Preferences';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <BrowserRouter basename="/MindersLive">  {/* ← AÑADIDO basename */}
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="search" element={<Search />} />
              <Route path="event/:id" element={<EventDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="tickets" element={<MyTickets />} />
              <Route path="organizer" element={<Organizer />} />
              <Route path="preferences" element={<Preferences />} />
              <Route path="login" element={<Auth type="login" />} />
              <Route path="register" element={<Auth type="register" />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  );
}
