import { motion } from "framer-motion";

interface AppHeroBannerProps {
  store: {
    banner_url: string | null;
    description: string | null;
    store_name: string;
  };
  primaryColor: string;
}

const AppHeroBanner = ({ store, primaryColor }: AppHeroBannerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container px-4 pt-4"
    >
      <div
        className="relative overflow-hidden rounded-2xl p-5 sm:p-6"
        style={{
          background: store.banner_url
            ? `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor}99)`
            : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
        }}
      >
        {store.banner_url && (
          <img
            src={store.banner_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-30"
            loading="lazy"
          />
        )}
        <div className="relative z-10 space-y-1.5">
          <p className="text-sm font-medium text-white/80">Bienvenido a</p>
          <h2 className="text-xl font-bold text-white sm:text-2xl">{store.store_name}</h2>
          {store.description && (
            <p className="text-sm text-white/80 line-clamp-2 max-w-sm">{store.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AppHeroBanner;
