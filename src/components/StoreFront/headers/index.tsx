import type { TemplateHeaderProps } from "./types";
import ClassicHeader from "./ClassicHeader";
import AppHeader from "./AppHeader";
import EleganteHeader from "./EleganteHeader";
import ModernaHeader from "./ModernaHeader";
import MarketHeader from "./MarketHeader";

/**
 * Dispatcher — picks the header that belongs to each template.
 * Every template owns its own complete, independent header structure.
 */
const TemplateHeader = (props: TemplateHeaderProps) => {
  switch (props.theme.id) {
    case "classic":  return <ClassicHeader {...props} />;
    case "app":      return <AppHeader {...props} />;
    case "elegante": return <EleganteHeader {...props} />;
    case "moderna":  return <ModernaHeader {...props} />;
    case "market":   return <MarketHeader {...props} />;
    // "custom" + "blank" + anything unknown → neutral app-style baseline
    default:         return <AppHeader {...props} />;
  }
};

export default TemplateHeader;
export type { TemplateHeaderProps };
