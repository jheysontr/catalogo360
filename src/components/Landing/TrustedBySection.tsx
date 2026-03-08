const TrustedBySection = () => (
  <section className="border-y bg-card py-8">
    <div className="container">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
        Usado por emprendedores en toda Latinoamérica
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {["🇧🇴 Bolivia", "🇲🇽 México", "🇦🇷 Argentina", "🇨🇱 Chile", "🇵🇪 Perú", "🇨🇴 Colombia", "🇺🇾 Uruguay"].map((country) => (
          <span key={country} className="text-sm font-medium text-muted-foreground/60">{country}</span>
        ))}
      </div>
    </div>
  </section>
);

export default TrustedBySection;
