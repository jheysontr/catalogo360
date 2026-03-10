const countries = [
  { code: "bo", name: "Bolivia" },
  { code: "mx", name: "México" },
  { code: "ar", name: "Argentina" },
  { code: "cl", name: "Chile" },
  { code: "pe", name: "Perú" },
  { code: "co", name: "Colombia" },
  { code: "uy", name: "Uruguay" },
  { code: "ec", name: "Ecuador" },
  { code: "py", name: "Paraguay" },
  { code: "ve", name: "Venezuela" },
];

const TrustedBySection = () => (
  <section className="border-y bg-card py-10">
    <div className="container">
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
        Usado por emprendedores en toda Latinoamérica
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
        {countries.map((c) => (
          <div key={c.code} className="flex flex-col items-center gap-1.5">
            <img
              src={`https://flagcdn.com/w40/${c.code}.png`}
              srcSet={`https://flagcdn.com/w80/${c.code}.png 2x`}
              width={40}
              height={30}
              alt={`Bandera de ${c.name}`}
              className="rounded-sm shadow-sm"
              loading="lazy"
            />
            <span className="text-xs font-medium text-muted-foreground/70">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustedBySection;
