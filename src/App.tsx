import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/lib/CartContext";
import { WishlistProvider } from "@/lib/WishlistContext";
import Footer from "@/components/Footer";
import PrivateRoute from "@/components/PrivateRoute";
import SplashScreen from "@/components/SplashScreen";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StoreFront from "./pages/StoreFront";
import LinkboxPage from "./pages/LinkboxPage";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AffiliatePage from "./pages/AffiliatePage";
import Install from "./pages/Install";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isStoreFront = location.pathname.startsWith("/store/");
  const isLinkbox = location.pathname.startsWith("/linkbox/");
  const isAdmin = location.pathname.startsWith("/admin");
  const isAffiliate = location.pathname.startsWith("/affiliate/");
  return (
    <div className="flex min-h-screen flex-col">
      {!isDashboard && !isStoreFront && !isLinkbox && !isAdmin && !isAffiliate && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/store/:slug" element={<StoreFront />} />
          <Route path="/linkbox/:slug" element={<LinkboxPage />} />
          <Route path="/affiliate/:code" element={<AffiliatePage />} />
          <Route path="/install" element={<Install />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isDashboard && !isStoreFront && !isLinkbox && !isAdmin && !isAffiliate && <Footer />}
    </div>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <CartProvider>
              <WishlistProvider>
                <SplashScreen show={showSplash} />
                <Toaster position="top-right" />
                <BrowserRouter>
                  <AppLayout />
                </BrowserRouter>
              </WishlistProvider>
            </CartProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
