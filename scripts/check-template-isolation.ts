/**
 * Build-time guard: ensures each template-specific header file does not
 * import from another template's header/shell. Shared dependencies are
 * limited to: react, lucide-react, @/components/ui/*, and ./types.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const TEMPLATES = ["Classic", "App", "Elegante", "Moderna", "Market"];
const HEADERS_DIR = "src/components/StoreFront/headers";

const files = readdirSync(HEADERS_DIR).filter((f) => /Header\.tsx$/.test(f));
const errors: string[] = [];

for (const file of files) {
  const owner = TEMPLATES.find((t) => file.startsWith(t));
  if (!owner) continue;
  const src = readFileSync(join(HEADERS_DIR, file), "utf8");
  const importRegex = /from\s+["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = importRegex.exec(src))) {
    const spec = m[1];
    for (const other of TEMPLATES) {
      if (other === owner) continue;
      const needle = new RegExp(`(^|/)${other}(Header|Shell)`);
      if (needle.test(spec)) {
        errors.push(`${file} imports cross-template module: ${spec}`);
      }
    }
  }
}

// Verify TemplateLayout shells don't pull in any *Header component.
const layoutSrc = readFileSync(join(HEADERS_DIR, "TemplateLayout.tsx"), "utf8");
if (/from\s+["'][^"']*Header["']/.test(layoutSrc)) {
  errors.push("TemplateLayout.tsx must not import any *Header component");
}

if (errors.length) {
  console.error("\n❌ Template isolation check failed:\n" + errors.map((e) => "  - " + e).join("\n") + "\n");
  process.exit(1);
}

console.log(`✅ Template isolation OK — ${files.length} headers verified, no cross-template imports.`);
