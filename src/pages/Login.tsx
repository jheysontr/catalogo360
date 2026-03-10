import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/AuthContext";
import toast from "react-hot-toast";
import { Package, Eye, EyeOff } from "lucide-react";

const REMEMBER_KEY = "catalogo360_remembered_email";

const Login = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_KEY) || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem(REMEMBER_KEY));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.includes("Invalid login")) {
        toast.error("Email o contraseña incorrectos");
      } else {
        toast.error(error.message);
      }
    } else {
      // Persist or clear remembered email
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
      toast.success("¡Bienvenido de vuelta!");
      navigate("/dashboard");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Ingresa tu email primero");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Revisa tu email para restablecer tu contraseña");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Package className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Inicia sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">Accede a tu cuenta de Catalogo360</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">Recordar mis datos</Label>
            </div>
            <button type="button" onClick={handleForgotPassword} className="text-xs text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando..." : "INICIAR SESIÓN"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">o continúa con</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={async () => {
            const { error } = await lovable.auth.signInWithOAuth("google", {
              redirect_uri: window.location.origin,
            });
            if (error) toast.error("Error al iniciar con Google");
          }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
