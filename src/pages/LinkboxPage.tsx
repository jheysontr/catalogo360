import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Store as StoreIcon, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  sort_order: number;
}

const LinkboxPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreData | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: storeData } = await supabase
        .from("stores")
        .select("id, store_name, store_slug, description, logo_url, primary_color, secondary_color")
        .eq("store_slug", slug)
        .limit(1);

      if (!storeData?.length) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const s = storeData[0] as StoreData;
      setStore(s);

      const { data: linksData } = await supabase
        .from("links")
        .select("id, title, url, icon, sort_order")
        .eq("store_id", s.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      setLinks((linksData as LinkItem[]) ?? []);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <StoreIcon className="h-16 w-16 text-muted-foreground/30" />
        <h1 className="text-2xl font-bold text-foreground">Linkbox no encontrado</h1>
        <p className="text-muted-foreground">La página que buscas no existe.</p>
      </div>
    );
  }

  const primaryColor = store.primary_color || "#2a9d8f";
  const secondaryColor = store.secondary_color || "#264653";

  return (
    <div
      className="flex min-h-screen flex-col items-center px-4 py-12"
      style={{
        background: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor}22 50%, ${secondaryColor} 100%)`,
      }}
    >
      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div
          className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 shadow-xl"
          style={{ borderColor: primaryColor, backgroundColor: primaryColor }}
        >
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.store_name} className="h-full w-full object-cover" />
          ) : (
            <StoreIcon className="h-10 w-10 text-white" />
          )}
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">{store.store_name}</h1>
          {store.description && (
            <p className="mt-1 max-w-sm text-sm text-white/80">{store.description}</p>
          )}
        </div>
      </motion.div>

      {/* Links */}
      <div className="mt-8 w-full max-w-md space-y-3">
        {links.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white/60"
          >
            No hay enlaces disponibles
          </motion.p>
        ) : (
          links.map((link, i) => (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md transition-colors hover:bg-white/20"
              style={{ boxShadow: `0 4px 20px ${primaryColor}33` }}
            >
              <span className="text-2xl">{link.icon || "🔗"}</span>
              <span className="flex-1 text-base font-semibold text-white">{link.title}</span>
              <ExternalLink className="h-4 w-4 text-white/50" />
            </motion.a>
          ))
        )}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 flex flex-col items-center gap-2"
      >
        <a
          href={`/store/${store.store_slug}`}
          className="rounded-full px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          style={{ border: `1px solid ${primaryColor}` }}
        >
          🛒 Visitar tienda
        </a>
        <p className="mt-4 text-xs text-white/40">
          Powered by <span className="font-semibold">Catalogo360</span>
        </p>
      </motion.div>
    </div>
  );
};

export default LinkboxPage;
