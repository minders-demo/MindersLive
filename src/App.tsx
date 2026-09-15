import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import {
  AppProvider,
  useAppContext,
} from "./context/AppContext";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { EventDetail } from "./pages/EventDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { MyTickets } from "./pages/MyTickets";
import { Organizer } from "./pages/Organizer";
import { Auth } from "./pages/Auth";
import { Preferences } from "./pages/Preferences";
import { NotFound } from "./pages/NotFound";

function RequireAuthenticatedUser({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAppContext();
  const location = useLocation();

  React.useEffect(() => {
    if (user.role === "anonymous") {
      localStorage.setItem(
        "redirectAfterLogin",
        `${location.pathname}${location.search}`
      );
    }
  }, [
    location.pathname,
    location.search,
    user.role,
  ]);

  if (user.role === "anonymous") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <BrowserRouter basename="/MindersLive">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />

              <Route
                path="search"
                element={<Search />}
              />

              <Route
                path="event/:id"
                element={<EventDetail />}
              />

              <Route
                path="cart"
                element={<Cart />}
              />

              <Route
                path="checkout"
                element={
                  <RequireAuthenticatedUser>
                    <Checkout />
                  </RequireAuthenticatedUser>
                }
              />

              <Route
                path="tickets"
                element={<MyTickets />}
              />

              <Route
                path="organizer"
                element={<Organizer />}
              />

              <Route
                path="preferences"
                element={<Preferences />}
              />

              <Route
                path="login"
                element={<Auth type="login" />}
              />

              <Route
                path="register"
                element={<Auth type="register" />}
              />

              <Route
                path="*"
                element={<NotFound />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  );
}
