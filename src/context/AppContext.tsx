import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createAppUserId,
  identifyUser,
  resetUser,
  trackEvent,
} from "../lib/amplitude";

export type UserRole = "anonymous" | "registered" | "organizer";

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
  status: "active" | "transferred" | "resale";
  qr_code?: string;
  owner_id?: string;
}

export interface ExperimentVariants {
  hero_cta: "A" | "B";
  seat_map_layout: "A" | "B";
  checkout_layout: "A" | "B";
  scarcity_banner: "on" | "off";
}

interface AppState {
  user: User;
  cart: CartItem[];
  tickets: Ticket[];
  experiments: ExperimentVariants;
}

interface AppContextType extends AppState {
  login: (
    role: UserRole,
    userDetails?: Partial<User> & { signed_up?: boolean }
  ) => void;
  logout: () => void;
  updatePreferences: (prefs: User["preferences"]) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (event_id: string, location_id: string) => void;
  updateCartItemQuantity: (
    event_id: string,
    location_id: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  addTickets: (newTickets: Ticket[]) => void;
  transferTicket: (ticket_id: string, recipient: string) => void;
  setExperimentVariant: <K extends keyof ExperimentVariants>(
    key: K,
    variant: ExperimentVariants[K]
  ) => void;
}

type CartStore = Record<string, CartItem[]>;
type TicketStore = Record<string, Ticket[]>;

const USER_STORAGE_KEY = "minders_user";
const CARTS_STORAGE_KEY = "minders_carts_by_user_v2";
const TICKETS_STORAGE_KEY = "minders_tickets_by_user_v2";
const EXPERIMENTS_STORAGE_KEY = "minders_experiments";

const GUEST_OWNER_ID = "guest";

const defaultExperiments: ExperimentVariants = {
  hero_cta: "A",
  seat_map_layout: "A",
  checkout_layout: "A",
  scarcity_banner: "on",
};

const defaultUser: User = {
  id: "anon",
  role: "anonymous",
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch (error) {
    console.warn(`[Minders Live] No se pudo leer ${key}.`, error);
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[Minders Live] No se pudo guardar ${key}.`, error);
  }
}

function getOwnerId(user: User): string {
  return user.role === "anonymous" ? GUEST_OWNER_ID : user.id;
}

function mergeCartItems(
  currentItems: CartItem[],
  incomingItems: CartItem[]
): CartItem[] {
  const merged = currentItems.map((item) => ({ ...item }));

  incomingItems.forEach((incomingItem) => {
    const existingIndex = merged.findIndex(
      (item) =>
        item.event_id === incomingItem.event_id &&
        item.location_id === incomingItem.location_id
    );

    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        quantity:
          merged[existingIndex].quantity + incomingItem.quantity,
      };
    } else {
      merged.push({ ...incomingItem });
    }
  });

  return merged;
}

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User>(() =>
    readStorage<User>(USER_STORAGE_KEY, defaultUser)
  );

  const [cartsByOwner, setCartsByOwner] = useState<CartStore>(() =>
    readStorage<CartStore>(CARTS_STORAGE_KEY, {})
  );

  const [ticketsByOwner, setTicketsByOwner] =
    useState<TicketStore>(() =>
      readStorage<TicketStore>(TICKETS_STORAGE_KEY, {})
    );

  const [experiments, setExperiments] =
    useState<ExperimentVariants>(() =>
      readStorage<ExperimentVariants>(
        EXPERIMENTS_STORAGE_KEY,
        defaultExperiments
      )
    );

  const abandonedCartTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const ownerId = getOwnerId(user);

  /*
   * El carrito y las entradas se obtienen únicamente
   * del usuario activo.
   */
  const cart = cartsByOwner[ownerId] ?? [];

  const tickets =
    user.role === "anonymous"
      ? []
      : (ticketsByOwner[ownerId] ?? []).filter(
          (ticket) =>
            !ticket.owner_id || ticket.owner_id === ownerId
        );

  /*
   * Simulación de abandono de carrito.
   */
  useEffect(() => {
    if (cart.length > 0) {
      if (!abandonedCartTimer.current) {
        abandonedCartTimer.current = setTimeout(() => {
          trackEvent("Cart Abandoned", {
            items_count: cart.length,
            cart_value: cart.reduce(
              (total, item) =>
                total + item.price * item.quantity,
              0
            ),
          });
        }, 120000);
      }
    } else if (abandonedCartTimer.current) {
      clearTimeout(abandonedCartTimer.current);
      abandonedCartTimer.current = null;
    }

    return () => {
      if (abandonedCartTimer.current) {
        clearTimeout(abandonedCartTimer.current);
        abandonedCartTimer.current = null;
      }
    };
  }, [ownerId, cart]);

  useEffect(() => {
    writeStorage(USER_STORAGE_KEY, user);
  }, [user]);

  useEffect(() => {
    writeStorage(CARTS_STORAGE_KEY, cartsByOwner);
  }, [cartsByOwner]);

  useEffect(() => {
    writeStorage(TICKETS_STORAGE_KEY, ticketsByOwner);
  }, [ticketsByOwner]);

  useEffect(() => {
    writeStorage(EXPERIMENTS_STORAGE_KEY, experiments);
  }, [experiments]);

  const login = (
    role: UserRole,
    userDetails?: Partial<User> & {
      signed_up?: boolean;
    }
  ) => {
    const { signed_up, ...details } = userDetails || {};

    /*
     * createAppUserId genera un ID estable a partir del correo.
     * La misma cuenta recuperará siempre sus propias compras.
     */
    const appUserId =
      details.id && details.id !== "anon"
        ? details.id
        : createAppUserId(details.email);

    const newUser: User = {
      ...defaultUser,
      ...details,
      id: appUserId,
      role,
    };

    identifyUser({
      user_id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      signed_up: Boolean(signed_up),
      source: "minders_live_demo",
    });

    /*
     * Si el visitante agregó entradas antes de iniciar sesión,
     * trasladamos ese carrito a la cuenta autenticada.
     */
    if (user.role === "anonymous") {
      setCartsByOwner((previousStore) => {
        const guestCart =
          previousStore[GUEST_OWNER_ID] ?? [];

        if (guestCart.length === 0) {
          return previousStore;
        }

        return {
          ...previousStore,
          [newUser.id]: mergeCartItems(
            previousStore[newUser.id] ?? [],
            guestCart
          ),
          [GUEST_OWNER_ID]: [],
        };
      });
    }

    setUser(newUser);
  };

  const logout = () => {
    if (user.role !== "anonymous") {
      trackEvent("User Logged Out", {
        role: user.role,
      });
    }

    /*
     * No eliminamos las compras del usuario.
     * Únicamente se cambia a la sesión de invitado.
     */
    setUser(defaultUser);
    resetUser();
  };

  const updatePreferences = (
    prefs: User["preferences"]
  ) => {
    setUser((previousUser) => {
      const updatedUser = {
        ...previousUser,
        preferences: {
          ...previousUser.preferences,
          ...prefs,
        },
      };

      identifyUser(updatedUser.preferences || {});

      return updatedUser;
    });
  };

  const addToCart = (item: CartItem) => {
    setCartsByOwner((previousStore) => {
      const currentCart =
        previousStore[ownerId] ?? [];

      const existingItem = currentCart.find(
        (currentItem) =>
          currentItem.event_id === item.event_id &&
          currentItem.location_id === item.location_id
      );

      const updatedCart = existingItem
        ? currentCart.map((currentItem) =>
            currentItem.event_id === item.event_id &&
            currentItem.location_id === item.location_id
              ? {
                  ...currentItem,
                  quantity:
                    currentItem.quantity + item.quantity,
                }
              : currentItem
          )
        : [...currentCart, item];

      return {
        ...previousStore,
        [ownerId]: updatedCart,
      };
    });
  };

  const removeFromCart = (
    event_id: string,
    location_id: string
  ) => {
    setCartsByOwner((previousStore) => ({
      ...previousStore,
      [ownerId]: (
        previousStore[ownerId] ?? []
      ).filter(
        (item) =>
          !(
            item.event_id === event_id &&
            item.location_id === location_id
          )
      ),
    }));
  };

  const updateCartItemQuantity = (
    event_id: string,
    location_id: string,
    quantity: number
  ) => {
    setCartsByOwner((previousStore) => ({
      ...previousStore,
      [ownerId]: (
        previousStore[ownerId] ?? []
      ).map((item) =>
        item.event_id === event_id &&
        item.location_id === location_id
          ? {
              ...item,
              quantity,
            }
          : item
      ),
    }));
  };

  const clearCart = () => {
    setCartsByOwner((previousStore) => ({
      ...previousStore,
      [ownerId]: [],
    }));
  };

  const addTickets = (newTickets: Ticket[]) => {
    /*
     * Capa adicional de protección:
     * no se emiten entradas para un usuario anónimo.
     */
    if (user.role === "anonymous") {
      console.warn(
        "[Minders Live] Se bloqueó la emisión de entradas sin usuario."
      );
      return;
    }

    /*
     * Cada entrada queda marcada con el propietario
     * que estaba autenticado al realizar la compra.
     */
    const ownedTickets = newTickets.map((ticket) => ({
      ...ticket,
      owner_id: user.id,
    }));

    setTicketsByOwner((previousStore) => ({
      ...previousStore,
      [user.id]: [
        ...(previousStore[user.id] ?? []),
        ...ownedTickets,
      ],
    }));
  };

  const transferTicket = (
    ticket_id: string,
    _recipient: string
  ) => {
    if (user.role === "anonymous") {
      return;
    }

    setTicketsByOwner((previousStore) => ({
      ...previousStore,
      [user.id]: (
        previousStore[user.id] ?? []
      ).map((ticket) =>
        ticket.ticket_id === ticket_id &&
        (!ticket.owner_id ||
          ticket.owner_id === user.id)
          ? {
              ...ticket,
              status: "transferred",
            }
          : ticket
      ),
    }));
  };

  const setExperimentVariant = <
    K extends keyof ExperimentVariants
  >(
    key: K,
    variant: ExperimentVariants[K]
  ) => {
    setExperiments((previousExperiments) => ({
      ...previousExperiments,
      [key]: variant,
    }));
  };

  const value: AppContextType = {
    user,
    cart,
    tickets,
    experiments,
    login,
    logout,
    updatePreferences,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    addTickets,
    transferTicket,
    setExperimentVariant,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error(
      "useAppContext must be used within an AppProvider"
    );
  }

  return context;
}
