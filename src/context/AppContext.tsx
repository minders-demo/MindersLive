import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { identifyUser, trackEvent } from "../lib/amplitude";

export type UserRole = 'anonymous' | 'registered' | 'organizer';

export interface User {
  id: string;
  role: UserRole;
  name?: string;
  email?: string;
  preferences?: {
    favorite_city?: string;
    favorite_categories?: string[];
    price_range?: string;
    marketing_opt_in?: boolean;
  };
}

export interface CartItem {
  event_id: string;
  location_id: string;
  quantity: number;
  price: number;
}

export interface Ticket {
  ticket_id: string;
  event_id: string;
  location_id: string;
  purchase_date: string;
  status: 'active' | 'transferred' | 'resale';
  qr_code?: string;
}

export interface ExperimentVariants {
  hero_cta: 'A' | 'B';
  seat_map_layout: 'A' | 'B';
  checkout_layout: 'A' | 'B';
  scarcity_banner: 'on' | 'off';
}

interface AppState {
  user: User;
  cart: CartItem[];
  tickets: Ticket[];
  experiments: ExperimentVariants;
}

interface AppContextType extends AppState {
  login: (role: UserRole, userDetails?: Partial<User>) => void;
  logout: () => void;
  updatePreferences: (prefs: User['preferences']) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (event_id: string, location_id: string) => void;
  updateCartItemQuantity: (event_id: string, location_id: string, quantity: number) => void;
  clearCart: () => void;
  addTickets: (newTickets: Ticket[]) => void;
  transferTicket: (ticket_id: string, recipient: string) => void;
  setExperimentVariant: <K extends keyof ExperimentVariants>(key: K, variant: ExperimentVariants[K]) => void;
}

const defaultExperiments: ExperimentVariants = {
  hero_cta: 'A',
  seat_map_layout: 'A',
  checkout_layout: 'A',
  scarcity_banner: 'on'
};

const defaultUser: User = { id: 'anon', role: 'anonymous' };

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('minders_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('minders_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('minders_tickets');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [experiments, setExperiments] = useState<ExperimentVariants>(() => {
    const saved = localStorage.getItem('minders_experiments');
    return saved ? JSON.parse(saved) : defaultExperiments;
  });

  const abandonedCartTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (cart.length > 0) {
      if (!abandonedCartTimer.current) {
        abandonedCartTimer.current = setTimeout(() => {
          trackEvent("Cart Abandoned", { 
             items_count: cart.length, 
             cart_value: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
          });
        }, 120000); // 2 minutes
      }
    } else {
      if (abandonedCartTimer.current) {
        clearTimeout(abandonedCartTimer.current);
        abandonedCartTimer.current = null;
      }
    }
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('minders_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('minders_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('minders_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('minders_experiments', JSON.stringify(experiments));
  }, [experiments]);

  const login = (role: UserRole, userDetails?: Partial<User>) => {
    const newUser = { ...defaultUser, role, ...userDetails, id: Math.random().toString(36).substr(2, 9) };
    setUser(newUser);
  };

  const logout = () => setUser(defaultUser);

  const updatePreferences = (prefs: User['preferences']) => {
    setUser(prev => {
      const updated = { ...prev, preferences: { ...prev.preferences, ...prefs } };
      identifyUser(updated.preferences || {});
      return updated;
    });
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.event_id === item.event_id && i.location_id === item.location_id);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (event_id: string, location_id: string) => {
    setCart(prev => prev.filter(i => !(i.event_id === event_id && i.location_id === location_id)));
  };

  const updateCartItemQuantity = (event_id: string, location_id: string, quantity: number) => {
    setCart(prev => prev.map(i => 
      (i.event_id === event_id && i.location_id === location_id) 
        ? { ...i, quantity } 
        : i
    ));
  };

  const clearCart = () => setCart([]);

  const addTickets = (newTickets: Ticket[]) => setTickets(prev => [...prev, ...newTickets]);

  const transferTicket = (ticket_id: string, recipient: string) => {
    setTickets(prev => prev.map(t => t.ticket_id === ticket_id ? { ...t, status: 'transferred' } : t));
  };

  const setExperimentVariant = <K extends keyof ExperimentVariants>(key: K, variant: ExperimentVariants[K]) => {
    setExperiments(prev => ({ ...prev, [key]: variant }));
  };

  const value = {
    user, cart, tickets, experiments,
    login, logout, updatePreferences,
    addToCart, removeFromCart, updateCartItemQuantity, clearCart,
    addTickets, transferTicket, setExperimentVariant
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
