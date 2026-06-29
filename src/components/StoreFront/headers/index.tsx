import type { TemplateHeaderProps } from "./types";
import { isTemplateId, type TemplateId } from "@/components/StoreFront/AppTemplate/templateThemes";
import ClassicHeader from "./ClassicHeader";
import AppHeader from "./AppHeader";
import EleganteHeader from "./EleganteHeader";
import ModernaHeader from "./ModernaHeader";
import MarketHeader from "./MarketHeader";

/**
 * Dispatcher — picks the header that belongs to each template.
 * Every template owns its own complete, independent header structure.
 *
 * theme.id is validated at runtime against the canonical TemplateId union.
 * Unknown / meta ("custom", "blank") values fall back to the neutral
 * AppHeader baseline so we never accidentally mix headers across templates.
 */
const HEADER_REGISTRY: Record<TemplateId, (props: TemplateHeaderProps) => JSX.Element> = {
  classic: ClassicHeader,
  app: AppHeader,
  elegante: EleganteHeader,
  moderna: ModernaHeader,
  market: MarketHeader,
};

const TemplateHeader = (props: TemplateHeaderProps) => {
  const rawId = props.theme?.id;
  if (!isTemplateId(rawId)) {
    if (import.meta.env.DEV && rawId !== "custom" && rawId !== "blank") {
      console.warn(
        `[TemplateHeader] Unknown theme.id="${String(rawId)}" — falling back to neutral AppHeader. ` +
          `Allowed ids: classic | app | elegante | moderna | market.`,
      );
    }
    return <AppHeader {...props} />;
  }
  const Header = HEADER_REGISTRY[rawId];
  return <Header {...props} />;
};

export default TemplateHeader;
export type { TemplateHeaderProps };
