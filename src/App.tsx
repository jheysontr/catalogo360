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
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HelpCenter from "./pages/HelpCenter";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const knownRoutes = ["/dashboard", "/login", "/register", "/admin", "/linkbox/", "/affiliate/", "/terminos", "/privacidad", "/ayuda"];
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isLinkbox = location.pathname.startsWith("/linkbox/");
  const isAdmin = location.pathname.startsWith("/admin");
  const isAffiliate = location.pathname.startsWith("/affiliate/");
  const isKnownRoute = location.pathname === "/" || knownRoutes.some(r => location.pathname.startsWith(r));
  const isStoreFront = !isKnownRoute;
  const isLanding = location.pathname === "/";
  const hideNavbar = isDashboard || isStoreFront || isLinkbox || isAdmin || isAffiliate;
  const hideFooter = hideNavbar || isLanding;
  return (
    <div className="flex min-h-screen flex-col">
      {!hideNavbar && <Navbar />}
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
          <Route path="/linkbox/:slug" element={<LinkboxPage />} />
          <Route path="/affiliate/:code" element={<AffiliatePage />} />
          
          <Route path="/terminos" element={<TermsOfService />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          <Route path="/ayuda" element={<HelpCenter />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          />
          <Route path="/:slug" element={<StoreFront />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideChrome && <Footer />}
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
