import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/lib/CartContext";
import Footer from "@/components/Footer";
import PrivateRoute from "@/components/PrivateRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StoreFront from "./pages/StoreFront";
import LinkboxPage from "./pages/LinkboxPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isStoreFront = location.pathname.startsWith("/store/");
  const isLinkbox = location.pathname.startsWith("/linkbox/");

  return (
    <div className="flex min-h-screen flex-col">
      {!isDashboard && !isStoreFront && !isLinkbox && <Navbar />}
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isDashboard && !isStoreFront && !isLinkbox && <Footer />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
