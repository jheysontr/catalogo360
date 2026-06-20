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
  <section className="border-y border-[#1b4332]/40 bg-black/20 py-12">
    <div className="mx-auto max-w-7xl px-6">
      <p className="mb-10 text-center font-display text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
        Preferido por emprendedores latinos
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-50 transition-opacity hover:opacity-100">
        {countries.map((c) => (
          <div key={c.code} className="flex flex-col items-center gap-2">
            <img
              src={`https://flagcdn.com/w40/${c.code}.png`}
              srcSet={`https://flagcdn.com/w80/${c.code}.png 2x`}
              width={32}
              height={20}
              alt={`Bandera de ${c.name}`}
              className="rounded-sm border border-white/10 shadow-sm"
              loading="lazy"
            />
            <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-400">
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustedBySection;
