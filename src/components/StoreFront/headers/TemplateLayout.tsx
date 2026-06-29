import type { ReactNode, CSSProperties } from "react";
import {
  isTemplateId,
  type TemplateTheme,
  type TemplateId,
} from "@/components/StoreFront/AppTemplate/templateThemes";

/**
 * Each template owns a fully independent outer layout shell:
 * page background, max-width, gutters, vertical rhythm, body font hooks,
 * and the wrapper that hosts its own header + main content.
 *
 * The shell wraps both the header and the main body so each template
 * controls its own navbar context (sticky behaviour, decorations, dividers).
 */

interface ShellProps {
  primaryColor: string;
  theme: TemplateTheme;
  header: ReactNode;
  children: ReactNode;
}

/* ─── Classic — editorial newspaper ─── */
const ClassicShell = ({ header, children }: ShellProps) => (
  <div
    className="storefront-shell storefront-shell--classic relative flex min-h-screen flex-col bg-background text-foreground"
    style={{ fontFamily: "Georgia, 'Times New Roman', serif" } as CSSProperties}
  >
    {header}
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </main>
  </div>
);

/* ─── App / Diario — utility grid ─── */
const AppShell = ({ header, children }: ShellProps) => (
  <div className="storefront-shell storefront-shell--app flex min-h-screen flex-col bg-background">
    {header}
    <main className="flex-1">
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </main>
  </div>
);

/* ─── Elegante / Fresh — soft grocery app ─── */
const EleganteShell = ({ header, primaryColor, children }: ShellProps) => (
  <div
    className="storefront-shell storefront-shell--elegante flex min-h-screen flex-col"
    style={{
      background: `radial-gradient(1200px 600px at 50% -200px, ${primaryColor}14, transparent 60%), hsl(var(--background))`,
    }}
  >
    {header}
    <main className="flex-1 pt-2">
      <div className="mx-auto w-full max-w-5xl px-1 sm:px-2">{children}</div>
    </main>
  </div>
);

/* ─── Moderna / Studio — bold editorial ─── */
const ModernaShell = ({ header, children }: ShellProps) => (
  <div className="storefront-shell storefront-shell--moderna flex min-h-screen flex-col bg-background">
    {header}
    <main className="flex-1 border-t border-foreground/10">
      <div className="mx-auto w-full max-w-[1400px]">{children}</div>
    </main>
  </div>
);

/* ─── Market / Mercado — fresh grocery storefront ─── */
const MarketShell = ({ header, primaryColor, children }: ShellProps) => (
  <div
    className="storefront-shell storefront-shell--market flex min-h-screen flex-col"
    style={{ background: `linear-gradient(180deg, ${primaryColor}08 0px, hsl(var(--background)) 320px)` }}
  >
    {header}
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </main>
  </div>
);

/* ─── Custom / fallback — neutral baseline ─── */
const NeutralShell = ({ header, children }: ShellProps) => (
  <div className="storefront-shell storefront-shell--custom flex min-h-screen flex-col bg-background">
    {header}
    <main className="flex-1">{children}</main>
  </div>
);

const SHELL_REGISTRY: Record<TemplateId, (props: ShellProps) => JSX.Element> = {
  classic: ClassicShell,
  app: AppShell,
  elegante: EleganteShell,
  moderna: ModernaShell,
  market: MarketShell,
};

const TemplateLayout = (props: ShellProps) => {
  const rawId = props.theme?.id;
  if (!isTemplateId(rawId)) {
    if (import.meta.env.DEV && rawId !== "custom" && rawId !== "blank") {
      console.warn(
        `[TemplateLayout] Unknown theme.id="${String(rawId)}" — falling back to NeutralShell.`,
      );
    }
    return <NeutralShell {...props} />;
  }
  const Shell = SHELL_REGISTRY[rawId];
  return <Shell {...props} />;
};

export default TemplateLayout;
