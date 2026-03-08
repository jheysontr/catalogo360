import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import toast from "react-hot-toast";
import { Package, Check, X } from "lucide-react";

const passwordRules = [
  { label: "Mínimo 8 caracteres", test: (v: string) => v.length >= 8 },
  { label: "Una letra mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Un número", test: (v: string) => /\d/.test(v) },
  { label: "Un carácter especial (!@#$...)", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

async function checkLeakedPassword(password: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!res.ok) return false;
    const text = await res.text();
    return text.split("\n").some((line) => line.startsWith(suffix));
  } catch {
    return false;
  }
}

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const mark = (field: string) => () => setTouched((p) => ({ ...p, [field]: true }));

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (touched.fullName && fullName.length < 3) e.fullName = "Mínimo 3 caracteres";
    if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email inválido";
    if (touched.businessName && businessName.length < 3) e.businessName = "Mínimo 3 caracteres";
    if (touched.confirmPassword && password !== confirmPassword) e.confirmPassword = "Las contraseñas no coinciden";
    return e;
  }, [fullName, email, businessName, password, confirmPassword, touched]);

  const allPasswordValid = passwordRules.every((r) => r.test(password));
  const canSubmit = fullName.length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && businessName.length >= 3 && allPasswordValid && password === confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);

    // Check against HaveIBeenPwned
    const leaked = await checkLeakedPassword(password);
    if (leaked) {
      toast.error("Esta contraseña ha sido filtrada en una brecha de datos. Por favor elige otra.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, business_name: businessName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("¡Cuenta creada! Revisa tu email para confirmar.");
      navigate("/login");
    }
  };

  const fieldClass = (field: string) =>
    errors[field] ? "border-destructive focus-visible:ring-destructive" : "";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Package className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Empieza a vender en minutos</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="fullName">Tu nombre</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} onBlur={mark("fullName")} placeholder="Tu nombre completo" className={fieldClass("fullName")} />
            {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={mark("email")} placeholder="tu@email.com" className={fieldClass("email")} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>

          {/* Business */}
          <div>
            <Label htmlFor="businessName">Nombre de tu negocio</Label>
            <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} onBlur={mark("businessName")} placeholder="Mi Tienda Online" className={fieldClass("businessName")} />
            {errors.businessName && <p className="mt-1 text-xs text-destructive">{errors.businessName}</p>}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={mark("password")} placeholder="••••••••" />
            {(touched.password || password.length > 0) && (
              <ul className="mt-2 space-y-1">
                {passwordRules.map((r) => {
                  const pass = r.test(password);
                  return (
                    <li key={r.label} className={`flex items-center gap-1.5 text-xs ${pass ? "text-green-600" : "text-muted-foreground"}`}>
                      {pass ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {r.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Confirm */}
          <div>
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onBlur={mark("confirmPassword")} placeholder="••••••••" className={fieldClass("confirmPassword")} />
            {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={!canSubmit || loading}>
            {loading ? "Creando cuenta..." : "COMENZAR PRUEBA GRATUITA"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
