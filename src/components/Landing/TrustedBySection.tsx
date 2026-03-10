const countries = [
  { flag: "🇧🇴", name: "Bolivia" },
  { flag: "🇲🇽", name: "México" },
  { flag: "🇦🇷", name: "Argentina" },
  { flag: "🇨🇱", name: "Chile" },
  { flag: "🇵🇪", name: "Perú" },
  { flag: "🇨🇴", name: "Colombia" },
  { flag: "🇺🇾", name: "Uruguay" },
  { flag: "🇪🇨", name: "Ecuador" },
  { flag: "🇵🇾", name: "Paraguay" },
  { flag: "🇻🇪", name: "Venezuela" },
];

const TrustedBySection = () => (
  <section className="border-y bg-card py-10">
    <div className="container">
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
        Usado por emprendedores en toda Latinoamérica
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
        {countries.map((c) => (
          <div key={c.name} className="flex flex-col items-center gap-1.5">
            <span className="text-3xl">{c.flag}</span>
            <span className="text-xs font-medium text-muted-foreground/70">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustedBySection;
